<?php

const NOTIFICATIONS_EMAIL = 'admin@example.com';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $input = json_decode(file_get_contents('php://input'), true);
    if ($input['phone'] == '') {
        header("HTTP/1.0 404 Bad request");
        return;
    }
    if ($input['mobile']) return; // Не обрабатываем ботовые заявки
    $referer = $_SERVER['HTTP_REFERER'];
    $domain = $referer ? preg_split("/[?\/]/", $referer, -1, PREG_SPLIT_NO_EMPTY)[1] : '';
    try {
        $emailBody = '<html><body><ul>';
        $emailBody .= sprintf('<li>Телефон: %s</li>', $input['phone']);
        $emailBody .= sprintf('<li>URL: %s</li>', $referer);
        $emailBody .= '</ul></body></html>';
        mail(NOTIFICATIONS_EMAIL, 'Заявка с сайта ' . $domain, $emailBody, implode("\r\n", [
            "MIME-Version: 1.0",
            "Content-type: text/html; charset=utf-8"
        ]));
    } catch (Exception $e) {
        error_log('Fail to send notification email: ' . $e, 0);
    }
} else {
    header("HTTP/1.0 405 Method Not Allowed");
    return;
}