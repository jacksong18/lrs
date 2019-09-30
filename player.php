<?php
    header('Content-type: text/plain; charset=utf-8');
    require_once('db.php');
    $token = $_POST['token'];
    list($username, $avatar_path) = getUserNameAndAvatarPath($token);
    $result = array('username' => $username, 'avatar_path' => $avatar_path);
    echo json_encode($result);

    // return -1 if not match
    function getUserNameAndAvatarPath($token){
        $conn = connectDB();
        $sql = "SELECT username, avatar_path FROM  `user_info` WHERE token = '$token';";
        $result = queryDB($conn, $sql);
        if ($result->num_rows > 0) {
            while($row = $result->fetch_assoc()) {
                $username = $row["username"];
                $avatar_path = $row["avatar_path"];
            }
        }
        closeDB($conn);
        return array($username, $avatar_path);
    }
?>