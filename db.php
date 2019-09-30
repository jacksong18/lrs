<?php
function connectDB(){
    $servername = "localhost";
    $username = "***";
    $password = "*******";
    $dbname = "***";
    
    $conn = new mysqli($servername, $username, $password, $dbname);
    
    if ($conn->connect_error) {
        die("连接失败: " . $conn->connect_error);
    } 
    // !!! 这行重要！！！ 不执行会乱码！
    $conn->query("set names 'utf8'");
    return $conn;
}

function queryDB($conn, $sql){
    return $conn->query($sql);
}

function closeDB($conn){
    $conn->close();
}
?>
