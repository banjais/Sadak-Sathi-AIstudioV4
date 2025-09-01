

/**
 * @license
 * Copyright (c) 2024 Your Company or Name. All Rights Reserved.
 * SPDX-License-Identifier: Apache-2.0
 *
 * =================================================================================
 * INTELLECTUAL PROPERTY NOTICE:
 *
 * In a real-world production environment, the code in this file would be
 * minified and obfuscated as part of a build process (e.g., using Vite or
 * Webpack). This process makes the code extremely difficult for others to read
 * and reverse-engineer, thus protecting your intellectual property.
 * =================================================================================
 *
 * =================================================================================
 * API KEY SECURITY:
 *
 * The API key is accessed via `process.env.API_KEY`. This is a secure practice.
 * The key is stored as an environment variable on the server where the code is
 * built and hosted. It is NEVER hardcoded here and is NOT exposed to the public.
 * =================================================================================
 */


import { GoogleGenAI, Tool, Type, GenerateContentResponse } from "@google/genai";

// Declare Cesium as a global variable to be used from the script tag.
declare var Cesium: any;

// Web Speech API
const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
const SpeechSynthesis = window.speechSynthesis;

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });


// =================================================================================
// ARCHITECTURE REFACTOR: "Backend-Ready" API Simulation
// =================================================================================
const ROAD_DATA_URL = 'https://script.google.com/macros/s/AKfycbx6gmAt6XdIUqQstWfn1GdBTdAxXcsZkLwZ006ajJaCTRdlCgMzFa0Qw-di2IkKChxW/exec';

// --- NEW: Nepal-centric configuration ---
const NEPAL_BORDER_GEOJSON = { "type": "Polygon", "coordinates": [[[80.058, 28.986], [80.12, 28.422], [80.37, 28.42], [81.12, 28.78], [81.22, 28.98], [81.63, 29.1], [81.6, 29.43], [82.02, 29.43], [82.2, 29.6], [82.52, 29.58], [82.8, 29.75], [83.02, 29.45], [83.43, 29.12], [83.92, 28.73], [83.93, 28.23], [84.53, 27.85], [84.97, 27.72], [85.73, 27.93], [85.93, 28.07], [86.53, 27.88], [86.97, 27.88], [87.52, 27.65], [88.12, 27.35], [88.13, 27.05], [88.23, 26.85], [88.08, 26.58], [87.6, 26.38], [87.05, 26.47], [86.53, 26.63], [85.92, 26.63], [85.45, 26.73], [84.88, 26.65], [84.23, 26.85], [83.9, 27.1], [83.5, 27.28], [82.8, 27.45], [82.2, 27.5], [81.6, 27.6], [81.1, 27.7], [80.6, 27.9], [80.3, 28.1], [80.058, 28.986]]] };
const INITIAL_CAMERA_POSITION = { lon: 84.1240, lat: 28.3949, alt: 900000 };
const NEPAL_BOUNDING_RECTANGLE = Cesium.Rectangle.fromDegrees(80.0, 26.3, 88.2, 30.5);

// =================================================================================
// Main Application Class
// =================================================================================
class SadakSathiApp {
    private viewer: any;
    private allRoadData: any[] = [];
    private roadDataSource: any;
    private poiDataSource: any;
    private incidentDataSource: any;
    private routeDataSource: any;
    private userLocationEntity: any = null;
    private isChatOpen: boolean = false;
    private chatHistory: { role: string, parts: { text: string }[] }[] = [];
    private recognition: any;
    private isRecognizing: boolean = false;
    private currentVoiceInputTarget: HTMLInputElement | null = null;
    private currentLang: string = 'en';
    private translations: any = {};
    private ipCamUrl: string = '';
    
    // AI Persona State
    private aiAvatarUrl: string = 'https://i.imgur.com/r33W56s.png';
    private aiPersonality: string = 'friendly';
    private aiVoice: string = 'female';
    private availableVoices: SpeechSynthesisVoice[] = [];

    constructor() {
        this.init();
    }

    async init() {
        await this.initCesium();
        this.loadVoices();
        await this.loadInitialData();
        this.setupEventListeners();
        this.initSpeechRecognition();
        this.initGeolocation();
        await this.loadTranslations(this.currentLang);
        this.updateUIForLanguage();
        this.loadSettings();
    }

    // --- Cesium and Map Initialization ---
    async initCesium() {
        Cesium.Ion.defaultAccessToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiI0YjFjNGFjMS1iMjExLTQyYWMtOTFkYy0wMDYxZGU5Y2QyYTMiLCJpZCI6MjI2NTg0LCJpYXQiOjE3MjExNTg4MDB9.sA-1z4P-6A8f6UgtMNQ8qfIq_v2O-u3a3e-rcQoTbow';

        this.viewer = new Cesium.Viewer('map', {
            terrainProvider: await Cesium.Terrain.fromWorldTerrain(),
            geocoder: false,
            homeButton: false,
            sceneModePicker: false,
            baseLayerPicker: false,
            navigationHelpButton: false,
            animation: false,
            timeline: false,
            fullscreenButton: false,
            infoBox: false, // Disable default infoBox
            selectionIndicator: false,
        });

        // Add OSM Buildings
        this.viewer.scene.primitives.add(await Cesium.createOsmBuildingsAsync());

        // Camera Constraints
        this.viewer.camera.flyTo({ destination: Cesium.Cartesian3.fromDegrees(INITIAL_CAMERA_POSITION.lon, INITIAL_CAMERA_POSITION.lat, INITIAL_CAMERA_POSITION.alt) });
        this.viewer.camera.constrainedAxis = Cesium.Cartesian3.UNIT_Z;
        this.viewer.scene.screenSpaceCameraController.minimumZoomDistance = 100;
        this.viewer.scene.screenSpaceCameraController.maximumZoomDistance = 2000000;
        this.viewer.scene.screenSpaceCameraController.bounceAnimationTime = 0;
        this.viewer.camera.setView({
             destination: NEPAL_BOUNDING_RECTANGLE
        });

        // Initialize DataSources
        this.roadDataSource = new Cesium.GeoJsonDataSource('roads');
        this.poiDataSource = new Cesium.GeoJsonDataSource('pois');
        this.incidentDataSource = new Cesium.GeoJsonDataSource('incidents');
        this.routeDataSource = new Cesium.GeoJsonDataSource('route');
        this.viewer.dataSources.add(this.roadDataSource);
        this.viewer.dataSources.add(this.poiDataSource);
        this.viewer.dataSources.add(this.incidentDataSource);
        this.viewer.dataSources.add(this.routeDataSource);

    }

    // --- Data Loading & Processing ---
    async loadInitialData() {
        try {
            const response = await fetch(ROAD_DATA_URL);
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            const data = await response.json();
            this.allRoadData = data.data;
            this.processAndDisplayData(this.allRoadData);

            // Now, load locally stored incidents on top
            this.loadLocalIncidents();

            // Populate datalist for route finder
            const datalist = document.getElementById('locations-datalist') as HTMLDataListElement;
            const locations = new Set<string>();
            this.allRoadData.forEach(item => {
                if(item.points_of_interest) {
                    item.points_of_interest.forEach((poi: any) => {
                        const poiName = this.getLocalisedString(poi.name, '');
                        if (poiName) locations.add(poiName);
                    });
                }
            });
            datalist.innerHTML = '';
            locations.forEach(loc => {
                const option = document.createElement('option');
                option.value = loc;
                datalist.appendChild(option);
            });
        } catch (error) {
            console.error('Error fetching road data:', error);
            this.showToast('Failed to load road data.', 'error');
        }
    }

    processAndDisplayData(data: any[]) {
        const roadFeatures = [];
        const poiFeatures = [];
        const incidentFeatures = [];

        data.forEach(road => {
            // Create road line feature
            roadFeatures.push({
                type: 'Feature',
                geometry: road.geometry,
                properties: {
                    name: road.name,
                    status: road.status,
                    type: 'road',
                    details: road.details,
                    last_updated: road.last_updated
                }
            });

            // Create POI point features
            if (road.points_of_interest) {
                road.points_of_interest.forEach((poi: any) => {
                    poiFeatures.push({
                        type: 'Feature',
                        geometry: {
                            type: 'Point',
                            coordinates: [poi.lon, poi.lat]
                        },
                        properties: { ...poi, type: 'poi' }
                    });
                });
            }
             // Create incident point features
            if (road.incidents) {
                road.incidents.forEach((incident: any) => {
                    incidentFeatures.push({
                        type: 'Feature',
                        geometry: {
                            type: 'Point',
                            coordinates: [incident.lon, incident.lat]
                        },
                        properties: { ...incident, type: 'incident' }
                    });
                });
            }
        });
        
        this.loadDataIntoSource(this.roadDataSource, { type: 'FeatureCollection', features: roadFeatures });
        this.loadDataIntoSource(this.poiDataSource, { type: 'FeatureCollection', features: poiFeatures });
        this.loadDataIntoSource(this.incidentDataSource, { type: 'FeatureCollection', features: incidentFeatures });
        
        this.styleDataSources();
    }

    loadDataIntoSource(dataSource: any, geojson: any) {
        dataSource.load(geojson).then(() => {
            // Data loaded
        }).catch((error: any) => {
            console.error(`Error loading data into source ${dataSource.name}:`, error);
        });
    }

    styleDataSources() {
        this.roadDataSource.entities.values.forEach((entity: any) => {
            const props = entity.properties;
            entity.polyline.width = 5;
            entity.polyline.material = this.getRoadColor(props.status.getValue());
            entity.polyline.clampToGround = true;
        });

        this.poiDataSource.entities.values.forEach((entity: any) => this.styleEntityAsBillboard(entity, this.getIconForPoi(entity.properties.category.getValue()), 'poi'));
        this.incidentDataSource.entities.values.forEach((entity: any) => this.styleEntityAsBillboard(entity, 'warning', 'incident'));
    }

    styleEntityAsBillboard(entity: any, icon: string, type: string) {
        entity.billboard = new Cesium.BillboardGraphics({
            image: this.getIconCanvas(icon, type === 'poi' ? '#3498db' : '#e74c3c'),
            width: 32,
            height: 32,
            verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
            disableDepthTestDistance: Number.POSITIVE_INFINITY
        });
    }

    getRoadColor(status: any) {
        // Handle cases where status might be an object due to i18n
        const statusString = this.getLocalisedString(status, 'unknown').toLowerCase();
        switch (statusString) {
            case 'open': return Cesium.Color.fromCssColorString('#2ecc71');
            case 'blocked': return Cesium.Color.fromCssColorString('#e74c3c');
            case 'restricted': return Cesium.Color.fromCssColorString('#f39c12');
            case 'construction': return Cesium.Color.fromCssColorString('#e67e22');
            default: return Cesium.Color.fromCssColorString('#95a5a6');
        }
    }

    getIconForPoi(category: any): string {
        const cat = this.getLocalisedString(category, '').toLowerCase();
        if (cat.includes('fuel') || cat.includes('petrol')) return 'local_gas_station';
        if (cat.includes('food') || cat.includes('hotel') || cat.includes('restaurant')) return 'restaurant';
        if (cat.includes('atm')) return 'atm';
        if (cat.includes('hospital') || cat.includes('health')) return 'local_hospital';
        if (cat.includes('police')) return 'local_police';
        if (cat.includes('mechanic') || cat.includes('workshop')) return 'construction';
        if (cat.includes('viewpoint') || cat.includes('tourist')) return 'camera_alt';
        return 'place';
    }
    
    getIconCanvas(iconName: string, color: string): HTMLCanvasElement {
        const canvas = document.createElement('canvas');
        canvas.width = 48;
        canvas.height = 48;
        const ctx = canvas.getContext('2d')!;
        
        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.arc(24, 24, 22, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = 'white';
        ctx.lineWidth = 2;
        ctx.stroke();

        ctx.font = '28px "Material Icons"';
        ctx.fillStyle = 'white';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(iconName, 24, 24);

        return canvas;
    }


    // --- UI Event Listeners ---
    setupEventListeners() {
        // Header
        document.getElementById('theme-toggle')?.addEventListener('click', () => this.toggleTheme());
        document.getElementById('live-cam-btn')?.addEventListener('click', () => this.toggleLiveCamPanel(true));
        
        // Language Selector
        document.getElementById('language-selector-btn')?.addEventListener('click', () => {
            document.getElementById('language-popup')?.classList.toggle('hidden');
        });
        document.querySelectorAll('.lang-category-header').forEach(header => {
            header.addEventListener('click', () => {
                header.parentElement?.classList.toggle('open');
                const icon = header.querySelector('.expand-icon');
                if (icon) {
                    icon.textContent = header.parentElement?.classList.contains('open') ? 'expand_more' : 'chevron_right';
                }
            });
        });
        document.querySelectorAll('.lang-option').forEach(option => {
            option.addEventListener('click', async (e) => {
                const target = e.currentTarget as HTMLElement;
                const lang = target.dataset.lang;
                if (lang) {
                    this.currentLang = lang;
                    document.querySelectorAll('.lang-option.active').forEach(o => o.classList.remove('active'));
                    target.classList.add('active');
                    await this.loadTranslations(lang);
                    this.updateUIForLanguage();
                    document.getElementById('language-popup')?.classList.add('hidden');
                    (document.getElementById('current-lang-label') as HTMLElement).innerText = target.innerText.split(' ')[1];
                }
            });
        });

        // Map Controls
        document.getElementById('zoom-in-btn')?.addEventListener('click', () => this.viewer.camera.zoomIn());
        document.getElementById('zoom-out-btn')?.addEventListener('click', () => this.viewer.camera.zoomOut());
        document.getElementById('center-location-btn')?.addEventListener('click', () => this.centerOnUserLocation());
        document.getElementById('map-options-btn')?.addEventListener('click', (e) => {
            e.stopPropagation();
            document.getElementById('map-options-popup')?.classList.toggle('hidden');
        });

        // Map Options
        document.getElementById('toggle-roads')?.addEventListener('change', (e) => { this.roadDataSource.show = (e.target as HTMLInputElement).checked; });
        document.getElementById('toggle-pois')?.addEventListener('change', (e) => { this.poiDataSource.show = (e.target as HTMLInputElement).checked; });
        document.getElementById('toggle-incidents')?.addEventListener('change', (e) => { this.incidentDataSource.show = (e.target as HTMLInputElement).checked; });
        document.querySelectorAll('.style-option').forEach(btn => {
            btn.addEventListener('click', (e) => this.changeMapStyle((e.currentTarget as HTMLElement).dataset.style!));
        });

        // Cesium InfoBox
        document.getElementById('cesium-infobox-close')?.addEventListener('click', () => this.hideInfoBox());

        // Live Cam
        document.getElementById('close-cam-btn')?.addEventListener('click', () => this.toggleLiveCamPanel(false));
        document.getElementById('save-ip-cam-btn')?.addEventListener('click', () => this.saveIpCamUrl());

        // FAB Menu
        document.getElementById('fab-main-btn')?.addEventListener('click', () => {
            const mainBtn = document.getElementById('fab-main-btn')!;
            const menuItems = document.getElementById('fab-menu-items')!;
            const icon = mainBtn.querySelector('.material-icons')!;
            
            const isOpen = mainBtn.classList.toggle('open');
            menuItems.classList.toggle('hidden', !isOpen);
            icon.textContent = isOpen ? 'close' : 'menu';
        });
        document.getElementById('fab-ai-btn')?.addEventListener('click', () => this.toggleChat(true));
        document.getElementById('fab-settings-btn')?.addEventListener('click', () => this.toggleSettings(true));
        document.getElementById('fab-profile-btn')?.addEventListener('click', () => this.toggleModal('profile-modal', true));

        // Chat
        document.getElementById('close-chat-btn')?.addEventListener('click', () => this.toggleChat(false));
        document.getElementById('chat-form')?.addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleChatMessage();
        });
        document.getElementById('voice-command-btn')?.addEventListener('click', () => this.toggleVoiceRecognition());

        // Top Search Panel (formerly Route Finder)
        document.getElementById('find-route-btn')?.addEventListener('click', () => this.findRoute());
        document.getElementById('clear-route-btn')?.addEventListener('click', () => this.clearRoute());
        document.getElementById('swap-locations-btn')?.addEventListener('click', () => this.swapRouteLocations());
        document.getElementById('from-voice-btn')?.addEventListener('click', (e) => this.startVoiceInputFor(document.getElementById('from-input') as HTMLInputElement));
        document.getElementById('to-voice-btn')?.addEventListener('click', (e) => this.startVoiceInputFor(document.getElementById('to-input') as HTMLInputElement));
        
        // Route Details
        document.getElementById('route-details-close')?.addEventListener('click', () => this.toggleRouteDetails(false));
        
        // Settings
        document.querySelector('#settings-panel .icon-button')?.addEventListener('click', () => this.toggleSettings(false));
        document.getElementById('pref-highways')?.addEventListener('change', () => this.saveRoutePreferences());
        document.getElementById('pref-no-tolls')?.addEventListener('change', () => this.saveRoutePreferences());
        document.getElementById('pref-scenic')?.addEventListener('change', () => this.saveRoutePreferences());
        // AI Persona Settings
        document.getElementById('persona-avatar-upload')?.addEventListener('change', (e) => this.handleAvatarChange(e));
        document.getElementById('persona-personality-select')?.addEventListener('change', (e) => {
            this.aiPersonality = (e.target as HTMLSelectElement).value;
            this.saveAiSettings();
            this.updatePersonalityDescription();
        });
        document.getElementById('persona-voice-select')?.addEventListener('change', (e) => {
            this.aiVoice = (e.target as HTMLSelectElement).value;
            this.saveAiSettings();
        });

        // Report Incident
        document.getElementById('report-incident-fab')?.addEventListener('click', () => this.toggleReportIncidentModal(true));
        document.getElementById('report-incident-close')?.addEventListener('click', () => this.toggleReportIncidentModal(false));
        document.getElementById('report-incident-form')?.addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleIncidentReportSubmit();
        });

        // Modals
        document.querySelectorAll('.modal-close-btn').forEach(btn => btn.addEventListener('click', (e) => this.toggleModal((e.currentTarget as HTMLElement).closest('.modal-overlay')!.id, false)));
        document.getElementById('report-incident-modal')?.addEventListener('click', (e) => {
            if ((e.target as HTMLElement).id === 'report-incident-modal') {
                this.toggleReportIncidentModal(false);
            }
        });

        // Admin Panel
        document.getElementById('admin-panel-btn')?.addEventListener('click', () => this.toggleModal('admin-panel-modal', true));

        // Click handler for map
        this.viewer.screenSpaceEventHandler.setInputAction((movement: any) => {
            const pickedObject = this.viewer.scene.pick(movement.position);
            if (Cesium.defined(pickedObject) && Cesium.defined(pickedObject.id)) {
                this.showInfoForEntity(pickedObject.id);
            } else {
                this.hideInfoBox();
            }
        }, Cesium.ScreenSpaceEventType.LEFT_CLICK);
        
        // Global click to close popups
        document.addEventListener('click', (e) => {
            if (!(document.getElementById('map-options-selector') as HTMLElement).contains(e.target as Node)) {
                document.getElementById('map-options-popup')?.classList.add('hidden');
            }
            if (!(document.getElementById('language-selector-container') as HTMLElement).contains(e.target as Node)) {
                document.getElementById('language-popup')?.classList.add('hidden');
            }
        });

    }
    
    // --- Specific UI Handlers ---
    toggleTheme() {
        const container = document.getElementById('app-container')!;
        const currentTheme = container.dataset.theme;
        const newTheme = currentTheme === 'light' ? 'dark' : 'light';
        container.dataset.theme = newTheme;
        document.getElementById('theme-toggle')!.querySelector('.material-icons')!.textContent = newTheme === 'light' ? 'light_mode' : 'dark_mode';
        this.changeMapStyle(newTheme === 'dark' ? 'dark' : 'streets');
    }

    async changeMapStyle(style: string) {
        this.viewer.imageryLayers.removeAll();
        let newLayer;
        try {
            switch(style) {
                case 'satellite':
                    newLayer = new Cesium.ImageryLayer(await Cesium.createWorldImageryAsync());
                    break;
                case 'dark':
                    newLayer = new Cesium.ImageryLayer(new Cesium.UrlTemplateImageryProvider({
                        url: 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}.png',
                        subdomains: ['a', 'b', 'c', 'd']
                    }));
                    break;
                case 'streets':
                default:
                    newLayer = new Cesium.ImageryLayer(await Cesium.createOpenStreetMapImageryProviderAsync());
                    break;
            }
            this.viewer.imageryLayers.add(newLayer);
            document.querySelectorAll('.style-option.active').forEach(btn => btn.classList.remove('active'));
            document.querySelector(`.style-option[data-style="${style}"]`)?.classList.add('active');
        } catch (error) {
            console.error(`Error changing map style to '${style}':`, error);
            this.showToast('Failed to load the selected map style.', 'error');
        }
    }

    showInfoForEntity(entity: any) {
        const props = this.cesiumPropertiesToJs(entity.properties);
        const contentDiv = document.getElementById('cesium-infobox-content')!;
        let html = '';

        // Determine entity type and generate appropriate HTML content.
        if (props.type === 'road') {
            html = this.createRoadInfoHtml(props);
        } else if (props.type === 'poi') {
            html = this.createPoiInfoHtml(props);
        } else if (props.type === 'incident') {
            html = this.createIncidentInfoHtml(props);
        }

        // Only show the box if we have content to display.
        if (html) {
            contentDiv.innerHTML = html;
            document.getElementById('cesium-infobox')?.classList.remove('hidden');

            // Add event listener for the directions button if it exists
            const getDirectionsBtn = document.getElementById('get-incident-directions-btn');
            if (getDirectionsBtn) {
                getDirectionsBtn.addEventListener('click', (e) => {
                    const btn = e.currentTarget as HTMLElement;
                    const lat = btn.dataset.lat!;
                    const lon = btn.dataset.lon!;
                    const type = btn.dataset.type!;

                    if (this.userLocationEntity) {
                        this.hideInfoBox();
                        
                        (document.getElementById('from-input') as HTMLInputElement).value = 'My Current Location';
                        // Use a special, parsable string for the destination
                        (document.getElementById('to-input') as HTMLInputElement).value = `Incident:${type}:${lat}:${lon}`;

                        this.findRoute();
                    } else {
                        this.showToast('Please enable GPS to get directions.', 'warning');
                    }
                });
            }

        } else {
            this.hideInfoBox();
        }
    }

    private createRoadInfoHtml(props: any): string {
        const name = this.getLocalisedString(props.name, 'Unnamed Road');
        const status = this.getLocalisedString(props.status, 'N/A');
        const details = this.getLocalisedString(props.details, 'No details available.');
        const lastUpdated = props.last_updated ? new Date(props.last_updated).toLocaleString() : 'N/A';
        
        const statusClass = String(status).toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');

        const nameHtml = `<h3>${name}</h3>`;
        const statusHtml = `<p><strong>Status:</strong> <span class="status-${statusClass}">${status}</span></p>`;
        const detailsHtml = `<p>${details}</p>`;
        const lastUpdatedHtml = `<small>Last Updated: ${lastUpdated}</small>`;
        
        return `
            ${nameHtml}
            ${statusHtml}
            ${detailsHtml}
            ${lastUpdatedHtml}
        `;
    }
    
    private createPoiInfoHtml(props: any): string {
        const name = this.getLocalisedString(props.name, 'Unnamed POI');
        const category = this.getLocalisedString(props.category, 'N/A');
        const contactValue = this.getLocalisedString(props.contact, '');
        const contact = contactValue ? `<p><strong>Contact:</strong> ${contactValue}</p>` : '';
        
        let services = '';
        if (Array.isArray(props.services) && props.services.length > 0) {
            const serviceStrings = props.services.map((service: any) => this.getLocalisedString(service, '')).filter(s => s);
            if (serviceStrings.length > 0) {
                services = `<p><strong>Services:</strong> ${serviceStrings.join(', ')}</p>`;
            }
        }

        return `
            <h3>${name}</h3>
            <p><strong>Category:</strong> ${category}</p>
            ${contact}
            ${services}
        `;
    }
    
    private createIncidentInfoHtml(props: any): string {
        const title = this.getLocalisedString(props.title, 'Incident Report');
        const type = this.getLocalisedString(props.incident_type, 'N/A');
        const description = this.getLocalisedString(props.description, 'No description provided.');
        const timestamp = props.timestamp ? new Date(props.timestamp).toLocaleString() : 'N/A';
        
        const directionsButtonHtml = `
            <button id="get-incident-directions-btn" class="primary-btn" style="width: 100%; margin-top: 1rem;" 
                data-lat="${props.lat}" 
                data-lon="${props.lon}" 
                data-type="${type}">
                <span class="material-icons">directions</span>
                <span data-lang-key="get_directions">Get Directions</span>
            </button>
        `;

        return `
            <h3>${title}</h3>
            <p><strong>Type:</strong> ${type}</p>
            <p>${description}</p>
            <small>Reported: ${timestamp}</small>
            ${(props.lat && props.lon) ? directionsButtonHtml : ''}
        `;
    }

    hideInfoBox() {
        document.getElementById('cesium-infobox')?.classList.add('hidden');
    }

    toggleLiveCamPanel(show: boolean) {
        const panel = document.getElementById('live-cam-panel');
        if (show) {
            panel?.classList.remove('hidden');
            if(this.ipCamUrl) {
                (document.getElementById('ip-cam-stream') as HTMLImageElement).src = this.ipCamUrl;
                document.getElementById('ip-cam-stream')?.classList.remove('hidden');
                document.getElementById('live-cam-video')?.classList.add('hidden');
            } else {
                 this.startWebcam();
            }
        } else {
            panel?.classList.add('hidden');
            this.stopWebcam();
        }
    }
    
    async startWebcam() {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
            const video = document.getElementById('live-cam-video') as HTMLVideoElement;
            video.srcObject = stream;
            video.classList.remove('hidden');
            document.getElementById('ip-cam-stream')?.classList.add('hidden');
            document.getElementById('live-cam-placeholder')?.classList.add('hidden');
        } catch (err) {
            console.error("Error accessing webcam:", err);
            document.getElementById('live-cam-placeholder')?.classList.remove('hidden');
            document.getElementById('live-cam-video')?.classList.add('hidden');
            this.showToast('Could not access webcam.', 'error');
        }
    }

    stopWebcam() {
        const video = document.getElementById('live-cam-video') as HTMLVideoElement;
        if (video.srcObject) {
            const stream = video.srcObject as MediaStream;
            stream.getTracks().forEach(track => track.stop());
            video.srcObject = null;
        }
    }
    
    saveIpCamUrl() {
        const urlInput = document.getElementById('admin-ip-cam-url') as HTMLInputElement;
        this.ipCamUrl = urlInput.value.trim();
        localStorage.setItem('sadakSathiIpCamUrl', this.ipCamUrl);
        this.showToast('IP Camera URL saved!', 'success');
        this.toggleModal('admin-panel-modal', false);
    }
    
    loadSettings() {
        // Load IP Cam URL
        this.ipCamUrl = localStorage.getItem('sadakSathiIpCamUrl') || '';
        (document.getElementById('admin-ip-cam-url') as HTMLInputElement).value = this.ipCamUrl;

        // Load Route Preferences
        const routePrefsString = localStorage.getItem('sadakSathiRoutePrefs');
        if (routePrefsString) {
            try {
                const prefs = JSON.parse(routePrefsString);
                (document.getElementById('pref-highways') as HTMLInputElement).checked = prefs.preferHighways ?? false;
                (document.getElementById('pref-no-tolls') as HTMLInputElement).checked = prefs.avoidTolls ?? false;
                (document.getElementById('pref-scenic') as HTMLInputElement).checked = prefs.preferScenic ?? false;
            } catch (error) {
                console.error("Error parsing route preferences from localStorage", error);
            }
        }

        // Load AI Persona Settings
        const personaSettingsString = localStorage.getItem('sadakSathiAiPersona');
        if (personaSettingsString) {
            try {
                const persona = JSON.parse(personaSettingsString);
                this.aiAvatarUrl = persona.avatarUrl || this.aiAvatarUrl;
                this.aiPersonality = persona.personality || this.aiPersonality;
                this.aiVoice = persona.voice || this.aiVoice;

                // Update UI
                (document.getElementById('persona-avatar-preview') as HTMLImageElement).src = this.aiAvatarUrl;
                (document.getElementById('chat-ai-avatar') as HTMLImageElement).src = this.aiAvatarUrl;
                (document.getElementById('persona-personality-select') as HTMLSelectElement).value = this.aiPersonality;
                (document.getElementById('persona-voice-select') as HTMLSelectElement).value = this.aiVoice;
                this.updatePersonalityDescription();
            } catch (error) {
                console.error("Error parsing AI persona settings from localStorage", error);
            }
        }
    }

    saveRoutePreferences() {
        const prefs = {
            preferHighways: (document.getElementById('pref-highways') as HTMLInputElement).checked,
            avoidTolls: (document.getElementById('pref-no-tolls') as HTMLInputElement).checked,
            preferScenic: (document.getElementById('pref-scenic') as HTMLInputElement).checked,
        };
        localStorage.setItem('sadakSathiRoutePrefs', JSON.stringify(prefs));
        this.showToast('Route preferences saved!', 'success');
    }

    // --- Geolocation ---
    initGeolocation() {
        if ('geolocation' in navigator) {
            navigator.geolocation.watchPosition(
                (position) => this.handleLocationSuccess(position),
                (error) => this.handleLocationError(error),
                { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
            );
        } else {
            this.showToast('Geolocation is not supported by your browser.', 'warning');
        }
    }

    handleLocationSuccess(position: GeolocationPosition) {
        const { latitude, longitude } = position.coords;
        const indicator = document.getElementById('gps-status-indicator')!;
        indicator.classList.add('active');
        indicator.title = 'GPS Status: Active';
        
        if (!this.userLocationEntity) {
            this.userLocationEntity = this.viewer.entities.add({
                position: Cesium.Cartesian3.fromDegrees(longitude, latitude),
                billboard: {
                    image: this.getIconCanvas('navigation', '#1e90ff'),
                    width: 32,
                    height: 32,
                    verticalOrigin: Cesium.VerticalOrigin.CENTER,
                    disableDepthTestDistance: Number.POSITIVE_INFINITY
                }
            });
        } else {
            this.userLocationEntity.position = Cesium.Cartesian3.fromDegrees(longitude, latitude);
        }
    }

    handleLocationError(error: GeolocationPositionError) {
        console.warn(`Geolocation error: ${error.message}`);
        const indicator = document.getElementById('gps-status-indicator')!;
        indicator.classList.remove('active');
        indicator.title = `GPS Error: ${error.message}`;
        this.showToast('Could not get your location.', 'error');
    }

    centerOnUserLocation() {
        if (this.userLocationEntity) {
            this.viewer.flyTo(this.userLocationEntity, {
                duration: 1.5,
                offset: new Cesium.HeadingPitchRange(0, Cesium.Math.toRadians(-45), 2000)
            });
        } else {
            this.showToast('Location not available yet.', 'warning');
        }
    }


    // --- AI Chat and Voice ---
    toggleChat(show: boolean) {
        const modal = document.getElementById('ai-chat-modal')!;
        modal.classList.toggle('hidden', !show);
        this.isChatOpen = show;

        if (show) {
             // Update avatar in chat header when opening
            (document.getElementById('chat-ai-avatar') as HTMLImageElement).src = this.aiAvatarUrl;

            if(this.chatHistory.length === 0) {
                const welcomeMessage = this.translations['ai_welcome_message'];
                const messageText = (welcomeMessage && typeof welcomeMessage === 'string')
                    ? welcomeMessage
                    : "Hello! I'm Sadak Sathi, your road companion. How can I assist you today? Ask me about road conditions, points of interest, or help you find a route.";
                this.addMessageToChat('Sadak Sathi', messageText, false);
                this.chatHistory.push({ role: 'model', parts: [{ text: messageText }] });
            }
        }
    }
    
    async handleChatMessage() {
        const input = document.getElementById('chat-input') as HTMLInputElement;
        const message = input.value.trim();
        if (!message) return;

        this.addMessageToChat('You', message, true);
        input.value = '';
        this.chatHistory.push({ role: 'user', parts: [{ text: message }] });
        this.setTypingIndicator(true);

        try {
            const tools: Tool[] = [
                {
                    functionDeclarations: [
                        {
                            name: 'find_route',
                            description: 'Finds the best route between two locations based on user preferences.',
                            parameters: {
                                type: Type.OBJECT,
                                properties: {
                                    start: { type: Type.STRING, description: 'The starting location.' },
                                    end: { type: Type.STRING, description: 'The destination location.' }
                                },
                                required: ['start', 'end']
                            }
                        },
                        {
                            name: 'get_information_about',
                            description: 'Gets information about a specific location, road, or point of interest.',
                            parameters: {
                                type: Type.OBJECT,
                                properties: {
                                    query: { type: Type.STRING, description: 'The name of the place or road to get information about.'}
                                },
                                required: ['query']
                            }
                        }
                    ]
                }
            ];

            const systemInstruction = this.getSystemInstructionForPersonality();
            const response: GenerateContentResponse = await ai.models.generateContent({
                model: 'gemini-2.5-flash',
                contents: this.chatHistory, // Pass the entire conversation history
                config: { 
                    tools,
                    systemInstruction: `You MUST respond in the language with this ISO code: "${this.currentLang}". ${systemInstruction}`
                }
            });

            this.setTypingIndicator(false);
            
            if(response.functionCalls && response.functionCalls.length > 0) {
                 const call = response.functionCalls[0];
                 this.handleFunctionCall(call.name, call.args);
            } else {
                const aiResponse = response.text;
                this.addMessageToChat('Sadak Sathi', aiResponse, false);
                this.chatHistory.push({ role: 'model', parts: [{ text: aiResponse }] });
                if ((document.getElementById('toggle-voice-response') as HTMLInputElement).checked) {
                    this.speak(aiResponse);
                }
            }

        } catch (error) {
            console.error("Gemini API error:", error);
            this.setTypingIndicator(false);
            const errorMessageKey = 'ai_error_message';
            const errorMessage = (this.translations[errorMessageKey] && typeof this.translations[errorMessageKey] === 'string')
                ? this.translations[errorMessageKey]
                : "Sorry, I encountered an error. Please try again.";
            this.addMessageToChat('Sadak Sathi', errorMessage, false);
        }
    }

    handleFunctionCall(name: string, args: any) {
        if (name === 'find_route') {
            this.addMessageToChat('Sadak Sathi', `Okay, finding the best route from ${args.start} to ${args.end}.`, false);
            this.toggleChat(false);
            (document.getElementById('from-input') as HTMLInputElement).value = args.start;
            (document.getElementById('to-input') as HTMLInputElement).value = args.end;
            this.findRoute();
        } else if (name === 'get_information_about') {
            const info = this.findInfoInLocalData(args.query);
            this.addMessageToChat('Sadak Sathi', info, false);
        }
    }

    findInfoInLocalData(query: string): string {
        const lowerQuery = query.toLowerCase();
        for (const road of this.allRoadData) {
            const roadName = this.getLocalisedString(road.name, '');
            if (roadName.toLowerCase().includes(lowerQuery)) {
                const status = this.getLocalisedString(road.status, 'unknown');
                const details = this.getLocalisedString(road.details, 'No details available.');
                return `The ${roadName} is currently ${status}. ${details}`;
            }
            if (road.points_of_interest) {
                for (const poi of road.points_of_interest) {
                    const poiName = this.getLocalisedString(poi.name, '');
                    if (poiName.toLowerCase().includes(lowerQuery)) {
                        const category = this.getLocalisedString(poi.category, 'uncategorized');
                        let servicesString = '';
                        if (Array.isArray(poi.services) && poi.services.length > 0) {
                            const serviceStrings = poi.services.map((service: any) => this.getLocalisedString(service, '')).filter(s => s);
                            if (serviceStrings.length > 0) {
                               servicesString = `Services include: ${serviceStrings.join(', ')}`;
                            }
                        }
                        return `${poiName} is a ${category}. ${servicesString}`;
                    }
                }
            }
        }
        return `I couldn't find any specific information about "${query}" in my current data.`;
    }

    addMessageToChat(sender: string, text: string, isUser: boolean) {
        const messagesDiv = document.querySelector('.chat-messages')!;
        const messageEl = document.createElement('div');
        messageEl.classList.add('chat-message', isUser ? 'user-message' : 'ai-message');
        
        const avatar = document.createElement('img');
        avatar.classList.add('message-avatar');
        avatar.src = isUser ? 'https://i.imgur.com/SNdke3E.png' : this.aiAvatarUrl;
        
        const messageContent = document.createElement('div');
        messageContent.classList.add('message-content');
        const senderName = document.createElement('span');
        senderName.classList.add('message-sender');
        senderName.textContent = sender;
        const messageText = document.createElement('p');
        messageText.textContent = text;
        
        messageContent.appendChild(senderName);
        messageContent.appendChild(messageText);
        
        if (!isUser) messageEl.appendChild(avatar);
        messageEl.appendChild(messageContent);
        if (isUser) messageEl.appendChild(avatar);

        messagesDiv.appendChild(messageEl);
        messagesDiv.scrollTop = messagesDiv.scrollHeight;
    }
    
    setTypingIndicator(show: boolean) {
        document.querySelector('.typing-indicator')?.classList.toggle('hidden', !show);
    }
    
    initSpeechRecognition() {
        if (!SpeechRecognition) {
            console.warn("Speech Recognition not supported.");
            return;
        }
        this.recognition = new SpeechRecognition();
        this.recognition.continuous = false;
        this.recognition.lang = this.currentLang;
        this.recognition.interimResults = false;
        this.recognition.maxAlternatives = 1;

        this.recognition.onresult = (event: any) => {
            const speechResult = event.results[0][0].transcript;
            if (this.currentVoiceInputTarget) {
                this.currentVoiceInputTarget.value = speechResult;
            } else {
                 (document.getElementById('chat-input') as HTMLInputElement).value = speechResult;
                 this.handleChatMessage();
            }
        };

        this.recognition.onerror = (event: any) => {
            console.error('Speech recognition error', event.error);
            this.showToast(`Speech recognition error: ${event.message || event.error}`, 'error');
        };

        this.recognition.onend = () => {
            this.isRecognizing = false;
            document.querySelectorAll('.voice-input-btn.recording, #voice-command-btn.recording').forEach(btn => btn.classList.remove('recording'));
            this.currentVoiceInputTarget = null;
        };
    }
    
    toggleVoiceRecognition() {
        if (this.isRecognizing) {
            this.recognition.stop();
        } else {
            this.recognition.lang = this.currentLang;
            this.recognition.start();
            this.isRecognizing = true;
            document.getElementById('voice-command-btn')?.classList.add('recording');
        }
    }
    
    startVoiceInputFor(inputElement: HTMLInputElement) {
        if (this.isRecognizing) {
            this.recognition.stop();
        } else {
            this.currentVoiceInputTarget = inputElement;
            this.recognition.lang = this.currentLang;
            this.recognition.start();
            this.isRecognizing = true;
            inputElement.nextElementSibling?.classList.add('recording');
        }
    }

    speak(text: string) {
        if (SpeechSynthesis.speaking) {
            SpeechSynthesis.cancel();
        }
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = this.currentLang;

        // Find a matching voice
        const langVoices = this.availableVoices.filter(v => v.lang.startsWith(this.currentLang));
        if (langVoices.length > 0) {
            let selectedVoice = langVoices[0]; // Default to first available
            if (this.aiVoice === 'female') {
                const femaleVoice = langVoices.find(v => v.name.toLowerCase().includes('female'));
                if (femaleVoice) selectedVoice = femaleVoice;
            } else if (this.aiVoice === 'male') {
                const maleVoice = langVoices.find(v => v.name.toLowerCase().includes('male'));
                if (maleVoice) selectedVoice = maleVoice;
            } else { // Neutral or other
                const neutralVoice = langVoices.find(v => !v.name.toLowerCase().includes('female') && !v.name.toLowerCase().includes('male'));
                 if (neutralVoice) selectedVoice = neutralVoice;
            }
            utterance.voice = selectedVoice;
        }

        SpeechSynthesis.speak(utterance);
    }
    
    // --- Routing ---
    swapRouteLocations() {
        const fromInput = document.getElementById('from-input') as HTMLInputElement;
        const toInput = document.getElementById('to-input') as HTMLInputElement;
        [fromInput.value, toInput.value] = [toInput.value, fromInput.value];
    }
    
    findRoute() {
        const from = (document.getElementById('from-input') as HTMLInputElement).value;
        const to = (document.getElementById('to-input') as HTMLInputElement).value;
        if (!from || !to) {
            this.showToast('Please enter both start and end locations.', 'warning');
            return;
        }

        const startCoords = this.findCoordsForLocation(from);
        const endCoords = this.findCoordsForLocation(to);

        if (!startCoords || !endCoords) {
            this.showToast('Could not find one or both locations.', 'error');
            return;
        }
        
        // Get preferences
        const preferHighways = (document.getElementById('pref-highways') as HTMLInputElement).checked;
        const avoidTolls = (document.getElementById('pref-no-tolls') as HTMLInputElement).checked;
        const preferScenic = (document.getElementById('pref-scenic') as HTMLInputElement).checked;

        // This is a placeholder for a proper routing engine.
        // For this demo, it will just draw a straight line, but change style and time estimate based on prefs.
        let routeColor = Cesium.Color.DODGERBLUE;
        let averageSpeedKmh = 40; // Normal route speed

        if (preferScenic) {
            routeColor = Cesium.Color.FORESTGREEN;
            averageSpeedKmh = 30; // Scenic routes are slower
        } else if (preferHighways) {
            routeColor = Cesium.Color.ROYALBLUE;
            averageSpeedKmh = 60; // Highways are faster
        }

        this.routeDataSource.entities.removeAll();
        this.routeDataSource.entities.add({
            polyline: {
                positions: Cesium.Cartesian3.fromDegreesArray([
                    startCoords.lon, startCoords.lat,
                    endCoords.lon, endCoords.lat
                ]),
                width: preferHighways ? 10 : 8,
                material: new Cesium.PolylineDashMaterialProperty({
                    color: routeColor,
                }),
                clampToGround: true
            }
        });

        this.viewer.flyTo(this.routeDataSource);
        this.toggleRouteDetails(true);

        const distance = this.calculateDistance(startCoords, endCoords);
        const estimatedTimeMin = Math.round(distance / averageSpeedKmh * 60);
        
        // Prettify names for display
        let fromDisplay = from;
        let toDisplay = to;
        if (to.startsWith('Incident:')) {
            const parts = to.split(':');
            toDisplay = `Reported ${parts[1]}`;
        }


        (document.getElementById('route-distance') as HTMLElement).textContent = `${distance.toFixed(1)} km`;
        (document.getElementById('route-time') as HTMLElement).textContent = `${estimatedTimeMin} min`;
        (document.getElementById('route-directions-list') as HTMLElement).innerHTML = `<div class="direction-step">Follow the highlighted route from ${fromDisplay} to ${toDisplay}.</div>`;
    
        // Display preferences used
        const prefsSummaryContainer = document.getElementById('route-preferences-summary')!;
        const prefsList = document.getElementById('route-preferences-list')!;
        prefsList.innerHTML = '';
        let prefsUsed = false;

        const addPrefItem = (icon: string, key: string) => {
            const text = (this.translations[key] && typeof this.translations[key] === 'string') ? this.translations[key] : key.replace(/_/g, ' ');
            const li = document.createElement('li');
            li.innerHTML = `<span class="material-icons" style="font-size: 1rem;">${icon}</span> <span data-lang-key="${key}">${text}</span>`;
            prefsList.appendChild(li);
        };

        if (preferHighways) {
            addPrefItem('add_road', 'prefer_highways');
            prefsUsed = true;
        }
        if (avoidTolls) {
            addPrefItem('money_off', 'avoid_tolls');
            prefsUsed = true;
        }
        if (preferScenic) {
            addPrefItem('landscape', 'prefer_scenic_route');
            prefsUsed = true;
        }
        
        prefsSummaryContainer.classList.toggle('hidden', !prefsUsed);
        
        // Toggle route buttons
        document.getElementById('find-route-btn')?.classList.add('hidden');
        document.getElementById('clear-route-btn')?.classList.remove('hidden');
    }

    clearRoute() {
        this.routeDataSource.entities.removeAll();
        this.toggleRouteDetails(false);
        (document.getElementById('from-input') as HTMLInputElement).value = '';
        (document.getElementById('to-input') as HTMLInputElement).value = '';

        // Toggle route buttons
        document.getElementById('find-route-btn')?.classList.remove('hidden');
        document.getElementById('clear-route-btn')?.classList.add('hidden');
    }


    findCoordsForLocation(locationName: string): { lat: number, lon: number } | null {
         const lowerLoc = locationName.toLowerCase();

         if (lowerLoc === 'my current location') {
            if (this.userLocationEntity) {
                const cartesianPosition = this.userLocationEntity.position.getValue(this.viewer.clock.currentTime);
                if (cartesianPosition) {
                    const cartographic = Cesium.Cartographic.fromCartesian(cartesianPosition);
                    return {
                        lon: Cesium.Math.toDegrees(cartographic.longitude),
                        lat: Cesium.Math.toDegrees(cartographic.latitude)
                    };
                }
            }
            return null;
         }

         if (locationName.startsWith('Incident:')) {
             const parts = locationName.split(':');
             if (parts.length === 4) {
                 const lat = parseFloat(parts[2]);
                 const lon = parseFloat(parts[3]);
                 if (!isNaN(lat) && !isNaN(lon)) {
                     return { lat, lon };
                 }
             }
         }

         for (const road of this.allRoadData) {
            if (road.points_of_interest) {
                for (const poi of road.points_of_interest) {
                    const poiName = this.getLocalisedString(poi.name, '');
                    if (poiName.toLowerCase().includes(lowerLoc)) {
                        return { lat: poi.lat, lon: poi.lon };
                    }
                }
            }
        }
        return null;
    }
    
    calculateDistance(coords1: {lat:number, lon:number}, coords2: {lat:number, lon:number}): number {
        const R = 6371; // Radius of the Earth in km
        const dLat = (coords2.lat - coords1.lat) * Math.PI / 180;
        const dLon = (coords2.lon - coords1.lon) * Math.PI / 180;
        const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
                  Math.cos(coords1.lat * Math.PI / 180) * Math.cos(coords2.lat * Math.PI / 180) *
                  Math.sin(dLon / 2) * Math.sin(dLon / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return R * c;
    }


    toggleRouteDetails(show: boolean) {
        document.getElementById('route-details-panel')?.classList.toggle('hidden', !show);
    }

    // --- Incident Reporting ---
    toggleReportIncidentModal(show: boolean) {
        const modal = document.getElementById('report-incident-modal')!;
        this.toggleModal('report-incident-modal', show);

        if (show) {
            const form = document.getElementById('report-incident-form')!;
            const unavailableMsg = document.getElementById('report-location-unavailable')!;
            
            if (this.userLocationEntity) {
                form.classList.remove('hidden');
                unavailableMsg.classList.add('hidden');
                (document.getElementById('incident-location') as HTMLInputElement).value = 'Using Current Location';
            } else {
                form.classList.add('hidden');
                unavailableMsg.classList.remove('hidden');
            }
        }
    }

    handleIncidentReportSubmit() {
        if (!this.userLocationEntity) {
            this.showToast('Cannot submit report without a valid location.', 'error');
            return;
        }

        const incidentType = (document.getElementById('incident-type') as HTMLSelectElement).value;
        const description = (document.getElementById('incident-description') as HTMLTextAreaElement).value;

        const cartesianPosition = this.userLocationEntity.position.getValue(this.viewer.clock.currentTime);
        if (!cartesianPosition) {
            this.showToast('Could not retrieve current position.', 'error');
            return;
        }
        const cartographic = Cesium.Cartographic.fromCartesian(cartesianPosition);
        const lon = Cesium.Math.toDegrees(cartographic.longitude);
        const lat = Cesium.Math.toDegrees(cartographic.latitude);
        
        const newIncident = {
            title: `User Reported: ${incidentType}`,
            incident_type: incidentType,
            description: description || 'No description provided.',
            lon,
            lat,
            timestamp: new Date().toISOString()
        };

        this.addLocalIncident(newIncident);
    }
    
    addLocalIncident(incident: any) {
        // 1. Add to map visually
        const newEntity = this.incidentDataSource.entities.add({
            position: Cesium.Cartesian3.fromDegrees(incident.lon, incident.lat),
            properties: { ...incident, type: 'incident' }
        });
        this.styleEntityAsBillboard(newEntity, 'warning', 'incident');

        // 2. Save to localStorage
        const localIncidents = JSON.parse(localStorage.getItem('sadakSathiLocalIncidents') || '[]');
        localIncidents.push(incident);
        localStorage.setItem('sadakSathiLocalIncidents', JSON.stringify(localIncidents));

        // 3. Show feedback & close
        this.showToast('Incident reported successfully. Thank you!', 'success');
        this.toggleReportIncidentModal(false);
        (document.getElementById('report-incident-form') as HTMLFormElement).reset();
    }
    
    loadLocalIncidents() {
        const localIncidents = JSON.parse(localStorage.getItem('sadakSathiLocalIncidents') || '[]');
        if (localIncidents.length === 0) return;

        localIncidents.forEach((incident: any) => {
             const entity = this.incidentDataSource.entities.add({
                position: Cesium.Cartesian3.fromDegrees(incident.lon, incident.lat),
                properties: { ...incident, type: 'incident' }
            });
            this.styleEntityAsBillboard(entity, 'warning', 'incident');
        });
    }
    
    // --- Translation ---
    async loadTranslations(lang: string) {
        try {
            const response = await fetch(`https://sadak-sathi-translations.glitch.me/lang/${lang}`);
            if (!response.ok) throw new Error('Translation not found');
            this.translations = await response.json();
        } catch (error) {
            console.error(`Could not load translations for ${lang}:`, error);
            // Fallback to English if loading fails
            if (lang !== 'en') {
                await this.loadTranslations('en');
            }
        }
    }
    
    updateUIForLanguage() {
        document.querySelectorAll('[data-lang-key]').forEach(el => {
            const key = (el as HTMLElement).dataset.langKey!;
            const translation = this.translations[key];
            if (translation && typeof translation === 'string') {
                el.textContent = translation;
            }
        });
        document.querySelectorAll('[data-lang-key-placeholder]').forEach(el => {
            const key = (el as HTMLElement).dataset.langKeyPlaceholder!;
            const translation = this.translations[key];
            if (translation && typeof translation === 'string') {
                (el as HTMLInputElement).placeholder = translation;
            }
        });
        document.querySelectorAll('[data-lang-key-title]').forEach(el => {
            const key = (el as HTMLElement).dataset.langKeyTitle!;
            const translation = this.translations[key];
            if (translation && typeof translation === 'string') {
                (el as HTMLElement).title = translation;
            }
        });
        this.updatePersonalityDescription();
    }

    // --- AI Persona & Settings ---
    private saveAiSettings() {
        const settings = {
            avatarUrl: this.aiAvatarUrl,
            personality: this.aiPersonality,
            voice: this.aiVoice
        };
        localStorage.setItem('sadakSathiAiPersona', JSON.stringify(settings));
        this.showToast('AI persona settings saved!', 'success');
    }

    private handleAvatarChange(event: Event) {
        const input = event.target as HTMLInputElement;
        if (input.files && input.files[0]) {
            const reader = new FileReader();
            reader.onload = (e) => {
                this.aiAvatarUrl = e.target?.result as string;
                (document.getElementById('persona-avatar-preview') as HTMLImageElement).src = this.aiAvatarUrl;
                (document.getElementById('chat-ai-avatar') as HTMLImageElement).src = this.aiAvatarUrl;
                this.saveAiSettings();
            };
            reader.readAsDataURL(input.files[0]);
        }
    }

    private getSystemInstructionForPersonality(): string {
        const baseName = "Your name is Sadak Sathi.";
        switch (this.aiPersonality) {
            case 'formal':
                return `${baseName} You are a formal and precise assistant. Provide clear, concise, and accurate information.`;
            case 'guide':
                return `${baseName} You are an enthusiastic and knowledgeable travel guide for Nepal. Provide rich details about culture, history, and attractions.`;
            case 'buddy':
                return `${baseName} You are a calm, reliable, and friendly co-pilot. Focus on road safety, clear directions, and immediate hazards. Keep responses short and easy to understand while driving.`;
            case 'friendly':
            default:
                return `${baseName} You are a friendly, cheerful, and helpful road companion.`;
        }
    }
    
    private loadVoices() {
        // The 'voiceschanged' event is the reliable way to get voices.
        SpeechSynthesis.onvoiceschanged = () => {
            this.availableVoices = SpeechSynthesis.getVoices();
        };
        // For browsers that load them immediately
        this.availableVoices = SpeechSynthesis.getVoices();
    }

    private updatePersonalityDescription() {
        const personalitySelect = document.getElementById('persona-personality-select') as HTMLSelectElement;
        if (!personalitySelect) return;
        const personality = personalitySelect.value;
        const descriptionEl = document.getElementById('persona-personality-description') as HTMLParagraphElement;
        if (!descriptionEl) return;
    
        const descriptions: { [key: string]: { key: string, fallback: string } } = {
            friendly: { key: 'personality_desc_friendly', fallback: 'A cheerful and helpful road companion for general use.' },
            formal: { key: 'personality_desc_formal', fallback: 'A precise assistant providing clear, concise information.' },
            guide: { key: 'personality_desc_guide', fallback: 'An enthusiastic guide with rich details on culture and attractions.' },
            buddy: { key: 'personality_desc_buddy', fallback: 'A calm co-pilot focused on safety and clear directions.' },
        };
    
        const selectedPersonalityInfo = descriptions[personality] || descriptions['friendly'];
        const translation = this.translations[selectedPersonalityInfo.key];
    
        if (translation && typeof translation === 'string') {
            descriptionEl.textContent = translation;
        } else {
            descriptionEl.textContent = selectedPersonalityInfo.fallback;
        }
    }


    // --- Helpers ---
    private getLocalisedString(prop: any, fallback: string): string {
        // Rule 1: If prop is a string, number, or boolean, return it as a string.
        if (typeof prop === 'string' || typeof prop === 'number' || typeof prop === 'boolean') {
            return String(prop);
        }
    
        // Rule 2: If prop is NOT a plain object (e.g., null, undefined, array), return the fallback.
        if (typeof prop !== 'object' || prop === null || Array.isArray(prop)) {
            return fallback;
        }
    
        // Rule 3: Now we know prop is an object. Check for a translation in the current language.
        if (Object.prototype.hasOwnProperty.call(prop, this.currentLang)) {
            const translatedValue = prop[this.currentLang];
            // The translated value MUST be a primitive to be valid.
            if (typeof translatedValue === 'string' || typeof translatedValue === 'number' || typeof translatedValue === 'boolean') {
                return String(translatedValue);
            }
        }
    
        // Rule 4: If no valid translation was found, check for an English fallback.
        if (Object.prototype.hasOwnProperty.call(prop, 'en')) {
            const fallbackValue = prop['en'];
            // The fallback value MUST also be a primitive.
            if (typeof fallbackValue === 'string' || typeof fallbackValue === 'number' || typeof fallbackValue === 'boolean') {
                return String(fallbackValue);
            }
        }
        
        // Rule 5: If the object is not a translation object or contains non-primitive translations, return the fallback.
        return fallback;
    }
    
    cesiumPropertiesToJs(properties: any) {
        const jsObject: { [key: string]: any } = {};
        if (!properties) return jsObject;
        properties.propertyNames.forEach((name: string) => {
            jsObject[name] = properties[name].getValue();
        });
        return jsObject;
    }

    toggleModal(modalId: string, show: boolean) {
        document.getElementById(modalId)?.classList.toggle('hidden', !show);
    }

    toggleSettings(show: boolean) {
        document.getElementById('settings-panel')?.classList.toggle('open', show);
    }

    showToast(message: string, type: 'info' | 'success' | 'warning' | 'error' = 'info') {
        const toast = document.getElementById('toast-notification')!;
        const icon = document.getElementById('toast-icon')!;
        const messageEl = document.getElementById('toast-message')!;

        messageEl.textContent = message;
        toast.className = `hidden ${type}`; // Reset classes
        
        const icons = { info: 'info', success: 'check_circle', warning: 'warning', error: 'error' };
        icon.textContent = icons[type];
        
        toast.classList.remove('hidden');
        setTimeout(() => toast.classList.add('show'), 10); // Animate in

        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => toast.classList.add('hidden'), 500); // Wait for animation out
        }, 4000);
    }
}


// Initialize the app once the DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    new SadakSathiApp();
});