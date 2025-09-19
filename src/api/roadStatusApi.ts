import L from 'leaflet';

/**
 * This file now simulates fetching data from the Waze Traffic API.
 * This is a mock implementation as there is no public client-side Waze API.
 */

interface RoadIncident {
  id: number | string;
  type: "Blocked" | "One-Lane" | "Traffic Jam" | "Road Hazard" | "Vehicle Breakdown" | "Other";
  titleKey: string;
  descriptionKey: string;
  lat: number;
  lng: number;
}

// Mock data simulating a response from a Waze-like API
const mockWazeAlerts = [
  {
    uuid: 'waze-1',
    type: 'ROAD_CLOSED',
    subtype: 'HAZARD_ROAD_CLOSED_CONSTRUCTION',
    location: { y: 27.7172, x: 85.3240 }, // Kathmandu
    reportDescription: 'waze_desc_construction',
  },
  {
    uuid: 'waze-2',
    type: 'JAM',
    subtype: 'JAM_HEAVY_TRAFFIC',
    location: { y: 27.7007, x: 85.3001 }, // Kalimati
    reportDescription: 'waze_desc_heavy_traffic',
  },
  {
    uuid: 'waze-3',
    type: 'HAZARD',
    subtype: 'HAZARD_ON_ROAD_POT_HOLE',
    location: { y: 27.7345, x: 85.3129 }, // Near Teaching Hospital
    reportDescription: 'waze_desc_pothole',
  },
  {
    uuid: 'waze-4',
    type: 'POLICE',
    subtype: 'POLICE_VISIBLE',
    location: { y: 27.6938, x: 85.2774 }, // Kalanki
    reportDescription: 'waze_desc_police',
  },
  {
    uuid: 'waze-5',
    type: 'ACCIDENT',
    subtype: 'ACCIDENT_MINOR',
    location: { y: 27.6800, x: 85.4500 }, // Bhaktapur area
    reportDescription: 'waze_desc_minor_accident',
  }
];

// Maps Waze alert types to our internal app types.
const mapWazeTypeToAppType = (type: string, subtype: string): RoadIncident['type'] => {
    switch (type) {
        case 'ROAD_CLOSED':
            return 'Blocked';
        case 'JAM':
            return 'Traffic Jam';
        case 'ACCIDENT':
            return 'Road Hazard'; // Mapping general accident to hazard
        case 'HAZARD':
             if (subtype.includes('CONSTRUCTION')) return 'One-Lane';
             return 'Road Hazard';
        case 'POLICE':
            return 'Other'; // No specific police type, using 'Other'
        default:
            return 'Other';
    }
};

// Maps Waze alert types/subtypes to descriptive title keys for our app.
const mapWazeTypeToTitleKey = (type: string, subtype: string): string => {
    if (type === 'POLICE') return 'waze_title_police';
    if (type === 'ACCIDENT') return 'waze_title_accident';
    if (type === 'JAM') return 'waze_title_jam';
    if (subtype.includes('POT_HOLE')) return 'waze_title_pothole';
    if (subtype.includes('CONSTRUCTION')) return 'waze_title_construction';
    if (type === 'ROAD_CLOSED') return 'waze_title_road_closed';
    return 'waze_title_other';
};

export const fetchRoadIncidents = async (bounds: L.LatLngBounds): Promise<RoadIncident[]> => {
    // Simulate network delay
    return new Promise((resolve) => {
        setTimeout(() => {
            const visibleAlerts = mockWazeAlerts
                .filter(alert => {
                    const { y, x } = alert.location;
                    return bounds.contains([y, x]);
                })
                .map((alert): RoadIncident => ({
                    id: alert.uuid,
                    type: mapWazeTypeToAppType(alert.type, alert.subtype),
                    titleKey: mapWazeTypeToTitleKey(alert.type, alert.subtype),
                    descriptionKey: alert.reportDescription,
                    lat: alert.location.y,
                    lng: alert.location.x,
                }));
            
            resolve(visibleAlerts);
        }, 500); // Short delay for mock API
    });
};


// The mock fetchPointsOfInterest can remain as there was no request to replace it.
interface PointOfInterest {
  id: number;
  type: "Fuel" | "Hospital" | "Hotel" | "Services";
  nameKey: string;
  lat: number;
  lng: number;
}

const mockPointsOfInterest: PointOfInterest[] = [
  { "id": 101, "type": "Fuel", "nameKey": "poi_name_sajha_petrol", "lat": 27.7088, "lng": 85.3134 },
  { "id": 102, "type": "Hospital", "nameKey": "poi_name_teaching_hospital", "lat": 27.7345, "lng": 85.3129 },
  { "id": 103, "type": "Hotel", "nameKey": "poi_name_yak_yeti", "lat": 27.7125, "lng": 85.3188 },
  { "id": 104, "type": "Services", "nameKey": "poi_name_kalanki_tyre", "lat": 27.6938, "lng": 85.2774 },
  { "id": 105, "type": "Fuel", "nameKey": "poi_name_noc_thankot", "lat": 27.6930, "lng": 85.2050 }
];

export const fetchPointsOfInterest = (): Promise<PointOfInterest[]> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(mockPointsOfInterest);
    }, 1000); // Simulate network delay
  });
};