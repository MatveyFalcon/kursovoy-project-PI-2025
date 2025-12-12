<?php
require_once __DIR__ . "/../cors.php";
require_once __DIR__ . "/../db.php";

header("Content-Type: application/json; charset=utf-8");

$mysql->select_db("warehouse_service");

$data = json_decode(file_get_contents("php://input"), true);

$product_id = $data["product_id"] ?? null;
$from_cell  = $data["from_cell"] ?? null;
$to_cell    = $data["to_cell"] ?? null;
$quantity   = $data["quantity"] ?? null;

if (!$product_id || !$from_cell || !$to_cell || !$quantity || $quantity <= 0) {
    echo json_encode(["message" => "Некорректные данные"]);
    exit;
}

if ($from_cell == $to_cell) {
    echo json_encode(["message" => "Исходная и целевая ячейки совпадают"]);
    exit;
}

/*
  1. Проверяем остаток в исходной ячейке
*/
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

if (!$row || $row["quantity"] < $quantity) {
    echo json_encode(["message" => "Недостаточно товара в ячейке"]);
    exit;
}

/*
  2. Уменьшаем остаток в исходной ячейке
*/
$stmt = $mysql->prepare("
    UPDATE stock
    SET quantity = quantity - ?
    WHERE product_id = ? AND cell_id = ?
");
$stmt->bind_param("dii", $quantity, $product_id, $from_cell);
$stmt->execute();

/*
  3. Увеличиваем остаток в целевой ячейке
*/
$stmt = $mysql->prepare("
    INSERT INTO stock (product_id, cell_id, quantity)
    VALUES (?, ?, ?)
    ON DUPLICATE KEY UPDATE quantity = quantity + VALUES(quantity)
");
$stmt->bind_param("iid", $product_id, $to_cell, $quantity);
$stmt->execute();

/*
  4. Логируем операцию
*/
$stmt = $mysql->prepare("
    INSERT INTO warehouse_operations
        (operation_type, product_id, quantity, cell_id, cell_role, comment)
    VALUES
        ('movement', ?, ?, ?, 'destination', 'Перемещение товара')
");
$stmt->bind_param("idi", $product_id, $quantity, $to_cell);
$stmt->execute();

echo json_encode(["message" => "ok"]);
