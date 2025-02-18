<?php
header("Access-Control-Allow-Origin: http://localhost:3000");
// header("Access-Control-Allow-Origin: http://localhost:3001");
// header("Access-Control-Allow-Methods: GET, POST, PATCH, DELETE, OPTIONS");
// header("Access-Control-Allow-Headers: X-Requested-With, Content-Type, Authorization");
//header('Access-Control-Allow-Origin: https://www.elpwc.com/');
header('Access-Control-Allow-Credentials: true');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, PATCH, OPTIONS');
    header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Authorization');
    header('Access-Control-Max-Age: 86400'); // 24小时
    exit(0);
}

header('Content-Type: application/json; charset=utf-8');
