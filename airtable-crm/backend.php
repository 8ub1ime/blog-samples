<?php

error_reporting(0);
ignore_user_abort(true);

const NOTIFICATIONS_EMAIL = 'ivan@exampla.com';
const AIRTABLE_BASE_URL = 'https://api.airtable.com/v0/APPLICATION_ID/';
const AIRTABLE_KEY = 'AIRTABLE_API_KEY';

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
        $headers [] = 'Content-Type: application/json';
        curl_setopt($curl, CURLOPT_POSTFIELDS, json_encode($data));
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

function findAirtableItem(string $tableName, string $filter): array
{
    $URL = AIRTABLE_BASE_URL . urlencode($tableName) . '?filterByFormula=' . urlencode($filter);
    return httpRequest($URL, 'GET', ['Authorization: Bearer ' . AIRTABLE_KEY]);
}

function createAirtableItem(string $tableName, array $data): array
{
    $URL = AIRTABLE_BASE_URL . urlencode($tableName);
    return httpRequest($URL, 'POST', ['Authorization: Bearer ' . AIRTABLE_KEY], $data);
}

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $input = json_decode(file_get_contents('php://input'), true);
    if ($input['phone'] == '') {
        header("HTTP/1.0 404 Bad request");
        return;
    }
    $referer = $_SERVER['HTTP_REFERER'];
    $domain = $referer ? preg_split("/[?\/]/", $referer, -1, PREG_SPLIT_NO_EMPTY)[1] : '';

    // Сначала отправляем уведомление на email
    try {
        $emailSubject = isset($input['callRecordURL'])
            ? 'Входящий звонок от ' . $input['phone']
            : 'Заявка с сайта ' . $domain;
        $emailBody = '<html><body><ul>';
        if ($input['name'] != '') $emailBody .= sprintf('<li>Имя: %s</li>', $input['name']);
        $emailBody .= sprintf('<li>Телефон: %s</li>', $input['phone']);
        if (isset($input['callRecordURL'])) {
            $emailBody .= sprintf('<li>Запись: <a href="%1$s">%1$s</a></li>', $input['callRecordURL']);
        } else {
            $emailBody .= sprintf('<li>URL: %s</li>', $referer);
        }
        $emailBody .= '</ul></body></html>';
        mail(NOTIFICATIONS_EMAIL, $emailSubject, $emailBody, implode("\r\n", [
            "MIME-Version: 1.0",
            "Content-type: text/html; charset=utf-8"
        ]));
    } catch (Exception $e) {
        error_log('Fail to send notification email: ' . $e, 0);
    }

    // Проверяем, существует ли контакт с таким же номером телефона
    $response = findAirtableItem('Контакты', '{Телефон}="' . $input['phone'] . '"');
    $contact = $response['records'] ? $response['records'][0] : [];

    // Если нет, создаем новый
    if (!$contact) {
        $contact = createAirtableItem('Контакты', ['fields' => [
            'Имя' => $input['name'] ? $input['name'] : $input['phone'],
            'Телефон' => $input['phone']
        ]]);
    }

    // И, наконец, создаем заказ
    $parts = parse_url($referer);
    parse_str($parts['query'], $query);
    createAirtableItem('Заказы', ['fields' => [
        'Дата' => date('Y-m-d'),
        'Контакт' => [$contact['id']],
        'Статус' => 'Новый',
        'utm_medium' => $query['utm_medium'],
        'utm_source' => $query['utm_source'],
        'utm_campaign' => $query['utm_campaign'],
        'utm_term' => $query['utm_term'],
        'utm_content' => $query['utm_content'],
        'Примечание' => isset($input['callRecordURL'])
            ? 'Входящий звонок. Запись: ' . $input['callRecordURL']
            : 'Заявка с сайта. URL: ' . $referer
    ]]);
} else {
    header("HTTP/1.0 405 Method Not Allowed");
    return;
}