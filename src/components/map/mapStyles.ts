export const mapStyles = {
    light: `
        .leaflet-tile-pane {
            filter: none;
        }
    `,
    dark: `
        .leaflet-tile-pane {
            filter: invert(1) hue-rotate(180deg) brightness(0.8) contrast(1.2);
        }
    `,
};
