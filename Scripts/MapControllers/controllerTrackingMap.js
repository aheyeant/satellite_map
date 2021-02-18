// set popular satelites labels
document.getElementById('trackingMapSatellitesPopularList').innerHTML = satelliteSolver.getPopularSatelliteLabels();

// set all satelites labels
document.getElementById('trackingMapSatellitesAllList').innerHTML = satelliteSolver.getAllSatelliteLabels();

var selectedSatellite = [];

window.onload = function () {
    mapController.initMap("trackingMap");
    document.getElementById("autoGeolocationLabel").style.display = "block";

    setFirstSelectedSatellite()
    mapController.drawObserverIcon(observer);
    mapController.drawSatellitesIcon(selectedSatellite);
    mapController.drawSatellitesPath(selectedSatellite);

    setInterval(function () {
        mapController.redrawSatellitesIcon(selectedSatellite);
        mapController.redrawObserverIcon(observer);
    }, 1000);

    setInterval(function () {
        mapController.redrawSatellitesPath(selectedSatellite);
    }, 1000 * 20);
};

function changeObserverPosition() {
    mapController.drawObserverIcon(observer);
    mapController.setView(observer.getLatitude(), observer.getLongitude());
};

function changeIndexSelectedSatellite(index) {
    var _satellite = satelliteSolver.getSatelliteByIndex(index);
    if (_satellite === null) {
        //[DEBUG_MESSAGE]
        if (DEBUG === true) {
            console.log("[DEBUG_MESSAGE] Bad satellite index", index);
        }
        return;
    }
    document.getElementById("mapTitle").innerText = _satellite.title;
    selectedSatellite = [_satellite];
    mapController.drawSatellitesIcon(selectedSatellite);
    mapController.drawSatellitesPath(selectedSatellite);
};

function setFirstSelectedSatellite() {
    _result = satelliteSolver.getFirstPopularSatelliteIdAndIndex();

    if (_result === null) {
        _oneFromAllSats = satelliteSolver.getSatelliteByIndex[0];
        if (_oneFromAllSats === null) {
            return;
        }
        _strId = "" + DEFAULT_SATELLITE_LIST_ITEM_PREFIX + 'All' + 0;
        _result = [_strId, 0];
    }

    setSatelliteSelected(_result[0], _result[1]);
};