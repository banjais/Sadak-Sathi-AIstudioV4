import { openDB, DBSchema, IDBPDatabase } from 'idb';

const DB_NAME = 'sadak-sathi-offline-db';
const TILES_STORE_NAME = 'tiles';
const REGIONS_STATUS_KEY = 'sadak-sathi-region-status';

interface OfflineDB extends DBSchema {
    [TILES_STORE_NAME]: {
        key: string;
        value: string; // Storing as base64 data URL
    };
}

// Lazy-loaded, memoized function to get the DB instance.
const getDbInstance = (() => {
    let dbPromise: Promise<IDBPDatabase<OfflineDB>> | null = null;
    return (): Promise<IDBPDatabase<OfflineDB>> => {
        if (dbPromise) {
            return dbPromise;
        }
        try {
            dbPromise = openDB<OfflineDB>(DB_NAME, 1, {
                upgrade(db) {
                    if (!db.objectStoreNames.contains(TILES_STORE_NAME)) {
                        db.createObjectStore(TILES_STORE_NAME);
                    }
                },
            });
            return dbPromise;
        } catch (error) {
            console.error("IndexedDB is not available. Offline features will be disabled.", error);
            return Promise.reject(error);
        }
    };
})();


export interface Region {
    id: string;
    nameKey: string;
    bounds: [[number, number], [number, number]]; // [[minLat, minLng], [maxLat, maxLng]]
    minZoom: number;
    maxZoom: number;
}

// Define regions for Nepal (Provinces)
export const nepalRegions: Region[] = [
    { id: 'province1', nameKey: 'province_1', bounds: [[26.35, 86.15], [28.15, 88.20]], minZoom: 7, maxZoom: 14 },
    { id: 'province2', nameKey: 'province_2', bounds: [[26.35, 84.80], [27.25, 86.95]], minZoom: 7, maxZoom: 14 },
    { id: 'bagmati', nameKey: 'province_bagmati', bounds: [[27.20, 83.90], [28.40, 86.55]], minZoom: 7, maxZoom: 14 },
    { id: 'gandaki', nameKey: 'province_gandaki', bounds: [[27.80, 82.85], [29.35, 85.20]], minZoom: 7, maxZoom: 14 },
    { id: 'lumbini', nameKey: 'province_lumbini', bounds: [[27.35, 81.05], [28.85, 84.05]], minZoom: 7, maxZoom: 14 },
    { id: 'karnali', nameKey: 'province_karnali', bounds: [[28.30, 80.95], [30.45, 83.70]], minZoom: 7, maxZoom: 14 },
    { id: 'sudurpashchim', nameKey: 'province_sudurpashchim', bounds: [[28.35, 80.05], [30.15, 81.85]], minZoom: 7, maxZoom: 14 },
];

export interface RegionStatus {
    [regionId: string]: {
        status: 'downloaded' | 'downloading' | 'none';
        progress?: number;
    };
}

// --- Tile Storage ---

export const getTile = async (url: string): Promise<string | null> => {
    try {
        const db = await getDbInstance();
        const tile = await db.get(TILES_STORE_NAME, url);
        return tile || null;
    } catch (error) {
        console.warn("Could not access offline tile storage. Serving from network.", error);
        return null; // Gracefully fail
    }
};

const saveTile = async (url: string, dataUrl: string): Promise<void> => {
    try {
        const db = await getDbInstance();
        await db.put(TILES_STORE_NAME, dataUrl, url);
    } catch (error) {
        console.warn(`Could not save tile ${url} to offline storage.`, error);
        throw error; // Propagate error to stop download process
    }
};

// --- Region Status Management ---

export const getRegionStatuses = (): RegionStatus => {
    try {
        const statuses = localStorage.getItem(REGIONS_STATUS_KEY);
        return statuses ? JSON.parse(statuses) : {};
    } catch (e) {
        console.error("Failed to read/parse region statuses from localStorage.", e);
        return {};
    }
};

const updateRegionStatus = (regionId: string, status: 'downloaded' | 'downloading' | 'none', progress?: number) => {
    try {
        const statuses = getRegionStatuses();
        if (status === 'none') {
            delete statuses[regionId];
        } else {
            statuses[regionId] = { status, progress };
        }
        localStorage.setItem(REGIONS_STATUS_KEY, JSON.stringify(statuses));
        window.dispatchEvent(new CustomEvent('region-status-change'));
    } catch(e) {
        console.error("Failed to update region status in localStorage.", e);
    }
};

// --- Tile Calculation & Download ---

const long2tile = (lon: number, zoom: number) => Math.floor((lon + 180) / 360 * Math.pow(2, zoom));
const lat2tile = (lat: number, zoom: number) => Math.floor((1 - Math.log(Math.tan(lat * Math.PI / 180) + 1 / Math.cos(lat * Math.PI / 180)) / Math.PI) / 2 * Math.pow(2, zoom));
const TILE_URL_TEMPLATE = 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';

const blobToDataURL = (blob: Blob): Promise<string> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(blob);
    });
};

export const downloadTilesForRegion = async (region: Region, onProgress: (progress: number) => void): Promise<void> => {
    updateRegionStatus(region.id, 'downloading', 0);
    onProgress(0);

    const tilesToDownload: { url: string }[] = [];
    for (let z = region.minZoom; z <= region.maxZoom; z++) {
        const minX = long2tile(region.bounds[0][1], z);
        const maxX = long2tile(region.bounds[1][1], z);
        const minY = lat2tile(region.bounds[1][0], z);
        const maxY = lat2tile(region.bounds[0][0], z);

        for (let x = minX; x <= maxX; x++) {
            for (let y = minY; y <= maxY; y++) {
                const subdomains = ['a', 'b', 'c'];
                const subdomain = subdomains[(x + y) % subdomains.length];
                const url = TILE_URL_TEMPLATE.replace('{s}', subdomain).replace('{z}', String(z)).replace('{x}', String(x)).replace('{y}', String(y));
                tilesToDownload.push({ url });
            }
        }
    }

    let downloadedCount = 0;
    const totalCount = tilesToDownload.length;
    if (totalCount === 0) {
        updateRegionStatus(region.id, 'downloaded', 100);
        onProgress(100);
        return;
    }

    try {
        for (const tile of tilesToDownload) {
            const response = await fetch(tile.url);
            if (!response.ok) throw new Error(`Failed to fetch ${tile.url}`);
            
            const blob = await response.blob();
            const dataUrl = await blobToDataURL(blob);
            await saveTile(tile.url, dataUrl);

            downloadedCount++;
            const progress = Math.round((downloadedCount / totalCount) * 100);
            updateRegionStatus(region.id, 'downloading', progress);
            onProgress(progress);
        }
        updateRegionStatus(region.id, 'downloaded', 100);
        onProgress(100);
    } catch (error) {
        console.error(`Could not complete download for region ${region.id}:`, error);
        updateRegionStatus(region.id, 'none');
        throw error;
    }
};

export const deleteTilesForRegion = async (region: Region, onProgress: (progress: number) => void): Promise<void> => {
    try {
        const db = await getDbInstance();
        const tilesToDelete: string[] = [];
        for (let z = region.minZoom; z <= region.maxZoom; z++) {
            const minX = long2tile(region.bounds[0][1], z);
            const maxX = long2tile(region.bounds[1][1], z);
            const minY = lat2tile(region.bounds[1][0], z);
            const maxY = lat2tile(region.bounds[0][0], z);

            for (let x = minX; x <= maxX; x++) {
                for (let y = minY; y <= maxY; y++) {
                    const subdomains = ['a', 'b', 'c'];
                    const subdomain = subdomains[(x + y) % subdomains.length];
                    const url = TILE_URL_TEMPLATE.replace('{s}', subdomain).replace('{z}', String(z)).replace('{x}', String(x)).replace('{y}', String(y));
                    tilesToDelete.push(url);
                }
            }
        }

        const tx = db.transaction(TILES_STORE_NAME, 'readwrite');
        let deletedCount = 0;
        const totalCount = tilesToDelete.length;
        if (totalCount === 0) {
            updateRegionStatus(region.id, 'none');
            onProgress(100);
            return;
        }

        for (const url of tilesToDelete) {
            await tx.store.delete(url);
            deletedCount++;
            onProgress(Math.round((deletedCount / totalCount) * 100));
        }
        await tx.done;
        
        updateRegionStatus(region.id, 'none');
    } catch (error) {
        console.error(`Deletion failed for region ${region.id}.`, error);
        // Even if deletion fails, reset the status so user can try again.
        updateRegionStatus(region.id, 'none');
    }
};
