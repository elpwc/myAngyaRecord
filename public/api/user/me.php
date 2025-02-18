<?php
require dirname(__FILE__) . '/../utils/cors.php';
require dirname(__FILE__) . '/../private/verifygen.php';

session_start();

$headers = apache_request_headers();
$auth_header = isset($headers['Authorization']) ? $headers['Authorization'] : '';

// 本地调试沒有apache时获取bearer
if ($auth_header === '') {
  $auth_header = $_SERVER['HTTP_AUTHORIZATION'];
}

// 检查 bearer token 格式
if (!preg_match('/^Bearer\s+(.*)$/i', $auth_header, $matches)) {
  http_response_code(401);
  echo json_encode(['res' => 'invalid_auth_header']);
} else {
  $token = $matches[1];
  // 验证 token 是否为空
  if (empty($token)) {
    http_response_code(401);
    echo json_encode(['res' => 'empty_token']);
  } else {
    error_log(113);
    error_log($_SESSION["token"]);
    if (verify_token($token)) {
      http_response_code(200);
      echo json_encode(['res' => 'ok']);
    } else {
      http_response_code(401);
      echo json_encode(['res' => 'invalid_authorization']);
    }
  }
}
