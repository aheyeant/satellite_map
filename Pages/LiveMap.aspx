<%@ Page Language="C#" AutoEventWireup="true" CodeBehind="LiveMap.aspx.cs" Inherits="SatelliteMap.Pages.LiveMap" 
    MasterPageFile="~/Pages/MasterPage.Master" Title="Online satellite map"%>


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
            document.getElementById("liveMapTabLabel").classList.add("selectedTab");
        });
    </script>
</asp:Content>


<asp:Content ContentPlaceHolderID="bodyContent" runat="server">
    <div id="livemapPageContent" class="pageContent">
        <div id="mapContainer">
            <div id="mapTitle">Live Satellite Map</div>
            <div id="liveMap"></div>
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

    <script src="/Scripts/MapControllers/controllerLiveMap.js"></script>
</asp:Content>