<?php

/**
 * 邮件验证
 */

require dirname(__FILE__) . '/../private/dbcfg.php';
require dirname(__FILE__) . '/../private/admin.php';
require dirname(__FILE__) . '/../utils/utils.php';
require dirname(__FILE__) . '/../utils/sqlgenerator.php';
require dirname(__FILE__) . '/../utils/cors.php';
require dirname(__FILE__) . '/../private/verifygen.php';
require dirname(__FILE__) . '/../utils/recaptcha.php';

session_start();

$request_type = $_SERVER['REQUEST_METHOD'];
$json = file_get_contents('php://input');
$data = json_decode($json);

$sqllink = @mysqli_connect(HOST, USER, PASS, DBNAME) or die('数据库连接出错');
mysqli_set_charset($sqllink, 'utf8mb4');

switch ($request_type) {
  case 'POST':
    $email = escape_string($sqllink, $data->email);
    $token = escape_string($sqllink, $data->token);
    $isForgetPassword = escape_string($sqllink, $data->isForgetPassword) === '0' ? false : true;

    error_log($token);
    error_log($email);
    if (!verify_recaptcha($token)) {
      echo json_encode(["res" => "recaptcha_failed"]);
      return;
    }

    $sql = "SELECT `email` FROM `user` WHERE `email` = ? AND `is_deleted` = 0";
    $result = prepare_bind_execute($sqllink, $sql, "s", [$email]);

    if ($isForgetPassword) {
      if ($result && mysqli_num_rows($result) > 0) {
        // email already exists
        $email_result = send_verification_mail($email, gen_token($email), true);
        if ($email_result) {
          echo json_encode(["res" => "ok"]);
        } else {
          echo json_encode(["res" => "email_failed"]);
        }
      } else {
        echo json_encode(["res" => "email_not_exist"]);
      }
    } else {
      if ($result && mysqli_num_rows($result) > 0) {
        echo json_encode(["res" => "exist"]);
      } else {
        $email_result = send_verification_mail($email,  generate_verification_code($email), false);
        if ($email_result) {
          echo json_encode(["res" => "ok"]);
        } else {
          echo json_encode(["res" => "email_failed"]);
        }
      }
    }

    break;
}
