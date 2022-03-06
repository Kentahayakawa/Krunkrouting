import googlemaps
from datetime import datetime
from typing import Tuple
import requests, json

_gmaps = googlemaps.Client(key='AIzaSyCzqpKMC_ZF2DsuooSnEdMOTFYBjyeFCOw')

def get_places(coordinates, radius, min_price, max_price, min_rating):
    """
    Returns places within `radius` of the specified `coordinates`.

    https://github.com/googlemaps/google-maps-services-python/blob/master/googlemaps/places.py
    """
    results = _gmaps.places(
        query='bar',
        location=coordinates, # Latitude / Longitude pair
        radius=radius, # Distance in meters
        language='en',
        min_price=min_price,
        max_price=max_price,
        open_now=True,
        type='bar'
    )

    print(f'Found {len(results)} bars near {coordinates}')

    bars = []
    for result in results['results']:
        bar = {}
        bar['id'] = result['place_id']
        bar['name'] = result['name']
        bar['address'] = result['formatted_address']
        bar['lat'] = result['geometry']['location']['lat']
        bar['lng'] = result['geometry']['location']['lng']
        bar['price_level'] = result['price_level']

        if result['rating'] >= min_rating:
            bar['rating'] = result['rating']
        else:
            continue
        bars.append(bar)

    return bars

def to_coordinates(address):
    """
    Returns a `(float, float)` tuple based on a `str` input such as "UCLA".
    """
    result = _gmaps.geocode(address)[0]['geometry']['location']
    return (result['lat'], result['lng'])


def optimal_travel_order(bars): #take output of get_places() as input
    trip_list = []

    #using placeIDs is perferred over lat/long coordinates (from distance matrix overview)
    id_list = []
    for bar in bars:
        list.append(bar['id'])

    origin = '|'.join(map(str, id_list))
    destination = origin

    api_key = 'AIzaSyCzqpKMC_ZF2DsuooSnEdMOTFYBjyeFCOw'
    url=f"https://maps.googleapis.com/maps/api/distancematrix/json?origins={origin}&destinations={destination}&mode=car&key={api_key}"
    
    json_reply = requests.get(url).json()

    







