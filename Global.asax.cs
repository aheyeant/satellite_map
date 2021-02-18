using System;
using System.Web;
using System.Web.Routing;
using System.Web.Http;
using SatelliteMap.App_Start;
using SatelliteMap.ContentUpdater;

namespace SatelliteMap
{
    public class Global : HttpApplication
    {
        void Application_Start(object sender, EventArgs e)
        {
            RoutePagesConfig.RegisterRoutes(RouteTable.Routes);

            TLEParser.RunTLEUpdater(Server.MapPath("~/Scripts/Assets/tleJSON.js"));

            GlobalConfiguration.Configure(WebApiConfig.Register);
        }
    }
}