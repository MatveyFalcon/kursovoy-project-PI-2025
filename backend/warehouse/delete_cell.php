<?php
require_once "../cors.php";
require_once "../db.php";

header("Content-Type: application/json; charset=utf-8");

$mysql->select_db("warehouse_service");

$data = json_decode(file_get_contents("php://input"), true);
$cell_id = $data["cell_id"] ?? null;

if (!$cell_id) {
    echo json_encode(["message" => "ID не передан"]);
    exit;
}

$stmt = $mysql->prepare("DELETE FROM cells WHERE cell_id = ?");
$stmt->bind_param("i", $cell_id);

if ($stmt->execute()) {
    echo json_encode(["message" => "ok"]);
} else {
    echo json_encode(["message" => "Ошибка удаления"]);
}
