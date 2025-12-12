<?php
require_once __DIR__ . "/../cors.php";
require_once __DIR__ . "/../db.php";

header("Content-Type: application/json; charset=utf-8");

$mysql->select_db("warehouse_service");

$data = json_decode(file_get_contents("php://input"), true);

$cell_id    = $data["cell_id"] ?? null;
$product_id = $data["product_id"] ?? null;
$quantity   = $data["quantity"] ?? null;

if (!$cell_id || !$product_id || !$quantity) {
    echo json_encode(["message" => "Введите все поля"]);
    exit;
}

// получаем SKU товара
$stmtSku = $mysql->prepare("SELECT sku FROM products WHERE product_id = ?");
$stmtSku->bind_param("i", $product_id);
$stmtSku->execute();
$resSku = $stmtSku->get_result();
$rowSku = $resSku->fetch_assoc();

if (!$rowSku) {
    echo json_encode(["message" => "Товар не найден"]);
    exit;
}

$product_sku = $rowSku["sku"];

// если запись уже есть — увеличиваем количество
$stmt = $mysql->prepare("
    INSERT INTO stock (cell_id, product_id, product_sku, quantity)
    VALUES (?, ?, ?, ?)
    ON DUPLICATE KEY UPDATE quantity = quantity + VALUES(quantity)
");
$stmt->bind_param("iisd", $cell_id, $product_id, $product_sku, $quantity);

if ($stmt->execute()) {
    echo json_encode(["message" => "ok"]);
} else {
    echo json_encode(["message" => "Ошибка добавления остатка"]);
}
