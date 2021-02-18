function NewsController() {
    var impl = new NewsControllerImpl();

    this.initNews = function () {
        impl.getPlannedLaunch();
        impl.corrector();
    };
};


function NewsControllerImpl() {
    var isUpcomingLaunches = false;

    this.getPlannedLaunch = function () {
        //_getUpcomingLaunchesOriginalJSON(launchNews);
        _getUpcomingLaunchesReformatedJSON(launchNews);
    }

    this.corrector = function () {
        if (isUpcomingLaunches === false) {
            document.getElementById("homePageNewsLaunchFailMessage").style.display = "block";
        }
    }


    // private

    // Original JSON from https://ll.thespacedevs.com/2.0.0/launch/upcoming/?limit=50&offset=0
    function _getUpcomingLaunchesOriginalJSON(launchNews) {
        var homePageNewsLaunch = document.getElementById("homePageNewsLaunch");
        if (homePageNewsLaunch === undefined || homePageNewsLaunch === null) {
            return;
        }
        if (launchNews === null || launchNews === undefined || launchNews === "") {
            homePageNewsLaunch.style.display = "none";
            return;
        }

        var _timersArgs = [];

        var counter = 0;
        launchNews.results.forEach(function (launch) {
            if (counter >= MAX_UPCOMING_LAUNCHES) return;
            if (_isLaunchSkipped(launch.net) === false) {
                counter++;
                var _launchId = launch.id;
                var _launchImage = launch.image; // rocket image
                var _launchHeader = launch.name; // rocket name
                var _launchText_1 = launch.launch_service_provider.name; // launch provider
                var _launchText_2 = launch.pad.name; // rocket start place
                var _launchDate = launch.net; // launch start

                var _innerHTML = "";

                _innerHTML += "<div class='homePageNewsEntry'>";
                _innerHTML += "<div class='launchEntryBox'>";

                _innerHTML += "<div class='launchEntryImageBox'>";
                _innerHTML += "<div class='launchEntryImage' style='background-image: url(" + _launchImage + ");'></div>"
                _innerHTML += "</div>";

                _innerHTML += "<div class='launchEntryInfoBox'>";
                _innerHTML += "<div>";

                _innerHTML += "<div class='launchHeader'>" + _launchHeader + "</div>";

                _innerHTML += "<div class='launchText'>";
                _innerHTML += "<span>" + _launchText_1 + "</span>";
                _innerHTML += "<br/>";
                _innerHTML += "<span>" + _launchText_2 + "</span>";
                _innerHTML += "</div>";

                _innerHTML += "<div class='launchTimer'>";

                _innerHTML += "<div class='launchTimerItem'>";
                _innerHTML += "<h2 id='launchTime-" + _launchId + "'>T-</h2>";
                _innerHTML += "</div>";

                _innerHTML += "<div class='launchTimerItem'>";
                _innerHTML += "<h2 id='days-" + _launchId + "'>00</h2>";
                _innerHTML += "<p>Days</p>";
                _innerHTML += "</div>";

                _innerHTML += "<div class='launchTimerItem'>";
                _innerHTML += "<h2>:</h2>";
                _innerHTML += "</div>";

                _innerHTML += "<div class='launchTimerItem'>";
                _innerHTML += "<h2 id='hours-" + _launchId + "'>00</h2>";
                _innerHTML += "<p>Hours</p>";
                _innerHTML += "</div>";

                _innerHTML += "<div class='launchTimerItem'>";
                _innerHTML += "<h2>:</h2>";
                _innerHTML += "</div>";

                _innerHTML += "<div class='launchTimerItem'>";
                _innerHTML += "<h2 id='mins-" + _launchId + "'>00</h2>";
                _innerHTML += "<p>Mins</p>";
                _innerHTML += "</div>";

                _innerHTML += "<div class='launchTimerItem'>";
                _innerHTML += "<h2>:</h2>";
                _innerHTML += "</div>";

                _innerHTML += "<div class='launchTimerItem'>";
                _innerHTML += "<h2 id='secs-" + _launchId + "'>00</h2>";
                _innerHTML += "<p>Secs</p>";
                _innerHTML += "</div>";

                _innerHTML += "</div>";

                _innerHTML += "<div class='launchDate'>" + _launchDate + "</div>";

                _innerHTML += "</div>";
                _innerHTML += "</div>";
                _innerHTML += "</div>";
                _innerHTML += "</div>";

                homePageNewsLaunch.innerHTML += _innerHTML;

                _timersArgs.push([_launchDate, _launchId]);
            }
        });

        if (_timersArgs.length !== 0) {
            isUpcomingLaunches = true;
        }

        _timersArgs.forEach(function (args) {
            var _timer = _getTimer(args[0], args[1]);
            _timer.run();
        });
    }

    // Reformated JSON from https://ll.thespacedevs.com/2.0.0/launch/upcoming/?limit=50&offset=0
    // See ~/Standats/FormatUpcomingLaunchesReforvated_v1.txt
    function _getUpcomingLaunchesReformatedJSON(launchNews) {
        var homePageNewsLaunch = document.getElementById("homePageNewsLaunch");
        if (homePageNewsLaunch === undefined || homePageNewsLaunch === null) {
            return;
        }
        if (launchNews === null || launchNews === undefined || launchNews === "") {
            homePageNewsLaunch.style.display = "none";
            return;
        }

        var _timersArgs = [];

        var counter = 0;
        launchNews.results.forEach(function (launch) {
            if (counter >= MAX_UPCOMING_LAUNCHES) return;
            if (_isLaunchSkipped(launch.launchDate) === false) {
                counter++;

                var _launchId = launch.id;
                var _launchImage = launch.image; // rocket image
                var _launchHeader = launch.rocketName; // rocket name
                var _launchText_1 = launch.providerName; // launch provider
                var _launchText_2 = launch.padName; // rocket start place
                var _launchDate = launch.launchDate; // launch start

                var _innerHTML = "";

                _innerHTML += "<div class='homePageNewsEntry'>";
                _innerHTML += "<div class='launchEntryBox'>";

                _innerHTML += "<div class='launchEntryImageBox'>";
                _innerHTML += "<div class='launchEntryImage' style='background-image: url(" + _launchImage + ");'></div>"
                _innerHTML += "</div>";

                _innerHTML += "<div class='launchEntryInfoBox'>";
                _innerHTML += "<div>";

                _innerHTML += "<div class='launchHeader'>" + _launchHeader + "</div>";

                _innerHTML += "<div class='launchText'>";
                _innerHTML += "<span>" + _launchText_1 + "</span>";
                _innerHTML += "<br/>";
                _innerHTML += "<span>" + _launchText_2 + "</span>";
                _innerHTML += "</div>";

                _innerHTML += "<div class='launchTimer'>";

                _innerHTML += "<div class='launchTimerItem'>";
                _innerHTML += "<h2 id='launchTime-" + _launchId + "'>T-</h2>";
                _innerHTML += "</div>";

                _innerHTML += "<div class='launchTimerItem'>";
                _innerHTML += "<h2 id='days-" + _launchId + "'>00</h2>";
                _innerHTML += "<p>Days</p>";
                _innerHTML += "</div>";

                _innerHTML += "<div class='launchTimerItem'>";
                _innerHTML += "<h2>:</h2>";
                _innerHTML += "</div>";

                _innerHTML += "<div class='launchTimerItem'>";
                _innerHTML += "<h2 id='hours-" + _launchId + "'>00</h2>";
                _innerHTML += "<p>Hours</p>";
                _innerHTML += "</div>";

                _innerHTML += "<div class='launchTimerItem'>";
                _innerHTML += "<h2>:</h2>";
                _innerHTML += "</div>";

                _innerHTML += "<div class='launchTimerItem'>";
                _innerHTML += "<h2 id='mins-" + _launchId + "'>00</h2>";
                _innerHTML += "<p>Mins</p>";
                _innerHTML += "</div>";

                _innerHTML += "<div class='launchTimerItem'>";
                _innerHTML += "<h2>:</h2>";
                _innerHTML += "</div>";

                _innerHTML += "<div class='launchTimerItem'>";
                _innerHTML += "<h2 id='secs-" + _launchId + "'>00</h2>";
                _innerHTML += "<p>Secs</p>";
                _innerHTML += "</div>";

                _innerHTML += "</div>";

                _innerHTML += "<div class='launchDate'>" + _launchDate + "</div>";

                _innerHTML += "</div>";
                _innerHTML += "</div>";
                _innerHTML += "</div>";
                _innerHTML += "</div>";

                homePageNewsLaunch.innerHTML += _innerHTML;

                _timersArgs.push([_launchDate, _launchId]);
            }
        });

        if (_timersArgs.length !== 0) {
            isUpcomingLaunches = true;
        }

        _timersArgs.forEach(function (args) {
            var _timer = _getTimer(args[0], args[1]);
            _timer.run();
        });
    }

    function _isLaunchSkipped(dateEntry) {
        var _dateEntryInMillis = new Date(dateEntry).getTime(); // millis
        var _currentDateInMillis = new Date().getTime();
        var _deltaDate = _dateEntryInMillis - _currentDateInMillis;
        if (_deltaDate < ONE_MIN_IN_MILLIS) return true;
        return false;
    }

    /**
     * return: DateTimer
     * @param {any} dataEntry 2020-12-28T16:42:07Z
     */
    function _getTimer(dateEntry, timerId) {
        var _dateEntryInMillis = new Date(dateEntry).getTime(); // millis
        var _currentDateInMillis = new Date().getTime();
        var _deltaDate = _dateEntryInMillis - _currentDateInMillis;
        
        var _dateTimer = new DateTimer();
        _dateTimer.init(_deltaDate, timerId);
        
        return _dateTimer;
    }
}

function DateTimer() {
    var _day = 0;
    var _hour = 0;
    var _min = 0;
    var _sec = 0;
    var _isStop = false;

    var _timerLaunchTime = null;
    var _timerDays = null;
    var _timerHours = null;
    var _timerMins = null;
    var _timerSecs = null;

    this.init = function (deltaDateInMillis, timerId) {
        _timerLaunchTime = document.getElementById("launchTime-" + timerId);
        _timerDays = document.getElementById("days-" + timerId);
        _timerHours = document.getElementById("hours-" + timerId);
        _timerMins = document.getElementById("mins-" + timerId);
        _timerSecs = document.getElementById("secs-" + timerId);

        if (deltaDateInMillis <= 0) {
            return;
            _isStop = true;
        }
        _day = Math.floor(deltaDateInMillis / ONE_DAY_IN_MILLIS);
        deltaDateInMillis -= _day * ONE_DAY_IN_MILLIS;
        if (deltaDateInMillis <= 0) return;

        _hour = Math.floor(deltaDateInMillis / ONE_HOUR_IN_MILLIS);
        deltaDateInMillis -= _hour * ONE_HOUR_IN_MILLIS;
        if (deltaDateInMillis <= 0) return;

        _min = Math.floor(deltaDateInMillis / ONE_MIN_IN_MILLIS);
        deltaDateInMillis -= _min * ONE_MIN_IN_MILLIS;
        if (deltaDateInMillis <= 0) return;

        _sec = Math.floor(deltaDateInMillis / ONE_SEC_IN_MILLIS);
    };

    this.run = function () {
        _click();
        setInterval(_click, 1000);
    };

    this.isStop = function () {
        return _isStop;
    };

    this.toString = function () {
        var _ss = "days=" + _day + " hour=" + _hour + " min=" + _min + " sec=" + _sec;
        return _ss;
    };

    // private 
    function _click() {
        if (_isStop === true) {
            _timerLaunchTime.innerText = "L-"
            return;
        }
        _timerDays.innerText = _day;
        _timerHours.innerText = _hour;
        _timerMins.innerText = _min;
        _timerSecs.innerText = _sec;
        if (_sec !== 0) {
            _sec--;
        } else if (_min !== 0) {
            _min--;
            _sec = 59;
        } else if (_hour !== 0) {
            _hour--;
            _min = 59;
            _sec = 59;
        } else if (_day !== 0) {
            _day--;
            _hour = 23;
            _min = 59;
            _sec = 59;
        } else {
            _isStop = true;
        }
    };
}