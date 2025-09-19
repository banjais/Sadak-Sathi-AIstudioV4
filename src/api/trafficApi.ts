import L from 'leaflet';

/**
 * In a real application, this would call a traffic data service.
 * This is a mock implementation that generates random traffic data within the given map bounds.
 */

// Helper to generate a random point within bounds
const getRandomLatLng = (bounds: L.LatLngBounds): [number, number] => {
    const southWest = bounds.getSouthWest();
    const northEast = bounds.getNorthEast();
    const lngSpan = northEast.lng - southWest.lng;
    const latSpan = northEast.lat - southWest.lat;

    const lat = southWest.lat + latSpan * Math.random();
    const lng = southWest.lng + lngSpan * Math.random();
    return [lat, lng];
};

export const fetchTrafficData = (bounds: L.LatLngBounds): Promise<any> => {
    return new Promise((resolve) => {
        setTimeout(() => {
            const features = [];
            const congestionLevels: ('low' | 'medium' | 'high')[] = ['low', 'medium', 'high'];
            
            // Generate 20 random road segments with traffic data
            for (let i = 0; i < 20; i++) {
                const startPoint = getRandomLatLng(bounds);
                const endPoint = [
                    startPoint[0] + (Math.random() - 0.5) * 0.02, // Create a short segment
                    startPoint[1] + (Math.random() - 0.5) * 0.02,
                ];

                const feature = {
                    type: 'Feature',
                    properties: {
                        congestion: congestionLevels[Math.floor(Math.random() * 3)],
                    },
                    geometry: {
                        type: 'LineString',
                        coordinates: [
                            [startPoint[1], startPoint[0]], // GeoJSON is [lng, lat]
                            [endPoint[1], endPoint[0]],
                        ],
                    },
                };
                features.push(feature);
            }

            const geoJsonData = {
                type: 'FeatureCollection',
                features: features,
            };
            
            resolve(geoJsonData);
        }, 300); // Simulate network delay
    });
};