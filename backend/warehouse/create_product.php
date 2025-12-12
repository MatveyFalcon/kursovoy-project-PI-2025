<?php
require_once __DIR__ . "/../cors.php";
require_once __DIR__ . "/../db.php";

header("Content-Type: application/json; charset=utf-8");

$mysql->select_db("warehouse_service");

$data = json_decode(file_get_contents("php://input"), true);

$sku         = trim($data["sku"] ?? "");
$name        = trim($data["name"] ?? "");
$category_id = $data["category_id"] ?? null;
$unit_id     = $data["unit_id"] ?? null;
$weight      = $data["weight"] ?? null;
$volume      = $data["volume"] ?? null;
$description = $data["description"] ?? null;
$active      = isset($data["active"]) ? (int)$data["active"] : 1;

if (!$sku || !$name) {
    echo json_encode(["message" => "SKU и название обязательны"]);
    exit;
}

$stmt = $mysql->prepare("
    INSERT INTO products
        (sku, name, category_id, unit_id, weight, volume, description, active)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
");

$stmt->bind_param(
    "ssiidssi",
    $sku,
    $name,
    $category_id,
    $unit_id,
    $weight,
    $volume,
    $description,
    $active
);

if ($stmt->execute()) {
    echo json_encode(["message" => "ok"]);
} else {
    echo json_encode([
        "message" => "Ошибка создания товара (возможно, SKU уже существует)"
    ]);
}
