<?php
require dirname(__FILE__) . '/../private/emailcfg.php';
require dirname(__FILE__) . '/../../vendor/autoload.php';

use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\SMTP;
use PHPMailer\PHPMailer\Exception;

function sendMail($addr, $subject, $body)
{
  $mail = new PHPMailer(true);

  try {
    // 配置 SMTP
    $mail->SMTPDebug = SMTP::DEBUG_SERVER;
    $mail->isSMTP();
    $mail->Host = EMAIL_HOST;
    $mail->SMTPAuth = true;
    $mail->Username = EMAIL_USER;
    $mail->Password = EMAIL_PASS;
    $mail->SMTPSecure = PHPMailer::ENCRYPTION_SMTPS;
    $mail->Port = EMAIL_PORT;
    $mail->CharSet = 'UTF-8';
    $mail->Encoding = 'base64';

    // 邮件信息
    $mail->setFrom(EMAIL_USER, 'elpwc.com');
    $mail->addAddress($addr);
    $mail->isHTML(true);
    $mail->Subject = $subject;
    $mail->Body = $body;

    // 发送
    $mail->SMTPDebug = SMTP::DEBUG_OFF;
    $res = $mail->send();

    return $res;
  } catch (Exception $e) {
    return false;
  }
}
