import React, { Component, useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { render } from "react-dom";
import { LoadScript } from "@react-google-maps/api";

// material-ui
import { Grid } from '@material-ui/core';

// project imports
import TotalCards from './TotalCards';
import SearchResultsCard from './SearchResults';
import BarListCard from './BarListCard';
import TotalOrderLineChartCard from './TotalOrderLineChartCard';
import TotalIncomeDarkCard from './TotalIncomeDarkCard';
import TotalIncomeLightCard from './TotalIncomeLightCard';
import Map from './Map'
import "./mapstyles.css";

import MemberCard from './MemberCard';

import { gridSpacing } from './../../../store/constant';

const lib = ["places"];
const key = "AIzaSyAT6YDEjOAOdk_AA4ak0JIgOQwMVGhjd5Q"; // PUT GMAP API KEY HERE
// class App extends React.Component {
//   render() {
//     return (
//       <LoadScript googleMapsApiKey={key} libraries={lib}>
//         <Map />
//       </LoadScript>
//     );
//   }
// }

// const apiOptions = {
//     apiKey: "AIzaSyDsWOZvjYPAUqOWzYOcRM8FQEsTeUln3f8"
// }

// const loader = new Loader(apiOptions);

// loader.load().then(() => {
//     console.log('Maps JS API loaded');
//     const map = displayMap();
// });

//-----------------------|| DEFAULT DASHBOARD ||-----------------------//

// function calc_and_display_route(directionsService, directionsRenderer) {
//     /* TODO: Call post request for next location here. We specifically want
//      * place_id's for the currrent bar (origin) and next bar (destination).
//      * Alternatively, the user's current location could be pulled from the 
//      * browser.
//      */

//     directionsService
//         .route({
//             /* TODO: dynamically enter origin and destination place id's from
//              * above POST. Could also ask browser for users location to use for
//              * the origin.
//              */
//             origin: { placeId : "ChIJS8IpR0K7woARM4y49G_8mJA"} ,
//             destination: { placeId: "ChIJy6BKexO8woARk-gxDNuctko"},
//             travelMode: "TRANSIT"
//         })
//         .then((response) => {
//             directionsRenderer.setDirections(response);
//         })
//         .catch((e) => window.alert("Directions request failed due to " + status));
// }

const Dashboard = () => {
    const [isLoading, setLoading] = useState(true);
    const account = useSelector((state) => state.account);
    const shouldRender = (account && account.final_schedule && account.final_schedule.length !==0)? !isLoading: 0 
    useEffect(() => {
        setLoading(false);
    }, []);



    

    // // TODO: do these go here?
    // const directionsService = new google.maps.DirectionsService();
    // const directionsRenderer = new google.maps.DirectionsRenderer();
    // const mapOptions = {
    // // TODO: change the point it's centered at to curr location
    // // lat: -33.860664, lng: 151.208138  Sydney
    // // lat: 34.0689, lng: -118.4452  UCLA
    // center: { lat: 34.0689, lng: -118.4452 },
    // zoom: 14
    // };
    // // References the div with id='map' in index.html
    // const mapDiv = document.getElementById('map');    
    // const map = new google.maps.Map(mapDiv, mapOptions);

    // // Render the directions on the map
    // directionsRenderer.setMap(map);
    // const onChangeHandler = function () {
    //     calc_and_display_route(directionsService, directionsRenderer);
    // };




    if(shouldRender){
        return (
            <Grid container direction="column" spacing={gridSpacing}>
                <Grid item xs={12}>
                <LoadScript googleMapsApiKey={key} libraries={lib}>
                    <Map />
                </LoadScript>
                </Grid>
                <Grid item xs={12}>
                    <Grid container spacing={gridSpacing}>
                        <Grid item lg={12} md={12} sm={12} xs={12}>
                            <TotalCards isLoading={isLoading} />
                        </Grid>
                    </Grid>
                </Grid>
                <Grid item xs={12}>
                    <Grid container direction="row" spacing={gridSpacing}>
                        <Grid item xs={12} md={6}>
                            <BarListCard isLoading={isLoading} />
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <MemberCard isLoading={isLoading} />
                        </Grid>
                    </Grid>
                </Grid>
            </Grid>
        );
    }

    if(!(account && account.search_results && account.search_results.length!== 0)){
        return (
            <Grid container direction="column" spacing={gridSpacing}>
                <Grid item xs={12}>
                    <Grid container spacing={gridSpacing}>
                        <Grid item lg={12} md={12} sm={12} xs={12}>
                            <TotalCards isLoading={isLoading} />
                        </Grid>
                    </Grid>
                </Grid>
                <Grid item xs={12}>
                    <Grid container direction="row" spacing={gridSpacing}>
                        <Grid item xs={12} md={6}>
                            <BarListCard isLoading={isLoading} />
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <MemberCard isLoading={isLoading} />
                        </Grid>
                    </Grid>
                </Grid>
            </Grid>
        );
    }
    return (
        <Grid container justifyContent="flex-end" direction="row" spacing={gridSpacing}>
            <Grid item xs={12} lg={4}>
                <Grid container>
                    <Grid item xs={12}>
                        <SearchResultsCard isLoading={isLoading} />
                    </Grid>
                </Grid>
            </Grid>
            <Grid item xs={12} lg={8}>
                <Grid container direction="column" spacing={gridSpacing}>
                    <Grid item xs={6}>
                        <Grid container spacing={gridSpacing}>
                            <Grid item lg={12} md={12} sm={12} xs={12}>
                                <TotalCards isLoading={isLoading} />
                            </Grid>
                        </Grid>
                    </Grid>
                    <Grid item xs={6}>
                        <Grid container direction="row" spacing={gridSpacing}>
                            <Grid item xs={12} md={6}>
                                <BarListCard isLoading={isLoading} />
                            </Grid>
                            <Grid item xs={12} md={6}>
                                <MemberCard isLoading={isLoading} />
                            </Grid>
                        </Grid>
                    </Grid>
                </Grid>
            </Grid>
        </Grid>
    );
};

export default Dashboard;
