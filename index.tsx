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
 * backend (simulated here). The frontend application makes its own
 * backend endpoints (e.g., /api/chat), and the backend securely manages all
 * external API keys and communication. This is a critical security practice.
 * =================================================================================
 */

// NOTE: The GoogleGenAI import is removed as all AI calls now go through a secure backend proxy.

// Declare Leaflet as a global variable to be used from the script tag.
declare var L: any;
// Declare Firebase as a global variable
declare var firebase: any;
// Declare Chart.js as a global variable
declare var Chart: any;
// Declare jsPDF and html2canvas
declare var jspdf: any;
declare var html2canvas: any;

// Declare the global config object from index.html for the proactive check.
declare const firebaseConfig: { apiKey: string };


// Web Speech API
const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
// FIX: Removed redeclaration of `speechSynthesis` which is a global variable.
// const speechSynthesis = window.speechSynthesis;

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

    // Proactive Alerts
    "proactive_alert_accident_ahead": "Proactive Alert: Accident reported {distance} ahead. Consider rerouting.",
    "proactive_alert_traffic_jam": "Proactive Alert: Heavy traffic jam reported {distance} ahead.",
    "proactive_alert_hazard_reported": "Proactive Alert: Road hazard reported {distance} ahead. Proceed with caution.",
    "proactive_alert_construction": "Proactive Alert: Major construction work {distance} ahead. Expect delays.",
    "alert_ask_ai": "Ask AI",
    "alert_dismiss": "Dismiss",

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
    "prefer_less_crowded": "Less Crowded",
    "avoid_unpaved": "Avoid Unpaved",
    "ai_avatar_updated": "AI avatar updated successfully!",

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
    "report_submitted_toast": "Incident reported. Thank you for your contribution!",


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

    // Offline Maps
    "offline_maps_title": "Offline Maps",
    "offline_maps_desc": "Download map areas for use without an internet connection.",
    "download_new_area": "Download New Area",
    "no_offline_maps": "No offline maps downloaded.",
    "download_offline_map_title": "Download Offline Map",
    "kathmandu_valley": "Kathmandu Valley",
    "kathmandu_valley_desc": "Capital city, heritage sites, and surrounding hills.",
    "pokhara": "Pokhara",
    "pokhara_desc": "Annapurna gateway, lakes, and city.",
    "chitwan": "Chitwan National Park",
    "chitwan_desc": "Wildlife, jungles, and the Terai plains.",
    "lumbini": "Lumbini",
    "lumbini_desc": "Birthplace of Lord Buddha and monasteries.",
    "everest_region": "Everest Region",
    "everest_region_desc": "Sagarmatha National Park and high Himalayas.",
    "download": "Download",
    "downloading": "Downloading...",
    "downloaded": "Downloaded",
    "delete": "Delete",
    "offline_map_saved_toast": "Offline map for {region} saved!",
    "offline_map_deleted_toast": "Offline map for {region} deleted.",
    "you_are_offline": "You are offline. Using downloaded maps.",
    "you_are_online": "You are back online.",

    // Share Route
    "share_route_title": "Share Route",
    "copy_link": "Copy Link",
    "link_copied": "Link copied to clipboard!",
    "copied": "Copied!",
    "share_on_x": "X",
    "share_on_facebook": "Facebook",
    "share_via_email": "Email",
    "no_route_to_share": "Please find a route first before sharing.",
};

// =================================================================================
// Main Application Class
// =================================================================================
class SadakSathiApp {
    private map: any;
    private tileLayers: { [key: string]: any } = {};
    private activeBaseLayer: string = 'streets';
    private allRoadData: any[] = [];
    private roadLayer: any;
    private nationalHighwayLayer: any;
    private majorRoadLayer: any;
    private localRoadLayer: any;
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

    // NEW: Driver utility state
    private isMeasuringDistance: boolean = false;
    private distancePoints: any[] = [];
    private distanceLayer: any;
    private headingUpMode: boolean = false;
    private geolocationWatcherId: number | null = null;

    private mockPois = [
        { id: 'poi-1', name: 'Kathmandu Durbar Square', type: 'heritage', lat: 27.7049, lon: 85.3075 },
        { id: 'poi-2', name: 'Garden of Dreams', type: 'park', lat: 27.7132, lon: 85.3144 },
        { id: 'poi-3', name: 'Swayambhunath Stupa', type: 'religious_site', lat: 27.7148, lon: 85.2905 },
        { id: 'poi-4', name: 'Boudhanath Stupa', type: 'religious_site', lat: 27.7215, lon: 85.3615 },
        { id: 'poi-5', name: 'Pashupatinath Temple', type: 'religious_site', lat: 27.7107, lon: 85.3486 },
        { id: 'poi-6', name: 'Fire and Ice Pizzeria', type: 'food', lat: 27.7140, lon: 85.3145 },
        { id: 'poi-7', name: 'Patan Durbar Square', type: 'historical_site', lat: 27.673, lon: 85.325 },
        { id: 'poi-8', name: 'Phewa Lake', type: 'natural_attraction', lat: 28.216, lon: 83.95 },
        { id: 'poi-9', name: 'Chitwan National Park', type: 'natural_attraction', lat: 27.524, lon: 84.455 }
    ];
    private activePoiFilters: Set<string> = new Set(['heritage', 'park', 'food', 'historical_site', 'religious_site', 'natural_attraction']);
    private activeRoadFilters: Set<string> = new Set(['national_highway', 'major_road', 'local_road']);

    private mockRoads = {
        type: "FeatureCollection",
        features: [
            {
                type: "Feature",
                properties: { name: "Prithvi Highway", category: "national_highway" },
                geometry: { type: "LineString", coordinates: [[84.42, 27.85], [84.88, 27.81], [85.1, 27.75]] }
            },
            {
                type: "Feature",
                properties: { name: "Araniko Highway", category: "national_highway" },
                geometry: { type: "LineString", coordinates: [[85.34, 27.70], [85.55, 27.62], [85.8, 27.55]] }
            },
            {
                type: "Feature",
                properties: { name: "Ring Road", category: "major_road" },
                geometry: { type: "LineString", coordinates: [[85.28, 27.69], [85.34, 27.67], [85.35, 27.71], [85.30, 27.73], [85.28, 27.69]] }
            },
            {
                type: "Feature",
                properties: { name: "Thamel Marg", category: "local_road" },
                geometry: { type: "LineString", coordinates: [[85.314, 27.713], [85.312, 27.715], [85.315, 27.716]] }
            },
             {
                type: "Feature",
                properties: { name: "New Road", category: "major_road" },
                geometry: { type: "LineString", coordinates: [[85.310, 27.704], [85.307, 27.702]] }
            },
        ]
    };


    // --- NEW: Backend API Simulation ---
    private backend = {
        // --- Superadmin and Logging Simulation ---
        superadminSettings: {
            reportHeaders: [
                "Government of Nepal",
                "Ministry of Physical Infrastructure and Transport",
                "Department of Roads",
                "Road Status Report"
            ],
            copyrightText: `© ${new Date().getFullYear()} Sadak Sathi. All Rights Reserved.`,
            reportPermission: 'admins_only' // 'admins_only' or 'logged_in_users'
        },
        logs: [`[${new Date().toISOString()}] System Initialized.`],
        
        // --- NEW: Admin Workflow Data ---
        pendingReports: [
            { id: 'pend-1', roadName: 'Prithvi Highway', incidentType: 'landslide', description: 'Small landslide near Mugling, one lane is blocked.', reportedBy: 'user-a@test.com', lat: 27.8533, lon: 84.4233, jurisdiction: 'Prithvi Highway Division', timestamp: new Date(Date.now() - 3 * 3600 * 1000).toISOString(), status: 'pending' },
            { id: 'pend-2', roadName: 'Ring Road', incidentType: 'flood', description: 'Heavy waterlogging near Koteshwor after rain.', reportedBy: 'user-b@test.com', lat: 27.6732, lon: 85.3418, jurisdiction: 'Kathmandu Valley', timestamp: new Date(Date.now() - 1 * 3600 * 1000).toISOString(), status: 'pending' },
            { id: 'pend-3', roadName: 'Siddhartha Highway', incidentType: 'broken_road', description: 'Large pothole on the road to Pokhara from Butwal, dangerous for bikes.', reportedBy: 'user-c@test.com', lat: 28.2, lon: 83.9, jurisdiction: 'Pokhara Division', timestamp: new Date(Date.now() - 5 * 3600 * 1000).toISOString(), status: 'pending' },
        ],
        notifications: [
            { id: 'notif-1', text: "New user report: landslide on Prithvi Highway.", timestamp: new Date(Date.now() - 3 * 3600 * 1000).toISOString(), read: false, targetReportId: 'pend-1', jurisdiction: 'Prithvi Highway Division' },
            { id: 'notif-2', text: "New user report: flooding on Ring Road.", timestamp: new Date(Date.now() - 1 * 3600 * 1000).toISOString(), read: false, targetReportId: 'pend-2', jurisdiction: 'Kathmandu Valley' },
        ],
        
        // --- NEW: Admin Workflow API Methods ---
        getPendingReports: async (jurisdiction: string) => {
             console.log(`SIMULATING BACKEND CALL: /api/getPendingReports for jurisdiction: ${jurisdiction}`);
             await new Promise(res => setTimeout(res, 400));
             return this.backend.pendingReports.filter(r => r.status === 'pending' && r.jurisdiction === jurisdiction);
        },
        getJurisdictionReports: async (jurisdiction: string) => {
             console.log(`SIMULATING BACKEND CALL: /api/getJurisdictionReports for ${jurisdiction}`);
             await new Promise(res => setTimeout(res, 400));
             // In a real app, this would query a DB
             return this.historicalIncidents.filter(r => r.jurisdiction === jurisdiction && r.status === 'approved');
        },
        approveReport: async (reportId: string, adminData: any) => {
             console.log(`SIMULATING BACKEND CALL: /api/approveReport for ${reportId}`);
             await new Promise(res => setTimeout(res, 600));
             const reportIndex = this.backend.pendingReports.findIndex(r => r.id === reportId);
             if (reportIndex > -1) {
                 this.backend.pendingReports[reportIndex].status = 'approved';
                 // Add the approved report to the main historical/live data
                 const approvedIncident = {
                    ...adminData, // Use the admin's verified data
                    id: `approved-${reportId}`,
                    source: `Verified from User Report by ${adminData.approvedBy}`,
                    sourceType: 'official', // Now it's an official report
                    status: 'approved',
                 };
                 this.historicalIncidents.push(approvedIncident);
                 return { success: true, approvedIncident };
             }
             return { success: false };
        },
        rejectReport: async (reportId: string) => {
            console.log(`SIMULATING BACKEND CALL: /api/rejectReport for ${reportId}`);
            await new Promise(res => setTimeout(res, 300));
            const reportIndex = this.backend.pendingReports.findIndex(r => r.id === reportId);
            if (reportIndex > -1) {
                this.backend.pendingReports[reportIndex].status = 'rejected';
                 return { success: true };
            }
            return { success: false };
        },
        relayReport: async (reportId: string, newJurisdiction: string, adminEmail: string) => {
            console.log(`SIMULATING BACKEND CALL: /api/relayReport for ${reportId} to ${newJurisdiction}`);
            await new Promise(res => setTimeout(res, 500));
             const reportIndex = this.backend.pendingReports.findIndex(r => r.id === reportId);
             if (reportIndex > -1) {
                this.backend.pendingReports[reportIndex].jurisdiction = newJurisdiction;
                // Create a notification for the new jurisdiction's admins
                const newNotif = {
                     id: `notif-${Date.now()}`,
                     text: `Report relayed by ${adminEmail}: ${this.backend.pendingReports[reportIndex].incidentType} on ${this.backend.pendingReports[reportIndex].roadName}`,
                     timestamp: new Date().toISOString(),
                     read: false,
                     targetReportId: reportId,
                     jurisdiction: newJurisdiction // Target the notification
                };
                this.backend.notifications.unshift(newNotif);
                return { success: true };
             }
             return { success: false };
        },
        getNotifications: async () => {
            console.log("SIMULATING BACKEND CALL: /api/getNotifications");
            await new Promise(res => setTimeout(res, 300));
            return this.backend.notifications;
        },
        markNotificationRead: async (notificationId: string) => {
             console.log(`SIMULATING BACKEND CALL: /api/markNotificationRead for ${notificationId}`);
             await new Promise(res => setTimeout(res, 100));
             const notif = this.backend.notifications.find(n => n.id === notificationId);
             if (notif) notif.read = true;
             return { success: true };
        },


        getSuperadminSettings: async () => {
            console.log("SIMULATING BACKEND CALL: /api/getSuperadminSettings");
            await new Promise(res => setTimeout(res, 200));
            return JSON.parse(JSON.stringify(this.backend.superadminSettings)); // Deep copy
        },

        updateSuperadminSettings: async (newSettings: any) => {
            console.log("SIMULATING BACKEND CALL: /api/updateSuperadminSettings", newSettings);
            await new Promise(res => setTimeout(res, 500));
            this.backend.superadminSettings = { ...this.backend.superadminSettings, ...newSettings };
            return { success: true };
        },

        getLogs: async () => {
            console.log("SIMULATING BACKEND CALL: /api/getLogs");
            await new Promise(res => setTimeout(res, 300));
            return [...this.backend.logs];
        },

        logActivity: (message: string) => {
            const timestamp = new Date().toISOString();
            this.backend.logs.push(`[${timestamp}] ${message}`);
            if (this.backend.logs.length > 200) { // Keep logs from getting too big
                this.backend.logs.shift();
            }
        },
        getIncidents: async () => {
            console.log("SIMULATING BACKEND CALL: /api/getIncidents");
            await new Promise(res => setTimeout(res, 600));
            return [
                { id: 'live-1', roadName: 'Prithvi Highway', incidentType: 'accident', description: 'Two-vehicle collision near Malekhu. Expect delays.', lat: 27.81, lon: 84.88, status: 'active' },
                { id: 'live-2', roadName: 'Ring Road', incidentType: 'construction', description: 'Road expansion work near Kalanki. One lane closed.', lat: 27.69, lon: 85.28, status: 'active' },
                { id: 'live-3', roadName: 'Araniko Highway', incidentType: 'hazard', description: 'Fallen tree blocking the road near Dhulikhel.', lat: 27.62, lon: 85.55, status: 'active' },
                { id: 'live-4', roadName: 'Mahendra Highway', incidentType: 'traffic_jam', description: 'Heavy congestion due to a local event in Butwal.', lat: 27.69, lon: 83.45, status: 'active' },
            ];
        },
        submitUserReport: async (reportData: any) => {
            console.log("SIMULATING BACKEND CALL: /api/submitReport", reportData);
            await new Promise(res => setTimeout(res, 700)); // Simulate network delay
            
            const newReport = {
                ...reportData,
                id: `pend-${Date.now()}`,
                roadName: "Unknown Road (User Report)",
                jurisdiction: "Kathmandu Valley" 
            };
            this.backend.pendingReports.unshift(newReport); 
            
            const newNotif = {
                 id: `notif-${Date.now()}`,
                 text: `New user report: ${reportData.incidentType} from ${reportData.reportedBy}`,
                 timestamp: new Date().toISOString(),
                 read: false,
                 targetReportId: newReport.id,
                 jurisdiction: newReport.jurisdiction
            };
            this.backend.notifications.unshift(newNotif);

            return { success: true, reportId: newReport.id };
        },
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
                { icon: 'wb_sunny', desc: 'Clear Sky' },
                { icon: 'partly_cloudy_day', desc: 'Partly Cloudy' },
                { icon: 'cloud', desc: 'Overcast' },
                { icon: 'rainy', desc: 'Light Rain' },
            ];
            const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
            const todayIndex = new Date().getDay();

            const currentTemp = 20 + Math.floor(Math.random() * 10);
            const currentWeather = {
                ...weatherTypes[Math.floor(Math.random() * weatherTypes.length)],
                temp: currentTemp
            };
            
            const forecast = [];
            for (let i = 1; i <= 3; i++) {
                const dayIndex = (todayIndex + i) % 7;
                const high = currentTemp + Math.floor(Math.random() * 5);
                const low = currentTemp - Math.floor(Math.random() * 5);
                forecast.push({
                    day: days[dayIndex],
                    ...weatherTypes[Math.floor(Math.random() * weatherTypes.length)],
                    temp_high: high,
                    temp_low: low,
                });
            }

            return {
                current: currentWeather,
                forecast: forecast,
            };
        },
        getWeatherInsights: async (weatherData: { current: any, forecast: any[] }) => {
            console.log("SIMULATING BACKEND CALL: /api/getWeatherInsights with data:", weatherData);
            await new Promise(res => setTimeout(res, 1300)); // Simulate AI thinking time
        
            const { temp, desc } = weatherData.current;
        
            // In a real app, this would be a prompt to Gemini
            const prompt = `Based on the following weather in Nepal (Temp: ${temp}°C, Condition: ${desc}), provide a concise, one-sentence travel advisory. Mention clothing or precautions.`;
            console.log("Simulated AI Prompt for weather insights:", prompt);
        
            // Simulated AI Responses
            let insight = "Weather conditions are normal. Enjoy your trip.";
            if (desc.toLowerCase().includes('rain')) {
                insight = "Light rain is expected; it's a good idea to carry an umbrella or a waterproof jacket.";
            } else if (temp > 28 && desc.toLowerCase().includes('clear')) {
                insight = "It's a warm and sunny day; remember to stay hydrated and use sunscreen.";
            } else if (temp < 15) {
                insight = `It's a bit chilly at ${temp}°C, so wearing a light jacket or sweater is recommended.`;
            } else if (desc.toLowerCase().includes('cloudy')) {
                insight = "With overcast skies, the weather is pleasant for exploring the area on foot.";
            }
        
            return { insight };
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
        },
        getAlternativeRoutes: async (prefs: { preferHighways: boolean, avoidTolls: boolean, preferScenic: boolean, preferLessCrowded: boolean, avoidUnpaved: boolean }) => {
            console.log("SIMULATING BACKEND CALL: /api/getAlternativeRoutes with prefs:", prefs);
            await new Promise(res => setTimeout(res, 2000)); // Simulate AI thinking time
            
            // Mock GeoJSON for routes
            const route1_coords = [[85.3240, 27.7172], [85.3180, 27.7050], [85.3100, 27.7000]]; // Direct
            const route2_coords = [[85.3240, 27.7172], [85.3300, 27.7180], [85.3250, 27.7100], [85.3100, 27.7000]]; // Ring road
            const route3_coords = [[85.3240, 27.7172], [85.3210, 27.7150], [85.3150, 27.6950], [85.3100, 27.7000]]; // Scenic
            
            const routes = [
                {
                    id: 'route-fastest-1',
                    type: 'fastest',
                    name: 'Fastest',
                    distance: 5.2,
                    time: 18,
                    summary: en_translations.route_summary_traffic_light,
                    geometry: { type: 'LineString', coordinates: route1_coords },
                    directions: [
                        { instruction: 'Head south on King\'s Way', icon: 'straight', condition: { type: 'clear' } },
                        { instruction: 'Turn right at Jamal. Expect delays.', icon: 'turn_right', condition: { type: 'construction', details: 'Lane closure due to metro work.', source: 'DoTM', sourceType: 'official', lastUpdated: new Date(Date.now() - 2 * 3600 * 1000).toISOString()} },
                        { instruction: 'Continue to Tripureshwor', icon: 'straight', condition: { type: 'traffic_jam', details: 'Heavy congestion reported near the stadium.', source: 'Traffic Police', sourceType: 'official', lastUpdated: new Date(Date.now() - 15 * 60 * 1000).toISOString()} },
                    ]
                },
                {
                    id: 'route-alternative-2',
                    type: 'alternative',
                    name: 'Alternative',
                    distance: 6.1,
                    time: 22,
                    summary: en_translations.route_summary_traffic_moderate,
                    geometry: { type: 'LineString', coordinates: route2_coords },
                    directions: [
                        { instruction: 'Head east on Durbar Marg', icon: 'straight', condition: { type: 'clear' } },
                        { instruction: 'Join the Ring Road at Chabahil. Road is blocked.', icon: 'turn_left', condition: { type: 'blocked', details: 'Road closed due to VIP movement. Expected to open in 1 hour.', source: 'Dept. of Roads', sourceType: 'official', lastUpdated: new Date(Date.now() - 5 * 60 * 1000).toISOString() } },
                        { instruction: 'Follow Ring Road to destination', icon: 'straight', condition: { type: 'clear' } },
                    ]
                },
            ];

            if (prefs.preferHighways) {
                const fastestRoute = routes.find(r => r.type === 'fastest');
                if (fastestRoute) {
                    fastestRoute.time = Math.round(fastestRoute.time * 0.9); // Make it 10% faster
                    fastestRoute.summary = `The fastest route, primarily using national highways.`;
                }
            }
    
            // Conditionally add a scenic route if requested
            if (prefs.preferScenic) {
                routes.push({
                    id: 'route-scenic-3',
                    type: 'scenic',
                    name: 'Scenic',
                    distance: 7.5,
                    time: 35,
                    summary: en_translations.route_summary_scenic,
                    geometry: { type: 'LineString', coordinates: route3_coords },
                    directions: [
                        { instruction: 'Take the scenic path through Ason', icon: 'turn_left', condition: { type: 'one_lane', details: 'Landslide has blocked one lane. Proceed with caution.', source: 'Gov. of Nepal', sourceType: 'official', lastUpdated: new Date(Date.now() - 6 * 3600 * 1000).toISOString() } },
                        { instruction: 'Pass by the gardens', icon: 'straight', condition: { type: 'clear' } },
                        { instruction: 'Arrive at your destination refreshed', icon: 'flag', condition: { type: 'clear' } },
                    ]
                });
            }

            // NEW LOGIC for less crowded & avoid unpaved
            if (prefs.preferLessCrowded) {
                // Simulate by making the alternative route faster and less crowded.
                const alternativeRoute = routes.find(r => r.type === 'alternative');
                if (alternativeRoute) {
                    alternativeRoute.time = 20;
                    alternativeRoute.summary = "A less crowded route avoiding heavy traffic.";
                }
            }

            if (prefs.avoidUnpaved) {
                // In our mock, let's assume the scenic route has unpaved sections.
                // We'll remove it if it exists.
                const scenicRouteIndex = routes.findIndex(r => r.type === 'scenic');
                if (scenicRouteIndex !== -1) {
                    routes.splice(scenicRouteIndex, 1);
                }
            }
            
            return routes;
        },
        getRouteSummaries: async (routes: any[], prefs: { preferHighways: boolean, avoidTolls: boolean, preferScenic: boolean, preferLessCrowded: boolean, avoidUnpaved: boolean }) => {
            console.log("SIMULATING BACKEND CALL: /api/getRouteSummaries");
            await new Promise(res => setTimeout(res, 800)); // Simulate network latency for AI summaries
        
            const updatedRoutes = routes.map(route => {
                // In a real app, this would be a prompt to Gemini
                const prompt = `Generate a short, engaging, one-sentence summary for a driving route in Nepal with these stats:
                - Type: ${route.type}
                - Distance: ${route.distance} km
                - Time: ${route.time} min
                - User Prefs: Scenic=${prefs.preferScenic}, Avoid Tolls=${prefs.avoidTolls}, Less Crowded=${prefs.preferLessCrowded}, Avoid Unpaved=${prefs.avoidUnpaved}
                The summary should be friendly and helpful.`;
        
                console.log("Simulated AI Prompt for route", route.id, ":", prompt);
        
                // Simulated AI Responses
                let summary = route.summary; // fallback to original
                if (route.type === 'scenic') {
                    summary = `Take the scenic path; this route offers the best views for a relaxed ${route.time}-minute journey.`;
                } else if (route.type === 'fastest') {
                    summary = `The quickest route, getting you to your destination in just ${route.time} minutes.`;
                } else if (route.type === 'alternative') {
                    summary = `A balanced alternative that avoids major congestion, with an estimated time of ${route.time} minutes.`;
                }
                
                if (prefs.avoidTolls && !summary.toLowerCase().includes('toll')) {
                    summary += " It also avoids all tolls.";
                }

                if (prefs.preferLessCrowded && route.type === 'alternative') {
                    summary = `This less crowded route should get you there in about ${route.time} minutes, bypassing the worst traffic.`
                }
        
                return { ...route, summary: summary };
            });
        
            return updatedRoutes;
        },
        getPoiDetails: async (poiId: string, poiName: string) => {
            console.log(`SIMULATING BACKEND CALL: /api/getPoiDetails for ${poiId}`);
            await new Promise(res => setTimeout(res, 1500)); // Simulate AI fetch time
            
            // This is where you would craft a detailed prompt for Gemini
            const prompt = `Provide a comprehensive but concise travel guide entry for "${poiName}" in Nepal. Include a brief description, a short history, typical operating hours, entry fees, and 2-3 essential 'local tips' for visitors.`;
            console.log("Simulated AI Prompt for POI details:", prompt);

            // Mock responses based on POI
            const details: any = {
                'poi-1': {
                    description: "A breathtaking complex of palaces, courtyards, and temples, Kathmandu Durbar Square is the historical heart of the city and a UNESCO World Heritage Site. It's a living museum of Nepal's artistic and architectural achievements.",
                    history: "Built between the 12th and 18th centuries by the Malla kings, this square has been the seat of royalty for centuries. It has witnessed countless coronations, festivals, and historical events that have shaped Nepal.",
                    operatingHours: "7:00 AM - 7:00 PM, daily",
                    entryFee: "NPR 1000 for foreign nationals, NPR 150 for SAARC nationals.",
                    localTips: [
                        "Visit in the early morning or late afternoon to avoid crowds and catch the best light for photos.",
                        "Don't miss the Kumari Ghar, the residence of the living goddess.",
                        "Hire a local guide to truly understand the rich history behind the intricate carvings and structures."
                    ]
                },
                'poi-2': {
                    description: "An oasis of tranquility in the bustling city, the Garden of Dreams is a beautifully restored neo-classical garden. It features pavilions, fountains, and a vast collection of exotic plants.",
                    history: "Created in the 1920s by Field Marshal Kaiser Shumsher Rana, the garden was inspired by the Edwardian style. After years of neglect, it was beautifully restored between 2000 and 2007.",
                    operatingHours: "9:00 AM - 9:00 PM, daily",
                    entryFee: "NPR 400 per person.",
                    localTips: [
                        "It's a perfect spot for a quiet afternoon with a book.",
                        "The Kaiser Cafe inside offers a great dining experience, especially in the evening.",
                        "Look for the hidden corners and pavilions for the most peaceful experience."
                    ]
                }
            };

            return details[poiId] || {
                description: `This is a simulated AI-generated description for ${poiName}. It's a wonderful place to visit with a rich cultural heritage and friendly locals.`,
                history: "The history of this place is long and storied, dating back centuries.",
                operatingHours: "Typically 9:00 AM to 5:00 PM, but it's best to check locally.",
                entryFee: "Varies.",
                localTips: ["Try the local momos!", "Bargain respectfully at the souvenir shops."]
            };
        },
        getHistoricalIncidents: async () => {
            console.log("SIMULATING BACKEND CALL: /api/getHistoricalIncidents");
            await new Promise(res => setTimeout(res, 800));
        
            const incidents = [];
            const roadNames = ["Araniko Highway", "Prithvi Highway", "Ring Road", "Mahendra Highway", "Siddhartha Highway", "Karnali Highway"];
            const incidentTypes = ["blocked", "construction", "one_lane", "hazard", "accident", "traffic_jam"];
            const jurisdictions = ["Kathmandu Valley", "Pokhara Division", "Prithvi Highway Division", "Butwal Division", "Itahari Division"];

            const now = new Date();
            const startOfYear = new Date(now.getFullYear(), 0, 1);
        
            for (let i = 0; i < 150; i++) {
                const randomTime = startOfYear.getTime() + Math.random() * (now.getTime() - startOfYear.getTime());
                const endDate = new Date(randomTime);
                
                const durationHours = 1 + Math.random() * 72; // Duration from 1 hour to 3 days
                const startDate = new Date(endDate.getTime() - durationHours * 60 * 60 * 1000);
                
                incidents.push({
                    id: `hist-inc-${i}`,
                    roadName: roadNames[Math.floor(Math.random() * roadNames.length)],
                    incidentType: incidentTypes[Math.floor(Math.random() * incidentTypes.length)],
                    startDate: startDate.toISOString(),
                    endDate: endDate.toISOString(),
                    status: 'approved', // Historical data is considered approved
                    sourceType: 'official', // Assume historical data is official
                    jurisdiction: jurisdictions[Math.floor(Math.random() * jurisdictions.length)],
                });
            }
            // Add pending user reports to the main incident list so they can be archived
            // but they will be filtered from public view by their 'pending' status.
            return incidents.concat(this.backend.pendingReports);
        }
    };
    
    // --- Firebase Integration ---
    private firebaseApp: any;
    private auth: any;
    private db: any;
    private isBackendConfigured: boolean = false; // NEW: Flag for demo mode
    private currentUser: { email: string, role: 'guest' | 'user' | 'admin' | 'superadmin', jurisdiction?: string } | null = null;

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

    // Context State
    private selectedEntityContext: any = null;
    
    private activeRouteData: any | null = null;
    private availableRoutes: any[] = [];
    private activeRoutePrefs: { preferHighways: boolean, avoidTolls: boolean, preferScenic: boolean, preferLessCrowded: boolean, avoidUnpaved: boolean } | null = null;

    // Offline Maps State
    private downloadedRegions: {id: string, name: string, size: string}[] = [];
    private offlineRegionMetadata: { [key: string]: { nameKey: string, bounds: [[number, number], [number, number]], density: number } } = {
        kathmandu: { nameKey: 'kathmandu_valley', bounds: [[27.6, 85.2], [27.8, 85.5]], density: 250 }, // Higher density for urban area
        pokhara: { nameKey: 'pokhara', bounds: [[28.15, 83.9], [28.3, 84.1]], density: 200 },
        chitwan: { nameKey: 'chitwan', bounds: [[27.4, 83.8], [27.7, 84.7]], density: 50 },
        lumbini: { nameKey: 'lumbini', bounds: [[27.4, 83.2], [27.6, 83.4]], density: 80 },
        everest: { nameKey: 'everest_region', bounds: [[27.7, 86.5], [28.1, 87.0]], density: 35 } // Lower density for mountainous terrain
    };

    // Proactive Alert State
    private proactiveAlertInterval: number | null = null;
    private lastAlertTime: number = 0;

    // Reports State
    private historicalIncidents: any[] = [];
    private reportsChart: any = null;
    private cardViewCurrentIndex: number = 0;
    private cardViewData: any[] = [];

    // Admin State
    private adminFormMap: any = null;
    private adminFormMarker: any = null;
    private adminFormRecognition: any = null;
    private isAdminFormRecognizing: boolean = false;

    // Search Suggestions State
    private searchDebounceTimer: number | null = null;
    private mockSuggestions = [
        { text: 'Prithvi Highway', type: 'road', icon: 'signpost' },
        { text: 'Araniko Highway', type: 'road', icon: 'signpost' },
        { text: 'Ring Road, Kathmandu', type: 'place', icon: 'place' },
        { text: 'Mahendra Highway', type: 'road', icon: 'signpost' },
        { text: 'Kathmandu Durbar Square', type: 'poi', icon: 'account_balance' },
        { text: 'Pashupatinath Temple', type: 'poi', icon: 'account_balance' },
        { text: 'Swayambhunath Stupa', type: 'poi', icon: 'account_balance' },
        { text: 'Phewa Lake, Pokhara', type: 'poi', icon: 'water' },
        { text: 'Thamel, Kathmandu', type: 'place', icon: 'place' },
        { text: 'Lumbini', type: 'place', icon: 'place' },
        { text: 'Sagarmatha National Park', type: 'place', icon: 'park' },
        { text: 'Chitwan National Park', type: 'place', icon: 'park' },
        { text: 'What are the road conditions on Prithvi Highway?', type: 'ai_query', icon: 'help_outline' },
        { text: 'Show me scenic routes near Pokhara', type: 'ai_query', icon: 'help_outline' },
        { text: 'Are there any traffic jams in Kathmandu?', type: 'ai_query', icon: 'help_outline' },
        { text: 'Find a good place to eat in Thamel', type: 'ai_query', icon: 'help_outline' },
    ];
    private liveIncidents: any[] = [];


    constructor() {
        this._init();
    }
    
    private _init() {
        this.translations = en_translations; // Default to English
        this.loadingOverlay = document.getElementById('loading-overlay')!;
        this.loadingMessage = document.getElementById('loading-message')!;
        this._logActivity('App initialization started.');

        this.loadingMessage.textContent = this.translations.loading_map;
        this._initializeMap(); // This will trigger the rest of the initialization
    }

    private _finishInitialization() {
        this.loadingMessage.textContent = this.translations.loading_voices;
        this._initSpeechSynthesis();
        this._initSpeechRecognition();
        
        this.loadingMessage.textContent = this.translations.loading_ui;
        this._setupUiEventListeners();

        this.loadingMessage.textContent = this.translations.loading_settings;
        this._applyInitialSettings();
        this._initOfflineMaps();
        
        this.loadingMessage.textContent = this.translations.loading_data;
        this._initLiveIncidents();
        this._initProactiveAlerts();
        this._initRouteFromUrlParams();
        this._initCompass();
        this._initGeolocationWatcher();
        
        this._updateUiForUserRole();
        this._initTheme();

        // Now hide the loading screen
        this.loadingMessage.textContent = this.translations.loading_complete;
        setTimeout(() => {
            if (this.loadingOverlay) {
                this.loadingOverlay.style.opacity = '0';
                setTimeout(() => this.loadingOverlay.classList.add('hidden'), 500);
            }
        }, 500);
    }

    private _setupUiEventListeners() {
        // Header & Core UI
        document.getElementById('theme-toggle')?.addEventListener('click', this._toggleTheme.bind(this));
        document.getElementById('fab-profile-btn')?.addEventListener('click', this._handleProfileClick.bind(this));
        document.getElementById('logout-btn')?.addEventListener('click', this._handleLogout.bind(this));
        
        // --- NEW: Language Selector Listeners ---
        document.getElementById('language-selector-btn')?.addEventListener('click', this._toggleLanguagePopup.bind(this));
        document.querySelectorAll('.lang-tab-btn').forEach(btn => btn.addEventListener('click', this._handleLangTabClick.bind(this)));
        document.querySelectorAll('.lang-option').forEach(btn => btn.addEventListener('click', this._handleLangOptionClick.bind(this)));
        document.addEventListener('click', this._handleGlobalClickForLanguage.bind(this));
        document.addEventListener('click', this._handleGlobalClickForMapOptions.bind(this));

        // Search & Routing
        document.getElementById('unified-search-input')?.addEventListener('input', this._handleSearchInput.bind(this));
        document.addEventListener('click', this._handleGlobalClickForSearch.bind(this));
        document.getElementById('from-input')?.addEventListener('input', this._updateRoutingUI.bind(this));
        document.getElementById('to-input')?.addEventListener('input', this._updateRoutingUI.bind(this));
        document.getElementById('find-route-btn')?.addEventListener('click', this._handleFindRoute.bind(this));
        document.getElementById('clear-route-btn')?.addEventListener('click', this._handleClearRoute.bind(this));
        document.getElementById('route-details-close')?.addEventListener('click', this._handleClearRoute.bind(this));
        document.getElementById('detail-card-close')?.addEventListener('click', this._hideDetailCard.bind(this));
        document.getElementById('share-route-btn')?.addEventListener('click', this._openShareModal.bind(this));
        document.querySelectorAll('#route-preferences-bar input[type="checkbox"]').forEach(checkbox => {
            checkbox.addEventListener('change', this._handlePreferenceChange.bind(this));
        });
        
        // NEW: Route Preferences Modal
        document.getElementById('open-route-prefs-btn')?.addEventListener('click', this._openRoutePreferencesModal.bind(this));
        document.getElementById('route-prefs-close-btn')?.addEventListener('click', this._closeRoutePreferencesModal.bind(this));
        document.getElementById('route-prefs-cancel-btn')?.addEventListener('click', this._closeRoutePreferencesModal.bind(this));
        document.getElementById('route-prefs-save-btn')?.addEventListener('click', this._handleSaveRoutePreferences.bind(this));

        // Map Controls
        document.getElementById('zoom-in-btn')?.addEventListener('click', () => this.map.zoomIn());
        document.getElementById('zoom-out-btn')?.addEventListener('click', () => this.map.zoomOut());
        document.getElementById('center-location-btn')?.addEventListener('click', this._centerOnUserLocation.bind(this));
        document.getElementById('toggle-heading-up-btn')?.addEventListener('click', this._toggleHeadingUpMode.bind(this));
        document.getElementById('measure-distance-btn')?.addEventListener('click', this._toggleDistanceTool.bind(this));
        document.getElementById('distance-clear-btn')?.addEventListener('click', this._clearDistanceMeasurement.bind(this));
        document.getElementById('map-options-btn')?.addEventListener('click', this._toggleMapOptionsPopup.bind(this));
        document.getElementById('toggle-roads')?.addEventListener('change', (e) => {
            const isChecked = (e.target as HTMLInputElement).checked;
            if (isChecked) {
                this.map.addLayer(this.roadLayer);
            } else {
                this.map.removeLayer(this.roadLayer);
            }
        });
        document.querySelectorAll('.road-filter-toggle input[type="checkbox"]').forEach(checkbox => {
            checkbox.addEventListener('change', this._handleRoadFilterChange.bind(this));
        });
        document.getElementById('toggle-pois')?.addEventListener('change', (e) => {
            const isChecked = (e.target as HTMLInputElement).checked;
            if (isChecked) {
                this.map.addLayer(this.poiLayer);
            } else {
                this.map.removeLayer(this.poiLayer);
            }
        });
        document.getElementById('toggle-incidents')?.addEventListener('change', (e) => {
            const isChecked = (e.target as HTMLInputElement).checked;
            if (isChecked) {
                this.map.addLayer(this.incidentLayer);
            } else {
                this.map.removeLayer(this.incidentLayer);
            }
        });
        document.getElementById('toggle-traffic')?.addEventListener('change', (e) => {
            const isChecked = (e.target as HTMLInputElement).checked;
            if (isChecked) {
                this._fetchAndDisplayTraffic();
            } else {
                this._hideTraffic();
            }
        });
        document.querySelectorAll('.style-option').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const style = (e.currentTarget as HTMLElement).dataset.style;
                if (style) this._setMapStyle(style);
            });
        });
        document.querySelectorAll('.poi-filter-toggle input[type="checkbox"]').forEach(checkbox => {
            checkbox.addEventListener('change', this._handlePoiFilterChange.bind(this));
        });

        // Live Camera
        document.getElementById('live-cam-btn')?.addEventListener('click', this._openLiveCam.bind(this));
        document.getElementById('close-cam-btn')?.addEventListener('click', this._closeLiveCam.bind(this));
        
        // Proactive Alert
        document.getElementById('alert-close-btn')?.addEventListener('click', this._hideProactiveAlert.bind(this));
        document.getElementById('alert-ask-ai-btn')?.addEventListener('click', (e) => {
            const query = (e.currentTarget as HTMLElement).dataset.aiQuery;
            this._hideProactiveAlert();
            if (query) {
                this._openChatAndSendMessage(query);
            }
        });
        
        // AI Chat
        document.getElementById('unified-search-ai-btn')?.addEventListener('click', this._openChat.bind(this));
        document.getElementById('close-chat-btn')?.addEventListener('click', this._closeChat.bind(this));
        document.getElementById('chat-form')?.addEventListener('submit', this._handleChatSubmit.bind(this));
        document.getElementById('voice-command-btn')?.addEventListener('click', this._toggleVoiceInput.bind(this));
        
        // FAB Menu & Modals
        document.getElementById('fab-main-btn')?.addEventListener('click', this._toggleFabMenu.bind(this));
        document.getElementById('fab-settings-btn')?.addEventListener('click', this._openSettingsPanel.bind(this));
        document.getElementById('open-settings-btn')?.addEventListener('click', this._openSettingsPanel.bind(this));
        document.querySelector('#settings-panel .icon-button')?.addEventListener('click', () => {
            document.getElementById('settings-panel')?.classList.remove('open');
        });

        // Find My Car
        document.getElementById('fab-find-car-btn')?.addEventListener('click', this._openFindCarModal.bind(this));
        document.getElementById('find-car-close-btn')?.addEventListener('click', this._closeFindCarModal.bind(this));
        document.getElementById('park-here-btn')?.addEventListener('click', this._handleParkHere.bind(this));
        document.getElementById('get-directions-to-car-btn')?.addEventListener('click', this._handleGetDirectionsToCar.bind(this));
        document.getElementById('clear-car-location-btn')?.addEventListener('click', this._handleClearCarLocation.bind(this));
        
        // Share Modal
        document.getElementById('share-route-close-btn')?.addEventListener('click', () => {
            document.getElementById('share-route-modal')?.classList.add('hidden');
        });
        document.getElementById('copy-share-link-btn')?.addEventListener('click', this._handleCopyLink.bind(this));

        // Offline Maps
        document.getElementById('add-offline-region-btn')?.addEventListener('click', this._showOfflineMapsModal.bind(this));
        document.getElementById('offline-maps-close-btn')?.addEventListener('click', () => {
            document.getElementById('offline-maps-modal')?.classList.add('hidden');
        });
        document.querySelectorAll('#download-region-options .download-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const target = e.currentTarget as HTMLElement;
                const listItem = target.closest('li');
                if (listItem) {
                    const regionId = listItem.dataset.region;
                    const regionName = listItem.querySelector('.region-info strong')?.textContent;
                    const regionSize = listItem.querySelector('.region-size')?.textContent;
                    if (regionId && regionName && regionSize) {
                        this._handleDownloadRegion(listItem, regionId, regionName, regionSize);
                    }
                }
            });
        });
        document.querySelectorAll('#download-region-options .delete-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const target = e.currentTarget as HTMLElement;
                const listItem = target.closest('li');
                if (listItem) {
                    const regionId = listItem.dataset.region;
                    const regionName = listItem.querySelector('.region-info strong')?.textContent;
                     if (regionId && regionName) {
                        this._handleDeleteRegion(listItem, regionId, regionName);
                    }
                }
            });
        });

        // Incident Reporting
        document.getElementById('report-incident-fab')?.addEventListener('click', this._openReportIncidentModal.bind(this));
        document.getElementById('report-incident-close')?.addEventListener('click', this._closeReportIncidentModal.bind(this));
        document.getElementById('report-incident-form')?.addEventListener('submit', this._handleReportIncidentSubmit.bind(this));
        document.getElementById('incident-photo-upload')?.addEventListener('change', this._handleIncidentPhotoPreview.bind(this));

        // Reports Modal
        document.getElementById('fab-reports-btn')?.addEventListener('click', this._openReportsModal.bind(this));
        document.getElementById('reports-close-btn')?.addEventListener('click', this._closeReportsModal.bind(this));
        document.querySelectorAll('.report-date-btn').forEach(btn => btn.addEventListener('click', this._handleReportDateFilterChange.bind(this)));
        document.querySelectorAll('.report-view-btn').forEach(btn => btn.addEventListener('click', this._handleReportViewChange.bind(this)));
        document.getElementById('report-date-start')?.addEventListener('change', this._handleReportCustomDateChange.bind(this));
        document.getElementById('report-date-end')?.addEventListener('change', this._handleReportCustomDateChange.bind(this));
        document.querySelectorAll('.report-type-btn').forEach(btn => btn.addEventListener('click', this._handleReportTypeChange.bind(this)));
        document.getElementById('download-csv-btn')?.addEventListener('click', this._handleDownloadReport.bind(this, 'csv'));
        document.getElementById('share-report-btn')?.addEventListener('click', this._handleShareReport.bind(this));
        document.getElementById('download-pdf-btn')?.addEventListener('click', this._handleDownloadReport.bind(this, 'pdf'));
        document.getElementById('print-report-btn')?.addEventListener('click', this._handlePrintReport.bind(this));

        // Settings & Admin
        document.getElementById('persona-avatar-upload')?.addEventListener('change', this._handleAvatarUpload.bind(this));
        document.getElementById('persona-personality-select')?.addEventListener('change', this._handlePersonalityChange.bind(this));
        document.getElementById('superadmin-settings-btn')?.addEventListener('click', this._openSuperadminSettingsModal.bind(this));
        document.getElementById('superadmin-settings-close-btn')?.addEventListener('click', this._closeSuperadminSettingsModal.bind(this));
        document.getElementById('superadmin-settings-form')?.addEventListener('submit', this._handleSuperadminSettingsSave.bind(this));
        document.querySelectorAll('#superadmin-settings-modal .admin-tab-btn').forEach(btn => {
            btn.addEventListener('click', (e) => this._handleSuperadminTabChange(e.currentTarget as HTMLElement));
        });
        
        // Admin Dashboard & Workflow
        document.getElementById('admin-dashboard-btn')?.addEventListener('click', this._openAdminDashboard.bind(this));
        document.getElementById('admin-dashboard-close-btn')?.addEventListener('click', this._closeAdminDashboard.bind(this));
        document.querySelectorAll('#admin-dashboard-modal .admin-tab-btn').forEach(btn => {
            btn.addEventListener('click', (e) => this._handleAdminDashboardTabChange(e.currentTarget as HTMLElement));
        });
        document.getElementById('admin-form-close-btn')?.addEventListener('click', this._closeAdminFormModal.bind(this));
        document.getElementById('admin-form-cancel-btn')?.addEventListener('click', this._closeAdminFormModal.bind(this));
        document.getElementById('admin-edit-form')?.addEventListener('submit', this._handleAdminFormSubmit.bind(this));
        document.getElementById('admin-relay-cancel-btn')?.addEventListener('click', () => document.getElementById('admin-relay-modal')?.classList.add('hidden'));
        document.getElementById('admin-relay-confirm-btn')?.addEventListener('click', this._handleRelayConfirm.bind(this));
        document.getElementById('notifications-btn')?.addEventListener('click', this._toggleNotificationsPanel.bind(this));
        document.getElementById('admin-form-mic-btn')?.addEventListener('click', this._toggleAdminFormAI.bind(this));

        // Permission Modals
        document.getElementById('permission-modal-close-btn')?.addEventListener('click', () => document.getElementById('permission-help-modal')?.classList.add('hidden'));
        document.getElementById('pre-permission-deny-btn')?.addEventListener('click', () => document.getElementById('pre-permission-modal')?.classList.add('hidden'));

        // Online/Offline Listeners
        window.addEventListener('online', this._handleOnlineStatus.bind(this));
        window.addEventListener('offline', this._handleOfflineStatus.bind(this));
    }

    private _initializeMap() {
        try {
            // Initialize 2D Map (Leaflet)
            this.map = L.map('map', {
                ...INITIAL_VIEW,
                maxBounds: NEPAL_BOUNDS,
                zoomControl: false // Using custom controls
            });

            this.tileLayers = {
                streets: L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { attribution: '&copy; OpenStreetMap contributors' }),
                satellite: L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', { attribution: '&copy; Esri' }),
                dark: L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', { attribution: '&copy; CartoDB' })
            };
            
            this.tileLayers['streets'].addTo(this.map);
            this.activeBaseLayer = 'streets';

            // Wait for the map to be fully ready before proceeding
            this.map.whenReady(() => {
                 this.routeLayer = L.geoJSON(null, {
                    style: (feature: any) => ({
                        color: '#3498db',
                        weight: 6,
                        opacity: 0.8
                    })
                }).addTo(this.map);

                this.nationalHighwayLayer = L.layerGroup().addTo(this.map);
                this.majorRoadLayer = L.layerGroup().addTo(this.map);
                this.localRoadLayer = L.layerGroup().addTo(this.map);
                this.roadLayer = L.layerGroup([this.nationalHighwayLayer, this.majorRoadLayer, this.localRoadLayer]).addTo(this.map);

                this.poiLayer = L.layerGroup().addTo(this.map);
                this.incidentLayer = L.layerGroup().addTo(this.map);
                this.distanceLayer = L.featureGroup().addTo(this.map);
                
                this._renderRoads();
                this._renderPois();

                this.trafficLayer = L.geoJSON(null, {
                    // Hide the original LineString paths
                    style: () => ({ opacity: 0, weight: 0 }),
                    onEachFeature: (feature: any, layer: any) => {
                        // For each LineString, add a marker icon at its center
                        if (layer.getCenter) {
                            const trafficLevel = feature.properties.traffic;
                            const center = layer.getCenter();

                            let iconHtml: string;
                            let className = 'traffic-icon-marker'; // Base class for the L.divIcon wrapper

                            switch (trafficLevel) {
                                case 'heavy':
                                    className += ' traffic-heavy';
                                    iconHtml = `
                                        <div class="traffic-icon-container">
                                            <span class="material-icons car-icon">directions_car</span>
                                            <span class="material-icons alert-icon">priority_high</span>
                                        </div>`;
                                    break;
                                case 'moderate':
                                    className += ' traffic-moderate';
                                    iconHtml = `
                                        <div class="traffic-icon-container">
                                            <span class="material-icons car-icon">directions_car</span>
                                        </div>`;
                                    break;
                                case 'light':
                                    className += ' traffic-light';
                                    iconHtml = `
                                        <div class="traffic-icon-container">
                                            <span class="material-icons car-icon">directions_car</span>
                                        </div>`;
                                    break;
                                default:
                                    className += ' traffic-unknown';
                                    iconHtml = `
                                        <div class="traffic-icon-container">
                                            <span class="material-icons car-icon">directions_car</span>
                                        </div>`;
                                    break;
                            }

                            const customIcon = L.divIcon({
                                html: iconHtml,
                                className: className,
                                iconSize: [36, 36],
                                iconAnchor: [18, 18]
                            });

                            L.marker(center, { icon: customIcon }).addTo(this.trafficLayer);
                        }
                    }
                });

                this.map.on('click', this._handleMapClick.bind(this));
                
                console.log("Map initialized and ready. Finishing app setup...");
                
                // Trigger the rest of the app's setup now that the map is ready.
                this._finishInitialization();
            });

        } catch (error) {
            console.error("Leaflet map initialization failed:", error);
            if(this.loadingMessage) {
                this.loadingMessage.textContent = "Error: Could not load the map.";
            }
        }
    }
    
    private _renderRoads() {
        this.nationalHighwayLayer.clearLayers();
        this.majorRoadLayer.clearLayers();
        this.localRoadLayer.clearLayers();

        const roadStyles = {
            national_highway: { color: '#e74c3c', weight: 5, opacity: 0.8 },
            major_road: { color: '#f39c12', weight: 4, opacity: 0.9 },
            local_road: { color: '#7f8c8d', weight: 3, opacity: 0.7, dashArray: '5, 5' },
        };

        this.mockRoads.features.forEach((road: any) => {
            const category = road.properties.category as keyof typeof roadStyles;
            if (this.activeRoadFilters.has(category)) {
                // Leaflet expects [lat, lon], GeoJSON is [lon, lat], so we need to swap
                const swappedCoords = road.geometry.coordinates.map((coord: number[]) => [coord[1], coord[0]]);
                const roadLine = L.polyline(swappedCoords, roadStyles[category]);
                
                roadLine.bindTooltip(road.properties.name, { sticky: true });

                if (category === 'national_highway') {
                    this.nationalHighwayLayer.addLayer(roadLine);
                } else if (category === 'major_road') {
                    this.majorRoadLayer.addLayer(roadLine);
                } else {
                    this.localRoadLayer.addLayer(roadLine);
                }
            }
        });
    }

    private _renderPois() {
        this.poiLayer.clearLayers();
        const iconMap: { [key: string]: string } = {
            'heritage': 'account_balance',
            'park': 'park',
            'food': 'local_dining',
            'historical_site': 'history_edu',
            'religious_site': 'temple_hindu',
            'natural_attraction': 'terrain'
        };

        this.mockPois.forEach(poi => {
            if (this.activePoiFilters.has(poi.type)) {
                const iconHtml = `<div class="poi-marker-icon type-${poi.type}"><span class="material-icons">${iconMap[poi.type] || 'place'}</span></div>`;
                const customIcon = L.divIcon({
                    html: iconHtml,
                    className: '', // prevent default leaflet styles
                    iconSize: [32, 44],
                    iconAnchor: [16, 44]
                });

                const marker = L.marker([poi.lat, poi.lon], { icon: customIcon })
                    .addTo(this.poiLayer)
                    .on('click', (e: any) => {
                        L.DomEvent.stopPropagation(e);
                        this._handlePoiClick(poi)
                    });
            }
        });
    }

    private _handleRoadFilterChange(e: Event) {
        const input = e.target as HTMLInputElement;
        const roadCategory = input.dataset.roadCategory;
        if (!roadCategory) return;

        if (input.checked) {
            this.activeRoadFilters.add(roadCategory);
        } else {
            this.activeRoadFilters.delete(roadCategory);
        }
        this._renderRoads();
    }

    private _handlePoiFilterChange(e: Event) {
        const input = e.target as HTMLInputElement;
        const poiType = input.dataset.poiType;
        if (!poiType) return;

        if (input.checked) {
            this.activePoiFilters.add(poiType);
        } else {
            this.activePoiFilters.delete(poiType);
        }
        this._renderPois();
    }
    
    private _toggleMapOptionsPopup(e: Event) {
        e.stopPropagation();
        document.getElementById('map-options-popup')?.classList.toggle('hidden');
    }

    private _handleGlobalClickForMapOptions(e: Event) {
        const popup = document.getElementById('map-options-popup');
        if (popup && !popup.classList.contains('hidden') && !popup.contains(e.target as Node)) {
            popup.classList.add('hidden');
        }
    }

    private async _showDetailCard(context: { type: 'poi' | 'incident' | 'location', data: any }) {
        this.selectedEntityContext = context;
        const card = document.getElementById('detail-card')!;
        const titleEl = document.getElementById('detail-card-title')!;
        const contentEl = document.getElementById('detail-card-content')!;
    
        // Reset and hide weather sections on every new card display
        document.getElementById('detail-card-weather')?.classList.add('hidden');
        document.getElementById('detail-card-forecast-container')?.classList.add('hidden');
        document.getElementById('detail-card-ai-advisory')?.classList.add('hidden');
        
        card.classList.add('visible');
        
        // Show loading spinner inside the content area while fetching data
        contentEl.innerHTML = `<div class="spinner-container"><div class="spinner"></div></div>`;

        // Fetch and display weather for any context that has coordinates.
        // This runs in parallel with fetching the main content.
        if (context.data.lat && context.data.lon) {
            this._fetchAndDisplayWeather(context.data.lat, context.data.lon);
        }

        if (context.type === 'poi') {
            titleEl.textContent = context.data.name;
            try {
                const details = await this.backend.getPoiDetails(context.data.id, context.data.name);
                contentEl.innerHTML = `
                    <div class="detail-item">
                        <span class="material-icons">info_outline</span>
                        <div><h4>Description</h4><p>${details.description}</p></div>
                    </div>
                    <div class="detail-item">
                        <span class="material-icons">history</span>
                        <div><h4>History</h4><p>${details.history}</p></div>
                    </div>
                    <div class="detail-item">
                        <span class="material-icons">schedule</span>
                        <div><h4>Operating Hours</h4><p>${details.operatingHours}</p></div>
                    </div>
                    <div class="detail-item">
                        <span class="material-icons">local_offer</span>
                        <div><h4>Entry Fee</h4><p>${details.entryFee}</p></div>
                    </div>
                    <div class="detail-item">
                        <span class="material-icons">lightbulb_outline</span>
                        <div><h4>Local Tips</h4>
                            <ul>
                                ${details.localTips.map((tip: string) => `<li>${tip}</li>`).join('')}
                            </ul>
                        </div>
                    </div>
                `;
            } catch (err) {
                contentEl.innerHTML = `<p class="error">${this.translations.ai_error_message}</p>`;
            }
        } else if (context.type === 'incident') {
            titleEl.textContent = `Incident: ${context.data.incidentType.replace(/_/g, ' ')}`;
            contentEl.innerHTML = `
                <div class="detail-item">
                    <span class="material-icons">signpost</span>
                    <div><h4>Road</h4><p>${context.data.roadName}</p></div>
                </div>
                 <div class="detail-item">
                    <span class="material-icons">report</span>
                    <div><h4>Details</h4><p>${context.data.description}</p></div>
                </div>
                 <div class="detail-item">
                    <span class="material-icons">task_alt</span>
                    <div><h4>Status</h4><p class="incident-status">${context.data.status}</p></div>
                </div>
            `;
        } else if (context.type === 'location') {
            titleEl.textContent = context.data.name;
            contentEl.innerHTML = `
                 <div class="detail-item">
                    <span class="material-icons">pin_drop</span>
                    <div>
                        <h4>Coordinates</h4>
                        <p>Lat: ${context.data.lat.toFixed(5)}, Lon: ${context.data.lon.toFixed(5)}</p>
                    </div>
                </div>
            `;
        }
    }

    private _hideDetailCard() {
        const detailCard = document.getElementById('detail-card');
        if (detailCard) {
            detailCard.classList.remove('visible');
        }
        this.selectedEntityContext = null;
    }

    private async _fetchAndDisplayWeather(lat: number, lon: number) {
        const weatherContainer = document.getElementById('detail-card-weather')!;
        const forecastContainer = document.getElementById('detail-card-forecast-container')!;
        const advisoryContainer = document.getElementById('detail-card-ai-advisory')!;
        const advisoryContent = document.getElementById('ai-advisory-content')!;
    
        // Show containers and set initial loading states
        weatherContainer.classList.remove('hidden');
        forecastContainer.classList.remove('hidden');
        advisoryContainer.classList.remove('hidden');
    
        // Reset content to loading state
        forecastContainer.innerHTML = ''; // Clear previous forecast
        advisoryContent.innerHTML = `<div class="spinner-inline"></div> <span>Getting AI insights...</span>`;
        (document.getElementById('weather-icon') as HTMLElement).textContent = 'cloud_queue';
        (document.getElementById('weather-temp') as HTMLElement).textContent = '--°C';
        (document.getElementById('weather-desc') as HTMLElement).textContent = 'Loading...';
    
        try {
            // Fetch weather data from the backend
            const weatherData = await this.backend.getWeather(lat, lon);
    
            // Update current weather UI
            (document.getElementById('weather-icon') as HTMLElement).textContent = weatherData.current.icon;
            (document.getElementById('weather-temp') as HTMLElement).textContent = `${weatherData.current.temp}°C`;
            (document.getElementById('weather-desc') as HTMLElement).textContent = weatherData.current.desc;
    
            // Update 3-day forecast UI
            weatherData.forecast.forEach((day: any) => {
                const forecastItem = document.createElement('div');
                forecastItem.className = 'forecast-item';
                forecastItem.innerHTML = `
                    <span class="forecast-day">${day.day}</span>
                    <span class="material-icons forecast-icon">${day.icon}</span>
                    <span class="forecast-temps">
                        <span class="high">${day.temp_high}°</span> / <span class="low">${day.temp_low}°</span>
                    </span>
                `;
                forecastContainer.appendChild(forecastItem);
            });
    
            // Fetch AI-generated weather insights
            const insightData = await this.backend.getWeatherInsights(weatherData);
            advisoryContent.innerHTML = `<p>${insightData.insight}</p>`;
    
        } catch (error) {
            console.error("Failed to fetch weather data:", error);
            // Hide weather sections on failure and show an error in the advisory section
            weatherContainer.classList.add('hidden');
            forecastContainer.classList.add('hidden');
            advisoryContent.innerHTML = `<p class="error">Could not load weather insights.</p>`;
        }
    }

    private _handleMapClick(e: any) {
        if (this.isMeasuringDistance) {
            this._handleDistanceClick(e);
            return;
        }

        // Don't open detail card if a route is active to avoid clutter
        if (this.activeRouteData) {
            return;
        }

        const locationData = {
            name: 'Selected Location',
            lat: e.latlng.lat,
            lon: e.latlng.lng,
        };
        this._showDetailCard({ type: 'location', data: locationData });
    }

    private _handlePoiClick(poi: any) {
        this._showDetailCard({ type: 'poi', data: poi });
    }
    
    // --- START OF ADDED METHODS TO FIX ERRORS ---

    // --- FIX: Add missing methods ---
    private _initLiveIncidents() {
        this.backend.getIncidents().then(incidents => {
            this.liveIncidents = incidents;
            this.incidentLayer.clearLayers();
            incidents.forEach((incident: any) => {
                const iconHtml = `<div class="incident-marker-icon type-${incident.incidentType}"><span class="material-icons">${this._getConditionInfo(incident.incidentType).icon || 'warning'}</span></div>`;
                const customIcon = L.divIcon({
                    html: iconHtml,
                    className: '',
                    iconSize: [32, 44],
                    iconAnchor: [16, 44]
                });
                L.marker([incident.lat, incident.lon], { icon: customIcon })
                    .addTo(this.incidentLayer)
                    .on('click', (e: any) => {
                        L.DomEvent.stopPropagation(e);
                        this._showDetailCard({ type: 'incident', data: incident });
                    });
            });
        }).catch(err => {
            console.error("Failed to load live incidents:", err);
            this._showToast("Could not load live alerts.", 'error');
        });
    }

    private _initRouteFromUrlParams() {
        const urlParams = new URLSearchParams(window.location.search);
        const from = urlParams.get('from');
        const to = urlParams.get('to');

        if (from && to) {
            (document.getElementById('from-input') as HTMLInputElement).value = from;
            (document.getElementById('to-input') as HTMLInputElement).value = to;
            this._updateRoutingUI();
            this._handleFindRoute();
        }
    }

    private _toggleLanguagePopup() {
        document.getElementById('language-popup')?.classList.toggle('hidden');
    }

    private _handleLangTabClick(e: Event) {
        const target = e.currentTarget as HTMLElement;
        const tabId = target.dataset.tab;
        if (!tabId) return;

        document.querySelectorAll('.lang-tab-btn').forEach(btn => btn.classList.remove('active'));
        target.classList.add('active');

        document.querySelectorAll('.lang-panel').forEach(content => {
            (content as HTMLElement).classList.toggle('hidden', content.id !== `lang-panel-${tabId}`);
        });
    }

    private _handleLangOptionClick(e: Event) {
        const langCode = (e.currentTarget as HTMLElement).dataset.lang;
        console.log(`Language selected: ${langCode}. (Localization not fully implemented)`);
        this._showToast(`Language set to ${langCode}`, 'info');
        this._toggleLanguagePopup();
    }

    private _handleGlobalClickForLanguage(e: Event) {
        const langSelector = document.getElementById('language-selector-container');
        if (langSelector && !langSelector.contains(e.target as Node)) {
            document.getElementById('language-popup')?.classList.add('hidden');
        }
    }

    private _openShareModal() {
        if (!this.activeRouteData) {
            this._showToast(this.translations.no_route_to_share, 'warning');
            return;
        }

        const from = (document.getElementById('from-input') as HTMLInputElement).value;
        const to = (document.getElementById('to-input') as HTMLInputElement).value;

        const url = new URL(window.location.href);
        url.search = ''; // Clear existing params
        url.searchParams.set('from', from);
        url.searchParams.set('to', to);

        (document.getElementById('share-route-link') as HTMLInputElement).value = url.toString();
        document.getElementById('share-route-modal')?.classList.remove('hidden');
    }
    
    private _handleCopyLink() {
        const linkInput = document.getElementById('share-route-link') as HTMLInputElement;
        const copyBtn = document.getElementById('copy-share-link-btn')!;
        const originalText = copyBtn.innerHTML;

        navigator.clipboard.writeText(linkInput.value).then(() => {
            copyBtn.innerHTML = `<span class="material-icons">check</span> ${this.translations.copied}`;
            setTimeout(() => {
                copyBtn.innerHTML = originalText;
            }, 2000);
        }).catch(err => {
            console.error('Failed to copy link: ', err);
            this._showToast('Failed to copy link.', 'error');
        });
    }

    private async _openReportsModal() {
        document.getElementById('reports-modal')?.classList.remove('hidden');
        this.historicalIncidents = await this.backend.getHistoricalIncidents();
        this._renderReports(this.historicalIncidents);
    }

    private _closeReportsModal() {
        document.getElementById('reports-modal')?.classList.add('hidden');
    }

    private _handleReportDateFilterChange(e: Event) {
        // Implementation for date filtering...
        console.log("Date filter changed");
    }

    private _handleReportViewChange(e: Event) {
        const target = e.currentTarget as HTMLElement;
        const view = target.dataset.view;
        if (!view) return;

        document.querySelectorAll('.report-view-btn').forEach(btn => btn.classList.remove('active'));
        target.classList.add('active');

        document.getElementById('report-chart-view')?.classList.toggle('hidden', view !== 'chart');
        document.getElementById('report-table-view')?.classList.toggle('hidden', view !== 'table');
        document.getElementById('report-card-view')?.classList.toggle('hidden', view !== 'card');
    }

    private _handleReportCustomDateChange() {
        // Implementation for custom date filtering...
        console.log("Custom date changed");
    }

    private _handleReportTypeChange(e: Event) {
         // Implementation for report type filtering...
        console.log("Report type changed");
    }
    
    private _renderReports(incidents: any[]) {
        // A placeholder for rendering reports, called from _openReportsModal
        console.log("Rendering reports:", incidents.length);
    }
    
    private _requestPermission(type: 'geolocation' | 'microphone') {
        const permissionMap = {
            geolocation: {
                proceed: this._proceedWithGeolocation.bind(this),
                prePromptTitle: 'Enable Location Access?',
                prePromptText: 'Sadak Sathi needs your location to show your position on the map, provide navigation, and find nearby points of interest.'
            },
            microphone: {
                proceed: this._proceedWithMicrophone.bind(this),
                prePromptTitle: 'Enable Microphone?',
                prePromptText: 'Sadak Sathi needs microphone access to enable voice commands for hands-free searching and AI chat.'
            }
        };

        const config = permissionMap[type];
        if (!config) return;

        const prePermissionModal = document.getElementById('pre-permission-modal')!;
        (document.getElementById('pre-permission-title') as HTMLElement).textContent = config.prePromptTitle;
        (document.getElementById('pre-permission-text') as HTMLElement).textContent = config.prePromptText;
        
        const allowBtn = document.getElementById('pre-permission-grant-btn')!;
        
        const allowOnce = () => {
            prePermissionModal.classList.add('hidden');
            config.proceed();
            allowBtn.removeEventListener('click', allowOnce);
        };

        // Use a clone to remove old listeners before adding a new one
        const newAllowBtn = allowBtn.cloneNode(true);
        allowBtn.parentNode?.replaceChild(newAllowBtn, allowBtn);
        newAllowBtn.addEventListener('click', allowOnce);

        prePermissionModal.classList.remove('hidden');
    }

    private _showPermissionHelp(type: 'geolocation' | 'microphone') {
        const modal = document.getElementById('permission-help-modal')!;
        const titleEl = document.getElementById('permission-help-title')!;
        const contentEl = document.getElementById('permission-help-text')!;

        if (type === 'geolocation') {
            titleEl.textContent = "How to Enable Location Access";
            contentEl.innerHTML = `
                <p>You have previously denied location access. To use location features, you need to enable it in your browser settings.</p>
                <ol>
                    <li>Go to your browser's settings.</li>
                    <li>Find 'Site Settings' or 'Privacy and Security'.</li>
                    <li>Look for this site (${window.location.hostname}) and change the Location permission to 'Allow'.</li>
                    <li>Reload the page.</li>
                </ol>
            `;
        } else if (type === 'microphone') {
            titleEl.textContent = "How to Enable Microphone Access";
            contentEl.innerHTML = `
                <p>You have previously denied microphone access. To use voice commands, you need to enable it in your browser settings.</p>
                <ol>
                    <li>Go to your browser's settings.</li>
                    <li>Find 'Site Settings' or 'Privacy and Security'.</li>
                    <li>Look for this site (${window.location.hostname}) and change the Microphone permission to 'Allow'.</li>
                    <li>Reload the page.</li>
                </ol>
            `;
        }
        modal.classList.remove('hidden');
    }
    
    // --- Logging ---
    private _logActivity(message: string) {
        this.backend.logActivity(message);
    }
    
    // --- Initialization ---
    private _initSpeechSynthesis() {
        // A-sync, so we listen for the event
        window.speechSynthesis.onvoiceschanged = () => {
            this.availableVoices = window.speechSynthesis.getVoices();
            console.log("AI voices loaded:", this.availableVoices.length);
        };
        // Trigger loading voices (especially on Chrome)
        this.availableVoices = window.speechSynthesis.getVoices();
    }
    
    private _initSpeechRecognition() {
        if (SpeechRecognition) {
            this.recognition = new SpeechRecognition();
            this.recognition.continuous = false;
            this.recognition.lang = 'en-US'; // Default
            this.recognition.interimResults = false;
            this.recognition.maxAlternatives = 1;
    
            this.recognition.onstart = () => {
                this.isRecognizing = true;
                const voiceBtn = document.getElementById('voice-command-btn');
                if (voiceBtn) voiceBtn.classList.add('active');
                const adminMicBtn = document.getElementById('admin-form-mic-btn');
                if (adminMicBtn) adminMicBtn.classList.add('active');
                console.log("Voice recognition started.");
            };
    
            this.recognition.onend = () => {
                this.isRecognizing = false;
                const voiceBtn = document.getElementById('voice-command-btn');
                if (voiceBtn) voiceBtn.classList.remove('active');
                 const adminMicBtn = document.getElementById('admin-form-mic-btn');
                if (adminMicBtn) adminMicBtn.classList.remove('active');
                console.log("Voice recognition ended.");
            };
    
            this.recognition.onresult = (event: any) => {
                const transcript = event.results[0][0].transcript;
                console.log("Voice transcript:", transcript);
                if (this.activeVoiceContext === 'chat') {
                    (document.getElementById('chat-input') as HTMLInputElement).value = transcript;
                    this._handleChatSubmit(new Event('submit'));
                } else if (this.activeVoiceContext === 'admin-form') {
                    const descInput = document.getElementById('admin-form-description') as HTMLTextAreaElement;
                    if (descInput) descInput.value += transcript;
                }
            };
    
            this.recognition.onerror = (event: any) => {
                console.error('Speech recognition error:', event.error);
                this._showToast(this.translations.speech_recognition_error, 'error');
                this.isRecognizing = false;
                 const voiceBtn = document.getElementById('voice-command-btn');
                if (voiceBtn) voiceBtn.classList.remove('active');
                const adminMicBtn = document.getElementById('admin-form-mic-btn');
                if (adminMicBtn) adminMicBtn.classList.remove('active');
            };
        } else {
            console.warn("Speech Recognition API not supported in this browser.");
            document.querySelectorAll('.voice-input-btn').forEach(btn => btn.classList.add('hidden'));
        }
    }
    
    private _applyInitialSettings() {
        const savedAvatar = localStorage.getItem('sadak_sathi_avatar');
        if (savedAvatar) {
            this.aiAvatarUrl = savedAvatar;
            this._updateAllAiAvatars(savedAvatar);
        }
        const savedPersonality = localStorage.getItem('sadak_sathi_personality');
        if (savedPersonality) {
            this.aiPersonality = savedPersonality;
            (document.getElementById('persona-personality-select') as HTMLSelectElement).value = savedPersonality;
        }
        this._updatePersonalityDescription();
    }

    private _handlePersonalityChange() {
        const select = document.getElementById('persona-personality-select') as HTMLSelectElement;
        this.aiPersonality = select.value;
        localStorage.setItem('sadak_sathi_personality', this.aiPersonality);
        this._updatePersonalityDescription();
    }
    
    private _updatePersonalityDescription() {
        const personality = (document.getElementById('persona-personality-select') as HTMLSelectElement).value;
        const descriptionEl = document.getElementById('persona-personality-description');
        if (descriptionEl) {
            const descriptionKey = `personality_desc_${personality}`;
            descriptionEl.textContent = this.translations[descriptionKey] || '';
        }
    }
    
    private _initProactiveAlerts() {
        if (this.proactiveAlertInterval) {
            window.clearInterval(this.proactiveAlertInterval);
        }
        this.proactiveAlertInterval = window.setInterval(() => {
            console.log("Checking for proactive alerts...");
            if (this.userLocation && Math.random() > 0.8) {
                const alerts = [
                    this.translations.proactive_alert_accident_ahead,
                    this.translations.proactive_alert_traffic_jam,
                    this.translations.proactive_alert_hazard_reported,
                    this.translations.proactive_alert_construction,
                ];
                const randomAlert = alerts[Math.floor(Math.random() * alerts.length)];
                const distance = (Math.random() * 5 + 1).toFixed(1);
                this._showProactiveAlert(randomAlert.replace('{distance}', distance + ' km'), 'accident', 'What are the details of the accident ahead?');
            }
        }, 30000);
    }

    // --- User & UI State ---
    private _updateUiForUserRole() {
        const role = this.currentUser?.role || 'guest';
        document.body.dataset.userRole = role;

        const adminBtn = document.getElementById('admin-dashboard-btn');
        if (adminBtn) adminBtn.classList.toggle('hidden', !['admin', 'superadmin'].includes(role));

        const reportsBtn = document.getElementById('fab-reports-btn');
        if (reportsBtn) reportsBtn.classList.toggle('hidden', role === 'guest');

        const superadminBtn = document.getElementById('superadmin-settings-btn');
        if (superadminBtn) superadminBtn.classList.toggle('hidden', role !== 'superadmin');

        const profileBtn = document.getElementById('fab-profile-btn');
        const loginPrompt = document.getElementById('login-prompt');
        if (profileBtn) profileBtn.classList.toggle('hidden', role === 'guest');
        if (loginPrompt) loginPrompt.classList.toggle('hidden', role !== 'guest');
    }

    private _handleProfileClick() {
        this._openSettingsPanel();
    }

    private _handleLogout() {
        if (this.auth) {
            this.auth.signOut().catch((error: any) => console.error('Sign out error', error));
        } else {
            this.currentUser = null;
            this._updateUiForUserRole();
            this._showToast('You have been logged out.', 'info');
        }
    }

    // --- Search ---
    private _handleSearchInput(e: Event) {
        const input = e.target as HTMLInputElement;
        const query = input.value.trim().toLowerCase();
        const suggestionsPanel = document.getElementById('search-suggestions-panel')!;

        if (this.searchDebounceTimer) {
            clearTimeout(this.searchDebounceTimer);
        }

        if (query.length < 2) {
            suggestionsPanel.classList.add('hidden');
            return;
        }

        this.searchDebounceTimer = window.setTimeout(() => {
            const filtered = this.mockSuggestions.filter(s => s.text.toLowerCase().includes(query));
            this._renderSearchSuggestions(filtered);
        }, 300);
    }

    private _renderSearchSuggestions(suggestions: any[]) {
        const panel = document.getElementById('search-suggestions-panel')!;
        const list = panel.querySelector('ul')!;
        list.innerHTML = '';
    
        if (suggestions.length === 0) {
            list.innerHTML = `<li class="no-results">No suggestions found.</li>`;
        } else {
            suggestions.forEach(s => {
                const li = document.createElement('li');
                li.innerHTML = `
                    <span class="material-icons">${s.icon}</span>
                    <span>${s.text}</span>
                    <span class="suggestion-type">${s.type.replace('_', ' ')}</span>
                `;
                list.appendChild(li);
            });
        }
    
        panel.classList.remove('hidden');
    }

    private _handleGlobalClickForSearch(e: Event) {
        const searchBar = document.getElementById('unified-search-bar');
        if (searchBar && !searchBar.contains(e.target as Node)) {
            const suggestionsPanel = document.getElementById('search-suggestions-panel');
            if (suggestionsPanel) {
                suggestionsPanel.classList.add('hidden');
            }
        }
    }

    // --- Geolocation & Permissions ---
    private _centerOnUserLocation() {
        if (this.userLocation) {
            this.map.setView([this.userLocation.lat, this.userLocation.lon], 15);
        } else {
            this._requestPermission('geolocation');
        }
    }

    private _initGeolocationWatcher() {
        if (this.geolocationWatcherId) {
            navigator.geolocation.clearWatch(this.geolocationWatcherId);
        }
        if (navigator.geolocation) {
            this.geolocationWatcherId = navigator.geolocation.watchPosition(
                this._handlePositionUpdate.bind(this),
                this._handlePositionError.bind(this),
                { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
            );
        } else {
            console.error("Geolocation is not supported by this browser.");
            this._showToast('Geolocation is not available in your browser.', 'error');
        }
    }
    
    private _proceedWithGeolocation() {
        this._initGeolocationWatcher();
    }
    
    // --- START OF ADDED METHODS ---

    private _initOfflineMaps() {
        console.log("Initializing offline maps feature.");
        const savedRegions = localStorage.getItem('sadak_sathi_offline_maps');
        if (savedRegions) {
            this.downloadedRegions = JSON.parse(savedRegions);
            this._updateOfflineMapUI();
        }
    }

    private _initCompass() {
        console.log("Initializing compass.");
        // Placeholder for compass initialization
    }

    private _initTheme() {
        const savedTheme = localStorage.getItem('sadak_sathi_theme');
        if (savedTheme === 'dark') {
            document.body.classList.add('dark-mode');
            const iconEl = document.getElementById('theme-toggle-icon');
            if(iconEl) iconEl.textContent = 'light_mode';
        }
    }

    private _toggleTheme() {
        document.body.classList.toggle('dark-mode');
        const isDarkMode = document.body.classList.contains('dark-mode');
        localStorage.setItem('sadak_sathi_theme', isDarkMode ? 'dark' : 'light');
        const iconEl = document.getElementById('theme-toggle-icon');
        if (iconEl) iconEl.textContent = isDarkMode ? 'light_mode' : 'dark_mode';
    }

    private _updateRoutingUI() {
        const from = (document.getElementById('from-input') as HTMLInputElement).value;
        const to = (document.getElementById('to-input') as HTMLInputElement).value;
        const findBtn = document.getElementById('find-route-btn')!;
        const clearBtn = document.getElementById('clear-route-btn')!;

        if (from && to) {
            findBtn.removeAttribute('disabled');
        } else {
            findBtn.setAttribute('disabled', 'true');
        }
        
        if (from || to || this.activeRouteData) {
            clearBtn.classList.remove('hidden');
        } else {
            clearBtn.classList.add('hidden');
        }
    }

    private async _handleFindRoute() {
        const findBtn = document.getElementById('find-route-btn')!;
        findBtn.innerHTML = `<div class="spinner-inline"></div> ${this.translations.finding_best_routes}`;
        findBtn.setAttribute('disabled', 'true');

        try {
            const prefs = this._getRoutePreferences();
            this.activeRoutePrefs = prefs;
            const routes = await this.backend.getAlternativeRoutes(prefs);
            const summarizedRoutes = await this.backend.getRouteSummaries(routes, prefs);
            
            this.availableRoutes = summarizedRoutes;
            
            if (summarizedRoutes.length > 0) {
                this._displayRoutes(summarizedRoutes);
            } else {
                this._showToast("Could not find a route.", 'error');
            }

        } catch(err) {
            console.error("Error finding route:", err);
            this._showToast("An error occurred while finding routes.", 'error');
        } finally {
            findBtn.innerHTML = this.translations.find_route_btn;
            this._updateRoutingUI();
        }
    }

    private _handleClearRoute() {
        (document.getElementById('from-input') as HTMLInputElement).value = '';
        (document.getElementById('to-input') as HTMLInputElement).value = '';
        this.routeLayer.clearLayers();
        this.activeRouteData = null;
        this.availableRoutes = [];
        document.getElementById('route-details-panel')?.classList.add('hidden');
        this._updateRoutingUI();
    }

    private _handlePreferenceChange() {
        if (this.activeRouteData) {
            this._handleFindRoute();
        }
    }

    private _toggleHeadingUpMode() {
        this.headingUpMode = !this.headingUpMode;
        const btn = document.getElementById('toggle-heading-up-btn')!;
        btn.classList.toggle('active', this.headingUpMode);
        if (!this.headingUpMode) {
            if (typeof (this.map as any).setBearing === 'function') {
                (this.map as any).setBearing(0);
            }
            if (this.userLocationMarker && this.userLocationMarker._icon) {
                this.userLocationMarker._icon.style.transform = (this.userLocationMarker._icon.style.transform || '').replace(/ rotate\([^)]+\)/, '');
            }
        }
        this._showToast(`Heading-up mode ${this.headingUpMode ? 'enabled' : 'disabled'}.`, 'info');
    }

    private _toggleDistanceTool() {
        this.isMeasuringDistance = !this.isMeasuringDistance;
        const btn = document.getElementById('measure-distance-btn')!;
        btn.classList.toggle('active', this.isMeasuringDistance);
        (document.getElementById('map')! as HTMLElement).style.cursor = this.isMeasuringDistance ? 'crosshair' : '';
        
        // FIX: Corrected element ID from 'distance-measurement-panel' to 'distance-measurement-display'.
        const distancePanel = document.getElementById('distance-measurement-display')!;
        distancePanel.classList.toggle('hidden', !this.isMeasuringDistance);

        if (!this.isMeasuringDistance) {
            this._clearDistanceMeasurement();
        } else {
            this._showToast("Click on the map to measure distance.", 'info');
        }
    }

    private _clearDistanceMeasurement() {
        this.distancePoints = [];
        this.distanceLayer.clearLayers();
        (document.getElementById('distance-value') as HTMLElement).textContent = '0.00 km';
    }

    private async _fetchAndDisplayTraffic() {
        try {
            // FIX: Add layer to map before adding data to ensure layer.getCenter() is available.
            if (!this.map.hasLayer(this.trafficLayer)) {
                this.trafficLayer.addTo(this.map);
            }
            const trafficData = await this.backend.getTraffic();
            this.trafficLayer.clearLayers();
            this.trafficLayer.addData(trafficData);
            this._showToast("Live traffic data loaded.", 'info');
        } catch (err) {
            console.error("Failed to load traffic data:", err);
            this._showToast("Could not load live traffic.", 'error');
        }
    }

    private _hideTraffic() {
        if (this.map.hasLayer(this.trafficLayer)) {
            this.map.removeLayer(this.trafficLayer);
        }
    }

    private _setMapStyle(style: string) {
        if (this.tileLayers[style] && this.activeBaseLayer !== style) {
            this.map.removeLayer(this.tileLayers[this.activeBaseLayer]);
            this.map.addLayer(this.tileLayers[style]);
            this.activeBaseLayer = style;
            document.querySelectorAll('.style-option').forEach(el => el.classList.remove('active'));
            document.querySelector(`.style-option[data-style="${style}"]`)?.classList.add('active');
        }
    }

    private _openLiveCam() {
        // FIX: Corrected element ID from 'live-cam-modal' to 'live-cam-panel'
        document.getElementById('live-cam-panel')?.classList.remove('hidden');
    }

    private _closeLiveCam() {
        // FIX: Corrected element ID from 'live-cam-modal' to 'live-cam-panel'
        document.getElementById('live-cam-panel')?.classList.add('hidden');
    }

    private _hideProactiveAlert() {
        document.getElementById('proactive-alert')?.classList.remove('visible');
    }

    private _openChatAndSendMessage(message: string) {
        this._openChat();
        (document.getElementById('chat-input') as HTMLInputElement).value = message;
        this._handleChatSubmit(new Event('submit'));
    }

    private _openChat() {
        // FIX: Toggle visibility of the modal container, not the inner panel.
        document.getElementById('ai-chat-modal')?.classList.remove('hidden');
        this.isChatOpen = true;
        if (this.chatHistory.length === 0) {
            this._addMessageToChat('model', this.translations.ai_welcome_message);
        }
    }

    private _closeChat() {
        // FIX: Toggle visibility of the modal container, not the inner panel.
        document.getElementById('ai-chat-modal')?.classList.add('hidden');
        this.isChatOpen = false;
    }

    private async _handleChatSubmit(e: Event) {
        e.preventDefault();
        const input = document.getElementById('chat-input') as HTMLInputElement;
        const message = input.value.trim();

        if (!message) return;

        this._addMessageToChat('user', message);
        input.value = '';
        input.focus();

        try {
            this._addMessageToChat('model', '...', true);
            const systemInstruction = this._getSystemInstruction();
            const response = await this.backend.getChatResponse(this.chatHistory, message, systemInstruction);
            this._updateLastChatMessage(response.text);
        } catch (err) {
            console.error("Chat API error:", err);
            this._updateLastChatMessage(this.translations.ai_error_message);
        }
    }

    private _toggleVoiceInput() {
        if (!SpeechRecognition) {
            this._showToast("Voice input is not supported on this browser.", 'warning');
            return;
        }
        if (this.isRecognizing) {
            this.recognition.stop();
        } else {
            this.activeVoiceContext = 'chat';
            this._requestPermission('microphone');
        }
    }

    private _toggleFabMenu() {
        document.getElementById('fab-menu')?.classList.toggle('open');
    }

    private _openSettingsPanel() {
        document.getElementById('settings-panel')?.classList.add('open');
    }

    private _openFindCarModal() {
        this._updateFindCarModalUI();
        document.getElementById('find-car-modal')?.classList.remove('hidden');
    }

    private _closeFindCarModal() {
        document.getElementById('find-car-modal')?.classList.add('hidden');
    }

    private _handleParkHere() {
        if (!this.userLocation) {
            this._showToast(this.translations.no_user_location_for_parking, 'error');
            return;
        }
        const carLocation = { lat: this.userLocation.lat, lon: this.userLocation.lon, time: new Date().toISOString() };
        localStorage.setItem('sadak_sathi_car_location', JSON.stringify(carLocation));
        this._showToast(this.translations.car_location_saved_toast, 'success');
        this._updateFindCarModalUI();
    }

    private _handleGetDirectionsToCar() {
        const savedLocation = localStorage.getItem('sadak_sathi_car_location');
        if (savedLocation && this.userLocation) {
            // const carLoc = JSON.parse(savedLocation);
            (document.getElementById('from-input') as HTMLInputElement).value = this.translations.current_location_label;
            (document.getElementById('to-input') as HTMLInputElement).value = this.translations.route_to_my_car;
            this._closeFindCarModal();
            this._handleFindRoute();
        }
    }

    private _handleClearCarLocation() {
        localStorage.removeItem('sadak_sathi_car_location');
        this._showToast(this.translations.car_location_cleared_toast, 'info');
        this._updateFindCarModalUI();
    }

    private _showOfflineMapsModal() {
        document.getElementById('offline-maps-modal')?.classList.remove('hidden');
    }

    private _handleDownloadRegion(listItem: HTMLElement, regionId: string, regionName: string, regionSize: string) {
        if (this.downloadedRegions.some(r => r.id === regionId)) return;
        
        const downloadBtn = listItem.querySelector('.download-btn') as HTMLElement;
        const deleteBtn = listItem.querySelector('.delete-btn') as HTMLElement;
        const statusEl = listItem.querySelector('.download-status') as HTMLElement;
        
        downloadBtn.classList.add('hidden');
        statusEl.textContent = this.translations.downloading;
        statusEl.classList.remove('hidden');
        
        setTimeout(() => { // Simulate download
            statusEl.textContent = this.translations.downloaded;
            deleteBtn.classList.remove('hidden');
            this.downloadedRegions.push({ id: regionId, name: regionName, size: regionSize });
            localStorage.setItem('sadak_sathi_offline_maps', JSON.stringify(this.downloadedRegions));
            this._showToast(this.translations.offline_map_saved_toast.replace('{region}', regionName), 'success');
            this._updateOfflineMapUI();
        }, 2000);
    }

    private _handleDeleteRegion(listItem: HTMLElement, regionId: string, regionName: string) {
        this.downloadedRegions = this.downloadedRegions.filter(r => r.id !== regionId);
        localStorage.setItem('sadak_sathi_offline_maps', JSON.stringify(this.downloadedRegions));
        this._showToast(this.translations.offline_map_deleted_toast.replace('{region}', regionName), 'info');
        
        const downloadBtn = listItem.querySelector('.download-btn') as HTMLElement;
        const deleteBtn = listItem.querySelector('.delete-btn') as HTMLElement;
        const statusEl = listItem.querySelector('.download-status') as HTMLElement;

        downloadBtn.classList.remove('hidden');
        deleteBtn.classList.add('hidden');
        statusEl.classList.add('hidden');

        this._updateOfflineMapUI();
    }

    private _openReportIncidentModal() {
        if (!this.userLocation) {
            this._showToast(this.translations.report_location_unavailable, 'warning');
            return;
        }
        document.getElementById('report-incident-modal')?.classList.remove('hidden');
    }

    private _closeReportIncidentModal() {
        (document.getElementById('report-incident-form') as HTMLFormElement).reset();
        // FIX: Corrected element ID
        const preview = document.getElementById('incident-image-preview') as HTMLImageElement;
        if (preview) {
            preview.src = '';
            preview.classList.add('hidden');
        }
        document.getElementById('report-incident-modal')?.classList.add('hidden');
    }

    private async _handleReportIncidentSubmit(e: Event) {
        e.preventDefault();
        const form = e.target as HTMLFormElement;
        const submitBtn = form.querySelector('button[type="submit"]') as HTMLButtonElement;
        const originalText = submitBtn.innerHTML;
        submitBtn.disabled = true;
        submitBtn.innerHTML = `<div class="spinner-inline"></div> Submitting...`;

        try {
            const formData = new FormData(form);
            const reportData = {
                incidentType: formData.get('incident-type'),
                description: formData.get('description'),
                lat: this.userLocation!.lat,
                lon: this.userLocation!.lon,
                reportedBy: this.currentUser?.email || 'anonymous',
                timestamp: new Date().toISOString()
            };
            await this.backend.submitUserReport(reportData);
            this._showToast(this.translations.report_submitted_toast, 'success');
            this._closeReportIncidentModal();
        } catch (err) {
            console.error("Failed to submit incident report:", err);
            this._showToast("Failed to submit report. Please try again.", 'error');
        } finally {
            submitBtn.disabled = false;
            submitBtn.innerHTML = originalText;
        }
    }

    private _handleIncidentPhotoPreview(e: Event) {
        const input = e.target as HTMLInputElement;
        if (input.files && input.files[0]) {
            const reader = new FileReader();
            reader.onload = (event) => {
                // FIX: Corrected element ID
                const preview = document.getElementById('incident-image-preview') as HTMLImageElement;
                if(preview) {
                    preview.src = event.target?.result as string;
                    preview.classList.remove('hidden');
                }
            };
            reader.readAsDataURL(input.files[0]);
        }
    }

    private _handleDownloadReport(format: 'csv' | 'pdf') {
        this._showToast(`Downloading report as ${format.toUpperCase()}... (Not implemented)`, 'info');
    }

    private _handleShareReport() {
        this._showToast('Sharing report... (Not implemented)', 'info');
    }

    private _handlePrintReport() {
        // More sophisticated print logic would go here
        window.print();
    }

    private _updateAllAiAvatars(url: string) {
        (document.getElementById('persona-avatar-preview') as HTMLImageElement).src = url;
        (document.getElementById('chat-ai-avatar') as HTMLImageElement).src = url;
        (document.getElementById('unified-search-ai-avatar') as HTMLImageElement).src = url;
    }
    
    private _handleAvatarUpload(e: Event) {
        const input = e.target as HTMLInputElement;
        if (input.files && input.files[0]) {
            const reader = new FileReader();
            reader.onload = (event) => {
                const avatarUrl = event.target?.result as string;
                this.aiAvatarUrl = avatarUrl;
                localStorage.setItem('sadak_sathi_avatar', avatarUrl);
                this._updateAllAiAvatars(avatarUrl);
                this._showToast(this.translations.ai_avatar_updated, 'success');
            };
            reader.readAsDataURL(input.files[0]);
        }
    }

    private _openSuperadminSettingsModal() {
        document.getElementById('superadmin-settings-modal')?.classList.remove('hidden');
    }

    private _closeSuperadminSettingsModal() {
        document.getElementById('superadmin-settings-modal')?.classList.add('hidden');
    }

    private async _handleSuperadminSettingsSave(e: Event) {
        e.preventDefault();
        this._showToast('Saving superadmin settings... (Not implemented)', 'info');
    }

    private _handleSuperadminTabChange(target: HTMLElement) {
        const tabId = target.dataset.tab;
        if (!tabId) return;

        document.querySelectorAll('#superadmin-settings-modal .admin-tab-btn').forEach(btn => btn.classList.remove('active'));
        target.classList.add('active');

        document.querySelectorAll('#superadmin-settings-modal .admin-panel').forEach(panel => {
            (panel as HTMLElement).classList.toggle('hidden', panel.id !== `superadmin-panel-${tabId}`);
        });
    }

    private _openAdminDashboard() {
        document.getElementById('admin-dashboard-modal')?.classList.remove('hidden');
    }

    private _closeAdminDashboard() {
        document.getElementById('admin-dashboard-modal')?.classList.add('hidden');
    }

    private _handleAdminDashboardTabChange(target: HTMLElement) {
        const tabId = target.dataset.tab;
        if (!tabId) return;

        document.querySelectorAll('#admin-dashboard-modal .admin-tab-btn').forEach(btn => btn.classList.remove('active'));
        target.classList.add('active');

        document.querySelectorAll('#admin-dashboard-modal .admin-panel').forEach(panel => {
            (panel as HTMLElement).classList.toggle('hidden', panel.id !== `admin-panel-${tabId}`);
        });
    }

    private _closeAdminFormModal() {
        // FIX: Corrected element ID
        document.getElementById('admin-form-modal')?.classList.add('hidden');
    }

    private async _handleAdminFormSubmit(e: Event) {
        e.preventDefault();
        this._showToast('Submitting admin form... (Not implemented)', 'info');
    }

    private async _handleRelayConfirm() {
        this._showToast('Relaying report... (Not implemented)', 'info');
    }

    private _toggleNotificationsPanel() {
        document.getElementById('notifications-panel')?.classList.toggle('open');
    }

    private _toggleAdminFormAI() {
        this._showToast('Admin form AI toggled... (Not implemented)', 'info');
    }

    private _handleOnlineStatus() {
        this._showToast(this.translations.you_are_online, 'success');
        document.body.classList.remove('is-offline');
    }

    private _handleOfflineStatus() {
        this._showToast(this.translations.you_are_offline, 'warning');
        document.body.classList.add('is-offline');
    }

    private _handleDistanceClick(e: any) {
        const point = e.latlng;
        this.distancePoints.push(point);

        L.circleMarker(point, { radius: 5, color: '#3498db' }).addTo(this.distanceLayer);

        if (this.distancePoints.length > 1) {
            this.distanceLayer.clearLayers(); // Clear previous lines
            L.polyline(this.distancePoints, { color: '#3498db' }).addTo(this.distanceLayer);
            this.distancePoints.forEach(p => L.circleMarker(p, { radius: 5, color: '#3498db' }).addTo(this.distanceLayer));

            let totalDistance = 0;
            for (let i = 0; i < this.distancePoints.length - 1; i++) {
                totalDistance += this.distancePoints[i].distanceTo(this.distancePoints[i + 1]);
            }
            (document.getElementById('distance-value') as HTMLElement).textContent = `${(totalDistance / 1000).toFixed(2)} km`;
        }
    }

    private _showProactiveAlert(message: string, type: string, aiQuery: string) {
        const now = Date.now();
        if (now - this.lastAlertTime < 60000) return; // Debounce alerts
        this.lastAlertTime = now;

        const alertEl = document.getElementById('proactive-alert')!;
        // FIX: Use getElementById for the alert message paragraph
        const messageEl = document.getElementById('alert-message');
        if (messageEl) {
            messageEl.textContent = message;
        }
        (document.getElementById('alert-ask-ai-btn') as HTMLElement).dataset.aiQuery = aiQuery;
        
        alertEl.className = `proactive-alert alert-type-${type}`; // Reset classes
        setTimeout(() => alertEl.classList.add('visible'), 100);
        
        // Auto-dismiss after some time
        setTimeout(() => {
            this._hideProactiveAlert();
        }, 15000);
    }

    private _getConditionInfo(conditionType: string) {
        // Standardize input to handle different casings and characters from various sources
        const standardizedType = conditionType.toLowerCase().replace(/ /g, '_').replace(/\//g, '_');
    
        const conditionMap: { [key: string]: { icon: string, label: string, colorClass: string } } = {
            'clear': { icon: 'check_circle_outline', label: 'Clear', colorClass: 'condition-clear' },
            'construction': { icon: 'construction', label: 'Construction', colorClass: 'condition-construction' },
            'traffic_jam': { icon: 'traffic', label: 'Traffic Jam', colorClass: 'condition-traffic' },
            'blocked': { icon: 'block', label: 'Blocked', colorClass: 'condition-blocked' },
            'one_lane': { icon: 'warning_amber', label: 'One Lane', colorClass: 'condition-one-lane' },
            'accident': { icon: 'emergency', label: 'Accident', colorClass: 'condition-accident' },
            'hazard': { icon: 'warning', label: 'Hazard', colorClass: 'condition-hazard' },
            'roadblock': { icon: 'block', label: 'Roadblock', colorClass: 'condition-blocked' },
            'flood': { icon: 'water', label: 'Flood', colorClass: 'condition-hazard' },
            'landslide': { icon: 'landslide', label: 'Landslide', colorClass: 'condition-hazard' },
            'broken_road_bridge': { icon: 'gpp_bad', label: 'Broken Road/Bridge', colorClass: 'condition-blocked' },
            'other': { icon: 'help_outline', label: 'Other', colorClass: 'condition-unknown' },
        };
        // Use original type for the label if no match is found, to preserve user-friendly text
        return conditionMap[standardizedType] || { icon: 'warning', label: conditionType.replace(/_/g, ' '), colorClass: '' };
    }

    private _showToast(message: string, type: 'info' | 'success' | 'warning' | 'error' = 'info') {
        const toastContainer = document.getElementById('toast-container');
        if (!toastContainer) return;
        
        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;
        
        const icons = {
            info: 'info',
            success: 'check_circle',
            warning: 'warning',
            error: 'error'
        };
        
        toast.innerHTML = `<span class="material-icons">${icons[type]}</span><p>${message}</p>`;
        toastContainer.appendChild(toast);
        
        setTimeout(() => {
            toast.classList.add('show');
        }, 10);
        
        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => {
                toast.remove();
            }, 300);
        }, 3000);
    }
    
    private _proceedWithMicrophone() {
        if (this.recognition && !this.isRecognizing) {
            try {
                this.recognition.start();
            } catch (e) {
                console.error("Could not start recognition, possibly already started.", e);
            }
        }
    }

    private _handlePositionError(error: GeolocationPositionError) {
        this.isGeolocationActive = false;
        console.error(`Geolocation error: ${error.message} (Code: ${error.code})`);
        // FIX: Corrected element ID from 'gps-status' to 'gps-status-text'.
        const gpsStatusEl = document.getElementById('gps-status-text');
        if (gpsStatusEl) gpsStatusEl.textContent = `GPS: Error (${error.code})`;

        if (error.code === error.PERMISSION_DENIED) {
            this._showToast("Location access was denied.", 'error');
            this._showPermissionHelp('geolocation');
        } else {
            this._showToast("Could not get your location.", 'error');
        }
    }

    private _updateOfflineMapUI() {
        const list = document.getElementById('downloaded-regions-list');
        if(!list) return;

        if (this.downloadedRegions.length === 0) {
            list.innerHTML = `<li class="no-maps-message">${this.translations.no_offline_maps}</li>`;
        } else {
            list.innerHTML = this.downloadedRegions.map(r => `
                <li>
                    <span class="material-icons">map</span>
                    <div class="region-info">
                        <strong>${r.name}</strong>
                        <span>${r.size}</span>
                    </div>
                    <button class="icon-button delete-offline-btn" data-region-id="${r.id}" data-region-name="${r.name}" title="${this.translations.delete}">
                        <span class="material-icons">delete</span>
                    </button>
                </li>
            `).join('');
            
            list.querySelectorAll('.delete-offline-btn').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    const target = e.currentTarget as HTMLElement;
                    const regionId = target.dataset.regionId!;
                    const regionName = target.dataset.regionName!;
                    const originalListItem = document.querySelector(`#download-region-options li[data-region="${regionId}"]`);
                    this._handleDeleteRegion(originalListItem as HTMLElement, regionId, regionName);
                });
            });
        }
    }

    private _displayRoutes(routes: any[]) {
        this.routeLayer.clearLayers();
        routes.forEach(route => {
            const geojsonFeature = {
                type: "Feature",
                properties: route,
                geometry: route.geometry
            };
            L.geoJSON(geojsonFeature, {
                style: { color: route.type === 'fastest' ? '#3498db' : '#9b59b6', weight: 6, opacity: 0.8 },
                onEachFeature: (feature: any, layer: any) => {
                    layer.on('click', () => this._selectRoute(feature.properties.id));
                }
            }).addTo(this.routeLayer);
        });

        if (routes.length > 0) {
            this._selectRoute(routes[0].id);
        }
        if (this.routeLayer.getBounds().isValid()) {
            this.map.fitBounds(this.routeLayer.getBounds().pad(0.1));
        }
    }

// FIX: Implement missing methods called by event listeners and other functions.
    private _openRoutePreferencesModal() {
        // Sync modal state with current preferences before showing
        const currentPrefs = this._getRoutePreferences();
        const modal = document.getElementById('route-preferences-modal');
        if (!modal) return;
        
        (modal.querySelector('#route-prefs-preferhighways') as HTMLInputElement).checked = currentPrefs.preferHighways;
        (modal.querySelector('#route-prefs-avoidtolls') as HTMLInputElement).checked = currentPrefs.avoidTolls;
        (modal.querySelector('#route-prefs-preferscenicroute') as HTMLInputElement).checked = currentPrefs.preferScenic;
        (modal.querySelector('#route-prefs-preferlesscrowded') as HTMLInputElement).checked = currentPrefs.preferLessCrowded;
        (modal.querySelector('#route-prefs-avoidunpaved') as HTMLInputElement).checked = currentPrefs.avoidUnpaved;

        modal.classList.remove('hidden');
    }

    private _closeRoutePreferencesModal() {
        document.getElementById('route-preferences-modal')?.classList.add('hidden');
    }

    private _handleSaveRoutePreferences() {
        const modal = document.getElementById('route-preferences-modal');
        if (!modal) return;

        // Read values from the modal form and update the quick bar preferences to match
        const preferHighways = (modal.querySelector('#route-prefs-preferhighways') as HTMLInputElement).checked;
        (document.getElementById('prefer-highways-toggle') as HTMLInputElement).checked = preferHighways;

        const avoidTolls = (modal.querySelector('#route-prefs-avoidtolls') as HTMLInputElement).checked;
        (document.getElementById('avoid-tolls-toggle') as HTMLInputElement).checked = avoidTolls;
        
        const preferScenic = (modal.querySelector('#route-prefs-preferscenicroute') as HTMLInputElement).checked;
        (document.getElementById('prefer-scenic-toggle') as HTMLInputElement).checked = preferScenic;

        this._closeRoutePreferencesModal();

        // If a route is active or was just searched, re-run the search with new preferences
        if (this.availableRoutes.length > 0) {
            this._handleFindRoute();
        }
        this._showToast("Route preferences saved.", "success");
    }

    private _getRoutePreferences() {
        // Reads from the quick preferences bar as the primary source of truth. The modal syncs with this.
        const preferHighways = (document.getElementById('prefer-highways-toggle') as HTMLInputElement)?.checked || false;
        const avoidTolls = (document.getElementById('avoid-tolls-toggle') as HTMLInputElement)?.checked || false;
        const preferScenic = (document.getElementById('prefer-scenic-toggle') as HTMLInputElement)?.checked || false;
        
        // These are only in the detailed modal, so we read them from there.
        const modal = document.getElementById('route-preferences-modal');
        const preferLessCrowded = (modal?.querySelector('#route-prefs-preferlesscrowded') as HTMLInputElement)?.checked || false;
        const avoidUnpaved = (modal?.querySelector('#route-prefs-avoidunpaved') as HTMLInputElement)?.checked || false;
        
        return { preferHighways, avoidTolls, preferScenic, preferLessCrowded, avoidUnpaved };
    }

    private _handlePositionUpdate(position: GeolocationPosition) {
        this.isGeolocationActive = true;
        this.userLocation = {
            lat: position.coords.latitude,
            lon: position.coords.longitude
        };

        const gpsStatusEl = document.getElementById('gps-status-text');
        if (gpsStatusEl) gpsStatusEl.textContent = 'GPS: Acquired';

        const latlng = [this.userLocation.lat, this.userLocation.lon];
        if (this.userLocationMarker) {
            this.userLocationMarker.setLatLng(latlng);
        } else {
            const iconHtml = `<div class="user-location-marker"><span class="material-icons">navigation</span></div>`;
            const userIcon = L.divIcon({
                html: iconHtml,
                className: '',
                iconSize: [28, 28],
                iconAnchor: [14, 14]
            });
            this.userLocationMarker = L.marker(latlng, { icon: userIcon, zIndexOffset: 1000 }).addTo(this.map);
        }

        if (this.headingUpMode && position.coords.heading !== null) {
            const heading = position.coords.heading;
            if (this.userLocationMarker && this.userLocationMarker._icon) {
                 // Reset previous rotation and apply new one
                let transform = this.userLocationMarker._icon.style.transform.replace(/ rotate\([^)]+\)/, '');
                this.userLocationMarker._icon.style.transform = `${transform} rotate(${heading}deg)`;
            }
        }
    }
    
    private _getSystemInstruction(): string {
        switch(this.aiPersonality) {
            case 'formal':
                return "You are a formal and precise AI assistant. Provide clear, concise information without emotion or embellishment.";
            case 'guide':
                return "You are an enthusiastic and knowledgeable travel guide for Nepal. Your responses should be rich with cultural details, historical context, and exciting facts. Your relationship with the user is that of a guide to a tourist.";
            case 'buddy':
                return `You are a calm, reassuring co-pilot and driver's buddy. Focus on safety, clear directions, and practical road advice. Your relationship with the user is a trusted ${this.aiRelationship}.`;
            case 'friendly':
            default:
                return `You are Sadak Sathi, a cheerful and helpful road companion. Be friendly, approachable, and supportive. The user considers you their ${this.aiRelationship}.`;
        }
    }
    
    private _addMessageToChat(role: 'user' | 'model', text: string, isLoading: boolean = false) {
        if (role === 'user') {
            this.chatHistory.push({ role: 'user', parts: [{ text }] });
        }
        // For model, we add a placeholder and update it later.

        const chatMessages = document.getElementById('chat-messages')!;
        const messageEl = document.createElement('div');
        messageEl.classList.add('chat-message', role === 'user' ? 'user-message' : 'ai-message');

        const avatarSrc = role === 'user' ? 'https://i.imgur.com/v82B43X.png' : this.aiAvatarUrl;

        let messageContent: string;
        if (isLoading) {
            messageContent = `<div class="typing-indicator"><span></span><span></span><span></span></div>`;
            messageEl.classList.add('loading');
        } else {
            // Basic markdown for bold and lists
            let formattedText = text
                .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                .replace(/\* (.*?)(?=\n\* |$)/g, '<li>$1</li>');
            if (formattedText.includes('<li>')) {
                formattedText = `<ul>${formattedText.replace(/<\/li>(\n)?/g, '</li>')}</ul>`;
            }
            messageContent = `<p>${formattedText}</p>`;
        }
        
        messageEl.innerHTML = `
            <img src="${avatarSrc}" alt="${role} avatar" class="chat-avatar">
            <div class="message-content">${messageContent}</div>
        `;
        
        chatMessages.appendChild(messageEl);
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }

    private _updateLastChatMessage(text: string) {
        const chatMessages = document.getElementById('chat-messages')!;
        const loadingMessage = chatMessages.querySelector('.chat-message.loading');
        if (loadingMessage) {
            this.chatHistory.push({ role: 'model', parts: [{ text }] });
            let formattedText = text
                .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                .replace(/\n\* (.*?)(?=\n\* |$)/g, '<li>$1</li>');
            if (formattedText.includes('<li>')) {
                formattedText = `<ul>${formattedText.replace(/<\/li>(\n)?/g, '</li>')}</ul>`;
            }
            loadingMessage.querySelector('.message-content')!.innerHTML = `<p>${formattedText}</p>`;
            loadingMessage.classList.remove('loading');
        }
    }
    
    private async _updateFindCarModalUI() {
        const savedLocation = localStorage.getItem('sadak_sathi_car_location');
        const noLocationView = document.getElementById('no-car-location-view')!;
        const hasLocationView = document.getElementById('has-car-location-view')!;
        
        if (savedLocation) {
            const carLoc = JSON.parse(savedLocation);
            noLocationView.classList.add('hidden');
            hasLocationView.classList.remove('hidden');
            
            const locationText = document.getElementById('parked-location-text')!;
            locationText.textContent = this.translations.fetching_address;
            
            // In a real app, you would reverse geocode here. We'll simulate it.
            setTimeout(() => {
                locationText.textContent = `Lat: ${carLoc.lat.toFixed(4)}, Lon: ${carLoc.lon.toFixed(4)}`;
            }, 500);
            
            (document.getElementById('parked-time-text') as HTMLElement).textContent = `Since: ${new Date(carLoc.time).toLocaleString()}`;
        } else {
            noLocationView.classList.remove('hidden');
            hasLocationView.classList.add('hidden');
        }
    }

    private _selectRoute(routeId: string) {
        const route = this.availableRoutes.find(r => r.id === routeId);
        if (!route) return;

        this.activeRouteData = route;

        // Highlight selected route on map
        this.routeLayer.eachLayer((layer: any) => {
            const isSelected = layer.feature.properties.id === routeId;
            layer.setStyle({
                weight: isSelected ? 8 : 6,
                opacity: isSelected ? 1 : 0.7
            });
            if (isSelected) {
                layer.bringToFront();
            }
        });

        const panel = document.getElementById('route-details-panel')!;
        (panel.querySelector('#route-details-distance-val') as HTMLElement).textContent = `${route.distance} km`;
        (panel.querySelector('#route-details-time-val') as HTMLElement).textContent = `${route.time} min`;
        
        const eta = new Date(Date.now() + route.time * 60000);
        (panel.querySelector('#route-details-eta-val') as HTMLElement).textContent = eta.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

        const prefsUsedEl = (panel.querySelector('#route-prefs-used-val') as HTMLElement);
        const usedPrefs = [];
        if (this.activeRoutePrefs?.preferHighways) usedPrefs.push("Highways");
        if (this.activeRoutePrefs?.avoidTolls) usedPrefs.push("No Tolls");
        if (this.activeRoutePrefs?.preferScenic) usedPrefs.push("Scenic");
        if (this.activeRoutePrefs?.preferLessCrowded) usedPrefs.push("Less Crowded");
        if (this.activeRoutePrefs?.avoidUnpaved) usedPrefs.push("No Unpaved");
        prefsUsedEl.textContent = usedPrefs.length > 0 ? usedPrefs.join(', ') : 'None';

        const directionsList = panel.querySelector('#directions-list')!;
        directionsList.innerHTML = '';
        route.directions.forEach((dir: any) => {
            const li = document.createElement('li');
            const conditionInfo = this._getConditionInfo(dir.condition.type);
            li.innerHTML = `
                <span class="material-icons direction-icon">${dir.icon}</span>
                <p>${dir.instruction}</p>
                ${dir.condition.type !== 'clear' ? `<span class="material-icons condition-icon ${conditionInfo.colorClass}" title="${dir.condition.details}">${conditionInfo.icon}</span>` : ''}
            `;
            directionsList.appendChild(li);
        });

        panel.classList.remove('hidden');
    }
}
// Initialize the app after the DOM is fully loaded
window.addEventListener('DOMContentLoaded', () => {
    new SadakSathiApp();
});
