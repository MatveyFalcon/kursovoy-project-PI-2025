<?php
require_once "../cors.php";
require_once "../db.php";

header("Content-Type: application/json; charset=utf-8");

$mysql->select_db("warehouse_service");

$data = json_decode(file_get_contents("php://input"), true);

$cell_id     = $data["cell_id"] ?? null;
$zone_id     = $data["zone_id"] ?? null;
$cell_code   = $data["cell_code"] ?? null;
$max_volume  = $data["max_volume"] ?? null;
$max_weight  = $data["max_weight"] ?? null;
$description = $data["description"] ?? null;

if (!$cell_id || !$zone_id || !$cell_code) {
    echo json_encode(["message" => "Неверные параметры"]);
    exit;
}

$stmt = $mysql->prepare("
    UPDATE cells
    SET zone_id = ?, cell_code = ?, max_volume = ?, max_weight = ?, description = ?
    WHERE cell_id = ?
");
$stmt->bind_param(
    "issssi",
    $zone_id,
    $cell_code,
    $max_volume,
    $max_weight,
    $description,
    $cell_id
);

if ($stmt->execute()) {
    echo json_encode(["message" => "ok"]);
} else {
    echo json_encode(["message" => "Ошибка обновления"]);
}
