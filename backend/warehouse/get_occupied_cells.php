<?php
require_once __DIR__ . "/../cors.php";
require_once __DIR__ . "/../db.php";

header("Content-Type: application/json; charset=utf-8");

$mysql->select_db("warehouse_service");

$sql = "
    SELECT COUNT(DISTINCT cell_id) AS occupied
    FROM stock
    WHERE quantity > 0
";

$res = $mysql->query($sql);
$row = $res->fetch_assoc();

echo json_encode([
    "occupied_cells" => (int)$row["occupied"]
]);
