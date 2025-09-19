/**
 * In a real application, this would call a routing service like
 * Mapbox Directions API, OSRM, etc. This is a mock implementation.
 */

export type RoutePreference = 'fastest' | 'shortest' | 'avoidHighways';

export interface Step {
  instructionKey: string;
  distance: number; // meters
  duration: number; // seconds
}

export interface RouteLeg {
  distance: number; // meters
  duration: number; // seconds
  steps: Step[];
  summary: string;
}

export interface Route {
  geometry: [number, number][];
  distance: number; // in meters
  duration: number; // in seconds
  speedLimit: number; // in km/h
  legs: RouteLeg[];
}

export interface RouteOptions {
  preference: RoutePreference;
}

const calculateDistance = (start: {lat: number, lng: number}, end: {lat: number, lng: number}): number => {
    const R = 6371e3; // metres
    const φ1 = start.lat * Math.PI/180;
    const φ2 = end.lat * Math.PI/180;
    const Δφ = (end.lat-start.lat) * Math.PI/180;
    const Δλ = (end.lng-start.lng) * Math.PI/180;

    const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
              Math.cos(φ1) * Math.cos(φ2) *
              Math.sin(Δλ/2) * Math.sin(Δλ/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

    return R * c; // in metres
}

const generateBaseRoute = (start: {lat: number, lng: number}, end: {lat: number, lng: number}, options: RouteOptions): Route => {
    const baseDistance = calculateDistance(start, end);
    let distance = baseDistance;
    let duration = distance / 11.1; // ~40km/h average
    let geometry: [number, number][];
    let speedLimit: number;

    switch (options.preference) {
        case 'avoidHighways':
            distance *= 1.15; // Usually longer
            duration *= 1.3; // Slower
            speedLimit = 40;
            const midLatAvoid = start.lat + (end.lat - start.lat) * 0.55 + (end.lng - start.lng) * 0.1;
            const midLngAvoid = start.lng + (end.lng - start.lng) * 0.45 - (end.lat - start.lat) * 0.1;
            geometry = [[start.lat, start.lng], [midLatAvoid, midLngAvoid], [end.lat, end.lng]];
            break;
        case 'shortest':
            distance *= 0.95; // Slightly shorter
            duration *= 1.1; // Might be slower
            speedLimit = 50;
            const midLatShort = start.lat + (end.lat - start.lat) * 0.5;
            const midLngShort = start.lng + (end.lng - start.lng) * 0.5;
            geometry = [[start.lat, start.lng], [midLatShort, midLngShort], [end.lat, end.lng]];
            break;
        case 'fastest':
        default:
            distance *= 1.05; // Might be longer due to highways
            duration *= 0.9; // Faster
            speedLimit = 80;
            const midLat1 = start.lat + (end.lat - start.lat) * 0.3 + (end.lng - start.lng) * 0.1;
            const midLng1 = start.lng + (end.lng - start.lng) * 0.3 - (end.lat - start.lat) * 0.1;
            const midLat2 = start.lat + (end.lat - start.lat) * 0.7 - (end.lng - start.lng) * 0.1;
            const midLng2 = start.lng + (end.lng - start.lng) * 0.7 + (end.lat - start.lat) * 0.1;
            geometry = [[start.lat, start.lng], [midLat1, midLng1], [midLat2, midLng2], [end.lat, end.lng]];
            break;
    }
    
    // Generate mock steps for the route
    const steps: Step[] = [];
    const numPoints = geometry.length;
    if (numPoints > 1) {
        const totalDuration = duration;
        const totalDistance = distance;
        
        steps.push({
            instructionKey: 'instruction_head_north',
            distance: totalDistance / numPoints,
            duration: totalDuration / numPoints,
        });

        for (let i = 1; i < numPoints - 1; i++) {
            const turn = Math.random() > 0.5 ? 'left' : 'right';
            steps.push({
                instructionKey: turn === 'left' ? 'instruction_turn_left' : 'instruction_turn_right',
                distance: totalDistance / numPoints,
                duration: totalDuration / numPoints,
            });
        }
        
        steps.push({
            instructionKey: 'instruction_arrive',
            distance: totalDistance / numPoints,
            duration: totalDuration / numPoints,
        });
    }

    const legs: RouteLeg[] = [{
        distance,
        duration,
        summary: 'A summary of the route.',
        steps,
    }];

    return { geometry, distance, duration, speedLimit, legs };
};

export const fetchRoute = (start: {lat: number, lng: number}, end: {lat: number, lng: number}, options: RouteOptions): Promise<Route> => {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            // Simulate a potential network failure (e.g., 10% chance of failing)
            if (Math.random() < 0.1) {
                reject(new Error("Simulated network error: Could not fetch route."));
            } else {
                const baseRoute = generateBaseRoute(start, end, options);
                resolve(baseRoute);
            }
        }, 1200);
    });
};

export interface SimulatedPosition {
  lat: number;
  lng: number;
  timestamp: number; // Milliseconds from simulation start
  segmentIndex: number;
}

/**
 * Simulates driving along a route at a given speed.
 * This generates a sequence of positions with timestamps for demonstrating navigation.
 * @param route The Route object to simulate.
 * @param speedKmh The speed of travel in kilometers per hour.
 * @returns An array of simulated positions.
 */
export const simulateDriving = (route: Route, speedKmh: number): SimulatedPosition[] => {
    if (!route || route.geometry.length < 2) {
        return [];
    }

    const speedMps = speedKmh > 0 ? (speedKmh * 1000 / 3600) : 0;
    if (speedMps === 0) {
        // If speed is 0, just return the start point
        return [{ lat: route.geometry[0][0], lng: route.geometry[0][1], timestamp: 0, segmentIndex: 0 }];
    }

    const simulatedPositions: SimulatedPosition[] = [];
    let cumulativeTimeMs = 0;
    const timeStepMs = 1000; // Generate a point every second

    // Add the starting point
    simulatedPositions.push({
        lat: route.geometry[0][0],
        lng: route.geometry[0][1],
        timestamp: 0,
        segmentIndex: 0,
    });

    for (let i = 0; i < route.geometry.length - 1; i++) {
        const p1 = route.geometry[i];
        const p2 = route.geometry[i + 1];

        const segmentDistance = calculateDistance({ lat: p1[0], lng: p1[1] }, { lat: p2[0], lng: p2[1] });
        if (segmentDistance <= 0) continue;

        const segmentDurationMs = (segmentDistance / speedMps) * 1000;

        // Generate interpolated points for the current segment
        for (let timeInSegment = timeStepMs; timeInSegment < segmentDurationMs; timeInSegment += timeStepMs) {
             const t = timeInSegment / segmentDurationMs; // interpolation factor
             const lat = p1[0] + (p2[0] - p1[0]) * t;
             const lng = p1[1] + (p2[1] - p1[1]) * t;
             const timestamp = cumulativeTimeMs + timeInSegment;
             simulatedPositions.push({ lat, lng, timestamp: Math.round(timestamp), segmentIndex: i });
        }

        // Update cumulative time and add the exact end point of the segment
        cumulativeTimeMs += segmentDurationMs;
        simulatedPositions.push({
            lat: p2[0],
            lng: p2[1],
            timestamp: Math.round(cumulativeTimeMs),
            segmentIndex: i,
        });
    }

    return simulatedPositions;
};