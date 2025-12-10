<?php
require_once "../cors.php";
require_once "../db.php";

header("Content-Type: application/json; charset=utf-8");

$mysql->select_db("warehouse_service");

$data = json_decode(file_get_contents("php://input"), true);

$zone_id      = $data["zone_id"] ?? null;
$cell_code    = $data["cell_code"] ?? null;
$max_volume   = $data["max_volume"] ?? null;
$max_weight   = $data["max_weight"] ?? null;
$description  = $data["description"] ?? null;

if (!$zone_id || !$cell_code) {
    echo json_encode(["message" => "Введите обязательные поля"]);
    exit;
}

$stmt = $mysql->prepare("
    INSERT INTO cells (zone_id, cell_code, max_volume, max_weight, description)
    VALUES (?, ?, ?, ?, ?)
");
$stmt->bind_param(
    "issss",
    $zone_id,
    $cell_code,
    $max_volume,
    $max_weight,
    $description
);

if ($stmt->execute()) {
    echo json_encode(["message" => "ok"]);
} else {
    echo json_encode(["message" => "Ошибка: код ячейки уже существует"]);
}
