import googlemaps
from datetime import datetime
from typing import Tuple

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
        open_now=False,
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
        bar['user_ratings_total'] = result['user_ratings_total']

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