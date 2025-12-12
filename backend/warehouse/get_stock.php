<?php
require_once __DIR__ . "/../cors.php";
require_once __DIR__ . "/../db.php";

header("Content-Type: application/json; charset=utf-8");

$mysql->select_db("warehouse_service");

$sql = "
    SELECT
        s.stock_id,
        s.quantity,
        c.cell_code,
        p.name AS product_name,
        p.sku
    FROM stock s
    JOIN cells c ON c.cell_id = s.cell_id
    JOIN products p ON p.product_id = s.product_id
    ORDER BY c.cell_code, p.name
";

$res = $mysql->query($sql);

$items = [];
if ($res) {
    while ($row = $res->fetch_assoc()) {
        $items[] = $row;
    }
}

echo json_encode(["stock" => $items]);
