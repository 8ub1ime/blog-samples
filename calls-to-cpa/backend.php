<?php

error_reporting(0);
ignore_user_abort(true);

const NOTIFICATIONS_EMAIL = 'email@example.com';
const M1_USER_ID = 'YOUR M1 USER ID HERE';
const M1_USER_KEY = 'YOUR M1 API KEY HERE';

function httpRequest(string $url, string $method, array $headers = [], array $data = NULL): array
{
    $curl = curl_init();
    curl_setopt($curl, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($curl, CURLOPT_USERAGENT, 'blog.biscripter.ru sample API Client');
    curl_setopt($curl, CURLOPT_URL, $url);
    curl_setopt($curl, CURLOPT_HEADER, false);
    curl_setopt($curl, CURLOPT_SSL_VERIFYPEER, 0);
    curl_setopt($curl, CURLOPT_SSL_VERIFYHOST, 0);
    curl_setopt($curl, CURLOPT_CUSTOMREQUEST, $method);
    if ($method == 'POST') {
        $headers [] = 'Content-Type: application/x-www-form-urlencoded';
        curl_setopt($curl, CURLOPT_POSTFIELDS, http_build_query($data));
    }
    curl_setopt($curl, CURLOPT_HTTPHEADER, $headers);
    $result = curl_exec($curl);
    if ($result === false) {
        throw new Exception('httpRequest failed: ' . curl_error($curl));
    }
    $responseBody = json_decode($result, true);
    $responseStatus = curl_getinfo($curl, CURLINFO_HTTP_CODE);
    curl_close($curl);
    if ($responseStatus != 200) {
        throw new Exception('httpRequest failed: ' . print_r($responseBody));
    }
    return $responseBody;
}

function sendToM1(array $data): int
{
    $response = httpRequest('https://m1-shop.ru/send_order/', 'POST', [], $data);
    if ($response['result'] == 'error') {
        throw new Exception('Fail to send lead to M1: ' . $response['message']);
    }
    return (int)$response['id'];
}

function sendEmail(string $email, array $data): void
{
    $emailBody = '<html><body><ul>';
    if ($data['id']) {
        $emailBody .= sprintf('<li>ID заказа в M1: %d</li>', $data['id']);
    }
    $emailBody .= sprintf('<li>Телефон: %s</li>', $data['phone']);
    $emailBody .= sprintf('<li>URL: %s</li>', $data['referer']);
    $emailBody .= '</ul></body></html>';
    $domain = $data['referer'] ? preg_split("/[?\/]/", $data['referer'], -1, PREG_SPLIT_NO_EMPTY)[1] : '';
    mail($email, 'Заявка с сайта ' . $domain, $emailBody, implode("\r\n", [
        "MIME-Version: 1.0",
        "Content-type: text/html; charset=utf-8"
    ]));
}

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $input = json_decode(file_get_contents('php://input'), true);
    if ($input['phone'] == '' || $input['product_id'] == '') {
        header("HTTP/1.0 400 Bad request");
        return;
    }
    if ($input['mobile']) return; // Не обрабатываем ботовые заявки
    $data = [
        'referer' => $_SERVER['HTTP_REFERER'],
        'phone' => $input['phone'],
        'name' => $input['name'] ? $input['name'] : $input['phone'],
        'ip' => $_SERVER['REMOTE_ADDR'],
        'ref' => M1_USER_ID,
        'api_key' => M1_USER_KEY,
        'product_id' => $input['product_id']
    ];

    // Передаем заявку в M1-Shop
    try {
        $data['id'] = sendToM1($data);
    } catch (Exception $e) {
        error_log('Fail to send order to M1: ' . $e, 0);
    }

    // Отправляем заявку себе на email
    try {
        sendEmail(NOTIFICATIONS_EMAIL, $data);
    } catch (Exception $e) {
        error_log('Fail to send notification email: ' . $e, 0);
    }
} else {
    header("HTTP/1.0 405 Method Not Allowed");
    return;
}