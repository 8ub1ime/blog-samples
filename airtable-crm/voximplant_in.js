VoxEngine.addEventListener(AppEvents.CallAlerting, (e1) => {

  const OPERATOR = 'Ivan';
  const BACKEND_URL = 'https://example.com/backend.php';

  let inc = e1.call;
  inc.playProgressTone('RU');
  let out = VoxEngine.callUser(OPERATOR, e1.callerid, e1.displayName);

  inc.addEventListener(CallEvents.RecordStarted, (e2) => {
    Net.httpRequestAsync(BACKEND_URL, {
      method: 'POST',
      headers: ['Content-Type: application/json; charset=utf-8'],
      postData: JSON.stringify({phone: e1.callerid, callRecordURL: e2.url}),
      timeout: 20
    })
      .then((response) => {
        if (response.code !== 200) {
          Logger.write('Call data sending failed: ' + response.code);
        } else {
          Logger.write('Call data sent to backend');
        }
      })
  });

  VoxEngine.easyProcess(inc, out, (call) => {
    call.record();
  });
});