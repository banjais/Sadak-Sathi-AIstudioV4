// fetchRoadStatus.ts
import { fetchWeather } from './weather';

const FIREBASE_API_KEY = import.meta.env.VITE_FIREBASE_API_KEY;
const FIREBASE_PROJECT_ID = import.meta.env.VITE_FIREBASE_PROJECT_ID;

export interface RoadStatus {
  highway: string;
  status: string;
  updated_at: string;
}

export async function fetchRoadStatus(): Promise<RoadStatus[]> {
  try {
    const response = await fetch(
      `https://script.google.com/macros/s/AKfycbx6gmAt6XdIUqQstWfn1GdBTdAxXcsZkLwZ006ajJaCTRdlCgMzFa0Qw-di2IkKChxW/exec?projectId=${FIREBASE_PROJECT_ID}&key=${FIREBASE_API_KEY}`
    );
    const data = await response.json();
    // Example: augment with weather info
    const weather = await fetchWeather();
    return data.map((item: any) => ({ ...item, weather }));
  } catch (err) {
    console.error('Error fetching road status:', err);
    return [];
  }
}
