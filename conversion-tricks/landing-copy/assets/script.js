var userGeo;

// Редирект на Али по кнопке "Назад"
history.pushState({}, '', '');
history.pushState(null, '', '');
window.onpopstate = function (e) {
  e.state && location.replace('https://aliexpress.com/');
};

// Подставляем город посетителя в элемент с классом 'js-geo'
// И добавляем попап с информацией о быстрой доставке
(function () {
  var notification = document.querySelector('.js-fastdelivery');
  notification.querySelector('.notification__close').addEventListener('click', function () {
    notification.style.display = 'none';
  }, false);
  var script = document.createElement('script');
  script.src = 'https://api-maps.yandex.ru/2.0-stable/?load=package.map&lang=ru-RU';
  if (script.addEventListener) {
    script.addEventListener("load", detectGeo, false);
  }
  else if (script.readyState) {
    script.onreadystatechange = detectGeo;
  }
  document.head.appendChild(script);

  function detectGeo() {
    ymaps.ready(function () {
      userGeo = ymaps.geolocation.city;
      if (userGeo) {
        elements = document.querySelectorAll('.js-geo');
        for (var i = 0; i < elements.length; i++) {
          elements[i].innerHTML = userGeo;
        }
        notification.style.display = 'flex';
        window.setTimeout(function () {
          notification.style.opacity = 1;
        }, 50);
      }
    });
  }
})();

// Попап с фальшивыми заказами
(function () {
  var maxTypes = 2; // Максимальное количество видов (цветов) рюкзаков в одном заказе
  var maxGoods = 2; // Максимальное количество рюкзаков одного цвета в заказе
  var names = {
    men: ['Игорь', 'Владимир', 'Антон', 'Иван', 'Стас', 'Александр', 'Дмитрий', 'Кирилл',
      'Константин', 'Алексей', 'Виктор', 'Николай', 'Василий', 'Степан'],
    women: ['Валентина', 'Софья', 'Анна', 'Елена', 'Екатерина', 'Виктория', 'Надежда',
      'Анастасия', 'Марина', 'Татьяна', 'Светлана', 'Галина']
  };
  var cities = ['Кострома', 'Коломна', 'Воронеж', 'Пенза', 'Копейск', 'Таганрог', 'Москва',
    'Санкт-Петербург', 'Уфа', 'Астрахань', 'Анапа', 'Красноярск', 'Краснодар', 'Саратов',
    'Саранск', 'Тула', 'Тверь', 'Новосибирск', 'Ярославль', 'Белгород', 'Смоленск'];
  var goods = ['Рюкзак Bobby XD Черный', 'Рюкзак Bobby XD Розовый', 'Рюкзак Bobby XD Серый'];
  var showsCounter = 0;

  function newOrder() {
    var gender = ['men', 'women'][Math.floor(Math.random() * 2)];
    var name = names[gender][Math.floor(Math.random() * names[gender].length)];
    var city = cities[Math.floor(Math.random() * cities.length)];
    if ((showsCounter === 1 || showsCounter === 3) && userGeo) {
      city = userGeo;
    }
    var goodsInOrder = Math.floor(Math.random() * maxTypes) + 1;
    var order = [];
    var bought = [];
    for (var i = 0; i < goodsInOrder; i++) {
      var goodIndex = Math.floor(Math.random() * goods.length);
      if (bought.indexOf(goodIndex) !== -1) continue;
      var good = goods[goodIndex];
      var goodCount = Math.floor(Math.random() * maxGoods) + 1;
      order.push(good + ' - ' + goodCount + 'шт.');
      bought.push(goodIndex);
    }
    var popupText = name + ' из г.' + city + (gender === 'men' ? ' сделал' : ' сделала') + ' заказ:<br/>';
    order.forEach(function (entry) {
      popupText += entry + '<br/>';
    });
    return popupText;
  }

  var notification = document.querySelector('.js-fakeorders');

  function showNotification() {
    showsCounter++;
    notification.querySelector('.notification__text').innerHTML = newOrder();
    notification.style.display = 'flex';
    window.setTimeout(function () {
      notification.style.opacity = 1;
    }, 50);
    window.setTimeout(function () {
      notification.style.opacity = 0;
      window.setTimeout(function () {
        notification.style.display = 'none';
      }, 1000);
    }, 7 * 1000);
  }

  function startLoop() {
    showNotification();
    window.setTimeout(startLoop, (Math.floor(Math.random() * 60) + 30) * 1000);
  }

  window.setTimeout(startLoop, 10 * 1000);
})();

// Промокоды
(function () {
  var price = 7990;
  var discount = 6000;
  var promocode = 'biscripter';
  var priceElements = document.querySelectorAll('.price');
  for (var priceIndex = 0; priceIndex < priceElements.length; priceIndex++) {
    priceElements[priceIndex].innerHTML = price;
  }
  for (var blockIndex = 0, promocodeBlocks = document.querySelectorAll('.promocode'); blockIndex < promocodeBlocks.length; blockIndex++) {
    (function (promocodeBlock) {
      var formVisible = false;
      promocodeBlock.querySelector('.promocode__trigger').addEventListener('click', function (e) {
        e.preventDefault();
        if (formVisible) {
          promocodeBlock.querySelector('.promocode__form').style.display = 'none';
          formVisible = false;
        } else {
          promocodeBlock.querySelector('.promocode__form').style.display = 'block';
          formVisible = true;
        }
      }, false);
      var form = promocodeBlock.querySelector('.promocode__form');
      form.addEventListener('submit', function (e) {
        e.preventDefault();
        var errorElement = promocodeBlock.querySelector('.form__status--error');
        if (promocodeBlock.querySelector('.form__input').value === promocode) {
          var lowPrice = price;
          var counter = 0;
          var interval = window.setInterval(function () {
            if (counter < 10) {
              lowPrice -= discount / 10;
              for (var priceIndex = 0; priceIndex < priceElements.length; priceIndex++) {
                priceElements[priceIndex].innerHTML = lowPrice;
              }
              counter++;
            } else {
              clearInterval(interval);
            }
          }, 100);
          form.reset();
          errorElement.style.display = 'none';
        } else {
          errorElement.style.display = 'block';
          for (var priceIndex = 0; priceIndex < priceElements.length; priceIndex++) {
            priceElements[priceIndex].innerHTML = price;
          }
        }
      }, false);
    })(promocodeBlocks[blockIndex]);
  }

  // Exit Intent Popup
  // При нажатии на кнопки Купить покажем его же
  (function () {
    var overlay = document.querySelector('.overlay');
    var modal = document.querySelector('.js-exit-intent');
    document.addEventListener('mouseleave', showModal, false);

    function showModal() {
      document.body.style.overflow = 'hidden';
      overlay.style.display = 'flex';
      window.setTimeout(function () {
        modal.style.opacity = 1;
      }, 50);
      document.removeEventListener('mouseleave', showModal);
    }

    modal.querySelector('.modal__close').addEventListener('click', function (e) {
      e.preventDefault();
      modal.style.opacity = 0;
      overlay.style.display = 'none';
      document.body.style.overflow = 'auto';
    }, false);
    for (var buttonIndex = 0, buttons = document.querySelectorAll('.js-order'); buttonIndex < buttons.length; buttonIndex++) {
      (function (button) {
        button.addEventListener('click', showModal, false);
      })(buttons[buttonIndex]);
    }
  })();

  // Отправка форм
  (function () {
    var form = document.querySelector('.modal__form');
    var button = form.querySelector('.form__submit');
    form.removeChild(form.querySelector('.js-remove')); // Удаляем ловушку для ботов
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      button.disabled = true;
      form.querySelector('.form__status--inprogress').style.display = 'block';
      var xhr = new XMLHttpRequest();
      xhr.open('POST', '/backend.php');
      xhr.setRequestHeader('Content-Type', 'application/json');
      xhr.onload = function () {
        form.querySelector('.form__status--inprogress').style.display = 'none';
        button.disabled = false;
        if (xhr.status === 200) {
          form.querySelector('.form__status--success').style.display = 'block';
          form.querySelector('.form__status--error').style.display = 'none';
          form.reset();
        } else {
          form.querySelector('.form__status--error').style.display = 'block';
          form.querySelector('.form__status--success').style.display = 'none';
        }
      };
      xhr.send(JSON.stringify({phone: form.querySelector('.form__input').value}));
    }, false);
  })();
})();