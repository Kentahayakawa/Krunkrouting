import googlemaps
from datetime import datetime
from typing import Tuple
import requests, json
import pandas as pd

# kenta key AIzaSyDTFzL6u9x1X2sI972pY__SA4x_tOPXXLw
# seiji key AIzaSyCzqpKMC_ZF2DsuooSnEdMOTFYBjyeFCOw
# please use the seiji key because kenta's key doesn't have all the APIs authorized
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


#takes output of get_places() as input, lists bars to hit up in order (finds optimized
#path using distance matrix)
def optimal_travel_order(bars):

    id_list = []
    for bar in bars:
        id_list.append('place_id:' + bar.place_id)
        print(bar.place_id)


    origin_ids = '|'.join(map(str, id_list))
    destination_ids = origin_ids

    api_key = 'AIzaSyCzqpKMC_ZF2DsuooSnEdMOTFYBjyeFCOw'
    url=f"https://maps.googleapis.com/maps/api/distancematrix/json?origins={origin_ids}&destinations={destination_ids}&mode=transit&units=imperial&key={api_key}"
    
    json_reply = requests.get(url).json()


    origins = json_reply['origin_addresses']
    destinations = json_reply['destination_addresses']

    distance_matrix = {}
    for i, origin in enumerate(origins):
        distances_list = []
        for element in json_reply['rows'][i]['elements']:
            if element['status'] == 'ZERO_RESULTS':
                distances_list.append(0)
                continue
            
            distance = element['distance']['text']
            if 'mi' in distance:
                distance = distance.replace(",", "").replace('mi', '').strip()
                distances_list.append(float(distance))
            elif 'ft' in distance:
                distance = distance.replace(",", "").replace('ft', '').strip()
                distances_list.append(float(distance)/5280)
        distance_matrix[origin] = distances_list

    df = pd.DataFrame(distance_matrix, index=destinations)
    df.index.name = 'destinations'

    travelled = []
    travelled.append(destinations[0])
    hopping_index = 0
    next_stop = destinations[0]
    next_hop = 0
    ctr = 0

    while(ctr < len(origins)-1):
        min = 10000.0
        for place in range(0, len(destinations)):
            if df.iloc[hopping_index][place] < min and hopping_index != place and destinations[place] not in travelled:
                min = df.iloc[hopping_index][place]
                next_stop = destinations[place]
                next_hop = place
        hopping_index = next_hop
        travelled.append(next_stop)
        ctr += 1

    return travelled 
