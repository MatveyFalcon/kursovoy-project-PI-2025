<?php
require_once __DIR__ . "/../cors.php";
require_once __DIR__ . "/../db.php";

header("Content-Type: application/json; charset=utf-8");

$mysql->select_db("warehouse_service");

$sql = "
    SELECT 
        c.cell_id,
        c.cell_code,
        c.max_volume,
        c.max_weight,
        z.name AS zone_name
    FROM cells c
    LEFT JOIN zones z ON z.zone_id = c.zone_id
    ORDER BY c.cell_id
";

$res = $mysql->query($sql);

$cells = [];
if ($res) {
    while ($row = $res->fetch_assoc()) {
        $cells[] = $row;
    }
}

echo json_encode(["cells" => $cells]);
