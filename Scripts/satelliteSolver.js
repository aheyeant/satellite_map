function SatelliteSolver() {
    var impl = new SatelliteSolverImpl();

    this.getCurrentSatelliteCoordinates = function (sat) {
        return impl.getCurrentSatelliteCoordinates(sat);
    };

    this.getSatellitePath = function (sat, duration) {
        return impl.getSatellitePath(sat, duration);
    };

    this.getActiveSatelites = function () {
        return impl.getActiveSatelites();
    };

    this.getActivePopularSatelites = function () {
        return impl.getActivePopularSatelites();
    };

    this.getActiveWithoutPopularSatelites = function () {
        return impl.getActiveWithoutPopularSatelites();
    };

    this.getNearestStatellites = function (distance, fromPopular, maxCount) {
        return impl.getNearestStatellites(distance, fromPopular, maxCount);
    }

    this.getPopularSatelliteLabels = function () {
        return impl.getPopularSatelliteLabels();
    };

    this.getAllSatelliteLabels = function () {
        return impl.getAllSatelliteLabels();
    };

    this.getSatelliteByIndex = function (index) {
        return impl.getSatelliteByIndex(index);
    }

    this.getFirstPopularSatelliteIdAndIndex = function () {
        return impl.getFirstPopularSatelliteIdAndIndex();
    }
}

function SatelliteSolverImpl() {
    /**
     * args:
     *      sat: containing {name: "starlink", title: "Starlink", tle: ["line1", "line2"], satrec: <result of satellite.twoline2satrec(TLE)>}
     * 
     * return:
     *      [satLatitude, satLongitude, altitude]
     */
    this.getCurrentSatelliteCoordinates = function (sat) {
        if (sat.satrec === undefined) {
            sat.satrec = satellite.twoline2satrec(sat.tle[0], sat.tle[1]);
        }

        var positionAndVelocity = satellite.propagate(sat.satrec, new Date());
        var positionEci = positionAndVelocity.position
        var gmst = satellite.gstime(new Date());
        var positionGd = satellite.eciToGeodetic(positionEci, gmst);

        var satLatitude = satellite.radiansToDegrees(positionGd.latitude);
        var satLongitude = satellite.radiansToDegrees(positionGd.longitude);
        var altitude = positionGd.height;

        return [satLatitude, satLongitude, altitude];
    }

    /**
     * args:
     *      sat: containing {name: "starlink", title: "Starlink", tle: ["line1", "line2"], satrec: <result of satellite.twoline2satrec(TLE)>}
     *      duration (optional) : duration to create path, from -duration/2 to duration/2
     *      
     * return:
     *      {
     *          startEpoch: 1234567890, // UTC Unix time(seconds) of first path point in
     *          path: [
     *              [latitude (number), longitude (number)], // deg
     *              ...
     *          ]
     *      }
     */
    this.getSatellitePath = function (sat, duration) {
        if (duration === undefined) {
            duration = DEFAULT_SATELLITE_PATD_DURATION;
        }

        var pathPoints = [];
        var frequencyPerMin = 1;
        var pathPointsCount = duration * frequencyPerMin;
        var pathDurationHalf = parseInt(pathPointsCount / 2); // minutes

        if (sat.satrec === undefined) {
            sat.satrec = satellite.twoline2satrec(sat.tle[0], sat.tle[1]);
        }

        var currentTime = new Date().getTime(); // milliseconds
        var firstPathPointTime = null;

        for (var i = -pathDurationHalf; i < pathDurationHalf + 1; i++) {
            var epochTimeInMs = currentTime + (i * parseInt(60 / frequencyPerMin) * 1000);
            if (firstPathPointTime === null) {
                firstPathPointTime = epochTimeInMs;
            }

            var date = new Date(epochTimeInMs);

            var positionAndVelocity = satellite.propagate(sat.satrec, date);
            var positionEci = positionAndVelocity.position;
            var gmst = satellite.gstime(date);
            var positionGd = satellite.eciToGeodetic(positionEci, gmst);

            var satLatitude = satellite.radiansToDegrees(positionGd.latitude);
            var satLongitude = satellite.radiansToDegrees(positionGd.longitude);

            pathPoints.push([satLatitude, satLongitude]);
        }

        var result = {
            startEpoch: Math.floor(firstPathPointTime / 1000),
            path: pathPoints
        };

        return result;
    }

    this.getActiveSatelites = function () {
        return _getActiveSatelites();
    }

    this.getActivePopularSatelites = function () {
        return _getActivePopularSatelites();
    }

    this.getActiveWithoutPopularSatelites = function () {
        return _getActiveWithoutPopularSatelites();
    }

    /**
     * Return array of satellites closer than distance. 
     *  If distance < 20, not number or null use DEFAULT_DISTANCE;
     *  If maxCount < 1, not number or null use DEFAULT_FIND_SATELLITE_COUNT;
     * @param {number} distance // Kilometers
     * @param {boolean} fromPopular
     * @param {number} maxCount
     */
    this.getNearestStatellites = function (distance, fromPopular, maxCount) {
        if (distance === undefined || distance === null || isNaN(parseInt(distance)) || distance < 20) {
            distance = DEFAULT_CLOSEST_DISTANCE;
        }
        if (maxCount === undefined || maxCount === null || isNaN(parseInt(maxCount)) || maxCount < 1 || maxCount > MAX_FIND_SATELLITE_COUNT) {
            maxCount = MAX_FIND_SATELLITE_COUNT;
        }


        var _satellites = null;

        if (fromPopular === true) {
            _satellites = _getActivePopularSatelites();
        } else {
            _satellites = _getActiveSatelites();
        }

        if (_satellites.length === 0) return [];

        _selectedSatelites = [];

        _satellites.forEach(function (sat) {
            if (_selectedSatelites.length >= maxCount) return; 
            var _coord = satelliteSolver.getCurrentSatelliteCoordinates(sat);
            if (observer.distanceToEarthPointInKm(_coord[0], _coord[1]) <= distance) {
                _selectedSatelites.push(sat);
            }
        });

        if (_selectedSatelites.length === 0) {
            return [_satellites[0]];
        }
        return _selectedSatelites;
    }

    this.getPopularSatelliteLabels = function () {
        if (TLE === undefined || TLE.satellites === undefined) {
            return "";
        }
        var _selectedLabels = "";
        TLE.satellites.forEach(function (sat, index) {
            if (sat.active === true && sat.popular === true) {
                _selectedLabels += '<div id="' + DEFAULT_SATELLITE_LIST_ITEM_PREFIX + 'Popular' + index + '" '; //add id
                _selectedLabels += 'onclick="javascript:setSatelliteSelected(\'' + DEFAULT_SATELLITE_LIST_ITEM_PREFIX + 'Popular' + index + '\', ' + index + ');" ' //add onclick
                _selectedLabels += 'class="satelliteListItem"><div>' + sat.title + '</div><div>' + sat.group + '</div></div>';
            }    
        });
        return _selectedLabels;
    };

    this.getAllSatelliteLabels = function () {
        if (TLE === undefined || TLE.satellites === undefined) {
            return "";
        }
        var _selectedLabels = "";
        TLE.satellites.forEach(function (sat, index) {
            if (sat.active === true) {
                _selectedLabels += '<div id="' + DEFAULT_SATELLITE_LIST_ITEM_PREFIX + 'All' + index + '" '; //add id
                _selectedLabels += 'onclick="javascript:setSatelliteSelected(\'' + DEFAULT_SATELLITE_LIST_ITEM_PREFIX + 'All' + index + '\', ' + index + ');" ' //add onclick
                _selectedLabels += 'class="satelliteListItem"><div>' + sat.title + '</div><div>' + sat.group + '</div></div>';
            }
        });
        return _selectedLabels;
    };

    this.getSatelliteByIndex = function (index) {
        if (TLE === undefined || TLE.satellites === undefined) {
            return null;
        }
        return TLE.satellites[index];
    }

    this.getFirstPopularSatelliteIdAndIndex = function () {
        if (TLE === undefined || TLE.satellites === undefined) {
            return null;
        }
        var _result = null;
        TLE.satellites.forEach(function (sat, index) {
            if (sat.active === true && sat.popular === true) {
                _strId = "" + DEFAULT_SATELLITE_LIST_ITEM_PREFIX + 'Popular' + index;
                _result = [_strId, index];
            }
        });
        return _result;
    };

    // private
    /**
      * Using var TLE as array of satellite
      * @returns {Array} - array of active satelites
      */
    function _getActiveSatelites() {
        if (TLE === undefined || TLE.satellites === undefined) {
            return [];
        }
        return TLE.satellites.filter(function (sat) { return sat.active === true });
    }

    /**
     * Using var TLE as array of satellite
     * @returns {Array} - array of active popular satelites
     */
    function _getActivePopularSatelites() {
        if (TLE === undefined || TLE.satellites === undefined) {
            return [];
        }
        return TLE.satellites.filter(function (sat) { return (sat.active === true && sat.popular === true) });
    }

    /**
     * Using var TLE as array of satellite
     * @returns {Array} - array of active satelites without popular satelites
     */
    function _getActiveWithoutPopularSatelites() {
        if (TLE === undefined || TLE.satellites === undefined) {
            return [];
        }
        return TLE.satellites.filter(function (sat) { return (sat.active === true && sat.popular === false) });
    }
}