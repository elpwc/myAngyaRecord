<?php

/**
 * 地标后端
 */

require dirname(__FILE__) . '/../private/dbcfg.php';
require dirname(__FILE__) . '/../private/admin.php';
require dirname(__FILE__) . '/../utils/utils.php';
require dirname(__FILE__) . '/../utils/sqlgenerator.php';
require dirname(__FILE__) . '/../utils/cors.php';
require dirname(__FILE__) . '/../private/verifygen.php';

use Firebase\JWT\JWT;
use Firebase\JWT\Key;

session_start();

$request_type = $_SERVER['REQUEST_METHOD'];
$json = file_get_contents('php://input');
$data = json_decode($json);

$sqllink = @mysqli_connect(HOST, USER, PASS, DBNAME) or die('Link to database failed');
mysqli_set_charset($sqllink, 'utf8mb4');

$result = '';

switch ($request_type) {
  case 'POST':
    $email = escape_string($sqllink, $data->email);
    $pw = md5(trim((string)($data->password)));

    $sql = "SELECT `email`, `id`, `name`, `avatar_url`, `hitokoto`, `create_date` FROM `user` 
            WHERE `email` = ? AND `pw` = ? AND `is_deleted` = 0 
            AND `is_banned` = 0 AND `verified` = 1";

    $result = prepare_bind_execute($sqllink, $sql, "ss", [$email, $pw]);

    if ($result && mysqli_num_rows($result) > 0) {
      $user = mysqli_fetch_assoc($result);
      $token = gen_token($email, 72000);
      $_SESSION["token"] = $token;
      echo json_encode(["res" => "ok", "email" => $email, "token" => $token, "uid" => $user['id'], "nickname" => $user['name'], "avatar" => $user['avatar_url'], "hitokoto" => $user['hitokoto'], "create_date" => $user['create_date'], 'status' => 200]);
    } else {
      echo json_encode(["res" => "fail", 'status' => 401]);
    }
    break;

  case 'DELETE':
    unset($_SESSION['token']);
    session_destroy();
    echo json_encode(["res" => "ok"]);
    break;

  default:
    echo json_encode(["res" => "unknown"]);
    break;
}
