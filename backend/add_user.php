<?php
require_once "db.php";

header('Content-Type: application/json');

$login = $_GET["login"] ?? "";
$password = $_GET["password"] ?? "";

if (!$login || !$password) {
    echo json_encode(["message" => "Укажите ?login=...&password=..."]);
    exit;
}

$password_hash = password_hash($password, PASSWORD_DEFAULT);

$stmt = $mysql->prepare("
    INSERT INTO users (login, password_hash, full_name, phone, email, user_type, status)
    VALUES (?, ?, 'Test User', '', '', 'client', 'active')
");
$stmt->bind_param("ss", $login, $password_hash);

if ($stmt->execute()) {
    echo json_encode([
        "message" => "ok",
        "login" => $login,
        "password" => $password
    ]);
} else {
    echo json_encode([
        "message" => "Ошибка: логин уже существует"
    ]);
}
