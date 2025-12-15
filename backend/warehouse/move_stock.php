<?php
require_once __DIR__ . "/../cors.php";
require_once __DIR__ . "/../db.php";

header("Content-Type: application/json; charset=utf-8");

$mysql->select_db("warehouse_service");

$data = json_decode(file_get_contents("php://input"), true);

$product_id = isset($data["product_id"]) ? (int)$data["product_id"] : 0;
$from_cell  = isset($data["from_cell"])  ? (int)$data["from_cell"]  : 0;
$to_cell    = isset($data["to_cell"])    ? (int)$data["to_cell"]    : 0;
$quantity   = isset($data["quantity"])   ? (float)$data["quantity"] : 0;

$employee_external_id = $data["employee_external_id"] ?? null;
$employee_external_id = is_string($employee_external_id) ? trim($employee_external_id) : (string)$employee_external_id;

if ($product_id <= 0 || $from_cell <= 0 || $to_cell <= 0 || $quantity <= 0) {
    echo json_encode(["message" => "Некорректные данные"]);
    exit;
}

if ($from_cell === $to_cell) {
    echo json_encode(["message" => "Исходная и целевая ячейки совпадают"]);
    exit;
}

if ($employee_external_id === "" || $employee_external_id === "0") {
    echo json_encode(["message" => "Не удалось определить сотрудника (employeeId пустой)"]);
    exit;
}

/* 0) SKU товара */
$stmtSku = $mysql->prepare("SELECT sku FROM products WHERE product_id = ? LIMIT 1");
$stmtSku->bind_param("i", $product_id);
$stmtSku->execute();
$resSku = $stmtSku->get_result();
$rowSku = $resSku->fetch_assoc();

if (!$rowSku || empty($rowSku["sku"])) {
    echo json_encode(["message" => "SKU товара не найден"]);
    exit;
}

$product_sku = $rowSku["sku"];

$mysql->begin_transaction();

try {
    /* 1) Проверяем остаток */
    $stmt = $mysql->prepare("
        SELECT quantity
        FROM stock
        WHERE product_id = ? AND cell_id = ?
        LIMIT 1
    ");
    $stmt->bind_param("ii", $product_id, $from_cell);
    $stmt->execute();
    $res = $stmt->get_result();
    $row = $res->fetch_assoc();

    if (!$row || (float)$row["quantity"] < $quantity) {
        $mysql->rollback();
        echo json_encode(["message" => "Недостаточно товара в ячейке"]);
        exit;
    }

    /* 2) Уменьшаем остаток в исходной ячейке */
    $stmt = $mysql->prepare("
        UPDATE stock
        SET quantity = quantity - ?
        WHERE product_id = ? AND cell_id = ?
    ");
    $stmt->bind_param("dii", $quantity, $product_id, $from_cell);
    $stmt->execute();

    /* 3) Увеличиваем остаток в целевой ячейке */
    // ВАЖНО: у тебя в stock есть product_sku NOT NULL по твоей схеме.
    // Поэтому вставляем и его тоже.
    $stmt = $mysql->prepare("
        INSERT INTO stock (product_id, cell_id, product_sku, quantity)
        VALUES (?, ?, ?, ?)
        ON DUPLICATE KEY UPDATE quantity = quantity + VALUES(quantity)
    ");
    $stmt->bind_param("iisd", $product_id, $to_cell, $product_sku, $quantity);
    $stmt->execute();

    /* 4) Логируем операцию */
    $comment = "Перемещение товара";

    $stmt = $mysql->prepare("
        INSERT INTO warehouse_operations
            (operation_type, product_id, product_sku, quantity, cell_id, cell_role, employee_external_id, comment)
        VALUES
            ('movement', ?, ?, ?, ?, 'destination', ?, ?)
    ");
    // i s d i s s  => "isdis s" => "isdiss" (5? нет, 6) => тут 6 переменных, значит:
    // product_id(int), product_sku(string), quantity(double), to_cell(int), employee_external_id(string), comment(string)
    $stmt->bind_param("isdiss", $product_id, $product_sku, $quantity, $to_cell, $employee_external_id, $comment);
    $stmt->execute();

    $mysql->commit();
    echo json_encode(["message" => "ok"]);
} catch (Throwable $e) {
    $mysql->rollback();
    echo json_encode(["message" => "Ошибка: " . $e->getMessage()]);
}
