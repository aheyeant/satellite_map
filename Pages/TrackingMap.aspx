<%@ Page Language="C#" AutoEventWireup="true" CodeBehind="TrackingMap.aspx.cs" Inherits="SatelliteMap.Pages.TrackingMap"
    MasterPageFile="~/Pages/MasterPage.Master" Title="Online satellite tracking map"%>


<asp:Content ContentPlaceHolderID="headContent" runat="server">
    <link rel="stylesheet" href="https://unpkg.com/leaflet@1.5.1/dist/leaflet.css"/>
    <style>
        .leaflet-tile {
            filter: invert(1) grayscale(1) brightness(2.1);
        }
        .leaflet-control-attribution a {
            color: #333
        }
    </style>
    <script>
        document.addEventListener("DOMContentLoaded", function () {
            document.getElementById("trackingMapLabel").classList.add("selectedTab");
        });
    </script>

    <script>
        var selectedSatelliteListItemLabelId = null;
        
        document.addEventListener("DOMContentLoaded", function () {
            if (isMobile === true) {
                document.getElementById("trackingMapSatellitesPopularList").style.display = "none";
                document.getElementById("trackingMapSatellitesAllList").style.display = "none";
            } else {
                document.getElementById("trackingMapSelectorTabPopular").classList.add("selectedTab");
            }
        });
        
        function showPopularTabSelectorMapTracking() {
            if (isMobile === false) {
                document.getElementById("trackingMapSatellitesPopularList").style.display = "block";
                document.getElementById("trackingMapSatellitesAllList").style.display = "none";
                if (!document.getElementById("trackingMapSelectorTabPopular").classList.contains("selectedTab")) {
                    document.getElementById("trackingMapSelectorTabPopular").classList.add("selectedTab");
                }
                document.getElementById("trackingMapSelectorTabAll").classList.remove("selectedTab");
            } else {
                document.getElementById("trackingMap").style.display = "none";
                document.getElementById("autoGeolocationLabel").style.display = "none";
                document.getElementById("trackingMapSatellitesPopularList").style.display = "block";
                document.getElementById("trackingMapSatellitesAllList").style.display = "none";
            }
        };

        function showAllTabSelectorMapTracking() {
            if (isMobile === false) {
                document.getElementById("trackingMapSatellitesAllList").style.display = "block";
                document.getElementById("trackingMapSatellitesPopularList").style.display = "none";
                if (!document.getElementById("trackingMapSelectorTabAll").classList.contains("selectedTab")) {
                    document.getElementById("trackingMapSelectorTabAll").classList.add("selectedTab");
                }
                document.getElementById("trackingMapSelectorTabPopular").classList.remove("selectedTab");
            } else {
                document.getElementById("trackingMap").style.display = "none";
                document.getElementById("autoGeolocationLabel").style.display = "none";
                document.getElementById("trackingMapSatellitesPopularList").style.display = "none";
                document.getElementById("trackingMapSatellitesAllList").style.display = "block";
            }

        };

        function setSatelliteSelected(id, index) {
            if (isMobile === false) {
                if (id === null || index == null) {
                    return;
                }
                if (selectedSatelliteListItemLabelId === null) {
                    selectedSatelliteListItemLabelId = id;
                } else if (selectedSatelliteListItemLabelId === id) {
                    return;
                }

                document.getElementById(selectedSatelliteListItemLabelId).classList.remove("selectedSatelliteListItem");
                selectedSatelliteListItemLabelId = id;
                document.getElementById(selectedSatelliteListItemLabelId).classList.add("selectedSatelliteListItem");

                changeIndexSelectedSatellite(index);
            } else {
                if (id === null || index == null) {
                    document.getElementById("trackingMapSatellitesPopularList").style.display = "none";
                    document.getElementById("trackingMapSatellitesAllList").style.display = "none";
                    document.getElementById("trackingMap").style.display = "block"; 
                    document.getElementById("autoGeolocationLabel").style.display = "block"; 
                    return;
                }
                if (selectedSatelliteListItemLabelId === null) {
                    selectedSatelliteListItemLabelId = id;
                } else if (selectedSatelliteListItemLabelId === id) {
                    document.getElementById("trackingMapSatellitesPopularList").style.display = "none";
                    document.getElementById("trackingMapSatellitesAllList").style.display = "none";
                    document.getElementById("trackingMap").style.display = "block"; 
                    document.getElementById("autoGeolocationLabel").style.display = "block"; 
                    return;
                }

                document.getElementById(selectedSatelliteListItemLabelId).classList.remove("selectedSatelliteListItem");
                selectedSatelliteListItemLabelId = id;
                document.getElementById(selectedSatelliteListItemLabelId).classList.add("selectedSatelliteListItem");
                document.getElementById("trackingMapSatellitesPopularList").style.display = "none";
                document.getElementById("trackingMapSatellitesAllList").style.display = "none";
                document.getElementById("trackingMap").style.display = "block"; 
                document.getElementById("autoGeolocationLabel").style.display = "block"; 
                changeIndexSelectedSatellite(index);
            }
        };
    </script>
</asp:Content>


<asp:Content ContentPlaceHolderID="bodyContent" runat="server">
    <div id="livemapPageContent" class="pageContent">
        <div id="mapContainer">
            <div id="mapTitle">Title</div>
            <div id="trackingMapLayout">
                <div id="trackingMapBoxMap" class="mapTrackMap">
                    <div id="trackingMap"></div>
                </div>
                <div id="trackingMapSelector" class="selectorTrackMap">
                    <div id="trackingMapSelectorTabs" class="tabs">
                        <div id="trackingMapSelectorTabPopular" class='interactable tab' onclick="javascript:showPopularTabSelectorMapTracking();" ripple="ripple" ripple-color="#3880ff">
                            <div class="tabLabel">Popular</div>
                        </div>
                        <div id="trackingMapSelectorTabAll" class='interactable tab' onclick="javascript:showAllTabSelectorMapTracking();" ripple="ripple" ripple-color="#3880ff">
                            <div class="tabLabel">All</div>
                        </div>
                    </div>
                    <div id="trackingMapSatellitesPopularList" class="list" style="display: block;"></div>
                    <div id="trackingMapSatellitesAllList" class="list" style="display: none;"></div>
                </div>
                
            </div>
        </div>
    </div>
</asp:Content>


<asp:Content ContentPlaceHolderID="scriptContent" runat="server">
    <script src="https://unpkg.com/leaflet@1.5.1/dist/leaflet.js"></script>
    <script src="https://unpkg.com/@joergdietrich/leaflet.terminator@1.0.0/L.Terminator.js"></script>

    <script src="/Scripts/Assets/tleJSON.js"></script>
    <script src="/Scripts/satelliteSolver.js"></script>
    <script src="/Scripts/mapController.js"></script>

    <script>
        var satelliteSolver = new SatelliteSolver();
        var mapController = new MapController();

        if (observer.getIsGeolocated() === true) {
            observer.writeToObserverPositionLabel();
            weatherController.initWeather(observer.getLatitude(), observer.getLongitude(), isMobile);
        } else {
            weatherController.initWeather(null, null, isMobile);
        }
    </script>



    <script src="/Scripts/MapControllers/controllerTrackingMap.js"></script>
</asp:Content>