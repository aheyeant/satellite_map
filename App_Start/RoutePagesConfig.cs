    using System.Web.Routing;

namespace SatelliteMap.App_Start
{
    public class RoutePagesConfig
    {
        public static void RegisterRoutes(RouteCollection routes)
        {
            /**
             * param_1 = routeName
             * param_2 = routeUrl (input URL)
             * param_3 = physicalFile (from ~/Pages)
             */

            routes.MapPageRoute("home",
                                "",
                                "~/Pages/Home.aspx");

            routes.MapPageRoute("liveMap",
                                "live",
                                "~/Pages/LiveMap.aspx");

            routes.MapPageRoute("trackingMap",
                                "tracking",
                                "~/Pages/TrackingMap.aspx");
        }
    }
}