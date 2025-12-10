<?php
require_once "../cors.php";
require_once "../db.php";

header("Content-Type: application/json; charset=utf-8");

$mysql->select_db("warehouse_service");

$zone_id = $_GET["zone_id"] ?? null;

if (!$zone_id) {
    echo json_encode(["message" => "Нет ID"]);
    exit;
}

$stmt = $mysql->prepare("DELETE FROM zones WHERE zone_id = ?");
$stmt->bind_param("i", $zone_id);

if ($stmt->execute()) {
    echo json_encode(["message" => "ok"]);
} else {
    echo json_encode(["message" => "Ошибка удаления"]);
}
