using System;
using System.Threading.Tasks;

namespace SatelliteMap.ContentUpdater
{
    public class TLEParser
    {
        static System.Timers.Timer timer, startAppTimer;

        //string tleJsonTemplate = "{'name':'{0}', 'title':'{1}', 'group':'{2}', 'tle':['{3}','{4}'], 'popular':{5}, 'active':true}";

        public static void RunTLEUpdater(string filePath)
        {
            // update after 20 secs from App start; 
            startAppTimer = new System.Timers.Timer(20000);
            startAppTimer.Elapsed += async (sender, e) => await Task.Run(() => UpdateTLE(filePath));
            startAppTimer.AutoReset = false;
            startAppTimer.Enabled = true;

            // set timer for all day update
            timer = new System.Timers.Timer(86400000);
            timer.Elapsed += async (sender, e) => await Task.Run(() => UpdateTLE(filePath));
            timer.AutoReset = true;
            timer.Enabled = true;
        }

        private static void UpdateTLE(string filePath)
        {
            string jsonTle = "{'satellites': [";
            jsonTle += GetISSTLE();
            jsonTle += GetStarlinkTLE();
            jsonTle += GetGpsTLE();
            jsonTle += GetGlonassTLE();
            jsonTle += GetMeteostatTLE();
            jsonTle += GetIntelsatTLE();
            jsonTle += GetSesTLE();
            jsonTle += GetTelesatTLE();
            jsonTle += GetOrbcommTLE();
            jsonTle += "]};";
            string jsText = "var TLE = " + jsonTle;

            System.IO.File.WriteAllText(filePath, jsText);
        }

        private static String GetStarlinkTLE()
        {
            string result = "";
            try
            {
                result = GetReqest("https://www.celestrak.com/NORAD/elements/supplemental/starlink.txt");
            }
            catch (Exception)
            {
                return result;
            }
            return ParseTleToJson(result, "Starlink", 20, 3);
        }

        private static String GetGpsTLE()
        {
            string result = "";
            try
            {
                result = GetReqest("https://www.celestrak.com/NORAD/elements/supplemental/gps.txt");
            }
            catch (Exception)
            {
                return result;
            }
            return ParseTleToJson(result, "Gps", 20, 3);
        }

        private static String GetGlonassTLE()
        {
            string result = "";
            try
            {
                result = GetReqest("https://www.celestrak.com/NORAD/elements/supplemental/glonass.txt");
            }
            catch (Exception)
            {
                return result;
            }
            return ParseTleToJson(result, "Glonass", 20, 3);
        }

        private static String GetMeteostatTLE()
        {
            string result = "";
            try
            {
                result = GetReqest("https://www.celestrak.com/NORAD/elements/supplemental/meteosat.txt");
            }
            catch (Exception)
            {
                return result;
            }
            return ParseTleToJson(result, "Meteosat", 20, 3);
        }

        private static String GetIntelsatTLE()
        {
            string result = "";
            try
            {
                result = GetReqest("https://www.celestrak.com/NORAD/elements/supplemental/intelsat.txt");
            }
            catch (Exception)
            {
                return result;
            }
            return ParseTleToJson(result, "Intelsat", 20, 3);
        }

        private static String GetSesTLE()
        {
            string result = "";
            try
            {
                result = GetReqest("https://www.celestrak.com/NORAD/elements/supplemental/ses.txt");
            }
            catch (Exception)
            {
                return result;
            }
            return ParseTleToJson(result, "Ses S.A.", 20, 3);
        }

        private static String GetTelesatTLE()
        {
            string result = "";
            try
            {
                result = GetReqest("https://www.celestrak.com/NORAD/elements/supplemental/telesat.txt");
            }
            catch (Exception)
            {
                return result;
            }
            return ParseTleToJson(result, "Telesat", 20, 3);
        }

        private static String GetOrbcommTLE()
        {
            string result = "";
            try
            {
                result = GetReqest("https://www.celestrak.com/NORAD/elements/supplemental/orbcomm.txt");
            }
            catch (Exception)
            {
                return result;
            }
            return ParseTleToJson(result, "Orbcoom", 20, 3);
        }

        private static String GetISSTLE()
        {
            string result = "";
            try
            {
                result = GetReqest("https://www.celestrak.com/NORAD/elements/supplemental/iss.txt");
            }
            catch (Exception)
            {
                return result;
            }
            var lines = result.Split('\n');
            if (lines.Length < 4)
            {
                return "";
            }
            return "{" + string.Format("'name':'{0}', 'title':'{1}', 'group':'{2}', 'tle':['{3}','{4}'], 'popular':{5}, 'active':true", "ISS", "ISS", "Space Station", lines[lines.Length - 3].Substring(0, lines[lines.Length - 3].Length - 1), lines[lines.Length - 2].Substring(0, lines[lines.Length - 2].Length - 1), "true") + "},";
        }

        private static String GetReqest(string url)
        {
            System.Net.WebRequest req = System.Net.WebRequest.Create(url);
            System.Net.WebResponse resp = req.GetResponse();
            System.IO.Stream stream = resp.GetResponseStream();
            System.IO.StreamReader sr = new System.IO.StreamReader(stream);
            string Out = sr.ReadToEnd();
            sr.Close();
            return Out;
        }

        /**
         * tle - string of tle
         * maxCount - max tle for parsing
         * maxPopular - max tle which will be marker popular 
         */
        public static String ParseTleToJson(string tle, string group, int maxCount, int maxPopular)
        {
            string result = "";

            var lines = tle.Split('\n');
            if (lines.Length < 4)
            {
                return result; 
            }

            int count = 0;
            int popularCount = 0;
            for (int i = 0; i < lines.Length - 2; i += 3)
            {
                if (count == maxCount) break;
                count++;
                result += "{" + string.Format("'name':'{0}', 'title':'{1}', 'group':'{2}', 'tle':['{3}','{4}'], 'popular':{5}, 'active':true", lines[i].Substring(0, lines[i].Length - 1), lines[i].Substring(0, lines[i].Length - 1), group, lines[i + 1].Substring(0, lines[i + 1].Length - 1), lines[i + 2].Substring(0, lines[i + 2].Length - 1), popularCount++ < maxPopular ? "true" : "false") + "},";
            }
            return result;
        }
    }
}