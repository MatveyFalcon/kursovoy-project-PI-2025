<?php
require_once __DIR__ . "/../cors.php";
require_once __DIR__ . "/../db.php";

header("Content-Type: application/json; charset=utf-8");

$mysql->select_db("warehouse_service");

$res = $mysql->query("
    SELECT 
        category_id,
        name,
        description
    FROM categories
    ORDER BY name
");

$categories = [];
if ($res) {
    while ($row = $res->fetch_assoc()) {
        $categories[] = $row;
    }
}

echo json_encode([
    "categories" => $categories
]);
