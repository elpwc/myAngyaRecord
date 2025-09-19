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

$sqllink = @mysqli_connect(HOST, USER, PASS, DBNAME) or die('Link to database failed');
mysqli_set_charset($sqllink, 'utf8mb4');

switch ($request_type) {
  case 'POST':
    if (!token_check()) {
      echo json_encode(["res" => "token_error"]);
      return;
    }

    $insert_sql = "INSERT INTO `recordgroup` (`uid`, `name`, `desc`, `mapid`, `is_public`, `show_lived_level`) VALUES (?, ?, ?, ?, ?, ?)";
    $insert_params = [
      (int)($data->uid),
      escape_string($sqllink, $data->name),
      escape_string($sqllink, $data->desc),
      escape_string($sqllink, $data->mapid),
      (int)($data->is_public === true ? 1 : 0),
      (int)($data->show_lived_level === true ? 1 : 0),
    ];
    $insert_result = prepare_bind_execute($sqllink, $insert_sql, "isssii", $insert_params);
    echo json_encode(["res" => $insert_result !== false ? "ok" : "error"]);
    break;

  case 'GET':
    $id = isset($_GET['id']) ? escape_string($sqllink, $_GET['id']) : null;
    $uid = isset($_GET['uid']) ? escape_string($sqllink, $_GET['uid']) : null;
    $mapid = isset($_GET['mapid']) ? escape_string($sqllink, $_GET['mapid']) : null;
    $is_public = isset($_GET['is_public']) ? (escape_string($sqllink, $_GET['is_public']) === 'true' ? 1 : 0) : null;
    $show_lived_level = isset($_GET['show_lived_level']) ? (escape_string($sqllink, $_GET['show_lived_level']) === 'true' ? 1 : 0) : null;

    if ($id) {
      // 指定id的单个地图
      $sql = "SELECT rg.*, u.avatar_url AS avatar_url , u.name AS nickname
              FROM `recordgroup` rg 
              JOIN `user` u 
              ON rg.uid = u.id
              WHERE rg.id = ? AND rg.is_deleted = 0";
      $result = prepare_bind_execute($sqllink, $sql, "i", [$id]);
    } else {
      // 符合条件的所有地图
      $sql = "SELECT * FROM `recordgroup` WHERE `mapid` = ? AND `uid` = ? AND `is_deleted` = 0" . ($is_public !== null ? " AND `is_public` = ? " : '') . ($show_lived_level  !== null ? " AND `show_lived_level` = ?" : '');
      $types = 'si';
      $params =  [$mapid, $uid];
      if ($is_public !== null) {
        $types .= "i";
        array_push($params, $is_public);
      }
      if ($show_lived_level !== null) {
        $types .= "i";
        array_push($params, $show_lived_level);
      }
      $result = prepare_bind_execute($sqllink, $sql, $types, $params);
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
      'is_deleted' => 'i',
      'is_public' => 'i',
      'show_lived_level' => 'i',
    ];

    foreach ($fields as $field => $type) {
      if (isset($data->$field)) {
        $update_fields[] = "`$field` = ?";
        if (in_array($field, ['is_deleted', 'is_public', 'show_lived_level'])) {
          $params[] = $data->$field === true ? 1 : 0;
        } else {
          $params[] = $data->$field;
        }
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
