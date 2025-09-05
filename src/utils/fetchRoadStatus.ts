// /src/utils/fetchRoadStatus.ts
// Minimal helper to fetch live road status from Google Apps Script endpoint

const ENDPOINT_URL = 'https://script.google.com/macros/s/AKfycbx6gmAt6XdIUqQstWfn1GdBTdAxXcsZkLwZ006ajJaCTRdlCgMzFa0Qw-di2IkKChxW/exec';

export interface RoadStatus {
  serialNumber: string;
  highwayName: string;
  cause: string;
  section: string;
  district: string;
  province: string;
  status: string;
  contactName: string;
  contactNumber: string;
  designation: string;
}

export async function fetchRoadStatus(): Promise<RoadStatus[]> {
  try {
    const response = await fetch(ENDPOINT_URL);
    if (!response.ok) {
      throw new Error(`Error fetching road status: ${response.statusText}`);
    }

    const data = await response.json();
    return data.map((item: any) => ({
      serialNumber: item.B,
      highwayName: item.I,
      cause: item.J,
      section: item.H,
      district: item.G,
      province: item.F,
      status: item.V,
      contactName: item.AE,
      contactNumber: item.AF,
      designation: item.AG
    }));
  } catch (error) {
    console.error('Failed to fetch road status:', error);
    return [];
  }
}
