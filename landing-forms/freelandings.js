(function () {
  for (var formIndex = 0, forms = document.querySelectorAll('.js-form'); formIndex < forms.length; formIndex++) {
    (function(form){
      var formSubmit = form.querySelector('.js-form-submit');
      var formStatus = form.querySelector('.js-form-status');
      form.addEventListener('submit', function (e) {
        e.preventDefault();
        formSubmit.disabled = true;
        formStatus.innerHTML = 'Подождите, заявка отправляется...';
        var xhr = new XMLHttpRequest();
        xhr.open('POST', 'freelandings.php');
        xhr.setRequestHeader('Content-Type', 'application/json');
        xhr.responseType = 'json';
        xhr.onload = function () {
          formSubmit.disabled = false;
          if (xhr.status === 200 || window.location.host === 'freelandings.ru') {
            formStatus.innerHTML = 'Спасибо! Ваша заявка принята. Мы позвоним Вам в течение 15 минут';
            form.reset();
            if (typeof dataLayer !== 'undefined') {
              dataLayer.push({
                'event': 'submit'
              })
            }
            if (xhr.response && xhr.response.redirectURL) window.location.href = xhr.response.redirectURL;
          } else {
            formStatus.innerHTML = 'Во время отправки заявки возникла ошибка. Попробуйте повторить попытку позднее';
          }
        };
        var formData = [];
        for (var fieldIndex = 0, fields = form.querySelectorAll('.js-form-field'); fieldIndex < fields.length; fieldIndex++) {
          formData.push({
            name: fields[fieldIndex].name,
            value: fields[fieldIndex].value
          });
        }
        xhr.send(JSON.stringify(formData));
      });
    })(forms[formIndex])
  }
})();