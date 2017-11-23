<?php
const NOTIFICATIONS_EMAIL = 'mail@example.com';
const THANKYOU_PAGE = '';

error_reporting(0);
ignore_user_abort(true);

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $id = time();
    $input = json_decode(file_get_contents('php://input'), true);
    $url = $_SERVER['HTTP_REFERER'];
    $domain = $url ? preg_split("/[?\/]/", $url, -1, PREG_SPLIT_NO_EMPTY)[1] : '';
    $emailSubject = 'Заявка с сайта ' . $domain;
    $emailBody = '<html><body><ul>';
    $emailBody .= sprintf('<li>ID: %s</li>', $id);
    foreach ($input as $field) {
        $emailBody .= sprintf('<li>%s: %s</li>', $field['name'], $field['value']);
    }
    $emailBody .= sprintf('<li>URL: %s</li>', $url);
    $emailBody .= '</ul></body></html>';
    try {
        mail(NOTIFICATIONS_EMAIL, $emailSubject, $emailBody, implode("\r\n", [
            "MIME-Version: 1.0",
            "Content-type: text/html; charset=utf-8"
        ]));
    } catch (Exception $e) {
        error_log('Fail to send notification email: ' . $e, 0);
    }
    if (defined('THANKYOU_PAGE') && THANKYOU_PAGE != '') {
        $redirectURLSplitted = explode('?', THANKYOU_PAGE, 2);
        $redirectURL = $redirectURLSplitted[0] . '?id=' . $id;
        if (count($redirectURLSplitted) > 1) $redirectURL .= '&' . $redirectURLSplitted[1];
        header("Content-Type: application/json; charset=utf-8");
        echo json_encode(['redirectURL' => $redirectURL]);
    }
} else {
    header("HTTP/1.0 405 Method Not Allowed");
}