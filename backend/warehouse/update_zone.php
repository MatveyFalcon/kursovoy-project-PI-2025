<?php
require_once "../cors.php";
require_once "../db.php";

header("Content-Type: application/json; charset=utf-8");

$mysql->select_db("warehouse_service");

$data = json_decode(file_get_contents("php://input"), true);

$zone_id = $data["zone_id"] ?? null;
$name = $data["name"] ?? null;
$description = $data["description"] ?? null;

if (!$zone_id || !$name) {
    echo json_encode(["message" => "Не хватает данных"]);
    exit;
}

$stmt = $mysql->prepare("
    UPDATE zones 
    SET name = ?, description = ?
    WHERE zone_id = ?
");
$stmt->bind_param("ssi", $name, $description, $zone_id);

if ($stmt->execute()) {
    echo json_encode(["message" => "ok"]);
} else {
    echo json_encode(["message" => "Ошибка обновления"]);
}
