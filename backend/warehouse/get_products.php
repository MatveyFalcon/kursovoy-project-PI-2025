<?php
require_once __DIR__ . "/../cors.php";
require_once __DIR__ . "/../db.php";

header("Content-Type: application/json; charset=utf-8");

$mysql->select_db("warehouse_service");

$sql = "
    SELECT 
        p.product_id,
        p.sku,
        p.name,
        p.weight,
        p.volume,
        p.description,
        p.active,
        c.name AS category_name,
        u.name AS unit_name
    FROM products p
    LEFT JOIN categories c ON c.category_id = p.category_id
    LEFT JOIN units u ON u.unit_id = p.unit_id
    ORDER BY p.product_id DESC
";

$res = $mysql->query($sql);

$products = [];
if ($res) {
    while ($row = $res->fetch_assoc()) {
        $products[] = $row;
    }
}

echo json_encode([
    "products" => $products
]);
