<?php
require_once __DIR__ . "/../cors.php";
require_once __DIR__ . "/../db.php";

header("Content-Type: application/json; charset=utf-8");

$mysql->select_db("warehouse_service");

$product_id = $_GET["product_id"] ?? null;

if (!$product_id) {
    echo json_encode(["message" => "Нет product_id"]);
    exit;
}

$stmt = $mysql->prepare("
    SELECT 
        product_id, sku, name, category_id, unit_id,
        weight, volume, description, active
    FROM products
    WHERE product_id = ?
    LIMIT 1
");
$stmt->bind_param("i", $product_id);
$stmt->execute();

$res = $stmt->get_result();
$row = $res ? $res->fetch_assoc() : null;

if (!$row) {
    echo json_encode(["message" => "Товар не найден"]);
    exit;
}

echo json_encode($row);
