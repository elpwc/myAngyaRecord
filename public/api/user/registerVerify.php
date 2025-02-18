<?php
require dirname(__FILE__) . '/../private/dbcfg.php';
require dirname(__FILE__) . '/../utils/cors.php';
require dirname(__FILE__) . '/../private/verifygen.php';
require dirname(__FILE__) . '/../utils/utils.php';

session_start();

$request_type = $_SERVER['REQUEST_METHOD'];
$json = file_get_contents('php://input');
$data = json_decode($json);

$sqllink = @mysqli_connect(HOST, USER, PASS, DBNAME) or die('数据库连接出错');
mysqli_set_charset($sqllink, 'utf8mb4');

switch ($request_type) {
  case 'POST':
    $email = escape_string($sqllink, $data->name);
    $verifycode = escape_string($sqllink, $data->verifycode);

    if (generate_verification_code($email) === $verifycode) {
      $sql = "UPDATE `user` SET `verified` = 1 
              WHERE `email` = ? AND `is_deleted` = 0 AND `is_banned` = 0";

      $result = prepare_bind_execute($sqllink, $sql, "s", [$email]);

      if ($result && mysqli_affected_rows($sqllink) > 0) {
        $token = md5(((string)time()) . $email);
        $_SESSION["token"] = $token;
        echo json_encode(["res" => "ok", "token" => $token]);
      } else {
        echo json_encode(["res" => "update_fail"]);
      }
    } else {
      echo json_encode(["res" => "not_correct"]);
    }
    break;

  default:
    echo json_encode(["res" => "not_correct_request"]);
    break;
}
