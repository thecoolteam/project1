
  //   var config = {
  //   apiKey: "AIzaSyB-gK7ArVYsICoeXOgvMBd0YYiZLx8HAZM",
  //   authDomain: "albertyufirebaseproject.firebaseapp.com",
  //   databaseURL: "https://albertyufirebaseproject.firebaseio.com",
  //   projectId: "albertyufirebaseproject",
  //   storageBucket: "albertyufirebaseproject.appspot.com",
  //   messagingSenderId: "931160770870"
  // };

  // firebase.initializeApp(config);

  // var database = firebase.database();

  // var start = "";
  // var destination= "";
  // var time = "MM/DD/YYYY";
  // var placeSearch, autocomplete;

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

            var city = place.name;
            var requiredSyntax = city.replace(/ /g,"_");
            var s;
            s = requiredSyntax.substring(0, requiredSyntax.indexOf(','));
 
            console.log(city)
            console.log(s)

            var queryURL = "http://api.wunderground.com/api/badbf91cbcaea172/hourly/q/CA/" + s + ".json"
          
            console.log(queryURL)

            $.ajax({
              url: queryURL,
              method: "GET",

            }).done(function(response) {
            
            console.log(response);
            var iconNew = response.hourly_forecast[0].condition;
            console.log(iconNew)
            var flickrKey = "4d8736c73994381c33fc11bd56da1d47"
            var queryURL = "https://api.flickr.com/services/rest/?method=flickr.photos.search&api_key=" + flickrKey + "&format=json&nojsoncallback=1&text=cats&extras=" + iconNew
            console.log(queryURL)

            $.ajax({
              url: queryURL,
              method: "GET",

            }).done(function(response) {

            // $("#infoBox").empty();
            var results = response.photos;
            console.log(response);
            var weatherPhoto = results.photo[1];
            console.log(weatherPhoto);
            var weatherImg = $("<img>");
            //var testPic = "https://sc.mogicons.com/share/sunny-emoticon-245.jpg"
            weatherImg.attr("src", weatherPhoto);
            weatherImg.attr("class", "gif");
            $("#infoBox").html(weatherImg);

          });
          });
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

