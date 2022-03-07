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

