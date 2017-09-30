
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
  var destination= "";
  var time = "MM/DD/YYYY";
  var placeSearch, autocomplete;

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
          center: {lat: 37.720002, lng: -122.2775781 },
          zoom: 11
        });

        var trafficLayer = new google.maps.TrafficLayer();
        trafficLayer.setMap(map);

        new AutocompleteDirectionsHandler(map);
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
            originInput, {placeIdOnly: true});
        var destinationAutocomplete = new google.maps.places.Autocomplete(
            destinationInput, {placeIdOnly: true});

        this.setupClickListener('changemode-walking', 'WALKING');
        this.setupClickListener('changemode-transit', 'TRANSIT');
        this.setupClickListener('changemode-driving', 'DRIVING');

        this.setupPlaceChangedListener(originAutocomplete, 'ORIG'); // 
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
          origin: {'placeId': this.originPlaceId},
          destination: {'placeId': this.destinationPlaceId},
          travelMode: this.travelMode
        }, function(response, status) {
          if (status === 'OK') {
            me.directionsDisplay.setDirections(response);
          } else {
            window.alert('Directions request failed due to ' + status);
          }
        });
      };

/*

//ba0cc04ebdefc041241e9b4c64747f12 api key for weather
//http://samples.openweathermap.org/data/2.5/weather?q=London,uk&appid=ba0cc04ebdefc041241e9b4c64747f12
var weatherRespond =$("#destination-input").val()
console.log(weatherRespond)

$("#submit").on('click', function() {
    // put in a separate function path variables (loaction, timestamp)
    var location = $("#city").val()
    var epoch1 = $("#timestamp").val()
    var queryURL = "http://api.openweathermap.org/data/2.5/forecast?q=" + location + "&mode=json&appid=ba0cc04ebdefc041241e9b4c64747f12"
    $.ajax({
        url: queryURL,
        error: function(xhr, ajaxOptions, thrownError) {
            if (xhr.status == 404) {
                alert(thrownError);

            }
        }
    }).done(function(response) {
        //var epoch1 = 1506483783 // test timestamp logic variable
        var lengthForLoop = response.list.length
        if (epoch1 < response.list[0].dt) {
            queryURL = "http://api.openweathermap.org/data/2.5/weather?q=" + location + "&mode=json&appid=ba0cc04ebdefc041241e9b4c64747f12"
            $.ajax({
                url: queryURL,
                error: function(xhr, ajaxOptions, thrownError) {
                    if (xhr.status == 404) {
                        alert(thrownError);
                    }
                }
            }).done(function(response) {
                var kelvinTemp = response.main.temp
                var convertedTemp = convertKelvinToFahrenheit(kelvinTemp)
                response = {
                    temp: convertedTemp,
                    pressure: response.main.pressure,
                    humidity: response.main.humidity,
                    description: response.weather[0].description,
                    icon:response.weather[0].icon
                }
                console.log(response)
                return response
            })
        } else {
            for (var i = 0; i < lengthForLoop; i++) {
                if (epoch1 > response.list[i].dt && epoch1 < response.list[i + 1].dt) {
                    var kelvinTemp = response.list[i].main.temp
                    var convertedTemp = convertKelvinToFahrenheit(kelvinTemp)
                    //http://openweathermap.org/img/w/01n.png
                    response = {
                        temp: convertedTemp,
                        pressure: response.list[i].main.pressure,
                        humidity: response.list[i].main.humidity,
                        description: response.list[i].weather[0].description,
                        icon : response.list[i].weather[0].icon,
                        time : response.list[i].dt_txt
                    }
                    console.log(response)
                    return response
                    break
                }
            }
        }
    })
})

function weatherAPI(location, epoch1) {
    //var location = $("#city").val()
    var queryURL = "http://api.openweathermap.org/data/2.5/forecast?q=" + location + "&mode=json&appid=83c792dc1352781699e5826c9c270917"
    $.ajax({
        url: queryURL,
        error: function(xhr, ajaxOptions, thrownError) {
                    if (xhr.status == 404) {
                        alert(thrownError);
                    }
                }
    }).done(function(response) {
        var epoch = moment().unix(); // convert timestamp to epoch format
        //var epoch1 = 1506504944 // test timestamp logic variable
        var lengthForLoop = response.list.length
        if (epoch1 < response.list[0].dt) {
            queryURL = "http://api.openweathermap.org/data/2.5/weather?q=" + location + "&mode=json&appid=83c792dc1352781699e5826c9c270917"
            $.ajax({
                url: queryURL,
                error: function(xhr, ajaxOptions, thrownError) {
                    if (xhr.status == 404) {
                        alert(thrownError);
                    }
                }
            }).done(function(response) {

                var kelvinTemp = response.main.temp
                var convertedTemp = convertKelvinToFahrenheit(kelvinTemp)
                response = {
                    temp: convertedTemp,
                    pressure: response.main.pressure,
                    humidity: response.main.humidity,
                    description: response.weather[0].description,
                    icon:  response.weather[0].icon
                }
                console.log(response)
            })
        } else {
            for (var i = 0; i < lengthForLoop; i++) {
                if (epoch1 > response.list[i].dt && epoch1 < response.list[i + 1].dt) {
                    var kelvinTemp = response.list[i].main.temp
                    var convertedTemp = convertKelvinToFahrenheit(kelvinTemp)
                    response = {
                        temp: convertedTemp,
                        pressure: response.list[i].main.pressure,
                        humidity: response.list[i].main.humidity,
                        description: response.list[i].weather[0].description,
                        icon : response.list[i].weather[0].icon
                    }
                    console.log(response)
                    break
                }
            }
        }
    })
}
function convertKelvinToFahrenheit(kelvin) {
    var fahrenheit = ((kelvin - 273.15) * 1.8) + 32
    return fahrenheit
}
*/
