var selectedSatellites = null;

window.onload = function () {
    mapController.initMap("liveMap");
    document.getElementById("autoGeolocationLabel").style.display = "block";

    selectedSatellites = satelliteSolver.getNearestStatellites(LIVE_MAP_NEAREST_DISATANCE, LIVE_MAP_SELECT_ONLY_POPULAR_SATELITES, LIVE_MAP_SHOW_SATELLITE_COUNT);
    mapController.drawObserverIcon(observer);
    mapController.drawSatellitesIcon(selectedSatellites);
    mapController.drawSatellitesPath(selectedSatellites);

	setInterval(function () {
		mapController.redrawSatellitesIcon(selectedSatellites);
		mapController.redrawObserverIcon(observer);
    }, 1000);

    setInterval(function () {
        mapController.redrawSatellitesPath(selectedSatellites);
    }, 1000 * 20);
}

function changeObserverPosition() {
    var selectedSatellites = satelliteSolver.getNearestStatellites(LIVE_MAP_NEAREST_DISATANCE, LIVE_MAP_SELECT_ONLY_POPULAR_SATELITES, LIVE_MAP_SHOW_SATELLITE_COUNT);
    mapController.setView(observer.getLatitude(), observer.getLongitude());
    mapController.drawObserverIcon(observer);
    mapController.drawSatellitesIcon(selectedSatellites);
    mapController.drawSatellitesPath(selectedSatellites);
};
