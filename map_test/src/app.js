import { Loader } from '@googlemaps/js-api-loader';

/* If we want to hide our api keys, we need to pass them in as environment 
 * variables to the front end every time we set it up (or so I heard).
 */
const apiOptions = {
    apiKey: "AIzaSyDsWOZvjYPAUqOWzYOcRM8FQEsTeUln3f8"
}

const loader = new Loader(apiOptions);

loader.load().then(() => {
    console.log('Maps JS API loaded');
    const map = displayMap();
    //const markers = addMarkers(map); // adds pins for locations
    //addPanToMarker(map, markers);
});

function displayMap() {
    // TODO: do these go here?
    const directionsService = new google.maps.DirectionsService();
    const directionsRenderer = new google.maps.DirectionsRenderer();
    const mapOptions = {
    // TODO: change the point it's centered at to curr location
    // lat: -33.860664, lng: 151.208138  Sydney
    // lat: 34.0689, lng: -118.4452  UCLA
    center: { lat: 34.0689, lng: -118.4452 },
    zoom: 14
    };
    // References the div with id='map' in index.html
    const mapDiv = document.getElementById('map');    
    const map = new google.maps.Map(mapDiv, mapOptions);

    // Render the directions on the map
    directionsRenderer.setMap(map);

    // Called by event listner to update directions on map
    const onChangeHandler = function () {
        calc_and_display_route(directionsService, directionsRenderer);
    };

    document.getElementById("button_next_bar").addEventListener("click", onChangeHandler);
}

// TODO: dynamically insert place id.
function calc_and_display_route(directionsService, directionsRenderer) {
    /* TODO: Call post request for next location here. We specifically want
     * place_id's for the currrent bar (origin) and next bar (destination).
     * Alternatively, the user's current location could be pulled from the 
     * browser.
     */

    directionsService
        .route({
            /* TODO: dynamically enter origin and destination place id's from
             * above POST. Could also ask browser for users location to use for
             * the origin.
             */
            origin: { placeId : "ChIJS8IpR0K7woARM4y49G_8mJA"} ,
            destination: { placeId: "ChIJy6BKexO8woARk-gxDNuctko"},
            travelMode: "TRANSIT"
        })
        .then((response) => {
            directionsRenderer.setDirections(response);
        })
        .catch((e) => window.alert("Directions request failed due to " + status));
}

/* Used to create marker objects that will be added to the map in the load 
* callback function
*/
function addMarkers(map) {
    const locations = {
        operaHouse: { lat: -33.8567844, lng: 151.213108 },
        tarongaZoo: { lat: -33.8472767, lng: 151.2188164 },
        manlyBeach: { lat: -33.8209738, lng: 151.2563253 },
        hyderPark: { lat: -33.8690081, lng: 151.2052393 },
        theRocks: { lat: -33.8587568, lng: 151.2058246 },
        circularQuay: { lat: -33.858761, lng: 151.2055688 },
        harbourBridge: { lat: -33.852228, lng: 151.2038374 },
        kingsCross: { lat: -33.8737375, lng: 151.222569 },
        botanicGardens: { lat: -33.864167, lng: 151.216387 },
        museumOfSydney: { lat: -33.8636005, lng: 151.2092542 },
        maritimeMuseum: { lat: -33.869395, lng: 151.198648 },
        kingStreetWharf: { lat: -33.8665445, lng: 151.1989808 },
        aquarium: { lat: -33.869627, lng: 151.202146 },
        darlingHarbour: { lat: -33.87488, lng: 151.1987113 },
        barangaroo: { lat: - 33.8605523, lng: 151.1972205 }
    }
    const markers = [];
    for (const location in locations) {
        const markerOptions = {
            map: map,
            position: locations[location],
            icon: './img/custom_pin.png'
        }
        const marker = new google.maps.Marker(markerOptions);
        markers.push(marker);
    }
    return markers;
}

// This function re-centers the map over the provided 
function addPanToMarker(map, markers) {
    markers.map(marker => {
        marker.addListener('click', event => {
            const location = { lat: event.latLng.lat(), lng: event.latLng.lng() };
            map.panTo(location);
        });
    });
    return markers;
}