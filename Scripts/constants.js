// print some data to console if DEBUG === true
var DEBUG = true;

//[DEFAULT_VALUE] may be FALSE
var DISABLE_WEATHER = false;

var ONE_SEC_IN_MILLIS = 1000      // milliseconds in one sec
var ONE_MIN_IN_MILLIS = 60000;    // milliseconds in one min
var ONE_HOUR_IN_MILLIS = 3600000; // milliseconds in one hour
var ONE_DAY_IN_MILLIS = 86400000; // milliseconds in one day



// === [DEFAULT_VALUE] ===

// Cookies name
//[DEFAULT_VALUE]
var COOKIE_OBSERVER_NAME = "OL"; // <Observer Location>

// Cookies expires time
//[CORRECTION_VALUE]
var EXPIRES_TIME = ONE_DAY_IN_MILLIS * 1; // in milliseconds
// == END OF DEFINE COOKIES CONSTANTS ==

// Max distance for detect nearest statellites
//[DEFAULT_VALUE]
var DEFAULT_CLOSEST_DISTANCE = 200; // Kilometers;

// How many satellites do you need to find
//[DEFAULT_VALUE]
var MAX_FIND_SATELLITE_COUNT = 10;

// Prefix for satelliteListItem
//[DEFAULT_VALUE]
var DEFAULT_SATELLITE_LIST_ITEM_PREFIX = "__satelliteListItem";



// === [CORRECTION_VALUE] || [DEFAULT_VALUE] ===

// Change lenth of satellite path
//[DEFAULT_VALUE]
var DEFAULT_SATELLITE_PATD_DURATION = 90; // Minutes; can now be used like [CORRECTION_VALUE]



// === [CORRECTION_VALUE] ===

// how many upcoming launches will be shown (5 best; better not to change!)
//[CORRECTION_VALUE]
var MAX_UPCOMING_LAUNCHES = 10;


// satellite icon name (range: 1 - 6)
//[CORRECTION_VALUE]
var SATELLITE_ICON_NAME = "/Content/Images/Icons/satelliteIcon3.png"


// space station icon name (range 1 - 2) 
//[CORRECTION_VALUE]
var SPACE_STATION_ICON_NAME = "/Content/Images/Icons/spaceStation1.png"


// The maximum distance between the city and the geo-position to determine if the observer is within the city
//[CORRECTION_VALUE]
var MAX_CLOSEST_DISTANCE = 40; // kilometers;



// == DEFINE LIVE MAP CONSTANTS ==

// Distance for detect nearest statellites
//[CORRECTION_VALUE]
LIVE_MAP_NEAREST_DISATANCE = 20000; // kilometers


// true or false
//[CORRECTION_VALUE]
LIVE_MAP_SELECT_ONLY_POPULAR_SATELITES = true; 


// range [1 .. MAX_FIND_SATELLITE_COUNT]
//[CORRECTION_VALUE]
LIVE_MAP_SHOW_SATELLITE_COUNT = 5;

// == END OF DEFINE LIVE MAP CONSTANTS ==