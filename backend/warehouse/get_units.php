<?php
require_once __DIR__ . "/../cors.php";
require_once __DIR__ . "/../db.php";

header("Content-Type: application/json; charset=utf-8");

$mysql->select_db("warehouse_service");

$res = $mysql->query("
    SELECT 
        unit_id,
        name,
        short_name
    FROM units
    ORDER BY name
");

$units = [];
if ($res) {
    while ($row = $res->fetch_assoc()) {
        $units[] = $row;
    }
}

echo json_encode([
    "units" => $units
]);
