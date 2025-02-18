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
    $sql = "INSERT INTO `store` 
            (`type`, `name`, `desc`, `address`, `mapURL`, `country`,
            `adminlv1`, `adminlv2`, `adminlv3`, `adminlv4`, `adminlv5`,
            `arcade_amount`, `business_hours_start`, `business_minute_start`,
            `business_hours_end`, `business_minute_end`, `reviewed`, `lng`, `lat`)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";

    $params = [
      escape_string($sqllink, $data->type),
      escape_string($sqllink, $data->name),
      escape_string($sqllink, $data->desc),
      escape_string($sqllink, $data->address),
      escape_string($sqllink, $data->mapURL),
      escape_string($sqllink, $data->country),
      escape_string($sqllink, $data->adminlv1),
      escape_string($sqllink, $data->adminlv2),
      escape_string($sqllink, $data->adminlv3),
      escape_string($sqllink, $data->adminlv4),
      escape_string($sqllink, $data->adminlv5),
      (int)($data->arcade_amount),
      (int)($data->business_hours_start),
      (int)($data->business_minute_start),
      (int)($data->business_hours_end),
      (int)($data->business_minute_end),
      (int)($data->reviewed),
      (float)($data->lng),
      (float)($data->lat)
    ];

    $result = prepare_bind_execute($sqllink, $sql, "sssssssssssiiiiiidd", $params);
    echo json_encode(["res" => $result !== false ? "ok" : "error"]);
    break;
  case 'GET':
    $id = isset($_GET['id']) ? escape_string($sqllink, $_GET['id']) : null;
    $include_arcade = isset($_GET['include_arcade']) ? (bool)$_GET['include_arcade'] : false;

    // 街机相关筛选
    $arcade_type = isset($_GET['arcade_type']) ? escape_string($sqllink, $_GET['arcade_type']) : null;
    $version_type = isset($_GET['version_type']) ? escape_string($sqllink, $_GET['version_type']) : null;

    // 店铺属性筛选
    $store_type = isset($_GET['type']) ? escape_string($sqllink, $_GET['type']) : null;
    $area = isset($_GET['area']) ? escape_string($sqllink, $_GET['area']) : null;
    $country = isset($_GET['country']) ? escape_string($sqllink, $_GET['country']) : null;
    $adminlv1 = isset($_GET['adminlv1']) ? escape_string($sqllink, $_GET['adminlv1']) : null;
    $business_hours_start = isset($_GET['business_hours_start']) ? (int)$_GET['business_hours_start'] : null;
    $business_minute_start = isset($_GET['business_minute_start']) ? (int)$_GET['business_minute_start'] : null;
    $business_hours_end = isset($_GET['business_hours_end']) ? (int)$_GET['business_hours_end'] : null;
    $business_minute_end = isset($_GET['business_minute_end']) ? (int)$_GET['business_minute_end'] : null;

    // 搜索关键词
    $search = isset($_GET['search']) ? escape_string($sqllink, $_GET['search']) : null;
    // 添加uid参数
    $uid = isset($_GET['uid']) ? escape_string($sqllink, $_GET['uid']) : null;

    if ($id) {
      // 获取单个商店信息
      $sql = "SELECT DISTINCT s.*, 
              CASE WHEN c.id IS NOT NULL THEN 1 ELSE 0 END as is_collection 
              FROM `store` s 
              LEFT JOIN `arcade` a ON s.id = a.sid 
              LEFT JOIN `collection` c ON s.id = c.store_id AND c.is_deleted = 0";

      if ($uid) {
        $sql .= " AND c.uid = ?";
      }

      $sql .= " WHERE s.id = ? AND s.is_deleted = 0";

      $params = [];
      $types = "";

      if ($uid) {
        $params[] = $uid;
        $types .= "s";
      }
      $params[] = $id;
      $types .= "s";

      // 添加街机筛选条件
      if ($arcade_type) {
        $sql .= " AND a.type = ? AND a.is_deleted = 0";
        $params[] = $arcade_type;
        $types .= "s";
      }
      if ($version_type) {
        $sql .= " AND a.version_type = ? AND a.is_deleted = 0";
        $params[] = $version_type;
        $types .= "s";
      }

      $result = prepare_bind_execute($sqllink, $sql, $types, $params);
      // ... 后续处理与之前相同 ...

    } else {
      // 获取所有符合条件的商店列表
      $sql = "SELECT DISTINCT s.*, 
              CASE WHEN c.id IS NOT NULL THEN 1 ELSE 0 END as is_collection 
              FROM `store` s 
              LEFT JOIN `arcade` a ON s.id = a.sid 
              LEFT JOIN `collection` c ON s.id = c.store_id AND c.is_deleted = 0";

      if ($uid) {
        $sql .= " AND c.uid = ?";
      }

      $sql .= " WHERE s.is_deleted = 0";

      $params = [];
      $types = "";

      if ($uid) {
        $params[] = $uid;
        $types .= "s";
      }

      // 添加街机筛选条件
      if ($arcade_type) {
        $sql .= " AND a.type = ? AND a.is_deleted = 0";
        $params[] = $arcade_type;
        $types .= "s";
      }
      if ($version_type) {
        $sql .= " AND a.version_type = ? AND a.is_deleted = 0";
        $params[] = $version_type;
        $types .= "s";
      }

      // 添加店铺属性筛选条件
      if ($store_type) {
        $sql .= " AND s.type = ?";
        $params[] = $store_type;
        $types .= "s";
      }
      if ($area) {
        if ($area === 'ja') {
          $sql .= " AND s.country = 'Japan'";
        } else {
          $sql .= " AND s.country != 'Japan'";
        }
        $params[] = $country;
        $types .= "s";
      }
      if ($country) {
        $sql .= " AND s.country = ?";
        $params[] = $country;
        $types .= "s";
      }
      if ($adminlv1) {
        $sql .= " AND s.adminlv1 = ?";
        $params[] = $adminlv1;
        $types .= "s";
      }
      if ($business_hours_start !== null) {
        $sql .= " AND s.business_hours_start <= ?";
        $params[] = $business_hours_start;
        $types .= "i";
      }
      if ($business_minute_start !== null) {
        $sql .= " AND s.business_minute_start <= ?";
        $params[] = $business_minute_start;
        $types .= "i";
      }
      if ($business_hours_end !== null) {
        $sql .= " AND s.business_hours_end >= ?";
        $params[] = $business_hours_end;
        $types .= "i";
      }
      if ($business_minute_end !== null) {
        $sql .= " AND s.business_minute_end >= ?";
        $params[] = $business_minute_end;
        $types .= "i";
      }

      // 添加搜索条件
      if ($search) {
        $search_condition = [];
        $search_fields = [
          'name',
          'desc',
          'address',
          'country',
          'adminlv1',
          'adminlv2',
          'adminlv3',
          'adminlv4',
          'adminlv5'
        ];

        foreach ($search_fields as $field) {
          $search_condition[] = "s.`$field` LIKE ?";
          $params[] = "%$search%";
          $types .= "s";
        }

        if (!empty($search_condition)) {
          $sql .= " AND (" . implode(" OR ", $search_condition) . ")";
        }
      }

      $result = prepare_bind_execute($sqllink, $sql, $types, $params);

      if ($result && mysqli_num_rows($result) > 0) {
        $stores = [];
        while ($store = mysqli_fetch_assoc($result)) {
          if ($include_arcade) {
            // 获取每个店铺的街机信息
            $arcade_sql = "SELECT * FROM `arcade` WHERE sid = ? AND is_deleted = 0";
            $arcade_params = [$store['id']];
            $arcade_types = "s";

            if ($arcade_type) {
              $arcade_sql .= " AND type = ?";
              $arcade_params[] = $arcade_type;
              $arcade_types .= "s";
            }
            if ($version_type) {
              $arcade_sql .= " AND version_type = ?";
              $arcade_params[] = $version_type;
              $arcade_types .= "s";
            }

            $arcade_result = prepare_bind_execute($sqllink, $arcade_sql, $arcade_types, $arcade_params);

            $arcades = [];
            while ($arcade_result && $arcade = mysqli_fetch_assoc($arcade_result)) {
              $arcades[] = $arcade;
            }
            $store['arcades'] = $arcades;
          }
          $stores[] = $store;
        }
        echo json_encode(["res" => "ok", "stores" => $stores]);
      } else {
        echo json_encode(["res" => "not_exist",  "stores" => []]);
      }
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
      'name' => 's',
      'desc' => 's',
      'address' => 's',
      'mapURL' => 's',
      'country' => 's',
      'adminlv1' => 's',
      'adminlv2' => 's',
      'adminlv3' => 's',
      'adminlv4' => 's',
      'adminlv5' => 's',
      'arcade_amount' => 'i',
      'business_hours_start' => 'i',
      'business_minute_start' => 'i',
      'business_hours_end' => 'i',
      'business_minute_end' => 'i',
      'lng' => 'd',
      'lat' => 'd',
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

      $sql = "UPDATE `store` SET " . implode(', ', $update_fields) . " WHERE `id` = ?";
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
    $sql = "UPDATE `store` SET `is_deleted` = 1 WHERE `id` = ?";
    $result = prepare_bind_execute($sqllink, $sql, "s", [$id]);
    echo json_encode(["res" => $result !== false ? "ok" : "error"]);
    break;
}
