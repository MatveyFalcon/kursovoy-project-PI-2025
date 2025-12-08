<?php
require_once "cors.php";
require_once "db.php";

header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');

$data = json_decode(file_get_contents("php://input"), true);

$login = $data["login"] ?? "";
$password = $data["password"] ?? "";

if (!$login || !$password) {
    echo json_encode(["message" => "Введите логин и пароль"]);
    exit;
}

$mysql->select_db("auth_service");

$stmt = $mysql->prepare("
    SELECT user_id, password_hash, full_name, user_type
    FROM users
    WHERE login = ?
    LIMIT 1
");
$stmt->bind_param("s", $login);
$stmt->execute();
$stmt->store_result();
$stmt->bind_result($user_id, $password_hash, $full_name, $user_type);
$stmt->fetch();

if ($stmt->num_rows === 0) {
    echo json_encode(["message" => "Неверный логин"]);
    exit;
}

$password_hash = $password_hash ?? "";

if (!password_verify($password, $password_hash)) {
    echo json_encode(["message" => "Неверный пароль"]);
    exit;
}

$employee_id = null;
$position_name = null;

if ($user_type === 'employee') {
    $stmt2 = $mysql->prepare("
        SELECT e.employee_id, p.name
        FROM employees e
        LEFT JOIN positions p ON p.position_id = e.position_id
        WHERE e.user_id = ?
        LIMIT 1
    ");
    $stmt2->bind_param("i", $user_id);
    $stmt2->execute();
    $stmt2->store_result();
    $stmt2->bind_result($employee_id, $position_name);
    $stmt2->fetch();
}

$token = bin2hex(random_bytes(16));

echo json_encode([
    "message"       => "ok",
    "user_id"       => $user_id,
    "login"         => $login,
    "full_name"     => $full_name,
    "user_type"     => $user_type,
    "employee_id"   => $employee_id,
    "position_name" => $position_name,
    "token"         => $token
]);
