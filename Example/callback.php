<?php
session_start();

if ($_SESSION['finishQueue'] === true) {
    echo 'Finish queue, start request';
    return;
}

if (!isset($_GET['uuid']) || !isset($_GET['vc'])) {
    echo 'Invalid callback: Missing uuid/vc';
    return;
}

// required
$access_token = "";
$verifyURL = "";

$ch = curl_init();
curl_setopt($ch, CURLOPT_URL, $verifyURL);
curl_setopt($ch, CURLOPT_POST, 1);
curl_setopt($ch, CURLOPT_POSTFIELDS, "uuid=" . $_GET['uuid'] . "&vc=" . $_GET['vc']);
curl_setopt($ch, CURLOPT_HTTPHEADER, array('authorization: Bearer ' . $access_token));
curl_exec($ch);

if (curl_getinfo($ch, CURLINFO_HTTP_CODE) === 200) {
    $_SESSION['finishQueue'] = true;
    echo 'Valid callback';
} else {
    echo 'Invalid callback: Invalid uuid/vc';
}

curl_close($ch);
