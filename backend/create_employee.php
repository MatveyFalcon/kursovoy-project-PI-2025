<?php
require_once "cors.php";
require_once "db.php";

header('Content-Type: application/json');

$data = json_decode(file_get_contents("php://input"), true);

$login       = $data["login"] ?? "";
$password    = $data["password"] ?? "";
$fullName    = $data["full_name"] ?? "";
$phone       = $data["phone"] ?? "";
$email       = $data["email"] ?? "";
$position_id = $data["position_id"] ?? "";

if (!$login || !$password || !$fullName || !$position_id) {
    echo json_encode(["error" => "login, password, full_name и position_id обязательны"]);
    exit;
}

// 1. Хешируем пароль
$password_hash = password_hash($password, PASSWORD_DEFAULT);

// 2. Создаём запись в users
$stmt = $mysql->prepare("
    INSERT INTO users (login, password_hash, full_name, phone, email, user_type, status)
    VALUES (?, ?, ?, ?, ?, 'employee', 'active')
");
$stmt->bind_param("sssss", $login, $password_hash, $fullName, $phone, $email);

if (!$stmt->execute()) {
    echo json_encode(["error" => "Пользователь с таким логином уже существует"]);
    exit;
}

$user_id = $stmt->insert_id;

// 3. Создаём запись в employees
$stmt2 = $mysql->prepare("
    INSERT INTO employees (user_id, position_id, full_name, phone, email, status)
    VALUES (?, ?, ?, ?, ?, 'working')
");
$stmt2->bind_param("iisss", $user_id, $position_id, $fullName, $phone, $email);
$stmt2->execute();

$employee_id = $stmt2->insert_id;

echo json_encode([
    "message" => "ok",
    "user_id" => $user_id,
    "employee_id" => $employee_id
]);
