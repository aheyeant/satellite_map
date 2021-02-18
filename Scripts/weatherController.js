function WeatherController() {
    var impl = new WeatherControllerImpl();

    this.initWeather = function (latitude, longitude, isMobile) {
        if (DISABLE_WEATHER) return;
        impl.initWeather(latitude, longitude, isMobile);
    }
}

function WeatherControllerImpl() {
    // Weather Widget ids from maserPage
    var weatherWidget = "weatherWidget"
    var weatherWidgetTemperature = "weatherWidgetTemperature";
    var weatherIcon = "weatherIconId";
    var weatherIconDescription = "weatherIconDescriptionId";

    var weatherWidgetMobile = "weatherWidgetMobile"
    var weatherWidgetMobileTemperature = "weatherWidgetMobileTemperature";
    var weatherMobileIcon = "weatherMobileIconId";
    var weatherMobileIconDescription = "weatherMobileIconDescriptionId";

    this.initWeather = function (latitude, longitude, isMobile) {
        if (latitude === null) {
            //[DEBUG_MESSAGE]
            if (DEBUG === true) {
                console.log("[DEBUG_MESSAGE] Weather init: Fail; Latitude === null; Mb Observer not init");
            }
            document.getElementById(weatherWidget).style.display = "none";
            return;
        }

        // vars for https://openweathermap.org/api
        // get weather example: https://api.openweathermap.org/data/2.5/weather?lat=LATITUDE&lon=LONGITUDE&appid=APIKEY
        // get icon example: https://openweathermap.org/img/wn/ICON_NAME@2x.png
        var _apikey = "96d7489d54c9bee6756acdde3e2df8ce";
        var _urlReq = "https://api.openweathermap.org/data/2.5/weather?lat=" + latitude + "&lon=" + longitude + "&appid=" + _apikey;
        _getAssRequest(_urlReq, _initWeatherFromOpenWeatherMapOrg, isMobile);
    }

    // private
    function _getAssRequest(reqestURL, callback, isMobile) {
        var xmlHttp = new XMLHttpRequest();
        xmlHttp.open("GET", reqestURL, true); // false for synchronous request
        xmlHttp.send();

        xmlHttp.onreadystatechange = function () {
            if (this.readyState != 4) return;
            if (xmlHttp.status === 200) {
                //[DEBUG_MESSAGE]
                if (DEBUG === true) {
                    console.log("[DEBUG_MESSAGE] Get ass reqest: Succes(200) url=", reqestURL);
                }

                callback(xmlHttp.responseText, isMobile);
            } else {
                //[DEBUG_MESSAGE]
                if (DEBUG === true) {
                    console.log("[DEBUG_MESSAGE] Get ass reqest: Fail(" + xmlHttp.status + ") url=", reqestURL);
                }

                callback(null, isMobile);
            }
        }
    }

    function _initWeatherFromOpenWeatherMapOrg(ret, isMobile) {
        if (ret === undefined || ret === null || ret === "") {
            //[DEBUG_MESSAGE]
            if (DEBUG === true) {
                console.log("[DEBUG_MESSAGE] Weather init: Fail");
            }
            document.getElementById(weatherWidget).style.display = "none";
            return;
        }
        var _jsonRet = null;
        try {
            _jsonRet = JSON.parse(ret);
        } catch (err) {
            //[DEBUG_MESSAGE]
            if (DEBUG === true) {
                console.log("[DEBUG_MESSAGE] Weather init: Fail; error json parse");
            }
            document.getElementById(weatherWidget).style.display = "none";
            return;
        }
        if (_jsonRet === null) {
            //[DEBUG_MESSAGE]
            if (DEBUG === true) {
                console.log("[DEBUG_MESSAGE] Weather init: Fail; error json parse (=== null)");
            }
            document.getElementById(weatherWidget).style.display = "none";
            return;
        }

        var _temperature = parseInt(_jsonRet.main.temp) - 273;
        var _iconURL = "https://openweathermap.org/img/wn/" + _jsonRet.weather[0].icon + "@2x.png";
        var _iconAlt = _jsonRet.weather[0].description;
        var _descriptionIcon = _jsonRet.weather[0].main;
        if (isMobile === false) {
            document.getElementById(weatherWidget).style.display = "block";
            document.getElementById(weatherWidgetMobile).style.display = "none";
            document.getElementById(weatherWidgetTemperature).innerText = _temperature + " °С";
            document.getElementById(weatherIcon).setAttribute("src", _iconURL);
            document.getElementById(weatherIcon).setAttribute("alt", _iconAlt);
            document.getElementById(weatherIconDescription).innerText = _descriptionIcon;
        } else {
            document.getElementById(weatherWidget).style.display = "none";
            document.getElementById(weatherWidgetMobile).style.display = "flex";
            document.getElementById(weatherWidgetMobileTemperature).innerText = _temperature + " °С";
            document.getElementById(weatherMobileIcon).setAttribute("src", _iconURL);
            document.getElementById(weatherMobileIcon).setAttribute("alt", _iconAlt);
            document.getElementById(weatherMobileIconDescription).innerText = _descriptionIcon;
        }
    }
}