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
// Declare the global config object from index.html for the proactive check.
declare const firebaseConfig: { apiKey: string };


// Web Speech API
const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
// FIX: Removed `const speechSynthesis = window.speechSynthesis;` because `speechSynthesis` is a global variable and cannot be redeclared.

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
    private isBackendConfigured: boolean = false; // NEW: Flag for demo mode
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
        
        this.listenForFirestoreData(); // This will now handle both real and mock data
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
        // Proactively check if the Firebase config has been updated.
        if (!firebaseConfig || firebaseConfig.apiKey === "YOUR_FIREBASE_API_KEY") {
            console.warn("CRITICAL: Firebase is not configured. Running in Demo Mode with mock data.");
            this.showToast("Running in Demo Mode. Backend features disabled.", "info");
            this.isBackendConfigured = false;
            this.auth = null;
            this.db = null;
            return; // Prevent further Firebase initialization attempts.
        }
        
        try {
            // firebase.initializeApp is already called in index.html if config is valid
            this.firebaseApp = firebase.app();
            this.auth = firebase.auth();
            this.db = firebase.firestore();
            this.isBackendConfigured = true;
            console.log("Firebase initialized successfully.");
        } catch (e) {
            console.error("Error initializing Firebase:", e);
            this.showToast("Could not connect to backend services.", "error");
            this.isBackendConfigured = false;
            this.auth = null;
            this.db = null;
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
    
        if (user && this.isBackendConfigured) {
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
        if (this.isBackendConfigured && this.db) {
            console.log("Connecting to live Firestore data...");
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
            };
            
            this.firestoreUnsubscribers.forEach(unsub => unsub());
            this.firestoreUnsubscribers = [];

            this.firestoreUnsubscribers.push(this.db.collection('Road').onSnapshot(
                (snap: any) => processSnapshot(snap, 'road'),
                (err: any) => console.error("Road listener error:", err)
            ));
            this.firestoreUnsubscribers.push(this.db.collection('POI').onSnapshot(
                (snap: any) => processSnapshot(snap, 'poi'),
                (err: any) => console.error("POI listener error:", err)
            ));
            this.firestoreUnsubscribers.push(this.db.collection('UserReported').onSnapshot(
                (snap: any) => processSnapshot(snap, 'incident'),
                (err: any) => console.error("Incident listener error:", err)
            ));
        } else {
            // NEW: Fallback to mock data for Demo Mode
            this.loadMockData();
        }
    }

    /**
     * NEW: Loads mock data for a functional demo experience when Firebase is not configured.
     */
    loadMockData() {
        console.warn("RUNNING IN DEMO MODE: Using mock data as Firebase is not configured.");
        const mockData = [
            // Roads
            { type: 'Feature', geometry: { type: 'LineString', coordinates: [[85.3240, 27.7172], [85.3100, 27.7000]] }, properties: { name: 'Ring Road Segment', status: 'open', entityType: 'road', color: '#3498db' } },
            { type: 'Feature', geometry: { type: 'LineString', coordinates: [[83.9856, 28.2096], [83.9950, 28.2150]] }, properties: { name: 'Lakeside Path', status: 'open', entityType: 'road', color: '#2ecc71' } },
            // POIs
            { type: 'Feature', geometry: { type: 'Point', coordinates: [85.3240, 27.7172] }, properties: { name: 'Kathmandu Durbar Square', type: 'Cultural', entityType: 'poi' } },
            { type: 'Feature', geometry: { type: 'Point', coordinates: [83.9628, 28.2140] }, properties: { name: 'Phewa Lake', type: 'Natural', entityType: 'poi' } },
            // Incidents
            { type: 'Feature', geometry: { type: 'Point', coordinates: [85.3180, 27.7050] }, properties: { name: 'Minor Accident', type: 'Accident', description: 'Two vehicles involved, traffic slow.', severity: 'low', entityType: 'incident' } },
            { type: 'Feature', geometry: { type: 'Point', coordinates: [85.3150, 27.6950] }, properties: { name: 'Road Construction', type: 'Construction', description: 'One lane closed for maintenance.', severity: 'medium', entityType: 'incident' } },
        ];
        
        // Use a timeout to simulate network latency for a better UX
        setTimeout(() => {
            this.processAndDisplayData(mockData);
        }, 500);
    }
    
    // =================================================================================
    // NEWLY IMPLEMENTED/COMPLETED METHODS
    // =================================================================================

    safeStringify(value: any, fallback = ''): string {
        try {
            if (value === null || typeof value === 'undefined') return fallback;
            return String(value);
        } catch {
            return fallback;
        }
    }

    async loadTranslations(lang: string): Promise<void> {
        try {
            if (lang === 'en') {
                this.translations = en_translations;
            } else {
                console.warn(`Translation for '${lang}' not found, defaulting to English.`);
                this.translations = en_translations; // Fallback for simulation
            }
        } catch (error) {
            console.error('Failed to load translations:', error);
            this.translations = en_translations;
        }
    }
    
    updateUIForLanguage() {
        document.querySelectorAll('[data-lang-key]').forEach(el => {
            const key = el.getAttribute('data-lang-key')!;
            if (this.translations[key]) el.textContent = this.translations[key];
        });
        document.querySelectorAll('[data-lang-key-placeholder]').forEach(el => {
            const key = el.getAttribute('data-lang-key-placeholder')!;
            if (this.translations[key]) (el as HTMLInputElement).placeholder = this.translations[key];
        });
        document.querySelectorAll('[data-lang-key-title]').forEach(el => {
            const key = el.getAttribute('data-lang-key-title')!;
            if (this.translations[key]) (el as HTMLElement).title = this.translations[key];
        });
        document.querySelectorAll('[data-lang-key-aria-label]').forEach(el => {
            const key = el.getAttribute('data-lang-key-aria-label')!;
            if (this.translations[key]) el.setAttribute('aria-label', this.translations[key]);
        });
    }

    async initMap() {
        return new Promise<void>(resolve => {
            this.map = L.map('map', {
                center: INITIAL_VIEW.center,
                zoom: INITIAL_VIEW.zoom,
                maxBounds: NEPAL_BOUNDS,
                zoomControl: false,
                attributionControl: false,
            });

            this.tileLayers = {
                streets: L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {}),
                satellite: L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {}),
                dark: L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {}),
            };

            this.tileLayers.streets.addTo(this.map);

            this.roadLayer = L.geoJSON(null, {}).addTo(this.map);
            this.poiLayer = L.geoJSON(null, {}).addTo(this.map);
            this.incidentLayer = L.geoJSON(null, {}).addTo(this.map);
            this.trafficLayer = L.geoJSON(null, {});
            this.routeLayer = L.geoJSON(null, {}).addTo(this.map);
            this.travelTimeLayer = L.layerGroup().addTo(this.map);
            this.carLocationLayer = L.layerGroup().addTo(this.map);
            
            this.map.on('click', () => {
                document.getElementById('detail-card')?.classList.remove('visible');
            });
            
            resolve();
        });
    }

    loadVoices() {
        const load = () => {
            this.availableVoices = speechSynthesis.getVoices();
            if (this.availableVoices.length > 0) {
                console.log("Voices loaded.");
            }
        };
        load();
        if (speechSynthesis.onvoiceschanged !== undefined) {
            speechSynthesis.onvoiceschanged = load;
        }
    }
    
    setupEventListeners() {
        // Theme Toggle
        document.getElementById('theme-toggle')?.addEventListener('click', () => this.toggleTheme());
        
        // Language Selector
        const langBtn = document.getElementById('language-selector-btn');
        const langPopup = document.getElementById('language-popup');
        langBtn?.addEventListener('click', (e) => {
            e.stopPropagation();
            langPopup?.classList.toggle('hidden');
        });
        document.addEventListener('click', (e) => {
             if (!langBtn?.contains(e.target as Node) && !langPopup?.contains(e.target as Node)) {
                langPopup?.classList.add('hidden');
            }
        });
        document.querySelectorAll('.lang-category-header').forEach(header => {
            header.addEventListener('click', () => {
                header.parentElement?.classList.toggle('open');
                const icon = header.querySelector('.expand-icon');
                if (icon) icon.textContent = header.parentElement?.classList.contains('open') ? 'expand_more' : 'chevron_right';
            });
        });

        // Map Controls
        document.getElementById('zoom-in-btn')?.addEventListener('click', () => this.map.zoomIn());
        document.getElementById('zoom-out-btn')?.addEventListener('click', () => this.map.zoomOut());
        document.getElementById('map-options-btn')?.addEventListener('click', (e) => {
             e.stopPropagation();
             document.getElementById('map-options-popup')?.classList.toggle('hidden');
        });
         document.addEventListener('click', (e) => {
            const optionsPopup = document.getElementById('map-options-popup');
            if (!document.getElementById('map-options-btn')?.contains(e.target as Node) && !optionsPopup?.contains(e.target as Node)) {
                optionsPopup?.classList.add('hidden');
            }
        });
        
        // Layer Toggles
        document.getElementById('toggle-roads')?.addEventListener('change', (e) => this.toggleLayer(this.roadLayer, (e.target as HTMLInputElement).checked));
        document.getElementById('toggle-pois')?.addEventListener('change', (e) => this.toggleLayer(this.poiLayer, (e.target as HTMLInputElement).checked));
        document.getElementById('toggle-incidents')?.addEventListener('change', (e) => this.toggleLayer(this.incidentLayer, (e.target as HTMLInputElement).checked));
        document.getElementById('toggle-traffic')?.addEventListener('change', (e) => this.toggleTrafficLayer((e.target as HTMLInputElement).checked));

        // Map Style Buttons
        document.querySelectorAll('.style-option').forEach(btn => {
            btn.addEventListener('click', () => {
                document.querySelector('.style-option.active')?.classList.remove('active');
                btn.classList.add('active');
                this.switchMapStyle(btn.getAttribute('data-style')!);
            });
        });

        // FAB Menu
        document.getElementById('fab-main-btn')?.addEventListener('click', () => {
            document.getElementById('fab-main-btn')?.classList.toggle('open');
            document.getElementById('fab-menu-items')?.classList.toggle('hidden');
        });

        // Modals & Panels
        document.getElementById('fab-profile-btn')?.addEventListener('click', () => this.showModal('profile-modal'));
        document.getElementById('fab-settings-btn')?.addEventListener('click', () => document.getElementById('settings-panel')?.classList.add('open'));
        document.getElementById('fab-ai-btn')?.addEventListener('click', () => this.showModal('ai-chat-modal'));
        document.getElementById('unified-search-ai-btn')?.addEventListener('click', () => this.showModal('ai-chat-modal'));
        document.getElementById('close-chat-btn')?.addEventListener('click', () => this.hideModal('ai-chat-modal'));
        document.getElementById('report-incident-fab')?.addEventListener('click', () => {
             if (!this.isBackendConfigured) {
                this.showToast("Incident reporting requires a backend connection.", "warning");
                return;
            }
            this.showModal('report-incident-modal');
        });
        document.getElementById('fab-find-car-btn')?.addEventListener('click', () => this.showModal('find-car-modal'));
        
        // Close buttons for modals and panels
        document.querySelectorAll('.modal-close-btn, .modal-overlay, #report-incident-close, #settings-panel .icon-button, #find-car-close-btn, #admin-panel-close-btn, #admin-form-close-btn, #detail-card-close, #route-details-close').forEach(btn => {
            btn.addEventListener('click', (e) => {
                if ((e.target as HTMLElement).classList.contains('modal-overlay') || btn.closest('.modal-close-btn, .icon-button')) {
                    btn.closest('.modal-overlay, .panel, #settings-panel, #detail-card, #route-details-panel')?.classList.add('hidden');
                    if (btn.closest('#settings-panel')) btn.closest('#settings-panel')?.classList.remove('open');
                    if (btn.closest('#detail-card')) btn.closest('#detail-card')?.classList.remove('visible');
                }
            });
        });
        
         // Clear route
        document.getElementById('clear-route-btn')?.addEventListener('click', () => {
            this.routeLayer.clearLayers();
            document.getElementById('route-details-panel')?.classList.add('hidden');
            document.getElementById('active-routing-panel')?.classList.add('hidden');
            document.getElementById('unified-search-input')!.parentElement!.parentElement!.style.display = 'flex';
        });

        // Fallback for search
        document.getElementById('unified-search-action-btn')?.addEventListener('click', () => {
            const query = (document.getElementById('unified-search-input') as HTMLInputElement).value;
            this.showToast(`Simulating search for: "${query}"`);
        });
        
        // Find route simulation
        document.getElementById('find-route-btn')?.addEventListener('click', () => {
            this.showToast('Route finding simulation started.');
            document.getElementById('route-details-panel')?.classList.remove('hidden');
        });

        // Active routing panel toggle
        document.getElementById('unified-search-input')?.addEventListener('focus', () => {
            document.getElementById('active-routing-panel')?.classList.remove('hidden');
            document.getElementById('unified-search-input')!.parentElement!.parentElement!.style.display = 'none';
        });

        // NEW: Hide backend-dependent UI elements if in demo mode
        if (!this.isBackendConfigured) {
            document.getElementById('fab-profile-btn')?.classList.add('hidden');
            document.getElementById('report-incident-fab')?.classList.add('hidden');
        }

    }
    
    toggleTheme() {
        const container = document.getElementById('app-container')!;
        const currentTheme = container.getAttribute('data-theme');
        const newTheme = currentTheme === 'light' ? 'dark' : 'light';
        container.setAttribute('data-theme', newTheme);
        document.getElementById('theme-toggle')!.querySelector('.material-icons')!.textContent = newTheme === 'light' ? 'light_mode' : 'dark_mode';
    }
    
    toggleLayer(layer: any, show: boolean) {
        if (show) {
            if (!this.map.hasLayer(layer)) this.map.addLayer(layer);
        } else {
            if (this.map.hasLayer(layer)) this.map.removeLayer(layer);
        }
    }

    async toggleTrafficLayer(show: boolean) {
        if (show) {
            if (!this.map.hasLayer(this.trafficLayer)) {
                this.map.addLayer(this.trafficLayer);
                const trafficData = await this.backend.getTraffic();
                this.trafficLayer.clearLayers();
                this.trafficLayer.addData(trafficData);
                this.trafficLayer.setStyle((feature: any) => {
                    const level = feature.properties.traffic;
                    return {
                        color: level === 'heavy' ? '#e74c3c' : level === 'moderate' ? '#f39c12' : '#2ecc71',
                        weight: 5,
                        opacity: 0.7
                    };
                });
            }
        } else {
            if (this.map.hasLayer(this.trafficLayer)) {
                this.map.removeLayer(this.trafficLayer);
            }
        }
    }
    
    switchMapStyle(style: string) {
        Object.values(this.tileLayers).forEach(layer => {
            if (this.map.hasLayer(layer)) this.map.removeLayer(layer);
        });
        if (this.tileLayers[style]) {
            this.map.addLayer(this.tileLayers[style]);
        }
    }

    showModal(modalId: string) {
        document.getElementById(modalId)?.classList.remove('hidden');
    }

    hideModal(modalId: string) {
        document.getElementById(modalId)?.classList.add('hidden');
    }

    processAndDisplayData(data: any[]) {
        if (!this.map) return;
        this.roadLayer.clearLayers();
        this.poiLayer.clearLayers();
        this.incidentLayer.clearLayers();

        const roads = data.filter(f => f.properties.entityType === 'road');
        const pois = data.filter(f => f.properties.entityType === 'poi');
        const incidents = data.filter(f => f.properties.entityType === 'incident');

        if(roads.length > 0) this.roadLayer.addData(roads);
        if(pois.length > 0) this.poiLayer.addData(pois);
        if(incidents.length > 0) this.incidentLayer.addData(incidents);
        
        this.roadLayer.setStyle((f: any) => ({ color: f.properties.color || '#555', weight: 4, opacity: 0.6 }));
        this.incidentLayer.on('click', (e: any) => this.showDetailCard(e.layer.feature.properties));
        this.poiLayer.on('click', (e: any) => this.showDetailCard(e.layer.feature.properties));
        this.roadLayer.on('click', (e: any) => this.showDetailCard(e.layer.feature.properties));

    }
    
    showDetailCard(properties: any) {
        const card = document.getElementById('detail-card')!;
        const title = document.getElementById('detail-card-title')!;
        const content = document.getElementById('detail-card-content')!;
        
        title.textContent = properties.name || 'Details';
        
        let html = '';
        for(const key in properties) {
            if(Object.prototype.hasOwnProperty.call(properties, key) && key !== 'geometry' && key !== 'entityType' && key !== 'id') {
                html += `<p><strong>${key}:</strong> ${properties[key]}</p>`;
            }
        }
        content.innerHTML = html;
        
        card.classList.add('visible');
    }

    showToast(message: string, type: 'success' | 'error' | 'warning' | 'info' = 'info') {
        const toast = document.getElementById('toast-notification')!;
        const toastMessage = document.getElementById('toast-message')!;
        const toastIcon = document.getElementById('toast-icon')!;

        toast.className = '';
        void toast.offsetWidth; // Trigger reflow
        
        toastMessage.textContent = message;
        const icons = { success: 'check_circle', error: 'error', warning: 'warning', info: 'info' };
        toastIcon.textContent = icons[type] || 'info';
        
        toast.classList.add(type);
        toast.classList.add('show');

        setTimeout(() => toast.classList.remove('show'), 5000);
    }
    
    loadSettings() { console.log('loadSettings executed.'); }
    restoreLastRoute() { console.log('restoreLastRoute executed.'); }
    updateAiFeatureUiState() { console.log('updateAiFeatureUiState executed.'); }
    displayAdminData(tab: string) { console.log(`displayAdminData for ${tab} executed.`);}
}

// Instantiate the app to start it
new SadakSathiApp();