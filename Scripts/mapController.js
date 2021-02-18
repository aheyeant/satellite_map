function MapController() {
    var impl = new MapControllerImpl();

    this.initMap = function (divId, observer) {
        impl.initMap(divId, observer);
    };

    this.setView = function (latitude, longitude) {
        impl.setView(latitude, longitude);
    };

    this.drawObserverIcon = function (observer) {
        impl.drawObserverIcon(observer);
    };

    this.redrawObserverIcon = function (observer) {
        impl.redrawObserverIcon(observer);
    };

    this.drawSatellitesIcon = function (sats) {
        impl.drawSatellitesIcon(sats);
    };

    this.redrawSatellitesIcon = function (sats) {
        impl.redrawSatellitesIcon(sats);
    };

    this.drawSatellitesPath = function (sats) {
        impl.drawSatellitesPath(sats);
    };

    this.redrawSatellitesPath = function (sats) {
        impl.redrawSatellitesPath(sats);
    }
}

function MapControllerImpl() {
    //public
    var m_map;
    var m_observerIcon = null;
    var m_satelliteIcons = null;
    var m_satellitePaths = null;

    //private
    var m_satelliteIconPNG = L.icon({ iconUrl: SATELLITE_ICON_NAME, iconSize: [36, 36] });
    var m_SpaceStationIconPNG = L.icon({ iconUrl: SPACE_STATION_ICON_NAME, iconSize: [36, 36] });

    var pathColors = ['#ffd534', '#2fdf75', '#f72323', '#98caff', 'purple'];

    //public
    /**
     * @param {String} divId - id "<div>" where will be created map 
     */
    this.initMap = function (divId) {
        if (m_map !== undefined) {
            return;
        }

        // test center (in future must be change to user position)
        var mapCenterCoordinates = [0, 0];
        var mapZoom = 2;

        // creating a map object
        m_map = new L.map(divId).setView(mapCenterCoordinates, mapZoom);

        // creating a Layer object
        var layer = new L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        });

        // adding layer to the map
        m_map.addLayer(layer);
    };

    this.setView = function (latitude, longitude) {
        m_map.setView([latitude, longitude], 2);
    };

    /**
     * @param {Observer} observer
     */
    this.drawObserverIcon = function (observer) {
        clearObserverIcon();
        m_observerIcon = L.marker(observer.getObserverCoordinates()).addTo(m_map);
    };

    /**
     * @param {Observer} observer
     */
    this.redrawObserverIcon = function (observer) {
        if (m_observerIcon === null) return;
        m_observerIcon.setLatLng(observer.getObserverCoordinates());
    };

    /**
     * @param {Array} sats - array of satellites
     */
    this.drawSatellitesIcon = function (sats) {
        clearSatelliteIcons();
        if (sats === null) return;
        m_satelliteIcons = [];
        sats.forEach(function (sat) {
            var currentSatelliteCoordinates = satelliteSolver.getCurrentSatelliteCoordinates(sat);
            var satelliteIcon = null;
            if (sat.group === "Space Station") {
                var satelliteIcon = L.marker(currentSatelliteCoordinates, {
                    icon: m_SpaceStationIconPNG
                }).bindTooltip(sat.title, {
                    permanent: true,
                    direction: 'right'
                }).addTo(m_map);
            } else {
                var satelliteIcon = L.marker(currentSatelliteCoordinates, {
                    icon: m_satelliteIconPNG
                }).bindTooltip(sat.title, {
                    permanent: true,
                    direction: 'right'
                }).addTo(m_map);
            }

            m_satelliteIcons.push(satelliteIcon);
        });
    };

    /**
    * @param {Array} sats - array of satellites
    */
    this.redrawSatellitesIcon = function (sats) {
        if (m_satelliteIcons === null) return;
        if (sats === null) {
            clearSatelliteIcons();
            return;
        }
        sats.forEach(function (sat, index) {
            var currentSatelliteCoordinates = satelliteSolver.getCurrentSatelliteCoordinates(sat);
            m_satelliteIcons[index].setLatLng(currentSatelliteCoordinates);
        });
    }

    /**
    * @param {Array} sats - array of satellites
    */
    this.drawSatellitesPath = function (sats) {
        clearSatellitePaths();
        if (sats === null) return;
        m_satellitePaths = sats.map(function () { return [] });
        sats.forEach(function (sat, satelliteIndex) {
            _drawSatellitePath(sat, satelliteIndex);
        });
    }

    /**
    * @param {Array} sats - array of satellites
    */
    this.redrawSatellitesPath = function (sats) {
        if (m_satellitePaths === null) return;
        if (sats === null) {
            clearSatellitePaths();
            return;
        }
        sats.forEach(function (sat, satelliteIndex) {
            _drawSatellitePath(sat, satelliteIndex);
        });
    }


    //private

    function _drawSatellitePath(sat, satelliteIndex) {
        var MAX_SHOW_DISTANCE = 20;
        var currentPath = satelliteSolver.getSatellitePath(sat).path;

        m_satellitePaths[satelliteIndex].forEach(function (l) {
            l.remove();
        });
        m_satellitePaths[satelliteIndex] = [];

        var previousPoint = null;
        var pointsList = [];

        currentPath.forEach(function (coord, index) {
            var coordinateEntry = coord;
            var mPoint = new L.LatLng(coordinateEntry[0], coordinateEntry[1]);
            var distanceBetweenTwoPoints = 0;

            if (previousPoint !== null) {
                var d0 = previousPoint[0] - coordinateEntry[0];
                var d1 = previousPoint[1] - coordinateEntry[1];
                distanceBetweenTwoPoints = Math.sqrt(d0 * d0 + d1 * d1);
            }
            if (index === currentPath.length - 1 || distanceBetweenTwoPoints > MAX_SHOW_DISTANCE) {
                var line = new L.Polyline(pointsList, {
                    color: pathColors[satelliteIndex % pathColors.length],
                    weight: 2,
                    opacity: 0.5,
                    smoothFactor: 1
                });
                line.addTo(m_map);
                m_satellitePaths[satelliteIndex].push(line);

                pointsList = [];
            }
            if (distanceBetweenTwoPoints <= MAX_SHOW_DISTANCE) {
                pointsList.push(mPoint);
            }
            previousPoint = coordinateEntry;
        });
    }

    function clearObserverIcon() {
        if (m_observerIcon !== null) {
            m_observerIcon.remove();
            m_observerIcon = null;
        }
    };

    function clearSatelliteIcons() {
        if (m_satelliteIcons !== null) {
            m_satelliteIcons.forEach(function (icon) {
                icon.remove();
            })
            m_satelliteIcons = null;
        }
    };

    function clearSatellitePaths() {
        if (m_satellitePaths !== null) {
            m_satellitePaths.forEach(function (satPath) {
                satPath.forEach(function (l) {
                    l.remove();
                });
            });
            m_satellitePaths = null;
        }
    };
}
