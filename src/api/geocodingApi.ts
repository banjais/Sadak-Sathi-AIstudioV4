import L from 'leaflet';
import { haversineDistance } from '../utils/geometry';
import { nepalRegions } from './offlineMapApi';

export interface Place {
  id: string;
  nameKey: string;
  lat: number;
  lng: number;
  distance?: number;
  type?: 'place' | 'region';
  bounds?: [[number, number], [number, number]];
}

const mockPlaces: Place[] = [
  { id: '1', nameKey: 'place_name_mugling', lat: 27.8545, lng: 84.5580, type: 'place' },
  { id: '2', nameKey: 'place_name_thamel', lat: 27.7142, lng: 85.3120, type: 'place' },
  { id: '3', nameKey: 'place_name_pokhara_lakeside', lat: 28.2096, lng: 83.9599, type: 'place' },
  { id: '4', nameKey: 'place_name_sauraha', lat: 27.5804, lng: 84.5015, type: 'place' },
  { id: '5', nameKey: 'place_name_lumbini', lat: 27.4671, lng: 83.2745, type: 'place' },
  { id: '6', nameKey: 'place_name_nagarkot', lat: 27.7174, lng: 85.5212, type: 'place' },
  { id: '7', nameKey: 'place_name_thankot', lat: 27.6934, lng: 85.2119, type: 'place' },
  { id: '8', nameKey: 'place_name_butwal', lat: 27.7005, lng: 83.4542, type: 'place' },
];

// A simple function to get the English part of a region name key
const getEnglishRegionName = (nameKey: string) => {
    return nameKey.replace('province_', '').replace(/_/g, ' ');
};

export const searchPlaces = (
  query: string,
  bounds: L.LatLngBounds | null,
  userLocation: [number, number] | null
): Promise<Place[]> => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
       if (Math.random() < 0.1) {
          reject(new Error("Simulated network error: Could not fetch places."));
          return;
       }

      if (!query) {
        resolve([]);
        return;
      }

      const lowerCaseQuery = query.toLowerCase();
      
      // 1. Search for matching regions
      const regionResults: Place[] = nepalRegions
        .filter(region => 
            getEnglishRegionName(region.nameKey).includes(lowerCaseQuery) ||
            `province ${region.id.replace('province', '')}`.includes(lowerCaseQuery)
        )
        .map(region => {
            const centerLat = (region.bounds[0][0] + region.bounds[1][0]) / 2;
            const centerLng = (region.bounds[0][1] + region.bounds[1][1]) / 2;
            return {
                id: region.id,
                nameKey: region.nameKey,
                lat: centerLat,
                lng: centerLng,
                type: 'region',
                bounds: region.bounds,
            };
        });

      // 2. Filter places by the search query.
      const filteredPlaces = mockPlaces.filter(place => 
        place.nameKey.toLowerCase().replace(/_/g, ' ').includes(lowerCaseQuery)
      );

      // 3. Determine the context center for sorting.
      const sortCenter: [number, number] | null = userLocation 
        ? userLocation 
        : (bounds ? [bounds.getCenter().lat, bounds.getCenter().lng] : null);

      // 4. Add distance and sort if a center is available.
      let placeResults: Place[];
      if (sortCenter) {
          const resultsWithDistance = filteredPlaces.map(place => ({
              ...place,
              distance: haversineDistance(sortCenter, [place.lat, place.lng]),
          }));
          
          resultsWithDistance.sort((a, b) => a.distance - b.distance);
          placeResults = resultsWithDistance;
      } else {
          placeResults = filteredPlaces;
      }
      
      // 5. Combine results with regions first
      resolve([...regionResults, ...placeResults]);
      
    }, 200);
  });
};