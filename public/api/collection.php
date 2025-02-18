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
    $sql = "INSERT INTO `collection` (`store_id`, `uid`) VALUES (?, ?)";

    $params = [
      (int)($data->store_id),
      (int)($data->uid)
    ];

    $result = prepare_bind_execute($sqllink, $sql, "ii", $params);
    echo json_encode(["res" => $result !== false ? "ok" : "error"]);
    break;

  case 'GET':
    if (!token_check()) {
      echo json_encode(["res" => "token_error", "collections" => []]);
      return;
    }
    $id = isset($_GET['id']) ? escape_string($sqllink, $_GET['id']) : null;
    $uid = isset($_GET['uid']) ? escape_string($sqllink, $_GET['uid']) : null;
    $game_version = isset($_GET['game_version']) ? escape_string($sqllink, $_GET['game_version']) : null;

    if ($id) {
      $sql = "SELECT * FROM `collection` WHERE `id` = ? AND `is_deleted` = 0";
      $result = prepare_bind_execute($sqllink, $sql, "s", [$id]);
    } else if ($uid) {
      $sql = "SELECT c.*, s.name as store_name, s.address , s.lat, s.lng, s.mapURL
              FROM `collection` c 
              JOIN `store` s ON c.store_id = s.id 
              WHERE c.uid = ? AND c.is_deleted = 0 AND " . (($game_version === 'ja') ? "s.country = 'Japan'" : "s.country != 'Japan'");
      $result = prepare_bind_execute($sqllink, $sql, "s", [$uid]);
    } else {
      return;
    }

    if ($result && mysqli_num_rows($result) > 0) {
      $collections = [];
      while ($row = mysqli_fetch_assoc($result)) {
        $collections[] = $row;
      }
      echo json_encode(["res" => "ok", "collections" => $collections]);
    } else {
      echo json_encode(["res" => "not_exist", "collections" => []]);
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
      'store_id' => 'i',
      'uid' => 'i',
      'is_deleted' => 'i'
    ];

    foreach ($fields as $field => $type) {
      if (isset($data->$field)) {
        $update_fields[] = "`$field` = ?";
        $params[] = $data->$field;
        $types .= $type;
      }
    }

    if (!empty($update_fields)) {
      $params[] = $id;
      $types .= "s";

      $sql = "UPDATE `collection` SET " . implode(', ', $update_fields) . " WHERE `id` = ?";
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
    $store_id = escape_string($sqllink, $data->store_id);
    $uid = escape_string($sqllink, $data->uid);
    $sql = "DELETE FROM `collection` WHERE `store_id` = ? AND `uid` = ?";
    $result = prepare_bind_execute($sqllink, $sql, "ii", [$store_id, $uid]);
    echo json_encode(["res" => $result !== false ? "ok" : "error"]);
    break;
}
