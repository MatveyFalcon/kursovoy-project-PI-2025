<?php
require_once "cors.php";
require_once "db.php";

header('Content-Type: application/json');

$data = json_decode(file_get_contents("php://input"), true);

$login = $data["login"] ?? "";
$password = $data["password"] ?? "";

if ($login === "" || $password === "") {
    echo json_encode(["message" => "Укажите логин и пароль"]);
    exit;
}

// Берём данные пользователя + привязку к сотруднику и должности (если есть)
$stmt = $mysql->prepare("
    SELECT 
        u.user_id,
        u.password_hash,
        u.user_type,
        u.full_name,
        e.employee_id,
        p.name AS position_name
    FROM users u
    LEFT JOIN employees e ON e.user_id = u.user_id
    LEFT JOIN positions p ON p.position_id = e.position_id
    WHERE u.login = ? AND u.status = 'active'
");
$stmt->bind_param("s", $login);
$stmt->execute();
$stmt->store_result();

if ($stmt->num_rows === 0) {
    echo json_encode(["message" => "Неверный логин или пользователь отключён"]);
    exit;
}

/** @var string $password_hash */
$stmt->bind_result($user_id, $password_hash, $user_type, $full_name, $employee_id, $position_name);
$stmt->fetch();

if (!password_verify($password, $password_hash)) {
    echo json_encode(["message" => "Неверный пароль"]);
    exit;
}

$token = bin2hex(random_bytes(16)); // простой токен

echo json_encode([
    "message"       => "ok",
    "user_id"       => $user_id,
    "token"         => $token,
    "user_type"     => $user_type,
    "full_name"     => $full_name,
    "login"         => $login,
    "employee_id"   => $employee_id,
    "position_name" => $position_name
]);
