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

    // 检查是否存在相同的记录
    $check_sql = "SELECT * FROM `record` WHERE `admin_id` = ? AND `group_id` = ?";
    $check_params = [
      escape_string($sqllink, $data->admin_id),
      (int)($data->group_id),
    ];
    $check_result = prepare_bind_execute($sqllink, $check_sql, "si", $check_params);

    if ($check_result && mysqli_num_rows($check_result) > 0) {
      // 如果记录存在，更新level值
      $update_sql = "UPDATE `record` SET `level` = ? WHERE `admin_id` = ? AND `group_id` = ?";
      $update_params = [
        (int)($data->level),
        escape_string($sqllink, $data->admin_id),
        (int)($data->group_id)
      ];
      $update_result = prepare_bind_execute($sqllink, $update_sql, "isi", $update_params);
      echo json_encode(["res" => $update_result !== false ? "ok" : "error"]);
    } else {
      // 如果记录不存在，插入新记录
      $insert_sql = "INSERT INTO `record` ( `admin_id`, `group_id`, `level`) VALUES (?, ?, ?)";
      $insert_params = [
        escape_string($sqllink, $data->admin_id),
        (int)($data->group_id),
        (int)($data->level)
      ];
      $insert_result = prepare_bind_execute($sqllink, $insert_sql, "sii", $insert_params);
      echo json_encode(["res" => $insert_result !== false ? "ok" : "error"]);
    }
    break;

  case 'GET':
    if (!token_check()) {
      echo json_encode(["res" => "token_error", "records" => []]);
      return;
    }
    $id = isset($_GET['id']) ? escape_string($sqllink, $_GET['id']) : null;
    $group_id = isset($_GET['group_id']) ? escape_string($sqllink, $_GET['group_id']) : null;

    if ($id) {
      $sql = "SELECT * FROM `record` WHERE `id` = ? AND `is_deleted` = 0";
      $result = prepare_bind_execute($sqllink, $sql, "i", [$id]);
    } else if ($group_id) {
      $sql = "SELECT r.*, g.name as group_name, g.uid 
              FROM `record` r
              JOIN `recordgroup` g ON r.group_id = g.id
              WHERE r.group_id = ? AND r.is_deleted = 0";
      $result = prepare_bind_execute($sqllink, $sql, "i", [$group_id]);
    } else {
      return;
    }

    if ($result && mysqli_num_rows($result) >= 0) {
      $records = [];
      while ($row = mysqli_fetch_assoc($result)) {
        $records[] = $row;
      }
      echo json_encode(["res" => "ok", "records" => $records]);
    } else {
      echo json_encode(["res" => "not_exist", "records" => []]);
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
      'mapid' => 's',
      'admin_id' => 's',
      'uid' => 'i',
      'level' => 'i',
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

      $sql = "UPDATE `record` SET " . implode(', ', $update_fields) . " WHERE `id` = ?";
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
    $sql = "UPDATE `record` SET `is_deleted` = 1 WHERE `id` = ?";
    $result = prepare_bind_execute($sqllink, $sql, "s", [$id]);
    echo json_encode(["res" => $result !== false ? "ok" : "error"]);
    break;
}
