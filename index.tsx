

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

import { GoogleGenAI, Chat, Modality } from "@google/genai";

// Declare Cesium as a global variable to be used from the script tag.
declare var Cesium: any;

// Web Speech API
const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
const SpeechSynthesis = window.speechSynthesis;

const ROAD_DATA_URL = 'https://script.google.com/macros/s/AKfycbx6gmAt6XdIUqQstWfn1GdBTdAxXcsZkLwZ006ajJaCTRdlCgMzFa0Qw-di2IkKChxW/exec';

const NEPAL_BORDER_GEOJSON = { "type": "Polygon", "coordinates": [[[80.058, 28.986], [80.12, 28.422], [80.37, 28.42], [81.12, 28.78], [81.22, 28.98], [81.63, 29.1], [81.6, 29.43], [82.02, 29.43], [82.2, 29.6], [82.52, 29.58], [82.8, 29.75], [83.02, 29.45], [83.43, 29.12], [83.92, 28.73], [83.93, 28.23], [84.53, 27.85], [84.97, 27.72], [85.73, 27.93], [85.93, 28.07], [86.53, 27.88], [86.97, 27.88], [87.52, 27.65], [88.12, 27.35], [88.13, 27.05], [88.23, 26.85], [88.08, 26.58], [87.6, 26.38], [87.05, 26.47], [86.53, 26.63], [85.92, 26.63], [85.45, 26.73], [84.88, 26.65], [84.23, 26.85], [83.9, 27.1], [83.5, 27.28], [82.8, 27.45], [82.2, 27.5], [81.6, 27.6], [81.1, 27.7], [80.6, 27.9], [80.3, 28.1], [80.058, 28.986]]] };
const INITIAL_CAMERA_POSITION = { lon: 84.1240, lat: 28.3949, alt: 900000 };
const NEPAL_BOUNDING_RECTANGLE = Cesium.Rectangle.fromDegrees(80.0, 26.3, 88.2, 30.5);

const en_translations = {
    // Loading Screen
    "loading_initializing": "Initializing...",
    "loading_map": "Preparing the map...",
    "loading_voices": "Warming up AI voices...",
    "loading_data": "Fetching latest road data...",
    "loading_ui": "Assembling interface...",
    "loading_settings": "Loading your preferences...",
    "loading_complete": "All set! Welcome.",

    // Header
    "app_subtitle": "Your Smart Road Companion",
    "gps_searching": "GPS Status: Searching...",
    "toggle_dark_mode": "Toggle dark mode",
    
    // Language Selector
    "lang_cat_national": "National",
    "lang_cat_international": "International",

    // Map Controls
    "center_location": "Center on your location",
    "layers": "Data Layers",
    "roads": "Roads",
    "pois": "Points of Interest",
    "incidents": "Live Alerts",
    "buildings_3d": "3D Buildings/Terrain",
    "map_style_streets": "Streets",
    "map_style_satellite": "Satellite",
    "map_style_dark": "Dark",
    
    // Unified Search
    "unified_search_placeholder": "Search for a place or ask AI...",
    "current_location_label": "Your Current Location",
    "use_current_location": "Use Current Location",

    // Route Finder / Top Search
    "from_placeholder": "Choose starting point...",
    "to_placeholder": "Choose destination...",
    "voice_input_start": "Voice input for start location",
    "swap_locations": "Swap locations",
    "voice_input_end": "Voice input for destination",
    "find_route_btn": "Find Route",
    "clear_route_btn": "Clear",

    // Route Details
    "route_details": "Route Details",
    "close": "Close",
    "route_details_distance": "Distance",
    "route_details_time": "Est. Time",
    "route_prefs_used": "Route Preferences Used:",
    "route_details_directions": "Directions",
    "share_route": "Share route",
    "view_on_gmaps": "View on Google Maps",
    "start_navigation": "Start Navigation",
    "finding_best_routes": "Finding the best routes for you...",
    "route_summary_traffic_light": "Light traffic",
    "route_summary_traffic_moderate": "Some congestion",
    "route_summary_scenic": "Most scenic views",
    "route_summary_no_tolls": "Avoids all tolls",
    "route_summary_accident": "Rerouting around incident",

    // Detail Card Actions
    "directions_to_here": "Directions to here",
    "directions_from_here": "Directions from here",
    "safety_advisory": "Safety Advisory",
    "best_departure_time": "Best Departure Time",
    "tell_me_about_this_place": "Tell Me About This Place",

    // Settings Panel
    "app_settings": "App Settings",
    "ai_persona_title": "AI Persona",
    "change_ai_avatar": "Change AI Avatar",
    "ai_personality_label": "Personality",
    "personality_friendly": "Friendly",
    "personality_formal": "Formal",
    "personality_guide": "Travel Guide",
    "personality_buddy": "Driver's Buddy",
    "personality_desc_friendly": "A cheerful and helpful road companion for general use.",
    "personality_desc_formal": "A precise assistant providing clear, concise information.",
    "personality_desc_guide": "An enthusiastic guide with rich details on culture and attractions.",
    "personality_desc_buddy": "A calm co-pilot focused on safety and clear directions.",
    "ai_relationship_label": "Relationship",
    "relationship_friend": "Friend",
    "relationship_partner": "Partner",
    "relationship_husband": "Husband",
    "relationship_wife": "Wife",
    "ai_voice_label": "Voice",
    "voice_female": "Female",
    "voice_male": "Male",
    "voice_neutral": "Neutral",
    "preferences_title": "Preferences",
    "ai_voice_response": "AI Voice Response",
    "route_preferences": "Route Preferences",
    "prefer_highways": "Prefer Highways",
    "avoid_tolls": "Avoid Tolls",
    "prefer_scenic_route": "Prefer Scenic Route",

    // AI Chat
    "ai_chat_title": "AI Chat",
    "ask_about_location": "Ask about this location",
    "close_chat": "Close chat",
    "use_microphone": "Use Microphone",
    "ai_chat_placeholder": "Ask Sadak Sathi...",
    "send_message": "Send Message",
    "ai_welcome_message": "Hello! I'm Sadak Sathi, your road companion. How can I assist you today? Ask me about road conditions, points of interest, or help you find a route.",
    "ai_error_message": "Sorry, I encountered an error. Please try again.",
    "ai_unavailable_message": "AI features are currently unavailable. Please check the configuration.",
    "speech_recognition_error": "Speech recognition error",

    // Incident Reporting
    "report_incident_title": "Report New Road Incident",
    "report_location_unavailable": "Your current location is not available. Please enable GPS to report an incident.",
    "location": "Location",
    "current_location": "Using Current Location",
    "incident_type": "Type of Incident",
    "incident_type_accident": "Accident",
    "incident_type_roadblock": "Roadblock",
    "incident_type_construction": "Construction",
    "incident_type_hazard": "Hazard",
    "incident_type_traffic": "Traffic Jam",
    "incident_type_other": "Other",
    "description": "Description (Optional)",
    "incident_desc_placeholder": "Add more details...",
    "submit_report": "Submit Report",

    // FAB Menu
    "profile": "Profile",
    "main_menu": "Main Menu",
    "find_my_car_title": "Find My Car",

    // Find My Car Modal
    "find_my_car_modal_title": "Find My Car",
    "car_location_not_saved": "You haven't saved your car's location yet.",
    "park_here": "Park Here",
    "car_location_saved_at": "Your car is parked at:",
    "fetching_address": "Fetching address...",
    "get_directions": "Get Directions",
    "clear_location": "Clear Location",
    "car_location_saved_toast": "Car location saved!",
    "car_location_cleared_toast": "Car location cleared.",
    "no_user_location_for_parking": "Your current location is not available. Cannot save parking spot.",
    "route_to_my_car": "My Parked Car",
};

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
    private travelTimeDataSource: any;
    private carLocationDataSource: any;
    private userLocationEntity: any = null;
    private userLocation: { lon: number, lat: number } | null = null;
    private isChatOpen: boolean = false;
    private chatHistory: { role: string, parts: { text: string }[] }[] = [];
    private recognition: any;
    private isRecognizing: boolean = false;
    private currentLang: string = 'en';
    private translations: any = {};
    private ipCamUrl: string = '';
    private activeVoiceContext: string = 'none'; // 'chat', 'unified-search', etc.

    // AI Integration
    private ai: GoogleGenAI | null = null;
    private chat: Chat | null = null;
    
    // AI Persona State
    private aiAvatarUrl: string = 'https://i.imgur.com/r33W56s.png';
    private aiPersonality: string = 'friendly';
    private aiRelationship: string = 'friend';
    private aiVoice: string = 'female';
    private availableVoices: SpeechSynthesisVoice[] = [];

    // 3D View State
    private worldTerrainProvider: any;
    private osmBuildings: any | null = null;
    
    // Loading Screen State
    private loadingOverlay: HTMLElement;
    private loadingMessage: HTMLElement;

    // Geolocation State
    private isGeolocationActive: boolean = false;
    private hasRequestedGeolocation: boolean = false;
    private hasRequestedMicrophone: boolean = false;

    // Context State
    private selectedEntityContext: any = null;
    
    private activeRouteData: any | null = null;
    private availableRoutes: any[] = [];

    // Incident Report Image State
    private originalIncidentImage: { data: string, mimeType: string } | null = null;
    private refinedIncidentImage: { data: string, mimeType: string } | null = null;

    // Travel Time State
    private isPickingTravelTimeOrigin: boolean = false;
    private travelTimeOrigin: { lon: number, lat: number } | null = null;
    
    // Find My Car State
    private carLocation: { lon: number, lat: number } | null = null;

    // --- NEW: Route Visualization Constants ---
    private readonly routeColorMap = {
        fastest: Cesium.Color.fromCssColorString('#2ecc71'),
        alternative: Cesium.Color.fromCssColorString('#3498db'),
        scenic: Cesium.Color.fromCssColorString('#9b59b6'),
        'toll-free': Cesium.Color.fromCssColorString('#f39c12')
    };

    private readonly activeRouteMaterial = (color: any) => new Cesium.PolylineGlowMaterialProperty({
        glowPower: 0.3,
        taperPower: 0.5,
        color: color.withAlpha(1.0)
    });

    private readonly inactiveRouteMaterial = (color: any) => new Cesium.ColorMaterialProperty(color.withAlpha(0.4));


    constructor() {
        this.loadingOverlay = document.getElementById('loading-overlay')!;
        this.loadingMessage = document.getElementById('loading-message')!;
        this.init();
    }

    async init() {
        this.updateLoadingProgress(10, 'loading_initializing');

        // --- Safe AI Initialization ---
        if (process.env.API_KEY) {
            try {
                this.ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
            } catch (error) {
                console.error("Failed to initialize GoogleGenAI. AI features will be disabled.", error);
                this.ai = null;
            }
        } else {
            console.warn("API_KEY environment variable not set. AI features are disabled.");
            this.ai = null;
        }

        await this.loadTranslations(this.currentLang);
        this.updateUIForLanguage();
        this.updateLoadingProgress(20, 'loading_map');
        
        await this.initCesium();
        this.updateLoadingProgress(40, 'loading_voices');

        this.loadVoices();
        this.updateLoadingProgress(60, 'loading_data');
        
        await this.loadInitialData();
        this.updateLoadingProgress(80, 'loading_ui');
        
        this.setupEventListeners();
        
        this.updateLoadingProgress(95, 'loading_settings');
        this.loadSettings();
        
        this.restoreLastRoute();

        this.updateAiFeatureUiState();

        this.updateLoadingProgress(100, 'loading_complete');

        setTimeout(() => {
            this.hideLoadingScreen();
        }, 500);
    }

    updateLoadingProgress(percentage: number, messageKey: string) {
        const message = this.safeStringify(this.translations[messageKey], messageKey.replace(/_/g, ' '));
        this.loadingMessage.textContent = message;
    }

    hideLoadingScreen() {
        this.loadingOverlay.classList.add('hidden-fade');
        setTimeout(() => {
            this.loadingOverlay.style.display = 'none';
        }, 700);
    }

    async initCesium() {
        Cesium.Ion.defaultAccessToken = 'eyJhbGciOiJIJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiI0YjFjNGFjMS1iMjExLTQyYWMtOTFkYy0wMDYxZGU5Y2QyYTMiLCJpZCI6MjI2NTg0LCJpYXQiOjE3MjExNTg4MDB9.sA-1z4P-6A8f6UgtMNQ8qfIq_v2O-u3a3e-rcQoTbow';
    
        try {
            // --- HYPER-ROBUST MAP INITIALIZATION ---
    
            // 1. GUARANTEE A 2D MAP IS SHOWN IMMEDIATELY.
            // Create the viewer with a fast, reliable, built-in 2D map provider.
            // This ensures the map widget renders instantly and is never blank.
            this.viewer = new Cesium.Viewer('map', {
                imageryProvider: new Cesium.OpenStreetMapImageryProvider(),
                terrainProvider: new Cesium.EllipsoidTerrainProvider(), // Start with a simple, fast 2D ellipsoid.
                geocoder: false, homeButton: false, sceneModePicker: false, baseLayerPicker: false,
                navigationHelpButton: false, animation: false, timeline: false, fullscreenButton: false,
                infoBox: false, selectionIndicator: false,
            });
    
            // 2. Set up camera and other initial settings now that the map is visible.
            this.viewer.camera.flyTo({ destination: Cesium.Cartesian3.fromDegrees(INITIAL_CAMERA_POSITION.lon, INITIAL_CAMERA_POSITION.lat, INITIAL_CAMERA_POSITION.alt) });
            this.viewer.camera.constrainedAxis = Cesium.Cartesian3.UNIT_Z;
            this.viewer.scene.screenSpaceCameraController.minimumZoomDistance = 100;
            this.viewer.scene.screenSpaceCameraController.maximumZoomDistance = 2000000;
            this.viewer.camera.setView({ destination: NEPAL_BOUNDING_RECTANGLE });
    
            // 3. If 3D is enabled, load the heavy assets in the background. The user already sees a 2D map.
            const is3dEnabled = localStorage.getItem('sadakSathi3dView') === 'true';
            (document.getElementById('toggle-3d') as HTMLInputElement).checked = is3dEnabled;
            if (is3dEnabled) {
                this.load3dAssetsInBackground();
            }
    
            // --- END OF ROBUST INITIALIZATION ---
    
            // Initialize data sources
            this.roadDataSource = new Cesium.GeoJsonDataSource('roads');
            this.poiDataSource = new Cesium.GeoJsonDataSource('pois');
            this.incidentDataSource = new Cesium.GeoJsonDataSource('incidents');
            this.routeDataSource = new Cesium.GeoJsonDataSource('route');
            this.travelTimeDataSource = new Cesium.CustomDataSource('travelTime');
            this.carLocationDataSource = new Cesium.CustomDataSource('carLocation');
            this.viewer.dataSources.add(this.roadDataSource);
            this.viewer.dataSources.add(this.poiDataSource);
            this.viewer.dataSources.add(this.incidentDataSource);
            this.viewer.dataSources.add(this.routeDataSource);
            this.viewer.dataSources.add(this.travelTimeDataSource);
            this.viewer.dataSources.add(this.carLocationDataSource);
    
            document.querySelector(`.style-option[data-style="streets"]`)?.classList.add('active');
            
        } catch (error) {
            console.error("CRITICAL: Cesium Viewer failed to initialize.", error);
            const mapDiv = document.getElementById('map')!;
            mapDiv.innerHTML = `<div style="padding: 2rem; text-align: center; color: var(--danger-color);">
                <h2>Map Failed to Load</h2>
                <p>There was a critical error initializing the map. Please check your browser compatibility and network connection, then refresh the page.</p>
            </div>`;
            this.hideLoadingScreen(); // Hide loading screen to show the error
        }
    }

    async loadInitialData() {
        try {
            const response = await fetch(ROAD_DATA_URL);
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            const data = await response.json();
            this.allRoadData = data.data;
            this.processAndDisplayData(this.allRoadData);
            this.loadLocalIncidents();
        } catch (error) {
            console.error('Error fetching road data:', error);
            this.showToast('Failed to load road data.', 'error');
        }
    }

    processAndDisplayData(data: any[]) {
        const roadFeatures: any[] = [], poiFeatures: any[] = [], incidentFeatures: any[] = [];
        if (!Array.isArray(data)) {
            console.error("Received non-array data for processing:", data);
            return;
        }
        data.forEach(road => {
            // Ensure the road object and its geometry are valid before processing
            if (road && road.geometry) {
                roadFeatures.push({ type: 'Feature', geometry: road.geometry, properties: { name: road.name, status: road.status, type: 'road', details: road.details, last_updated: road.last_updated, road_code: road.road_code, pavement_type: road.pavement_type, toll_free: road.toll_free, bridge_info: road.bridge_info, user_reported: road.user_reported, source: road.source } });
            }

            // Safely process points of interest
            if (Array.isArray(road.points_of_interest)) {
                road.points_of_interest.forEach((poi: any) => {
                    if (poi && typeof poi.lon === 'number' && typeof poi.lat === 'number') {
                        poiFeatures.push({ type: 'Feature', geometry: { type: 'Point', coordinates: [poi.lon, poi.lat] }, properties: { ...poi, type: 'poi', entityType: 'poi' } });
                    }
                });
            }
            
            // Safely process incidents
            if (Array.isArray(road.incidents)) {
                road.incidents.forEach((incident: any) => {
                    if (incident && typeof incident.lon === 'number' && typeof incident.lat === 'number') {
                        incidentFeatures.push({ type: 'Feature', geometry: { type: 'Point', coordinates: [incident.lon, incident.lat] }, properties: { ...incident, type: 'incident', entityType: 'incident' } });
                    }
                });
            }
        });
        this.loadDataIntoSource(this.roadDataSource, { type: 'FeatureCollection', features: roadFeatures });
        this.loadDataIntoSource(this.poiDataSource, { type: 'FeatureCollection', features: poiFeatures });
        this.loadDataIntoSource(this.incidentDataSource, { type: 'FeatureCollection', features: incidentFeatures });
        this.styleDataSources();
    }

    loadDataIntoSource(dataSource: any, geojson: any) {
        dataSource.load(geojson).catch((error: any) => console.error(`Error loading data into source ${dataSource.name}:`, error));
    }

    styleDataSources() {
        this.roadDataSource.entities.values.forEach((entity: any) => {
            entity.polyline.width = 5;
            entity.polyline.material = this.getRoadColor(entity.properties.status?.getValue(this.viewer.clock.currentTime));
            entity.polyline.clampToGround = true;
        });
        this.poiDataSource.entities.values.forEach((entity: any) => {
            const style = this.getIconStyleForPoi(entity.properties.category?.getValue(this.viewer.clock.currentTime));
            this.styleEntityAsBillboard(entity, style.icon, style.color);
        });
        this.incidentDataSource.entities.values.forEach((entity: any) => this.styleEntityAsBillboard(entity, 'warning', '#e74c3c'));
    }

    styleEntityAsBillboard(entity: any, icon: string, color: string) {
        entity.billboard = new Cesium.BillboardGraphics({
            image: this.getIconCanvas(icon, color),
            width: 32, height: 32, verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
            disableDepthTestDistance: Number.POSITIVE_INFINITY
        });
    }

    getRoadColor(status: any) {
        const statusString = this.getDisplayablePropertyValue(status, 'unknown').toLowerCase();
        switch (statusString) {
            case 'open': case 'resumed': return Cesium.Color.fromCssColorString('#2ecc71');
            case 'blocked': return Cesium.Color.fromCssColorString('#e74c3c');
            case 'restricted': case 'one-lane': return Cesium.Color.fromCssColorString('#f39c12');
            case 'construction': return Cesium.Color.fromCssColorString('#e67e22');
            default: return Cesium.Color.fromCssColorString('#95a5a6');
        }
    }

    getIconStyleForPoi(category: any): { icon: string, color: string } {
        const cat = this.getDisplayablePropertyValue(category, '').toLowerCase();
        if (cat.includes('fuel') || cat.includes('petrol')) return { icon: 'local_gas_station', color: '#34495e' };
        if (cat.includes('food') || cat.includes('hotel')) return { icon: 'restaurant', color: '#e67e22' };
        if (cat.includes('atm')) return { icon: 'atm', color: '#27ae60' };
        if (cat.includes('hospital') || cat.includes('health')) return { icon: 'local_hospital', color: '#c0392b' };
        if (cat.includes('police')) return { icon: 'local_police', color: '#2980b9' };
        if (cat.includes('mechanic')) return { icon: 'build', color: '#7f8c8d' };
        if (cat.includes('viewpoint')) return { icon: 'camera_alt', color: '#8e44ad' };
        if (cat.includes('parking')) return { icon: 'local_parking', color: '#2980b9' };
        return { icon: 'place', color: '#3498db' };
    }
    
    getIconCanvas(iconName: string, color: string): HTMLCanvasElement {
        const canvas = document.createElement('canvas');
        canvas.width = 48; canvas.height = 48;
        const ctx = canvas.getContext('2d')!;
        ctx.fillStyle = color;
        ctx.beginPath(); ctx.arc(24, 24, 22, 0, Math.PI * 2); ctx.fill();
        ctx.strokeStyle = 'white'; ctx.lineWidth = 2; ctx.stroke();
        ctx.font = '28px "Material Icons"';
        ctx.fillStyle = 'white'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
        ctx.fillText(iconName, 24, 24);
        return canvas;
    }

    setupEventListeners() {
        document.getElementById('theme-toggle')?.addEventListener('click', () => this.toggleTheme());
        document.getElementById('live-cam-btn')?.addEventListener('click', () => this.toggleLiveCamPanel(true));
        
        const langSelectorBtn = document.getElementById('language-selector-btn');
        const langPopup = document.getElementById('language-popup');
        langSelectorBtn?.addEventListener('click', (e) => {
            e.stopPropagation();
            langPopup?.classList.toggle('hidden');
        });

        document.querySelectorAll('.lang-category-header').forEach(header => {
            header.addEventListener('click', () => {
                const parent = header.parentElement;
                const list = parent?.querySelector('.lang-options-list');
                const icon = header.querySelector('.expand-icon');
                if (parent?.classList.contains('open')) {
                    parent.classList.remove('open');
                    icon!.textContent = 'chevron_right';
                } else {
                    document.querySelectorAll('.lang-category.open').forEach(openCat => {
                        openCat.classList.remove('open');
                        openCat.querySelector('.expand-icon')!.textContent = 'chevron_right';
                    });
                    parent?.classList.add('open');
                    icon!.textContent = 'expand_more';
                }
            });
        });

        document.querySelectorAll('.lang-option').forEach(option => {
            option.addEventListener('click', async (e) => {
                const lang = (e.currentTarget as HTMLElement).dataset.lang;
                if (lang) {
                    this.currentLang = lang;
                    await this.loadTranslations(lang);
                    this.updateUIForLanguage();
                    langPopup?.classList.add('hidden');
                }
            });
        });

        document.getElementById('zoom-in-btn')?.addEventListener('click', () => this.viewer.camera.zoomIn());
        document.getElementById('zoom-out-btn')?.addEventListener('click', () => this.viewer.camera.zoomOut());
        document.getElementById('center-location-btn')?.addEventListener('click', () => this.centerOnUserLocation());

        const mapOptionsBtn = document.getElementById('map-options-btn');
        const mapOptionsPopup = document.getElementById('map-options-popup');
        mapOptionsBtn?.addEventListener('click', (e) => {
            e.stopPropagation();
            mapOptionsPopup?.classList.toggle('hidden');
        });

        document.getElementById('toggle-roads')?.addEventListener('change', (e) => this.toggleDataSourceVisibility('roads', (e.target as HTMLInputElement).checked));
        document.getElementById('toggle-pois')?.addEventListener('change', (e) => this.toggleDataSourceVisibility('pois', (e.target as HTMLInputElement).checked));
        document.getElementById('toggle-incidents')?.addEventListener('change', (e) => this.toggleDataSourceVisibility('incidents', (e.target as HTMLInputElement).checked));
        document.getElementById('toggle-3d')?.addEventListener('change', (e) => this.toggle3DView((e.target as HTMLInputElement).checked));
        
        document.querySelectorAll('.style-option').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const style = (e.currentTarget as HTMLElement).dataset.style;
                if(style) {
                    this.changeMapStyle(style);
                    document.querySelectorAll('.style-option').forEach(b => b.classList.remove('active'));
                    (e.currentTarget as HTMLElement).classList.add('active');
                }
            });
        });

        document.getElementById('detail-card-close')?.addEventListener('click', () => this.hideDetailCard());
        document.getElementById('close-cam-btn')?.addEventListener('click', () => this.toggleLiveCamPanel(false));
        document.getElementById('save-ip-cam-btn')?.addEventListener('click', () => this.saveIpCamUrl());

        // Unified Search Bar
        document.getElementById('unified-search-ai-btn')?.addEventListener('click', () => this.openChat());
        document.getElementById('unified-search-voice-btn')?.addEventListener('click', () => this.startVoiceCommand('unified-search'));
        document.getElementById('unified-search-action-btn')?.addEventListener('click', () => this.performSearch());
        document.getElementById('unified-search-input')?.addEventListener('keyup', (e) => { if(e.key === 'Enter') this.performSearch() });

        // Route Finder
        document.getElementById('find-route-btn')?.addEventListener('click', () => this.findRoute());
        document.getElementById('clear-route-btn')?.addEventListener('click', () => this.clearRoute());
        document.getElementById('swap-locations-btn')?.addEventListener('click', () => this.swapRouteLocations());

        // Route Details
        document.getElementById('route-details-close')?.addEventListener('click', () => this.hideRouteDetails());
        document.getElementById('start-navigation-btn')?.addEventListener('click', () => this.startNavigation());


        // AI Chat
        document.getElementById('close-chat-btn')?.addEventListener('click', () => this.closeChat());
        document.getElementById('chat-form')?.addEventListener('submit', (e) => this.handleChatMessage(e));
        document.getElementById('voice-command-btn')?.addEventListener('click', () => this.startVoiceCommand('chat'));
        document.getElementById('context-chat-btn')?.addEventListener('click', () => this.askAboutContext());
        
        // Settings Panel
        document.getElementById('persona-avatar-upload')?.addEventListener('change', (e) => this.handleAvatarChange(e));
        document.getElementById('persona-personality-select')?.addEventListener('change', (e) => {
            this.aiPersonality = (e.target as HTMLSelectElement).value;
            this.updatePersonalityDescription();
            this.saveSettings();
            this.resetChat();
        });
        document.getElementById('persona-relationship-select')?.addEventListener('change', (e) => {
            this.aiRelationship = (e.target as HTMLSelectElement).value;
            this.saveSettings();
            this.resetChat();
        });
        document.getElementById('persona-voice-select')?.addEventListener('change', (e) => {
            this.aiVoice = (e.target as HTMLSelectElement).value;
            this.saveSettings();
        });
        document.getElementById('toggle-voice-response')?.addEventListener('change', () => this.saveSettings());
        document.getElementById('pref-highways')?.addEventListener('change', () => this.saveSettings());
        document.getElementById('pref-no-tolls')?.addEventListener('change', () => this.saveSettings());
        document.getElementById('pref-scenic')?.addEventListener('change', () => this.saveSettings());
        
        // FAB Menu
        document.getElementById('fab-main-btn')?.addEventListener('click', (e) => {
            (e.currentTarget as HTMLElement).classList.toggle('open');
            document.getElementById('fab-menu-items')?.classList.toggle('hidden');
        });
        document.getElementById('fab-ai-btn')?.addEventListener('click', () => this.openChat());
        document.getElementById('fab-settings-btn')?.addEventListener('click', () => document.getElementById('settings-panel')?.classList.add('open'));
        document.getElementById('fab-profile-btn')?.addEventListener('click', () => this.showToast('Profile feature coming soon!', 'info'));
        document.getElementById('fab-find-car-btn')?.addEventListener('click', () => this.openFindCarModal());

        // Incident Reporting
        document.getElementById('report-incident-fab')?.addEventListener('click', () => this.openReportIncidentModal());
        document.getElementById('report-incident-close')?.addEventListener('click', () => document.getElementById('report-incident-modal')?.classList.add('hidden'));
        document.getElementById('report-incident-form')?.addEventListener('submit', (e) => this.handleIncidentReportSubmit(e));
        document.getElementById('incident-image-upload')?.addEventListener('change', (e) => this.handleIncidentImageUpload(e));
        document.getElementById('refine-image-btn')?.addEventListener('click', () => this.handleImageRefinement());
        
        // Travel Time
        document.getElementById('travel-time-btn')?.addEventListener('click', () => this.toggleTravelTimePanel(true));
        document.getElementById('travel-time-close-btn')?.addEventListener('click', () => this.toggleTravelTimePanel(false));
        document.getElementById('travel-time-use-current-loc')?.addEventListener('click', () => this.setTravelTimeOriginFromUserLocation());
        document.getElementById('travel-time-pick-on-map')?.addEventListener('click', () => this.handlePickTravelTimeOrigin());
        document.getElementById('generate-travel-time-map-btn')?.addEventListener('click', () => this.handleGenerateTravelTimeMap());
        document.getElementById('clear-travel-time-map-btn')?.addEventListener('click', () => this.handleClearTravelTimeMap());

        // Find My Car
        document.getElementById('find-car-close-btn')?.addEventListener('click', () => document.getElementById('find-car-modal')?.classList.add('hidden'));
        document.getElementById('park-here-btn')?.addEventListener('click', () => this.saveCarLocation());
        document.getElementById('get-directions-to-car-btn')?.addEventListener('click', () => this.routeToCar());
        document.getElementById('clear-car-location-btn')?.addEventListener('click', () => this.clearCarLocation());

        // Permission Modal
        document.getElementById('permission-modal-close-btn')?.addEventListener('click', () => document.getElementById('permission-help-modal')?.classList.add('hidden'));

        // Global listeners
        document.addEventListener('click', (e) => {
            if (!langSelectorBtn?.contains(e.target as Node) && !langPopup?.contains(e.target as Node)) {
                langPopup?.classList.add('hidden');
            }
            if (!mapOptionsBtn?.contains(e.target as Node) && !mapOptionsPopup?.contains(e.target as Node)) {
                mapOptionsPopup?.classList.add('hidden');
            }
        });

        // Cesium click handler
        const handler = new Cesium.ScreenSpaceEventHandler(this.viewer.scene.canvas);
        handler.setInputAction((movement: any) => {
            if (this.isPickingTravelTimeOrigin) {
                const cartesian = this.viewer.camera.pickEllipsoid(movement.position, this.viewer.scene.globe.ellipsoid);
                if (cartesian) {
                    this.setTravelTimeOrigin(cartesian);
                }
            } else {
                const pickedObject = this.viewer.scene.pick(movement.position);
                if (Cesium.defined(pickedObject) && Cesium.defined(pickedObject.id)) {
                    this.handleEntityClick(pickedObject.id);
                } else {
                    this.hideDetailCard();
                }
            }
        }, Cesium.ScreenSpaceEventType.LEFT_CLICK);
        
        this.initSpeechRecognition();
        this.startGeolocation();
    }

    // --- UI & State Management ---

    toggleTheme() {
        const container = document.getElementById('app-container')!;
        const themeIcon = document.querySelector('#theme-toggle .material-icons')!;
        if (container.dataset.theme === 'dark') {
            container.dataset.theme = 'light';
            themeIcon.textContent = 'light_mode';
            localStorage.setItem('sadakSathiTheme', 'light');
        } else {
            container.dataset.theme = 'dark';
            themeIcon.textContent = 'dark_mode';
            localStorage.setItem('sadakSathiTheme', 'dark');
        }
    }

    toggleLiveCamPanel(show: boolean) {
        document.getElementById('live-cam-panel')?.classList.toggle('hidden', !show);
    }
    
    saveIpCamUrl() {
        const input = document.getElementById('admin-ip-cam-url') as HTMLInputElement;
        this.ipCamUrl = input.value;
        localStorage.setItem('sadakSathiIpCamUrl', this.ipCamUrl);
        this.showToast('IP Camera URL saved!', 'success');
        document.getElementById('admin-panel-modal')?.classList.add('hidden');
    }
    
    async loadTranslations(lang: string) {
        if (lang === 'en') {
            this.translations = en_translations;
            return;
        }
        try {
            // In a real app, this would fetch from a server: `/${lang}.json`
            // For now, we'll just show a message.
            this.showToast(`Translation for ${lang} not available yet.`, 'info');
            this.translations = en_translations; // Fallback to English
        } catch (error) {
            console.error(`Failed to load translations for ${lang}`, error);
            this.translations = en_translations; // Fallback to English
        }
    }

    updateUIForLanguage() {
        document.querySelectorAll('[data-lang-key]').forEach(el => {
            const key = el.getAttribute('data-lang-key')!;
            if (this.translations[key]) {
                el.textContent = this.translations[key];
            }
        });
         document.querySelectorAll('[data-lang-key-placeholder]').forEach(el => {
            const key = el.getAttribute('data-lang-key-placeholder')!;
            if (this.translations[key]) {
                (el as HTMLInputElement).placeholder = this.translations[key];
            }
        });
        document.querySelectorAll('[data-lang-key-title]').forEach(el => {
            const key = el.getAttribute('data-lang-key-title')!;
            if (this.translations[key]) {
                (el as HTMLElement).title = this.translations[key];
            }
        });
        document.querySelectorAll('[data-lang-key-aria-label]').forEach(el => {
            const key = el.getAttribute('data-lang-key-aria-label')!;
            if (this.translations[key]) {
                el.setAttribute('aria-label', this.translations[key]);
            }
        });
    }

    toggleDataSourceVisibility(sourceName: string, isVisible: boolean) {
        const dataSource = (this as any)[`${sourceName}DataSource`];
        if (dataSource) {
            dataSource.show = isVisible;
        }
    }
    
    toggle3DView(enable: boolean) {
        localStorage.setItem('sadakSathi3dView', String(enable));
        if (enable) {
            // Asynchronously load and apply 3D assets.
            // This function is designed to be called multiple times; it will only load assets once.
            this.load3dAssetsInBackground();
        } else { // Disabling 3D
            this.viewer.terrainProvider = new Cesium.EllipsoidTerrainProvider();
            if (this.osmBuildings) {
                this.osmBuildings.show = false;
            }
        }
    }

    async load3dAssetsInBackground() {
        // Load terrain, only if not already loaded
        if (!this.worldTerrainProvider) {
            try {
                this.worldTerrainProvider = await Cesium.createWorldTerrainAsync();
            } catch (error) {
                console.error("Failed to load Cesium World Terrain. 3D view will be terrain-less.", error);
                this.showToast('3D terrain failed to load.', 'warning');
            }
        }
        // Apply the loaded terrain provider if it exists
        if (this.worldTerrainProvider) {
            this.viewer.terrainProvider = this.worldTerrainProvider;
        }

        // Load buildings, only if not already loaded
        if (!this.osmBuildings) {
            try {
                this.osmBuildings = await Cesium.createOsmBuildingsAsync();
                this.viewer.scene.primitives.add(this.osmBuildings);
            } catch (error) {
                console.error("Failed to load OSM Buildings:", error);
                this.showToast("Could not load 3D buildings.", "warning");
            }
        }
        // Ensure buildings are shown if they exist
        if (this.osmBuildings) {
            this.osmBuildings.show = true;
        }
    }
    
    async changeMapStyle(style: string) {
        this.viewer.imageryLayers.removeAll();
        let newProvider;
        try {
            if (style === 'satellite') {
                newProvider = await Cesium.createWorldImageryAsync();
            } else if (style === 'dark') {
                newProvider = await Cesium.IonImageryProvider.fromAssetId(3812);
            } else { // streets
                newProvider = new Cesium.OpenStreetMapImageryProvider();
            }
            this.viewer.imageryLayers.addImageryProvider(newProvider);
        } catch (error) {
            console.error(`Failed to switch map style to ${style}:`, error);
            this.showToast(`Failed to load ${style} map style.`, 'error');
        }
    }

    showDetailCard(entity: any) {
        const card = document.getElementById('detail-card')!;
        const titleEl = document.getElementById('detail-card-title')!;
        const contentEl = document.getElementById('detail-card-content')!;
        const actionsEl = document.getElementById('detail-card-actions')!;
        const props = entity.properties.getValue(this.viewer.clock.currentTime);

        this.selectedEntityContext = props;
        
        let contentHtml = '';
        titleEl.textContent = this.getDisplayablePropertyValue(props.name, 'Details');

        if (props.entityType === 'poi') {
            contentHtml = `
                <p><strong>Category:</strong> ${this.getDisplayablePropertyValue(props.category, 'N/A')}</p>
                <p><strong>Description:</strong> ${this.getDisplayablePropertyValue(props.description, 'No description available.')}</p>
            `;
        } else if (props.entityType === 'incident') {
             const incidentType = this.getDisplayablePropertyValue(props.incident_type, 'N/A');
             contentHtml = `
                <p><strong>Type:</strong> <span class="status-${incidentType.toLowerCase()}">${incidentType}</span></p>
                <p><strong>Details:</strong> ${this.getDisplayablePropertyValue(props.details, 'No details provided.')}</p>
                <p><strong>Reported:</strong> ${new Date(props.timestamp).toLocaleString()}</p>
            `;
        } else { // road
            const roadStatus = this.getDisplayablePropertyValue(props.status, 'N/A');
            contentHtml = `
                <p><strong>Status:</strong> <span class="status-${roadStatus.toLowerCase()}">${roadStatus}</span></p>
                <p><strong>Details:</strong> ${this.getDisplayablePropertyValue(props.details, 'No additional details.')}</p>
                <p><strong>Pavement:</strong> ${this.getDisplayablePropertyValue(props.pavement_type, 'N/A')}</p>
                <p><strong>Last Updated:</strong> ${this.getDisplayablePropertyValue(props.last_updated, 'N/A')}</p>
            `;
        }
        
        contentEl.innerHTML = contentHtml;
        actionsEl.innerHTML = `
            <button class="travel-mode-btn" id="dc-dir-to"><span class="material-icons">directions</span><span>${this.translations.directions_to_here}</span></button>
            <button class="travel-mode-btn" id="dc-dir-from"><span class="material-icons">directions_from</span><span>${this.translations.directions_from_here}</span></button>
            <button class="travel-mode-btn" id="dc-ask-ai"><span class="material-icons">auto_awesome</span><span>${this.translations.tell_me_about_this_place}</span></button>
        `;
        
        document.getElementById('dc-dir-to')?.addEventListener('click', () => this.handleDirectionsTo(entity));
        document.getElementById('dc-dir-from')?.addEventListener('click', () => this.handleDirectionsFrom(entity));
        document.getElementById('dc-ask-ai')?.addEventListener('click', () => this.askAboutContext(true));

        card.classList.add('visible');
    }

    hideDetailCard() {
        document.getElementById('detail-card')?.classList.remove('visible');
        this.selectedEntityContext = null;
    }

    handleEntityClick(entity: any) {
        this.viewer.flyTo(entity, {
            duration: 1.0,
            offset: new Cesium.HeadingPitchRange(0, -Cesium.Math.PI_OVER_FOUR, entity.billboard ? 2000 : 5000)
        });
        this.showDetailCard(entity);
    }
    
    showToast(message: string, type: 'info' | 'success' | 'warning' | 'error' = 'info') {
        const toast = document.getElementById('toast-notification')!;
        const icon = document.getElementById('toast-icon')!;
        const messageEl = document.getElementById('toast-message')!;

        toast.className = 'hidden'; // Reset classes
        toast.classList.add(type);
        messageEl.textContent = message;

        switch (type) {
            case 'success': icon.textContent = 'check_circle'; break;
            case 'warning': icon.textContent = 'warning'; break;
            case 'error': icon.textContent = 'error'; break;
            default: icon.textContent = 'info'; break;
        }

        toast.classList.add('show');
        setTimeout(() => {
            toast.classList.remove('show');
        }, 4000);
    }

    getDisplayablePropertyValue(value: any, fallback: string = ''): string {
        // Handles Cesium's Property objects
        if (value && typeof value.getValue === 'function') {
            value = value.getValue(this.viewer.clock.currentTime);
        }
        
        if (value === null || typeof value === 'undefined') {
            return fallback;
        }
        
        // Handles cases where the value is an object, like { _value: "Open" }
        if (typeof value === 'object' && value !== null && value.hasOwnProperty('_value')) {
            return String(value._value);
        }
        
        // Handles cases where the value might be a plain object with a text property
        if (typeof value === 'object' && value !== null) {
            const potentialKeys = ['name', 'label', 'text', 'title'];
            for (const key of potentialKeys) {
                if (typeof value[key] === 'string' || typeof value[key] === 'number') {
                    return String(value[key]);
                }
            }
            // If no simple property is found, avoid returning [object Object]
            return fallback;
        }
        
        return String(value);
    }

    private safeStringify(value: any, fallback: string): string {
        if (value === null || typeof value === 'undefined' || value === '') {
            return fallback;
        }
        return String(value);
    }

    // --- Geolocation ---

    startGeolocation() {
        if (!this.hasRequestedGeolocation) {
            this.hasRequestedGeolocation = true;
            if (navigator.geolocation) {
                navigator.geolocation.watchPosition(
                    (position) => this.updateUserLocation(position),
                    (error) => {
                        console.warn('Geolocation error:', error);
                        this.showToast('Could not get your location.', 'warning');
                        this.isGeolocationActive = false;
                        document.getElementById('gps-status-indicator')?.classList.remove('active');
                    },
                    { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
                );
            } else {
                this.showToast('Geolocation is not supported by this browser.', 'error');
            }
        }
    }

    updateUserLocation(position: GeolocationPosition) {
        this.isGeolocationActive = true;
        this.userLocation = {
            lon: position.coords.longitude,
            lat: position.coords.latitude,
        };

        const pos = Cesium.Cartesian3.fromDegrees(this.userLocation.lon, this.userLocation.lat);

        if (!this.userLocationEntity) {
            this.userLocationEntity = this.viewer.entities.add({
                position: pos,
                billboard: {
                    image: this.getIconCanvas('navigation', '#007aff'),
                    width: 32,
                    height: 32,
                    disableDepthTestDistance: Number.POSITIVE_INFINITY
                },
            });
        } else {
            this.userLocationEntity.position = pos;
        }
        document.getElementById('gps-status-indicator')?.classList.add('active');
    }

    centerOnUserLocation() {
        if (this.userLocation) {
            this.viewer.camera.flyTo({
                destination: Cesium.Cartesian3.fromDegrees(this.userLocation.lon, this.userLocation.lat, 10000),
                orientation: {
                    heading: Cesium.Math.toRadians(0.0),
                    pitch: Cesium.Math.toRadians(-45.0),
                }
            });
        } else {
            this.showToast('Your location is not available yet.', 'info');
            this.startGeolocation();
        }
    }
    
    // --- Routing ---
    
    setUiMode(mode: 'search' | 'routing') {
        const searchBar = document.getElementById('unified-search-bar')!;
        const routingPanel = document.getElementById('active-routing-panel')!;
    
        if (mode === 'routing') {
            searchBar.classList.add('hidden');
            routingPanel.classList.remove('hidden');
        } else { // search
            searchBar.classList.remove('hidden');
            routingPanel.classList.add('hidden');
        }
    }

    handleDirectionsTo(entity: any) {
        if (!this.userLocation) {
            this.showToast("Your location isn't available. Please enable GPS.", 'warning');
            return;
        }
        this.hideDetailCard();
        this.setUiMode('routing');
    
        (document.getElementById('to-input') as HTMLInputElement).value = this.getDisplayablePropertyValue(entity.properties.name, 'Selected Location');
        (document.getElementById('from-input') as HTMLInputElement).value = this.translations.current_location_label;
    
        this.findRoute();
    }
    
    handleDirectionsFrom(entity: any) {
        this.hideDetailCard();
        this.setUiMode('routing');
    
        (document.getElementById('from-input') as HTMLInputElement).value = this.getDisplayablePropertyValue(entity.properties.name, 'Selected Location');
        const toInput = document.getElementById('to-input') as HTMLInputElement;
        toInput.value = '';
        toInput.focus();
    }

    private generateMockDirections(route: any, baseDistance: number): any[] {
        const directions = [];
        directions.push({ icon: 'directions', text: `Start on Main St toward ${route.to || 'your destination'}.` });
    
        if (route.id === 'scenic') {
            directions.push({ icon: 'photo_camera', text: `Pass by scenic viewpoint in ${Math.round(baseDistance / 4)} km.` });
        }
        
        if (route.status.includes('Accident')) {
             directions.push({ icon: 'warning', text: 'Rerouting to avoid incident on Highway 1.' });
             directions.push({ icon: 'turn_right', text: 'Turn right onto side road.' });
        } else {
            directions.push({ icon: 'turn_right', text: 'Turn right onto Highway 1.' });
        }
    
        directions.push({ icon: 'straight', text: `Continue for ${Math.round(baseDistance * 0.8)} km.` });
        directions.push({ icon: 'exit', text: `Take exit towards ${route.to || 'your destination'}.`});
        directions.push({ icon: 'flag', text: 'Arrive at destination.' });
    
        return directions;
    }

    private generateMockRouteGeometry(startLon: number, startLat: number, endLon: number, endLat: number, type: 'fastest' | 'alternative' | 'scenic' | 'toll-free'): any {
        const coordinates = [];
        coordinates.push([startLon, startLat]);

        const numPoints = 20; // More points for a smoother line
        const dx = (endLon - startLon) / numPoints;
        const dy = (endLat - startLat) / numPoints;

        for (let i = 1; i < numPoints; i++) {
            let lon = startLon + i * dx;
            let lat = startLat + i * dy;

            // Add some deviation to make it look like a real road
            let deviationFactor = 0.08; // Base deviation
            if (type === 'scenic') deviationFactor = 0.25; // More curvy
            if (type === 'alternative') deviationFactor = 0.15;

            // Use sine wave for smoother curves
            const progress = i / numPoints;
            lon += Math.sin(progress * Math.PI * 4) * deviationFactor * (endLat - startLat);
            lat += Math.cos(progress * Math.PI * 4) * deviationFactor * (endLon - startLon);
            
            coordinates.push([lon, lat]);
        }

        coordinates.push([endLon, endLat]);

        return {
            type: 'LineString',
            coordinates: coordinates
        };
    }

    private drawAllRouteOptions() {
        this.routeDataSource.entities.removeAll();
        if (this.availableRoutes.length === 0) return;
    
        // --- Add Start and End markers ---
        const firstRoute = this.availableRoutes[0];
        const startCoords = firstRoute.geometry.coordinates[0];
        const endCoords = firstRoute.geometry.coordinates[firstRoute.geometry.coordinates.length - 1];
    
        this.routeDataSource.entities.add({
            position: Cesium.Cartesian3.fromDegrees(startCoords[0], startCoords[1]),
            billboard: {
                image: this.getIconCanvas('flag', '#2ecc71'), // Green flag for start
                width: 32, height: 32,
                verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
                disableDepthTestDistance: Number.POSITIVE_INFINITY
            }
        });
    
        this.routeDataSource.entities.add({
            position: Cesium.Cartesian3.fromDegrees(endCoords[0], endCoords[1]),
            billboard: {
                image: this.getIconCanvas('place', '#e74c3c'), // Red pin for end
                width: 32, height: 32,
                verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
                disableDepthTestDistance: Number.POSITIVE_INFINITY
            }
        });
    
        // --- Draw all route polylines ---
        this.availableRoutes.forEach(route => {
            if (!route?.geometry?.coordinates) {
                console.warn("Route in list is missing geometry", route);
                return;
            };
    
            const color = this.routeColorMap[route.id as keyof typeof this.routeColorMap] || Cesium.Color.GRAY;
            
            // All routes start in a de-emphasized state
            this.routeDataSource.entities.add({
                id: route.id,
                name: route.name,
                polyline: {
                    positions: Cesium.Cartesian3.fromDegreesArray(route.geometry.coordinates.flat()),
                    width: 2,
                    material: this.inactiveRouteMaterial(color),
                    clampToGround: true
                }
            });
        });
    
        // --- Frame all entities (routes and markers) ---
        if (this.routeDataSource.entities.values.length > 0) {
            this.viewer.flyTo(this.routeDataSource.entities, {
                duration: 1.5
            });
        }
    }

    async findRoute() {
        const from = (document.getElementById('from-input') as HTMLInputElement).value;
        const to = (document.getElementById('to-input') as HTMLInputElement).value;
        if (!from || !to) {
            this.showToast('Please enter both start and end points.', 'warning');
            return;
        }
    
        this.setUiMode('routing');
    
        // --- Show Loading State ---
        const routeDetailsPanel = document.getElementById('route-details-panel')!;
        const loader = document.getElementById('route-loading-overlay')!;
        routeDetailsPanel.classList.remove('hidden');
        loader.classList.remove('hidden');
        
        // Hide old results while calculating
        document.getElementById('route-alternatives-container')?.classList.add('hidden');
        document.getElementById('route-preferences-summary')?.classList.add('hidden');
    
        // --- Dynamic Mock Route Generation (with simulated delay) ---
        await new Promise(resolve => setTimeout(resolve, 1500)); // Simulate calculation time
    
        const baseTime = 120 + Math.floor(Math.random() * 30); // 2h to 2h30m
        const baseDistance = 100 + Math.floor(Math.random() * 20); // 100km to 120km
    
        const roadConditions = [
            { status: 'Light Traffic', summaryKey: 'route_summary_traffic_light', timeModifier: 1.0 },
            { status: 'Moderate Traffic', summaryKey: 'route_summary_traffic_moderate', timeModifier: 1.2 },
            { status: 'Accident Ahead', summaryKey: 'route_summary_accident', timeModifier: 1.5 }
        ];
    
        // MOCK GEOCODING: Create random start/end points for this route search
        const startLon = 81 + Math.random() * 6; // Within Nepal's lon range
        const startLat = 27 + Math.random() * 2; // Within Nepal's lat range
        const endLon = 81 + Math.random() * 6;
        const endLat = 27 + Math.random() * 2;

        const routes = [];
    
        // --- Route 1: Fastest ---
        const fastestCondition = roadConditions[Math.floor(Math.random() * 2)]; // Usually good conditions
        const fastestTime = Math.round(baseTime * fastestCondition.timeModifier);
        const fastestRouteData = {
            id: 'fastest', name: 'Fastest', timeMins: fastestTime,
            distance: `${baseDistance} km`, time: `${Math.floor(fastestTime / 60)}h ${fastestTime % 60}m`,
            status: fastestCondition.status, summary: this.translations[fastestCondition.summaryKey],
            geometry: this.generateMockRouteGeometry(startLon, startLat, endLon, endLat, 'fastest')
        };
        routes.push({ ...fastestRouteData, directions: this.generateMockDirections(fastestRouteData, baseDistance) });
    
        // --- Route 2: Alternative ---
        const altCondition = roadConditions[Math.floor(Math.random() * roadConditions.length)];
        const altTime = Math.round((baseTime + 15) * altCondition.timeModifier);
        const altDistance = baseDistance + 10;
        const altRouteData = {
            id: 'alternative', name: 'Alternative', timeMins: altTime,
            distance: `${altDistance} km`, time: `${Math.floor(altTime / 60)}h ${altTime % 60}m`,
            status: altCondition.status, summary: this.translations[altCondition.summaryKey],
            geometry: this.generateMockRouteGeometry(startLon, startLat, endLon, endLat, 'alternative')
        };
        routes.push({ ...altRouteData, directions: this.generateMockDirections(altRouteData, altDistance) });
    
        // --- Route 3: Based on preference ---
        const preferScenic = (document.getElementById('pref-scenic') as HTMLInputElement).checked;
        const avoidTolls = (document.getElementById('pref-no-tolls') as HTMLInputElement).checked;
    
        if (preferScenic) {
            const scenicTime = Math.round((baseTime + 40) * 1.1); // Scenic routes are slower
            const scenicDistance = baseDistance + 25;
            const scenicRouteData = {
                id: 'scenic', name: 'Scenic', timeMins: scenicTime,
                distance: `${scenicDistance} km`, time: `${Math.floor(scenicTime / 60)}h ${scenicTime % 60}m`,
                status: 'Light Traffic', summary: this.translations.route_summary_scenic,
                geometry: this.generateMockRouteGeometry(startLon, startLat, endLon, endLat, 'scenic')
            };
            routes.push({ ...scenicRouteData, directions: this.generateMockDirections(scenicRouteData, scenicDistance) });
        } else if (avoidTolls) {
            const tollFreeTime = Math.round((baseTime + 25) * 1.15); // Toll-free can have more traffic
            const tollFreeDistance = baseDistance + 15;
            const tollFreeRouteData = {
                id: 'toll-free', name: 'No Tolls', timeMins: tollFreeTime,
                distance: `${tollFreeDistance} km`, time: `${Math.floor(tollFreeTime / 60)}h ${tollFreeTime % 60}m`,
                status: 'Moderate Traffic', summary: this.translations.route_summary_no_tolls,
                geometry: this.generateMockRouteGeometry(startLon, startLat, endLon, endLat, 'toll-free')
            };
            routes.push({ ...tollFreeRouteData, directions: this.generateMockDirections(tollFreeRouteData, tollFreeDistance) });
        }
    
        this.availableRoutes = routes.sort((a, b) => a.timeMins - b.timeMins);
        
        // --- Hide Loader and Display Results ---
        loader.classList.add('hidden');
        
        // Draw all returned routes on the map first, in a de-emphasized state
        this.drawAllRouteOptions();
        
        // Display the route cards, which will also select and highlight the best route
        this.displayRouteOptions(from, to);
    }

    displayRouteOptions(from: string, to: string) {
        const alternativesContainer = document.getElementById('route-alternatives')!;
        const container = document.getElementById('route-alternatives-container')!;
        alternativesContainer.innerHTML = ''; // Clear previous options
    
        if (this.availableRoutes.length > 0) {
            const fastestTime = this.availableRoutes[0].timeMins;
    
            this.availableRoutes.forEach(route => {
                const timeDiff = route.timeMins - fastestTime;
                const card = document.createElement('div');
                card.className = `route-alternative-card route--${route.id}`;
                card.dataset.routeId = route.id;
    
                card.innerHTML = `
                    <span class="time">${route.time}</span>
                    <span class="name">${route.name} ${timeDiff > 0 ? `(+${timeDiff} min)`: '(Fastest)'}</span>
                    <span class="summary">${route.summary}</span>
                `;
                card.addEventListener('click', () => {
                    this.selectRoute(route.id);
                });
                alternativesContainer.appendChild(card);
            });
    
            container.classList.remove('hidden');
            
            // Select the first route by default
            this.selectRoute(this.availableRoutes[0].id, { from, to });
        }
    }

    selectRoute(routeId: string, startEnd?: { from: string, to: string }) {
        const selectedRoute = this.availableRoutes.find(r => r.id === routeId);
        if (!selectedRoute) return;
        
        this.activeRouteData = {
            ...selectedRoute,
            from: startEnd?.from || (document.getElementById('from-input') as HTMLInputElement).value,
            to: startEnd?.to || (document.getElementById('to-input') as HTMLInputElement).value,
        };
    
        document.querySelectorAll('.route-alternative-card').forEach(card => {
            card.classList.toggle('active', card.getAttribute('data-route-id') === routeId);
        });
    
        // Update visual style of polylines on map to highlight the selected one
        this.routeDataSource.entities.values.forEach((entity: any) => {
            // Skip non-polyline entities like our start/end markers
            if (!entity.polyline) return;
    
            const isSelected = entity.id === routeId;
            const routeData = this.availableRoutes.find(r => r.id === entity.id);
            if (!routeData) return;
            const color = this.routeColorMap[routeData.id as keyof typeof this.routeColorMap] || Cesium.Color.GRAY;
            
            entity.polyline.material = isSelected ? this.activeRouteMaterial(color) : this.inactiveRouteMaterial(color);
            entity.polyline.width = isSelected ? 8 : 2; // Selected is thick, others are thin
        });
    
        this.displayRouteDetails(this.activeRouteData);
        localStorage.setItem('sadakSathiLastRoute', JSON.stringify(this.activeRouteData));
    }

    clearRoute() {
        (document.getElementById('from-input') as HTMLInputElement).value = '';
        (document.getElementById('to-input') as HTMLInputElement).value = '';
        this.routeDataSource.entities.removeAll();
        this.hideRouteDetails();
        this.activeRouteData = null;
        this.availableRoutes = [];
        document.getElementById('route-alternatives-container')?.classList.add('hidden');
        document.getElementById('route-preferences-summary')?.classList.add('hidden');
        localStorage.removeItem('sadakSathiLastRoute');
        this.setUiMode('search');
        
        // Fly back to default view
        this.viewer.camera.flyTo({
            destination: Cesium.Cartesian3.fromDegrees(INITIAL_CAMERA_POSITION.lon, INITIAL_CAMERA_POSITION.lat, INITIAL_CAMERA_POSITION.alt),
            duration: 1.5
        });
    }
    
    displayRouteDetails(routeData: any) {
        document.getElementById('route-distance')!.textContent = routeData.distance;
        document.getElementById('route-time')!.textContent = routeData.time;
        document.getElementById('route-overall-status')!.textContent = routeData.status;
        (document.getElementById('from-input') as HTMLInputElement).value = routeData.from || '';
        (document.getElementById('to-input') as HTMLInputElement).value = routeData.to || '';

        // Update directions list
        const directionsListEl = document.getElementById('route-directions-list')!;
        directionsListEl.innerHTML = '';
        if (routeData.directions && Array.isArray(routeData.directions)) {
            const list = document.createElement('ul');
            list.className = 'directions-list';
            routeData.directions.forEach((step: {icon: string, text: string}) => {
                const item = document.createElement('li');
                item.className = 'direction-step';
                item.innerHTML = `<span class="material-icons">${step.icon}</span> <p>${step.text}</p>`;
                list.appendChild(item);
            });
            directionsListEl.appendChild(list);
        } else {
            directionsListEl.innerHTML = '<p>No directions available for this route.</p>';
        }
    
        // Update preferences summary
        const prefsContainer = document.getElementById('route-preferences-summary')!;
        const prefsList = document.getElementById('route-preferences-list')!;
        prefsList.innerHTML = '';
        const prefs = [];
        if ((document.getElementById('pref-highways') as HTMLInputElement).checked) prefs.push({icon: 'add_road', text: this.translations.prefer_highways});
        if ((document.getElementById('pref-no-tolls') as HTMLInputElement).checked) prefs.push({icon: 'no_transfer', text: this.translations.avoid_tolls});
        if ((document.getElementById('pref-scenic') as HTMLInputElement).checked) prefs.push({icon: 'landscape', text: this.translations.prefer_scenic_route});
    
        if (prefs.length > 0) {
            prefs.forEach(pref => {
                const li = document.createElement('li');
                li.innerHTML = `<span class="material-icons">${pref.icon}</span> ${pref.text}`;
                prefsList.appendChild(li);
            });
            prefsContainer.classList.remove('hidden');
        } else {
            prefsContainer.classList.add('hidden');
        }
        
        document.getElementById('route-details-panel')?.classList.remove('hidden');
    }

    hideRouteDetails() {
        document.getElementById('route-details-panel')?.classList.add('hidden');
    }

    swapRouteLocations() {
        const fromInput = document.getElementById('from-input') as HTMLInputElement;
        const toInput = document.getElementById('to-input') as HTMLInputElement;
        [fromInput.value, toInput.value] = [toInput.value, fromInput.value];
    }
    
    startNavigation() {
        this.showToast('Navigation mode would start here!', 'success');
    }

    restoreLastRoute() {
        const lastRoute = localStorage.getItem('sadakSathiLastRoute');
        if (lastRoute) {
            try {
                this.activeRouteData = JSON.parse(lastRoute);
                this.availableRoutes = [this.activeRouteData]; // Set available routes to just this one
                this.displayRouteDetails(this.activeRouteData);

                // Draw the single restored route
                this.routeDataSource.entities.removeAll();
                if (this.activeRouteData?.geometry?.coordinates) {
                    const coords = this.activeRouteData.geometry.coordinates;
                    const startCoords = coords[0];
                    const endCoords = coords[coords.length - 1];

                    this.routeDataSource.entities.add({
                        position: Cesium.Cartesian3.fromDegrees(startCoords[0], startCoords[1]),
                        billboard: {
                            image: this.getIconCanvas('flag', '#2ecc71'),
                            width: 32, height: 32,
                            verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
                            disableDepthTestDistance: Number.POSITIVE_INFINITY
                        }
                    });

                    this.routeDataSource.entities.add({
                        position: Cesium.Cartesian3.fromDegrees(endCoords[0], endCoords[1]),
                        billboard: {
                            image: this.getIconCanvas('place', '#e74c3c'),
                            width: 32, height: 32,
                            verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
                            disableDepthTestDistance: Number.POSITIVE_INFINITY
                        }
                    });

                    const color = this.routeColorMap[this.activeRouteData.id as keyof typeof this.routeColorMap] || Cesium.Color.DODGERBLUE;
                    this.routeDataSource.entities.add({
                        id: this.activeRouteData.id,
                        name: this.activeRouteData.name,
                        polyline: {
                            positions: Cesium.Cartesian3.fromDegreesArray(coords.flat()),
                            width: 8,
                            material: this.activeRouteMaterial(color),
                            clampToGround: true
                        }
                    });
                    // Fly to the route, but without animation on load
                    this.viewer.flyTo(this.routeDataSource.entities, { duration: 0 });
                }
                
                document.getElementById('route-alternatives-container')?.classList.add('hidden');
                this.setUiMode('routing');
            } catch (e) {
                console.error("Failed to parse last route data", e);
                localStorage.removeItem('sadakSathiLastRoute');
            }
        }
    }
    
    // --- Search ---
    
    performSearch() {
        const query = (document.getElementById('unified-search-input') as HTMLInputElement).value;
        if (query.trim()) {
            this.showToast(`Searching for: ${query}`, 'info');
            // Mock search: fly to a random point in Nepal
            const randomLon = 80.0 + Math.random() * 8.2;
            const randomLat = 26.3 + Math.random() * 4.2;
            this.viewer.camera.flyTo({
                destination: Cesium.Cartesian3.fromDegrees(randomLon, randomLat, 20000)
            });
        }
    }

    // --- AI Chat ---

    getSystemInstruction(): string {
        const personaMap = {
            friendly: "You are Sadak Sathi, a friendly and cheerful AI road companion for Nepal. Be helpful and encouraging.",
            formal: "You are a formal and precise AI assistant. Provide clear, concise, and accurate information about roads and travel in Nepal.",
            guide: "You are an enthusiastic and knowledgeable tour guide for Nepal. Provide rich details about culture, history, and points of interest along the user's route.",
            buddy: "You are a calm, focused, and reliable co-pilot. Prioritize safety, clear directions, and timely alerts. Keep your responses short and to the point."
        };

        const relationshipMap = {
            friend: "Address the user casually, like a good friend.",
            partner: "Address the user with warmth and support, like a caring partner.",
            husband: "Address the user as you would your husband.",
            wife: "Address the user as you would your wife."
        };

        return `${personaMap[this.aiPersonality as keyof typeof personaMap]} ${relationshipMap[this.aiRelationship as keyof typeof relationshipMap]}`;
    }

    resetChat() {
        if (!this.ai) return;
        this.chat = this.ai.chats.create({
            model: 'gemini-2.5-flash',
            config: {
                systemInstruction: this.getSystemInstruction()
            }
        });
        this.chatHistory = [];
        const messagesContainer = document.querySelector('.chat-messages')!;
        messagesContainer.innerHTML = '';
        this.addMessageToChat(this.translations.ai_welcome_message, 'ai');
    }

    openChat() {
        if (!this.ai) {
            this.showToast(this.translations.ai_unavailable_message, 'error');
            return;
        }
        if (!this.chat) {
            this.resetChat();
        }
        document.getElementById('ai-chat-modal')?.classList.remove('hidden');
        document.getElementById('context-chat-btn')?.classList.toggle('hidden', !this.selectedEntityContext);
        this.isChatOpen = true;
    }

    closeChat() {
        document.getElementById('ai-chat-modal')?.classList.add('hidden');
        this.isChatOpen = false;
    }

    async handleChatMessage(event: Event) {
        event.preventDefault();
        if (!this.ai || !this.chat) return;
        
        const input = document.getElementById('chat-input') as HTMLInputElement;
        const message = input.value.trim();
        if (!message) return;

        this.addMessageToChat(message, 'user');
        input.value = '';

        try {
            const result = await this.chat.sendMessage({ message: message });
            this.addMessageToChat(result.text, 'ai');
        } catch (error) {
            console.error('AI chat error:', error);
            this.addMessageToChat(this.translations.ai_error_message, 'ai');
        }
    }

    addMessageToChat(text: string, sender: 'user' | 'ai') {
        const messagesContainer = document.querySelector('.chat-messages')!;
        const messageEl = document.createElement('div');
        messageEl.classList.add('chat-message', `${sender}-message`);

        const avatarSrc = sender === 'ai' ? this.aiAvatarUrl : 'https://i.imgur.com/uGAtGpj.png';
        const senderName = sender === 'ai' ? 'Sadak Sathi' : 'You';

        let messageContentHtml = text;
        if (sender === 'ai' && text !== this.translations.ai_welcome_message) {
            const personaPrefix = `<span class="ai-persona-prefix">(As your ${this.aiPersonality} ${this.aiRelationship}, ...) </span>`;
            messageContentHtml = `${personaPrefix}${text}`;
        }

        messageEl.innerHTML = `
            <img src="${avatarSrc}" alt="${senderName} avatar" class="message-avatar">
            <div class="message-content">
                <span class="message-sender">${senderName}</span>
                ${messageContentHtml}
            </div>
        `;
        messagesContainer.appendChild(messageEl);
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
        
        if (sender === 'ai' && (document.getElementById('toggle-voice-response') as HTMLInputElement).checked) {
            this.speak(text); // Speak the original, unmodified text for a natural response.
        }
    }

    askAboutContext(openChatIfNeeded = false) {
        if (!this.selectedEntityContext) return;
        const contextName = this.getDisplayablePropertyValue(this.selectedEntityContext.name, 'this location');
        const prompt = `Tell me about ${contextName}.`;
        
        if(openChatIfNeeded && !this.isChatOpen) {
            this.openChat();
        }

        const input = document.getElementById('chat-input') as HTMLInputElement;
        input.value = prompt;
        // Create a new submit event to trigger the handler
        const submitEvent = new Event('submit', { bubbles: true, cancelable: true });
        document.getElementById('chat-form')?.dispatchEvent(submitEvent);
    }

    // --- Voice Input & Output ---

    initSpeechRecognition() {
        if (!SpeechRecognition) return;
        this.recognition = new SpeechRecognition();
        this.recognition.continuous = false;
        this.recognition.lang = 'en-US'; // Can be changed based on language selection
        this.recognition.interimResults = false;
        this.recognition.maxAlternatives = 1;

        this.recognition.onresult = (event: any) => {
            const transcript = event.results[0][0].transcript;
            if (this.activeVoiceContext === 'chat') {
                (document.getElementById('chat-input') as HTMLInputElement).value = transcript;
                 const submitEvent = new Event('submit', { bubbles: true, cancelable: true });
                 document.getElementById('chat-form')?.dispatchEvent(submitEvent);
            } else if (this.activeVoiceContext === 'unified-search') {
                (document.getElementById('unified-search-input') as HTMLInputElement).value = transcript;
                this.performSearch();
            }
        };
        this.recognition.onerror = (event: any) => {
            console.error('Speech recognition error', event.error);
            if(event.error === 'not-allowed') {
                document.getElementById('permission-help-modal')?.classList.remove('hidden');
            } else {
                this.showToast(this.translations.speech_recognition_error, 'error');
            }
        };
        this.recognition.onend = () => {
            this.isRecognizing = false;
            this.activeVoiceContext = 'none';
            document.body.classList.remove('is-recognizing');
        };
    }

    startVoiceCommand(context: string) {
        if (!this.recognition) {
            this.showToast('Voice input is not supported by your browser.', 'error');
            return;
        }
        if (this.isRecognizing) {
            this.recognition.stop();
            return;
        }
        if (!this.hasRequestedMicrophone) {
             this.hasRequestedMicrophone = true;
        }
        this.activeVoiceContext = context;
        this.recognition.start();
        this.isRecognizing = true;
        document.body.classList.add('is-recognizing');
    }
    
    loadVoices() {
        const load = () => {
            this.availableVoices = SpeechSynthesis.getVoices();
            if (this.availableVoices.length === 0) {
                 setTimeout(load, 100);
            }
        };
        SpeechSynthesis.onvoiceschanged = load;
        load();
    }
    
    speak(text: string) {
        if (!SpeechSynthesis || !text) return;
        
        const utterance = new SpeechSynthesisUtterance(text);
        const lang = this.currentLang.split('-')[0];
        
        let voiceOptions = this.availableVoices.filter(v => v.lang.startsWith(lang));
        if (this.aiVoice === 'female') voiceOptions = voiceOptions.filter(v => v.name.toLowerCase().includes('female'));
        if (this.aiVoice === 'male') voiceOptions = voiceOptions.filter(v => v.name.toLowerCase().includes('male'));

        utterance.voice = voiceOptions[0] || this.availableVoices.find(v => v.lang.startsWith('en')) || this.availableVoices[0];
        
        SpeechSynthesis.cancel();
        SpeechSynthesis.speak(utterance);
    }
    
    // --- Settings ---

    loadSettings() {
        const theme = localStorage.getItem('sadakSathiTheme');
        if (theme) {
            document.getElementById('app-container')!.dataset.theme = theme;
            document.querySelector('#theme-toggle .material-icons')!.textContent = theme === 'dark' ? 'dark_mode' : 'light_mode';
        }
        
        this.aiAvatarUrl = localStorage.getItem('sadakSathiAvatar') || this.aiAvatarUrl;
        this.aiPersonality = localStorage.getItem('sadakSathiPersonality') || this.aiPersonality;
        this.aiRelationship = localStorage.getItem('sadakSathiRelationship') || this.aiRelationship;
        this.aiVoice = localStorage.getItem('sadakSathiVoice') || this.aiVoice;
        
        (document.getElementById('persona-avatar-preview') as HTMLImageElement).src = this.aiAvatarUrl;
        (document.getElementById('persona-personality-select') as HTMLSelectElement).value = this.aiPersonality;
        (document.getElementById('persona-relationship-select') as HTMLSelectElement).value = this.aiRelationship;
        (document.getElementById('persona-voice-select') as HTMLSelectElement).value = this.aiVoice;
        (document.getElementById('toggle-voice-response') as HTMLInputElement).checked = localStorage.getItem('sadakSathiVoiceResponse') !== 'false';
        
        (document.getElementById('pref-highways') as HTMLInputElement).checked = localStorage.getItem('sadakSathiPrefHighways') === 'true';
        (document.getElementById('pref-no-tolls') as HTMLInputElement).checked = localStorage.getItem('sadakSathiPrefNoTolls') === 'true';
        (document.getElementById('pref-scenic') as HTMLInputElement).checked = localStorage.getItem('sadakSathiPrefScenic') === 'true';
        
        this.ipCamUrl = localStorage.getItem('sadakSathiIpCamUrl') || '';

        this.updateAiFeatureUiState();
        this.updatePersonalityDescription();
        this.loadSavedCarLocation();
    }
    
    saveSettings() {
        localStorage.setItem('sadakSathiAvatar', this.aiAvatarUrl);
        localStorage.setItem('sadakSathiPersonality', this.aiPersonality);
        localStorage.setItem('sadakSathiRelationship', this.aiRelationship);
        localStorage.setItem('sadakSathiVoice', this.aiVoice);
        
        localStorage.setItem('sadakSathiVoiceResponse', String((document.getElementById('toggle-voice-response') as HTMLInputElement).checked));
        localStorage.setItem('sadakSathiPrefHighways', String((document.getElementById('pref-highways') as HTMLInputElement).checked));
        localStorage.setItem('sadakSathiPrefNoTolls', String((document.getElementById('pref-no-tolls') as HTMLInputElement).checked));
        localStorage.setItem('sadakSathiPrefScenic', String((document.getElementById('pref-scenic') as HTMLInputElement).checked));
    }

    updatePersonalityDescription() {
        const personality = (document.getElementById('persona-personality-select') as HTMLSelectElement).value;
        const descEl = document.getElementById('persona-personality-description')!;
        const key = `personality_desc_${personality}`;
        descEl.textContent = this.translations[key] || '';
    }
    
    handleAvatarChange(event: Event) {
        const input = event.target as HTMLInputElement;
        if (input.files && input.files[0]) {
            const reader = new FileReader();
            reader.onload = (e) => {
                this.aiAvatarUrl = e.target!.result as string;
                this.updateAiFeatureUiState();
                this.saveSettings();
            };
            reader.readAsDataURL(input.files[0]);
        }
    }

    updateAiFeatureUiState() {
        (document.getElementById('unified-search-ai-avatar') as HTMLImageElement).src = this.aiAvatarUrl;
        (document.getElementById('chat-ai-avatar') as HTMLImageElement).src = this.aiAvatarUrl;
        (document.getElementById('persona-avatar-preview') as HTMLImageElement).src = this.aiAvatarUrl;
    }
    
    // --- Incident Reporting ---

    openReportIncidentModal() {
        if (!this.userLocation) {
            document.getElementById('report-location-unavailable')?.classList.remove('hidden');
            document.getElementById('report-incident-form')?.classList.add('hidden');
        } else {
            document.getElementById('report-location-unavailable')?.classList.add('hidden');
            document.getElementById('report-incident-form')?.classList.remove('hidden');
            (document.getElementById('incident-location') as HTMLInputElement).value = `Lat: ${this.userLocation.lat.toFixed(4)}, Lon: ${this.userLocation.lon.toFixed(4)}`;
        }
        
        // Reset image refinement UI
        this.originalIncidentImage = null;
        this.refinedIncidentImage = null;
        document.getElementById('image-refinement-area')?.classList.add('hidden');
        (document.getElementById('incident-image-preview') as HTMLImageElement).src = '#';
        (document.getElementById('refinement-prompt') as HTMLInputElement).value = '';
        const fileInput = document.getElementById('incident-image-upload') as HTMLInputElement;
        if (fileInput) {
            fileInput.value = ''; // This is important to allow re-uploading the same file
        }

        document.getElementById('report-incident-modal')?.classList.remove('hidden');
    }

    handleIncidentReportSubmit(event: Event) {
        event.preventDefault();
        if (!this.userLocation) {
            this.showToast('Cannot submit report without a location.', 'error');
            return;
        }
        const type = (document.getElementById('incident-type') as HTMLSelectElement).value;
        const description = (document.getElementById('incident-description') as HTMLTextAreaElement).value;
        
        const imageToSubmit = this.refinedIncidentImage || this.originalIncidentImage;

        const newIncident = {
            type: 'Feature',
            geometry: { type: 'Point', coordinates: [this.userLocation.lon, this.userLocation.lat] },
            properties: {
                incident_type: type,
                details: description,
                timestamp: new Date().toISOString(),
                user_reported: true,
                entityType: 'incident',
                imageData: imageToSubmit ? `data:${imageToSubmit.mimeType};base64,${imageToSubmit.data}` : null
            }
        };

        const incidentCollection = { type: 'FeatureCollection', features: [newIncident] };
        this.loadDataIntoSource(this.incidentDataSource, incidentCollection);
        this.incidentDataSource.entities.values.forEach((entity: any) => {
            if (entity.properties.user_reported?.getValue()) {
                 this.styleEntityAsBillboard(entity, 'warning', '#e74c3c')
            }
        });
        
        this.saveLocalIncidents(newIncident);
        
        this.showToast('Incident reported successfully!', 'success');
        document.getElementById('report-incident-modal')?.classList.add('hidden');
    }
    
    loadLocalIncidents() {
        const localIncidents = JSON.parse(localStorage.getItem('sadakSathiUserIncidents') || '[]');
        if (localIncidents.length > 0) {
            const incidentCollection = { type: 'FeatureCollection', features: localIncidents };
            this.loadDataIntoSource(this.incidentDataSource, incidentCollection);
            this.incidentDataSource.entities.values.forEach((entity: any) => {
                if (entity.properties.user_reported?.getValue()) {
                     this.styleEntityAsBillboard(entity, 'warning', '#e74c3c')
                }
            });
        }
    }
    
    saveLocalIncidents(incident: any) {
        const localIncidents = JSON.parse(localStorage.getItem('sadakSathiUserIncidents') || '[]');
        localIncidents.push(incident);
        localStorage.setItem('sadakSathiUserIncidents', JSON.stringify(localIncidents));
    }

    // --- Image Refinement ---

    private dataUrlToParts(dataUrl: string): { data: string, mimeType: string } | null {
        const match = dataUrl.match(/^data:(.+);base64,(.+)$/);
        if (!match) return null;
        return { mimeType: match[1], data: match[2] };
    }
    
    private handleIncidentImageUpload(event: Event) {
        const input = event.target as HTMLInputElement;
        if (!input.files || !input.files[0]) return;
    
        const file = input.files[0];
        const reader = new FileReader();
    
        reader.onload = (e) => {
            const dataUrl = e.target!.result as string;
            const parts = this.dataUrlToParts(dataUrl);
            if (!parts) {
                this.showToast('Invalid image file format.', 'error');
                return;
            }
    
            this.originalIncidentImage = parts;
            this.refinedIncidentImage = null; // Reset refined image on new upload
    
            const preview = document.getElementById('incident-image-preview') as HTMLImageElement;
            preview.src = dataUrl;
    
            document.getElementById('image-refinement-area')?.classList.remove('hidden');
        };
    
        reader.onerror = () => {
            this.showToast('Failed to read the image file.', 'error');
        };
    
        reader.readAsDataURL(file);
    }

    private async handleImageRefinement() {
        if (!this.ai) {
            this.showToast('AI features are unavailable.', 'error');
            return;
        }
        if (!this.originalIncidentImage) {
            this.showToast('Please upload an image first.', 'warning');
            return;
        }
        const promptInput = document.getElementById('refinement-prompt') as HTMLInputElement;
        const prompt = promptInput.value.trim();
        if (!prompt) {
            this.showToast('Please enter a refinement instruction.', 'warning');
            return;
        }
    
        const loader = document.getElementById('refinement-loader')!;
        loader.classList.remove('hidden');
    
        try {
            const response = await this.ai.models.generateContent({
                model: 'gemini-2.5-flash-image-preview',
                contents: {
                    parts: [
                        {
                            inlineData: {
                                data: this.originalIncidentImage.data,
                                mimeType: this.originalIncidentImage.mimeType,
                            },
                        },
                        {
                            text: prompt,
                        },
                    ],
                },
                config: {
                    responseModalities: [Modality.IMAGE, Modality.TEXT],
                },
            });
            
            const imagePart = response.candidates?.[0]?.content?.parts?.find(part => part.inlineData);
    
            if (imagePart && imagePart.inlineData) {
                this.refinedIncidentImage = {
                    data: imagePart.inlineData.data,
                    mimeType: imagePart.inlineData.mimeType,
                };
                const preview = document.getElementById('incident-image-preview') as HTMLImageElement;
                preview.src = `data:${this.refinedIncidentImage.mimeType};base64,${this.refinedIncidentImage.data}`;
                this.showToast('Image refined successfully!', 'success');
            } else {
                const textPart = response.candidates?.[0]?.content?.parts?.find(part => part.text);
                const errorMessage = textPart?.text || 'AI could not refine the image. Please try a different prompt.';
                this.showToast(errorMessage, 'error');
            }
    
        } catch (error) {
            console.error('Image refinement error:', error);
            this.showToast('An error occurred during image refinement.', 'error');
        } finally {
            loader.classList.add('hidden');
        }
    }

    // --- Travel Time Map ---
    
    toggleTravelTimePanel(show: boolean) {
        document.getElementById('travel-time-panel')?.classList.toggle('hidden', !show);
        if (!show) {
            // Cleanup when closing
            this.isPickingTravelTimeOrigin = false;
            document.getElementById('app-container')?.classList.remove('picking-location');
        }
    }

    setTravelTimeOriginFromUserLocation() {
        if (this.userLocation) {
            this.travelTimeOrigin = this.userLocation;
            const input = document.getElementById('travel-time-origin-input') as HTMLInputElement;
            input.value = `Current Location (${this.userLocation.lat.toFixed(4)}, ${this.userLocation.lon.toFixed(4)})`;
        } else {
            this.showToast('Your location is not yet available.', 'warning');
            this.startGeolocation();
        }
    }
    
    handlePickTravelTimeOrigin() {
        this.isPickingTravelTimeOrigin = true;
        document.getElementById('app-container')?.classList.add('picking-location');
        this.showToast('Click on the map to select a starting point.', 'info');
        this.toggleTravelTimePanel(false); // Hide panel while picking
    }

    setTravelTimeOrigin(cartesian: any) {
        const cartographic = Cesium.Cartographic.fromCartesian(cartesian);
        const lon = Cesium.Math.toDegrees(cartographic.longitude);
        const lat = Cesium.Math.toDegrees(cartographic.latitude);
        this.travelTimeOrigin = { lon, lat };

        const input = document.getElementById('travel-time-origin-input') as HTMLInputElement;
        input.value = `Picked Location (${lat.toFixed(4)}, ${lon.toFixed(4)})`;

        this.isPickingTravelTimeOrigin = false;
        document.getElementById('app-container')?.classList.remove('picking-location');
        this.toggleTravelTimePanel(true); // Show panel again
    }

    handleGenerateTravelTimeMap() {
        if (!this.travelTimeOrigin) {
            this.showToast('Please select a starting point first.', 'warning');
            return;
        }
        
        const intervals = [15, 30, 45, 60]
            .filter(min => (document.getElementById(`tt-${min}`) as HTMLInputElement).checked)
            .sort((a, b) => b - a); // Sort descending to draw largest circle first

        if (intervals.length === 0) {
            this.showToast('Please select at least one time interval.', 'warning');
            return;
        }

        this.handleClearTravelTimeMap(false); // Clear previous map without resetting inputs

        const AVERAGE_SPEED_KPH = 40; // Average speed in km/h for estimation
        const M_PER_SEC_PER_KPH = 1000 / 3600;

        intervals.forEach(minutes => {
            const distanceMeters = AVERAGE_SPEED_KPH * M_PER_SEC_PER_KPH * (minutes * 60);
            
            let color;
            if (minutes <= 15) color = Cesium.Color.fromCssColorString('rgba(46, 204, 113, 0.5)'); // Green
            else if (minutes <= 30) color = Cesium.Color.fromCssColorString('rgba(241, 196, 15, 0.5)'); // Yellow
            else if (minutes <= 45) color = Cesium.Color.fromCssColorString('rgba(230, 126, 34, 0.5)'); // Orange
            else color = Cesium.Color.fromCssColorString('rgba(231, 76, 60, 0.5)'); // Red

            this.travelTimeDataSource.entities.add({
                position: Cesium.Cartesian3.fromDegrees(this.travelTimeOrigin!.lon, this.travelTimeOrigin!.lat),
                ellipse: {
                    semiMinorAxis: distanceMeters,
                    semiMajorAxis: distanceMeters,
                    material: color,
                    outline: true,
                    outlineColor: color.withAlpha(0.8),
                    outlineWidth: 2,
                }
            });
        });

        document.getElementById('travel-time-legend')?.classList.remove('hidden');
    }

    handleClearTravelTimeMap(resetInputs = true) {
        this.travelTimeDataSource.entities.removeAll();
        document.getElementById('travel-time-legend')?.classList.add('hidden');
        if (resetInputs) {
            this.travelTimeOrigin = null;
            (document.getElementById('travel-time-origin-input') as HTMLInputElement).value = '';
        }
    }

    // --- Find My Car ---

    openFindCarModal() {
        const modal = document.getElementById('find-car-modal')!;
        const noLocationView = document.getElementById('no-car-location-view')!;
        const savedLocationView = document.getElementById('car-location-saved-view')!;
        const savedAddressEl = document.getElementById('saved-car-address')!;

        if (this.carLocation) {
            noLocationView.classList.add('hidden');
            savedLocationView.classList.remove('hidden');
            savedAddressEl.textContent = `Lat: ${this.carLocation.lat.toFixed(5)}, Lon: ${this.carLocation.lon.toFixed(5)}`;
        } else {
            noLocationView.classList.remove('hidden');
            savedLocationView.classList.add('hidden');
        }
        modal.classList.remove('hidden');
    }

    saveCarLocation() {
        if (!this.userLocation) {
            this.showToast(this.translations.no_user_location_for_parking, 'warning');
            this.startGeolocation();
            return;
        }
        this.carLocation = { ...this.userLocation };
        localStorage.setItem('sadakSathiCarLocation', JSON.stringify(this.carLocation));
        this.updateCarLocationPin();
        this.openFindCarModal(); // Refresh modal view
        this.showToast(this.translations.car_location_saved_toast, 'success');
    }
    
    clearCarLocation() {
        this.carLocation = null;
        localStorage.removeItem('sadakSathiCarLocation');
        this.updateCarLocationPin();
        this.openFindCarModal(); // Refresh modal view
        this.showToast(this.translations.car_location_cleared_toast, 'info');
    }

    loadSavedCarLocation() {
        const savedLoc = localStorage.getItem('sadakSathiCarLocation');
        if (savedLoc) {
            try {
                this.carLocation = JSON.parse(savedLoc);
                this.updateCarLocationPin();
            } catch (e) {
                console.error("Failed to parse saved car location", e);
                localStorage.removeItem('sadakSathiCarLocation');
            }
        }
    }

    updateCarLocationPin() {
        this.carLocationDataSource.entities.removeAll();
        if (this.carLocation) {
            const carEntity = this.carLocationDataSource.entities.add({
                position: Cesium.Cartesian3.fromDegrees(this.carLocation.lon, this.carLocation.lat),
            });
            this.styleEntityAsBillboard(carEntity, 'directions_car', '#3498db');
        }
    }

    routeToCar() {
        if (!this.userLocation) {
            this.showToast("Your current location isn't available. Please enable GPS.", 'warning');
            return;
        }
        if (!this.carLocation) {
            this.showToast("No car location is saved.", 'error');
            return;
        }

        document.getElementById('find-car-modal')?.classList.add('hidden');
        this.setUiMode('routing');

        (document.getElementById('from-input') as HTMLInputElement).value = this.translations.current_location_label;
        (document.getElementById('to-input') as HTMLInputElement).value = this.translations.route_to_my_car;
        
        this.findRoute();
    }
}

// Instantiate the app to start it
new SadakSathiApp();