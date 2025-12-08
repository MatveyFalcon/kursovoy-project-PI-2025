<?php
require_once "cors.php";
require_once "db.php";

header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');

$data = json_decode(file_get_contents("php://input"), true);

$fullName = $data["fullName"] ?? "";
$phone    = $data["phone"] ?? "";
$email    = $data["email"] ?? "";
$login    = $data["login"] ?? "";
$password = $data["password"] ?? "";

if (!$fullName || !$phone || !$email || !$login || !$password) {
    echo json_encode(["message" => "Заполните все поля"]);
    exit;
}

$mysql->select_db("auth_service");

$password_hash = password_hash($password, PASSWORD_DEFAULT);

$stmt = $mysql->prepare("
    INSERT INTO users (login, password_hash, full_name, phone, email, user_type)
    VALUES (?, ?, ?, ?, ?, 'client')
");
$stmt->bind_param("sssss", $login, $password_hash, $fullName, $phone, $email);

if ($stmt->execute()) {
    echo json_encode(["message" => "ok"]);
} else {
    echo json_encode(["message" => "Логин уже используется"]);
}
