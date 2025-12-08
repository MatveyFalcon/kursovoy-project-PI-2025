<?php
require_once "../cors.php";
require_once "../db.php";

header('Content-Type: application/json');

// Переключаемся на базу склада
$mysql->select_db("warehouse_service");

// Получаем зоны
$result = $mysql->query("SELECT zone_id, name, description FROM zones ORDER BY zone_id");

$zones = [];
while ($row = $result->fetch_assoc()) {
    $zones[] = $row;
}

echo json_encode([
    "message" => "ok",
    "zones" => $zones
]);
