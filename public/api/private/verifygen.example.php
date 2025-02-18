<?php

function generate_verification_code($email)
{
  $token = '0';
  return substr(md5($token . $email), 0, 16);
}

function gen_token($email, $expirationTime_sec = 3600,) {}

function verifyToken($token) {}
