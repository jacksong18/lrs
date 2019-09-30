<?php
    date_default_timezone_set('Asia/Tokyo');

    $file_name = $_FILES['upload']['name'];
    $file_content = file_get_contents($file_name);
    echo $file_content;
    //$store_file_name = $file_name . date('Ymdhis');
    $fp = fopen('avatar/' . $file_name, 'w');
    fwrite($fp, $file_content);
    fclose($fp);
?>