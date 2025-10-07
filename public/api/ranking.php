<?php
@require dirname(__FILE__) . '/private/dbcfg.php';
@require dirname(__FILE__) . '/utils/utils.php';
@require dirname(__FILE__) . '/utils/sqlgenerator.php';
@require dirname(__FILE__) . '/utils/cors.php';
@require dirname(__FILE__) . '/user/token.php';

session_start();

$request_type = $_SERVER['REQUEST_METHOD'];
$json = file_get_contents('php://input');
$data = json_decode($json);

$sqllink = @mysqli_connect(HOST, USER, PASS, DBNAME) or die('Link to database failed');
mysqli_set_charset($sqllink, 'utf8mb4');

switch ($request_type) {
  case 'GET':
    @$mapid = isset($_GET['mapid']) ? escape_string($sqllink, $_GET['mapid']) : null;
    @$page = isset($_GET['page']) ? escape_string($sqllink, $_GET['page']) : 1;
    @$amountPerPage = isset($_GET['amount']) ? escape_string($sqllink, $_GET['amount']) : null;

    $sql = "SELECT 
              rg.*, 
              u.name AS username,
              u.avatar_url,
              u.hitokoto,
              RANK() OVER (ORDER BY score DESC) AS ranking
            FROM 
              `recordgroup` AS rg
            JOIN 
              `User` AS u ON rg.uid = u.id
            WHERE 
              rg.mapid = ? 
              AND rg.is_deleted = 0 
              AND rg.is_public = 1
            ORDER BY 
              rg.score DESC
            LIMIT ? OFFSET ?;";

    $offset = ($page - 1) * $amountPerPage;
    $result = prepare_bind_execute($sqllink, $sql, "sii", [$mapid, $amountPerPage, $offset]);

    $count_sql = "SELECT 
                    COUNT(*) AS total
                  FROM 
                    `recordgroup`
                  WHERE 
                    mapid = ? 
                    AND is_deleted = 0 
                    AND is_public = 1;";
    $count_result = prepare_bind_execute($sqllink, $count_sql, "s", [$mapid]);

    if ($result && mysqli_num_rows($result) >= 0) {
      $ranking = [];
      while ($row = mysqli_fetch_assoc($result)) {
        $ranking[] = $row;
      }

      if ($count_result && mysqli_num_rows($count_result) >= 0) {
        $total = 0;
        while ($row = mysqli_fetch_assoc($count_result)) {
          $total = $row['total'];
        }

        echo json_encode(
          [
            "res" => "ok",
            "rankingResponse" =>
            [
              "ranking" => $ranking,
              "total" => $total
            ]
          ]
        );
      }
    } else {
      echo json_encode(
        [
          "res" => "not_exist",
          "rankingResponse" =>
          [
            "ranking" => [],
            "total" => 0
          ]
        ]
      );
    }
    break;
}
