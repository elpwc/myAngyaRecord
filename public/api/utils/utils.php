<?php

/**
 * 一些php工具方法
 * @author wniko
 */

require dirname(__FILE__) . '/../private/illegal_words_list.php';
require dirname(__FILE__) . '/../plugin/Lib_Smtp.php';
require dirname(__FILE__) . '/../utils/mailSender.php';

/**
 * 防注入
 */
function anti_inj($text)
{
  $res = $text;
  $res = str_replace('\'', '', $res);
  $res = str_replace('"', '', $res);
  $res = str_replace('_', ' ', $res);

  $res = str_ireplace('<script', '<scramble', $res);
  $res = str_ireplace('<object', '<scramble', $res);
  $res = str_ireplace('<style', '<scramble', $res);
  $res = str_ireplace('<iframe', '<scramble', $res);
  $res = str_ireplace('<link', '<scramble', $res);

  return $res;
}

function escape_string($sqllink, $str)
{
  if ($str === null) return null;
  return mysqli_real_escape_string($sqllink, trim((string)$str));
}
function prepare_bind_execute($sqllink, $sql, $types, $params)
{
  $stmt = mysqli_prepare($sqllink, $sql);
  if ($stmt === false) {
    return false;
  }

  if (!empty($params)) {
    mysqli_stmt_bind_param($stmt, $types, ...$params);
  }

  $result = mysqli_stmt_execute($stmt);
  if ($result === false) {
    mysqli_stmt_close($stmt);
    return false;
  }

  // 检查 SQL 语句类型
  $query_type = strtoupper(strtok(trim($sql), " ")); // 获取 SQL 语句的第一个单词
  if ($query_type === "SELECT") {
    $query_result = mysqli_stmt_get_result($stmt);
  } else {
    // 非 SELECT 语句，返回影响的行数
    $query_result = mysqli_stmt_affected_rows($stmt);
  }

  mysqli_stmt_close($stmt);
  return $query_result;
}


/**
 * 和谐
 */
function cator_to_cn_censorship($text)
{
  $res = $text;
  foreach (ILLEGAL_LIST as $word) {
    $res = str_ireplace($word, str_repeat('*', mb_strlen($word)), $res);
  }
  return $res;
}



function send_verification_code_mail($target, $verify_code)
{
  try {
    $mail = new Lib_Smtp();

    $mail->setServer(EMAIL_HOST, EMAIL_USER, EMAIL_PASS, EMAIL_PORT, true);
    $mail->setFrom(EMAIL_MAIL);
    $mail->setReceiver($target);
    $mail->addAttachment("");
    $mail->setMail(
      "邮箱验证码",
      '<h3>验证码是：<span>' . $verify_code . '</span></h3><p>有效期：5分钟</p>' . date('Y-m-d H:i:s')
    );
    return true;
  } catch (Exception $e) {
    return false;
  }
}


function send_verification_mail($target, $verify_code, $isForgetPassword = false)
{
  $url_prefix = 'https://www.elpwc.com/otogemap/';
  $url = $url_prefix . ($isForgetPassword ? ('resetpassword?acc=') : ('register?acc=')) . $target . '&v=' . $verify_code; //'https://www.elpwc.com/otogemap/';

  $res =  sendMail(
    $target,
    "全国引誘地図 ACCOUNT認証",
    '
        <div class="container">
  <style>
    p {
      margin: 0;
    }

    .container {
      padding: 20px;
      display: flex;
      align-items: center;
      gap: 20px;
      flex-direction: column;
      background: #f0f0f0;
      border: 2px solid;
      border-color: #d6d6d6 #808080 #808080 #d6d6d6;
      box-shadow: 1px 1px 0 0 #000000;
    }

    .retro-button {
      background-color: rgb(247, 247, 247);
      border-left-color: rgb(212, 212, 212);
      border-top-color: rgb(212, 212, 212);
      border-right-color: #505050;
      border-bottom-color: #505050;
      border-width: 3px;
      border-style: solid;
    }

    @media (any-hover: hover) {
      .retro-button:hover {
        border-left-width: 2px;
        border-top-width: 2px;
        border-right-width: 4px;
        border-bottom-width: 4px;
      }
    }

    .retro-button:active {
      border-left-width: 4px;
      border-top-width: 4px;
      border-right-width: 2px;
      border-bottom-width: 2px;
      border-left-color: #505050;
      border-top-color: #505050;
      border-right-color: rgb(212, 212, 212);
      border-bottom-color: rgb(212, 212, 212);
      background-color: rgb(241, 241, 241);
    }

    .button {
      color: black;
      text-align: center;
      text-decoration: none;
      display: inline-block;
      font-size: 16px;
      margin: 10px 0;
      cursor: pointer;
      padding: 10px 20px;
      width: auto;
    }

    .text {
      font-size: 16px;
      margin: 10px 0;
      text-align: center;
      color: #333;
    }

    .header {
      font-size: 20px;
      font-weight: bold;
      color: #333;
      text-align: center;
      margin-bottom: 20px;
      width: 100%;
      border-bottom: solid 1px #dcdcdc;
    }
  </style>
  <div class="header">
    <p>Otogemap - 全国引誘地図<br />ACCOUNT認証</p>
  </div>
  <p class="text">' . ($isForgetPassword ? '下之「ACCOUNT認証」link訪問後、PASSWORD RESET可能：<br /><br />
    Click the link below to reset your password:' : '全国引誘地図之ACCOUNT作成大感謝謝謝茄子！<br />
    下之「ACCOUNT認証」link訪問後、ACCOUNT作成完了：<br /><br />
    Click the link below to complete your registration:') . '
  </p>
  <a class="button retro-button" href="' . $url . '" target="_blank">ACCOUNT認証</a>
  <p style="color: rgb(0, 0, 0)">' . date('Y-m-d H:i:s') . '</p>
  <p style="font-size: 10px; color: rgb(155, 155, 155);width: 100%; overflow-wrap: break-word;">Button URL: ' . $url . '</p>
</div>
        '
  );
  if ($res) {
    return true;
  } else {
    return false;
  }

  // $url_prefix = 'http://localhost:3001/';
  // $url = $url_prefix . 'registercomp?acc=' . $target . '&v=' . $verify_code; //'https://www.elpwc.com/otogemap/';
  // try {
  //     $mail = new Lib_Smtp();

  //     $mail->setServer(EMAIL_HOST, EMAIL_USER, EMAIL_PASS, EMAIL_PORT, true);
  //     $mail->setFrom(EMAIL_MAIL);
  //     $mail->setReceiver($target);
  //     $mail->addAttachment("");
  //     $mail->setMail(
  //         "全国引誘地図 ACCOUNT認証",
  //         '<p>
  //         下之「ACCOUNT認証」link訪問後、ACCOUNT作成完了：<br/>
  //         Click the link below to complete your registration:
  //         </p><br/>
  //         <a href="' . $url . '" target="_blank"><h1> ACCOUNT認証 </h1></a><br/>
  //         ' . date('Y-m-d H:i:s')
  //     );
  //     if($mail->send()){
  //         error_log('114');
  //         return true;
  //     }else{
  //         error_log('514');
  //         return false;
  //     }
  // } catch (Exception $e) {
  //     error_log($e->getMessage());
  // }
}
