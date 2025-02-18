<?php
require dirname(__FILE__) . '/private/dbcfg.php';
require dirname(__FILE__) . '/private/admin.php';
require dirname(__FILE__) . '/utils/utils.php';
require dirname(__FILE__) . '/utils/sqlgenerator.php';
require dirname(__FILE__) . '/utils/cors.php';
require dirname(__FILE__) . '/user/token.php';

session_start();

$request_type = $_SERVER['REQUEST_METHOD'];
$json = file_get_contents('php://input');
$data = json_decode($json);

$sqllink = @mysqli_connect(HOST, USER, PASS, DBNAME) or die('数据库连接出错');
mysqli_set_charset($sqllink, 'utf8mb4');

switch ($request_type) {
  case 'POST':
    if (!token_check()) {
      echo json_encode(["res" => "token_error"]);
      return;
    }
    $sql = "INSERT INTO `arcade` 
            (`type`, `version_type`, `sid`, `arcade_amount`, `is_official`, `reviewed`)
            VALUES (?, ?, ?, ?, ?, ?)";

    $params = [
      escape_string($sqllink, $data->type),
      escape_string($sqllink, $data->version_type),
      (int)($data->sid),
      (int)($data->arcade_amount),
      (int)($data->is_official),
      (int)($data->reviewed)
    ];

    $result = prepare_bind_execute($sqllink, $sql, "ssiiii", $params);
    echo json_encode(["res" => $result !== false ? "ok" : "error"]);
    break;

  case 'GET':
    $id = isset($_GET['id']) ? escape_string($sqllink, $_GET['id']) : null;
    $sid = isset($_GET['sid']) ? escape_string($sqllink, $_GET['sid']) : null;

    if ($id) {
      $sql = "SELECT * FROM `arcade` WHERE `id` = ? AND `is_deleted` = 0";
      $result = prepare_bind_execute($sqllink, $sql, "s", [$id]);
    } else if ($sid) {
      $sql = "SELECT * FROM `arcade` WHERE `sid` = ? AND `is_deleted` = 0";
      $result = prepare_bind_execute($sqllink, $sql, "s", [$sid]);
    } else {
      echo json_encode(["res" => "error", "msg" => "Missing id or sid parameter"]);
      break;
    }

    if ($result && mysqli_num_rows($result) > 0) {
      if ($id) {
        $arcade = mysqli_fetch_assoc($result);
        echo json_encode(["res" => "ok", "arcade" => $arcade]);
      } else {
        $arcades = [];
        while ($arcade = mysqli_fetch_assoc($result)) {
          $arcades[] = $arcade;
        }
        echo json_encode(["res" => "ok", "arcades" => $arcades]);
      }
    } else {
      echo json_encode(["res" => "not_exist", "arcades" => []]);
    }
    break;

  case 'PATCH':
    if (!token_check()) {
      echo json_encode(["res" => "token_error"]);
      return;
    }
    $id = escape_string($sqllink, $data->id);
    $update_fields = [];
    $params = [];
    $types = "";

    $fields = [
      'type' => 's',
      'version_type' => 's',
      'sid' => 'i',
      'arcade_amount' => 'i',
      'is_official' => 'i',
      'reviewed' => 'i',
      'is_deleted' => 'i'
    ];

    foreach ($fields as $field => $type) {
      if (isset($data->$field)) {
        $update_fields[] = "`$field` = ?";
        $params[] = $type === 's' ?
          escape_string($sqllink, $data->$field) :
          $data->$field;
        $types .= $type;
      }
    }

    if (!empty($update_fields)) {
      $params[] = $id;
      $types .= "s";

      $sql = "UPDATE `arcade` SET " . implode(', ', $update_fields) . " WHERE `id` = ?";
      $result = prepare_bind_execute($sqllink, $sql, $types, $params);
      echo json_encode(["res" => $result !== false ? "ok" : "error"]);
    } else {
      echo json_encode(["res" => "no_fields_to_update"]);
    }
    break;

  case 'DELETE':
    if (!token_check()) {
      echo json_encode(["res" => "token_error"]);
      return;
    }
    $id = escape_string($sqllink, $data->id);
    $sql = "UPDATE `arcade` SET `is_deleted` = 1 WHERE `id` = ?";
    $result = prepare_bind_execute($sqllink, $sql, "s", [$id]);
    echo json_encode(["res" => $result !== false ? "ok" : "error"]);
    break;
}
