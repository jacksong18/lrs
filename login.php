<?php
    header('Content-type: text/plain; charset=utf-8');
    require_once('db.php');
    // expire in 24 hours
    $token_expire = 3600 * 24;
    $username = html_entity_decode($_POST['form_username']);
    $password = html_entity_decode($_POST['form_password']);
    $token = getToken($username, $password);
    if($token != -1) {
        setcookie('token', $token, time() + $token_expire);
        header("Location: http://www.logo-labo.com/lrs/player.html");
    } else {
        echo "朋友密码不对 重新登录！";
    }

    // return -1 if not match
    function getToken($username, $password){
        $token = -1;
        $conn = connectDB();
        $sql = "SELECT token FROM  `user_info` WHERE username = '$username' AND password = '$password';";
        $result = queryDB($conn, $sql);
        if ($result->num_rows > 0) {
            while($row = $result->fetch_assoc()) {
                $token = $row["token"];
            }
        }
        closeDB($conn);
        return $token;
    }
?>