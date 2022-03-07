// import React, { Component } from 'react';
// import { Loader } from '@googlemaps/js-api-loader';


// const loader = new Loader({
//     apiKey: "AIzaSyAT6YDEjOAOdk_AA4ak0JIgOQwMVGhjd5Q",
//     version: "weekly",
//     libraries: ["places"]
// });

// export default class DemoComponent extends Component {
//     constructor(props) {
//         super(props);
//         this.state = {};
//     }

//     componentDidMount() {
//         let self = this;
//         const defaultMapOptions = {
//             center: {
//                 lat: 34.0689,
//                 lng: -118.4452
//             },
//             zoom: 14
//         };
//         loader.load().then((google) => {
            
//             const map = new google.maps.Map(
//                 self.googleMapDiv,
//                 defaultMapOptions);
            
//             const directionsService = new google.maps.DirectionsService();
//             const directionsRenderer = new google.maps.DirectionsRenderer();
//             directionsRenderer.setMap(map);

//             // const onChangeHandler = function () {
//             //     calc_and_display_route(directionsService, directionsRenderer);
//             // };

//             // calc_and_display_route(directionsService, directionsRenderer);
//             directionsService
//                 .route({
//                     /* TODO: dynamically enter origin and destination place id's from
//                     * above POST. Could also ask browser for users location to use for
//                     * the origin.
//                     */
//                     origin: { placeId : "ChIJS8IpR0K7woARM4y49G_8mJA"} ,
//                     destination: { placeId: "ChIJy6BKexO8woARk-gxDNuctko"},
//                     travelMode: "TRANSIT"
//                 })
//                 .then((response) => {
//                     directionsRenderer.setDirections(response);
//                 })
//                 .catch((e) => window.alert("Directions request failed due to "));
       
//             /*
//                 store them in the state so you can use it later
//                 E.g. call a function on the map object:
//                     this.state.map.panTo(...)
//                 E.g. create a new marker:
//                     new this.state.google.maps.Marker(...)
//             */
//             this.setState({
//                 google: google,
//                 map: map
//             });
//         });
//     }

//     render() {
//         return (
//             <div
//                 ref={(ref) => { this.googleMapDiv = ref }}
//                 style={{ height: '100vh', width: '100%' }}>
//             </div>
//         )
//     }
// };


/*global google*/
import ReactDOM from "react-dom";
import React from "react";

import { GoogleMap, DirectionsRenderer } from "@react-google-maps/api";

const defaultLocation = { lat: 34.0689, lng: -118.4452 };
let destination = { lat: 41.756795, lng: -78.954298 };
let dest_id = "ChIJy6BKexO8woARk-gxDNuctko";
let org_id = "ChIJS8IpR0K7woARM4y49G_8mJA";
let origin = { lat: 40.756795, lng: -73.954298 };
let directionsService;


class Map extends React.Component {
  state = {
    directions: null,
    bounds: null
  };

  
  

  onMapLoad = map => {
    directionsService = new google.maps.DirectionsService();
    //load default origin and destination
    this.changeDirection(origin, destination);
  };

  //function that is calling the directions service
  changeDirection = (origin, destination) => {
    directionsService.route(
      {
        origin: { placeId :  org_id},
        destination: { placeId: dest_id},
        travelMode: google.maps.TravelMode.DRIVING
      },
      (result, status) => {
        if (status === google.maps.DirectionsStatus.OK) {
          //changing the state of directions to the result of direction service
          this.setState({
            directions: result
          });
        } else {
          console.error(`error fetching directions ${result}`);
        }
      }
    );
  };

  render() {
    return (
      <div>
        <GoogleMap
          center={defaultLocation}
          zoom={5}
          onLoad={map => this.onMapLoad(map)}
          mapContainerStyle={{ height: "400px", width: "800px" }}
        >
          {this.state.directions !== null && (
            <DirectionsRenderer directions={this.state.directions} />
          )}
        </GoogleMap>
      </div>
    );
  }
}

export default Map;