<?php
session_start();

// required
$queueURL = "";

if ($_SESSION['finishQueue'] === true) {
    echo 'Finish queue, start request';
} else {
    header("Location: " . $queueURL);
}
