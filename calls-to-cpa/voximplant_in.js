const NOTIFICATIONS_EMAIL = 'email@example.com';
const M1_USER_ID = 'YOUR M1 USER ID HERE';
const M1_USER_KEY = 'YOUR M1 API HEY HERE';
const M1_PRODUCT_ID = 4664; // ID оффера в M1
const SMTP_SERVER = 'SMTP SERVER';
const SMTP_LOGIN = 'SMTP LOGIN';
const SMTP_PASSWORD = 'SMTP PASSWORD';

VoxEngine.addEventListener(AppEvents.CallAlerting, e => {

  let inc = e.call;
  inc.playProgressTone('RU');

  inc.addEventListener(CallEvents.Connected, _ => {
    inc.record();
    inc.say("К сожалению, все операторы заняты, но мы перезвоним вам в течение пятнадцати минут. Спасибо за понимание",
        Language.RU_RUSSIAN_FEMALE);
  });

  inc.addEventListener(CallEvents.PlaybackFinished, _ => {
    inc.hangup();
    let data = `phone=${encodeURIComponent(e.callerid)}&`;
    data += `name=${encodeURIComponent(e.callerid)}&`;
    data += `ref=${M1_USER_ID}&`;
    data += `api_key=${M1_USER_KEY}&`;
    data += `product_id=${M1_PRODUCT_ID}&`;
    data += `ip=127.0.0.1`;
    Net.httpRequest('https://m1-shop.ru/send_order/', response => {
      let id;
      if (response.code === 200) {
        let responseData = JSON.parse(response.text);
        if (responseData.result === 'ok') {
          id = responseData.id;
        } else {
          Logger.write(`Fail to send order to M1: ${responseData.message}`);
        }
      } else {
        Logger.write(`Fail to send order to M1: ${response.code}`);
      }
      let subj = `Входящий звонок на оффер ${M1_PRODUCT_ID}`;
      let body = `Входящий звонок от абонента ${e.callerid} на оффер ${M1_PRODUCT_ID}.`;
      if (id) body += ` ID лида в M1-Shop: ${id}`;
      Net.sendMail(SMTP_SERVER, SMTP_LOGIN, NOTIFICATIONS_EMAIL, subj, body, null, {
        login: SMTP_LOGIN,
        password: SMTP_PASSWORD
      });
      VoxEngine.terminate();
    }, {
      method: 'POST',
      headers: ['Content-Type: application/x-www-form-urlencoded; charset=utf-8'],
      postData: data,
      timeout: 30
    });
  });

  inc.answer();
});