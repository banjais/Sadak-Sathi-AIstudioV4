// Helper to calculate distance between two lat/lng points (Haversine formula)
export const haversineDistance = (coords1: [number, number], coords2: [number, number]): number => {
    const toRad = (x: number) => x * Math.PI / 180;
    const R = 6371e3; // Earth's radius in metres

    const dLat = toRad(coords2[0] - coords1[0]);
    const dLon = toRad(coords2[1] - coords1[1]);
    const lat1 = toRad(coords1[0]);
    const lat2 = toRad(coords2[0]);

    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
              Math.sin(dLon / 2) * Math.sin(dLon / 2) * Math.cos(lat1) * Math.cos(lat2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c; // in metres
};

// Calculates the distance covered along a route polyline up to a certain point.
export const calculateDistanceCovered = (geometry: [number, number][], currentSegmentIndex: number, currentLocation: [number, number]): number => {
    let distance = 0;
    // Sum lengths of completed segments
    for (let i = 0; i < currentSegmentIndex; i++) {
        if (geometry[i] && geometry[i + 1]) {
             distance += haversineDistance(geometry[i], geometry[i + 1]);
        }
    }
    // Add distance within the current segment
    if (currentSegmentIndex < geometry.length && geometry[currentSegmentIndex]) {
        distance += haversineDistance(geometry[currentSegmentIndex], currentLocation);
    }
    return distance;
};