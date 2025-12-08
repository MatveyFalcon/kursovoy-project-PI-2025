<?php
require_once "cors.php";
require_once "db.php";

header('Content-Type: application/json');

$data = json_decode(file_get_contents("php://input"), true);

$login = $data["login"] ?? "";
$password = $data["password"] ?? "";

$stmt = $mysql->prepare("SELECT user_id, password_hash FROM users WHERE login = ?");
$stmt->bind_param("s", $login);
$stmt->execute();
$stmt->store_result();

// Проверяем, найден ли пользователь
if ($stmt->num_rows === 0) {
    echo json_encode(["message" => "Неверный логин"]);
    exit;
}

// Теперь безопасно привязываем переменные
/** @var string $password_hash */
$stmt->bind_result($user_id, $password_hash);
$stmt->fetch();

// Проверка пароля
if (!password_verify($password, $password_hash)) {
    echo json_encode(["message" => "Неверный пароль"]);
    exit;
}

// Генерируем простой токен
$token = bin2hex(random_bytes(16));

echo json_encode([
    "message" => "ok",
    "user_id" => $user_id,
    "token" => $token
]);
