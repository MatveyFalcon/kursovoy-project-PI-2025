<?php
require_once "../cors.php";
require_once "../db.php";

header('Content-Type: application/json');

// База склада
$mysql->select_db("warehouse_service");

$sql = "
    SELECT 
        c.cell_id,
        c.cell_code,
        c.max_volume,
        c.max_weight,
        z.name AS zone_name,
        z.zone_id
    FROM cells c
    INNER JOIN zones z ON z.zone_id = c.zone_id
    ORDER BY c.cell_id
";

$result = $mysql->query($sql);

$cells = [];
while ($row = $result->fetch_assoc()) {
    $cells[] = $row;
}

echo json_encode([
    "message" => "ok",
    "cells" => $cells
]);
