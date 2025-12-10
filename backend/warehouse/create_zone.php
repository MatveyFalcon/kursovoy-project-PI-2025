<?php
require_once "../cors.php";
require_once "../db.php";

header("Content-Type: application/json; charset=utf-8");

$mysql->select_db("warehouse_service");

$data = json_decode(file_get_contents("php://input"), true);

$name = $data["name"] ?? null;
$description = $data["description"] ?? null;

if (!$name) {
    echo json_encode(["message" => "Введите название"]);
    exit;
}

$stmt = $mysql->prepare("
    INSERT INTO zones (name, description)
    VALUES (?, ?)
");
$stmt->bind_param("ss", $name, $description);

if ($stmt->execute()) {
    echo json_encode(["message" => "ok"]);
} else {
    echo json_encode(["message" => "Ошибка: зона с таким названием уже существует"]);
}
