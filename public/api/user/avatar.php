<?php
require dirname(__FILE__) . '/../private/dbcfg.php';
require dirname(__FILE__) . '/../private/admin.php';
require dirname(__FILE__) . '/../utils/utils.php';
require dirname(__FILE__) . '/../utils/sqlgenerator.php';
require dirname(__FILE__) . '/../utils/cors.php';
require dirname(__FILE__) . '/token.php';

session_start();

$request_type = $_SERVER['REQUEST_METHOD'];
$json = file_get_contents('php://input');
$data = json_decode($json);

$sqllink = @mysqli_connect(HOST, USER, PASS, DBNAME) or die('Link to database failed');
mysqli_set_charset($sqllink, 'utf8mb4');

switch ($request_type) {
  case 'POST':
    $id = $_POST['id'] ?? null;

    error_log(json_encode($_POST));
    error_log(json_encode($_FILES));

    if (!$id || !isset($_FILES['avatar'])) {
      echo json_encode(["res" => "missing_params"]);
      exit;
    }

    $file = $_FILES['avatar'];
    if ($file['error'] !== UPLOAD_ERR_OK) {
      echo json_encode(["res" => "upload_error"]);
      exit;
    }

    // filename gen
    $ext = pathinfo($file['name'], PATHINFO_EXTENSION);
    if (!$ext) {
      $ext = 'jpg';
    }
    $filename = uniqid("avatar_") . "." . $ext;

    $uploadDir = __DIR__ . "/uploads/avatars/";
    if (!is_dir($uploadDir)) {
      mkdir($uploadDir, 0777, true);
    }

    $filepath = $uploadDir . $filename;

    if (!move_uploaded_file($file['tmp_name'], $filepath)) {
      echo json_encode(["res" => "save_failed"]);
      exit;
    }

    $avatarUrl = "/uploads/avatars/" . $filename;


    $sql = "UPDATE user SET avatar_url = ? WHERE id = ?";
    $result = prepare_bind_execute($sqllink, $sql, "si", [$avatarUrl, $id]);


    $sql = "SELECT id, name, avatar_url, create_date FROM user WHERE id = ?";
    $result = prepare_bind_execute($sqllink, $sql, "i", [$id]);
    $user = mysqli_fetch_assoc($result);

    echo json_encode([
      "res" => "ok",
      "user" => $user
    ]);
    exit;
    break;

  default:
    break;
}
