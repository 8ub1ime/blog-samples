(function () {
  var _id = "8b8d9cb605140d49ff78aa8a148a8250";
  while (document.getElementById("timer" + _id)) _id = _id + "0";
  document.write("<div id='timer" + _id + "' style='min-width:220px;height:42px;'></div>");
  var _t = document.createElement("script");
  _t.src = "assets/timer.js";
  var _f = function (_k) {
    var l = new MegaTimer(_id, {
      "view": [1, 1, 1, 1],
      "type": {
        "currentType": "3",
        "params": {
          "weekdays": [1, 1, 1, 1, 1, 1, 1],
          "usertime": true,
          "time": "00:00",
          "tz": -180,
          "hours": "24",
          "minutes": "0"
        }
      },
      "design": {
        "type": "text",
        "params": {
          "number-font-family": {
            "family": "Exo 2",
            "link": "<link href='https://fonts.googleapis.com/css?family=Exo+2&subset=latin,cyrillic' rel='stylesheet' type='text/css'>"
          },
          "number-font-size": "30",
          "number-font-color": "#000",
          "separator-margin": "6",
          "separator-on": true,
          "separator-text": ":",
          "text-on": true,
          "text-font-family": {
            "family": "Comfortaa",
            "link": "<link href='https://fonts.googleapis.com/css?family=Comfortaa&subset=latin,cyrillic' rel='stylesheet' type='text/css'>"
          },
          "text-font-size": "12",
          "text-font-color": "#434343"
        }
      },
      "designId": 1,
      "theme": "white",
      "width": 220,
      "height": 42
    });
    if (_k != null) l.run();
  };
  _t.onload = _f;
  _t.onreadystatechange = function () {
    if (_t.readyState == "loaded") _f(1);
  };
  var _h = document.head || document.getElementsByTagName("head")[0];
  _h.appendChild(_t);
}).call(this);