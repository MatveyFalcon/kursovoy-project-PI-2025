<?php
$host = 'localhost';
$db_user = 'root';
$db_password = '';
$db_name = 'auth_service'; // пока подключаем auth_service

$mysql = new mysqli($host, $db_user, $db_password, $db_name);

if ($mysql->connect_error) {
    die("Ошибка подключения: " . $mysql->connect_error);
}

if (session_status() == PHP_SESSION_NONE) {
    session_start();
}
?>
