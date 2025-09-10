<?php
require dirname(__FILE__) . '/../utils/cors.php';
require dirname(__FILE__) . '/../private/verifygen.php';


function token_check()
{

  $headers = apache_request_headers();
  $auth_header = isset($headers['authorization']) ? $headers['authorization'] : '';

  // 本地调试沒有apache时获取bearer
  if ($auth_header === '') {
    $auth_header = $_SERVER['HTTP_AUTHORIZATION'];
  }

  // 检查 bearer token 格式
  if (!preg_match('/^Bearer\s+(.*)$/i', $auth_header, $matches)) {
    //echo json_encode(['res' => 'invalid_auth_header']);
    return false;
  } else {
    $token = $matches[1];
    // 验证 token 是否为空
    if (empty($token)) {
      //http_response_code(401);
      //echo json_encode(['res' => 'empty_token']);
      return false;
    } else {
      if (verify_token($token)) {
        //http_response_code(200);
        //echo json_encode(['res' => 'ok']);
        return true;
      } else {
        //http_response_code(401);
        //echo json_encode(['res' => 'invalid_authorization']);
        return false;
      }
    }
  }
}
