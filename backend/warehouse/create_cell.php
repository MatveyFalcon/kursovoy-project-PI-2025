<?php
require_once __DIR__ . "/../cors.php";
require_once __DIR__ . "/../db.php";

header("Content-Type: application/json; charset=utf-8");

$data = json_decode(file_get_contents("php://input"), true);

$zone_id    = isset($data["zone_id"]) ? (int)$data["zone_id"] : 0;
$cell_code  = trim($data["cell_code"] ?? "");
$max_volume = (float)($data["max_volume"] ?? 0);
$max_weight = (float)($data["max_weight"] ?? 0);

if (!$zone_id || !$cell_code) {
    echo json_encode(["message" => "Укажите зону и код ячейки"]);
    exit;
}

$mysql->select_db("warehouse_service");

// Можно добавить проверку на дубликат, если нужно
$stmt = $mysql->prepare("
    INSERT INTO cells (zone_id, cell_code, max_volume, max_weight)
    VALUES (?, ?, ?, ?)
");
$stmt->bind_param("isdd", $zone_id, $cell_code, $max_volume, $max_weight);

if ($stmt->execute()) {
    echo json_encode(["message" => "ok"]);
} else {
    echo json_encode(["message" => "Ошибка БД"]);
}
