<?php

/**
 * 一些php工具方法
 * @author wniko
 */

require dirname(__FILE__) . '/../private/illegal_words_list.php';
require dirname(__FILE__) . '/../utils/mailSender.php';
require dirname(__FILE__) . '/../private/admin.php';

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


function send_verification_mail($target, $verify_code, $isForgetPassword = false)
{
  $url_prefix = SITEBASEURL;
  $url = $url_prefix . ($isForgetPassword ? ('/resetpassword?acc=') : ('/register?acc=')) . $target . '&v=' . $verify_code;

  $res =  sendMail(
    $target,
    "My行脚記録 ACCOUNT認証",
    '
<div class="container">
  <style>
    p {
      margin: 0;
    }

    .container {
      background: white;
      box-shadow: 0 0 7px 1px rgba(0, 0, 0, 0.1);
      border-color: rgb(173, 173, 173);
      border-width: 1px;
      border-style: solid;
      border-radius: 5px;
      padding: 20px;
      display: flex;
      flex-direction: column;
      gap: 16px;
      height: fit-content;
      align-items: center;
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
      background-color: white;
      border-color: rgb(132, 132, 132);
      border-radius: 3px;
      border-width: 1px;
      border-style: solid;
    }

    .text {
      font-size: 16px;
      margin: 10px 0;
      text-align: center;
      color: #333;
    }
  </style>
  <p class="text">' . ($isForgetPassword ? '下の「アカウント認証」をクリックして、パスワード再設定してください：<br /><br />
    Click the link below to reset your password:' : 'My行脚記録を使っていただいてありがとうございます！<br />
    下の「アカウント認証」をクリックして、アカウント作成を完成してください：<br /><br />
    Click the link below to complete your registration:') . '
  </p>
  <a class="button" href="' . $url . '" target="_blank">アカウント認証</a><br /><br />
  <p style="color: rgb(0, 0, 0)">' . date('Y-m-d H:i:s') . '</p><br />
  <p style="font-size: 10px; color: rgb(155, 155, 155);width: 100%; overflow-wrap: break-word;">
  上のボタンが使えなければ、ここのURLをお使いください（If the button above cannot be used, please use this link）: <br/>
  <a href="' . $url . '">' . $url . '</a>
  </p>
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
