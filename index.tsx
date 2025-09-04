

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
 * All API keys (Gemini, Weather, Traffic services) are now handled by a secure
 * backend (simulated here). The frontend application makes requests to its own
 * backend endpoints (e.g., /api/chat), and the backend securely manages all
 * external API keys and communication. This is a critical security practice.
 * =================================================================================
 */

// NOTE: The GoogleGenAI import is removed as all AI calls now go through a secure backend proxy.

// Declare Leaflet as a global variable to be used from the script tag.
declare var L: any;
// Declare Firebase as a global variable
declare var firebase: any;

// Web Speech API
const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
// FIX: Renamed SpeechSynthesis constant to avoid conflict with built-in SpeechSynthesis type.
const speechSynthesis = window.speechSynthesis;

const NEPAL_BOUNDS = [[26.3, 80.0], [30.5, 88.2]]; // [[south, west], [north, east]]
const INITIAL_VIEW = { center: [28.3949, 84.1240], zoom: 7 };

const en_translations = {
    // Loading Screen
    "loading_initializing": "Initializing...",
    "loading_map": "Preparing the map...",
    "loading_voices": "Warming up AI voices...",
    "loading_data": "Connecting to live data...",
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
    "traffic": "Live Traffic",
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
    "route_details_eta": "ETA",
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
    private map: any;
    private tileLayers: { [key: string]: any } = {};
    private allRoadData: any[] = [];
    private roadLayer: any;
    private poiLayer: any;
    private incidentLayer: any;
    private trafficLayer: any;
    private routeLayer: any;
    private travelTimeLayer: any;
    private carLocationLayer: any;
    private userLocationMarker: any = null;
    private userLocation: { lon: number, lat: number } | null = null;
    private isChatOpen: boolean = false;
    private chatHistory: { role: string, parts: { text: string }[] }[] = [];
    private recognition: any;
    private isRecognizing: boolean = false;
    private currentLang: string = 'en';
    private translations: any = {};
    private ipCamUrl: string = '';
    private activeVoiceContext: string = 'none'; // 'chat', 'unified-search', etc.

    // --- NEW: Backend API Simulation ---
    private backend = {
        getChatResponse: async (history: any[], message: string, systemInstruction: string) => {
            console.log("SIMULATING BACKEND CALL: /api/chat with message:", message);
            await new Promise(res => setTimeout(res, 1200));
            // A more intelligent mock based on the persona
            let response = `This is a simulated response for: "${message}".`;
            if (systemInstruction.includes("friendly")) response = `Hey there! In response to "${message}", here is some friendly advice.`;
            if (systemInstruction.includes("formal")) response = `Acknowledged. Regarding your query about "${message}", the data indicates the following.`;
            if (systemInstruction.includes("guide")) response = `An excellent question! Let me tell you all about "${message}". It's a fascinating topic.`;
            if (message.toLowerCase().includes("hello")) response = "Hello! I am Sadak Sathi, your backend-powered road companion."
            return { text: response };
        },
        refineImageWithAI: async (imageData: {data: string, mimeType: string}, prompt: string) => {
             console.log("SIMULATING BACKEND CALL: /api/refineImage");
             await new Promise(res => setTimeout(res, 2500));
             // For simulation, we just return the original image. A real backend would return a new one.
             return { refinedImage: imageData };
        },
        getWeather: async (lat: number, lon: number) => {
            console.log(`SIMULATING BACKEND CALL: /api/getWeather for ${lat},${lon}`);
            await new Promise(res => setTimeout(res, 500));
            const weatherTypes = [
                { icon: 'wb_sunny', desc: 'Clear Sky', temp: 28 },
                { icon: 'partly_cloudy_day', desc: 'Partly Cloudy', temp: 25 },
                { icon: 'cloud', desc: 'Overcast', temp: 22 },
                { icon: 'rainy', desc: 'Light Rain', temp: 20 },
            ];
            const mockWeather = weatherTypes[Math.floor(Math.random() * weatherTypes.length)];
            return mockWeather;
        },
        getTraffic: async () => {
             console.log("SIMULATING BACKEND CALL: /api/getTraffic");
             await new Promise(res => setTimeout(res, 800));
             // Mock GeoJSON with traffic data
             const mockTrafficFeature = (coords: number[][], level: 'light' | 'moderate' | 'heavy') => ({
                 type: "Feature",
                 properties: { traffic: level },
                 geometry: { type: "LineString", coordinates: coords }
             });
             return {
                 type: "FeatureCollection",
                 features: [
                     mockTrafficFeature([[85.3240, 27.7172], [85.3300, 27.7180], [85.3350, 27.7190]], 'heavy'),
                     mockTrafficFeature([[83.9856, 28.2096], [83.9820, 28.2150], [83.9800, 28.2200]], 'moderate'),
                     mockTrafficFeature([[85.3100, 27.7000], [85.3150, 27.6950]], 'light'),
                 ]
             };
        }
    };
    
    // --- Firebase Integration ---
    private firebaseApp: any;
    private auth: any;
    private db: any;
    private currentUser: any = null;
    private firestoreUnsubscribers: (() => void)[] = [];
    private loginEmail: string = '';
    
    // AI Persona State
    private aiAvatarUrl: string = 'https://i.imgur.com/r33W56s.png';
    private aiPersonality: string = 'friendly';
    private aiRelationship: string = 'friend';
    private aiVoice: string = 'female';
    private availableVoices: SpeechSynthesisVoice[] = [];
    
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

    private readonly routeColorMap = {
        fastest: '#2ecc71',
        alternative: '#3498db',
        scenic: '#9b59b6',
        'toll-free': '#f39c12'
    };

    private adminDataCache: { [key: string]: any[] } = {};
    private currentAdminTab: string = 'Road';
    private currentAdminSort = { key: '', order: 'asc' };
    private isFetchingAdminData: boolean = false;


    constructor() {
        this.loadingOverlay = document.getElementById('loading-overlay')!;
        this.loadingMessage = document.getElementById('loading-message')!;
        this.init();
    }

    async init() {
        this.updateLoadingProgress(10, 'loading_initializing');

        this.initFirebase();
        this.setupAuthListener();

        await this.loadTranslations(this.currentLang);
        this.updateUIForLanguage();
        this.updateLoadingProgress(20, 'loading_map');
        
        await this.initMap();
        this.updateLoadingProgress(40, 'loading_voices');

        this.loadVoices();
        this.updateLoadingProgress(60, 'loading_data');
        
        this.listenForFirestoreData();
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
    
    initFirebase() {
        try {
            this.firebaseApp = firebase.app();
            this.auth = firebase.auth();
            this.db = firebase.firestore();
        } catch (e) {
            console.error("Error initializing Firebase:", e);
            this.showToast("Could not connect to backend services.", "error");
        }
    }

    setupAuthListener() {
        if (!this.auth) return;
        this.auth.onAuthStateChanged((user: any) => {
            this.currentUser = user;
            this.updateAuthUI(user);
        });
    }
    
    async updateAuthUI(user: any) {
        const loginView = document.getElementById('login-view')!;
        const profileView = document.getElementById('profile-view')!;
        const otpView = document.getElementById('otp-view')!;
    
        if (user) {
            loginView.classList.add('hidden');
            otpView.classList.add('hidden');
            profileView.classList.remove('hidden');
            document.getElementById('profile-email')!.textContent = user.email;
    
            // Check for admin privileges
            try {
                const adminsRef = this.db.collection('Admins');
                const q = adminsRef.where('email', '==', user.email);
                const querySnapshot = await q.get();
                const adminPanelBtn = document.getElementById('admin-panel-btn')!;
                if (!querySnapshot.empty) {
                    adminPanelBtn.classList.remove('hidden');
                } else {
                    adminPanelBtn.classList.add('hidden');
                }
            } catch (error) {
                console.error("Failed to check admin status:", error);
            }
        } else {
            loginView.classList.remove('hidden');
            profileView.classList.add('hidden');
            otpView.classList.add('hidden');
        }
    }

    listenForFirestoreData() {
        if (!this.db) {
            this.showToast('Could not fetch map data.', 'error');
            return;
        }

        this.allRoadData = [];

        const processSnapshot = (querySnapshot: any, type: string) => {
            const featuresFromSnapshot: any[] = [];
            querySnapshot.forEach((doc: any) => {
                const data = doc.data();
                let geometry = data.geometry;

                if (!geometry && typeof data.lat === 'number' && typeof data.lon === 'number') {
                    geometry = { type: 'Point', coordinates: [data.lon, data.lat] };
                }

                if (geometry) {
                    const properties = { ...data, entityType: type, id: doc.id };
                    delete properties.geometry;
                    featuresFromSnapshot.push({
                        type: 'Feature',
                        geometry: geometry,
                        properties: properties,
                    });
                }
            });

            this.allRoadData = this.allRoadData.filter(f => f.properties.entityType !== type).concat(featuresFromSnapshot);
            this.processAndDisplayData(this.allRoadData);
            
            if (!document.getElementById('admin-panel-modal')?.classList.contains('hidden')) {
                const collectionName = type.charAt(0).toUpperCase() + type.slice(1);
                if (['Road', 'Bridge', 'Toll'].includes(collectionName) || (collectionName === 'Incident' && type === 'incident')) {
                   const adminCollectionName = type === 'incident' ? 'UserReported' : collectionName;
                   const data = featuresFromSnapshot.map(f => ({...f.properties}));
                   this.adminDataCache[adminCollectionName] = data;
                   if (this.currentAdminTab === adminCollectionName) {
                       this.displayAdminData(this.currentAdminTab);
                   }
                }
            }
        };
        
        this.firestoreUnsubscribers.forEach(unsub => unsub());
        this.firestoreUnsubscribers = [];

        this.firestoreUnsubscribers.push(this.db.collection('Road').onSnapshot((snap: any) => processSnapshot(snap, 'road'), (err:any) => console.error("Road listener error:", err)));
        this.firestoreUnsubscribers.push(this.db.collection('Bridge').onSnapshot((snap: any) => processSnapshot(snap, 'poi'), (err:any) => console.error("Bridge listener error:", err)));
        this.firestoreUnsubscribers.push(this.db.collection('UserReported').onSnapshot((snap: any) => processSnapshot(snap, 'incident'), (err:any) => console.error("UserReported listener error:", err)));
        this.firestoreUnsubscribers.push(this.db.collection('Toll').onSnapshot((snap: any) => processSnapshot(snap, 'poi'), (err:any) => console.error("Toll listener error:", err)));
    }


    async initMap() {
        try {
            this.map = L.map('map', {
                zoomControl: false, 
                attributionControl: false,
            }).setView(INITIAL_VIEW.center, INITIAL_VIEW.zoom);
    
            this.tileLayers = {
                streets: L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                }),
                satellite: L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
                    attribution: 'Tiles &copy; Esri'
                }),
                dark: L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
                    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
                })
            };
    
            this.tileLayers.streets.addTo(this.map);
            L.control.attribution({ position: 'bottomright' }).addTo(this.map);

            this.map.fitBounds(NEPAL_BOUNDS);
            this.map.setMinZoom(6);
    
            this.roadLayer = L.layerGroup().addTo(this.map);
            this.poiLayer = L.layerGroup().addTo(this.map);
            this.incidentLayer = L.layerGroup().addTo(this.map);
            this.trafficLayer = L.layerGroup(); // Do not add to map by default
            this.routeLayer = L.layerGroup().addTo(this.map);
            this.travelTimeLayer = L.layerGroup().addTo(this.map);
            this.carLocationLayer = L.layerGroup().addTo(this.map);
    
            document.querySelector(`.style-option[data-style="streets"]`)?.classList.add('active');
            
            this.map.on('click', (e: any) => {
                if (!this.isPickingTravelTimeOrigin) {
                    this.hideDetailCard();
                }
            });

        } catch (error) {
            console.error("CRITICAL: Leaflet Map failed to initialize.", error);
            const mapDiv = document.getElementById('map')!;
            mapDiv.innerHTML = `<div style="padding: 2rem; text-align: center; color: var(--danger-color);">
                <h2>Map Failed to Load</h2>
                <p>There was a critical error initializing the map. Please check your browser compatibility and network connection, then refresh the page.</p>
            </div>`;
            this.hideLoadingScreen(); 
        }
    }

    processAndDisplayData(features: any[]) {
        if (!Array.isArray(features)) {
            console.error("Received non-array data for processing:", features);
            return;
        }
        const roadFeatures = features.filter(f => f.properties.entityType === 'road');
        const poiFeatures = features.filter(f => f.properties.entityType === 'poi');
        const incidentFeatures = features.filter(f => f.properties.entityType === 'incident' && f.properties.approvalStatus === 'approved');

        this.loadDataIntoLayer(this.roadLayer, { type: 'FeatureCollection', features: roadFeatures });
        this.loadDataIntoLayer(this.poiLayer, { type: 'FeatureCollection', features: poiFeatures });
        this.loadDataIntoLayer(this.incidentLayer, { type: 'FeatureCollection', features: incidentFeatures });
    }

    loadDataIntoLayer(layerGroup: any, geojson: any) {
        layerGroup.clearLayers();
        const geoJsonLayer = L.geoJSON(geojson, {
            style: (feature: any) => {
                if (feature.geometry.type !== 'Point') {
                    return {
                        color: this.getRoadColor(feature.properties.status),
                        weight: 4,
                        opacity: 0.8
                    };
                }
            },
            pointToLayer: (feature: any, latlng: any) => {
                const props = feature.properties;
                let iconStyle;
                if (props.entityType === 'poi') {
                    iconStyle = this.getIconStyleForPoi(props.category || props.name);
                } else { // incident
                    iconStyle = { icon: 'warning', color: '#e74c3c' };
                }
                const icon = this.getDivIcon(iconStyle.icon, iconStyle.color);
                return L.marker(latlng, { icon: icon });
            },
            onEachFeature: (feature: any, layer: any) => {
                layer.on('click', (e: any) => {
                    L.DomEvent.stopPropagation(e);
                    this.handleEntityClick(feature, layer);
                });
            }
        });
        layerGroup.addLayer(geoJsonLayer);
    }
    
    getRoadColor(status: any) {
        const statusString = this.getDisplayablePropertyValue(status, 'unknown').toLowerCase();
        switch (statusString) {
            case 'open': case 'resumed': return '#2ecc71';
            case 'blocked': return '#e74c3c';
            case 'restricted': case 'one-lane': return '#f39c12';
            case 'construction': return '#e67e22';
            default: return '#95a5a6';
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
        if (cat.includes('bridge')) return { icon: 'water', color: '#3498db' };
        if (cat.includes('toll')) return { icon: 'toll', color: '#9b59b6' };
        return { icon: 'place', color: '#7f8c8d' };
    }
    
    getDivIcon(iconName: string, color: string): any {
        return L.divIcon({
            html: `<div style="background-color:${color}; width:32px; height:32px; border-radius:50%; display:flex; align-items:center; justify-content:center; border: 2px solid white; box-shadow: 0 2px 5px rgba(0,0,0,0.3);">
                     <span class="material-icons" style="color:white; font-size: 20px;">${iconName}</span>
                   </div>`,
            className: '',
            iconSize: [32, 32],
            iconAnchor: [16, 32],
            popupAnchor: [0, -32]
        });
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

        document.getElementById('zoom-in-btn')?.addEventListener('click', () => this.map.zoomIn());
        document.getElementById('zoom-out-btn')?.addEventListener('click', () => this.map.zoomOut());
        document.getElementById('center-location-btn')?.addEventListener('click', () => this.centerOnUserLocation());

        const mapOptionsBtn = document.getElementById('map-options-btn');
        const mapOptionsPopup = document.getElementById('map-options-popup');
        mapOptionsBtn?.addEventListener('click', (e) => {
            e.stopPropagation();
            mapOptionsPopup?.classList.toggle('hidden');
        });

        document.getElementById('toggle-roads')?.addEventListener('change', (e) => this.toggleDataSourceVisibility('road', (e.target as HTMLInputElement).checked));
        document.getElementById('toggle-pois')?.addEventListener('change', (e) => this.toggleDataSourceVisibility('poi', (e.target as HTMLInputElement).checked));
        document.getElementById('toggle-incidents')?.addEventListener('change', (e) => this.toggleDataSourceVisibility('incident', (e.target as HTMLInputElement).checked));
        document.getElementById('toggle-traffic')?.addEventListener('change', (e) => this.toggleTrafficLayer((e.target as HTMLInputElement).checked));
        
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
        
        document.getElementById('unified-search-ai-btn')?.addEventListener('click', () => this.openChat());
        document.getElementById('unified-search-voice-btn')?.addEventListener('click', () => this.startVoiceCommand('unified-search'));
        document.getElementById('unified-search-action-btn')?.addEventListener('click', () => this.performSearch());
        document.getElementById('unified-search-input')?.addEventListener('keyup', (e) => { if(e.key === 'Enter') this.performSearch() });

        document.getElementById('find-route-btn')?.addEventListener('click', () => this.findRoute());
        document.getElementById('clear-route-btn')?.addEventListener('click', () => this.clearRoute());
        document.getElementById('swap-locations-btn')?.addEventListener('click', () => this.swapRouteLocations());

        document.getElementById('route-details-close')?.addEventListener('click', () => this.hideRouteDetails());
        document.getElementById('start-navigation-btn')?.addEventListener('click', () => this.startNavigation());


        document.getElementById('close-chat-btn')?.addEventListener('click', () => this.closeChat());
        document.getElementById('chat-form')?.addEventListener('submit', (e) => this.handleChatMessage(e));
        document.getElementById('voice-command-btn')?.addEventListener('click', () => this.startVoiceCommand('chat'));
        document.getElementById('context-chat-btn')?.addEventListener('click', () => this.askAboutContext(true));
        
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
        
        document.getElementById('route-pref-highways')?.addEventListener('change', () => this.saveSettings());
        document.getElementById('route-pref-no-tolls')?.addEventListener('change', () => this.saveSettings());
        document.getElementById('route-pref-scenic')?.addEventListener('change', () => this.saveSettings());
        
        document.getElementById('fab-main-btn')?.addEventListener('click', (e) => {
            (e.currentTarget as HTMLElement).classList.toggle('open');
            document.getElementById('fab-menu-items')?.classList.toggle('hidden');
        });
        document.getElementById('fab-ai-btn')?.addEventListener('click', () => this.openChat());
        document.getElementById('fab-settings-btn')?.addEventListener('click', () => document.getElementById('settings-panel')?.classList.add('open'));
        document.getElementById('fab-profile-btn')?.addEventListener('click', () => this.openProfileModal());
        document.getElementById('fab-find-car-btn')?.addEventListener('click', () => this.openFindCarModal());

        document.getElementById('login-form')?.addEventListener('submit', (e) => this.handleLoginSubmit(e));
        document.getElementById('otp-form')?.addEventListener('submit', (e) => this.handleOtpSubmitAsPassword(e));
        document.getElementById('logout-btn')?.addEventListener('click', () => this.handleLogout());
        document.querySelector('#profile-modal .modal-close-btn')?.addEventListener('click', () => document.getElementById('profile-modal')?.classList.add('hidden'));
        document.getElementById('open-settings-btn')?.addEventListener('click', () => {
            document.getElementById('profile-modal')?.classList.add('hidden');
            document.getElementById('settings-panel')?.classList.add('open');
        });
        document.getElementById('admin-panel-btn')?.addEventListener('click', () => this.openAdminPanel());

        document.getElementById('report-incident-fab')?.addEventListener('click', () => this.openReportIncidentModal());
        document.getElementById('report-incident-close')?.addEventListener('click', () => document.getElementById('report-incident-modal')?.classList.add('hidden'));
        document.getElementById('report-incident-form')?.addEventListener('submit', (e) => this.handleIncidentReportSubmit(e));
        document.getElementById('incident-image-upload')?.addEventListener('change', (e) => this.handleIncidentImageUpload(e));
        document.getElementById('refine-image-btn')?.addEventListener('click', () => this.handleImageRefinement());
        
        document.getElementById('travel-time-btn')?.addEventListener('click', () => this.toggleTravelTimePanel(true));
        document.getElementById('travel-time-close-btn')?.addEventListener('click', () => this.toggleTravelTimePanel(false));
        document.getElementById('travel-time-use-current-loc')?.addEventListener('click', () => this.setTravelTimeOriginFromUserLocation());
        document.getElementById('travel-time-pick-on-map')?.addEventListener('click', () => this.handlePickTravelTimeOrigin());
        document.getElementById('generate-travel-time-map-btn')?.addEventListener('click', () => this.handleGenerateTravelTimeMap());
        document.getElementById('clear-travel-time-map-btn')?.addEventListener('click', () => this.handleClearTravelTimeMap());

        document.getElementById('find-car-close-btn')?.addEventListener('click', () => document.getElementById('find-car-modal')?.classList.add('hidden'));
        document.getElementById('park-here-btn')?.addEventListener('click', () => this.saveCarLocation());
        document.getElementById('get-directions-to-car-btn')?.addEventListener('click', () => this.routeToCar());
        document.getElementById('clear-car-location-btn')?.addEventListener('click', () => this.clearCarLocation());

        document.getElementById('permission-modal-close-btn')?.addEventListener('click', () => document.getElementById('permission-help-modal')?.classList.add('hidden'));

        document.getElementById('admin-panel-close-btn')?.addEventListener('click', () => document.getElementById('admin-panel-modal')?.classList.add('hidden'));
        document.querySelectorAll('.admin-tab-btn').forEach(btn => btn.addEventListener('click', (e) => this.handleAdminTabClick(e)));
        document.getElementById('admin-form-modal')?.addEventListener('click', (e) => {
            if (e.target === e.currentTarget) this.closeAdminFormModal();
        });
        document.getElementById('admin-form-close-btn')?.addEventListener('click', () => this.closeAdminFormModal());
        document.getElementById('admin-form-cancel-btn')?.addEventListener('click', () => this.closeAdminFormModal());
        document.getElementById('admin-edit-form')?.addEventListener('submit', (e) => this.handleAdminFormSubmit(e));


        document.addEventListener('click', (e) => {
            if (!langSelectorBtn?.contains(e.target as Node) && !langPopup?.contains(e.target as Node)) {
                langPopup?.classList.add('hidden');
            }
            if (!mapOptionsBtn?.contains(e.target as Node) && !mapOptionsPopup?.contains(e.target as Node)) {
                mapOptionsPopup?.classList.add('hidden');
            }
        });
        
        this.initSpeechRecognition();
        this.startGeolocation();
    }

    openProfileModal() {
        document.getElementById('profile-modal')?.classList.remove('hidden');
        if (!this.currentUser) {
            document.getElementById('login-view')?.classList.remove('hidden');
            document.getElementById('otp-view')?.classList.add('hidden');
            document.getElementById('profile-view')?.classList.add('hidden');
            (document.getElementById('login-email') as HTMLInputElement).value = '';
            (document.getElementById('otp-input') as HTMLInputElement).value = '';
        }
    }

    handleLoginSubmit(event: Event) {
        event.preventDefault();
        const emailInput = document.getElementById('login-email') as HTMLInputElement;
        const email = emailInput.value.trim();
        if (!email) return;

        this.loginEmail = email;
        document.getElementById('login-view')!.classList.add('hidden');
        document.getElementById('otp-view')!.classList.remove('hidden');
        document.getElementById('otp-email-display')!.textContent = email;
        (document.getElementById('otp-input') as HTMLInputElement).focus();
    }

    async handleOtpSubmitAsPassword(event: Event) {
        event.preventDefault();
        const passwordInput = document.getElementById('otp-input') as HTMLInputElement;
        const password = passwordInput.value;
        if (!password || !this.loginEmail) return;

        try {
            await this.auth.signInWithEmailAndPassword(this.loginEmail, password);
            this.showToast('Login successful!', 'success');
            document.getElementById('profile-modal')?.classList.add('hidden');
        } catch (error: any) {
            if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password') {
                 try {
                    await this.auth.createUserWithEmailAndPassword(this.loginEmail, password);
                    this.showToast('New account created and logged in!', 'success');
                    document.getElementById('profile-modal')?.classList.add('hidden');
                } catch (createError: any) {
                    console.error("Sign up error:", createError);
                    this.showToast(`Sign up failed: ${createError.message}`, 'error');
                }
            } else {
                console.error("Sign in error:", error);
                this.showToast(`Login failed: ${error.message}`, 'error');
            }
        } finally {
            this.loginEmail = '';
            passwordInput.value = '';
        }
    }

    async handleLogout() {
        try {
            await this.auth.signOut();
            this.showToast('Logged out successfully.', 'info');
            document.getElementById('profile-modal')?.classList.add('hidden');
        } catch (error: any) {
            console.error("Logout error:", error);
            this.showToast(`Logout failed: ${error.message}`, 'error');
        }
    }


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
    
    async loadTranslations(lang: string) {
        if (lang === 'en') {
            this.translations = en_translations;
            return;
        }
        try {
            this.showToast(`Translation for ${lang} not available yet.`, 'info');
            this.translations = en_translations;
        } catch (error) {
            console.error(`Failed to load translations for ${lang}`, error);
            this.translations = en_translations;
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
        const layerGroup = (this as any)[`${sourceName}Layer`];
        if (layerGroup) {
            if (isVisible) {
                this.map.addLayer(layerGroup);
            } else {
                this.map.removeLayer(layerGroup);
            }
        }
    }

    async toggleTrafficLayer(isVisible: boolean) {
        if (isVisible) {
            this.map.addLayer(this.trafficLayer);
            try {
                const trafficData = await this.backend.getTraffic();
                this.trafficLayer.clearLayers();
                L.geoJSON(trafficData, {
                    style: (feature: any) => ({
                        className: `traffic-${feature.properties.traffic}`,
                        weight: 5,
                        opacity: 0.7
                    })
                }).addTo(this.trafficLayer);
            } catch (error) {
                console.error("Failed to fetch traffic data", error);
                this.showToast("Could not load live traffic.", "error");
            }
        } else {
            this.map.removeLayer(this.trafficLayer);
        }
    }
    
    changeMapStyle(style: string) {
        Object.values(this.tileLayers).forEach(layer => this.map.removeLayer(layer));
        if (this.tileLayers[style]) {
            this.tileLayers[style].addTo(this.map);
        } else {
            this.tileLayers.streets.addTo(this.map);
        }
    }

    async showDetailCard(feature: any) {
        const card = document.getElementById('detail-card')!;
        const titleEl = document.getElementById('detail-card-title')!;
        const contentEl = document.getElementById('detail-card-content')!;
        const actionsEl = document.getElementById('detail-card-actions')!;
        const props = feature.properties;

        this.selectedEntityContext = props;
        
        let contentHtml = '';
        titleEl.textContent = this.getDisplayablePropertyValue(props.name, 'Details');

        if (props.entityType === 'poi' || props.entityType === 'incident') {
            const [lon, lat] = feature.geometry.coordinates;
            this.fetchAndDisplayWeather(lat, lon);
            if (props.entityType === 'poi') {
                 contentHtml = `
                    <p><strong>Category:</strong> ${this.getDisplayablePropertyValue(props.category, 'N/A')}</p>
                    <p><strong>Description:</strong> ${this.getDisplayablePropertyValue(props.description, 'No description available.')}</p>
                `;
            } else { // incident
                 const incidentType = this.getDisplayablePropertyValue(props.incident_type, 'N/A');
                 const timestamp = props.timestamp?.toDate ? props.timestamp.toDate() : new Date(props.timestamp);
                 contentHtml = `
                    <p><strong>Type:</strong> <span class="status-${incidentType.toLowerCase()}">${incidentType}</span></p>
                    <p><strong>Details:</strong> ${this.getDisplayablePropertyValue(props.details, 'No details provided.')}</p>
                    <p><strong>Reported:</strong> ${timestamp.toLocaleString()}</p>
                `;
            }
        } else { // road
            document.getElementById('detail-card-weather')?.classList.add('hidden');
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
        
        document.getElementById('dc-dir-to')?.addEventListener('click', () => this.handleDirectionsTo(feature));
        document.getElementById('dc-dir-from')?.addEventListener('click', () => this.handleDirectionsFrom(feature));
        document.getElementById('dc-ask-ai')?.addEventListener('click', () => this.askAboutContext(true));

        card.classList.add('visible');
    }

    async fetchAndDisplayWeather(lat: number, lon: number) {
        const weatherEl = document.getElementById('detail-card-weather')!;
        try {
            const weatherData = await this.backend.getWeather(lat, lon);
            const iconEl = document.getElementById('weather-icon')!;
            const tempEl = document.getElementById('weather-temp')!;
            const descEl = document.getElementById('weather-desc')!;

            iconEl.textContent = weatherData.icon;
            tempEl.textContent = `${weatherData.temp}°C`;
            descEl.textContent = weatherData.desc;
            weatherEl.classList.remove('hidden');
        } catch (error) {
            console.error("Failed to fetch weather data:", error);
            weatherEl.classList.add('hidden');
        }
    }

    hideDetailCard() {
        document.getElementById('detail-card')?.classList.remove('visible');
        this.selectedEntityContext = null;
    }

    handleEntityClick(feature: any, layer: any) {
        if (feature.geometry.type === 'Point') {
            const [lon, lat] = feature.geometry.coordinates;
            this.map.flyTo([lat, lon], 14);
        } else {
            this.map.flyToBounds(layer.getBounds(), { paddingTopLeft: [0, 80], paddingBottomRight: [0, 350]});
        }
        this.showDetailCard(feature);
    }
    
    showToast(message: string, type: 'info' | 'success' | 'warning' | 'error' = 'info') {
        const toast = document.getElementById('toast-notification')!;
        const icon = document.getElementById('toast-icon')!;
        const messageEl = document.getElementById('toast-message')!;

        toast.className = 'hidden';
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
        if (value === null || typeof value === 'undefined') {
            return fallback;
        }
        if (typeof value === 'object' && value !== null) {
             if (value.toDate) {
                return value.toDate().toLocaleString();
            }
            return JSON.stringify(value);
        }
        return String(value);
    }

    private safeStringify(value: any, fallback: string): string {
        if (value === null || typeof value === 'undefined' || value === '') {
            return fallback;
        }
        return String(value);
    }

    startGeolocation() {
        if (!this.hasRequestedGeolocation) {
            this.hasRequestedGeolocation = true;
            if ('geolocation' in navigator) {
                this.map.locate({ watch: true, setView: false, enableHighAccuracy: true });
                this.map.on('locationfound', (e: any) => this.updateUserLocation(e));
                this.map.on('locationerror', (e: any) => {
                    console.warn('Geolocation error:', e.message);
                    this.showToast('Could not get your location.', 'warning');
                    this.isGeolocationActive = false;
                    document.getElementById('gps-status-indicator')?.classList.remove('active');
                });
            } else {
                this.showToast('Geolocation is not supported by this browser.', 'error');
            }
        }
    }
    
    updateUserLocation(e: any) {
        this.isGeolocationActive = true;
        this.userLocation = {
            lon: e.latlng.lng,
            lat: e.latlng.lat,
        };
    
        if (!this.userLocationMarker) {
            const icon = this.getDivIcon('navigation', '#007aff');
            this.userLocationMarker = L.marker(e.latlng, { icon: icon }).addTo(this.map);
        } else {
            this.userLocationMarker.setLatLng(e.latlng);
        }
        document.getElementById('gps-status-indicator')?.classList.add('active');
    }

    centerOnUserLocation() {
        if (this.userLocation) {
            this.map.flyTo([this.userLocation.lat, this.userLocation.lon], 15);
        } else {
            this.showToast('Your location is not available yet.', 'info');
            this.startGeolocation();
        }
    }
    
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

    handleDirectionsTo(feature: any) {
        if (!this.userLocation) {
            this.showToast("Your location isn't available. Please enable GPS.", 'warning');
            return;
        }
        this.hideDetailCard();
        this.setUiMode('routing');
    
        (document.getElementById('to-input') as HTMLInputElement).value = this.getDisplayablePropertyValue(feature.properties.name, 'Selected Location');
        (document.getElementById('from-input') as HTMLInputElement).value = this.translations.current_location_label;
    
        this.findRoute();
    }
    
    handleDirectionsFrom(feature: any) {
        this.hideDetailCard();
        this.setUiMode('routing');
    
        (document.getElementById('from-input') as HTMLInputElement).value = this.getDisplayablePropertyValue(feature.properties.name, 'Selected Location');
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

        const numPoints = 20;
        const dx = (endLon - startLon) / numPoints;
        const dy = (endLat - startLat) / numPoints;

        for (let i = 1; i < numPoints; i++) {
            let lon = startLon + i * dx;
            let lat = startLat + i * dy;
            let deviationFactor = 0.08;
            if (type === 'scenic') deviationFactor = 0.25;
            if (type === 'alternative') deviationFactor = 0.15;
            const progress = i / numPoints;
            lon += Math.sin(progress * Math.PI * 4) * deviationFactor * (endLat - startLat);
            lat += Math.cos(progress * Math.PI * 4) * deviationFactor * (endLon - startLon);
            
            coordinates.push([lon, lat]);
        }
        coordinates.push([endLon, endLat]);
        return { type: 'LineString', coordinates: coordinates };
    }

    private drawAllRouteOptions() {
        this.routeLayer.clearLayers();
        if (this.availableRoutes.length === 0) return;
    
        const firstRoute = this.availableRoutes[0];
        const startCoords = firstRoute.geometry.coordinates[0];
        const endCoords = firstRoute.geometry.coordinates[firstRoute.geometry.coordinates.length - 1];
    
        this.routeLayer.addLayer(L.marker([startCoords[1], startCoords[0]], { icon: this.getDivIcon('flag', '#2ecc71') }));
        this.routeLayer.addLayer(L.marker([endCoords[1], endCoords[0]], { icon: this.getDivIcon('place', '#e74c3c') }));
    
        const routeLayers: any[] = [];
        this.availableRoutes.forEach(route => {
            const latLngs = route.geometry.coordinates.map((coord: number[]) => [coord[1], coord[0]]);
            const color = this.routeColorMap[route.id as keyof typeof this.routeColorMap] || '#808080';
            const polyline = L.polyline(latLngs, {
                color: color,
                weight: 3,
                opacity: 0.5,
                routeId: route.id,
            });
            this.routeLayer.addLayer(polyline);
            routeLayers.push(polyline);
        });

        if (routeLayers.length > 0) {
            const routesBounds = L.featureGroup(routeLayers).getBounds();
            this.map.flyToBounds(routesBounds, { padding: [50, 50] });
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
        const routeDetailsPanel = document.getElementById('route-details-panel')!;
        const loader = document.getElementById('route-loading-overlay')!;
        routeDetailsPanel.classList.remove('hidden');
        loader.classList.remove('hidden');
        document.getElementById('route-alternatives-container')?.classList.add('hidden');
        document.getElementById('route-preferences-summary')?.classList.add('hidden');
    
        await new Promise(resolve => setTimeout(resolve, 1500));
    
        let baseTime = 120 + Math.floor(Math.random() * 30);
        let baseDistance = 100 + Math.floor(Math.random() * 20);
        const roadConditions = [
            { status: 'Light Traffic', summaryKey: 'route_summary_traffic_light', timeModifier: 1.0 },
            { status: 'Moderate Traffic', summaryKey: 'route_summary_traffic_moderate', timeModifier: 1.2 },
            { status: 'Accident Ahead', summaryKey: 'route_summary_accident', timeModifier: 1.5 }
        ];

        const preferHighways = (document.getElementById('route-pref-highways') as HTMLInputElement).checked;
        const preferScenic = (document.getElementById('route-pref-scenic') as HTMLInputElement).checked;
        const avoidTolls = (document.getElementById('route-pref-no-tolls') as HTMLInputElement).checked;
        
        if (preferHighways) {
            baseTime -= 15;
            baseDistance -= 5;
        }

        const startLon = 81 + Math.random() * 6;
        const startLat = 27 + Math.random() * 2;
        const endLon = 81 + Math.random() * 6;
        const endLat = 27 + Math.random() * 2;
        const routes = [];
        const fastestCondition = roadConditions[Math.floor(Math.random() * 2)];
        const fastestTime = Math.round(baseTime * fastestCondition.timeModifier);
        const fastestRouteData = { id: 'fastest', name: 'Fastest', timeMins: fastestTime, distance: `${baseDistance} km`, time: `${Math.floor(fastestTime / 60)}h ${fastestTime % 60}m`, status: fastestCondition.status, summary: this.translations[fastestCondition.summaryKey], geometry: this.generateMockRouteGeometry(startLon, startLat, endLon, endLat, 'fastest') };
        routes.push({ ...fastestRouteData, directions: this.generateMockDirections(fastestRouteData, baseDistance) });
        const altCondition = roadConditions[Math.floor(Math.random() * roadConditions.length)];
        const altTime = Math.round((baseTime + 15) * altCondition.timeModifier);
        const altDistance = baseDistance + 10;
        const altRouteData = { id: 'alternative', name: 'Alternative', timeMins: altTime, distance: `${altDistance} km`, time: `${Math.floor(altTime / 60)}h ${altTime % 60}m`, status: altCondition.status, summary: this.translations[altCondition.summaryKey], geometry: this.generateMockRouteGeometry(startLon, startLat, endLon, endLat, 'alternative') };
        routes.push({ ...altRouteData, directions: this.generateMockDirections(altRouteData, altDistance) });
    
        if (preferScenic) {
            const scenicTime = Math.round((baseTime + 40) * 1.1);
            const scenicDistance = baseDistance + 25;
            const scenicRouteData = { id: 'scenic', name: 'Scenic', timeMins: scenicTime, distance: `${scenicDistance} km`, time: `${Math.floor(scenicTime / 60)}h ${scenicTime % 60}m`, status: 'Light Traffic', summary: this.translations.route_summary_scenic, geometry: this.generateMockRouteGeometry(startLon, startLat, endLon, endLat, 'scenic') };
            routes.push({ ...scenicRouteData, directions: this.generateMockDirections(scenicRouteData, scenicDistance) });
        } 
        
        if (avoidTolls) {
            const tollFreeTime = Math.round((baseTime + 25) * 1.15);
            const tollFreeDistance = baseDistance + 15;
            const tollFreeRouteData = { id: 'toll-free', name: 'No Tolls', timeMins: tollFreeTime, distance: `${tollFreeDistance} km`, time: `${Math.floor(tollFreeTime / 60)}h ${tollFreeTime % 60}m`, status: 'Moderate Traffic', summary: this.translations.route_summary_no_tolls, geometry: this.generateMockRouteGeometry(startLon, startLat, endLon, endLat, 'toll-free') };
            routes.push({ ...tollFreeRouteData, directions: this.generateMockDirections(tollFreeRouteData, tollFreeDistance) });
        }
    
        this.availableRoutes = routes.sort((a, b) => a.timeMins - b.timeMins);
        loader.classList.add('hidden');
        this.drawAllRouteOptions();
        this.displayRouteOptions(from, to);
    }

    displayRouteOptions(from: string, to: string) {
        const alternativesContainer = document.getElementById('route-alternatives')!;
        const container = document.getElementById('route-alternatives-container')!;
        alternativesContainer.innerHTML = '';
    
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
                card.addEventListener('click', () => this.selectRoute(route.id));
                alternativesContainer.appendChild(card);
            });
            container.classList.remove('hidden');
            this.selectRoute(this.availableRoutes[0].id, { from, to });
        }
    }

    selectRoute(routeId: string, startEnd?: { from: string, to: string }) {
        const selectedRoute = this.availableRoutes.find(r => r.id === routeId);
        if (!selectedRoute) return;
        this.activeRouteData = { ...selectedRoute, from: startEnd?.from || (document.getElementById('from-input') as HTMLInputElement).value, to: startEnd?.to || (document.getElementById('to-input') as HTMLInputElement).value };
        document.querySelectorAll('.route-alternative-card').forEach(card => card.classList.toggle('active', card.getAttribute('data-route-id') === routeId));
    
        this.routeLayer.eachLayer((layer: any) => {
            if (layer.options.routeId) {
                const isSelected = layer.options.routeId === routeId;
                layer.setStyle({
                    weight: isSelected ? 8 : 3,
                    opacity: isSelected ? 1.0 : 0.5
                });
                if(isSelected) layer.bringToFront();
            }
        });
    
        this.displayRouteDetails(this.activeRouteData);
        localStorage.setItem('sadakSathiLastRoute', JSON.stringify(this.activeRouteData));
    }

    clearRoute() {
        (document.getElementById('from-input') as HTMLInputElement).value = '';
        (document.getElementById('to-input') as HTMLInputElement).value = '';
        this.routeLayer.clearLayers();
        this.hideRouteDetails();
        this.activeRouteData = null;
        this.availableRoutes = [];
        document.getElementById('route-alternatives-container')?.classList.add('hidden');
        document.getElementById('route-preferences-summary')?.classList.add('hidden');
        localStorage.removeItem('sadakSathiLastRoute');
        this.setUiMode('search');
        this.map.flyTo(INITIAL_VIEW.center, INITIAL_VIEW.zoom);
    }
    
    displayRouteDetails(routeData: any) {
        document.getElementById('route-distance')!.textContent = routeData?.distance || '-- km';
        document.getElementById('route-time')!.textContent = routeData?.time || '-- min';
        document.getElementById('route-overall-status')!.textContent = routeData?.status || '--';

        if (routeData && typeof routeData.timeMins === 'number') {
            const now = new Date();
            const etaDate = new Date(now.getTime() + routeData.timeMins * 60000);
            const etaString = etaDate.toLocaleTimeString(this.currentLang.split('-')[0] || 'en', {
                hour: '2-digit',
                minute: '2-digit',
                hour12: true
            });
            document.getElementById('route-eta')!.textContent = etaString;
        } else {
            document.getElementById('route-eta')!.textContent = '--:--';
        }
        
        (document.getElementById('from-input') as HTMLInputElement).value = routeData?.from || '';
        (document.getElementById('to-input') as HTMLInputElement).value = routeData?.to || '';

        const directionsListEl = document.getElementById('route-directions-list')!;
        directionsListEl.innerHTML = '';
        if (routeData?.directions && Array.isArray(routeData.directions)) {
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
    
        const prefsContainer = document.getElementById('route-preferences-summary')!;
        const prefsList = document.getElementById('route-preferences-list')!;
        prefsList.innerHTML = '';
        const prefs = [];
        if ((document.getElementById('route-pref-highways') as HTMLInputElement).checked) prefs.push({icon: 'add_road', text: this.translations.prefer_highways});
        if ((document.getElementById('route-pref-no-tolls') as HTMLInputElement).checked) prefs.push({icon: 'no_transfer', text: this.translations.avoid_tolls});
        if ((document.getElementById('route-pref-scenic') as HTMLInputElement).checked) prefs.push({icon: 'landscape', text: this.translations.prefer_scenic_route});
    
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
                this.availableRoutes = [this.activeRouteData];
                this.displayRouteDetails(this.activeRouteData);

                this.routeLayer.clearLayers();
                if (this.activeRouteData?.geometry?.coordinates) {
                    const coords = this.activeRouteData.geometry.coordinates;
                    const startCoords = coords[0];
                    const endCoords = coords[coords.length - 1];
                    this.routeLayer.addLayer(L.marker([startCoords[1], startCoords[0]], { icon: this.getDivIcon('flag', '#2ecc71') }));
                    this.routeLayer.addLayer(L.marker([endCoords[1], endCoords[0]], { icon: this.getDivIcon('place', '#e74c3c') }));

                    const latLngs = coords.map((c: number[]) => [c[1], c[0]]);
                    const color = this.routeColorMap[this.activeRouteData.id as keyof typeof this.routeColorMap] || '#3388ff';
                    const polyline = L.polyline(latLngs, { color: color, weight: 8, opacity: 1.0 });
                    this.routeLayer.addLayer(polyline);

                    this.map.fitBounds(polyline.getBounds(), { padding: [50, 50] });
                }
                
                document.getElementById('route-alternatives-container')?.classList.add('hidden');
                this.setUiMode('routing');
            } catch (e) {
                console.error("Failed to parse last route data", e);
                localStorage.removeItem('sadakSathiLastRoute');
            }
        }
    }
    
    performSearch() {
        const query = (document.getElementById('unified-search-input') as HTMLInputElement).value;
        if (query.trim()) {
            this.showToast(`Searching for: ${query}`, 'info');
            const randomLon = 80.0 + Math.random() * 8.2;
            const randomLat = 26.3 + Math.random() * 4.2;
            this.map.flyTo([randomLat, randomLon], 12);
        }
    }

    getSystemInstruction(): string {
        const personaMap = { friendly: "You are Sadak Sathi, a friendly and cheerful AI road companion for Nepal. Be helpful and encouraging.", formal: "You are a formal and precise AI assistant. Provide clear, concise, and accurate information about roads and travel in Nepal.", guide: "You are an enthusiastic and knowledgeable tour guide for Nepal. Provide rich details about culture, history, and points of interest along the user's route.", buddy: "You are a calm, focused, and reliable co-pilot. Prioritize safety, clear directions, and timely alerts. Keep your responses short and to the point." };
        const relationshipMap = { friend: "Address the user casually, like a good friend.", partner: "Address the user with warmth and support, like a caring partner.", husband: "Address the user as you would your husband.", wife: "Address the user as you would your wife." };
        return `${personaMap[this.aiPersonality as keyof typeof personaMap]} ${relationshipMap[this.aiRelationship as keyof typeof relationshipMap]}`;
    }

    resetChat() {
        this.chatHistory = [];
        const messagesContainer = document.querySelector('.chat-messages')!;
        messagesContainer.innerHTML = '';
        this.addMessageToChat(this.translations.ai_welcome_message, 'ai');
    }

    openChat() {
        document.getElementById('ai-chat-modal')?.classList.remove('hidden');
        document.getElementById('context-chat-btn')?.classList.toggle('hidden', !this.selectedEntityContext);
        this.isChatOpen = true;
        if(this.chatHistory.length === 0) {
            this.resetChat();
        }
    }

    closeChat() {
        document.getElementById('ai-chat-modal')?.classList.add('hidden');
        this.isChatOpen = false;
    }

    async handleChatMessage(event: Event) {
        event.preventDefault();
        const input = document.getElementById('chat-input') as HTMLInputElement;
        const message = input.value.trim();
        if (!message) return;

        this.addMessageToChat(message, 'user');
        this.chatHistory.push({ role: 'user', parts: [{ text: message }] });
        input.value = '';

        try {
            const result = await this.backend.getChatResponse(this.chatHistory, message, this.getSystemInstruction());
            this.addMessageToChat(result.text, 'ai');
            this.chatHistory.push({ role: 'model', parts: [{ text: result.text }] });
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
        messageEl.innerHTML = `<img src="${avatarSrc}" alt="${senderName} avatar" class="message-avatar"><div class="message-content"><span class="message-sender">${senderName}</span>${messageContentHtml}</div>`;
        messagesContainer.appendChild(messageEl);
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
        if (sender === 'ai' && (document.getElementById('toggle-voice-response') as HTMLInputElement).checked) {
            this.speak(text);
        }
    }

    askAboutContext(openChatIfNeeded = false) {
        if (!this.selectedEntityContext) return;
        const contextName = this.getDisplayablePropertyValue(this.selectedEntityContext.name, 'this location');
        const prompt = `Tell me about ${contextName}.`;
        if(openChatIfNeeded && !this.isChatOpen) this.openChat();
        const input = document.getElementById('chat-input') as HTMLInputElement;
        input.value = prompt;
        const submitEvent = new Event('submit', { bubbles: true, cancelable: true });
        document.getElementById('chat-form')?.dispatchEvent(submitEvent);
    }

    initSpeechRecognition() {
        if (!SpeechRecognition) return;
        this.recognition = new SpeechRecognition();
        this.recognition.continuous = false;
        this.recognition.lang = 'en-US';
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
        if (!this.hasRequestedMicrophone) this.hasRequestedMicrophone = true;
        this.activeVoiceContext = context;
        this.recognition.start();
        this.isRecognizing = true;
        document.body.classList.add('is-recognizing');
    }
    
    loadVoices() {
        const load = () => {
            // FIX: Use the renamed speechSynthesis constant to call getVoices().
            this.availableVoices = speechSynthesis.getVoices();
            if (this.availableVoices.length === 0) setTimeout(load, 100);
        };
        // FIX: Use the renamed speechSynthesis constant to set onvoiceschanged.
        speechSynthesis.onvoiceschanged = load;
        load();
    }
    
    speak(text: string) {
        // FIX: Use the renamed speechSynthesis constant.
        if (!speechSynthesis || !text) return;
        const utterance = new SpeechSynthesisUtterance(text);
        const lang = this.currentLang.split('-')[0];
        let voiceOptions = this.availableVoices.filter(v => v.lang.startsWith(lang));
        if (this.aiVoice === 'female') voiceOptions = voiceOptions.filter(v => v.name.toLowerCase().includes('female'));
        if (this.aiVoice === 'male') voiceOptions = voiceOptions.filter(v => v.name.toLowerCase().includes('male'));
        utterance.voice = voiceOptions[0] || this.availableVoices.find(v => v.lang.startsWith('en')) || this.availableVoices[0];
        
        const avatar = document.getElementById('chat-ai-avatar');
        utterance.onstart = () => avatar?.classList.add('is-speaking');
        utterance.onend = () => avatar?.classList.remove('is-speaking');
        
        // FIX: Use the renamed speechSynthesis constant to call cancel().
        speechSynthesis.cancel();
        // FIX: Use the renamed speechSynthesis constant to call speak().
        speechSynthesis.speak(utterance);
    }
    
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
        (document.getElementById('route-pref-highways') as HTMLInputElement).checked = localStorage.getItem('sadakSathiPrefHighways') === 'true';
        (document.getElementById('route-pref-no-tolls') as HTMLInputElement).checked = localStorage.getItem('sadakSathiPrefNoTolls') === 'true';
        (document.getElementById('route-pref-scenic') as HTMLInputElement).checked = localStorage.getItem('sadakSathiPrefScenic') === 'true';
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
        localStorage.setItem('sadakSathiPrefHighways', String((document.getElementById('route-pref-highways') as HTMLInputElement).checked));
        localStorage.setItem('sadakSathiPrefNoTolls', String((document.getElementById('route-pref-no-tolls') as HTMLInputElement).checked));
        localStorage.setItem('sadakSathiPrefScenic', String((document.getElementById('route-pref-scenic') as HTMLInputElement).checked));
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
    
    openReportIncidentModal() {
        if (!this.currentUser) {
            this.showToast('Please log in to report an incident.', 'warning');
            this.openProfileModal();
            return;
        }
        if (!this.userLocation) {
            document.getElementById('report-location-unavailable')?.classList.remove('hidden');
            document.getElementById('report-incident-form')?.classList.add('hidden');
        } else {
            document.getElementById('report-location-unavailable')?.classList.add('hidden');
            document.getElementById('report-incident-form')?.classList.remove('hidden');
            (document.getElementById('incident-location') as HTMLInputElement).value = `Lat: ${this.userLocation.lat.toFixed(4)}, Lon: ${this.userLocation.lon.toFixed(4)}`;
        }
        this.originalIncidentImage = null;
        this.refinedIncidentImage = null;
        document.getElementById('image-refinement-area')?.classList.add('hidden');
        (document.getElementById('incident-image-preview') as HTMLImageElement).src = '#';
        (document.getElementById('refinement-prompt') as HTMLInputElement).value = '';
        const fileInput = document.getElementById('incident-image-upload') as HTMLInputElement;
        if (fileInput) fileInput.value = '';
        document.getElementById('report-incident-modal')?.classList.remove('hidden');
    }

    async handleIncidentReportSubmit(event: Event) {
        event.preventDefault();
        if (!this.currentUser) {
            this.showToast('Please log in to report an incident.', 'warning');
            this.openProfileModal();
            return;
        }
        if (!this.userLocation) {
            this.showToast('Cannot submit report without a location.', 'error');
            return;
        }

        const type = (document.getElementById('incident-type') as HTMLSelectElement).value;
        const description = (document.getElementById('incident-description') as HTMLTextAreaElement).value;
        
        const newIncidentData = {
            incident_type: type,
            details: description,
            timestamp: firebase.firestore.FieldValue.serverTimestamp(),
            approvalStatus: 'pending',
            user_reported: true,
            reporterId: this.currentUser.uid,
            reporterEmail: this.currentUser.email,
            lat: this.userLocation.lat,
            lon: this.userLocation.lon,
            geometry: {
                type: 'Point',
                coordinates: [this.userLocation.lon, this.userLocation.lat]
            }
        };

        try {
            await this.db.collection('UserReported').add(newIncidentData);
            this.showToast('Incident reported successfully! It will be reviewed by an admin.', 'success');
            document.getElementById('report-incident-modal')?.classList.add('hidden');
        } catch (error) {
            console.error("Error submitting incident:", error);
            this.showToast('Failed to submit incident report.', 'error');
        }
    }

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
            this.refinedIncidentImage = null;
            (document.getElementById('incident-image-preview') as HTMLImageElement).src = dataUrl;
            document.getElementById('image-refinement-area')?.classList.remove('hidden');
        };
        reader.onerror = () => this.showToast('Failed to read the image file.', 'error');
        reader.readAsDataURL(file);
    }

    private async handleImageRefinement() {
        if (!this.originalIncidentImage) {
            this.showToast('Please upload an image first.', 'warning');
            return;
        }
        const prompt = (document.getElementById('refinement-prompt') as HTMLInputElement).value.trim();
        if (!prompt) {
            this.showToast('Please enter a refinement instruction.', 'warning');
            return;
        }
        const loader = document.getElementById('refinement-loader')!;
        loader.classList.remove('hidden');
        try {
            const response = await this.backend.refineImageWithAI(this.originalIncidentImage, prompt);
            if (response && response.refinedImage) {
                this.refinedIncidentImage = response.refinedImage;
                (document.getElementById('incident-image-preview') as HTMLImageElement).src = `data:${this.refinedIncidentImage.mimeType};base64,${this.refinedIncidentImage.data}`;
                this.showToast('Image refined successfully!', 'success');
            } else {
                this.showToast('AI could not refine the image. Please try a different prompt.', 'error');
            }
        } catch (error) {
            console.error('Image refinement error:', error);
            this.showToast('An error occurred during image refinement.', 'error');
        } finally {
            loader.classList.add('hidden');
        }
    }
    
    toggleTravelTimePanel(show: boolean) {
        document.getElementById('travel-time-panel')?.classList.toggle('hidden', !show);
        if (!show) {
            this.isPickingTravelTimeOrigin = false;
            document.getElementById('app-container')?.classList.remove('picking-location');
        }
    }

    setTravelTimeOriginFromUserLocation() {
        if (this.userLocation) {
            this.travelTimeOrigin = this.userLocation;
            (document.getElementById('travel-time-origin-input') as HTMLInputElement).value = `Current Location (${this.userLocation.lat.toFixed(4)}, ${this.userLocation.lon.toFixed(4)})`;
        } else {
            this.showToast('Your location is not yet available.', 'warning');
            this.startGeolocation();
        }
    }
    
    handlePickTravelTimeOrigin() {
        this.isPickingTravelTimeOrigin = true;
        document.getElementById('app-container')?.classList.add('picking-location');
        this.showToast('Click on the map to select a starting point.', 'info');
        this.toggleTravelTimePanel(false);
        this.map.once('click', (e: any) => this.setTravelTimeOrigin(e));
    }

    setTravelTimeOrigin(e: any) {
        this.travelTimeOrigin = { lon: e.latlng.lng, lat: e.latlng.lat };
        (document.getElementById('travel-time-origin-input') as HTMLInputElement).value = `Picked Location (${this.travelTimeOrigin.lat.toFixed(4)}, ${this.travelTimeOrigin.lon.toFixed(4)})`;
        this.isPickingTravelTimeOrigin = false;
        document.getElementById('app-container')?.classList.remove('picking-location');
        this.toggleTravelTimePanel(true);
    }

    handleGenerateTravelTimeMap() {
        if (!this.travelTimeOrigin) {
            this.showToast('Please select a starting point first.', 'warning');
            return;
        }
        const intervals = [15, 30, 45, 60].filter(min => (document.getElementById(`tt-${min}`) as HTMLInputElement).checked);
        if (intervals.length === 0) {
            this.showToast('Please select at least one time interval.', 'warning');
            return;
        }
        this.handleClearTravelTimeMap(false);
        const AVERAGE_SPEED_KPH = 40;
        const M_PER_SEC_PER_KPH = 1000 / 3600;

        intervals.forEach(minutes => {
            const distanceMeters = AVERAGE_SPEED_KPH * M_PER_SEC_PER_KPH * (minutes * 60);
            let color;
            if (minutes <= 15) color = 'rgba(46, 204, 113, 0.5)';
            else if (minutes <= 30) color = 'rgba(241, 196, 15, 0.5)';
            else if (minutes <= 45) color = 'rgba(230, 126, 34, 0.5)';
            else color = 'rgba(231, 76, 60, 0.5)';
            
            this.travelTimeLayer.addLayer(L.circle([this.travelTimeOrigin!.lat, this.travelTimeOrigin!.lon], {
                radius: distanceMeters,
                color: color,
                fillColor: color,
                fillOpacity: 0.5,
                weight: 1,
            }));
        });
        document.getElementById('travel-time-legend')?.classList.remove('hidden');
    }

    handleClearTravelTimeMap(resetInputs = true) {
        this.travelTimeLayer.clearLayers();
        document.getElementById('travel-time-legend')?.classList.add('hidden');
        if (resetInputs) {
            this.travelTimeOrigin = null;
            (document.getElementById('travel-time-origin-input') as HTMLInputElement).value = '';
        }
    }

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
        this.openFindCarModal();
        this.showToast(this.translations.car_location_saved_toast, 'success');
    }
    
    clearCarLocation() {
        this.carLocation = null;
        localStorage.removeItem('sadakSathiCarLocation');
        this.updateCarLocationPin();
        this.openFindCarModal();
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
        this.carLocationLayer.clearLayers();
        if (this.carLocation) {
            const icon = this.getDivIcon('directions_car', '#3498db');
            this.carLocationLayer.addLayer(L.marker([this.carLocation.lat, this.carLocation.lon], { icon }));
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
    
    async openAdminPanel() {
        document.getElementById('profile-modal')?.classList.add('hidden');
        document.getElementById('admin-panel-modal')?.classList.remove('hidden');

        if (Object.keys(this.adminDataCache).length === 0) {
            await this.fetchAdminData();
        } else {
            this.displayAdminData(this.currentAdminTab);
        }
    }

    async fetchAdminData(forceRefresh = false) {
        if (this.isFetchingAdminData) return;
        this.isFetchingAdminData = true;
        
        const tableContainer = document.getElementById('admin-table-container')!;
        tableContainer.innerHTML = `<div class="spinner-container"><div class="spinner"></div></div>`;
        
        if (forceRefresh) {
            this.adminDataCache = {};
        }

        try {
            const collectionsToFetch = ['Road', 'Bridge', 'Toll', 'UserReported'];
            const fetchPromises = collectionsToFetch.map(async (name) => {
                const snapshot = await this.db.collection(name).get();
                const data = snapshot.docs.map((doc: any) => ({ ...doc.data(), id: doc.id }));
                this.adminDataCache[name] = data;
            });
            await Promise.all(fetchPromises);
            if (forceRefresh) {
                this.showToast('Data refreshed successfully!', 'success');
            }
        } catch (error) {
            console.error("Error fetching admin data:", error);
            this.showToast('Failed to fetch admin data.', 'error');
            tableContainer.innerHTML = `<p style="text-align: center; padding: 2rem;">Error loading data.</p>`;
        } finally {
            this.isFetchingAdminData = false;
            this.displayAdminData(this.currentAdminTab);
        }
    }

    handleAdminTabClick(event: Event) {
        const target = event.currentTarget as HTMLElement;
        const collectionName = target.dataset.collection;
        if (!collectionName) return;

        this.currentAdminTab = collectionName;
        document.querySelectorAll('.admin-tab-btn').forEach(btn => btn.classList.remove('active'));
        target.classList.add('active');
        
        this.currentAdminSort = { key: '', order: 'asc' };
        
        this.displayAdminData(collectionName);
    }
    
    displayAdminData(collectionName: string) {
        const data = this.adminDataCache[collectionName] || [];
        const tableContainer = document.getElementById('admin-table-container')!;
        const controlsContainer = document.getElementById('admin-controls-container')!;

        controlsContainer.innerHTML = `
            <div id="admin-search-input-wrapper" class="input-wrapper">
                <span class="material-icons input-icon">search</span>
                <input type="text" id="admin-search-input" placeholder="Search current table...">
            </div>
            <div>
                <button id="admin-add-btn" class="primary-btn"><span class="material-icons">add</span> Add New</button>
                <button id="admin-refresh-btn" class="secondary-btn icon-only" title="Refresh Data"><span class="material-icons">refresh</span></button>
            </div>`;

        document.getElementById('admin-search-input')?.addEventListener('input', () => this.displayAdminData(this.currentAdminTab));
        document.getElementById('admin-add-btn')?.addEventListener('click', () => this.handleAdminAddClick(collectionName));
        document.getElementById('admin-refresh-btn')?.addEventListener('click', () => this.fetchAdminData(true));
        
        if (this.isFetchingAdminData) {
            tableContainer.innerHTML = `<div class="spinner-container"><div class="spinner"></div></div>`;
            return;
        }

        if (data.length === 0) {
            tableContainer.innerHTML = `<p style="text-align: center; padding: 2rem;">No data found in this collection.</p>`;
            return;
        }
        
        const searchInput = document.getElementById('admin-search-input') as HTMLInputElement;
        const searchTerm = searchInput ? searchInput.value.toLowerCase() : '';

        let filteredData = data;
        if (searchTerm) {
            filteredData = data.filter(row => 
                Object.values(row).some(val => 
                    String(val).toLowerCase().includes(searchTerm)
                )
            );
        }

        if (this.currentAdminSort.key) {
            const { key, order } = this.currentAdminSort;
            filteredData.sort((a, b) => {
                const valA = a[key];
                const valB = b[key];
                if (valA < valB) return order === 'asc' ? -1 : 1;
                if (valA > valB) return order === 'asc' ? 1 : -1;
                return 0;
            });
        }

        tableContainer.innerHTML = this.renderAdminTable(filteredData, collectionName);
        
        tableContainer.querySelectorAll('th.sortable').forEach(th => {
            th.addEventListener('click', () => {
                const key = (th as HTMLElement).dataset.key!;
                this.handleAdminSort(key);
            });
        });

        tableContainer.querySelectorAll('.edit-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const docId = (e.currentTarget as HTMLElement).dataset.id!;
                const record = this.adminDataCache[collectionName].find(r => r.id === docId);
                this.handleAdminEditClick(collectionName, docId, record);
            });
        });

        tableContainer.querySelectorAll('.delete-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const docId = (e.currentTarget as HTMLElement).dataset.id!;
                this.handleAdminDeleteClick(collectionName, docId);
            });
        });
    }

    renderAdminTable(data: any[], collectionName: string): string {
        if (!data || data.length === 0) {
            return `<p style="text-align: center; padding: 2rem;">No matching records found.</p>`;
        }

        const headersToShow: { [key: string]: string[] } = {
            'Road': ['name', 'status', 'pavement_type', 'details'],
            'Bridge': ['name', 'status', 'length', 'width'],
            'Toll': ['name', 'location', 'vehicle_type', 'fee'],
            'UserReported': ['incident_type', 'approvalStatus', 'reporterEmail', 'timestamp', 'details']
        };

        const allHeaders = Object.keys(data.reduce((acc, row) => ({ ...acc, ...row }), {}));
        const headers = headersToShow[collectionName] || allHeaders.filter(k => !['geometry', 'id'].includes(k));

        const headerHtml = headers.map(key => {
            const isSorted = this.currentAdminSort.key === key;
            const sortClass = isSorted ? `sort-${this.currentAdminSort.order}` : '';
            return `<th class="sortable ${sortClass}" data-key="${key}">${key.replace(/_/g, ' ')}</th>`;
        }).join('') + '<th>Actions</th>';

        const bodyHtml = data.map(row => {
            const rowHtml = headers.map(key => `<td>${this.getDisplayablePropertyValue(row[key], 'N/A')}</td>`).join('');
            const actionsHtml = `
                <td class="admin-table-actions">
                    <button class="icon-button edit-btn" data-id="${row.id}" title="Edit"><span class="material-icons">edit</span></button>
                    <button class="icon-button delete-btn" data-id="${row.id}" title="Delete"><span class="material-icons">delete</span></button>
                </td>`;
            return `<tr>${rowHtml}${actionsHtml}</tr>`;
        }).join('');

        return `
            <table class="admin-data-table">
                <thead><tr>${headerHtml}</tr></thead>
                <tbody>${bodyHtml}</tbody>
            </table>
        `;
    }

    handleAdminSort(key: string) {
        if (this.currentAdminSort.key === key) {
            this.currentAdminSort.order = this.currentAdminSort.order === 'asc' ? 'desc' : 'asc';
        } else {
            this.currentAdminSort.key = key;
            this.currentAdminSort.order = 'asc';
        }
        this.displayAdminData(this.currentAdminTab);
    }
    
    handleAdminAddClick(collectionName: string) {
        this.openAdminFormModal(collectionName);
    }

    handleAdminEditClick(collectionName: string, docId: string, data: any) {
        this.openAdminFormModal(collectionName, data, docId);
    }

    async handleAdminDeleteClick(collectionName: string, docId: string) {
        if (confirm(`Are you sure you want to delete this record from ${collectionName}? This action cannot be undone.`)) {
            try {
                await this.db.collection(collectionName).doc(docId).delete();
                this.showToast('Record deleted successfully.', 'success');
            } catch (error) {
                console.error("Error deleting record:", error);
                this.showToast('Failed to delete record.', 'error');
            }
        }
    }
    
    openAdminFormModal(collectionName: string, data: any = {}, docId: string | null = null) {
        const modal = document.getElementById('admin-form-modal')!;
        const titleEl = document.getElementById('admin-form-title')!;
        const form = document.getElementById('admin-edit-form') as HTMLFormElement;
        const fieldsContainer = document.getElementById('admin-form-fields')!;

        titleEl.textContent = docId ? `Edit ${collectionName} Record` : `Add New ${collectionName} Record`;
        form.dataset.collection = collectionName;
        form.dataset.docId = docId || '';

        fieldsContainer.innerHTML = this.generateFormHtml(collectionName, data);

        modal.classList.remove('hidden');
    }

    closeAdminFormModal() {
        document.getElementById('admin-form-modal')?.classList.add('hidden');
    }

    generateFormHtml(collectionName: string, data: any): string {
        const defaultFields: { [key: string]: any[] } = {
            'Road': ['name', 'status', 'pavement_type', 'details', 'lat', 'lon'],
            'Bridge': ['name', 'status', 'length', 'width', 'lat', 'lon'],
            'Toll': ['name', 'location', 'vehicle_type', 'fee', 'lat', 'lon'],
            'UserReported': ['incident_type', 'approvalStatus', 'details', 'reporterEmail', 'lat', 'lon']
        };
        const fields = defaultFields[collectionName] || Object.keys(data).filter(k => !['id', 'geometry', 'timestamp'].includes(k));
        
        let html = '';
        fields.forEach(key => {
            const value = data[key] || '';
            let inputHtml = `<input type="text" id="form-${key}" name="${key}" value="${this.getDisplayablePropertyValue(value, '')}">`;

            if (key === 'details') {
                inputHtml = `<textarea id="form-${key}" name="${key}" rows="3">${this.getDisplayablePropertyValue(value, '')}</textarea>`;
            } else if (key === 'status' || key === 'approvalStatus') {
                const options = (key === 'approvalStatus') 
                    ? ['pending', 'approved', 'rejected'] 
                    : ['open', 'blocked', 'one-lane', 'construction'];
                inputHtml = `<select id="form-${key}" name="${key}">
                    ${options.map(opt => `<option value="${opt}" ${value === opt ? 'selected' : ''}>${opt}</option>`).join('')}
                </select>`;
            } else if (typeof value === 'number' || ['lat', 'lon', 'fee', 'length', 'width'].includes(key)) {
                inputHtml = `<input type="number" step="any" id="form-${key}" name="${key}" value="${this.getDisplayablePropertyValue(value, '0')}">`;
            }

            html += `<div class="setting-item-col">
                        <label for="form-${key}">${key.replace(/_/g, ' ')}</label>
                        ${inputHtml}
                     </div>`;
        });
        return html;
    }

    async handleAdminFormSubmit(event: Event) {
        event.preventDefault();
        const form = event.target as HTMLFormElement;
        const collectionName = form.dataset.collection;
        const docId = form.dataset.docId;
        if (!collectionName) return;

        const formData = new FormData(form);
        const data: { [key: string]: any } = {};
        formData.forEach((value, key) => {
            if (!isNaN(Number(value)) && value.toString().trim() !== '') {
                data[key] = Number(value);
            } else {
                data[key] = value;
            }
        });

        if (typeof data.lat === 'number' && typeof data.lon === 'number') {
            data.geometry = {
                type: 'Point',
                coordinates: [data.lon, data.lat]
            };
        }

        try {
            if (docId) {
                await this.db.collection(collectionName).doc(docId).set(data, { merge: true });
                this.showToast('Record updated successfully!', 'success');
            } else {
                await this.db.collection(collectionName).add(data);
                this.showToast('New record added successfully!', 'success');
            }
            this.closeAdminFormModal();
        } catch (error) {
            console.error("Error saving record:", error);
            this.showToast('Failed to save record.', 'error');
        }
    }

}

new SadakSathiApp();