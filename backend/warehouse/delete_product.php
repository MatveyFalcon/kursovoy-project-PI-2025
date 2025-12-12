<?php
require_once __DIR__ . "/../cors.php";
require_once __DIR__ . "/../db.php";

header("Content-Type: application/json; charset=utf-8");

$mysql->select_db("warehouse_service");

$data = json_decode(file_get_contents("php://input"), true);
$product_id = $data["product_id"] ?? null;

if (!$product_id) {
    echo json_encode(["message" => "Нет product_id"]);
    exit;
}

$stmt = $mysql->prepare("DELETE FROM products WHERE product_id = ?");
$stmt->bind_param("i", $product_id);

if ($stmt->execute()) {
    echo json_encode(["message" => "ok"]);
} else {
    echo json_encode(["message" => "Ошибка удаления"]);
}
