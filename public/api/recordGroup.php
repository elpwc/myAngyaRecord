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

    $insert_sql = "INSERT INTO `recordgroup` (`uid`, `name`, `desc`, `mapid`) VALUES (?, ?, ?, ?)";
    $insert_params = [
      (int)($data->uid),
      escape_string($sqllink, $data->name),
      escape_string($sqllink, $data->desc),
      escape_string($sqllink, $data->mapid)
    ];
    $insert_result = prepare_bind_execute($sqllink, $insert_sql, "isss", $insert_params);
    echo json_encode(["res" => $insert_result !== false ? "ok" : "error"]);
    break;

  case 'GET':
    if (!token_check()) {
      echo json_encode(["res" => "token_error"]);
      return;
    }

    $id = isset($_GET['id']) ? escape_string($sqllink, $_GET['id']) : null;
    $uid = isset($_GET['uid']) ? escape_string($sqllink, $_GET['uid']) : null;
    $mapid = isset($_GET['mapid']) ? escape_string($sqllink, $_GET['mapid']) : null;

    if ($id) {
      // 指定id的单个地图
      $sql = "SELECT * FROM `recordgroup` WHERE `id` = ? AND `is_deleted` = 0";
      $result = prepare_bind_execute($sqllink, $sql, "i", [$id]);
    } else {
      // 符合条件的所有地图
      $sql = "SELECT * FROM `recordgroup` WHERE `mapid` = ? AND `uid` = ? AND `is_deleted` = 0";
      $result = prepare_bind_execute($sqllink, $sql, "si", [$mapid, $uid]);
    }

    $groups = [];
    if ($result) {
      while ($row = mysqli_fetch_assoc($result)) {
        $groups[] = $row;
      }
    }
    echo json_encode(["res" => "ok", "groups" => $groups]);
    break;

  case 'PATCH':
    if (!token_check()) {
      echo json_encode(["res" => "token_error"]);
      return;
    }
    $id = (int)$data->id;
    $update_fields = [];
    $params = [];
    $types = "";

    $fields = [
      'name' => 's',
      'desc' => 's',
      'mapid' => 's',
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
      $types .= "i";
      $sql = "UPDATE `recordgroup` SET " . implode(', ', $update_fields) . " WHERE `id` = ?";
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
    $id = (int)$data->id;
    $sql = "UPDATE `recordgroup` SET `is_deleted` = 1 WHERE `id` = ?";
    $result = prepare_bind_execute($sqllink, $sql, "i", [$id]);
    echo json_encode(["res" => $result !== false ? "ok" : "error"]);
    break;
}
