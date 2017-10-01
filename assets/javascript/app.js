var config = {
    apiKey: "AIzaSyB-gK7ArVYsICoeXOgvMBd0YYiZLx8HAZM",
    authDomain: "albertyufirebaseproject.firebaseapp.com",
    databaseURL: "https://albertyufirebaseproject.firebaseio.com",
    projectId: "albertyufirebaseproject",
    storageBucket: "albertyufirebaseproject.appspot.com",
    messagingSenderId: "931160770870"
};

firebase.initializeApp(config);

var database = firebase.database();

var start = "";
var destination = "";
var time = "MM/DD/YYYY";
var placeSearch, autocomplete;
var duration;
var endLat;
var endLng;
var startLng;
var startLat;




$("#destinationButton").on("click", function() {
    event.preventDefault();
    alert("hi")
    start = $("#startInput").val().trim()
    destination = $("#destinationInput").val().trim()
    time = $("#timeInput").val().trim()
    console.log(start)
    console.log(destination)
    console.log(time)

    database.ref().set({
        UserStart: start,
        UserDestination: destination,
        UserTime: time
    });
});


// This example requires the Places library. Include the libraries=places
// parameter when you first load the API. For example:
// <script src="https://maps.googleapis.com/maps/api/js?key=YOUR_API_KEY&libraries=places">

function initMap() {
    var map = new google.maps.Map(document.getElementById('map'), {
        mapTypeControl: false,
        center: { lat: -33.8688, lng: 151.2195 },
        zoom: 13
    });

    new AutocompleteDirectionsHandler(map);
    service = new google.maps.DistanceMatrixService()
}

/**
 * @constructor
 */
function AutocompleteDirectionsHandler(map) {
    this.map = map;
    this.originPlaceId = null;
    this.destinationPlaceId = null;
    this.travelMode = 'WALKING';
    var originInput = document.getElementById('origin-input');
    var destinationInput = document.getElementById('destination-input');
    var modeSelector = document.getElementById('mode-selector');
    this.directionsService = new google.maps.DirectionsService;
    this.directionsDisplay = new google.maps.DirectionsRenderer;
    this.directionsDisplay.setMap(map);

    var originAutocomplete = new google.maps.places.Autocomplete(
        originInput, { placeIdOnly: true });
    var destinationAutocomplete = new google.maps.places.Autocomplete(
        destinationInput, { placeIdOnly: true });

    this.setupClickListener('changemode-walking', 'WALKING');
    this.setupClickListener('changemode-transit', 'TRANSIT');
    this.setupClickListener('changemode-driving', 'DRIVING');

    this.setupPlaceChangedListener(originAutocomplete, 'ORIG');
    this.setupPlaceChangedListener(destinationAutocomplete, 'DEST');

    this.map.controls[google.maps.ControlPosition.TOP_LEFT].push(originInput);
    this.map.controls[google.maps.ControlPosition.TOP_LEFT].push(destinationInput);
    this.map.controls[google.maps.ControlPosition.TOP_LEFT].push(modeSelector);


}

// Sets a listener on a radio button to change the filter type on Places
// Autocomplete.
AutocompleteDirectionsHandler.prototype.setupClickListener = function(id, mode) {
    var radioButton = document.getElementById(id);
    var me = this;
    radioButton.addEventListener('click', function() {
        me.travelMode = mode;
        me.route();
    });
};

AutocompleteDirectionsHandler.prototype.setupPlaceChangedListener = function(autocomplete, mode) {
    var me = this;
    autocomplete.bindTo('bounds', this.map);
    autocomplete.addListener('place_changed', function() {
        var place = autocomplete.getPlace();

        if (!place.place_id) {
            window.alert("Please select an option from the dropdown list.");
            return;
        }
        if (mode === 'ORIG') {
            me.originPlaceId = place.place_id;
        } else {
            me.destinationPlaceId = place.place_id;
        }
        me.route();
    });

};

AutocompleteDirectionsHandler.prototype.route = function() {
    if (!this.originPlaceId || !this.destinationPlaceId) {
        return;
    }
    var me = this;
    this.directionsService.route({
        origin: { 'placeId': this.originPlaceId },
        destination: { 'placeId': this.destinationPlaceId },
        travelMode: this.travelMode

    }, function(response, status) {
        if (status === 'OK') {

            duration = response.routes['0'].legs['0'].duration.value

            startLat = response.routes['0'].legs['0'].start_location.lat()
            startLng = response.routes['0'].legs['0'].start_location.lng()

            endLat = response.routes['0'].legs['0'].end_location.lat()
            endLng = response.routes['0'].legs['0'].end_location.lng()

            getTimeZoneTime(startLat, startLng, endLat, endLng)

            me.directionsDisplay.setDirections(response);
        } else {
            window.alert('Directions request failed due to ' + status);
        }
    });
};

var positionArray = []
var timeZones = [];

function getTimeZoneTime(slat, slng, elat, elng) {
	var compareArray = [slat, slng, elat, elng]
	var queryURLs = ["http://api.timezonedb.com/v2/get-time-zone?key=WE21E5J1HORM&format=json&by=position&lat=" + slat + "&lng=" + slng + "", "http://api.timezonedb.com/v2/get-time-zone?key=WE21E5J1HORM&format=json&by=position&lat=" + elat + "&lng=" + elng + ""]
	debugger
    if (positionArray.length === 0 || positionArray === compareArray ) {
    	
    	positionArray = [slat, slng, elat, elng]
        for (var i = 0; i < queryURLs.length; i++) {
            $.ajax({
                url: queryURLs[i]
            }).done(function(response) {
                //console.log(response.zoneName)
                var zoneName = response.zoneName
                timeZones.push(zoneName)
                if (timeZones.length === 2) {
                    timeAtDestination(duration, timeZones[0], timeZones[1])
                }
            })
        }
    }
    else if (slat === positionArray[0] && slng === positionArray[1]){
    	positionArray[2] = elat
    	positionArray[3] = elng
    	$.ajax({
    		url: queryURLs[1]
    	}).done(function(response){
    		var zoneName = response.zoneName
    		timeZones[1] = zoneName
    		timeAtDestination(duration, timeZones[0], timeZones[1])  
    	})
    }
    else if (elat === positionArray[2] && elat === positionArray[3]){
    	positionArray[0] = slat
    	positionArray[1] = slng
    	$.ajax({
    		url: queryURLs[0]
    	}).done(function(response){
    		var zoneName = response.zoneName
    		timeZones[0] = zoneName
    		timeAtDestination(duration, timeZones[0], timeZones[1])  
    	})
    }	
}

//1506827140693


function timeAtDestination(duration, currentZone, destinationZone) {

    //convert to int
    convDuration = parseInt(duration) * 1000;
    //get current time epoch
    var currentTimeX = moment().format('x');
    var currentTimeS = moment().format('YYYY-MM-DD hh:MM')
    ///console.log(currentTimeS, currentZone)
    //convert to int current time
    convCurrentTime = parseInt(currentTimeX);
    //time at destination
    var destinationTime = convCurrentTime + convDuration;
    destinationTime = moment(destinationTime).format('YYYY-MM-DD hh:MM')
    //store current time and timeZone

    var currentTime = moment.tz(destinationTime, currentZone)
    console.log(destinationZone +"  " +currentTime.tz(destinationZone).format())
}






/*timeZone API 
http://api.timezonedb.com/v2/get-time-zone?key=WE21E5J1HORM&format=json&by=position&lat=40.712916&lng=-74.00582930000002


https://timezonedb.com/ajax.get-time-zone?coordinate=test%2Ctest

Username : coolteam
API Key  : WE21E5J1HORM

For more information of how to use our API, please refer to:
http://timezonedb.com/api*/