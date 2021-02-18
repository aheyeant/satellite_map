function Observer() {
    var impl = new ObserverImpl();

    this.initGeolocation = function (res) {
        impl.initGeolocation(res);
    }

    this.autoGeolocation = function (weatherController) {
        impl.autoGeolocation(weatherController);
    }

    this.getObserverCoordinates = function () {
        return impl.getObserverCoordinates();
    };

    this.readPositionFromCoordinateSetterPopup = function () {
        impl.readPositionFromCoordinateSetterPopup();
    };

    this.readCoordinateFromCoordinateSetterPopup = function () {
        impl.readCoordinateFromCoordinateSetterPopup();
    };

    this.wrtiteToCoordinateSetterPopup = function () {
        impl.wrtiteToCoordinateSetterPopup();
    }

    this.setPositionDirty = function () {
        impl.setPositionDirty();
    }

    this.setDefaultPosition = function () {
        impl.setDefaultPosition();
    };

    this.distanceToEarthPointInKm = function (lat, lng) {
        return impl.distanceToEarthPointInKm(lat, lng);
    }

    this.distanceBetweenTwoEarthPositionsInKm = function (lat1, lng1, lat2, lng2) {
        return impl.distanceBetweenTwoEarthPositionsInKm(lat1, lng1, lat2, lng2);
    };

    this.setCookie = function () {
        impl.setCookie();
    };

    this.writeToObserverPositionLabel = function () {
        impl.writeToObserverPositionLabel();
    };

    this.getAvailableCities = function () {
        return impl.getAvailableCities();
    };

    this.getLatitude = function () {
        return impl.getLatitude();
    }

    this.setLatitude = function (lat) {
        impl.setLatitude(lat);
    }

    this.getLongitude = function () {
        return impl.getLongitude();
    }

    this.setLongitude = function (lng) {
        impl.setLongitude(lng);
    }

    this.getIsGeolocated = function () {
        return impl.getIsGeolocated();
    };
}


function ObserverImpl() {
    //public
    var m_latitude = 20;
    var m_longitude = 20;
    var m_isGeolocated = false;
    var m_citiName = null;
    var m_citiIndex = 0;

    /**
     * Try define observer position
     * @param {JSON} res - result from https://get.geojs.io/v1/ip/geo.js
     */
    this.initGeolocation = function (res) {
        if (res === null || res === undefined) {
            res = null;
        }

        //[DEBUG_MESSAGE]
        if (DEBUG === true && res !== null) {
            console.log("[DEBUG_MESSAGE] Auto geolacation: Success", res);
        }

        //[DEBUG_MESSAGE]
        if (DEBUG === true && res === null) {
            console.log("[DEBUG_MESSAGE] Auto geolacation: Fail");
        }

        _cookie = getCookie();
        if (_cookie.error === false) {
            //[DEBUG_MESSAGE]
            if (DEBUG === true) {
                console.log("[DEBUG_MESSAGE] Cookies geolocation:Success");
                console.log("[DEBUG_MESSAGE] Result of geolacation was changed to cookies data", _cookie);
            }

            res = _cookie;
        } else {
            //[DEBUG_MESSAGE]
            if (DEBUG === true) {
                console.log("[DEBUG_MESSAGE] Cookies geolacation: Fail");
            }
        }

        if (res === null) {
            this.setDefaultPosition();
            return;
        }

        if (res.longitude === undefined || res.longitude === null || res.longitude === "" || res.latitude === undefined || res.latitude === null || res.latitude === "") {
            this.setDefaultPosition();
            return;
        }

        var _lat = parseFloat(res.latitude);
        var _lng = parseFloat(res.longitude);

        var closestDistance = 1000000;
        var closestId = null;

        locations.forEach(function (location) {
            var _locationId = location[0];
            var _locationValue = location[1];

            var _coordinates = parseLatLngStrings(_locationValue[0], _locationValue[1]);
            var _distance = _distanceBetweenTwoEarthPositionsInKm(_coordinates[0], _coordinates[1], _lat, _lng);

            if (_distance < closestDistance) {
                closestDistance = _distance;
                closestId = _locationId;
            }
        });

        if (closestId !== null) {
            //[DEBUG_MESSAGE]
            if (DEBUG === true) {
                console.log("[DEBUG_MESSAGE] Closest city found to be " + locations[idToIndexMap[closestId]][1] + " in " + closestDistance + 'km');
            }

            if (closestDistance <= MAX_CLOSEST_DISTANCE) {
                CoordinateSetterPopup.Position.value = idToIndexMap[closestId];
                this.readPositionFromCoordinateSetterPopup();
            } else {
                //[DEBUG_MESSAGE]
                if (DEBUG === true) {
                    console.log('[DEBUG_MESSAGE] city too far, using coordinates');
                }

                var _nlat = Math.abs(_lat);
                var _nlatDir = (_lat < 0 ? 'South' : 'North');
                var _nlng = Math.abs(_lng);
                var _nlngDir = (_lng < 0 ? 'West' : 'East');

                CoordinateSetterPopup.LatitudeDegrees.value = _nlat;
                CoordinateSetterPopup.LatitudeDirection.value = _nlatDir;
                CoordinateSetterPopup.LongitudeDegrees.value = _nlng;
                CoordinateSetterPopup.LongitudeDirection.value = _nlngDir;
                CoordinateSetterPopup.Position.value = ZERO_COORDINATE_ID;
                this.readCoordinateFromCoordinateSetterPopup();
            }
        } else {
            //[DEBUG_MESSAGE]
            if (DEBUG === true) {
                console.log("[DEBUG_MESSAGE] not fount closestIndex");
            }
            
            this.setDefaultPosition();
            return;
        }
        m_isGeolocated = true;
    }

    this.autoGeolocation = function (weatherController) {
        var _reqestURL = "https://get.geojs.io/v1/ip/geo.js?callback=";
        _getAssRequest(_reqestURL, _autoGeolocate, weatherController);
    }

    this.getObserverCoordinates = function () {
        return [m_latitude, m_longitude];
    };

    this.readPositionFromCoordinateSetterPopup = function () {
        _readPositionFromCoordinateSetterPopup();
    };

    this.readCoordinateFromCoordinateSetterPopup = function () {
        _readCoordinateFromCoordinateSetterPopup();
    };

    this.wrtiteToCoordinateSetterPopup = function () {
        CoordinateSetterPopup.LatitudeDegrees.value = m_latitude;
        CoordinateSetterPopup.LongitudeDegrees.value = m_longitude;
        CoordinateSetterPopup.Position.value = m_citiIndex;
    };

    this.setPositionDirty = function () {
        m_citiName = null;
        m_citiIndex = getLocationIndexById(ZERO_COORDINATE_ID);

        var _index = idToIndexMap[ZERO_COORDINATE_ID];
        if (_index === undefined) {
            _index = 0;
        }
        CoordinateSetterPopup.Position.value = idToIndexMap[ZERO_COORDINATE_ID];
    }

    this.setDefaultPosition = function () {
        m_citiName = null;
        m_citiIndex = getLocationIndexById(ZERO_COORDINATE_ID);

        var _location = getLocationById(ZERO_COORDINATE_ID);
        if (_location !== undefined) {
            var _tmp = _location[0].split(":"); // The first array containing lat:latDir
            var _lat = _tmp[0];
            var _latDir = _tmp[1];
            var _tmp = _location[1].split(":"); // The second array containing lng:lngDir
            var _lng = _tmp[0];
            var _lngDir = _tmp[1];

            CoordinateSetterPopup.LatitudeDegrees.value = _lat;
            CoordinateSetterPopup.LatitudeDirection.value = _latDir;
            CoordinateSetterPopup.LongitudeDegrees.value = _lng;
            CoordinateSetterPopup.LongitudeDirection.value = _lngDir;
            CoordinateSetterPopup.Position.value = idToIndexMap[ZERO_COORDINATE_ID];

            _lat *= (_latDir === 'South' ? -1 : 1);
            _lng *= (_lngDir === 'West' ? -1 : 1);

            m_latitude = _lat;
            m_longitude = _lng;
        } else {
            m_latitude = 0;
            m_longitude = 0;
        }
        this.setCookie();
        m_isGeolocated = true;
    }

    /**
     * Return distance between own position and some position
     * @param {any} lat
     * @param {any} lng
     */
    this.distanceToEarthPointInKm = function (lat, lng) {
        return _distanceBetweenTwoEarthPositionsInKm(m_latitude, m_longitude, lat, lng);
    }

    /**
     * @param {any} lat1
     * @param {any} lng1
     * @param {any} lat2
     * @param {any} lng2
     */
    this.distanceBetweenTwoEarthPositionsInKm = function (lat1, lng1, lat2, lng2) {
        return _distanceBetweenTwoEarthPositionsInKm(lat1, lng1, lat2, lng2);
    }

    /**
     * Set cookies with name <COOKIE_OBSERVER_NAME> where value="latitude:longitude:createdtime" time in milliseconds
     */
    this.setCookie = function () {
        _setCookie();
    };

    this.writeToObserverPositionLabel = function () {
        _writeToObserverPositionLabel();
    };

    this.getAvailableCities = function () {
        var availableCities = "";
        locations.forEach(function (entry) {
            availableCities += '<option value="' + idToIndexMap[entry[0]] + '">' + entry[1][2] + '</option>';
        });
        return availableCities;
    }

    this.getLatitude = function () {
        if (m_isGeolocated === false) {
            return null;
        }
        return m_latitude
    }

    this.setLatitude = function (lat) {
        m_latitude = lat;
    }

    this.getLongitude = function () {
        if (m_isGeolocated === false) {
            return null;
        }
        return m_longitude
    }

    this.setLongitude = function (lng) {
        m_longitude = lng;
    }

    this.getIsGeolocated = function () {
        return m_isGeolocated;
    };


    //private
    /**
     * @param {any} lat1
     * @param {any} lng1
     * @param {any} lat2
     * @param {any} lng2
     */
    function _distanceBetweenTwoEarthPositionsInKm(lat1, lng1, lat2, lng2) {
        var EARTH_RADIUS = 6378.16; // Km

        var deltaLat = satellite.degreesToRadians(lat2 - lat1);
        var deltaLng = satellite.degreesToRadians(lng2 - lng1);

        lat1 = satellite.degreesToRadians(lat1);
        lat2 = satellite.degreesToRadians(lat2);

        var ans = Math.sin(deltaLat / 2) * Math.sin(deltaLat / 2) +
            Math.sin(deltaLng / 2) * Math.sin(deltaLng / 2) * Math.cos(lat1) * Math.cos(lat2);
        var c = 2 * Math.atan2(Math.sqrt(ans), Math.sqrt(1 - ans));
        return EARTH_RADIUS * c;
    }

    /**
     * Parse lat lng strings
     *      "36.18:North" => 36.18 or "36.18:South" => -36.18
     *      "68.73:East"  => 68.73 or "68.73:West"  => -68.73
     * @param {String} latStr
     * @param {String} lngStr
     */
    function parseLatLngStrings(latStr, lngStr) {
        var latPair = latStr.split(':');
        var lngPair = lngStr.split(':');
        var _lat = parseFloat(latPair[0]) * (latPair[1].toLowerCase() === 'south' ? -1 : 1);
        var _lng = parseFloat(lngPair[0]) * (lngPair[1].toLowerCase() === 'west' ? -1 : 1);

        return [_lat, _lng];
    }

    /**
     * @param {number} locationId
     * @returns {Array} ["36.18:North", "68.73:East", "AFGHANISTAN - Baghlan"]
     */
    function getLocationById(locationId) {
        var _locationIndex = idToIndexMap[locationId];
        if (_locationIndex === undefined) {
            return getLocationById(ZERO_COORDINATE_ID);
        }
        return locations[_locationIndex][1];
    }

    /**
     * @param {number} locationIndex
     * @returns {Array} ["36.18:North", "68.73:East", "AFGHANISTAN - Baghlan"]
     */
    function getLocationByIndex(locationIndex) {
        if (locationIndex === undefined) {
            return getLocationById(ZERO_COORDINATE_ID);
        }

        return locations[locationIndex][1];
    }

    function getLocationIndexById(locationId) {
        var _locationIndex = idToIndexMap[locationId];
        if (_locationIndex === undefined) {
            _locationIndex = idToIndexMap[ZERO_COORDINATE_ID];
        }
        return _locationIndex;
    }

    /**
     * return: {error: _error, latitude: _cLat, longitude: _cLng};
     */
    function getCookie() {
        //[POSSIBLE_ERROR] check if document not loaded 
        var _cookieEntry = document.cookie.match(COOKIE_OBSERVER_NAME);
        if (_cookieEntry === null || _cookieEntry === undefined) {
            return { error: true, latitude: 0, longitude: 0 };
        }
        var _cookieLine = document.cookie.match(COOKIE_OBSERVER_NAME).input;
        var _tmpLine = _cookieLine.split("=");
        if (_tmpLine.length !== 2) {
            return { error: true, latitude: 0, longitude: 0 };
        }
        var _cookie = _tmpLine[1];

        var _error = false;
        var _cLat = null;
        var _cLng = null;
        var _cTime = null;
        if (_cookie === null || _cookie === undefined || _cookie === "") {
            _error = true;
        } else {
            _tmp = _cookie.split(":");
            if (_tmp.length === 3) {
                _cLat = parseFloat(_tmp[0]);
                _cLng = parseFloat(_tmp[1]);
                _cTime = parseInt(_tmp[2]);
                if (isNaN(_cLat))  _error = true;
                if (isNaN(_cLng))  _error = true;
                if (isNaN(_cTime)) _error = true;
                if (_error === false) {
                    if ((new Date().getTime() - _cTime) > EXPIRES_TIME) _error = true  // date in milliseconds
                }
            } else {
                _error = true;
            }
        }
        if (_error === true) {
            return {error: true, latitude: 0, longitude: 0};
        }
        return {error: false, latitude: _cLat, longitude: _cLng};
    };

    function _writeToObserverPositionLabel() {
        var observerPositionLabel = document.getElementById("observerPositionLabel");

        if (observerPositionLabel === undefined || observerPositionLabel === null) { return; }
        if (m_isGeolocated === false) {
            observerPositionLabel.innerText = "Undefined location";
            return;
        }
        if (m_citiName === null || m_citiName === "Choose your position") {
            observerPositionLabel.innerText = "Latitude: " + m_latitude + " Longitude: " + m_longitude;
        } else {
            observerPositionLabel.innerText = m_citiName;
        }
    }

    function _setCookie() {
        var _time = new Date().getTime(); // in milliseconds
        var _cookies_value = m_latitude + ":" + m_longitude + ":" + _time;
        document.cookie = COOKIE_OBSERVER_NAME + "=" + _cookies_value;

        //[DEBUG_MESSAGE]
        if (DEBUG === true) {
            console.log("[DEBUG_MESSAGE] cookie set:", document.cookie);
        }
    };

    function _readPositionFromCoordinateSetterPopup() {
        var _locationIndex = CoordinateSetterPopup.Position.value;
        var _location = getLocationByIndex(_locationIndex);
        m_citiName = _location[2];
        m_citiIndex = _locationIndex;
        if (_location !== undefined) {
            var _tmp = _location[0].split(":"); // The first array containing lat:latDir
            var _lat = _tmp[0];
            var _latDir = _tmp[1];
            var _tmp = _location[1].split(":"); // The second array containing lng:lngDir
            var _lng = _tmp[0];
            var _lngDir = _tmp[1];
            CoordinateSetterPopup.LatitudeDegrees.value = _lat;
            CoordinateSetterPopup.LatitudeDirection.value = _latDir;
            CoordinateSetterPopup.LongitudeDegrees.value = _lng;
            CoordinateSetterPopup.LongitudeDirection.value = _lngDir;

            _lat *= (_latDir === 'South' ? -1 : 1);
            _lng *= (_lngDir === 'West' ? -1 : 1);

            m_latitude = _lat;
            m_longitude = _lng;

            _setCookie();
            m_isGeolocated = true;
        }
    };

    function _readCoordinateFromCoordinateSetterPopup() {
        m_citiName = null;
        m_citiIndex = getLocationIndexById(ZERO_COORDINATE_ID);
        var _lat = Math.abs(CoordinateSetterPopup.LatitudeDegrees.value);
        var _latDir = CoordinateSetterPopup.LatitudeDirection.value;
        var _lng = Math.abs(CoordinateSetterPopup.LongitudeDegrees.value);
        var _lngDir = CoordinateSetterPopup.LongitudeDirection.value;

        var _nLat = _lat * (_latDir === 'South' ? -1 : 1);
        var _nLng = _lng * (_lngDir === 'West' ? -1 : 1);

        CoordinateSetterPopup.LatitudeDegrees.value = _lat;
        CoordinateSetterPopup.LongitudeDegrees.value = _lng;

        m_latitude = _nLat;
        m_longitude = _nLng;

        _setCookie();
        m_isGeolocated = true;
    };
     
    function _getAssRequest(reqestURL, callback, args) {
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

                callback(xmlHttp.responseText, args);
            } else {
                //[DEBUG_MESSAGE]
                if (DEBUG === true) {
                    console.log("[DEBUG_MESSAGE] Get ass reqest: Fail(" + xmlHttp.status + ") url=", reqestURL);
                }

                callback(null, args);
            }
        }
    };

    function _autoGeolocate(result, weatherController) {
        var res = "";
        for (var _i = 1; _i < result.length - 2; _i++) {
            res += result[_i];
        }
        res = JSON.parse(res);

        if (res === null || res === undefined) {
            res = null;
        }

        //[DEBUG_MESSAGE]
        if (DEBUG === true && res !== null) {
            console.log("[DEBUG_MESSAGE] Auto geolacation: Success", res);
        }

        //[DEBUG_MESSAGE]
        if (DEBUG === true && res === null) {
            console.log("[DEBUG_MESSAGE] Auto geolacation: Fail");
            return;
        }

        if (res === null) {
            return;
        }

        if (res.longitude === undefined || res.longitude === null || res.longitude === "" || res.latitude === undefined || res.latitude === null || res.latitude === "") {
            return;
        }

        var _lat = parseFloat(res.latitude);
        var _lng = parseFloat(res.longitude);

        var closestDistance = 1000000;
        var closestId = null;

        locations.forEach(function (location) {
            var _locationId = location[0];
            var _locationValue = location[1];

            var _coordinates = parseLatLngStrings(_locationValue[0], _locationValue[1]);
            var _distance = _distanceBetweenTwoEarthPositionsInKm(_coordinates[0], _coordinates[1], _lat, _lng);

            if (_distance < closestDistance) {
                closestDistance = _distance;
                closestId = _locationId;
            }
        });

        if (closestId !== null) {
            //[DEBUG_MESSAGE]
            if (DEBUG === true) {
                console.log("[DEBUG_MESSAGE] Closest city found to be " + locations[idToIndexMap[closestId]][1] + " in " + closestDistance + 'km');
            }

            if (closestDistance <= MAX_CLOSEST_DISTANCE) {
                CoordinateSetterPopup.Position.value = idToIndexMap[closestId];
                _readPositionFromCoordinateSetterPopup();
                _writeToObserverPositionLabel();
            } else {
                //[DEBUG_MESSAGE]
                if (DEBUG === true) {
                    console.log('[DEBUG_MESSAGE] city too far, using coordinates');
                }

                var _nlat = Math.abs(_lat);
                var _nlatDir = (_lat < 0 ? 'South' : 'North');
                var _nlng = Math.abs(_lng);
                var _nlngDir = (_lng < 0 ? 'West' : 'East');

                CoordinateSetterPopup.LatitudeDegrees.value = _nlat;
                CoordinateSetterPopup.LatitudeDirection.value = _nlatDir;
                CoordinateSetterPopup.LongitudeDegrees.value = _nlng;
                CoordinateSetterPopup.LongitudeDirection.value = _nlngDir;
                CoordinateSetterPopup.Position.value = ZERO_COORDINATE_ID;
                _readCoordinateFromCoordinateSetterPopup();
                _writeToObserverPositionLabel();
            }
        } else {
            //[DEBUG_MESSAGE]
            if (DEBUG === true) {
                console.log("[DEBUG_MESSAGE] not fount closestIndex");
            }
            return;
        }
        m_isGeolocated = true;
        weatherController.initWeather(m_latitude, m_longitude, isMobile);
    };

    var ZERO_COORDINATE_ID = 1695;
    var idToIndexMap = {};
    var locations = [
        ["0", ["36.18:North", "68.73:East", "AFGHANISTAN - Baghlan"]],
        ["1", ["33.55:North", "68.43:East", "AFGHANISTAN - Ghazni"]],
        ["2", ["34.33:North", "62.20:East", "AFGHANISTAN - Herat"]],
        ["3", ["34.43:North", "70.47:East", "AFGHANISTAN - Jalalabad"]],
        ["4", ["34.52:North", "69.20:East", "AFGHANISTAN - KABUL"]],
        ["5", ["35.88:North", "64.63:East", "AFGHANISTAN - Maymana"]],
        ["6", ["36.70:North", "67.10:East", "AFGHANISTAN - Mazar-i-Sharif"]],
        ["7", ["35.92:North", "68.75:East", "AFGHANISTAN - Pul-i-Khomri"]],
        ["8", ["31.58:North", "65.75:East", "AFGHANISTAN - Qandahar"]],
        ["9", ["36.75:North", "68.85:East", "AFGHANISTAN - Qonduz"]],
        ["10", ["40.72:North", "19.77:East", "ALBANIA - Berat"]],
        ["11", ["41.30:North", "19.47:East", "ALBANIA - Durres"]],
        ["12", ["41.12:North", "20.08:East", "ALBANIA - Elbasan"]],
        ["13", ["40.72:North", "19.55:East", "ALBANIA - Fier"]],
        ["14", ["40.63:North", "20.73:East", "ALBANIA - Korce"]],
        ["15", ["40.92:North", "19.68:East", "ALBANIA - Lushnje"]],
        ["16", ["42.05:North", "19.02:East", "ALBANIA - Shkoder"]],
        ["17", ["41.33:North", "19.82:East", "ALBANIA - TIRANE"]],
        ["18", ["40.48:North", "19.48:East", "ALBANIA - Vlore"]],
        ["19", ["36.83:North", "3.00:East", "ALGERIA - ALGIERS"]],
        ["20", ["36.92:North", "7.78:East", "ALGERIA - Annaba"]],
        ["21", ["35.57:North", "6.18:East", "ALGERIA - Batna"]],
        ["22", ["31.62:North", "2.22:West", "ALGERIA - Bechar"]],
        ["23", ["36.82:North", "5.05:East", "ALGERIA - Bejaia"]],
        ["24", ["36.50:North", "2.83:East", "ALGERIA - Blida"]],
        ["25", ["36.37:North", "6.67:East", "ALGERIA - Constantine"]],
        ["26", ["36.17:North", "1.33:East", "ALGERIA - Ech-Cheliff"]],
        ["27", ["35.75:North", "0.63:West", "ALGERIA - Oran"]],
        ["28", ["36.18:North", "5.4:East", "ALGERIA - Setif"]],
        ["29", ["35.25:North", "0.65:West", "ALGERIA - Sidi-Bel-Abbes"]],
        ["30", ["36.88:North", "6.9:East", "ALGERIA - Skikda"]],
        ["31", ["34.88:North", "1.35:West", "ALGERIA - Tlemcen"]],
        ["32", ["14.28:South", "170.7:West", "AMERICAN SAMOA - Fatatogo"]],
        ["33", ["14.22:South", "169.43:West", "AMERICAN SAMOA - Fitihuta"]],
        ["34", ["14.35:South", "170.78:West", "AMERICAN SAMOA - Leone"]],
        ["35", ["14.23:South", "169.52:West", "AMERICAN SAMOA - Luma"]],
        ["36", ["14.27:South", "170.7:West", "AMERICAN SAMOA - PAGO"]],
        ["37", ["14.28:South", "170.68:West", "AMERICAN SAMOA - Utulei"]],
        ["38", ["14.37:South", "170.73:West", "AMERICAN SAMOA - Vaitogi"]],
        ["39", ["42.5:North", "1.5:East", "ANDORRA - ANDORRA LA VELLA"]],
        ["40", ["42.55:North", "1.6:East", "ANDORRA - Canillo"]],
        ["41", ["42.53:North", "1.58:East", "ANDORRA - Encamp"]],
        ["42", ["42.53:North", "1.52:East", "ANDORRA - La Massana"]],
        ["43", ["42.5:North", "1.53:East", "ANDORRA - Les Escaldes"]],
        ["44", ["42.55:North", "1.53:East", "ANDORRA - Ordino"]],
        ["45", ["42.47:North", "1.5:East", "ANDORRA - Sant Julia"]],
        ["46", ["12.57:South", "13.4:East", "ANGOLA - Benguela"]],
        ["47", ["12.73:South", "15.78:East", "ANGOLA - Huambo"]],
        ["48", ["12.33:South", "13.57:East", "ANGOLA - Lobito"]],
        ["49", ["8.83:South", "13.25:East", "ANGOLA - LUANDA"]],
        ["50", ["14.92:South", "13.5:East", "ANGOLA - Lubango"]],
        ["51", ["9.53:South", "13.33:East", "ANGOLA - Malanje"]],
        ["52", ["15.17:South", "12.15:East", "ANGOLA - Namibe"]],
        ["53", ["17.05:North", "61.8:West", "ANTIGUA - BARBUDA - All Saints"]],
        ["54", ["17.03:North", "61.88:West", "ANTIGUA - BARBUDA - Bolands"]],
        ["55", ["17.72:North", "61.82:West", "ANTIGUA - BARBUDA - Codrington"]],
        ["56", ["17.02:North", "61.83:West", "ANTIGUA - BARBUDA - Old Road"]],
        ["57", ["17.13:North", "61.83:West", "ANTIGUA - BARBUDA - SAINT JOHNS"]],
        ["58", ["17.03:North", "61.87:West", "ANTIGUA - BARBUDA - Urlins"]],
        ["59", ["38.75:South", "62.25:West", "ARGENTINA - Bahia Blanca"]],
        ["60", ["34.67:South", "58.5:West", "ARGENTINA - BUENOS AIRES"]],
        ["61", ["31.42:South", "64.18:West", "ARGENTINA - Cordoba"]],
        ["62", ["34.87:South", "57.92:West", "ARGENTINA - La Plata"]],
        ["63", ["38:South", "57.5:West", "ARGENTINA - Mar del Plata"]],
        ["64", ["32.8:South", "68.87:West", "ARGENTINA - Mendoza"]],
        ["65", ["33:South", "60.67:West", "ARGENTINA - Rosario"]],
        ["66", ["24.77:South", "65.47:West", "ARGENTINA - Salta"]],
        ["67", ["31.55:South", "68.52:West", "ARGENTINA - San Juan"]],
        ["68", ["26.78:South", "65.25:West", "ARGENTINA - San Miguel de Tucumn"]],
        ["69", ["31.58:South", "60.68:West", "ARGENTINA - Santa Fe"]],
        ["70", ["40.18:North", "44.5:East", "ARMENIA - Yerevan"]],
        ["71", ["12.55:North", "70.1:West", "ARUBA - ORANJESTAD"]],
        ["72", ["12.52:North", "69.98:West", "ARUBA - Santa Cruz"]],
        ["73", ["12.45:North", "69.87:West", "ARUBA - Sint Nicolaas"]],
        ["74", ["34.93:South", "138.6:East", "AUSTRALIA - Adelaide"]],
        ["75", ["27.5:South", "153:East", "AUSTRALIA - Brisbane"]],
        ["76", ["35.3:South", "149.13:East", "AUSTRALIA - CANBERRA"]],
        ["77", ["12.47:South", "130.83:East", "AUSTRALIA - Darwin"]],
        ["78", ["38.17:South", "144.43:East", "AUSTRALIA - Geelong"]],
        ["79", ["27.98:South", "153.37:East", "AUSTRALIA - Gold Coast"]],
        ["80", ["42.9:South", "147.3:East", "AUSTRALIA - Hobart"]],
        ["81", ["37.75:South", "144.97:East", "AUSTRALIA - Melbourne"]],
        ["82", ["33:South", "151.92:East", "AUSTRALIA - Newcastle"]],
        ["83", ["31.95:South", "115.87:East", "AUSTRALIA - Perth"]],
        ["84", ["33.88:South", "151.17:East", "AUSTRALIA - Sydney"]],
        ["85", ["19.27:South", "146.8:East", "AUSTRALIA - Townsville"]],
        ["86", ["34.43:South", "151.08:East", "AUSTRALIA - Wollongong"]],
        ["87", ["47.08:North", "15.37:East", "AUSTRIA - Graz"]],
        ["88", ["47.28:North", "11.42:East", "AUSTRIA - Innsbruck"]],
        ["89", ["46.63:North", "14.33:East", "AUSTRIA - Klagenfurt"]],
        ["90", ["48.32:North", "14.3:East", "AUSTRIA - Linz"]],
        ["91", ["47.8:North", "13.05:East", "AUSTRIA - Salzburg"]],
        ["92", ["48.22:North", "15.62:East", "AUSTRIA - Sankt Poelten"]],
        ["93", ["48.07:North", "14.42:East", "AUSTRIA - Steyr"]],
        ["94", ["48.22:North", "16.37:East", "AUSTRIA - VIENNA"]],
        ["95", ["46.62:North", "13.85:East", "AUSTRIA - Villach"]],
        ["96", ["48.17:North", "14.03:East", "AUSTRIA - Wels"]],
        ["97", ["40.37:North", "49.88:East", "AZERBAIJAN - Baku"]],
        ["98", ["24.72:North", "77.78:West", "BAHAMAS - Andros Town"]],
        ["99", ["26.5:North", "78.7:West", "BAHAMAS - Freeport"]],
        ["100", ["23.5:North", "75.77:West", "BAHAMAS - George Town"]],
        ["101", ["24.03:North", "77.55:West", "BAHAMAS - Kemps Bay"]],
        ["102", ["20.95:North", "73.67:West", "BAHAMAS - Mathew Town"]],
        ["103", ["25.08:North", "77.33:West", "BAHAMAS - NASSAU"]],
        ["104", ["25.13:North", "78:West", "BAHAMAS - Nicolls Town"]],
        ["105", ["26.68:North", "78.97:West", "BAHAMAS - West End"]],
        ["106", ["26.23:North", "50.7:East", "BAHRAIN - Hidd"]],
        ["107", ["26.17:North", "50.05:East", "BAHRAIN - Isa Town"]],
        ["108", ["26.23:North", "50.55:East", "BAHRAIN - Jidhafs"]],
        ["109", ["26.2:North", "50.63:East", "BAHRAIN - MANAMA"]],
        ["110", ["26.25:North", "50.65:East", "BAHRAIN - Muharraq"]],
        ["111", ["22.68:North", "90.33:East", "BANGLADESH - Barisal"]],
        ["112", ["22.33:North", "91.8:East", "BANGLADESH - Chittagong"]],
        ["113", ["23.47:North", "91.17:East", "BANGLADESH - Comilla"]],
        ["114", ["23.7:North", "90.37:East", "BANGLADESH - DACCA"]],
        ["115", ["23.17:North", "89.2:East", "BANGLADESH - Jessore"]],
        ["116", ["22.82:North", "89.57:East", "BANGLADESH - Khulna"]],
        ["117", ["24.75:North", "90.4:East", "BANGLADESH - Mymensingh"]],
        ["118", ["23.6:North", "90.47:East", "BANGLADESH - Narayanganj"]],
        ["119", ["24.4:North", "88.67:East", "BANGLADESH - Rajshahi"]],
        ["120", ["25.75:North", "89.35:East", "BANGLADESH - Rangpur"]],
        ["121", ["25.8:North", "89:East", "BANGLADESH - Saidpur"]],
        ["122", ["24.88:North", "91.85:East", "BANGLADESH - Sylhet"]],
        ["123", ["13.22:North", "59.52:West", "BARBADOS - Bathsheba"]],
        ["124", ["13.1:North", "59.62:West", "BARBADOS - BRIDGETOWN"]],
        ["125", ["13.32:North", "59.63:West", "BARBADOS - Crab Hill"]],
        ["126", ["13.07:North", "59.58:West", "BARBADOS - Hastings"]],
        ["127", ["13.18:North", "59.65:West", "BARBADOS - Holetown"]],
        ["128", ["13.25:North", "59.65:West", "BARBADOS - Speightstown"]],
        ["129", ["53.85:North", "27.5:East", "BELARUS - Minsk"]],
        ["130", ["50.93:North", "4.03:East", "BELGIUM - Aalst"]],
        ["131", ["51.22:North", "4.42:East", "BELGIUM - Antwerp"]],
        ["132", ["51.22:North", "3.23:East", "BELGIUM - Bruges"]],
        ["133", ["50.83:North", "4.35:East", "BELGIUM - BRUSSELS"]],
        ["134", ["50.42:North", "4.45:East", "BELGIUM - Charleroi"]],
        ["135", ["51.03:North", "3.7:East", "BELGIUM - Ghent"]],
        ["136", ["50.83:North", "3.28:East", "BELGIUM - Kortrijk"]],
        ["137", ["50.88:North", "4.7:East", "BELGIUM - Leuven"]],
        ["138", ["50.63:North", "5.58:East", "BELGIUM - Liege"]],
        ["139", ["51.03:North", "4.48:East", "BELGIUM - Mechelen"]],
        ["140", ["50.47:North", "3.97:East", "BELGIUM - Mons"]],
        ["141", ["50.47:North", "4.87:East", "BELGIUM - Namur"]],
        ["142", ["51.22:North", "2.92:East", "BELGIUM - Oostende"]],
        ["143", ["17.48:North", "88.17:West", "BELIZE - Belize City"]],
        ["144", ["17.22:North", "88.8:West", "BELIZE - BELMOPAN"]],
        ["145", ["18.38:North", "88.38:West", "BELIZE - Corozal"]],
        ["146", ["16.98:North", "88.22:West", "BELIZE - Dangriga"]],
        ["147", ["18.1:North", "88.52:West", "BELIZE - Orange Walk"]],
        ["148", ["7.23:North", "2:East", "BENIN - Abomey"]],
        ["149", ["6.4:North", "2.52:East", "BENIN - Cotonou"]],
        ["150", ["10.28:North", "1.48:East", "BENIN - Natitingou"]],
        ["151", ["9.38:North", "2.67:East", "BENIN - Parakou"]],
        ["152", ["6.5:North", "2.78:East", "BENIN - PORTO NOVO"]],
        ["153", ["32.3:North", "64.8:West", "BERMUDA - HAMILTON"]],
        ["154", ["32.4:North", "64.7:West", "BERMUDA - Saint George"]],
        ["155", ["32.32:North", "64.72:West", "BERMUDA - The Flatts Village"]],
        ["156", ["32.37:North", "64.67:West", "BERMUDA - Tuckers Town"]],
        ["157", ["26.92:North", "90.88:East", "BHUTAN - Bumthang"]],
        ["158", ["27.38:North", "89.52:East", "BHUTAN - Paro"]],
        ["159", ["26.88:North", "89.38:East", "BHUTAN - Phuntsholing"]],
        ["160", ["27.63:North", "89.83:East", "BHUTAN - Punakha"]],
        ["161", ["27.08:North", "89.92:East", "BHUTAN - Taga Dzong"]],
        ["162", ["27.53:North", "89.75:East", "BHUTAN - THIMPHU"]],
        ["163", ["27.55:North", "90.5:East", "BHUTAN - Tongsa Dzong"]],
        ["164", ["17.43:South", "66.17:West", "BOLIVIA - Cochabamba"]],
        ["165", ["16.5:South", "68.17:West", "BOLIVIA - LA PAZ"]],
        ["166", ["17.98:South", "67.13:West", "BOLIVIA - Oruro"]],
        ["167", ["19.57:South", "65.75:West", "BOLIVIA - Potosi"]],
        ["168", ["17.75:South", "63.23:West", "BOLIVIA - Santa Cruz"]],
        ["169", ["19.08:South", "65.25:West", "BOLIVIA - Sucre"]],
        ["170", ["21.55:South", "64.75:West", "BOLIVIA - Tarija"]],
        ["1660", ["44.77:North", "17.18:East", "BOSNIA - Banja Luka"]],
        ["1669", ["43.87:North", "18.43:East", "BOSNIA - Sarajevo"]],
        ["171", ["21.97:South", "28.43:East", "BOTSWANA - Bobonong"]],
        ["172", ["21.12:South", "27.53:East", "BOTSWANA - Francistown"]],
        ["173", ["24.75:South", "25.92:East", "BOTSWANA - GABORONE"]],
        ["174", ["24.98:South", "25.32:East", "BOTSWANA - Kanye"]],
        ["175", ["25.18:South", "25.67:East", "BOTSWANA - Lobatse"]],
        ["176", ["23.08:South", "26.85:East", "BOTSWANA - Mahalapye"]],
        ["177", ["20:South", "23.42:East", "BOTSWANA - Maun"]],
        ["178", ["24.47:South", "26.08:East", "BOTSWANA - Mochudi"]],
        ["179", ["24.42:South", "25.5:East", "BOTSWANA - Molepolole"]],
        ["180", ["24.93:South", "25.83:East", "BOTSWANA - Ramotswa"]],
        ["181", ["21.97:South", "27.8:East", "BOTSWANA - Selebi-Phikwe"]],
        ["182", ["22.42:South", "26.73:East", "BOTSWANA - Serowe"]],
        ["183", ["20.43:South", "27.03:East", "BOTSWANA - Tutume"]],
        ["10008", ["27.0016:South", "48.6379:West", "BRAZIL - Balneario Camboriu"]],
        ["184", ["1.45:South", "48.48:West", "BRAZIL - Belem"]],
        ["185", ["19.92:South", "43.93:West", "BRAZIL - Belo Horizonte"]],
        ["186", ["15.75:South", "47.92:West", "BRAZIL - BRASILIA"]],
        ["187", ["22.9:South", "47.08:West", "BRAZIL - Campinas"]],
        ["188", ["25.42:South", "49.42:West", "BRAZIL - Curitiba"]],
        ["10009", ["27.5986:South", "48.5187:West", "BRAZIL - Forianopolis"]],
        ["189", ["3.75:South", "38.58:West", "BRAZIL - Fortaleza"]],
        ["190", ["16.67:South", "49.27:West", "BRAZIL - Goiania"]],
        ["191", ["3.13:South", "60.02:West", "BRAZIL - Manaus"]],
        ["192", ["22.75:South", "43.47:West", "BRAZIL - Nova Iguacu"]],
        ["193", ["30.05:South", "51.17:West", "BRAZIL - Porto Alegre"]],
        ["194", ["8.1:South", "34.88:West", "BRAZIL - Recife"]],
        ["195", ["22.88:South", "43.28:West", "BRAZIL - Rio de Janeiro"]],
        ["196", ["12.97:South", "38.48:West", "BRAZIL - Salvador"]],
        ["197", ["22.85:South", "43.07:West", "BRAZIL - Sao Goncalo"]],
        ["198", ["2.57:South", "44.27:West", "BRAZIL - Sao luis"]],
        ["199", ["23.55:South", "46.65:West", "BRAZIL - Sao Paulo"]],
        ["10000", ["5.092:South", "42.803:West", "BRAZIL - Teresina"]],
        ["200", ["4.93:North", "114.97:East", "BRUNEI - BANDAR SERI BEGAWAN"]],
        ["201", ["4.63:North", "114.2:East", "BRUNEI - Kuala Belait"]],
        ["202", ["4.65:North", "114.38:East", "BRUNEI - Seria"]],
        ["203", ["42.5:North", "27.48:East", "BULGARIA - Burgas"]],
        ["204", ["42.6:North", "23.05:East", "BULGARIA - Pernik"]],
        ["205", ["43.42:North", "24.67:East", "BULGARIA - Pleven"]],
        ["206", ["42.13:North", "24.75:East", "BULGARIA - Plovdiv"]],
        ["207", ["43.83:North", "27.98:East", "BULGARIA - Ruse"]],
        ["208", ["43.28:North", "26.92:East", "BULGARIA - Shumen"]],
        ["209", ["42.67:North", "26.32:East", "BULGARIA - Sliven"]],
        ["210", ["42.67:North", "23.3:East", "BULGARIA - SOFIA"]],
        ["211", ["42.42:North", "25.62:East", "BULGARIA - Stara Zagora"]],
        ["212", ["43.57:North", "27.85:East", "BULGARIA - Tolbukhin"]],
        ["213", ["43.2:North", "27.95:East", "BULGARIA - Varna"]],
        ["214", ["10.6:North", "4.75:West", "BURKINA FASO - Banfora"]],
        ["215", ["11.18:North", "4.3:West", "BURKINA FASO - Bobo-Dioulasso"]],
        ["216", ["12.07:North", "0.43:East", "BURKINA FASO - Fada NGourma"]],
        ["217", ["13.07:North", "1.15:West", "BURKINA FASO - Kaya"]],
        ["218", ["12.25:North", "2.38:West", "BURKINA FASO - Koudougou"]],
        ["219", ["12.33:North", "1.67:West", "BURKINA FASO - OUAGADOUGOU"]],
        ["220", ["13.52:North", "2.33:West", "BURKINA FASO - Ouahigouya"]],
        ["221", ["11.9:North", "0.37:West", "BURKINA FASO - Tenkodogo"]],
        ["222", ["3.37:South", "29.32:East", "BURUNDI - BUJUMBURA"]],
        ["223", ["3.95:South", "29.58:East", "BURUNDI - Bururi"]],
        ["224", ["3.4:South", "29.93:East", "BURUNDI - Gitega"]],
        ["225", ["2.9:South", "29.8:East", "BURUNDI - Ngozi"]],
        ["226", ["3.97:South", "29.43:East", "BURUNDI - Rumonge"]],
        ["227", ["13.1:North", "103.2:East", "CAMBODIA - Battambang"]],
        ["228", ["10.62:North", "104.18:East", "CAMBODIA - Kampot"]],
        ["229", ["12.27:North", "104.65:East", "CAMBODIA - Kompong Cham"]],
        ["230", ["12.25:North", "104.67:East", "CAMBODIA - Kompong Chhang"]],
        ["231", ["12.48:North", "106.02:East", "CAMBODIA - Kratie"]],
        ["232", ["11.58:North", "104.92:East", "CAMBODIA - PHNOM PENH"]],
        ["233", ["12.53:North", "103.92:East", "CAMBODIA - Pursat"]],
        ["234", ["13.37:North", "103.85:East", "CAMBODIA - Siem Reap"]],
        ["235", ["13.1:North", "103.2:East", "CAMBODIA - Svay Rieng"]],
        ["236", ["5.52:North", "10.42:East", "CAMEROON - Bafoussam"]],
        ["237", ["5.92:North", "10.15:East", "CAMEROON - Bamenda"]],
        ["238", ["4.07:North", "9.72:East", "CAMEROON - Douala"]],
        ["239", ["5.72:North", "10.92:East", "CAMEROON - Foumban"]],
        ["240", ["9.28:North", "13.37:East", "CAMEROON - Garoua"]],
        ["241", ["4.65:North", "9.43:East", "CAMEROON - Kumba"]],
        ["242", ["4.02:North", "9.17:East", "CAMEROON - Limbe"]],
        ["243", ["10.58:North", "14.33:East", "CAMEROON - Maroua"]],
        ["244", ["4.98:North", "9.88:East", "CAMEROON - Nkongsamba"]],
        ["245", ["3.85:North", "11.52:East", "CAMEROON - YAOUNDE"]],
        ["246", ["51.08:North", "114.08:West", "CANADA - Calgary"]],
        ["247", ["53.57:North", "113.42:West", "CANADA - Edmonton"]],
        ["248", ["44.65:North", "63.6:West", "CANADA - Halifax"]],
        ["249", ["43.25:North", "79.83:West", "CANADA - Hamilton"]],
        ["250", ["45.5:North", "73.6:West", "CANADA - Montreal"]],
        ["251", ["43.1:North", "79.07:West", "CANADA - Niagara Falls"]],
        ["252", ["45.42:North", "75.72:West", "CANADA - OTTAWA"]],
        ["253", ["46.83:North", "71.25:West", "CANADA - Quebec"]],
        ["254", ["50.42:North", "104.65:West", "CANADA - Regina"]],
        ["255", ["47.57:North", "52.72:West", "CANADA - Saint Johns"]],
        ["256", ["48.38:North", "89.25:West", "CANADA - Thunder Bay"]],
        ["257", ["43.7:North", "79.42:West", "CANADA - Toronto"]],
        ["258", ["49.22:North", "123.1:West", "CANADA - Vancouver"]],
        ["259", ["48.42:North", "123.37:West", "CANADA - Victoria"]],
        ["260", ["49.88:North", "97.17:West", "CANADA - Winnipeg"]],
        ["261", ["16.9:North", "25:West", "CAPE VERDE - Mindelo"]],
        ["262", ["14.92:North", "23.5:West", "CAPE VERDE - PRAIA"]],
        ["263", ["17.2:North", "25.05:West", "CAPE VERDE - Ribeira Grande"]],
        ["264", ["16.2:North", "22.97:West", "CAPE VERDE - Sal Rei"]],
        ["265", ["16.63:North", "22.95:West", "CAPE VERDE - Santa Maria"]],
        ["266", ["19.28:North", "81.25:West", "CAYMAN ISLANDS - Bodden Town"]],
        ["267", ["19.37:North", "81.38:West", "CAYMAN ISLANDS - Botabano"]],
        ["268", ["19.3:North", "81.2:West", "CAYMAN ISLANDS - Breakers"]],
        ["269", ["19.3:North", "81.38:West", "CAYMAN ISLANDS - GEORGE TOWN"]],
        ["270", ["19.32:North", "81.1:West", "CAYMAN ISLANDS - Gun Bay"]],
        ["271", ["19.28:North", "81.3:West", "CAYMAN ISLANDS - Savannah"]],
        ["272", ["19.37:North", "81.4:West", "CAYMAN ISLANDS - West Bay"]],
        ["273", ["5.67:North", "20.62:East", "CENTRAL AFRICAN REP. - Bambari"]],
        ["274", ["4.68:North", "22.8:East", "CENTRAL AFRICAN REP. - Bangassou"]],
        ["275", ["4.38:North", "18.62:East", "CENTRAL AFRICAN REP. - BANGUI"]],
        ["276", ["4.32:North", "15.25:East", "CENTRAL AFRICAN REP. - Berberati"]],
        ["277", ["5.97:North", "15.58:East", "CENTRAL AFRICAN REP. - Bouar"]],
        ["278", ["3.88:North", "18.02:East", "CENTRAL AFRICAN REP. - Mbaiki"]],
        ["279", ["13.82:North", "20.82:East", "CHAD - Abeche"]],
        ["280", ["10.3:North", "15.33:East", "CHAD - Bongor"]],
        ["281", ["8.67:North", "16.83:East", "CHAD - Doba"]],
        ["282", ["9.35:North", "15.83:East", "CHAD - Kelo"]],
        ["283", ["8.93:North", "17.53:East", "CHAD - Koumra"]],
        ["284", ["9.37:North", "16.23:East", "CHAD - Lai"]],
        ["285", ["8.88:North", "16.02:East", "CHAD - Moundou"]],
        ["286", ["12.17:North", "14.98:East", "CHAD - NDJAMENA"]],
        ["287", ["9.13:North", "18.37:East", "CHAD - Sarh"]],
        ["288", ["23.67:South", "70.38:West", "CHILE - Antofagasta"]],
        ["289", ["18.5:South", "70.33:West", "CHILE - Arica"]],
        ["290", ["36.83:South", "73.05:West", "CHILE - Concepcion"]],
        ["291", ["41.47:South", "72.95:West", "CHILE - Puerto Montt"]],
        ["292", ["53.15:South", "70.92:West", "CHILE - Punta Arenas"]],
        ["293", ["34.17:South", "70.75:West", "CHILE - Rancagua"]],
        ["294", ["33.5:South", "70.67:West", "CHILE - SANTIAGO"]],
        ["295", ["35.47:South", "71.67:West", "CHILE - Talca"]],
        ["296", ["36.67:South", "73.17:West", "CHILE - Talcahuano"]],
        ["297", ["38.75:South", "72.67:West", "CHILE - Temuco"]],
        ["298", ["33.08:South", "71.67:West", "CHILE - Valparaiso"]],
        ["299", ["33.03:South", "71.58:West", "CHILE - Vina del Mar"]],
        ["300", ["39.92:North", "116.43:East", "CHINA - BEIJING"]],
        ["301", ["43.88:North", "125.32:East", "CHINA - Changchun"]],
        ["302", ["30.62:North", "104.1:East", "CHINA - Chengdu"]],
        ["303", ["29.5:North", "106.58:East", "CHINA - Chongqing"]],
        ["304", ["38.88:North", "121.58:East", "CHINA - Dalian"]],
        ["305", ["23.13:North", "113.33:East", "CHINA - Guangzhou"]],
        ["306", ["45.75:North", "126.68:East", "CHINA - Harbin"]],
        ["307", ["36.67:North", "116.95:East", "CHINA - Jinan"]],
        ["308", ["32.05:North", "118.78:East", "CHINA - Nanjing"]],
        ["309", ["31.1:North", "121.37:East", "CHINA - Shanghai"]],
        ["310", ["41.83:North", "123.43:East", "CHINA - Shenyang"]],
        ["311", ["37.92:North", "112.5:East", "CHINA - Taiyuan"]],
        ["312", ["39.13:North", "117.2:East", "CHINA - Tianjin"]],
        ["313", ["36.75:North", "114.25:East", "CHINA - Wuhan"]],
        ["314", ["34.27:North", "108.9:East", "CHINA - Xian"]],
        ["315", ["11.17:North", "74.83:West", "COLOMBIA - Barranquilla"]],
        ["316", ["4.63:North", "75.07:West", "COLOMBIA - BOGOTA"]],
        ["317", ["7.13:North", "73.17:West", "COLOMBIA - Bucaramanga"]],
        ["318", ["7.92:North", "72.52:West", "COLOMBIA - C£cuta"]],
        ["319", ["3.4:North", "76.5:West", "COLOMBIA - Cali"]],
        ["320", ["10.4:North", "75.55:West", "COLOMBIA - Cartagena"]],
        ["321", ["4.42:North", "75.33:West", "COLOMBIA - Ibagu‚"]],
        ["322", ["5.05:North", "75.53:West", "COLOMBIA - Manizales"]],
        ["323", ["6.25:North", "75.6:West", "COLOMBIA - Medell¡n"]],
        ["324", ["4.78:North", "75.77:West", "COLOMBIA - Pereira"]],
        ["325", ["12.3:South", "43.77:East", "COMOROS - Fomboni"]],
        ["326", ["11.37:South", "43.35:East", "COMOROS - Mitsamiouli"]],
        ["327", ["11.67:South", "43.27:East", "COMOROS - MORONI"]],
        ["328", ["12.17:South", "44.42:East", "COMOROS - Mutsamudu"]],
        ["329", ["4.23:South", "15.23:East", "CONGO - BRAZZAVILLE"]],
        ["330", ["4.73:South", "11.87:East", "CONGO - Loandjili"]],
        ["331", ["4.15:South", "12.78:East", "CONGO - Loubomo"]],
        ["332", ["2.92:South", "12.8:East", "CONGO - Mossendjo"]],
        ["333", ["4.1:South", "15.08:East", "CONGO - Ngamaba-Mfilou"]],
        ["334", ["4.12:South", "13.28:East", "CONGO - Nkayi"]],
        ["335", ["4.77:South", "11.88:East", "CONGO - Pointe-Noire"]],
        ["336", ["2.5:South", "28.83:East", "CONGO (Dem. Rep.) - Bukavu"]],
        ["337", ["5.93:South", "29.2:East", "CONGO (Dem. Rep.) - Kalemie"]],
        ["338", ["8.73:South", "25:East", "CONGO (Dem. Rep.) - Kamina"]],
        ["339", ["5.88:South", "22.43:East", "CONGO (Dem. Rep.) - Kananga"]],
        ["340", ["5.03:South", "18.85:East", "CONGO (Dem. Rep.) - Kikwit"]],
        ["341", ["4.3:South", "15.3:East", "CONGO (Dem. Rep.) - KINSHASA"]],
        ["342", ["0.55:North", "25.23:East", "CONGO (Dem. Rep.) - Kisangani"]],
        ["343", ["10.97:South", "26.78:East", "CONGO (Dem. Rep.) - Likasi"]],
        ["344", ["11.68:South", "27.48:East", "CONGO (Dem. Rep.) - Lubumbashi"]],
        ["345", ["5.83:South", "13.53:East", "CONGO (Dem. Rep.) - Matadi"]],
        ["346", ["0.05:North", "18.27:East", "CONGO (Dem. Rep.) - Mbandaka"]],
        ["347", ["6.17:South", "23.65:East", "CONGO (Dem. Rep.) - Mbuji-Mayi"]],
        ["348", ["17:South", "163:West", "COOK ISLANDS - (to N.Z.)"]],
        ["349", ["10:North", "84.2:West", "COSTA RICA - Alajuela"]],
        ["350", ["10:North", "83.87:West", "COSTA RICA - Cartago"]],
        ["351", ["10:North", "84.13:West", "COSTA RICA - Heredia"]],
        ["352", ["10.65:North", "85.47:West", "COSTA RICA - Liberia"]],
        ["353", ["10:North", "83.02:West", "COSTA RICA - Limon"]],
        ["354", ["10:North", "84.83:West", "COSTA RICA - Puntarenas"]],
        ["355", ["9.98:North", "84.07:West", "COSTA RICA - SAN JOS"]],
        ["356", ["5.32:North", "4.02:West", "COTE DIVOIRE - ABIDJAN"]],
        ["357", ["7.7:North", "5:West", "COTE DIVOIRE - Bouake"]],
        ["358", ["6.93:North", "6.47:West", "COTE DIVOIRE - Daloa"]],
        ["359", ["6.13:North", "5.93:West", "COTE DIVOIRE - Gagnoa"]],
        ["360", ["9.37:North", "5.52:West", "COTE DIVOIRE - Korhogo"]],
        ["361", ["7.4:North", "7.62:West", "COTE DIVOIRE - Man"]],
        ["362", ["5.23:North", "3.97:West", "COTE DIVOIRE - Port-Bouet"]],
        ["363", ["6.82:North", "5.28:West", "COTE DIVOIRE - Yamoussoukro"]],
        ["1666", ["45.55:North", "18.68:East", "CROATIA - Osijek"]],
        ["1668", ["45.33:North", "14.45:East", "CROATIA - Rijeka"]],
        ["1671", ["43.52:North", "16.47:East", "CROATIA - Split"]],
        ["1672", ["45.8:North", "15.97:East", "CROATIA - Zagreb"]],
        ["364", ["20.38:North", "76.65:West", "CUBA - Bayamo"]],
        ["365", ["21.42:North", "77.92:West", "CUBA - Camagey"]],
        ["366", ["22.17:North", "80.45:West", "CUBA - Cienfuegos"]],
        ["367", ["19.98:North", "75.17:West", "CUBA - Guant namo"]],
        ["368", ["23.12:North", "82.42:West", "CUBA - HAVANA"]],
        ["369", ["20.9:North", "76.25:West", "CUBA - Holguin"]],
        ["370", ["20.97:North", "76.98:West", "CUBA - Las Tunas"]],
        ["371", ["23.07:North", "81.58:West", "CUBA - Matanzas"]],
        ["372", ["22.4:North", "83.7:West", "CUBA - Pinar del Rio"]],
        ["373", ["22.42:North", "79.97:West", "CUBA - Santa Clara"]],
        ["374", ["20:North", "75.82:West", "CUBA - Santiago"]],
        ["375", ["35.12:North", "33.95:East", "CYPRUS - Famagusta"]],
        ["376", ["34.9:North", "33.65:East", "CYPRUS - Larnaca"]],
        ["377", ["34.67:North", "33.05:East", "CYPRUS - Limassol"]],
        ["378", ["35.15:North", "33.35:East", "CYPRUS - NICOSIA"]],
        ["380", ["49.22:North", "16.67:East", "CZECH - Brno"]],
        ["381", ["48.97:North", "14.48:East", "CZECH - Ceske Budejovice"]],
        ["382", ["50.22:North", "15.83:East", "CZECH - Hradec Kralove"]],
        ["384", ["50.8:North", "15.08:East", "CZECH - Liberec"]],
        ["385", ["49.63:North", "17.25:East", "CZECH - Olomouc"]],
        ["386", ["49.83:North", "18.25:East", "CZECH - Ostrava"]],
        ["387", ["50.05:North", "15.75:East", "CZECH - Pardubice"]],
        ["388", ["49.75:North", "13.42:East", "CZECH - Plzen"]],
        ["389", ["50.1:North", "14.43:East", "CZECH - PRAGUE"]],
        ["390", ["50.67:North", "14.03:East", "CZECH - Ustinad Labem"]],
        ["391", ["57.05:North", "9.93:East", "DENMARK - Aalborg"]],
        ["392", ["56.17:North", "10.22:East", "DENMARK - Aarhus"]],
        ["393", ["55.167:North", "15.00:East", "DENMARK - Bornholm"]],
        ["394", ["55.67:North", "12.58:East", "DENMARK - COPENHAGEN"]],
        ["395", ["55.47:North", "8.47:East", "DENMARK - Esbjerg"]],
        ["396", ["56.05:North", "12.63:East", "DENMARK - Helsingor"]],
        ["397", ["56.13:North", "8.98:East", "DENMARK - Herning"]],
        ["398", ["55.87:North", "9.87:East", "DENMARK - Horsens"]],
        ["399", ["55.48:North", "9.5:East", "DENMARK - Kolding"]],
        ["400", ["57.37:North", "9.42:East", "DENMARK - Løkken"]],
        ["401", ["55.23:North", "11.77:East", "DENMARK - Naestved"]],
        ["402", ["55.4:North", "10.42:East", "DENMARK - Odense"]],
        ["403", ["56.47:North", "10.05:East", "DENMARK - Randers"]],
        ["404", ["55.65:North", "12.12:East", "DENMARK - Roskilde"]],
        ["405", ["54.80:North", "11.637:East", "DENMARK - Sakskøbing"]],
        ["406", ["55.72:North", "9.55:East", "DENMARK - Vejle"]],
        ["407", ["11.17:North", "42.73:East", "DJIBOUTI - Ali-Sabiah"]],
        ["408", ["11.13:North", "42.33:East", "DJIBOUTI - Dikhil"]],
        ["409", ["11.6:North", "43.15:East", "DJIBOUTI - DJIBOUTI"]],
        ["410", ["11.98:North", "43.33:East", "DJIBOUTI - Obock"]],
        ["411", ["11.82:North", "42.93:East", "DJIBOUTI - Tadjourah"]],
        ["412", ["15.23:North", "61.32:West", "DOMINICA - Berekua"]],
        ["413", ["15.53:North", "61.3:West", "DOMINICA - Marigot"]],
        ["414", ["15.57:North", "61.45:West", "DOMINICA - Portsmouth"]],
        ["415", ["15.3:North", "61.38:West", "DOMINICA - ROSEAU"]],
        ["416", ["15.4:North", "61.43:West", "DOMINICA - Saint Joseph"]],
        ["417", ["18.22:North", "71.12:West", "DOMINICAN REP. - Barahona"]],
        ["418", ["18.45:North", "68.95:West", "DOMINICAN REP. - La Romana"]],
        ["419", ["19.25:North", "70.55:West", "DOMINICAN REP. - La Vega"]],
        ["420", ["19.8:North", "70.68:West", "DOMINICAN REP. - Puerto Plata"]],
        ["421", ["19.32:North", "70.25:West", "DOMINICAN REP. - San Fran. de Macori"]],
        ["422", ["18.82:North", "71.2:West", "DOMINICAN REP. - San Juan"]],
        ["423", ["18.5:North", "69.3:West", "DOMINICAN REP. - San Pedro de Macori"]],
        ["424", ["19.5:North", "70.67:West", "DOMINICAN REP. - Santiago"]],
        ["425", ["18.5:North", "69.95:West", "DOMINICAN REP. - SANTO DOMINGO"]],
        ["426", ["1.3:South", "78.65:West", "ECUADOR - Ambato"]],
        ["427", ["2.9:South", "79:West", "ECUADOR - Cuenca"]],
        ["428", ["0.93:North", "79.67:West", "ECUADOR - Esmeraldas"]],
        ["429", ["2.22:South", "79.9:West", "ECUADOR - Guayaquil"]],
        ["430", ["3.33:South", "79.95:West", "ECUADOR - Machala"]],
        ["431", ["0.98:South", "80.73:West", "ECUADOR - Manta"]],
        ["432", ["1.12:South", "80.47:West", "ECUADOR - Portoviejo"]],
        ["433", ["0.23:South", "78.5:West", "ECUADOR - QUITO"]],
        ["434", ["1.67:South", "78.63:West", "ECUADOR - Riobamba"]],
        ["435", ["30.97:North", "31.17:East", "EGYPT - Al-Mahallah al Kubra"]],
        ["436", ["31.05:North", "31.38:East", "EGYPT - Al-Mansurah"]],
        ["437", ["31.22:North", "29.92:East", "EGYPT - Alexandria"]],
        ["438", ["24.08:North", "32.88:East", "EGYPT - Aswan"]],
        ["439", ["27.18:North", "31.18:East", "EGYPT - Asyut"]],
        ["440", ["30.05:North", "31.25:East", "EGYPT - CAIRO"]],
        ["441", ["30.02:North", "31.17:East", "EGYPT - Giza"]],
        ["442", ["29.85:North", "31.33:East", "EGYPT - Helwan"]],
        ["443", ["31.28:North", "32.3:East", "EGYPT - Port Said"]],
        ["444", ["29.98:North", "32.55:East", "EGYPT - Suez"]],
        ["445", ["30.8:North", "31:East", "EGYPT - Tanta"]],
        ["446", ["30.58:North", "31.5:East", "EGYPT - Zagazig"]],
        ["447", ["13.7:North", "88.97:West", "EL SALVADOR - Cojutepeque"]],
        ["448", ["13.67:North", "89.3:West", "EL SALVADOR - Nueva San Salvador"]],
        ["449", ["13.47:North", "88.17:West", "EL SALVADOR - San Miguel"]],
        ["450", ["13.67:North", "89.17:West", "EL SALVADOR - SAN SALVADOR"]],
        ["451", ["14:North", "89.52:West", "EL SALVADOR - Santa Ana"]],
        ["452", ["13.72:North", "89.73:West", "EL SALVADOR - Sonsonate"]],
        ["453", ["1.85:North", "9.77:East", "EQUATORIAL GUINEA - Bata"]],
        ["454", ["2.13:North", "11.3:East", "EQUATORIAL GUINEA - Ebebiyin"]],
        ["455", ["1.43:North", "10.65:East", "EQUATORIAL GUINEA - Evinayong"]],
        ["456", ["3.45:North", "8.55:East", "EQUATORIAL GUINEA - Luba"]],
        ["457", ["3.75:North", "8.8:East", "EQUATORIAL GUINEA - MALABO"]],
        ["458", ["1.57:North", "9.63:East", "EQUATORIAL GUINEA - Mbini"]],
        ["459", ["1.67:North", "11.25:East", "EQUATORIAL GUINEA - Mongomo"]],
        ["460", ["59.42:North", "24.75:East", "ESTONIA - Tallinn"]],
        ["461", ["9.05:North", "38.83:East", "ETHIOPIA - ADDIS ABABA"]],
        ["462", ["15.33:North", "38.88:East", "ETHIOPIA - Asmera"]],
        ["463", ["11.62:North", "37.17:East", "ETHIOPIA - Bahr Dar"]],
        ["464", ["10.33:North", "37.75:East", "ETHIOPIA - Debre Markos"]],
        ["465", ["11.08:North", "39.67:East", "ETHIOPIA - Dessye"]],
        ["466", ["9.58:North", "41.83:East", "ETHIOPIA - Dire Dawa"]],
        ["467", ["12.65:North", "37.48:East", "ETHIOPIA - Gondar"]],
        ["468", ["9.33:North", "42.17:East", "ETHIOPIA - Harar"]],
        ["469", ["7.65:North", "36.78:East", "ETHIOPIA - Jimma"]],
        ["470", ["13.55:North", "39.5:East", "ETHIOPIA - Mekele"]],
        ["471", ["8.65:North", "39.32:East", "ETHIOPIA - Nazret"]],
        ["472", ["51.83:South", "59:West", "FALKLAND ISLANDS - Darwin"]],
        ["473", ["51.67:South", "59.02:West", "FALKLAND ISLANDS - San Carlos"]],
        ["474", ["51.7:South", "57.85:West", "FALKLAND ISLANDS - STANLEY"]],
        ["475", ["16.43:South", "179.4:East", "FIJI - Lambasa"]],
        ["476", ["17.62:South", "177.45:East", "FIJI - Lautoka"]],
        ["477", ["17.68:South", "178.83:East", "FIJI - Levuka"]],
        ["478", ["17.78:South", "177.48:East", "FIJI - Nadi"]],
        ["479", ["18.03:South", "175.53:East", "FIJI - Nausori"]],
        ["480", ["18.13:South", "177.5:East", "FIJI - Singatoka"]],
        ["481", ["18.13:South", "178.42:East", "FIJI - SUVA"]],
        ["482", ["60.17:North", "24.7:East", "FINLAND - Espoo"]],
        ["483", ["60.13:North", "25:East", "FINLAND - HELSINKI"]],
        ["484", ["62.27:North", "25.83:East", "FINLAND - Jyvaskyla"]],
        ["485", ["60.43:North", "26.92:East", "FINLAND - Kotka"]],
        ["486", ["62.9:North", "27.67:East", "FINLAND - Kuopio"]],
        ["487", ["61:North", "25.67:East", "FINLAND - Lahti"]],
        ["488", ["65:North", "25.43:East", "FINLAND - Oulu"]],
        ["489", ["61.47:North", "21.75:East", "FINLAND - Pori"]],
        ["490", ["61.53:North", "23.75:East", "FINLAND - Tampere"]],
        ["491", ["60.45:North", "22.25:East", "FINLAND - Turku"]],
        ["492", ["60.3:North", "24.95:East", "FINLAND - Vantaa"]],
        ["493", ["43.53:North", "5.43:East", "FRANCE - Aix-en-Provence"]],
        ["494", ["44.83:North", "0.57:West", "FRANCE - Bordeaux"]],
        ["495", ["48.4:North", "4.48:West", "FRANCE - Brest"]],
        ["496", ["47.32:North", "5.02:East", "FRANCE - Dijon"]],
        ["497", ["45.17:North", "5.72:East", "FRANCE - Grenoble"]],
        ["498", ["49.5:North", "0.1:East", "FRANCE - Le Havre"]],
        ["499", ["50.63:North", "3.07:East", "FRANCE - Lille"]],
        ["500", ["45.77:North", "4.83:East", "FRANCE - Lyon"]],
        ["501", ["43.3:North", "5.37:East", "FRANCE - Marseille"]],
        ["502", ["43.6:North", "3.88:East", "FRANCE - Montpellier"]],
        ["503", ["47.23:North", "1.58:West", "FRANCE - Nantes"]],
        ["504", ["43.7:North", "7.27:East", "FRANCE - Nice"]],
        ["505", ["48.87:North", "2.33:East", "FRANCE - PARIS"]],
        ["506", ["49.25:North", "4.03:East", "FRANCE - Reims"]],
        ["507", ["48.08:North", "1.68:West", "FRANCE - Rennes"]],
        ["508", ["45.43:North", "4.38:East", "FRANCE - Saint-Etienne"]],
        ["509", ["48.58:North", "7.75:East", "FRANCE - Strasbourg"]],
        ["510", ["43.12:North", "5.93:East", "FRANCE - Toulon"]],
        ["511", ["43.62:North", "1.45:East", "FRANCE - Toulouse"]],
        ["512", ["4.92:North", "52.3:West", "FRENCH GUIANA - CAYENNE"]],
        ["513", ["5.13:North", "52.62:West", "FRENCH GUIANA - Kourou"]],
        ["514", ["4.87:North", "52.27:West", "FRENCH GUIANA - Remire"]],
        ["515", ["5.48:North", "54.05:West", "FRENCH GUIANA - Saint Laurent"]],
        ["516", ["5.47:North", "53:West", "FRENCH GUIANA - Sinnamary"]],
        ["517", ["17.55:South", "149.78:West", "FRENCH POLYNESIA - Afareaitu"]],
        ["518", ["17.48:South", "149.45:West", "FRENCH POLYNESIA - Mahina"]],
        ["519", ["17.78:South", "149.4:West", "FRENCH POLYNESIA - Mataiea"]],
        ["520", ["17.75:South", "149.55:West", "FRENCH POLYNESIA - Papara"]],
        ["521", ["17.53:South", "149.57:West", "FRENCH POLYNESIA - PAPETTE"]],
        ["522", ["17.85:South", "149.25:West", "FRENCH POLYNESIA - Teahupoo"]],
        ["523", ["0.68:South", "10.22:East", "GABON - Lambarene"]],
        ["524", ["0.38:North", "9.42:East", "GABON - LIBREVILLE"]],
        ["525", ["1.83:South", "11.03:East", "GABON - Mouila"]],
        ["526", ["1.57:North", "11.52:East", "GABON - Oyem"]],
        ["527", ["0.67:South", "8.83:East", "GABON - Port Gentil"]],
        ["528", ["2.82:South", "11:East", "GABON - Tchibanga"]],
        ["529", ["13.48:North", "16.68:West", "GAMBIA - Bakau"]],
        ["530", ["13.47:North", "16.65:West", "GAMBIA - BANJUL"]],
        ["531", ["13.38:North", "14.25:West", "GAMBIA - Basse Santa Su"]],
        ["532", ["13.25:North", "16.65:West", "GAMBIA - Brikama"]],
        ["533", ["13.57:North", "15.62:West", "GAMBIA - Farefenni"]],
        ["534", ["13.52:North", "14.83:West", "GAMBIA - Georgetown"]],
        ["535", ["13.18:North", "16.77:West", "GAMBIA - Gunjur"]],
        ["536", ["13.53:North", "15.15:West", "GAMBIA - Serrekunda"]],
        ["537", ["13.4:North", "16.72:West", "GAMBIA - Sukuta"]],
        ["538", ["41.72:North", "44.82:East", "GEORGIA - Tbilisi"]],
        ["539", ["52.53:North", "13.42:East", "GERMANY - BERLIN"]],
        ["540", ["53.08:North", "8.8:East", "GERMANY - Bremen"]],
        ["541", ["50.93:North", "6.95:East", "GERMANY - Cologne"]],
        ["542", ["51.53:North", "7.45:East", "GERMANY - Dortmund"]],
        ["543", ["51.05:North", "13.75:East", "GERMANY - Dresden"]],
        ["544", ["51.42:North", "6.77:East", "GERMANY - Duisburg"]],
        ["545", ["51.22:North", "6.78:East", "GERMANY - Dusseldorf"]],
        ["546", ["51.43:North", "6.98:East", "GERMANY - Essen"]],
        ["547", ["50.1:North", "8.68:East", "GERMANY - Frankfurt"]],
        ["548", ["53.55:North", "10:East", "GERMANY - Hamburg"]],
        ["549", ["52.4:North", "9.73:East", "GERMANY - Hannover"]],
        ["550", ["51.33:North", "12.42:East", "GERMANY - Leipzig"]],
        ["551", ["48.13:North", "11.58:East", "GERMANY - Munich"]],
        ["552", ["49.45:North", "11.07:East", "GERMANY - Nurnberg"]],
        ["553", ["48.78:North", "9.2:East", "GERMANY - Stuttgart"]],
        ["554", ["5.55:North", "0.25:West", "GHANA - ACCRA"]],
        ["555", ["10.77:North", "0.87:West", "GHANA - Bolgatanga"]],
        ["556", ["5.08:North", "1.22:West", "GHANA - Cape Coast"]],
        ["557", ["6.58:North", "0.5:East", "GHANA - Ho"]],
        ["558", ["6.05:North", "0.28:West", "GHANA - Koforidua"]],
        ["559", ["6.68:North", "1.58:West", "GHANA - Kumasi"]],
        ["560", ["4.98:North", "1.72:West", "GHANA - Sekondi-Takoradi"]],
        ["561", ["7.33:North", "2.33:West", "GHANA - Sunyani"]],
        ["562", ["9.43:North", "0.82:West", "GHANA - Tamale"]],
        ["563", ["5.67:North", "0.02:West", "GHANA - Tema"]],
        ["564", ["38:North", "23.73:East", "GREECE - ATHENS"]],
        ["565", ["35.52:North", "24.02:East", "GREECE - Canea"]],
        ["566", ["35.33:North", "25.2:East", "GREECE - Iraklion"]],
        ["567", ["40.93:North", "24.42:East", "GREECE - Kavalla"]],
        ["568", ["39.63:North", "22.42:East", "GREECE - Larissa"]],
        ["569", ["38.23:North", "21.73:East", "GREECE - Patras"]],
        ["570", ["37.95:North", "23.7:East", "GREECE - Piraeus"]],
        ["571", ["41.08:North", "23.52:East", "GREECE - Serres"]],
        ["572", ["40.63:North", "22.97:East", "GREECE - Thessaloniki"]],
        ["573", ["39.37:North", "22.95:East", "GREECE - Volos"]],
        ["574", ["65.6:North", "37.68:West", "GREENLAND - Ammassalik"]],
        ["575", ["68.83:North", "51.2:West", "GREENLAND - Christianshab"]],
        ["576", ["68.83:North", "53:West", "GREENLAND - Egedesminde"]],
        ["577", ["62:North", "49.72:West", "GREENLAND - Frederikshab"]],
        ["578", ["69.25:North", "53.55:West", "GREENLAND - Godhavn"]],
        ["579", ["66.92:North", "53.5:West", "GREENLAND - Holsteinsborg"]],
        ["580", ["69.217:North", "51.1:West", "GREENLAND - Ilulissat"]],
        ["581", ["69.17:North", "51.08:West", "GREENLAND - Jakobshavn"]],
        ["582", ["60.72:North", "46.02:West", "GREENLAND - Julianehab"]],
        ["583", ["60.15:North", "45.25:West", "GREENLAND - Nanortalik"]],
        ["584", ["61.17:North", "45.32:West", "GREENLAND - Narsarsuaq"]],
        ["585", ["64.18:North", "51.73:West", "GREENLAND - NUUK (GODTHAB)"]],
        ["586", ["70.5:North", "22:West", "GREENLAND - Scoresbysund"]],
        ["587", ["65.42:North", "52.67:West", "GREENLAND - Sukkertoppen"]],
        ["588", ["76.57:North", "68.78:West", "GREENLAND - Thule"]],
        ["589", ["72.67:North", "56.08:West", "GREENLAND - Uppernavik"]],
        ["590", ["12.17:North", "61.73:West", "GRENADA - Gouyave"]],
        ["591", ["12.13:North", "61.75:West", "GRENADA - Grand Roy"]],
        ["592", ["12.12:North", "61.62:West", "GRENADA - Grenville"]],
        ["593", ["12.47:North", "61.47:West", "GRENADA - Hillsborough"]],
        ["594", ["12.07:North", "61.73:West", "GRENADA - SAINT GEORGES"]],
        ["595", ["12.23:North", "61.63:West", "GRENADA - Sauters"]],
        ["596", ["16:North", "61.73:West", "GUADELOUPE - BASSE-TERRE"]],
        ["597", ["16.2:North", "61.5:West", "GUADELOUPE - Le Gosier"]],
        ["598", ["16.27:North", "61.52:West", "GUADELOUPE - Les Abymes"]],
        ["599", ["16.35:North", "61.52:West", "GUADELOUPE - Morne-a-lEau"]],
        ["600", ["16.33:North", "61.35:West", "GUADELOUPE - Moule"]],
        ["601", ["16.2:North", "61.6:West", "GUADELOUPE - Petit Bourg"]],
        ["602", ["16.23:North", "61.53:West", "GUADELOUPE - Pointe-…-Pitre"]],
        ["603", ["16.03:North", "61.7:West", "GUADELOUPE - Saint-Claude"]],
        ["604", ["16.22:North", "61.38:West", "GUADELOUPE - Sainte Anne"]],
        ["605", ["16.33:North", "61.7:West", "GUADELOUPE - Sainte Rose"]],
        ["606", ["13.47:North", "144.75:East", "GUAM - AGANA"]],
        ["607", ["13.52:North", "144.82:East", "GUAM - Dededo"]],
        ["608", ["13.38:North", "144.67:East", "GUAM - Santa Rita"]],
        ["609", ["13.33:North", "144.77:East", "GUAM - Taloffo"]],
        ["610", ["13.48:North", "144.77:East", "GUAM - Tamuning"]],
        ["611", ["14.8:North", "89.53:West", "GUATEMALA - Chiquimula"]],
        ["612", ["15.48:North", "90.32:West", "GUATEMALA - Coban"]],
        ["613", ["14.3:North", "90.78:West", "GUATEMALA - Escuintla"]],
        ["614", ["14.63:North", "90.52:West", "GUATEMALA - GUATEMALA CITY"]],
        ["615", ["14.52:North", "91.5:West", "GUATEMALA - Mazatenango"]],
        ["616", ["15.68:North", "88.53:West", "GUATEMALA - Puerto Barrios"]],
        ["617", ["14.83:North", "91.5:West", "GUATEMALA - Quezaltenango"]],
        ["618", ["14.52:North", "91.67:West", "GUATEMALA - Retalhuleu"]],
        ["619", ["12.15:North", "14.63:West", "GUINEA - Bafata"]],
        ["620", ["11.87:North", "15.65:West", "GUINEA - BISSAU"]],
        ["621", ["12.05:North", "16:West", "GUINEA - Cantchungo"]],
        ["622", ["11.22:North", "15.17:West", "GUINEA - Catio"]],
        ["623", ["9.52:North", "13.72:West", "GUINEA - CONAKRY"]],
        ["624", ["12.5:North", "15.15:West", "GUINEA - Farim"]],
        ["625", ["12.27:North", "14.22:West", "GUINEA - Gabu"]],
        ["626", ["10.38:North", "9.3:West", "GUINEA - Kankan"]],
        ["627", ["11.32:North", "12.28:West", "GUINEA - Labe"]],
        ["628", ["12.13:North", "15.3:West", "GUINEA - Mansoa"]],
        ["629", ["7.75:North", "8.82:West", "GUINEA - Nzerekore"]],
        ["630", ["5.88:North", "57.17:West", "GUYANA - Corriverton"]],
        ["631", ["6.77:North", "58.17:West", "GUYANA - GEORGETOWN"]],
        ["632", ["5.98:North", "58.32:West", "GUYANA - Linden"]],
        ["633", ["6.57:North", "57.83:West", "GUYANA - Mahaicony"]],
        ["634", ["6.3:North", "57.5:West", "GUYANA - New Amsterdam"]],
        ["635", ["19.78:North", "72.28:West", "HAITI - Cap-Haitien"]],
        ["636", ["19.48:North", "72.7:West", "HAITI - Gonaives"]],
        ["637", ["18.25:North", "73.77:West", "HAITI - Les Cayes"]],
        ["638", ["18.52:North", "72.28:West", "HAITI - Petionville"]],
        ["639", ["18.55:North", "72.33:West", "HAITI - PORT-AU-PRINCE"]],
        ["640", ["19.93:North", "72.87:West", "HAITI - Port-de-Paix"]],
        ["641", ["13.25:North", "87.17:West", "HONDURAS - Choluteca"]],
        ["642", ["14.5:North", "87.65:West", "HONDURAS - Comayagua"]],
        ["643", ["14.03:North", "86.5:West", "HONDURAS - Danli"]],
        ["644", ["15.33:North", "87.8:West", "HONDURAS - El Progreso"]],
        ["645", ["15.75:North", "86.75:West", "HONDURAS - La Ceiba"]],
        ["646", ["15.83:North", "87.92:West", "HONDURAS - Puerto Cortes"]],
        ["647", ["15.43:North", "88.02:West", "HONDURAS - San Pedro Sula"]],
        ["648", ["14.8:North", "88.72:West", "HONDURAS - Santa Rosa de Copan"]],
        ["649", ["14.65:North", "87.8:West", "HONDURAS - Siguatepeque"]],
        ["650", ["14.08:North", "87.23:West", "HONDURAS - TEGUCIGALPA"]],
        ["651", ["15.77:North", "87.42:West", "HONDURAS - Tela"]],
        ["652", ["22.25:North", "114.15:East", "HONG KONG - Aberdeen"]],
        ["653", ["22.33:North", "114.17:East", "HONG KONG - Kowloon"]],
        ["654", ["22.32:North", "114.2:East", "HONG KONG - Kwun Tong"]],
        ["655", ["22.33:North", "114.17:East", "HONG KONG - New Kowloon"]],
        ["656", ["22.37:North", "114.12:East", "HONG KONG - Tsuen Wan"]],
        ["657", ["22.27:North", "114.15:East", "HONG KONG - VICTORIA"]],
        ["658", ["47.5:North", "19.05:East", "HUNGARY - BUDAPEST"]],
        ["659", ["47.5:North", "21.62:East", "HUNGARY - Debrecen"]],
        ["660", ["47.68:North", "17.67:East", "HUNGARY - Gyor"]],
        ["661", ["46.93:North", "19.72:East", "HUNGARY - Kecskemet"]],
        ["662", ["48.12:North", "20.78:East", "HUNGARY - Miskolc"]],
        ["663", ["47.95:North", "21.72:East", "HUNGARY - Nyiregyhaza"]],
        ["664", ["46.07:North", "18.25:East", "HUNGARY - Pecs"]],
        ["665", ["46.25:North", "20.15:East", "HUNGARY - Szeged"]],
        ["666", ["47.18:North", "18.37:East", "HUNGARY - Szekesfehervar"]],
        ["667", ["47.17:North", "20.17:East", "HUNGARY - Szolnok"]],
        ["668", ["47.23:North", "16.63:East", "HUNGARY - Szombathely"]],
        ["669", ["64.3:North", "22.03:West", "ICELAND - Akranes"]],
        ["670", ["65.68:North", "18.07:West", "ICELAND - Akureyri"]],
        ["671", ["64.07:North", "21.97:West", "ICELAND - Hafnarfjordhur"]],
        ["672", ["66.07:North", "17.3:West", "ICELAND - Husavik"]],
        ["673", ["66.13:North", "23.22:West", "ICELAND - Isafjorour"]],
        ["674", ["64.03:North", "22.6:West", "ICELAND - Keflavik"]],
        ["675", ["64.1:North", "21.88:West", "ICELAND - Kopavogur"]],
        ["676", ["65.17:North", "13.72:West", "ICELAND - Neskaupstaour"]],
        ["677", ["64.88:North", "23.72:West", "ICELAND - Olafsvik"]],
        ["678", ["64.15:North", "21.97:West", "ICELAND - REYKJAVIK"]],
        ["679", ["63.42:North", "20.25:West", "ICELAND - Vestmannaeyjar"]],
        ["680", ["23:North", "72.67:East", "INDIA - Ahmedabad"]],
        ["681", ["12.97:North", "77.58:East", "INDIA - Bangalore"]],
        ["682", ["18.93:North", "72.85:East", "INDIA - Bombay"]],
        ["683", ["22.5:North", "88.33:East", "INDIA - Calcutta"]],
        ["684", ["17.37:North", "78.43:East", "INDIA - Hyderabad"]],
        ["685", ["22.72:North", "75.83:East", "INDIA - Indore"]],
        ["686", ["26.92:North", "75.82:East", "INDIA - Jaipur"]],
        ["687", ["26.45:North", "80.23:East", "INDIA - Kanpur"]],
        ["688", ["26.85:North", "80.92:East", "INDIA - Lucknow"]],
        ["689", ["13.08:North", "80.3:East", "INDIA - Madras"]],
        ["690", ["9.93:North", "78.12:East", "INDIA - Madurai"]],
        ["691", ["21.17:North", "79.2:East", "INDIA - Nagpur"]],
        ["692", ["28.62:North", "77.22:East", "INDIA - NEW DELHI"]],
        ["693", ["18.57:North", "73.97:East", "INDIA - Pune"]],
        ["694", ["21.17:North", "72.83:East", "INDIA - Surat"]],
        ["695", ["6.95:South", "107.57:East", "INDONESIA - Bandung"]],
        ["696", ["3.33:South", "114.58:East", "INDONESIA - Banjarmasin"]],
        ["697", ["6.13:South", "106.75:East", "INDONESIA - JAKARTA"]],
        ["698", ["2.53:South", "140.7:East", "INDONESIA - Jayapura"]],
        ["699", ["10.17:South", "123.58:East", "INDONESIA - Kupang"]],
        ["700", ["7.98:South", "112.75:East", "INDONESIA - Malang"]],
        ["701", ["1.48:North", "124.85:East", "INDONESIA - Manado"]],
        ["702", ["3.58:North", "98.65:East", "INDONESIA - Medan"]],
        ["703", ["0.95:South", "100.35:East", "INDONESIA - Padang"]],
        ["704", ["2.98:South", "104.75:East", "INDONESIA - Palembang"]],
        ["705", ["0.03:South", "109.33:East", "INDONESIA - Pontianak"]],
        ["706", ["6.97:South", "110.48:East", "INDONESIA - Semarang"]],
        ["707", ["7.23:South", "112.75:East", "INDONESIA - Surabaya"]],
        ["708", ["7.53:South", "110.83:East", "INDONESIA - Surakarta"]],
        ["709", ["5.15:South", "119.47:East", "INDONESIA - Ujung Pandang"]],
        ["710", ["7.8:South", "110.4:East", "INDONESIA - Yogyakarta"]],
        ["711", ["30.33:North", "48.27:East", "IRAN - Abadan"]],
        ["712", ["31.28:North", "48.72:East", "IRAN - Ahwaz"]],
        ["713", ["34.32:North", "47.07:East", "IRAN - Bakhtaran"]],
        ["714", ["27.18:North", "56.28:East", "IRAN - Bandar Abbas"]],
        ["715", ["32.68:North", "51.68:East", "IRAN - Isfahan"]],
        ["716", ["35.8:North", "50.97:East", "IRAN - Karaj"]],
        ["717", ["30.28:North", "57.08:East", "IRAN - Kerman"]],
        ["718", ["36.3:North", "52.65:East", "IRAN - Mashad"]],
        ["719", ["37.55:North", "45.07:East", "IRAN - Orumiyeh"]],
        ["720", ["34.65:North", "50.95:East", "IRAN - Qom"]],
        ["721", ["37.27:North", "49.6:East", "IRAN - Rasht"]],
        ["722", ["29.63:North", "52.57:East", "IRAN - Shiraz"]],
        ["723", ["38.08:North", "46.3:East", "IRAN - Tabriz"]],
        ["724", ["35.67:North", "51.43:East", "IRAN - TEHRAN"]],
        ["725", ["31.88:North", "54.42:East", "IRAN - Yazd"]],
        ["726", ["31.83:North", "47.15:East", "IRAQ - Al-Amarah"]],
        ["727", ["32.48:North", "44.42:East", "IRAQ - Al-Hillah"]],
        ["728", ["31.98:North", "44.33:East", "IRAQ - An-Najaf"]],
        ["729", ["31.03:North", "46.27:East", "IRAQ - An-Nasiriyah"]],
        ["730", ["33.42:North", "43.28:East", "IRAQ - Ar-Ramadi"]],
        ["731", ["35.55:North", "45.43:East", "IRAQ - As-Sulaymaniyah"]],
        ["732", ["33.75:North", "44.63:East", "IRAQ - Baqubah"]],
        ["733", ["33.33:North", "44.43:East", "IRAQ - BAGHDAD"]],
        ["734", ["30.5:North", "47.78:East", "IRAQ - Basra"]],
        ["735", ["36.18:North", "44.02:East", "IRAQ - Irbil"]],
        ["736", ["32.6:North", "44.03:East", "IRAQ - Karbala"]],
        ["737", ["35.47:North", "44.43:East", "IRAQ - Kirkuk"]],
        ["738", ["36.35:North", "43.13:East", "IRAQ - Mosul"]],
        ["739", ["34.2:North", "43.87:East", "IRAQ - Samarra"]],
        ["740", ["53.42:North", "7.93:West", "IRELAND - Athlone"]],
        ["741", ["53.87:North", "9.28:West", "IRELAND - Castlebar"]],
        ["742", ["51.9:North", "8.47:West", "IRELAND - Cork"]],
        ["743", ["54.65:North", "8.12:West", "IRELAND - Donegal"]],
        ["744", ["53.33:North", "6.25:West", "IRELAND - DUBLIN"]],
        ["745", ["53.28:North", "6.13:West", "IRELAND - Dun Laoghaire"]],
        ["746", ["53.27:North", "9.05:West", "IRELAND - Galway"]],
        ["747", ["52.67:North", "8.63:West", "IRELAND - Limerick"]],
        ["748", ["54.28:North", "8.47:West", "IRELAND - Sligo"]],
        ["749", ["52.27:North", "9.7:West", "IRELAND - Tralee"]],
        ["750", ["52.25:North", "7.1:West", "IRELAND - Waterford"]],
        ["751", ["31.25:North", "34.78:East", "ISRAEL - Beersheba"]],
        ["752", ["32.08:North", "34.87:East", "ISRAEL - Bene Beraq"]],
        ["753", ["31.7:North", "35.2:East", "ISRAEL - Bethlehem"]],
        ["754", ["29.55:North", "34.95:East", "ISRAEL - Elat"]],
        ["755", ["32.82:North", "34.98:East", "ISRAEL - Haifa"]],
        ["756", ["31.53:North", "35.1:East", "ISRAEL - Hebron"]],
        ["757", ["32.03:North", "34.78:East", "ISRAEL - Holon"]],
        ["758", ["31.85:North", "35.45:East", "ISRAEL - Jericho"]],
        ["759", ["31.78:North", "35.22:East", "ISRAEL - JERUSALEM"]],
        ["760", ["32.22:North", "35.27:East", "ISRAEL - Nablus"]],
        ["761", ["32.08:North", "34.92:East", "ISRAEL - Petach-Tikva"]],
        ["762", ["32.07:North", "34.8:East", "ISRAEL - Ramat Gan"]],
        ["763", ["32.08:North", "34.77:East", "ISRAEL - Tel Aviv"]],
        ["764", ["41.12:North", "16.87:East", "ITALY - Bari"]],
        ["765", ["44.5:North", "11.33:East", "ITALY - Bologna"]],
        ["766", ["39.22:North", "9.12:East", "ITALY - Cagliari"]],
        ["767", ["37.52:North", "15.07:East", "ITALY - Catania"]],
        ["768", ["43.78:North", "11.25:East", "ITALY - Florence"]],
        ["769", ["44.4:North", "8.93:East", "ITALY - Genoa"]],
        ["770", ["38.18:North", "15.55:East", "ITALY - Messina"]],
        ["771", ["45.47:North", "9.2:East", "ITALY - Milan"]],
        ["772", ["41.83:North", "14.25:East", "ITALY - Naples"]],
        ["773", ["38.13:North", "13.38:East", "ITALY - Palermo"]],
        ["774", ["41.88:North", "12.5:East", "ITALY - ROME"]],
        ["775", ["40.47:North", "17.25:East", "ITALY - Taranto"]],
        ["776", ["45.67:North", "13.77:East", "ITALY - Trieste"]],
        ["777", ["45.07:North", "7.67:East", "ITALY - Turin"]],
        ["778", ["45.43:North", "12.33:East", "ITALY - Venice"]],
        ["779", ["45.45:North", "11:East", "ITALY - Verona"]],
        ["780", ["17.97:North", "76.8:West", "JAMAICA - KINGSTON"]],
        ["781", ["18.03:North", "77.52:West", "JAMAICA - Mandeville"]],
        ["782", ["17.97:North", "77.25:West", "JAMAICA - May Pen"]],
        ["783", ["18.45:North", "77.93:West", "JAMAICA - Montego Bay"]],
        ["784", ["18.22:North", "78.13:West", "JAMAICA - Savanna-la-Mar"]],
        ["785", ["17.98:North", "76.97:West", "JAMAICA - Spanish Town"]],
        ["786", ["33.65:North", "130.35:East", "JAPAN - Fukuoka"]],
        ["787", ["34.38:North", "132.45:East", "JAPAN - Hiroshima"]],
        ["788", ["31.6:North", "130.55:East", "JAPAN - Kagoshima"]],
        ["789", ["35.53:North", "139.68:East", "JAPAN - Kawasaki"]],
        ["790", ["33.87:North", "130.82:East", "JAPAN - Kitakyushu"]],
        ["791", ["34.67:North", "135.2:East", "JAPAN - Kobe"]],
        ["792", ["35.03:North", "135.75:East", "JAPAN - Kyoto"]],
        ["793", ["32.8:North", "129.92:East", "JAPAN - Nagasaki"]],
        ["794", ["35.13:North", "136.88:East", "JAPAN - Nagoya"]],
        ["795", ["37.92:North", "139.05:East", "JAPAN - Niigata"]],
        ["796", ["34.67:North", "135.5:East", "JAPAN - Osaka"]],
        ["797", ["43.08:North", "141.35:East", "JAPAN - Sapporo"]],
        ["798", ["38.25:North", "140.88:East", "JAPAN - Sendai"]],
        ["799", ["35.67:North", "139.75:East", "JAPAN - TOKYO"]],
        ["800", ["35.45:North", "139.65:East", "JAPAN - Yokohama"]],
        ["801", ["32.33:North", "35.75:East", "JORDAN - Ajlun"]],
        ["802", ["31.95:North", "35.93:East", "JORDAN - AMMAN"]],
        ["803", ["29.52:North", "35:East", "JORDAN - Aqaba"]],
        ["804", ["32.55:North", "35.85:East", "JORDAN - Irbid"]],
        ["805", ["32.28:North", "35.9:East", "JORDAN - Jarash"]],
        ["806", ["31.18:North", "35.7:East", "JORDAN - Karak"]],
        ["807", ["30.18:North", "35.75:East", "JORDAN - Maan"]],
        ["808", ["31.73:North", "35.8:East", "JORDAN - Madaba"]],
        ["809", ["32.33:North", "36.2:East", "JORDAN - Mafraq"]],
        ["810", ["32.05:North", "35.73:East", "JORDAN - Salt"]],
        ["811", ["30.87:North", "35.6:East", "JORDAN - Tafila"]],
        ["812", ["32.07:North", "36.1:East", "JORDAN - Zarqa"]],
        ["813", ["43.25:North", "76.95:East", "KAZAKHSTAN - Alamty"]],
        ["814", ["0.52:North", "35.28:East", "KENYA - Eldoret"]],
        ["815", ["0.37:South", "35.32:East", "KENYA - Kericho"]],
        ["816", ["0.13:South", "34.78:East", "KENYA - Kisumu"]],
        ["817", ["1.02:North", "35.02:East", "KENYA - Kitale"]],
        ["818", ["3.23:South", "40.08:East", "KENYA - Malindi"]],
        ["819", ["4.07:South", "39.67:East", "KENYA - Mombasa"]],
        ["820", ["1.28:South", "36.83:East", "KENYA - NAIROBI"]],
        ["821", ["0.27:South", "36.07:East", "KENYA - Nakuru"]],
        ["822", ["0.02:North", "37.08:East", "KENYA - Nanyuki"]],
        ["823", ["0.42:South", "36.93:East", "KENYA - Nyeri"]],
        ["824", ["1.05:South", "37.08:East", "KENYA - Thika"]],
        ["825", ["1.38:North", "173.15:East", "KIRIBATI - BONRIKI"]],
        ["1667", ["42.65:North", "21.17:East", "KOSOVO - Pristina"]],
        ["826", ["29.08:North", "48.07:East", "KUWAIT - Al-Ahmadi"]],
        ["827", ["29.33:North", "48:East", "KUWAIT - Hawalli"]],
        ["828", ["29.37:North", "47.67:East", "KUWAIT - Jahra"]],
        ["829", ["29.33:North", "48:East", "KUWAIT - KUWAIT"]],
        ["830", ["29.07:North", "48.13:East", "KUWAIT - Mina Al-Ahmadi"]],
        ["831", ["29.33:North", "48:East", "KUWAIT - Salmiya"]],
        ["832", ["42.9:North", "74.6:East", "KYRGYZSTAN - BISHKEK"]],
        ["833", ["17.38:North", "104.8:East", "LAOS - Khammouane"]],
        ["834", ["19.88:North", "102.17:East", "LAOS - Luang Prabang"]],
        ["835", ["15.12:North", "105.83:East", "LAOS - Pakse"]],
        ["836", ["16.57:North", "104.75:East", "LAOS - Savannakhet"]],
        ["837", ["19.3:North", "101.77:East", "LAOS - Saya Bury"]],
        ["838", ["17.98:North", "102.63:East", "LAOS - VIENTIANE"]],
        ["839", ["56.95:North", "24.1:East", "LATVIA - Riga"]],
        ["840", ["33.87:North", "35.5:East", "LEBANON - BEIRUT"]],
        ["841", ["33.53:North", "35.37:East", "LEBANON - Sidon"]],
        ["842", ["34.45:North", "35.83:East", "LEBANON - Tripoli"]],
        ["843", ["33.27:North", "35.2:East", "LEBANON - Tyre"]],
        ["844", ["33.83:North", "35.92:East", "LEBANON - Zahle"]],
        ["845", ["28.87:South", "28.05:East", "LESOTHO - Leribe"]],
        ["846", ["29.82:South", "27.23:East", "LESOTHO - Mafeteng"]],
        ["847", ["29.32:South", "27.48:East", "LESOTHO - MASERU"]],
        ["848", ["29.15:South", "27.75:East", "LESOTHO - Teyateyaneng"]],
        ["849", ["5.95:North", "10.03:West", "LIBERIA - Buchanan"]],
        ["850", ["6.32:North", "10.33:West", "LIBERIA - Harbel"]],
        ["851", ["4.42:North", "7.72:West", "LIBERIA - Harper"]],
        ["852", ["6.33:North", "10.77:West", "LIBERIA - MONROVIA"]],
        ["853", ["6.78:North", "10.83:West", "LIBERIA - Tubmanburg"]],
        ["854", ["30.8:North", "20.25:East", "LIBYA - Agedabia"]],
        ["855", ["32.82:North", "21.75:East", "LIBYA - Al-Beida"]],
        ["856", ["32.42:North", "20.9:East", "LIBYA - Al-Marj"]],
        ["857", ["32.75:North", "12.73:East", "LIBYA - Azzawiya"]],
        ["858", ["32.12:North", "20.07:East", "LIBYA - Benghazi"]],
        ["859", ["32.77:North", "22.58:East", "LIBYA - Darna"]],
        ["860", ["32.38:North", "15.1:East", "LIBYA - Misurata"]],
        ["861", ["27.15:North", "14.48:East", "LIBYA - Sebha"]],
        ["862", ["32.82:North", "13.12:East", "LIBYA - TRIPOLI"]],
        ["863", ["32.08:North", "23.98:East", "LIBYA - Tubruq"]],
        ["864", ["32.47:North", "14.57:East", "LIBYA - Zlitan"]],
        ["865", ["47.07:North", "9.53:East", "LIECHTENSTEIN - Balzers"]],
        ["866", ["47.22:North", "9.53:East", "LIECHTENSTEIN - Eschen"]],
        ["867", ["47.22:North", "9.55:East", "LIECHTENSTEIN - Mauren"]],
        ["868", ["47.17:North", "9.52:East", "LIECHTENSTEIN - Schaan"]],
        ["869", ["47.12:North", "9.53:East", "LIECHTENSTEIN - Triesen"]],
        ["870", ["47.12:North", "9.53:East", "LIECHTENSTEIN - Triesenberg"]],
        ["871", ["47.13:North", "9.53:East", "LIECHTENSTEIN - VADUZ"]],
        ["872", ["54.68:North", "25.32:East", "LITHUANIA - Vilnius"]],
        ["873", ["49.53:North", "5.88:East", "LUXEMBOURG - Differdange"]],
        ["874", ["49.47:North", "6.08:East", "LUXEMBOURG - Dudelange"]],
        ["875", ["49.53:North", "6:East", "LUXEMBOURG - Esch"]],
        ["876", ["49.62:North", "6.13:East", "LUXEMBOURG - LUXEMBOURG"]],
        ["877", ["49.55:North", "5.88:East", "LUXEMBOURG - Petange"]],
        ["878", ["49.55:North", "6.38:East", "LUXEMBOURG - Remich"]],
        ["879", ["22.12:North", "113.55:East", "MACAU - Coloane"]],
        ["880", ["22.2:North", "113.58:East", "MACAU - MACAU"]],
        ["881", ["22.15:North", "113.55:East", "MACAU - Taipa"]],
        ["882", ["18.87:South", "47.5:East", "MADAGASCAR - ANTANANARIVO"]],
        ["883", ["19.85:South", "47.02:East", "MADAGASCAR - Antsirabe"]],
        ["884", ["12.27:South", "49.33:East", "MADAGASCAR - Antsiranana"]],
        ["885", ["21.45:South", "47.08:East", "MADAGASCAR - Fiarnarantsoa"]],
        ["886", ["15.72:South", "46.32:East", "MADAGASCAR - Mahajanga"]],
        ["887", ["18.17:South", "49.38:East", "MADAGASCAR - Toamasina"]],
        ["888", ["23.33:South", "43.68:East", "MADAGASCAR - Toliary"]],
        ["889", ["15.77:South", "35:East", "MALAWI - Blantyre"]],
        ["890", ["9.9:South", "35.92:East", "MALAWI - Karonga"]],
        ["891", ["13.97:South", "33.82:East", "MALAWI - LILONGWE"]],
        ["892", ["11.52:South", "34:East", "MALAWI - Mzuzu"]],
        ["893", ["12.92:South", "34.32:East", "MALAWI - Nkhotakota"]],
        ["894", ["15.37:South", "35.37:East", "MALAWI - Zomba"]],
        ["895", ["6.12:North", "100.37:East", "MALAYSIA - Alor Star"]],
        ["896", ["4.93:North", "114.97:East", "MALAYSIA - Brunei"]],
        ["897", ["5.42:North", "100.33:East", "MALAYSIA - Georgetown"]],
        ["898", ["4.6:North", "101.03:East", "MALAYSIA - Ipoh"]],
        ["899", ["1.48:North", "103.73:East", "MALAYSIA - Johore Bahru"]],
        ["900", ["6.12:North", "102.25:East", "MALAYSIA - Kota Bahru"]],
        ["901", ["5.98:North", "116.07:East", "MALAYSIA - Kota Kinabalu"]],
        ["902", ["3.13:North", "101.7:East", "MALAYSIA - KUALA LUMPUR"]],
        ["903", ["5.33:North", "103.12:East", "MALAYSIA - Kuala Trengganu"]],
        ["904", ["3.83:North", "103.32:East", "MALAYSIA - Kuantan"]],
        ["905", ["1.53:North", "110.33:East", "MALAYSIA - Kuching"]],
        ["906", ["2.23:North", "102.23:East", "MALAYSIA - Malacca"]],
        ["907", ["2.7:North", "101.9:East", "MALAYSIA - Seremban"]],
        ["908", ["4.85:North", "100.73:East", "MALAYSIA - Taiping"]],
        ["909", ["0.7:South", "73.17:East", "MALDIVES - Gan"]],
        ["910", ["4.17:North", "73.47:East", "MALDIVES - MALE"]],
        ["911", ["12.67:North", "7.98:West", "MALI - BAMAKO"]],
        ["912", ["16.32:North", "0.05:West", "MALI - Gao"]],
        ["913", ["14.43:North", "11.47:West", "MALI - Kayes"]],
        ["914", ["14.48:North", "4.17:West", "MALI - Mopti"]],
        ["915", ["13.47:North", "6.3:West", "MALI - Segou"]],
        ["916", ["11.3:North", "5.63:West", "MALI - Sikasso"]],
        ["917", ["16.82:North", "2.98:West", "MALI - Timbuktu"]],
        ["918", ["35.9:North", "14.48:East", "MALTA - Birkirkara"]],
        ["919", ["35.88:North", "14.47:East", "MALTA - Qormi"]],
        ["920", ["35.92:North", "14.52:East", "MALTA - Sliema"]],
        ["921", ["35.9:North", "14.53:East", "MALTA - VALLETTA"]],
        ["922", ["36.05:North", "14.23:East", "MALTA - Victoria"]],
        ["923", ["14.57:North", "60.98:West", "MARTINIQUE - Ducos"]],
        ["924", ["14.6:North", "61.08:West", "MARTINIQUE -  FORT-DE-FRANCE"]],
        ["925", ["14.73:North", "60.97:West", "MARTINIQUE - La Trinit‚"]],
        ["926", ["14.62:North", "60.9:West", "MARTINIQUE - Le Fran‡ois"]],
        ["927", ["14.62:North", "61.02:West", "MARTINIQUE - Le Lamentin"]],
        ["928", ["14.73:North", "61.18:West", "MARTINIQUE - Saint Pierre"]],
        ["929", ["14.78:North", "61:West", "MARTINIQUE - Sainte Marie"]],
        ["930", ["14.62:North", "61.12:West", "MARTINIQUE - Schoelcher"]],
        ["931", ["20.52:North", "13.05:West", "MAURITANIA - Atar"]],
        ["932", ["16.2:North", "13.53:West", "MAURITANIA - Kaedi"]],
        ["933", ["16.63:North", "11.47:West", "MAURITANIA - Kiffa"]],
        ["934", ["20.9:North", "17.02:West", "MAURITANIA - Nouadhibou"]],
        ["935", ["18.15:North", "15.97:West", "MAURITANIA - NOUAKCHOTT"]],
        ["936", ["16.5:North", "15.82:West", "MAURITANIA - Rosso"]],
        ["937", ["22.73:North", "12.35:West", "MAURITANIA - Zouerate"]],
        ["938", ["20.22:South", "57.45:East", "MAURITIUS - Beau Bassin"]],
        ["939", ["20.32:South", "57.52:East", "MAURITIUS - Curepipe"]],
        ["940", ["20.17:South", "57.5:East", "MAURITIUS - PORT LOUIS"]],
        ["941", ["20.25:South", "57.47:East", "MAURITIUS - Quatre Bornes"]],
        ["942", ["20.3:South", "57.48:East", "MAURITIUS - Vacoas-Phoenix"]],
        ["943", ["16.85:North", "99.93:West", "MEXICO - Acapulco"]],
        ["944", ["28.67:North", "106.1:West", "MEXICO - Chihuahua"]],
        ["945", ["31.7:North", "106.48:West", "MEXICO - Ciudad Juarez"]],
        ["946", ["24.8:North", "107.4:West", "MEXICO - Culiacan"]],
        ["947", ["20.67:North", "103.33:West", "MEXICO - Guadalajara"]],
        ["948", ["29.07:North", "110.97:West", "MEXICO - Hermosillo"]],
        ["949", ["21.17:North", "101.7:West", "MEXICO - Leon"]],
        ["950", ["23.22:North", "106.42:West", "MEXICO - Mazatlan"]],
        ["951", ["20.97:North", "89.62:West", "MEXICO - Merida"]],
        ["952", ["32.67:North", "115.48:West", "MEXICO - Mexicali"]],
        ["953", ["19.42:North", "99.17:West", "MEXICO - MEXICO CITY"]],
        ["954", ["25.67:North", "100.33:West", "MEXICO - Monterrey"]],
        ["955", ["19.0414:North", "98.2063:West", "MEXICO - Puebla de Zaragoza"]],
        ["956", ["22.17:North", "101:West", "MEXICO - San Luis Potosi"]],
        ["957", ["32.48:North", "117.02:West", "MEXICO - Tijuana"]],
        ["958", ["43.77:North", "7.38:East", "MONACO - MONACO"]],
        ["959", ["43.73:North", "7.42:East", "MONACO - Monte Carlo"]],
        ["960", ["48.03:North", "114.53:East", "MONGOLIA - Choybalsan"]],
        ["961", ["49.47:North", "105.93:East", "MONGOLIA - Darhan"]],
        ["962", ["46.3:North", "100.58:East", "MONGOLIA - Erdenedalay"]],
        ["963", ["47.67:North", "107.2:East", "MONGOLIA - Nalayh"]],
        ["964", ["49.98:North", "92:East", "MONGOLIA - Ulaangom"]],
        ["965", ["47.9:North", "106.87:East", "MONGOLIA - ULAN-BATOR"]],
        ["966", ["47.7:North", "96.87:East", "MONGOLIA - Uliastay"]],
        ["967", ["30.5:North", "9.67:West", "MOROCCO - Agadir"]],
        ["968", ["33.65:North", "7.58:West", "MOROCCO - Casablanca"]],
        ["969", ["34.08:North", "5:West", "MOROCCO - Fez"]],
        ["970", ["34.33:North", "6.67:West", "MOROCCO - Kenitra"]],
        ["971", ["31.63:North", "8:West", "MOROCCO - Marrakech"]],
        ["972", ["33.88:North", "5.62:West", "MOROCCO - Meknes"]],
        ["973", ["34.68:North", "1.75:West", "MOROCCO - Oujda"]],
        ["974", ["34.03:North", "6.85:West", "MOROCCO - RABAT"]],
        ["975", ["32.3:North", "9.33:West", "MOROCCO - Safi"]],
        ["976", ["35.8:North", "5.83:West", "MOROCCO - Tangier"]],
        ["977", ["35.57:North", "5.37:West", "MOROCCO - Tetouan"]],
        ["978", ["19.82:South", "34.87:East", "MOZAMBIQUE - Beira"]],
        ["979", ["24.67:South", "33.55:East", "MOZAMBIQUE - Chibuto"]],
        ["980", ["20.85:South", "33.43:East", "MOZAMBIQUE - Machaze"]],
        ["981", ["16.5:South", "33.52:East", "MOZAMBIQUE - Mandie"]],
        ["982", ["25.97:South", "32.58:East", "MOZAMBIQUE - MAPUTO"]],
        ["983", ["14.55:South", "40.67:East", "MOZAMBIQUE - Nacala"]],
        ["984", ["15.12:South", "39.25:East", "MOZAMBIQUE - Nampula"]],
        ["985", ["16.77:North", "94.75:East", "MYANMAR - Bassein"]],
        ["986", ["21.95:North", "96.07:East", "MYANMAR - Mandalay"]],
        ["987", ["22.08:North", "95.13:East", "MYANMAR - Monywa"]],
        ["988", ["16.5:North", "97.65:East", "MYANMAR - Moulmein"]],
        ["989", ["17.33:North", "96.48:East", "MYANMAR - Pegu"]],
        ["990", ["20.15:North", "92.92:East", "MYANMAR - Sittwe (Akyab)"]],
        ["991", ["20.92:North", "96.88:East", "MYANMAR - Taunggye"]],
        ["992", ["16.78:North", "96.17:East", "MYANMAR - YANGON"]],
        ["993", ["26.6:South", "18.13:East", "NAMIBIA - Keetmanshoop"]],
        ["994", ["26.63:South", "15.17:East", "NAMIBIA - Luderitz"]],
        ["995", ["20.48:South", "16.6:East", "NAMIBIA - Otjiwarongo"]],
        ["996", ["22.67:South", "14.57:East", "NAMIBIA - Swakopmund"]],
        ["997", ["19.22:South", "17.7:East", "NAMIBIA - Tsumeb"]],
        ["998", ["22.57:South", "17.1:East", "NAMIBIA - WINDHOEK"]],
        ["999", ["0.5:South", "166.95:East", "NAURU - Anabar"]],
        ["1000", ["0.53:South", "166.95:East", "NAURU - Anibare"]],
        ["1001", ["0.5:South", "166.93:East", "NAURU - Anna"]],
        ["1002", ["0.5:South", "166.95:East", "NAURU - Ijuw"]],
        ["1003", ["0.52:South", "166.92:East", "NAURU - Uaboe"]],
        ["1004", ["0.52:South", "166.9:East", "NAURU - Yangor"]],
        ["1005", ["0.53:South", "166.92:East", "NAURU - YAREN"]],
        ["1006", ["27.7:North", "85.45:East", "NEPAL - Bhaktapur"]],
        ["1007", ["26.45:North", "87.28:East", "NEPAL - Biratnagar"]],
        ["1008", ["29.28:North", "82.17:East", "NEPAL - Jumla"]],
        ["1009", ["27.7:North", "85.32:East", "NEPAL - KATHMANDU"]],
        ["1010", ["27.38:North", "85.4:East", "NEPAL - Lalitpur"]],
        ["1011", ["28.08:North", "82.88:East", "NEPAL - Pyuthan"]],
        ["1012", ["28.35:North", "82.18:East", "NEPAL - Sallyan"]],
        ["1013", ["12.17:North", "68.28:West", "NETH. ANTILLES - Kralendijk"]],
        ["1014", ["17.98:North", "63.17:West", "NETH. ANTILLES - Philipsburg"]],
        ["1015", ["12.1:North", "68.93:West", "NETH. ANTILLES - WILLEMSTAD"]],
        ["1016", ["52.35:North", "4.9:East", "NETHERLANDS - AMSTERDAM"]],
        ["1017", ["52.22:North", "5.95:East", "NETHERLANDS - Apeldoorn"]],
        ["1018", ["51.43:North", "5.5:East", "NETHERLANDS - Eindhoven"]],
        ["1019", ["52.22:North", "6.92:East", "NETHERLANDS - Enschede"]],
        ["1020", ["53.22:North", "6.58:East", "NETHERLANDS - Groningen"]],
        ["1021", ["52.38:North", "4.63:East", "NETHERLANDS - Haarlem"]],
        ["1022", ["51.83:North", "5.87:East", "NETHERLANDS - Nijmegen"]],
        ["1023", ["51.92:North", "4.48:East", "NETHERLANDS - Rotterdam"]],
        ["1024", ["52.12:North", "4.28:East", "NETHERLANDS - The Hague"]],
        ["1025", ["51.57:North", "5.08:East", "NETHERLANDS - Tilburg"]],
        ["1026", ["52.1:North", "5.12:East", "NETHERLANDS - Utrecht"]],
        ["1027", ["21.57:South", "165.48:East", "NEW CALEDONIA - Bourail"]],
        ["1028", ["21.5:South", "165.97:East", "NEW CALEDONIA - Canala"]],
        ["1029", ["22.17:South", "166.5:East", "NEW CALEDONIA - Dumbea"]],
        ["1030", ["20.67:South", "164.9:East", "NEW CALEDONIA - Hienghene"]],
        ["1031", ["21.3:South", "165.55:East", "NEW CALEDONIA - Houailu"]],
        ["1032", ["21.07:South", "164.87:East", "NEW CALEDONIA - Kone"]],
        ["1033", ["20.55:South", "164.28:East", "NEW CALEDONIA - Koumac"]],
        ["1034", ["22.27:South", "166.45:East", "NEW CALEDONIA - NOUMEA"]],
        ["1035", ["21.62:South", "166.23:East", "NEW CALEDONIA - Thio"]],
        ["1036", ["36.92:South", "174.77:East", "NEW ZEALAND - Auckland"]],
        ["1037", ["43.55:South", "172.67:East", "NEW ZEALAND - Christchurch"]],
        ["1038", ["45.87:South", "170.5:East", "NEW ZEALAND - Dunedin"]],
        ["1039", ["38.67:South", "178.02:East", "NEW ZEALAND - Gisborne"]],
        ["1040", ["37.77:South", "175.3:East", "NEW ZEALAND - Hamilton"]],
        ["1041", ["46.4:South", "168.35:East", "NEW ZEALAND - Invercargill"]],
        ["1042", ["39.48:South", "176.92:East", "NEW ZEALAND - Napier-Hastings"]],
        ["1043", ["41.28:South", "173.28:East", "NEW ZEALAND - Nelson"]],
        ["1044", ["39.07:South", "174.08:East", "NEW ZEALAND - New Plymouth"]],
        ["1045", ["40.35:South", "175.62:East", "NEW ZEALAND - Palmerston North"]],
        ["1046", ["36.93:South", "174.7:East", "NEW ZEALAND - Waitemata"]],
        ["1047", ["39.93:South", "175.05:East", "NEW ZEALAND - Wanganui"]],
        ["1048", ["41.28:South", "174.78:East", "NEW ZEALAND - WELLINGTON"]],
        ["1049", ["35.72:South", "174.32:East", "NEW ZEALAND - Whangarei"]],
        ["1050", ["12.58:North", "87.17:West", "NICARAGUA - Chinandega"]],
        ["1051", ["13.07:North", "86.33:West", "NICARAGUA - Esteli"]],
        ["1052", ["11.97:North", "85.98:West", "NICARAGUA - Granada"]],
        ["1053", ["12.43:North", "86.88:West", "NICARAGUA - Leon"]],
        ["1054", ["12.1:North", "86.3:West", "NICARAGUA - MANAGUA"]],
        ["1055", ["11.98:North", "86.05:West", "NICARAGUA - Masaya"]],
        ["1056", ["12.87:North", "85.97:West", "NICARAGUA - Matagalpa"]],
        ["1057", ["13.88:North", "84.4:West", "NICARAGUA - Rosita"]],
        ["1058", ["11.12:North", "84.78:West", "NICARAGUA - San Carlos"]],
        ["1059", ["17:North", "7.93:East", "NIGER - Agadez"]],
        ["1060", ["13.82:North", "5.32:East", "NIGER - Birni NKonni"]],
        ["1061", ["14.35:North", "3.37:East", "NIGER - Filingue"]],
        ["1062", ["13.48:North", "7.17:East", "NIGER - Maradi"]],
        ["1063", ["13.53:North", "2.08:East", "NIGER - NIAMEY"]],
        ["1064", ["14.95:North", "5.32:East", "NIGER - Tahoua"]],
        ["1065", ["13.77:North", "8.97:East", "NIGER - Zinder"]],
        ["1066", ["7.17:North", "3.43:East", "NIGERIA - Abeokuta"]],
        ["1067", ["7.38:North", "3.93:East", "NIGERIA - Ibadan"]],
        ["1068", ["7.65:North", "4.63:East", "NIGERIA - Ilesha"]],
        ["1069", ["8.53:North", "4.57:East", "NIGERIA - Ilorin"]],
        ["1070", ["12:North", "8.52:East", "NIGERIA - Kano"]],
        ["1071", ["6.45:North", "3.47:East", "NIGERIA - LAGOS"]],
        ["1072", ["8.08:North", "4.18:East", "NIGERIA - Ogbomosho"]],
        ["1073", ["6.17:North", "6.78:East", "NIGERIA - Onitsha"]],
        ["1074", ["7.83:North", "4.58:East", "NIGERIA - Oshogbo"]],
        ["1075", ["4.72:North", "7.17:East", "NIGERIA - Port Harcourt"]],
        ["1076", ["11.02:North", "7.73:East", "NIGERIA - Zaria"]],
        ["1518", ["54.58:North", "5.93:West", "NORTH IRELAND - Belfast"]],
        ["1077", ["41.83:North", "129.92:East", "NORTH KOREA - Chongjin"]],
        ["1078", ["38.03:North", "125.7:East", "NORTH KOREA - Haeju"]],
        ["1079", ["39.9:North", "127.58:East", "NORTH KOREA - Hamhung"]],
        ["1080", ["39.82:North", "127.67:East", "NORTH KOREA - Hungnam"]],
        ["1081", ["37.98:North", "126.5:East", "NORTH KOREA - Kaesong"]],
        ["1082", ["40.68:North", "129.2:East", "NORTH KOREA - Kimchaek"]],
        ["1083", ["38.75:North", "125.38:East", "NORTH KOREA - Nampo"]],
        ["1084", ["39:North", "125.78:East", "NORTH KOREA - PYONGYANG"]],
        ["1085", ["38.52:North", "125.73:East", "NORTH KOREA - Sariwon"]],
        ["1086", ["40.07:North", "124.42:East", "NORTH KOREA - Sinuiju"]],
        ["1087", ["39.12:North", "127.43:East", "NORTH KOREA - Wonsan"]],
        ["1670", ["42:North", "21.47:East", "NORTH MACEDONIA - Skopje"]],
        ["1088", ["62.47:North", "6.15:East", "NORWAY - Alesund"]],
        ["1089", ["69.67:North", "23.24:East", "NORWAY - Alta"]],
        ["1090", ["57.697:North", "11.83:East", "NORWAY - Arendal"]],
        ["1091", ["61.2:North", "6.5333:East", "NORWAY - Balestrand"]],
        ["1092", ["60.38:North", "5.33:East", "NORWAY - Bergen"]],
        ["1093", ["67.28:North", "14.38:East", "NORWAY - Bodø"]],
        ["1094", ["59.75:North", "10.25:East", "NORWAY - Drammen"]],
        ["1095", ["58.538333:North", "6.466944:East", "NORWAY - Eik"]],
        ["1096", ["60.87:North", "11.67:East", "NORWAY - Elverum"]],
        ["1097", ["59.150:North", "11.383:East", "NORWAY - Halden"]],
        ["1098", ["70.662:North", "23.688:East", "NORWAY - Hammerfest"]],
        ["1099", ["59.412:North", "5.275:East", "NORWAY - Haugesund"]],
        ["1100", ["59.17:North", "9.20:East", "NORWAY - Kjosen"]],
        ["1101", ["59.65:North", "9.65:East", "NORWAY - Kongsberg"]],
        ["1102", ["58.13:North", "8.02:East", "NORWAY - Kristiansand"]],
        ["1103", ["61.13:North", "10.5:East", "NORWAY - Lillehammer"]],
        ["1104", ["61.1:North", "7.4833:East", "NORWAY - Lærdal"]],
        ["1105", ["62.73:North", "7.15:East", "NORWAY - Molde"]],
        ["1106", ["60.567:North", "9.1:East", "NORWAY - Nesbyen"]],
        ["1107", ["60.19:North", "10.81:East", "NORWAY - Nittedal"]],
        ["1108", ["59.913:North", "10.72:East", "NORWAY - OSLO"]],
        ["1109", ["59.15:North", "9.67:East", "NORWAY - Porsgrunn"]],
        ["1110", ["60.28:North", "10.62:East", "NORWAY - Roa"]],
        ["1111", ["59.20:North", "9.60:East", "NORWAY - Skien"]],
        ["1112", ["59.1333:North", "10.233:East", "NORWAY - Sandefjord"]],
        ["1113", ["58.97:North", "5.75:East", "NORWAY - Stavanger"]],
        ["1114", ["61.9:North", "6.72:East", "NORWAY - Stryn"]],
        ["1115", ["61.25:North", "7.0833:East", "NORWAY - Sogndal"]],
        ["1116", ["69.662:North", "18.942:East", "NORWAY - Tromsø"]],
        ["1117", ["63.427:North", "10.398:East", "NORWAY - Trondheim"]],
        ["1118", ["59.286:North", "10.418:East", "NORWAY - Tønsberg"]],
        ["1119", ["62.617:North", "7.10:East", "NORWAY - Vestnes"]],
        ["1120", ["61.55:North", "6.35:East", "NORWAY - Årdal"]],
        ["1121", ["23.62:North", "58.57:East", "OMAN - Matrah"]],
        ["1122", ["23.62:North", "58.63:East", "OMAN - MUSCAT"]],
        ["1123", ["22.93:North", "57.55:East", "OMAN - Nizwa"]],
        ["1124", ["17:North", "54.07:East", "OMAN - Salala"]],
        ["1125", ["31.42:North", "73.15:East", "PAKISTAN - Faisalabad"]],
        ["1126", ["32.1:North", "74.18:East", "PAKISTAN - Gujranwala"]],
        ["1127", ["25.38:North", "68.4:East", "PAKISTAN - Hyderabad"]],
        ["1128", ["33.67:North", "73.13:East", "PAKISTAN - ISLAMABAD"]],
        ["1129", ["24.85:North", "67.03:East", "PAKISTAN - Karachi"]],
        ["1130", ["31.57:North", "74.37:East", "PAKISTAN - Lahore"]],
        ["1131", ["30.17:North", "71.6:East", "PAKISTAN - Multan"]],
        ["1132", ["34.02:North", "71.67:East", "PAKISTAN - Peshawar"]],
        ["1133", ["33.67:North", "73.13:East", "PAKISTAN - Rawalpindi"]],
        ["1134", ["32.02:North", "72.67:East", "PAKISTAN - Sargodha"]],
        ["1135", ["32.48:North", "74.58:East", "PAKISTAN - Sialkot"]],
        ["10006", ["30.1798:North", "66.9750:East", "PAKISTAN - Quetta"]],
        ["1136", ["7.5:North", "134.5:East", "PALAU ISLAND - Koror"]],
        ["10005", ["31.5017:North", "34.4668:East", "PALESTINE - Gaza City"]],
        ["1137", ["8.95:North", "79.55:West", "PANAMA - balboa"]],
        ["1138", ["9.35:North", "79.9:West", "PANAMA - Colon"]],
        ["1139", ["8.43:North", "82.43:West", "PANAMA - David"]],
        ["1140", ["8.85:North", "79.77:West", "PANAMA - La Chorrera"]],
        ["1141", ["8.95:North", "79.5:West", "PANAMA - PANAMA CITY"]],
        ["1142", ["8.13:North", "80.98:West", "PANAMA - Santiago"]],
        ["1143", ["9.08:North", "79.37:West", "PANAMA - Tocumen"]],
        ["1144", ["6.08:South", "145.42:East", "PAPUA NEW GUINEA - Goroka"]],
        ["1145", ["6.75:South", "147:East", "PAPUA NEW GUINEA - Lae"]],
        ["1146", ["5.25:South", "145.83:East", "PAPUA NEW GUINEA - Madang"]],
        ["1147", ["5.83:South", "144.25:East", "PAPUA NEW GUINEA - Mount Hagen"]],
        ["1148", ["9.5:South", "147.12:East", "PAPUA NEW GUINEA - PORT MORESBY"]],
        ["1149", ["4.22:South", "152.18:East", "PAPUA NEW GUINEA - Rabaul"]],
        ["1150", ["3.58:South", "143.67:East", "PAPUA NEW GUINEA - Wewak"]],
        ["1151", ["25.25:South", "57.67:West", "PARAGUAY - ASUNCION"]],
        ["1152", ["25.42:South", "56.03:West", "PARAGUAY - Caaguazu"]],
        ["1153", ["23.37:South", "57.43:West", "PARAGUAY - Concepcion"]],
        ["1154", ["25.4:South", "56.5:West", "PARAGUAY - Coronel Oviedo"]],
        ["1155", ["27.33:South", "55.83:West", "PARAGUAY - Encarnacion"]],
        ["1156", ["25.32:South", "57.6:West", "PARAGUAY - Fernando de la Mora"]],
        ["1157", ["22.5:South", "55.73:West", "PARAGUAY - Pedro Juan Caballero"]],
        ["1158", ["26.87:South", "58.38:West", "PARAGUAY - Pilar"]],
        ["1159", ["25.53:South", "54.57:West", "PARAGUAY - Puerto Stroessner"]],
        ["1160", ["25.33:South", "57.53:West", "PARAGUAY - San Lorenzo"]],
        ["1161", ["25.75:South", "56.47:West", "PARAGUAY - Villarrica"]],
        ["1162", ["16.42:South", "71.53:West", "PERU - Arequipa"]],
        ["1163", ["12.08:South", "77.13:West", "PERU - Callao"]],
        ["1164", ["6.78:South", "79.78:West", "PERU - Chiclayo"]],
        ["1165", ["9.07:South", "78.57:West", "PERU - Chimbote"]],
        ["1166", ["13.53:South", "71.95:West", "PERU - Cuzco"]],
        ["1167", ["12.08:South", "75.2:West", "PERU - Huancayo"]],
        ["1168", ["3.85:South", "73.22:West", "PERU - Iquitos"]],
        ["1169", ["12.1:South", "77.05:West", "PERU - LIMA"]],
        ["1170", ["5.25:South", "80.63:West", "PERU - Piura"]],
        ["1171", ["8.38:South", "74.53:West", "PERU - Pucallpa"]],
        ["1172", ["4.88:South", "80.68:West", "PERU - Sullana"]],
        ["1173", ["8.1:South", "79:West", "PERU - Trujillo"]],
        ["1174", ["15.15:North", "120.55:East", "PHILIPPINES - Angeles"]],
        ["1175", ["10.63:North", "122.97:East", "PHILIPPINES - Bacolod"]],
        ["1176", ["13.75:North", "121.05:East", "PHILIPPINES - Batangas"]],
        ["1177", ["8.48:North", "124.67:East", "PHILIPPINES - Cagayan de Oro"]],
        ["1178", ["10.28:North", "123.93:East", "PHILIPPINES - Cebu"]],
        ["1179", ["7.08:North", "125.63:East", "PHILIPPINES - Davao"]],
        ["1180", ["6.12:North", "125.18:East", "PHILIPPINES - General Santos"]],
        ["1181", ["10.68:North", "122.55:East", "PHILIPPINES - Iloilo"]],
        ["1182", ["14.62:North", "120.97:East", "PHILIPPINES - MANILA"]],
        ["1183", ["14.65:North", "121.03:East", "PHILIPPINES - Quezon City"]],
        ["1184", ["6.92:North", "122.08:East", "PHILIPPINES - Zamboanga"]],
        ["1185", ["53.27:North", "18:East", "POLAND - Bydgoszcz"]],
        ["1186", ["54.37:North", "18.68:East", "POLAND - Gdansk"]],
        ["1187", ["50.25:North", "18.98:East", "POLAND - Katowice"]],
        ["1188", ["50.05:North", "19.92:East", "POLAND - Krakow"]],
        ["1189", ["51.82:North", "19.47:East", "POLAND - Lodz"]],
        ["1190", ["51.3:North", "22.52:East", "POLAND - Lublin"]],
        ["1191", ["52.42:North", "16.88:East", "POLAND - Poznan"]],
        ["1192", ["50.27:North", "19.12:East", "POLAND - Sosnowiec"]],
        ["1193", ["53.42:North", "14.53:East", "POLAND - Szczecin"]],
        ["1194", ["52.25:North", "21:East", "POLAND - WARSAW"]],
        ["1195", ["51.08:North", "17:East", "POLAND - Wroclaw"]],
        ["1196", ["38.67:North", "9.15:West", "PORTUGAL - Almada"]],
        ["1197", ["38.75:North", "9.22:West", "PORTUGAL - Amadora"]],
        ["1198", ["38.67:North", "9.08:West", "PORTUGAL - Barreiro"]],
        ["1199", ["41.53:North", "8.43:West", "PORTUGAL - Braga"]],
        ["1200", ["40.2:North", "8.42:West", "PORTUGAL - Coimbra"]],
        ["1201", ["32.63:North", "16.9:West", "PORTUGAL - Funchal"]],
        ["1202", ["38.73:North", "9.13:West", "PORTUGAL - LISBON"]],
        ["1203", ["41.15:North", "8.62:West", "PORTUGAL - Oporto"]],
        ["1204", ["38.52:North", "8.9:West", "PORTUGAL - Setubal"]],
        ["1205", ["41.07:North", "8.67:West", "PORTUGAL - Vila Nova de Gaia"]],
        ["1206", ["18.45:North", "67.13:West", "PUERTO RICO - Aguadilla"]],
        ["1207", ["18.47:North", "66.73:West", "PUERTO RICO - Arecibo"]],
        ["1208", ["18.4:North", "66.17:West", "PUERTO RICO - Bayam¢n"]],
        ["1209", ["18.23:North", "66.07:West", "PUERTO RICO - Caguas"]],
        ["1210", ["18.38:North", "65.95:West", "PUERTO RICO - Carolina"]],
        ["1211", ["18.43:North", "66.13:West", "PUERTO RICO - Cata¤o"]],
        ["1212", ["18.13:North", "66.18:West", "PUERTO RICO - Cayey"]],
        ["1213", ["18.32:North", "65.67:West", "PUERTO RICO - Fajardo"]],
        ["1214", ["17.98:North", "66.17:West", "PUERTO RICO - Guayama"]],
        ["1215", ["18.33:North", "66.13:West", "PUERTO RICO - Guaynabo"]],
        ["1216", ["18.22:North", "67.15:West", "PUERTO RICO - Mayagez"]],
        ["1217", ["18.02:North", "66.6:West", "PUERTO RICO - Ponce"]],
        ["1218", ["18.48:North", "66.13:West", "PUERTO RICO - SAN JUAN"]],
        ["1219", ["18.48:North", "66.32:West", "PUERTO RICO - Toa Baja"]],
        ["1220", ["18.33:North", "65.83:West", "PUERTO RICO - Trujillo"]],
        ["1221", ["25.68:North", "51.5:East", "QATAR - al-Khawr"]],
        ["1222", ["25.25:North", "51.53:East", "QATAR - DOHA"]],
        ["1223", ["25.42:North", "50.8:East", "QATAR - Dukhan"]],
        ["1224", ["24.98:North", "51.53:East", "QATAR - Musayid"]],
        ["1225", ["25.2:North", "50.8:East", "QATAR - Umm Bab"]],
        ["1226", ["20.92:South", "55.3:East", "REUNION - Le Port"]],
        ["1227", ["21.27:South", "55.53:East", "REUNION - Le Tampon"]],
        ["1228", ["20.95:South", "55.65:East", "REUNION - Saint-Andre"]],
        ["1229", ["21.03:South", "55.72:East", "REUNION - Saint-Benoit"]],
        ["1230", ["20.87:South", "55.47:East", "REUNION - SAINT-DENIS"]],
        ["1231", ["21.27:South", "55.42:East", "REUNION - Saint-Louis"]],
        ["1232", ["21:South", "55.28:East", "REUNION - Saint-Paul"]],
        ["1233", ["21.32:South", "55.48:East", "REUNION - Saint-Pierre"]],
        ["1234", ["45.28:North", "27.97:East", "ROMANIA - Braila"]],
        ["1235", ["45.65:North", "25.58:East", "ROMANIA - Brasov"]],
        ["1236", ["44.42:North", "26.12:East", "ROMANIA - BUCHAREST"]],
        ["1237", ["46.78:North", "23.62:East", "ROMANIA - Cluj-Napoca"]],
        ["1238", ["44.2:North", "28.67:East", "ROMANIA - Constanta"]],
        ["1239", ["44.3:North", "23.78:East", "ROMANIA - Craiova"]],
        ["1240", ["45.45:North", "28.03:East", "ROMANIA - Galati"]],
        ["1241", ["47.15:North", "27.63:East", "ROMANIA - Iasi"]],
        ["1242", ["47.05:North", "21.92:East", "ROMANIA - Oradea"]],
        ["1243", ["44.95:North", "26.02:East", "ROMANIA - Ploiesti"]],
        ["1244", ["45.75:North", "21.25:East", "ROMANIA - Timisoara"]],
        ["1245", ["56.33:North", "44:East", "RUSSIA - Gorky"]],
        ["1246", ["55.75:North", "37.7:East", "RUSSIA - MOSCOW"]],
        ["1247", ["55.07:North", "83.08:East", "RUSSIA - Novosibirsk"]],
        ["1248", ["59.92:North", "30.33:East", "RUSSIA - St. Petersburg"]],
        ["1249", ["56.83:North", "60.5:East", "RUSSIA - Sverdlovsk"]],
        ["1250", ["43.17:North", "131.93:East", "RUSSIA - Vladivostock"]],
        ["1251", ["2.58:South", "29.73:East", "RWANDA - Butare"]],
        ["1252", ["2.5:South", "28.9:East", "RWANDA - Cyangugu"]],
        ["1253", ["1.68:South", "29.25:East", "RWANDA - Gisenyi"]],
        ["1254", ["1.93:South", "30.07:East", "RWANDA - KIGALI"]],
        ["1255", ["2.33:South", "29.72:East", "RWANDA - Nyabisindu"]],
        ["1256", ["1.5:South", "29.62:East", "RWANDA - Ruhengeri"]],
        ["1257", ["17.28:North", "62.72:West", "SAINT KITTS - BASSETERRE"]],
        ["1258", ["17.35:North", "62.72:West", "SAINT KITTS - Cayon"]],
        ["1259", ["17.13:North", "62.62:West", "SAINT KITTS - Charlestown"]],
        ["1260", ["17.2:North", "62.57:West", "SAINT KITTS - Newcastle"]],
        ["1261", ["17.42:North", "62.85:West", "SAINT KITTS - Saint Pauls"]],
        ["1262", ["14.02:North", "60.98:West", "SAINT LUCIA - CASTRIES"]],
        ["1263", ["13.92:North", "60.9:West", "SAINT LUCIA - Dennery"]],
        ["1264", ["13.83:North", "60.9:West", "SAINT LUCIA - Micoud"]],
        ["1265", ["13.87:North", "61.07:West", "SAINT LUCIA - Soufriere"]],
        ["1266", ["13.77:North", "60.97:West", "SAINT LUCIA - Vieux Fort"]],
        ["1267", ["13.28:North", "61.25:West", "SAINT VINCENT - Chateaubelair"]],
        ["1268", ["13.37:North", "61.18:West", "SAINT VINCENT - Fancy"]],
        ["1269", ["13.32:North", "61.15:West", "SAINT VINCENT - Georgetown"]],
        ["1270", ["13.2:North", "61.23:West", "SAINT VINCENT - KINGSTOWN"]],
        ["1271", ["13.2:North", "61.28:West", "SAINT VINCENT - Layou"]],
        ["1272", ["43.93:North", "12.45:East", "SAN MARINO - Borgo Maggiore"]],
        ["1273", ["43.92:North", "12.47:East", "SAN MARINO - SAN MARINO"]],
        ["1274", ["43.95:North", "12.5:East", "SAN MARINO - Serravalle"]],
        ["1275", ["1.62:North", "7.45:East", "SAO TOME - PRINCIPE - Santo Antonio"]],
        ["1276", ["0.2:North", "6.72:East", "SAO TOME - PRINCIPE - SAO TOME"]],
        ["1277", ["18.22:North", "42.5:East", "SAUDI ARABIA - Abha"]],
        ["1278", ["25.43:North", "49.62:East", "SAUDI ARABIA - Al-Mobarraz"]],
        ["1279", ["26.33:North", "43.98:East", "SAUDI ARABIA - Buraidah"]],
        ["1280", ["26.42:North", "50.1:East", "SAUDI ARABIA - Dammam"]],
        ["1281", ["24.13:North", "49.08:East", "SAUDI ARABIA - Haradh"]],
        ["1282", ["25.33:North", "49.57:East", "SAUDI ARABIA - Hufuf"]],
        ["1283", ["21.5:North", "39.17:East", "SAUDI ARABIA - Jeddah"]],
        ["1284", ["16.93:North", "42.55:East", "SAUDI ARABIA - Jisan"]],
        ["1285", ["18.32:North", "42.75:East", "SAUDI ARABIA - Khamis-Mushait"]],
        ["1286", ["21.43:North", "39.82:East", "SAUDI ARABIA - Mecca"]],
        ["1287", ["24.5:North", "39.58:East", "SAUDI ARABIA - Medina"]],
        ["1288", ["24.65:North", "46.77:East", "SAUDI ARABIA - RIYADH"]],
        ["1289", ["28.37:North", "36.53:East", "SAUDI ARABIA - Tabouk"]],
        ["1290", ["21.25:North", "40.35:East", "SAUDI ARABIA - Taif"]],
        ["1291", ["14.63:North", "17.45:West", "SENEGAL - DAKAR"]],
        ["1292", ["14.65:North", "16.2:West", "SENEGAL - Diourbel"]],
        ["1293", ["14.15:North", "16.13:West", "SENEGAL - Kaolack"]],
        ["1294", ["16.02:North", "16.5:West", "SENEGAL - Saint-Louis"]],
        ["1295", ["14.82:North", "16.87:West", "SENEGAL - Thies"]],
        ["1296", ["12.58:North", "16.33:West", "SENEGAL - Zinguinchor"]],
        ["1661", ["44.83:North", "20.5:East", "SERBIA - BELGRADE"]],
        ["1664", ["43.33:North", "21.9:East", "SERBIA - Nis"]],
        ["1665", ["45.25:North", "19.85:East", "SERBIA - Novi Sad"]],
        ["1297", ["4.72:South", "55.48:East", "SEYCHELLES - Anse Boileau"]],
        ["1298", ["4.73:South", "55.52:East", "SEYCHELLES - Anse Royale"]],
        ["1299", ["4.65:South", "55.48:East", "SEYCHELLES - Cascade"]],
        ["1300", ["4.63:South", "55.47:East", "SEYCHELLES - VICTORIA"]],
        ["1301", ["7.97:North", "11.75:West", "SIERRA LEONE - Bo"]],
        ["1302", ["7.53:North", "12.5:West", "SIERRA LEONE - Bonthe"]],
        ["1303", ["8.5:North", "13.28:West", "SIERRA LEONE - FREETOWN"]],
        ["1304", ["7.92:North", "11.2:West", "SIERRA LEONE - Kenema"]],
        ["1305", ["8.95:North", "12.03:West", "SIERRA LEONE - Makeni"]],
        ["1306", ["8.83:North", "12.83:West", "SIERRA LEONE - Port Loko"]],
        ["1307", ["1.35:North", "103.7:East", "SINGAPORE - Jurong"]],
        ["1308", ["1.4:North", "103.82:East", "SINGAPORE - Nee Soon"]],
        ["1309", ["1.38:North", "103.92:East", "SINGAPORE - Serangoon"]],
        ["1310", ["1.28:North", "103.85:East", "SINGAPORE - SINGAPORE CITY"]],
        ["379", ["48.17:North", "17.17:East", "SLOVAKIA - Bratislava"]],
        ["383", ["48.73:North", "21.25:East", "SLOVAKIA - Kosice"]],
        ["1662", ["46.07:North", "14.5:East", "SLOVENIA - Ljubljana"]],
        ["1663", ["46.55:North", "15.65:East", "SLOVENIA - Maribor"]],
        ["1311", ["8.75:South", "160.7:East", "SOLOMON ISLANDS - Auki"]],
        ["1312", ["7.83:South", "159.13:East", "SOLOMON ISLANDS - Gatere"]],
        ["1313", ["8.1:South", "156.85:East", "SOLOMON ISLANDS - Gizo"]],
        ["1314", ["9.47:South", "159.95:East", "SOLOMON ISLANDS - HONIARA"]],
        ["1315", ["10.45:South", "161.93:East", "SOLOMON ISLANDS - Kira Kira"]],
        ["1316", ["9.58:South", "159.65:East", "SOLOMON ISLANDS - Tangarare"]],
        ["1317", ["3.13:North", "43.57:East", "SOMALIA - Baidoa"]],
        ["1318", ["10.47:North", "45.03:East", "SOMALIA - Berbera"]],
        ["1319", ["9.5:North", "45.48:East", "SOMALIA - Burao"]],
        ["1320", ["0.37:North", "42.52:East", "SOMALIA - Chisimaayo"]],
        ["1321", ["2.8:North", "45.5:East", "SOMALIA - Giohar"]],
        ["1322", ["9.52:North", "44.03:East", "SOMALIA - Hargeysa"]],
        ["1323", ["1.8:North", "44.83:East", "SOMALIA - Merka"]],
        ["1324", ["2.03:North", "45.35:East", "SOMALIA - MOGADISHU"]],
        ["1325", ["29.12:South", "26.23:East", "SOUTH AFRICA - Bloemfontein"]],
        ["1326", ["26.22:South", "28.25:East", "SOUTH AFRICA - Boksburg"]],
        ["1327", ["33.93:South", "18.47:East", "SOUTH AFRICA - Cape Town"]],
        ["1328", ["29.88:South", "31:East", "SOUTH AFRICA - Durban"]],
        ["1329", ["33:South", "27.92:East", "SOUTH AFRICA - East London"]],
        ["1330", ["26.25:South", "28.17:East", "SOUTH AFRICA - Germiston"]],
        ["1331", ["26.17:South", "28.03:East", "SOUTH AFRICA - Johannesburg"]],
        ["1332", ["29.6:South", "30.27:East", "SOUTH AFRICA - Pietermaritzburg"]],
        ["1333", ["33.97:South", "25.6:East", "SOUTH AFRICA - Port Elizabeth"]],
        ["1334", ["25.75:South", "28.2:East", "SOUTH AFRICA - PRETORIA"]],
        ["1335", ["26.17:South", "27.88:East", "SOUTH AFRICA - Roodepoort"]],
        ["1336", ["29.88:South", "31:East", "SOUTH AFRICA - Umhlazi"]],
        ["1337", ["35.83:North", "127.08:East", "SOUTH KOREA - Chonju"]],
        ["1338", ["37.5:North", "126.63:East", "SOUTH KOREA - Inchon"]],
        ["1339", ["35.12:North", "126.87:East", "SOUTH KOREA - Kwangju"]],
        ["1340", ["35.17:North", "128.58:East", "SOUTH KOREA - Masan"]],
        ["1341", ["35.08:North", "129.03:East", "SOUTH KOREA - Pusan"]],
        ["1342", ["37.5:North", "127:East", "SOUTH KOREA - SEOUL"]],
        ["1343", ["37.27:North", "126.98:East", "SOUTH KOREA - Suwon"]],
        ["1344", ["35.87:North", "128.6:East", "SOUTH KOREA - Taegu"]],
        ["1345", ["36.33:North", "127.43:East", "SOUTH KOREA - Taejon"]],
        ["1346", ["35.53:North", "129.35:East", "SOUTH KOREA - Ulsan"]],
        ["1347", ["38.35:North", "0.48:West", "SPAIN - Alicante"]],
        ["1348", ["36.83:North", "2.45:West", "SPAIN - Almeria"]],
        ["1349", ["41.42:North", "2.17:East", "SPAIN - Barcelona"]],
        ["1350", ["43.25:North", "2.93:West", "SPAIN - Bilbao"]],
        ["1351", ["37.88:North", "4.77:West", "SPAIN - Cordoba"]],
        ["1352", ["37.22:North", "3.68:West", "SPAIN - Granada"]],
        ["1353", ["41.35:North", "2.1:East", "SPAIN - Hospitalet"]],
        ["1354", ["28.13:North", "15.45:West", "SPAIN - Las Palmas"]],
        ["1355", ["40.42:North", "3.72:West", "SPAIN - MADRID"]],
        ["1356", ["36.72:North", "4.42:West", "SPAIN - Malaga"]],
        ["1357", ["37.98:North", "1.12:West", "SPAIN - Murcia"]],
        ["1358", ["39.58:North", "2.65:East", "SPAIN - Palma"]],
        ["1359", ["42.48:North", "1.63:West", "SPAIN - Pamplona"]],
        ["1360", ["40.97:North", "5.65:West", "SPAIN - Salamanca"]],
        ["1361", ["43.32:North", "1.98:West", "SPAIN - San Sebastian"]],
        ["1362", ["37.38:North", "6:West", "SPAIN - Seville"]],
        ["1363", ["39.47:North", "0.37:West", "SPAIN - Valencia"]],
        ["1364", ["41.65:North", "4.75:West", "SPAIN - Valladolid"]],
        ["1365", ["41.65:North", "0.9:West", "SPAIN - Zaragoza"]],
        ["1366", ["77.95:North", "13.5:East", "SPITZBERGEN - Isfjord Radio"]],
        ["1367", ["78.2:North", "16:East", "SPITZBERGEN - Longyearbyen"]],
        ["1368", ["6.92:North", "79.87:East", "SRI LANKA - COLOMBO"]],
        ["1369", ["6.87:North", "79.87:East", "SRI LANKA - Dehiwala"]],
        ["1370", ["6.02:North", "80.22:East", "SRI LANKA - Galle"]],
        ["1371", ["9.67:North", "80.02:East", "SRI LANKA - Jaffna"]],
        ["1372", ["7.28:North", "80.67:East", "SRI LANKA - Kandy"]],
        ["1373", ["6.78:North", "79.88:East", "SRI LANKA - Moratuwa"]],
        ["1374", ["7.22:North", "79.85:East", "SRI LANKA - Negombo"]],
        ["1375", ["8.57:North", "81.23:East", "SRI LANKA - Trincomalee"]],
        ["1376", ["13.18:North", "30.17:East", "SUDAN - Al Obeid"]],
        ["1377", ["17.7:North", "34:East", "SUDAN - Atbara"]],
        ["1378", ["15.4:North", "36.42:East", "SUDAN - Kassala"]],
        ["1379", ["15.55:North", "32.53:East", "SUDAN - KHARTOUM"]],
        ["1380", ["13.18:North", "32.63:East", "SUDAN - Kosti"]],
        ["1381", ["15.62:North", "32.48:East", "SUDAN - Omdurman"]],
        ["1382", ["19.63:North", "37.12:East", "SUDAN - Port Sudan"]],
        ["1383", ["14.4:North", "33.47:East", "SUDAN - Wadi Medani"]],
        ["1384", ["5.88:North", "55.02:West", "SURINAME - Marienburg"]],
        ["1385", ["5.6:North", "54.42:West", "SURINAME - Moengo"]],
        ["1386", ["5.87:North", "57:West", "SURINAME - Nieuw Nickerie"]],
        ["1387", ["5.87:North", "55.23:West", "SURINAME - PARAMARIBO"]],
        ["1388", ["5.83:North", "56.23:West", "SURINAME - Totness"]],
        ["1389", ["26.83:South", "31.95:East", "SWAZILAND - Big Bend"]],
        ["1390", ["26.5:South", "31.37:East", "SWAZILAND - Manzini"]],
        ["1391", ["26.33:South", "31.13:East", "SWAZILAND - MBABANE"]],
        ["1392", ["26.03:South", "31.83:East", "SWAZILAND - Mhlume"]],
        ["1393", ["27.1:South", "31.2:East", "SWAZILAND - Nhlangano"]],
        ["1394", ["25.63:South", "31.25:East", "SWAZILAND - Piggs Peak"]],
        ["1395", ["26.5:South", "32:East", "SWAZILAND - Siteki"]],
        ["1396", ["57.73:North", "12.92:East", "SWEDEN - Boras"]],
        ["1397", ["60.67:North", "17.17:East", "SWEDEN - Gavle"]],
        ["1398", ["57.75:North", "12:East", "SWEDEN - Goteborg"]],
        ["1399", ["56.08:North", "12.75:East", "SWEDEN - Helsingborg"]],
        ["1400", ["57.75:North", "14.17:East", "SWEDEN - Jonkoping"]],
        ["1401", ["58.42:North", "15.58:East", "SWEDEN - Linkoping"]],
        ["1402", ["55.58:North", "13:East", "SWEDEN - Malmo"]],
        ["1403", ["58.58:North", "16.17:East", "SWEDEN - Norrkoping"]],
        ["1404", ["59.3:North", "15.08:East", "SWEDEN - Orebro"]],
        ["1405", ["64.77:North", "20.95:East", "SWEDEN - Skelleftea"]],
        ["1406", ["59.34:North", "18.10:East", "SWEDEN - STOCKHOLM"]],
        ["1407", ["62.38:North", "17.3:East", "SWEDEN - Sundsvall"]],
        ["1408", ["63.83:North", "20.25:East", "SWEDEN - Umea"]],
        ["1409", ["59.92:North", "17.63:East", "SWEDEN - Uppsala"]],
        ["1410", ["59.6:North", "16.53:East", "SWEDEN - Vasteras"]],
        ["1411", ["47.55:North", "7.6:East", "SWITZERLAND - Basel"]],
        ["1412", ["46.95:North", "7.43:East", "SWITZERLAND - BERN"]],
        ["1413", ["47.17:North", "7.27:East", "SWITZERLAND - Biel"]],
        ["1414", ["46.86:North", "9.51:East", "SWITZERLAND - Chur"]],
        ["1415", ["46.22:North", "6.15:East", "SWITZERLAND - Geneva"]],
        ["1416", ["46.93:North", "7.42:East", "SWITZERLAND - Köniz"]],
        ["1417", ["46.53:North", "6.65:East", "SWITZERLAND - Lausanne"]],
        ["1418", ["47.03:North", "8.3:East", "SWITZERLAND - Luzern"]],
        ["1419", ["47.42:North", "9.38:East", "SWITZERLAND - Saint Gallen"]],
        ["1420", ["46.77:North", "7.63:East", "SWITZERLAND - Thun"]],
        ["1421", ["47.5:North", "8.75:East", "SWITZERLAND - Winterthur"]],
        ["1422", ["47.38:North", "8.55:East", "SWITZERLAND - Zürich"]],
        ["1423", ["34.45:North", "40.92:East", "SYRIA - Abu-Kamal"]],
        ["1424", ["36.23:North", "37.17:East", "SYRIA - Aleppo"]],
        ["1425", ["33.5:North", "36.32:East", "SYRIA - DAMASCUS"]],
        ["1426", ["32.62:North", "36.1:East", "SYRIA - Dara"]],
        ["1427", ["35.33:North", "40.08:East", "SYRIA - Dayr az-Zawr"]],
        ["1428", ["35.08:North", "36.67:East", "SYRIA - Hama"]],
        ["1429", ["36.53:North", "40.73:East", "SYRIA - Hasakeh"]],
        ["1430", ["34.73:North", "36.72:East", "SYRIA - Homs"]],
        ["1431", ["35.93:North", "36.63:East", "SYRIA - Idlib"]],
        ["1432", ["35.52:North", "35.78:East", "SYRIA - Latakia"]],
        ["1433", ["35.95:North", "39.05:East", "SYRIA - Raqqa"]],
        ["1434", ["34.92:North", "35.87:East", "SYRIA - Tartus"]],
        ["1435", ["23.15:North", "120.18:East", "TAIWAN - Chiali"]],
        ["1436", ["24.92:North", "121.13:East", "TAIWAN - Chungli"]],
        ["1437", ["24.8:North", "120.98:East", "TAIWAN - Hsinchu"]],
        ["1438", ["22.6:North", "120.28:East", "TAIWAN - Kaohsiung"]],
        ["1439", ["25.13:North", "121.73:East", "TAIWAN - Keelung"]],
        ["1440", ["25.02:North", "121.45:East", "TAIWAN - Panchiao"]],
        ["1441", ["24.15:North", "120.67:East", "TAIWAN - Taichung"]],
        ["1442", ["23.02:North", "120.23:East", "TAIWAN - Tainan"]],
        ["1443", ["25.08:North", "121.53:East", "TAIWAN - TAIPEI"]],
        ["1444", ["24.85:North", "120.05:East", "TAIWAN - Yunghu"]],
        ["1445", ["3.38:South", "36.67:East", "TANZANIA - Arusha"]],
        ["1446", ["6.85:South", "39.3:East", "TANZANIA - DAR ES SALAAM"]],
        ["1447", ["6.17:South", "35.67:East", "TANZANIA - Dodoma"]],
        ["1448", ["8.9:South", "33.45:East", "TANZANIA - Mbeya"]],
        ["1449", ["2.52:South", "32.93:East", "TANZANIA - Mwanza"]],
        ["1450", ["5.02:South", "32.8:East", "TANZANIA - Tabora"]],
        ["1451", ["5.12:South", "39.1:East", "TANZANIA - Tanga"]],
        ["1452", ["6.2:South", "39.2:East", "TANZANIA - Zanzibar"]],
        ["1453", ["13.73:North", "100.5:East", "THAILAND - BANGKOK"]],
        ["1454", ["18.8:North", "98.98:East", "THAILAND - Chiang Mai"]],
        ["1455", ["13.4:North", "100.98:East", "THAILAND - Chon Buri"]],
        ["1456", ["7.02:North", "100.45:East", "THAILAND - Hat Yai"]],
        ["1457", ["16.43:North", "102.83:East", "THAILAND - Khon Kaen"]],
        ["1458", ["15:North", "102.1:East", "THAILAND - Nakhon Ratchasima"]],
        ["1459", ["8.4:North", "99.97:East", "THAILAND - Nakhon Si Thammarat"]],
        ["1460", ["16.83:North", "100.2:East", "THAILAND - Phitsanulok"]],
        ["1461", ["7.2:North", "100.58:East", "THAILAND - Songkhla"]],
        ["1462", ["6.23:North", "1.57:East", "TOGO - Anecho"]],
        ["1463", ["7.57:North", "1.23:East", "TOGO - Atakpame"]],
        ["1464", ["9.38:North", "1.33:East", "TOGO - Bafilo"]],
        ["1465", ["9.3:North", "0.88:East", "TOGO - Bassari"]],
        ["1466", ["6.17:North", "1.35:East", "TOGO - LOME"]],
        ["1467", ["10.38:North", "0.58:East", "TOGO - Mango"]],
        ["1468", ["6.95:North", "0.73:East", "TOGO - Palime"]],
        ["1469", ["8.98:North", "1.18:East", "TOGO - Sokode"]],
        ["1470", ["6.58:North", "1.5:East", "TOGO - Tabligbo"]],
        ["1471", ["6.43:North", "1.3:East", "TOGO - Tsevie"]],
        ["1472", ["18.65:South", "173.98:West", "TONGA - Neiafi"]],
        ["1473", ["21.15:South", "175.23:West", "TONGA - NUKUALOFA"]],
        ["1474", ["19.8:South", "174.35:West", "TONGA - Pangai"]],
        ["1475", ["10.63:North", "61.28:West", "TRINIDAD - Arima"]],
        ["1476", ["10.63:North", "61.52:West", "TRINIDAD - PORT-OF-SPAIN"]],
        ["1477", ["10.27:North", "61.47:West", "TRINIDAD - San Fernando"]],
        ["1478", ["11.18:North", "60.75:West", "TRINIDAD - Scarborough"]],
        ["1479", ["36.87:North", "10.2:East", "TUNISIA - Ariana"]],
        ["1480", ["37.3:North", "9.87:East", "TUNISIA - Bizerte"]],
        ["1481", ["33.87:North", "10.85:East", "TUNISIA - Djerba"]],
        ["1482", ["33.87:North", "10.1:East", "TUNISIA - Gabes"]],
        ["1483", ["34.42:North", "8.8:East", "TUNISIA - Gafsa"]],
        ["1484", ["35.7:North", "10.12:East", "TUNISIA - Kairouan"]],
        ["1485", ["36.87:North", "10.3:East", "TUNISIA - La Goulette"]],
        ["1486", ["34.75:North", "10.72:East", "TUNISIA - Sfax"]],
        ["1487", ["35.83:North", "10.63:East", "TUNISIA - Sousse"]],
        ["1488", ["36.83:North", "10.22:East", "TUNISIA - TUNIS"]],
        ["1489", ["37:North", "35.32:East", "TURKEY - Adana"]],
        ["1490", ["39.92:North", "32.83:East", "TURKEY - ANKARA"]],
        ["1491", ["40.2:North", "29.07:East", "TURKEY - Bursa"]],
        ["1492", ["37.92:North", "40.23:East", "TURKEY - Diyarbakir"]],
        ["1493", ["39.77:North", "30.5:East", "TURKEY - Eskisehir"]],
        ["1494", ["37.1:North", "37.38:East", "TURKEY - Gaziantep"]],
        ["1495", ["41.03:North", "28.95:East", "TURKEY - Istanbul"]],
        ["1496", ["38.42:North", "27.17:East", "TURKEY - Izmir"]],
        ["1497", ["38.7:North", "35.47:East", "TURKEY - Kayseri"]],
        ["1498", ["37.87:North", "32.52:East", "TURKEY - Konya"]],
        ["1499", ["36.78:North", "34.62:East", "TURKEY - Mersin (Icel)"]],
        ["1500", ["8.5:South", "179.2:East", "TUVALU - FUNAFUTI"]],
        ["1501", ["7:South", "177:East", "TUVALU - NUI"]],
        ["1502", ["24.47:North", "54.42:East", "U.A.E. - ABU DHABI"]],
        ["1503", ["25.23:North", "55.28:East", "U.A.E. - Dubai"]],
        ["1504", ["25.78:North", "55.95:East", "U.A.E. - Ras al-Khaimah"]],
        ["1505", ["25.33:North", "55.43:East", "U.A.E. - Sharjah"]],
        ["1506", ["0.07:North", "32.45:East", "UGANDA - Entebbe"]],
        ["1507", ["2.77:North", "32.35:East", "UGANDA - Gulu"]],
        ["1508", ["0.45:North", "33.23:East", "UGANDA - Jinja"]],
        ["1509", ["0.33:North", "32.58:East", "UGANDA - KAMPALA"]],
        ["1510", ["0.33:South", "31.73:East", "UGANDA - Masaka"]],
        ["1511", ["1.07:North", "34.2:East", "UGANDA - Mbale"]],
        ["1512", ["0.62:South", "30.65:East", "UGANDA - Mbarara"]],
        ["1513", ["0.7:North", "34.2:East", "UGANDA - Tororo"]],
        ["1514", ["50:North", "36.25:East", "UKRAINE - Kharkiv"]],
        ["1515", ["50.42:North", "30.5:East", "UKRAINE - Kyiv"]],
        ["1516", ["49.83:North", "24:East", "UKRAINE - Lviv"]],
        ["1517", ["46.47:North", "30.73:East", "UKRAINE - Odesa"]],
        ["10001", ["51.0782:North", "4.0583:West", "UNITED KINGDOM - Barnstaple"]],
        ["1519", ["52.5:North", "1.83:West", "UNITED KINGDOM - Birmingham"]],
        ["1520", ["53.8:North", "1.75:West", "UNITED KINGDOM - Bradford"]],
        ["1521", ["51.45:North", "2.58:West", "UNITED KINGDOM - Bristol"]],
        ["10003", ["51.4816:North", "3.1791:West", "UNITED KINGDOM - Cardiff"]],
        ["1522", ["52.42:North", "1.5:West", "UNITED KINGDOM - Coventry"]],
        ["1523", ["55.95:North", "3.2:West", "UNITED KINGDOM - Edinburgh"]],
        ["1524", ["55.87:North", "4.23:West", "UNITED KINGDOM - Glasgow"]],
        ["1525", ["53.75:North", "0.33:West", "UNITED KINGDOM - Kingston upon Hull"]],
        ["1526", ["53.83:North", "1.58:West", "UNITED KINGDOM - Leeds"]],
        ["1527", ["52.63:North", "1.08:West", "UNITED KINGDOM - Leicester"]],
        ["1528", ["53.42:North", "2.92:West", "UNITED KINGDOM - Liverpool"]],
        ["1529", ["51.5:North", "0.17:West", "UNITED KINGDOM - LONDON"]],
        ["1530", ["53.5:North", "2.25:West", "UNITED KINGDOM - Manchester"]],
        ["10002", ["52.63:North", "1.29:East", "UNITED KINGDOM - Norwich"]],
        ["1531", ["52.97:North", "1.17:West", "UNITED KINGDOM - Nottingham"]],
        ["10007", ["50.8198:North", "1.0880:West", "UNITED KINGDOM - Portsmouth"]],
        ["1532", ["53.38:North", "1.5:West", "UNITED KINGDOM - Sheffield"]],
        ["10004", ["51.6214:North", "3.9436:West", "UNITED KINGDOM - Swansea"]],
        ["1533", ["34.7:South", "56.23:West", "URUGUAY - Las Piedras"]],
        ["1534", ["32.37:South", "54.17:West", "URUGUAY - Melo"]],
        ["1535", ["33.27:South", "58.03:West", "URUGUAY - Mercedes"]],
        ["1536", ["34.33:South", "55.25:West", "URUGUAY - Minas"]],
        ["1537", ["34.92:South", "56.17:West", "URUGUAY - MONTEVIDEO"]],
        ["1538", ["32.35:South", "58.08:West", "URUGUAY - Paysandu"]],
        ["1539", ["30.9:South", "55.52:West", "URUGUAY - Rivera"]],
        ["1540", ["31.45:South", "57.97:West", "URUGUAY - Salto"]],
        ["1541", ["31.73:South", "55.98:West", "URUGUAY - Tacuarembo"]],
        ["1542", ["35.08:North", "106.63:West", "USA - Albuquerque- NM"]],
        ["1543", ["61.22:North", "149.9:West", "USA - Anchorage- AK"]],
        ["1544", ["33.73:North", "84.38:West", "USA - Atlanta- GA"]],
        ["1545", ["42.35:North", "71.05:West", "USA - Boston- MA"]],
        ["1546", ["42.867:North", "78.917:West", "USA - Buffalo- NY"]],
        ["1547", ["28.3922:North", "80.6077:West", "USA - Cape Canaveral - FL"]],
        ["1548", ["39.27:North", "104.81:West", "USA - Castle Rock - CO"]],
        ["1549", ["39.917:North", "75.02:West", "USA - Cherry Hill- NJ"]],
        ["1550", ["41.83:North", "87.75:West", "USA - Chicago- IL"]],
        ["1551", ["41.5:North", "81.68:West", "USA - Cleveland- OH"]],
        ["1552", ["34:North", "81:West", "USA - Columbia- SC"]],
        ["1553", ["32.78:North", "96.8:West", "USA - Dallas- TX"]],
        ["1554", ["39.73:North", "104.98:West", "USA - Denver- CO"]],
        ["1555", ["42.38:North", "83.08:West", "USA - Detroit- MI"]],
        ["1556", ["44.05:North", "123.07:West", "USA - Eugene- OR"]],
        ["1557", ["34.4:North", "118.89:West", "USA - Fillmore - CA"]],
        ["1558", ["39.18:North", "77.283:West", "USA - Germantown- MD"]],
        ["1559", ["39.599:North", "77.755:West", "USA - Hagerstown- MD"]],
        ["1560", ["25.78:North", "80.78:West", "USA - Homestead - FL"]],
        ["1561", ["21.32:North", "157.83:West", "USA - Honolulu- HW"]],
        ["1562", ["29.75:North", "95.42:West", "USA - Houston- TX"]],
        ["1563", ["30.33:North", "81.667:West", "USA - Jacksonville- FL"]],
        ["1564", ["48.2:North", "114.32:West", "USA - Kalispell- MT"]],
        ["1565", ["39.0997:North", "94.5786:West", "USA - Kansas City- MO"]],
        ["1566", ["24.5:North", "81.8:West", "USA - Key West- FL"]],
        ["1567", ["34.7:North", "92.283:West", "USA - Little Rock- AR"]],
        ["1568", ["34.0522:North", "118.2437:West", "USA - Los Angeles- CA"]],
        ["1569", ["36.1699:North", "115.1398:West", "USA - Las Vegas- NV"]],
        ["1570", ["38.22:North", "85.8:West", "USA - Louisville- KY"]],
        ["1571", ["33.58:North", "101.88:West", "USA - Lubbock- TX"]],
        ["1572", ["25.77:North", "80.18:West", "USA - Miami- FL"]],
        ["1573", ["43.05:North", "87.93:West", "USA - Milwaukee- WI"]],
        ["1574", ["45:North", "93.25:West", "USA - Minneapolis- MN"]],
        ["1575", ["48.27:North", "101.32:West", "USA - Minot- ND"]],
        ["1576", ["38.24:North", "122.27:West", "USA - Napa - CA"]],
        ["1577", ["26.15:North", "81.8:West", "USA - Naples- FL"]],
        ["1578", ["36.17:North", "86.83:West", "USA - Nashville- TN"]],
        ["1579", ["30:North", "90.05:West", "USA - New Orleans- LA"]],
        ["1580", ["40.75:North", "74:West", "USA - New York- NY"]],
        ["1581", ["41.5:North", "71.3:West", "USA - Newport- RI"]],
        ["1582", ["36.9:North", "76.3:West", "USA - Norfolk- VA"]],
        ["1583", ["41.25:North", "96:West", "USA - Omaha- NE"]],
        ["1584", ["28.5383:North", "81.3792:West", "USA - Orlando- FL"]],
        ["1585", ["40:North", "75.17:West", "USA - Philadelphia- PA"]],
        ["1586", ["33.5:North", "112.05:West", "USA - Phoenix- AZ"]],
        ["1587", ["42.883:North", "112.43:West", "USA - Pocatello- ID"]],
        ["1588", ["43.68:North", "70.3:West", "USA - Portland- ME"]],
        ["1589", ["45.5155:North", "122.6793:West", "USA - Portland- OR"]],
        ["1590", ["42.067:North", "70.183:West", "USA - Provincetown- MA"]],
        ["1591", ["39.53:North", "119.82:West", "USA - Reno- NV"]],
        ["1592", ["37.6:North", "77.5:West", "USA - Richmond- VA"]],
        ["1593", ["38.55:North", "121.5:West", "USA - Sacramento- CA"]],
        ["1594", ["40.75:North", "111.92:West", "USA - Salt Lake City- UT"]],
        ["1595", ["29.42:North", "98.5:West", "USA - San Antonio- TX"]],
        ["1596", ["32.75:North", "117.17:West", "USA - San Diego- CA"]],
        ["1597", ["37.77:North", "122.42:West", "USA - San Francisco- CA"]],
        ["1598", ["32.07:North", "81.117:West", "USA - Savannah- GA"]],
        ["1599", ["47.6:North", "122.32:West", "USA - Seattle- WA"]],
        ["1600", ["40.66:North", "73.83:West", "USA - Spring Creek - NY"]],
        ["1601", ["38.67:North", "90.25:West", "USA - St. Louis- MO"]],
        ["1602", ["27.97:North", "82.63:West", "USA - Tampa- FL"]],
        ["1603", ["36.117:North", "95.97:West", "USA - Tulsa- OK"]],
        ["1604", ["38.92:North", "77:West", "USA - WASHINGTON D.C."]],
        ["1605", ["41.27:North", "69.22:East", "UZBEKISTAN - Tashkent"]],
        ["1606", ["19.53:South", "169.27:East", "VANUATU - Isangel"]],
        ["1607", ["16.43:South", "167.72:East", "VANUATU - Lamap"]],
        ["1608", ["16.08:South", "167.38:East", "VANUATU - Norsup"]],
        ["1609", ["17.75:South", "168.3:East", "VANUATU - PORT VILA"]],
        ["1610", ["15.53:South", "167.13:East", "VANUATU - Santo"]],
        ["1611", ["10.13:North", "64.72:West", "VENEZUELA - Barcelona"]],
        ["1612", ["10.05:North", "69.3:West", "VENEZUELA - Barquisimeto"]],
        ["1613", ["10.38:North", "71.47:West", "VENEZUELA - Cabimas"]],
        ["1614", ["10.58:North", "66.93:West", "VENEZUELA - CARACAS"]],
        ["1615", ["8.1:North", "63.6:West", "VENEZUELA - Ciudad Bolivar"]],
        ["1616", ["8.37:North", "62.62:West", "VENEZUELA - Ciudad Guayana"]],
        ["1617", ["10.47:North", "64.17:West", "VENEZUELA - Cumana"]],
        ["1618", ["10.73:North", "71.62:West", "VENEZUELA - Maracaibo"]],
        ["1619", ["10.33:North", "67.47:West", "VENEZUELA - Maracay"]],
        ["1620", ["9.75:North", "63.17:West", "VENEZUELA - Maturin"]],
        ["1621", ["8.6:North", "71.13:West", "VENEZUELA - Merida"]],
        ["1622", ["7.77:North", "72.25:West", "VENEZUELA - San Cristobal"]],
        ["1623", ["10.23:North", "67.98:West", "VENEZUELA - Valencia"]],
        ["1624", ["11.9:North", "109.23:East", "VIETNAM - Cam Ranh"]],
        ["1625", ["10.05:North", "105.77:East", "VIETNAM - Can Tho"]],
        ["1626", ["16.07:North", "108.23:East", "VIETNAM - Da Nang"]],
        ["1627", ["20.83:North", "106.68:East", "VIETNAM - Haiphong"]],
        ["1628", ["21.02:North", "105.87:East", "VIETNAM - HANOI"]],
        ["1629", ["10.77:North", "106.72:East", "VIETNAM - Ho Chi Minh City"]],
        ["1630", ["16.47:North", "107.58:East", "VIETNAM - Hue"]],
        ["1631", ["10.35:North", "106.35:East", "VIETNAM - My Tho"]],
        ["1632", ["20.42:North", "106.17:East", "VIETNAM - Nam Dinh"]],
        ["1633", ["12.25:North", "109.17:East", "VIETNAM - Nha Trang"]],
        ["1634", ["13.78:North", "109.18:East", "VIETNAM - Qui Nhon"]],
        ["1635", ["18.67:North", "105.67:East", "VIETNAM - Vinh"]],
        ["1636", ["10.35:North", "107.07:East", "VIETNAM - Vung Tau"]],
        ["1637", ["18.45:North", "64.62:West", "VIRGIN ISLANDS UK - ROAD TOWN"]],
        ["1638", ["18.47:North", "64.45:West", "VIRGIN ISLANDS UK - Spanish Town"]],
        ["1639", ["18.73:North", "64.32:West", "VIRGIN ISLANDS UK - The Settlement"]],
        ["1640", ["18.35:North", "64.93:West", "VIRGIN ISLANDS US - CHARLOTTE AMALIE"]],
        ["1641", ["17.75:North", "64.7:West", "VIRGIN ISLANDS US - Christiansted"]],
        ["1642", ["18.33:North", "64.8:West", "VIRGIN ISLANDS US - Cruz Bay"]],
        ["1643", ["17.72:North", "64.88:West", "VIRGIN ISLANDS US - Frederiksted"]],
        ["1644", ["23.83:North", "15.95:West", "WESTERN SAHARA - Dakhla"]],
        ["1645", ["27.17:North", "13.18:West", "WESTERN SAHARA - LAAYOUNE"]],
        ["1646", ["26.8:North", "11.68:West", "WESTERN SAHARA - Semara"]],
        ["1647", ["13.8:South", "171.75:West", "WESTERN SAMOA - APIA"]],
        ["1648", ["13.65:South", "172.55:West", "WESTERN SAMOA - Salailua"]],
        ["1649", ["13.73:South", "172.3:West", "WESTERN SAMOA - Satupaitea"]],
        ["1650", ["14:South", "171.77:West", "WESTERN SAMOA - Siumu"]],
        ["1651", ["13.63:South", "172.13:West", "WESTERN SAMOA - Tuasivi"]],
        ["1652", ["12.78:North", "45.05:East", "YEMEN - Aden"]],
        ["1653", ["14.55:North", "44.5:East", "YEMEN - Dhamar"]],
        ["1654", ["14:North", "46.65:East", "YEMEN - El Beida"]],
        ["1655", ["15.75:North", "43.57:East", "YEMEN - Hajja"]],
        ["1656", ["14.83:North", "42.97:East", "YEMEN - Hodeida"]],
        ["1657", ["14.57:North", "49.12:East", "YEMEN - Mukalla"]],
        ["1658", ["15.4:North", "44.23:East", "YEMEN - SANAA"]],
        ["1659", ["13.58:North", "44.03:East", "YEMEN - Taizz"]],
        ["1673", ["12.33:South", "27.87:East", "ZAMBIA - Chililabombwe"]],
        ["1674", ["12.52:South", "27.88:East", "ZAMBIA - Chingola"]],
        ["1675", ["14.48:South", "28.42:East", "ZAMBIA - Kabwe"]],
        ["1676", ["12.83:South", "28.05:East", "ZAMBIA - Kalulushi"]],
        ["1677", ["12.83:South", "28.18:East", "ZAMBIA - Kitwe"]],
        ["1678", ["17.83:South", "25.88:East", "ZAMBIA - Livingstone"]],
        ["1679", ["13.15:South", "28.4:East", "ZAMBIA - Luanshya"]],
        ["1680", ["15.47:South", "28.27:East", "ZAMBIA - LUSAKA"]],
        ["1681", ["12.5:South", "28.2:East", "ZAMBIA - Mufulira"]],
        ["1682", ["13:South", "28.65:East", "ZAMBIA - Ndola"]],
        ["1683", ["20.17:South", "28.72:East", "ZIMBABWE - Bulawayo"]],
        ["1684", ["18.17:South", "30.23:East", "ZIMBABWE - Chegutu"]],
        ["1685", ["17.37:South", "30.2:East", "ZIMBABWE - Chinhoyi"]],
        ["1686", ["18:South", "31.1:East", "ZIMBABWE - Chitungwiza"]],
        ["1687", ["19.45:South", "29.82:East", "ZIMBABWE - Gweru"]],
        ["1688", ["17.83:South", "31.05:East", "ZIMBABWE - HARARE"]],
        ["1689", ["18.35:South", "29.92:East", "ZIMBABWE - Kadoma"]],
        ["1690", ["20.08:South", "30.83:East", "ZIMBABWE - Masvingo"]],
        ["1691", ["18.97:South", "32.67:East", "ZIMBABWE - Mutare"]],
        ["1692", ["18.92:South", "29.82:East", "ZIMBABWE - Que Que"]],
        ["1693", ["20.33:South", "30.03:East", "ZIMBABWE - Shabani"]],
        ["1694", ["18.37:South", "26.48:East", "ZIMBABWE - Wankie"]],
        ["1695", ["0:South", "0:West", "Choose your position"]],
    ];

    locations.forEach(function (entry, index) {
        idToIndexMap[entry[0]] = index;
    });
}