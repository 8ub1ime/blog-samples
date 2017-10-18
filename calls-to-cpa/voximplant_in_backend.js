const BACKEND_URL = 'https://example.com/backend.php';
const M1_PRODUCT_ID = 4664; // ID оффера в M1


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
    Net.httpRequest(BACKEND_URL, response => {
      if (response.code !== 200) {
        Logger.write('Fail to send data to backend: ' + response.code);
      }
      VoxEngine.terminate();
    }, {
      method: 'POST',
      headers: ['Content-Type: application/json; charset=utf-8'],
      postData: JSON.stringify({phone: e.callerid, product_id: M1_PRODUCT_ID}),
      timeout: 30
    });
  });

  inc.answer();
});