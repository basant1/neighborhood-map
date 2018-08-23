// All locations
var locations = [
    {title: "Googleplex", location: {lat: 37.4226231, lng: -122.0867726}},
    {title: "Facebook Headquarters", location: {lat: 37.4847937, lng: -122.1473936}},
    {title: "Computer History Museum", location: {lat: 37.4142744, lng: -122.077409}},
    {title: "Apple Park", location: {lat: 37.332563, lng: -122.010014}},
    {title: "eBay Headquarters", location: {lat: 37.295469, lng: -121.9276816}},
    {title: "The Tech Museum of Innovation", location: {lat: 37.3316101, lng: -121.8901343}},
    {title: "San Mateo County History Museum", location: {lat: 37.4869915, lng: -122.2296488}},
    {title: "Intel Museum", location: {lat: 37.3879132, lng: -121.9653869}},
    {title: "Netflix HQ", location: {lat: 37.2584978, lng: -121.9620632}},
    {title: "Adobe Headquarters", location: {lat: 37.3309258, lng: -121.8941081}},
    {title: "Nikola Tesla Statue", location: {lat: 37.4262968, lng: -122.141144}}
];

// Create a new blank array for all the tech place markers.
var markers = [];

// Initialize and add the map
function initMap() {
    // Create new map
    var map = new google.maps.Map(document.getElementById('map'), {
        center: {lat: 37.375334, lng: -122.073426},
        zoom: 11
    });

    // Create new infoWindow
    var infoWindow = new google.maps.InfoWindow();

    // Create new markers
    for (var i = 0; i < locations.length; i++) {
        (function() {
            // Create a marker per location, and put into markers array.
            var marker = new google.maps.Marker({
                map: map,
                title: locations[i].title,
                position: locations[i].location,
                animation: google.maps.Animation.DROP
            });

            // Push the marker to the array of markers.
            markers.push(marker);

            locations[i].marker = marker;

            // Create an onclick event to open the large infowindow at each marker.
            marker.addListener('click', function() {
                populateInfoWindow(this, infoWindow);
                infoWindow.setContent(contentString);
            });

            // Create onclick event for marker bounce animation.
            marker.addListener('click', toggleBounce);

            // Function to add bounce animation to markers.
            function toggleBounce() {
                if (marker.getAnimation() !== null) {
                    marker.setAnimation(null);
                }
                else {
                    marker.setAnimation(google.maps.Animation.BOUNCE);
                    setTimeout(function () {
                        marker.setAnimation(null);
                    }, 1000);
                }
            }

            // This function populates the infowindow when the marker is clicked. We'll only allow
            // one infowindow which will open at the marker that is clicked, and populate based
            // on that markers position.
            function populateInfoWindow(marker, infoWindow) {
                if (infoWindow.marker != marker) {
                    infoWindow.marker = marker;
                    infoWindow.setContent(marker.contentString);
                    infoWindow.open(map, marker);
                    
                    // Make sure the marker property is cleared if the infowindow is closed.
                    infoWindow.addListener('closeclick', function() {
                        infoWindow.setMarker = null;
                    });
                }
            }

            var contentString;

            // FourSquare API
            $.ajax({
                url: 'https://api.foursquare.com/v2/venues/search',
                dataType: 'json',
                data: {
                    client_id: 'YOUR_CLIENT_ID',
                    client_secret: 'YOUR_CLIENT_SECRET',
                    query: locations[i].title,
                    near: 'San Jose',
                    v: 20180810
                },
                success: function(data) {
                    var venue = data.response.venues;
                    contentString = '<div class="infowindow"><b>' +
                        venue[0].name + '</b><br>' +
                        venue[0].location.formattedAddress[0] + '<br>' +
                        venue[0].location.formattedAddress[1] + '<br>' +
                        '<a target="_blank" href="https://foursquare.com/v/' + venue[0].id + '">Click here to check it out</a>';
                    marker.contentString;
                },
                // Function to display error message if there's an error loading FourSquare.
                error: function() {
                    contentString = '<div>Error loading FourSquare. Please refresh the page and try again.</div>';
                }
            });
        })(i);
    }
}

// Constructor/Model
var TechPlace = function(data) {
    var self = this;

    this.title = data.title;
    this.location = data.location;
    this.show = ko.observable(true);
}

// ViewModel
var ViewModel = function() {
    var self = this;

    this.techPlaces = ko.observableArray();
    this.userInput = ko.observable('');

    for (var j = 0; j < locations.length; j++) {
        var techPlace = new TechPlace(locations[j]);
        self.techPlaces.push(techPlace);
    }

    // Search functionality
    this.search = ko.computed(function() {
        var input = self.userInput().toLowerCase();

        for (var k = 0; k < self.techPlaces().length; k++) {
            if (self.techPlaces()[k].title.toLowerCase().indexOf(input) >= 0) {
                self.techPlaces()[k].show(true);
                if (markers[k]) {
                    markers[k].setVisible(true);
                }
            } else {
                self.techPlaces()[k].show(false);
                if (markers[k]) {
                    markers[k].setVisible(false);
                }
            }
        }
    });

    // Trigger the appropriate marker according to the link clicked
    this.clickMarker = function(techPlace) {
        var index = locations.map(l => l.title).indexOf(techPlace.title);
        google.maps.event.trigger(locations[index].marker, 'click');
    }
}

// Function to display error message if there's an error loading Google Maps
function googleMapsError(){
    alert("Error loading Google Maps. Please refresh the page and try again.");
};

ko.applyBindings(ViewModel);
