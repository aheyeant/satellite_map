<%@ Page Language="C#" AutoEventWireup="true" CodeBehind="Home.aspx.cs" Inherits="SatelliteMap.Pages.Home"
    MasterPageFile="~/Pages/MasterPage.Master" Title="Home"%>


<asp:Content ContentPlaceHolderID="headContent" runat="server">
    <script>
        document.addEventListener("DOMContentLoaded", function () {
            document.getElementById("homeTabLabel").classList.add("selectedTab");
        });
    </script>

</asp:Content>


<asp:Content ContentPlaceHolderID="bodyContent" runat="server">
    <div id="homePageCenterContainer">
        <div id="homePageNews">
            <div id="homePageNewsLaunchHeader" class="homePageNewsLaunchHeader" style="display: block">Upcoming Launches</div>
            <div id="homePageNewsLaunchFailMessage" class="homePageNewsLaunchFail" style="display: none">Sorry. All the missiles flew away.</div>
            <div id="homePageNewsLaunch"></div>
        </div>
    </div>

</asp:Content>


<asp:Content ContentPlaceHolderID="scriptContent" runat="server">
    <script src="/Scripts/newsController.js"></script>
    <script src="/Scripts/Assets/nextLaunches.js"></script>
    <script>
        // Home page not need waether widget and coordinate setter
        document.getElementById("weatherWidget").style.display = "none";
        document.getElementById("weatherWidgetMobile").style.display = "none";
        document.getElementById("observerPosition").style.display = "none";

        var newsController = new NewsController();
        newsController.initNews();
    </script>
</asp:Content>

