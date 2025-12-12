<?php
require_once __DIR__ . "/../cors.php";
require_once __DIR__ . "/../db.php";

header("Content-Type: application/json; charset=utf-8");

$mysql->select_db("warehouse_service");

$data = json_decode(file_get_contents("php://input"), true);

$product_id  = $data["product_id"] ?? null;
$sku         = trim($data["sku"] ?? "");
$name        = trim($data["name"] ?? "");
$category_id = $data["category_id"] ?? null;
$unit_id     = $data["unit_id"] ?? null;
$weight      = $data["weight"] ?? null;
$volume      = $data["volume"] ?? null;
$description = $data["description"] ?? null;
$active      = isset($data["active"]) ? (int)$data["active"] : 1;

if (!$product_id || !$sku || !$name) {
    echo json_encode(["message" => "product_id, SKU и название обязательны"]);
    exit;
}

$stmt = $mysql->prepare("
    UPDATE products
    SET sku = ?, name = ?, category_id = ?, unit_id = ?,
        weight = ?, volume = ?, description = ?, active = ?
    WHERE product_id = ?
");
$stmt->bind_param(
    "ssiidssii",
    $sku,
    $name,
    $category_id,
    $unit_id,
    $weight,
    $volume,
    $description,
    $active,
    $product_id
);

if ($stmt->execute()) {
    echo json_encode(["message" => "ok"]);
} else {
    echo json_encode(["message" => "Ошибка обновления (возможно, SKU уже занят)"]);
}
