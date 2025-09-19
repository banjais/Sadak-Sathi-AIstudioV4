import L from 'leaflet';
import { getTile } from '../../api/offlineMapApi';

// Extend L.TileLayer to create a custom layer with offline capabilities.
const OfflineTileLayer = L.TileLayer.extend({
    createTile: function (coords: L.Coords, done: L.DoneCallback): HTMLElement {
        // Create an image element for the tile.
        const tile = document.createElement('img');
        const url = this.getTileUrl(coords);

        // Add an error handler to the image element. If the network tile fails to load,
        // Leaflet will use this to show a grey placeholder.
        L.DomEvent.on(tile, 'error', L.Util.bind(this._tileOnError, this, done, tile));

        // Attempt to retrieve the tile from IndexedDB.
        getTile(url).then(dataUrl => {
            if (dataUrl) {
                // If the tile is found offline, use the data URL as the source.
                tile.src = dataUrl;
                // Inform Leaflet that the tile is ready.
                done(null, tile);
            } else {
                // If not found offline, fetch it from the network.
                tile.src = url;
                // When the network tile loads successfully, inform Leaflet.
                L.DomEvent.on(tile, 'load', L.Util.bind(this._tileOnLoad, this, done, tile));
            }
        }).catch(err => {
            // If the database check fails, fall back to the network.
            console.warn(`Offline DB check failed for ${url}, fetching from network.`, err);
            tile.src = url;
            L.DomEvent.on(tile, 'load', L.Util.bind(this._tileOnLoad, this, done, tile));
        });

        // Return the tile element immediately. Leaflet handles the async loading.
        return tile;
    }
});

// Helper function to instantiate the custom layer, since 'extend' returns a class.
export const offlineTileLayer = function(url: string, options?: L.TileLayerOptions) {
    return new (OfflineTileLayer as any)(url, options);
};
