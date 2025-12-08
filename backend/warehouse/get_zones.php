<?php
require_once __DIR__ . "/../cors.php";
require_once __DIR__ . "/../db.php";

header("Content-Type: application/json; charset=utf-8");

$mysql->select_db("warehouse_service");

$sql = "SELECT zone_id, name FROM zones ORDER BY zone_id";
$res = $mysql->query($sql);

$zones = [];
if ($res) {
    while ($row = $res->fetch_assoc()) {
        $zones[] = $row;
    }
}

echo json_encode(["zones" => $zones]);
