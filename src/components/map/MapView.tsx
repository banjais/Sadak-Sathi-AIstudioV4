import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import { useTheme } from '../../context/ThemeContext';
import { mapStyles } from './mapStyles';
import { offlineTileLayer } from './OfflineTileLayer';
import { pavementData } from '../../data/pavementData';

// Pavement layer styling
const pavementStyles = {
    'Good': { color: '#28a745', weight: 3, opacity: 0.7 },
    'Fair': { color: '#ffc107', weight: 4, opacity: 0.7 },
    'Poor': { color: '#dc3545', weight: 4, opacity: 0.8 },
};

interface MapViewProps {
    center: [number, number];
    zoom: number;
    userLocation: [number, number] | null;
    incidents: any[];
    pointsOfInterest: any[];
    routeGeometry: [number, number][] | null;
    isNavigating: boolean;
    onMapReady: (map: L.Map) => void;
    onMapBoundsChange: (bounds: L.LatLngBounds) => void;
    onFeatureClick: (feature: any) => void;
    poiFilters: { [key: string]: boolean };
    incidentFilters: { [key: string]: boolean };
    currentLayer: string;
    showPavementLayer: boolean;
    trafficData: any | null;
}

const MapView: React.FC<MapViewProps> = ({
    center, zoom, userLocation, incidents, pointsOfInterest, routeGeometry, isNavigating,
    onMapReady, onMapBoundsChange, onFeatureClick, poiFilters, incidentFilters,
    currentLayer, showPavementLayer, trafficData,
}) => {
    const mapContainerRef = useRef<HTMLDivElement>(null);
    const mapRef = useRef<L.Map | null>(null);
    const userMarkerRef = useRef<L.Marker | null>(null);
    const incidentsLayerRef = useRef<L.FeatureGroup | null>(null);
    const poisLayerRef = useRef<L.FeatureGroup | null>(null);
    const routeLayerRef = useRef<L.FeatureGroup | null>(null);
    const pavementLayerRef = useRef<L.GeoJSON | null>(null);
    const trafficLayerRef = useRef<L.GeoJSON | null>(null);
    const activeTileLayerRef = useRef<L.TileLayer | null>(null);
    const baseLayersRef = useRef<{ [key: string]: L.TileLayer } | null>(null);
    const mapIconsRef = useRef<any>(null);
    const { theme } = useTheme();
    const [isMapInitialized, setIsMapInitialized] = useState(false);

    // Initialize map
    useEffect(() => {
        if (mapContainerRef.current && !mapRef.current) {
             // Create icons here, once Leaflet is guaranteed to be ready
            const userLocationIcon = L.divIcon({
                html: '<div class="user-location-marker"></div>',
                className: '',
                iconSize: [24, 24],
                iconAnchor: [12, 12],
            });

            // UPDATED: createMapIcon now handles incident pins vs. POI circles
            const createMapIcon = (className: string, iconHtml: string, isIncident: boolean) => {
                const isPin = isIncident;
                const baseClass = isPin ? 'incident-pin' : 'map-icon-container';
                const size: [number, number] = isPin ? [38, 38] : [32, 32];
                const anchor: [number, number] = isPin ? [19, 38] : [16, 32];
                const popupAnchor: [number, number] = isPin ? [0, -40] : [0, -32];

                return L.divIcon({
                    html: `<div class="map-icon-wrapper">${iconHtml}</div>`,
                    className: `${baseClass} ${className}`,
                    iconSize: size,
                    iconAnchor: anchor,
                    popupAnchor: popupAnchor,
                });
            };

            const icons = {
                // Incidents: Pass `true` to create a pin marker
                'Blocked': createMapIcon('incident-blocked', '<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" /><line x1="4.93" y1="4.93" x2="19.07" y2="19.07" /></svg>', true),
                'One-Lane': createMapIcon('incident-one-lane', '<svg viewBox="0 0 24 24"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><path d="M9 16l1-8"/><path d="M15 16l-1-8"/></svg>', true),
                'Traffic Jam': createMapIcon('incident-traffic-jam', '<svg viewBox="0 0 24 24"><path d="M10 2H6v4h4V2zm8 0h-4v4h4V2zm-2 10h-2V8h2v4zm-4 0H8V8h4v4zm10 4h-2v-4h2v4zM4 16H2v-4h2v4zm-2 6h20v-4H2v4z"/></svg>', true),
                'Road Hazard': createMapIcon('incident-road-hazard', '<svg viewBox="0 0 24 24"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" /><line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" /></svg>', true),
                'Vehicle Breakdown': createMapIcon('incident-vehicle-breakdown', '<svg viewBox="0 0 24 24"><path d="M14 17.25V15a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v2.25"/><path d="M12 13V2l-3 4h6L12 2z"/><circle cx="6" cy="19" r="2"/><circle cx="18" cy="19" r="2"/><path d="M4.5 19H2m18 0h-2.5"/><path d="M19 15h-2a2 2 0 0 0-2 2v2.25"/></svg>', true),
                'Other': createMapIcon('incident-other', '<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" /><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" /><line x1="12" y1="17" x2="12.01" y2="17" /></svg>', true),
                
                // POIs: Pass `false` to create a circular marker
                'Fuel': createMapIcon('poi-fuel', '<svg viewBox="0 0 24 24"><path d="M14 8V5a2 2 0 0 0-2-2H8a2 2 0 0 0-2 2v11a2 2 0 0 0 2 2h4a2 2 0 0 0 2-2v-3"/><line x1="14" y1="12" x2="6" y2="12"/></svg>', false),
                'Hospital': createMapIcon('poi-hospital', '<svg viewBox="0 0 24 24"><rect x="3" y="3" width="18" height="18" rx="2" ry="2" /><line x1="12" y1="8" x2="12" y2="16" /><line x1="8" y1="12" x2="16" y2="12" /></svg>', false),
                'Hotel': createMapIcon('poi-hotel', '<svg viewBox="0 0 24 24"><path d="M2 7.66V20a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V7.66"/><path d="M22 7.66V5a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v2.66"/><path d="M8 7v15"/><path d="M16 7v15"/></svg>', false),
                'Services': createMapIcon('poi-services', '<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06-.06a1.65 1.65 0 0 0-.33-1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>', false),
            };
            mapIconsRef.current = { userLocationIcon, icons };


            // Instantiate layers inside useEffect to ensure DOM is ready
            baseLayersRef.current = {
                'Streets': offlineTileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                }),
                'Satellite': L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
                    attribution: 'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community'
                }),
                'Topographic': L.tileLayer('https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png', {
                    attribution: 'Map data: &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, <a href="http://viewfinderpanoramas.org">SRTM</a> | Map style: &copy; <a href="https://opentopomap.org">OpenTopoMap</a> (<a href="https://creativecommons.org/licenses/by-sa/3.0/">CC-BY-SA</a>)'
                })
            };
            
            const map = L.map(mapContainerRef.current, { center, zoom, zoomControl: false });
            mapRef.current = map;
            
            incidentsLayerRef.current = L.featureGroup().addTo(map);
            poisLayerRef.current = L.featureGroup().addTo(map);
            routeLayerRef.current = L.featureGroup().addTo(map);

            // Initialize traffic layer
            trafficLayerRef.current = L.geoJSON(undefined, {
                style: (feature) => {
                    switch (feature?.properties.congestion) {
                        case 'high': return { className: 'traffic-high' };
                        case 'medium': return { className: 'traffic-medium' };
                        default: return { className: 'traffic-low' };
                    }
                }
            }).addTo(map);


            L.control.zoom({ position: 'topright' }).addTo(map);

            map.on('moveend', () => onMapBoundsChange(map.getBounds()));

            onMapReady(map);
            setIsMapInitialized(true);
        }

        // Cleanup function to run on component unmount
        return () => {
            if (mapRef.current) {
                mapRef.current.remove();
                mapRef.current = null;
            }
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // Apply theme styles
    useEffect(() => {
        const styleId = 'map-theme-style';
        const currentStyle = theme === 'dark' ? mapStyles.dark : mapStyles.light;

        if (document.head) {
            let styleElement = document.getElementById(styleId) as HTMLStyleElement;
            if (!styleElement) {
                styleElement = document.createElement('style');
                styleElement.id = styleId;
                document.head.appendChild(styleElement);
            }
            if (styleElement.innerHTML !== currentStyle) {
                styleElement.innerHTML = currentStyle;
            }
        }
    }, [theme]);

    // Update map layer
    useEffect(() => {
        if (mapRef.current && baseLayersRef.current) {
            const newLayer = baseLayersRef.current[currentLayer];
            if (activeTileLayerRef.current) {
                mapRef.current.removeLayer(activeTileLayerRef.current);
            }
            if (newLayer) {
                newLayer.addTo(mapRef.current);
                activeTileLayerRef.current = newLayer;
            }
        }
    }, [currentLayer]);

    // Update user location marker
    useEffect(() => {
        if (isMapInitialized && mapRef.current && userLocation && mapIconsRef.current) {
            const latLng: L.LatLngTuple = [userLocation[0], userLocation[1]];
            if (userMarkerRef.current) {
                userMarkerRef.current.setLatLng(latLng);
            } else {
                userMarkerRef.current = L.marker(latLng, { icon: mapIconsRef.current.userLocationIcon }).addTo(mapRef.current);
            }
        }
    }, [userLocation, isMapInitialized]);

    // Update incident markers
    useEffect(() => {
        if (!isMapInitialized || !mapIconsRef.current || !incidentsLayerRef.current) return;
        const layer = incidentsLayerRef.current;
        layer.clearLayers();
        incidents
            .filter(incident => incidentFilters[incident.type as keyof typeof incidentFilters])
            .forEach(incident => {
                const marker = L.marker([incident.lat, incident.lng], { icon: mapIconsRef.current.icons[incident.type as keyof typeof mapIconsRef.current.icons] });
                marker.on('click', () => onFeatureClick(incident));
                layer.addLayer(marker);
            });
    }, [incidents, onFeatureClick, incidentFilters, isMapInitialized]);

    // Update POI markers
    useEffect(() => {
        if (!isMapInitialized || !mapIconsRef.current || !poisLayerRef.current) return;
        const layer = poisLayerRef.current;
        layer.clearLayers();
        pointsOfInterest
            .filter(poi => poiFilters[poi.type as keyof typeof poiFilters])
            .forEach(poi => {
                const marker = L.marker([poi.lat, poi.lng], { icon: mapIconsRef.current.icons[poi.type as keyof typeof mapIconsRef.current.icons] });
                marker.on('click', () => onFeatureClick(poi));
                layer.addLayer(marker);
            });
    }, [pointsOfInterest, onFeatureClick, poiFilters, isMapInitialized]);

    // Update route polyline
    useEffect(() => {
        if (mapRef.current && routeLayerRef.current) {
            const layer = routeLayerRef.current;
            layer.clearLayers();
            if (routeGeometry) {
                const latLngs = routeGeometry.map(point => [point[0], point[1]] as L.LatLngExpression);
                const polyline = L.polyline(latLngs, { className: 'route-path' });
                layer.addLayer(polyline);
                if (!isNavigating && layer.getLayers().length > 0) {
                     mapRef.current.fitBounds(layer.getBounds().pad(0.1));
                }
            }
        }
    }, [routeGeometry, isNavigating]);

    // Toggle Pavement Layer
    useEffect(() => {
        if (!isMapInitialized || !mapRef.current) return;

        if (showPavementLayer && !pavementLayerRef.current) {
            pavementLayerRef.current = L.geoJSON(pavementData as any, {
                style: (feature) => {
                    const quality = feature?.properties?.quality;
                    return pavementStyles[quality as keyof typeof pavementStyles] || { color: '#888', weight: 2 };
                }
            }).addTo(mapRef.current);
        } else if (!showPavementLayer && pavementLayerRef.current) {
            mapRef.current.removeLayer(pavementLayerRef.current);
            pavementLayerRef.current = null;
        }
    }, [showPavementLayer, isMapInitialized]);

    // Update traffic layer
    useEffect(() => {
        if (trafficLayerRef.current) {
            const layer = trafficLayerRef.current;
            layer.clearLayers();
            if (trafficData) {
                layer.addData(trafficData);
            }
        }
    }, [trafficData]);

    return <div ref={mapContainerRef} className="map-view" />;
};

export default MapView;