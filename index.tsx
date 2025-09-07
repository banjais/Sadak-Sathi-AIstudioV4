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

    private mockPois = [
        { id: 'poi-1', name: 'Kathmandu Durbar Square', type: 'heritage', lat: 27.7049, lon: 85.3075 },
        { id: 'poi-2', name: 'Garden of Dreams', type: 'park', lat: 27.7132, lon: 85.3144 },
        { id: 'poi-3', name: 'Swayambhunath Stupa', type: 'heritage', lat: 27.7148, lon: 85.2905 },
        { id: 'poi-4', name: 'Boudhanath Stupa', type: 'heritage', lat: 27.7215, lon: 85.3615 },
        { id: 'poi-5', name: 'Pashupatinath Temple', type: 'heritage', lat: 27.7107, lon: 85.3486 },
        { id: 'poi-6', name: 'Fire and Ice Pizzeria', type: 'food', lat: 27.7140, lon: 85.3145 }
    ];
    private activePoiFilters: Set<string> = new Set(['heritage', 'park', 'food']);


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
        getAlternativeRoutes: async (prefs: { preferHighways: boolean, avoidTolls: boolean, preferScenic: boolean }) => {
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
            
            return routes;
        },
        getRouteSummaries: async (routes: any[], prefs: { preferHighways: boolean, avoidTolls: boolean, preferScenic: boolean }) => {
            console.log("SIMULATING BACKEND CALL: /api/getRouteSummaries");
            await new Promise(res => setTimeout(res, 800)); // Simulate network latency for AI summaries
        
            const updatedRoutes = routes.map(route => {
                // In a real app, this would be a prompt to Gemini
                const prompt = `Generate a short, engaging, one-sentence summary for a driving route in Nepal with these stats:
                - Type: ${route.type}
                - Distance: ${route.distance} km
                - Time: ${route.time} min
                - User Prefs: Scenic=${prefs.preferScenic}, Avoid Tolls=${prefs.avoidTolls}
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
    private hasRequestedGeolocation: boolean = false;
    private hasRequestedMicrophone: boolean = false;

    // Context State
    private selectedEntityContext: any = null;
    
    private activeRouteData: any | null = null;
    private availableRoutes: any[] = [];
    private activeRoutePrefs: { preferHighways: boolean, avoidTolls: boolean, preferScenic: boolean } | null = null;

    // Offline Maps State
    private downloadedRegions: {id: string, name: string, size: string}[] = [];

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


    constructor() {
        this._init();
    }
    
    private _init() {
        this.translations = en_translations; // Default to English
        this.loadingOverlay = document.getElementById('loading-overlay')!;
        this.loadingMessage = document.getElementById('loading-message')!;
        this._logActivity('App initialization started.');

        this.loadingMessage.textContent = this.translations.loading_map;
        this._initializeMap(); // This will handle hiding the loader when map is ready

        this.loadingMessage.textContent = this.translations.loading_voices;
        this._initSpeechSynthesis();
        this._initSpeechRecognition();
        
        this.loadingMessage.textContent = this.translations.loading_ui;
        this._setupUiEventListeners();

        this.loadingMessage.textContent = this.translations.loading_settings;
        this._applyInitialSettings();
        this._initOfflineMaps();
        
        this.loadingMessage.textContent = this.translations.loading_data;
        this._initProactiveAlerts(); // This is just a stub, safe to call
        this._initRouteFromUrlParams();
        
        this._updateUiForUserRole(); // Initial UI setup for guest
        this._initTheme();
    }

    private _setupUiEventListeners() {
        // Header & Core UI
        document.getElementById('theme-toggle')?.addEventListener('click', this._toggleTheme.bind(this));
        document.getElementById('fab-profile-btn')?.addEventListener('click', this._handleProfileClick.bind(this));
        document.getElementById('logout-btn')?.addEventListener('click', this._handleLogout.bind(this));
        document.getElementById('permission-modal-close-btn')?.addEventListener('click', () => {
            document.getElementById('permission-help-modal')?.classList.add('hidden');
        });

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
        
        // Map Controls
        document.getElementById('center-location-btn')?.addEventListener('click', this._requestUserLocation.bind(this));
        document.getElementById('toggle-pois')?.addEventListener('change', (e) => {
            const isChecked = (e.target as HTMLInputElement).checked;
            if (isChecked) {
                this.map.addLayer(this.poiLayer);
            } else {
                this.map.removeLayer(this.poiLayer);
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
        document.getElementById('fab-ai-btn')?.addEventListener('click', this._openChat.bind(this));
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
        document.getElementById('add-offline-region-btn')?.addEventListener('click', () => {
            document.getElementById('offline-maps-modal')?.classList.remove('hidden');
        });
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

            // This is the key fix: wait for the map to be fully ready before hiding the loader
            this.map.whenReady(() => {
                 this.routeLayer = L.geoJSON(null, {
                    style: (feature) => ({
                        color: '#3498db',
                        weight: 6,
                        opacity: 0.8
                    })
                }).addTo(this.map);

                this.poiLayer = L.layerGroup().addTo(this.map);
                this._renderPois();

                this.trafficLayer = L.geoJSON(null, {
                    style: (feature: any) => {
                        const trafficLevel = feature.properties.traffic;
                        let color = '#7f8c8d'; // Default color for unknown traffic
                        let weight = 5;
                        let opacity = 0.8;

                        switch (trafficLevel) {
                            case 'heavy':
                                color = '#e74c3c'; // Danger Red
                                weight = 6;
                                break;
                            case 'moderate':
                                color = '#f39c12'; // Warning Orange
                                weight = 5;
                                break;
                            case 'light':
                                color = '#2ecc71'; // Success Green
                                break;
                        }
                        return { color, weight, opacity };
                    }
                });

                this.map.on('click', this._handleMapClick.bind(this));
                
                console.log("Map initialized and ready.");
                
                // Now hide the loading screen
                this.loadingMessage.textContent = this.translations.loading_complete;
                setTimeout(() => {
                    if (this.loadingOverlay) {
                        this.loadingOverlay.style.opacity = '0';
                        setTimeout(() => this.loadingOverlay.classList.add('hidden'), 500);
                    }
                }, 500);
            });

        } catch (error) {
            console.error("Leaflet map initialization failed:", error);
            if(this.loadingMessage) {
                this.loadingMessage.textContent = "Error: Could not load the map.";
            }
        }
    }
    

    private _renderPois() {
        this.poiLayer.clearLayers();
        const iconMap: { [key: string]: string } = {
            'heritage': 'account_balance', // Icon for museums, historical buildings
            'park': 'park',              // Specific icon for parks/green spaces
            'food': 'local_dining'       // Icon for restaurants/eateries
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
                    .on('click', () => this._handlePoiClick(poi));
            }
        });
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
    
    // --- Theme Management ---
    private _initTheme() {
        const savedTheme = localStorage.getItem('sadak_sathi_theme') as 'light' | 'dark' | null;
        const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
        const initialTheme = savedTheme || (prefersDark ? 'dark' : 'light');
        this._applyTheme(initialTheme);
    }

    private _applyTheme(theme: 'light' | 'dark') {
        const appContainer = document.getElementById('app-container')!;
        const themeToggleIcon = document.querySelector('#theme-toggle .material-icons') as HTMLElement;
        
        appContainer.dataset.theme = theme;
        localStorage.setItem('sadak_sathi_theme', theme);
        
        if (theme === 'dark') {
            themeToggleIcon.textContent = 'light_mode';
            // If the current map style is streets, switch it to dark
            if (this.activeBaseLayer === 'streets') {
                this._setMapStyle('dark');
            }
        } else { // light theme
            themeToggleIcon.textContent = 'dark_mode';
            // If the current map style is dark, switch it to streets
            if (this.activeBaseLayer === 'dark') {
                this._setMapStyle('streets');
            }
        }
    }
    
    private _toggleTheme() {
        const currentTheme = document.getElementById('app-container')?.dataset.theme as 'light' | 'dark';
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        this._applyTheme(newTheme);
    }

    private _setMapStyle(style: string) {
        if (!this.tileLayers[style] || style === this.activeBaseLayer) return;

        // Remove current layer
        if (this.map.hasLayer(this.tileLayers[this.activeBaseLayer])) {
            this.map.removeLayer(this.tileLayers[this.activeBaseLayer]);
        }
        
        // Add new layer
        this.tileLayers[style].addTo(this.map).bringToBack();
        this.activeBaseLayer = style;

        // Update active button state
        document.querySelectorAll('.style-option').forEach(btn => {
            btn.classList.toggle('active', (btn as HTMLElement).dataset.style === style);
        });

        // Sync theme with map style if applicable
        const appContainer = document.getElementById('app-container')!;
        if (style === 'dark' && appContainer.dataset.theme !== 'dark') {
            this._applyTheme('dark');
        } else if (style === 'streets' && appContainer.dataset.theme !== 'light') {
            this._applyTheme('light');
        }
    }

    private async _fetchAndDisplayTraffic() {
        this._showToast('Fetching live traffic data...', 'info');
        try {
            const trafficData = await this.backend.getTraffic();
            if (trafficData && trafficData.features && trafficData.features.length > 0) {
                this.trafficLayer.clearLayers();
                this.trafficLayer.addData(trafficData);
                if (!this.map.hasLayer(this.trafficLayer)) {
                    this.map.addLayer(this.trafficLayer);
                    this.trafficLayer.bringToFront(); // Ensure traffic is visible
                }
            } else {
                this._showToast('No traffic data available at the moment.', 'info');
            }
        } catch (error) {
            console.error("Error fetching traffic data:", error);
            this._showToast('Could not load traffic data.', 'error');
            // Uncheck the box on failure for better UX
            const toggle = document.getElementById('toggle-traffic') as HTMLInputElement;
            if (toggle) toggle.checked = false;
        }
    }

    private _hideTraffic() {
        if (this.map.hasLayer(this.trafficLayer)) {
            this.map.removeLayer(this.trafficLayer);
        }
    }

    private async _handleFindRoute() {
        const fromInput = document.getElementById('from-input') as HTMLInputElement;
        const toInput = document.getElementById('to-input') as HTMLInputElement;
        const routeLoadingOverlay = document.getElementById('route-loading-overlay')!;

        if (!fromInput.value || !toInput.value) {
            // In a real app, show a toast notification
            console.warn("Please enter both a start and end location.");
            return;
        }

        const detailsPanel = document.getElementById('route-details-panel')!;
        detailsPanel.classList.remove('hidden');
        routeLoadingOverlay.classList.remove('hidden');

        const prefs = {
            preferHighways: (document.getElementById('route-pref-highways') as HTMLInputElement).checked,
            avoidTolls: (document.getElementById('route-pref-no-tolls') as HTMLInputElement).checked,
            preferScenic: (document.getElementById('route-pref-scenic') as HTMLInputElement).checked,
        };
        this.activeRoutePrefs = prefs;

        try {
            const rawRoutes = await this.backend.getAlternativeRoutes(prefs);
            if (rawRoutes && rawRoutes.length > 0) {
                // Get AI-generated summaries
                this.availableRoutes = await this.backend.getRouteSummaries(rawRoutes, prefs);
                
                this._renderAlternativeRoutes();
                this._setActiveRoute(this.availableRoutes[0].id);
                 document.getElementById('route-alternatives-container')?.classList.remove('hidden');
            } else {
                // Handle no routes found
                this._handleClearRoute();
                console.log("No routes found.");
            }
        } catch (error) {
            console.error("Error finding routes:", error);
            // Show an error message to the user
        } finally {
            routeLoadingOverlay.classList.add('hidden');
        }
    }

    private _renderAlternativeRoutes() {
        const container = document.getElementById('route-alternatives')!;
        container.innerHTML = ''; // Clear previous routes

        this.availableRoutes.forEach(route => {
            const card = document.createElement('div');
            card.className = `route-alternative-card route--${route.type}`;
            card.dataset.routeId = route.id;
            card.innerHTML = `
                <span class="time">${route.time} min</span>
                <span class="name">${route.name}</span>
                <span class="summary">${route.summary}</span>
            `;
            card.addEventListener('click', () => this._setActiveRoute(route.id));
            container.appendChild(card);
        });
    }

    private _getOverallRouteStatus(route: any): { text: string, icon: string, className: string } {
        const conditions = route.directions.map((d: any) => d.condition.type).filter(Boolean);
        
        if (conditions.includes('blocked')) {
            return { text: 'Road Blocked', icon: 'block', className: 'status--blocked' };
        }
        if (conditions.includes('one_lane')) {
            return { text: 'One-Lane Traffic', icon: 'merge_type', className: 'status--one-lane' };
        }
        if (conditions.includes('accident')) {
            return { text: 'Accident Reported', icon: 'car_crash', className: 'status--accident-reported' };
        }
        if (conditions.includes('traffic_jam')) {
            return { text: 'Heavy Traffic', icon: 'traffic', className: 'status--heavy-traffic' };
        }
        if (conditions.includes('construction')) {
            return { text: 'Construction Zone', icon: 'construction', className: 'status--construction-zone' };
        }
        if (conditions.includes('hazard')) {
            return { text: 'Hazard Reported', icon: 'warning', className: 'status--hazard-reported' };
        }
        
        return { text: 'Clear', icon: 'check_circle', className: 'status--clear' };
    }

    private _setActiveRoute(routeId: string) {
        const routeData = this.availableRoutes.find(r => r.id === routeId);
        if (!routeData) return;
        
        this.activeRouteData = routeData;

        // Update active card style
        document.querySelectorAll('.route-alternative-card').forEach(card => {
            card.classList.toggle('active', (card as HTMLElement).dataset.routeId === routeId);
        });

        this._updateRouteDetailsUI(routeData);
        this._displayRouteOnMap(routeData);
        this._updateRoutePreferencesSummary();

        // Update overall status
        const overallStatus = this._getOverallRouteStatus(routeData);
        const statusEl = document.getElementById('route-overall-status')!;
        statusEl.innerHTML = `<span class="material-icons">${overallStatus.icon}</span> ${overallStatus.text}`;
        statusEl.className = `stat-value ${overallStatus.className}`;

        // Update AI summary
        const summaryContainer = document.getElementById('route-ai-summary-container')!;
        const summaryEl = document.getElementById('route-ai-summary')!;
        if (routeData.summary) {
            summaryEl.textContent = routeData.summary;
            summaryContainer.classList.remove('hidden');
        } else {
            summaryContainer.classList.add('hidden');
        }
    }
    
    private _formatTimeAgo(isoString: string): string {
        const date = new Date(isoString);
        const now = new Date();
        const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

        let interval = seconds / 31536000;
        if (interval > 1) return Math.floor(interval) + " years ago";
        interval = seconds / 2592000;
        if (interval > 1) return Math.floor(interval) + " months ago";
        interval = seconds / 86400;
        if (interval > 1) return Math.floor(interval) + " days ago";
        interval = seconds / 3600;
        if (interval > 1) return Math.floor(interval) + " hours ago";
        interval = seconds / 60;
        if (interval > 1) return Math.floor(interval) + " minutes ago";
        return "just now";
    }

    private _getConditionInfo(conditionType: string): { icon: string, label: string } {
        switch (conditionType) {
            case 'accident': return { icon: 'car_crash', label: 'Accident Reported' };
            case 'construction': return { icon: 'construction', label: 'Construction Ahead' };
            case 'hazard': return { icon: 'warning', label: 'Road Hazard' };
            case 'traffic_jam': return { icon: 'traffic', label: 'Heavy Traffic' };
            case 'blocked': return { icon: 'block', label: 'Road Blocked' };
            case 'one_lane': return { icon: 'merge_type', label: 'One-Lane Traffic' };
            case 'flood': return { icon: 'water', label: 'Flooding Reported' };
            case 'landslide': return { icon: 'landslide', label: 'Landslide Reported' };
            case 'broken_road': return { icon: 'dangerous', label: 'Damaged Road/Bridge' };
            default: return { icon: '', label: '' };
        }
    }

    private _updateRouteDetailsUI(route: any) {
        document.getElementById('route-distance')!.textContent = `${route.distance} km`;
        document.getElementById('route-time')!.textContent = `${route.time} min`;
        
        const eta = new Date(Date.now() + route.time * 60000);
        document.getElementById('route-eta')!.textContent = eta.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        
        const directionsList = document.getElementById('route-directions-list')!;
        directionsList.innerHTML = '';
        route.directions.forEach((step: {instruction: string, icon: string, condition: {type: string, details?: string, source?: string, lastUpdated?: string, sourceType?: 'official' | 'user'}}) => {
            const li = document.createElement('li');
            li.className = 'direction-step';

            const conditionType = step.condition.type || 'clear';
            li.dataset.condition = conditionType;

            if (step.condition.details) {
                 let title = step.condition.details;
                 const sourceTypeLabel = step.condition.sourceType === 'official' ? 'Official Source' : 'Source';
                 if (step.condition.source) title += `\n${sourceTypeLabel}: ${step.condition.source}`;
                 if (step.condition.lastUpdated) title += `\nUpdated: ${this._formatTimeAgo(step.condition.lastUpdated)}`;
                 li.title = title;
            }

            const conditionInfo = this._getConditionInfo(conditionType);

            let conditionHtml = '';
            if (conditionType !== 'clear') {
                conditionHtml = `<span class="material-icons condition-icon" title="${conditionInfo.label}">${conditionInfo.icon}</span>`;
            }
            
            let authenticityHtml = '';
            if (step.condition.sourceType === 'official') {
                authenticityHtml = `<span class="material-icons official-report-indicator" title="Verified Official Report">verified_user</span>`;
            }

            li.innerHTML = `
                <span class="material-icons step-icon">${step.icon}</span>
                <div class="step-instruction-wrapper">
                    <p class="step-instruction">${step.instruction}</p>
                    ${authenticityHtml}
                </div>
                <div class="step-condition-indicator">
                    ${conditionHtml}
                </div>`;
            directionsList.appendChild(li);
        });
    }

     private _updateRoutePreferencesSummary() {
        const summaryContainer = document.getElementById('route-preferences-summary')!;
        const list = document.getElementById('route-preferences-list')!;
        list.innerHTML = '';
        let prefsUsed = false;
        
        if (this.activeRoutePrefs?.preferHighways) {
            prefsUsed = true;
            list.innerHTML += `<li><span class="material-icons">highway</span> ${this.translations.prefer_highways}</li>`;
        }
        if (this.activeRoutePrefs?.avoidTolls) {
            prefsUsed = true;
            list.innerHTML += `<li><span class="material-icons">no_transfer</span> ${this.translations.avoid_tolls}</li>`;
        }
        if (this.activeRoutePrefs?.preferScenic) {
            prefsUsed = true;
            list.innerHTML += `<li><span class="material-icons">park</span> ${this.translations.prefer_scenic_route}</li>`;
        }

        summaryContainer.classList.toggle('hidden', !prefsUsed);
    }
    
    private _displayRouteOnMap(route: any) {
        this.routeLayer.clearLayers();
        const routeGeoJson = {
            type: "Feature",
            properties: {},
            geometry: route.geometry
        };
        // Leaflet expects [lat, lon], but GeoJSON is [lon, lat], so we need to swap.
        const swappedCoords = route.geometry.coordinates.map((coord: number[]) => [coord[1], coord[0]]);
        const polyline = L.polyline(swappedCoords, { color: '#3498db', weight: 6, opacity: 0.9 });
        this.routeLayer.addLayer(polyline);
        this.map.fitBounds(polyline.getBounds(), { padding: [50, 50] });
    }

    private _handleClearRoute() {
        this.availableRoutes = [];
        this.activeRouteData = null;
        this.activeRoutePrefs = null;

        this.routeLayer.clearLayers();
        document.getElementById('route-details-panel')?.classList.add('hidden');
        document.getElementById('route-alternatives-container')?.classList.add('hidden');
        document.getElementById('route-preferences-summary')?.classList.add('hidden');
        document.getElementById('route-ai-summary-container')?.classList.add('hidden');
        
        const fromInput = document.getElementById('from-input') as HTMLInputElement;
        if (fromInput) fromInput.value = '';
        const toInput = document.getElementById('to-input') as HTMLInputElement;
        if (toInput) toInput.value = '';

        // Clean up URL parameters
        const url = new URL(window.location.href);
        url.searchParams.delete('from');
        url.searchParams.delete('to');
        window.history.replaceState({}, '', url);

        this._updateRoutingUI(); // Reset the UI to search mode
    }

    private _updateRoutingUI() {
        const fromVal = (document.getElementById('from-input') as HTMLInputElement)?.value || '';
        const toVal = (document.getElementById('to-input') as HTMLInputElement)?.value || '';
        const unifiedSearchBar = document.getElementById('unified-search-bar')!;
        const routingPanel = document.getElementById('active-routing-panel')!;
    
        // If either input has a value, we are in routing mode
        if (fromVal.trim() || toVal.trim()) {
            unifiedSearchBar.classList.add('hidden');
            routingPanel.classList.remove('hidden');
        } else { // Both are empty, go back to search mode
            unifiedSearchBar.classList.remove('hidden');
            routingPanel.classList.add('hidden');
        }
    }
    
    private _handlePreferenceChange() {
        // Automatically re-fetch routes when a preference is changed,
        // but only if a route is actively being planned.
        const fromInput = document.getElementById('from-input') as HTMLInputElement;
        const toInput = document.getElementById('to-input') as HTMLInputElement;
    
        if (fromInput?.value && toInput?.value) {
            this._handleFindRoute();
        }
    }
    
    private _showToast(message: string, type: 'success' | 'warning' | 'error' | 'info' = 'info') {
        const toast = document.getElementById('toast-notification')!;
        const toastMessage = document.getElementById('toast-message')!;
        const toastIcon = document.getElementById('toast-icon')!;

        toast.className = 'hidden'; // Reset classes
        toastMessage.textContent = message;

        const icons = {
            success: 'check_circle',
            warning: 'warning',
            error: 'error',
            info: 'info'
        };

        toastIcon.textContent = icons[type];
        toast.classList.add(type);
        toast.classList.add('show');

        setTimeout(() => {
            toast.classList.remove('show');
        }, 4000);
    }

    // --- Offline Maps Methods ---
    private _initOfflineMaps() {
        const savedRegions = localStorage.getItem('sadak_sathi_offline_regions');
        if (savedRegions) {
            this.downloadedRegions = JSON.parse(savedRegions);
        } else {
            this.downloadedRegions = [];
        }
        this._renderDownloadedRegions();
        this._updateDownloadModalButtons();
    }
    
    private _renderDownloadedRegions() {
        const list = document.getElementById('offline-regions-list')!;
        list.innerHTML = '';

        if (this.downloadedRegions.length === 0) {
            list.innerHTML = `<p style="padding: 1rem; text-align: center; color: var(--text-color-muted);" data-lang-key="no_offline_maps">${this.translations.no_offline_maps}</p>`;
            return;
        }

        this.downloadedRegions.forEach(region => {
            const li = document.createElement('li');
            li.dataset.regionId = region.id;
            li.innerHTML = `
                <div class="offline-region-info">
                    <span class="material-icons">map</span>
                    <div>
                        <strong>${region.name}</strong>
                        <span>${region.size}</span>
                    </div>
                </div>
                <button class="icon-button delete-btn" title="${this.translations.delete}">
                    <span class="material-icons">delete</span>
                </button>
            `;
            li.querySelector('.delete-btn')?.addEventListener('click', () => this._handleDeleteRegion(region.id));
            list.appendChild(li);
        });
    }

    private _handleDownloadRegion(listItem: HTMLElement, regionId: string, regionName: string, regionSize: string) {
        const downloadBtn = listItem.querySelector('.download-btn') as HTMLElement;
        const progressContainer = listItem.querySelector('.download-progress-container') as HTMLElement;
        const progressBar = progressContainer.querySelector('progress') as HTMLProgressElement;
        const progressText = progressContainer.querySelector('span') as HTMLElement;

        if (downloadBtn.classList.contains('downloaded')) return;

        downloadBtn.classList.add('hidden');
        progressContainer.classList.remove('hidden');
        
        let progress = 0;
        const interval = setInterval(() => {
            progress += Math.random() * 15;
            if (progress >= 100) {
                progress = 100;
                clearInterval(interval);
                
                downloadBtn.classList.remove('hidden');
                progressContainer.classList.add('hidden');
                
                downloadBtn.innerHTML = `<span class="material-icons">check</span> <span data-lang-key="downloaded">${this.translations.downloaded}</span>`;
                downloadBtn.classList.add('downloaded');

                // Save to state and localStorage
                if (!this.downloadedRegions.some(r => r.id === regionId)) {
                    this.downloadedRegions.push({ id: regionId, name: regionName, size: regionSize });
                    localStorage.setItem('sadak_sathi_offline_regions', JSON.stringify(this.downloadedRegions));
                    this._renderDownloadedRegions();
                    this._showToast(this.translations.offline_map_saved_toast.replace('{region}', regionName), 'success');
                }
            }
            progressBar.value = progress;
            progressText.textContent = `${Math.round(progress)}%`;
        }, 300);
    }
    
    private _handleDeleteRegion(regionId: string) {
        this.downloadedRegions = this.downloadedRegions.filter(r => r.id !== regionId);
        localStorage.setItem('sadak_sathi_offline_regions', JSON.stringify(this.downloadedRegions));
        const region = en_translations[regionId.replace('-', '_') as keyof typeof en_translations] || regionId;
        this._showToast(this.translations.offline_map_deleted_toast.replace('{region}', region), 'info');
        this._renderDownloadedRegions();
        this._updateDownloadModalButtons();
    }
    
    private _updateDownloadModalButtons() {
        document.querySelectorAll('#download-region-options li').forEach(li => {
            const regionId = (li as HTMLElement).dataset.region;
            const downloadBtn = li.querySelector('.download-btn') as HTMLElement;
            if (regionId && this.downloadedRegions.some(r => r.id === regionId)) {
                 downloadBtn.innerHTML = `<span class="material-icons">check</span> <span data-lang-key="downloaded">${this.translations.downloaded}</span>`;
                 downloadBtn.classList.add('downloaded');
            } else {
                 downloadBtn.innerHTML = `<span class="material-icons">download</span> <span data-lang-key="download">${this.translations.download}</span>`;
                 downloadBtn.classList.remove('downloaded');
            }
        });
    }

    // --- Share Route Methods ---
    private _openShareModal() {
        if (!this.activeRouteData) {
            this._showToast(this.translations.no_route_to_share, 'warning');
            return;
        }

        const start = this.activeRouteData.geometry.coordinates[0];
        const end = this.activeRouteData.geometry.coordinates[this.activeRouteData.geometry.coordinates.length - 1];
        
        const url = new URL(window.location.href);
        url.search = ''; // Clear existing params
        url.searchParams.set('from', `${start[1]},${start[0]}`); // lat,lon
        url.searchParams.set('to', `${end[1]},${end[0]}`); // lat,lon
        
        const shareLinkInput = document.getElementById('share-route-link') as HTMLInputElement;
        shareLinkInput.value = url.toString();

        this._setupSocialShareLinks(url.toString());
        
        document.getElementById('share-route-modal')?.classList.remove('hidden');
    }

    private _handleCopyLink() {
        const shareLinkInput = document.getElementById('share-route-link') as HTMLInputElement;
        navigator.clipboard.writeText(shareLinkInput.value).then(() => {
            const copyBtn = document.getElementById('copy-share-link-btn')!;
            const originalText = copyBtn.querySelector('span:last-child')!.textContent;
            const originalIcon = copyBtn.querySelector('span:first-child')!.textContent;

            copyBtn.classList.add('copied');
            copyBtn.querySelector('span:last-child')!.textContent = this.translations.copied;
            copyBtn.querySelector('span:first-child')!.textContent = 'check';

            setTimeout(() => {
                copyBtn.classList.remove('copied');
                copyBtn.querySelector('span:last-child')!.textContent = originalText;
                copyBtn.querySelector('span:first-child')!.textContent = originalIcon;
            }, 2500);
        });
    }

    private _setupSocialShareLinks(url: string) {
        const text = encodeURIComponent("Check out this route I planned on Sadak Sathi!");
        
        (document.getElementById('share-email-btn') as HTMLAnchorElement).href = `mailto:?subject=Route from Sadak Sathi&body=${text}%0A${encodeURIComponent(url)}`;
        (document.getElementById('share-x-btn') as HTMLAnchorElement).href = `https://twitter.com/intent/tweet?text=${text}&url=${encodeURIComponent(url)}`;
        (document.getElementById('share-facebook-btn') as HTMLAnchorElement).href = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`;
    }
    
    private _initRouteFromUrlParams() {
        const params = new URLSearchParams(window.location.search);
        const from = params.get('from');
        const to = params.get('to');

        if (from && to) {
            // Validate coordinates format
            const fromCoords = from.split(',').map(Number);
            const toCoords = to.split(',').map(Number);

            if (fromCoords.length === 2 && toCoords.length === 2 && !isNaN(fromCoords[0]) && !isNaN(fromCoords[1]) && !isNaN(toCoords[0]) && !isNaN(toCoords[1])) {
                (document.getElementById('from-input') as HTMLInputElement).value = `Lat: ${fromCoords[0].toFixed(4)}, Lon: ${fromCoords[1].toFixed(4)}`;
                (document.getElementById('to-input') as HTMLInputElement).value = `Lat: ${toCoords[0].toFixed(4)}, Lon: ${toCoords[1].toFixed(4)}`;
                
                this._updateRoutingUI();
                this._handleFindRoute();
            }
        }
    }
    
     private async _handleMapClick(e: any) {
        const { lat, lng } = e.latlng;
        
        this._showDetailCard(`Location`, `
            <div class="poi-section">
                <ul class="poi-tips-list">
                    <li><span class="material-icons">pin_drop</span> <p><b>Latitude:</b> ${lat.toFixed(5)}</p></li>
                    <li><span class="material-icons">pin_drop</span> <p><b>Longitude:</b> ${lng.toFixed(5)}</p></li>
                </ul>
            </div>
        `);

        // Fetch and display weather for the clicked coordinates
        await this._fetchAndDisplayWeather(lat, lng);

        // Update actions
        this._setupMapClickDetailCardActions(lat, lng);
    }

    private async _handlePoiClick(poi: { id: string, name: string, type: string, lat: number, lon: number }) {
        this._showDetailCard(poi.name, `
            <div class="spinner-container">
                <div class="spinner"></div>
            </div>
            <p style="text-align: center;">Loading details for ${poi.name}...</p>
        `);

        // Fetch weather and POI details in parallel for better performance
        try {
            const [_, details] = await Promise.all([
                this._fetchAndDisplayWeather(poi.lat, poi.lon),
                this.backend.getPoiDetails(poi.id, poi.name)
            ]);

            const content = `
                <div class="poi-section">
                    <p>${details.description}</p>
                </div>
                <div class="poi-section">
                    <h4>History</h4>
                    <p>${details.history}</p>
                </div>
                 <div class="poi-section">
                    <h4>Good to Know</h4>
                    <ul class="poi-tips-list">
                        <li><span class="material-icons">schedule</span> <span>${details.operatingHours}</span></li>
                        <li><span class="material-icons">local_activity</span> <span>${details.entryFee}</span></li>
                    </ul>
                </div>
                <div class="poi-section">
                    <h4>Local Tips</h4>
                    <ul class="poi-tips-list">
                        ${details.localTips.map((tip: string) => `<li><span class="material-icons">lightbulb</span> <p>${tip}</p></li>`).join('')}
                    </ul>
                </div>
            `;
            this._updateDetailCardContent(content);
            this._setupPoiDetailCardActions(poi);
        } catch (error) {
            console.error("Failed to get POI details:", error);
            this._updateDetailCardContent(`<p class="error">Sorry, could not fetch details for ${poi.name}.</p>`);
        }
    }
    
    private _showDetailCard(title: string, content: string) {
        const card = document.getElementById('detail-card')!;
        document.getElementById('detail-card-title')!.textContent = title;
        document.getElementById('detail-card-content')!.innerHTML = content;
        document.getElementById('detail-card-actions')!.innerHTML = ''; // Clear actions
        card.classList.add('visible');
    }

    private _hideDetailCard() {
        document.getElementById('detail-card')?.classList.remove('visible');
        // Also hide weather sections to ensure a clean state next time
        document.getElementById('detail-card-weather')?.classList.add('hidden');
        document.getElementById('detail-card-forecast-container')?.classList.add('hidden');
        document.getElementById('detail-card-ai-advisory')?.classList.add('hidden');
    }

    private _updateDetailCardContent(content: string) {
        document.getElementById('detail-card-content')!.innerHTML = content;
    }

    private _handleDirectionsToEntity(name: string, coords: { lat: number, lon: number }) {
        this._hideDetailCard();
    
        const fromInput = document.getElementById('from-input') as HTMLInputElement;
        const toInput = document.getElementById('to-input') as HTMLInputElement;
    
        fromInput.value = this.translations.current_location_label;
        toInput.value = name;
    
        // In a real app with a real routing engine, you might store the coords
        // in a data attribute or a state variable. For this simulation, the name is enough.
    
        this._updateRoutingUI();
        // Use a small timeout to ensure the UI updates before the async route finding starts
        setTimeout(() => this._handleFindRoute(), 50);
    }
    
    private _setupPoiDetailCardActions(poi: { id: string, name: string, type: string, lat: number, lon: number }) {
        const actionsContainer = document.getElementById('detail-card-actions')!;
        actionsContainer.innerHTML = ''; // Clear previous actions
    
        const directionsBtn = document.createElement('button');
        directionsBtn.className = 'primary-btn';
        directionsBtn.innerHTML = `<span class="material-icons">directions</span> ${this.translations.directions_to_here}`;
        directionsBtn.addEventListener('click', () => this._handleDirectionsToEntity(poi.name, { lat: poi.lat, lon: poi.lon }));
        
        const askAiBtn = document.createElement('button');
        askAiBtn.className = 'secondary-btn';
        askAiBtn.innerHTML = `<span class="material-icons">chat</span> ${this.translations.tell_me_about_this_place}`;
        // TODO: Add click listener for AI chat about the POI
        
        actionsContainer.appendChild(directionsBtn);
        actionsContainer.appendChild(askAiBtn);
    }
    
    private _setupMapClickDetailCardActions(lat: number, lng: number) {
        const actionsContainer = document.getElementById('detail-card-actions')!;
        actionsContainer.innerHTML = '';
    
        const directionsBtn = document.createElement('button');
        directionsBtn.className = 'primary-btn';
        directionsBtn.innerHTML = `<span class="material-icons">directions</span> ${this.translations.directions_to_here}`;
        const locationName = `Lat: ${lat.toFixed(4)}, Lon: ${lng.toFixed(4)}`;
        directionsBtn.addEventListener('click', () => this._handleDirectionsToEntity(locationName, { lat: lat, lon: lng }));
    
        const savePlaceBtn = document.createElement('button');
        savePlaceBtn.className = 'secondary-btn';
        savePlaceBtn.innerHTML = `<span class="material-icons">add_location_alt</span> Save Place`;
        // TODO: Add click listener for saving place
        
        actionsContainer.appendChild(directionsBtn);
        actionsContainer.appendChild(savePlaceBtn);
    }

    private async _fetchAndDisplayWeather(lat: number, lon: number) {
        const weatherContainer = document.getElementById('detail-card-weather')!;
        const forecastContainer = document.getElementById('detail-card-forecast-container')!;
        const advisoryContainer = document.getElementById('detail-card-ai-advisory')!;
        const advisoryContent = document.getElementById('ai-advisory-content')!;

        // Reset and show loading state
        weatherContainer.innerHTML = `<div class="spinner-inline"></div><span>Fetching weather...</span>`;
        forecastContainer.innerHTML = '';
        advisoryContent.innerHTML = `<div class="spinner-inline"></div><span>Analyzing weather...</span>`;
        weatherContainer.classList.remove('hidden');
        forecastContainer.classList.add('hidden');
        advisoryContainer.classList.remove('hidden');

        try {
            const weatherData = await this.backend.getWeather(lat, lon);
            
            if (!weatherData || !weatherData.current || !weatherData.forecast) {
                 throw new Error("Invalid weather data format received from backend.");
            }

            // Populate current weather
            weatherContainer.innerHTML = `
                <span id="weather-icon" class="material-icons">${weatherData.current.icon}</span>
                <span id="weather-temp">${weatherData.current.temp}°C</span>
                <span id="weather-desc">${weatherData.current.desc}</span>
            `;

            // Populate forecast
            forecastContainer.innerHTML = weatherData.forecast.map((day: any) => `
                <div class="forecast-item">
                    <span class="forecast-day">${day.day}</span>
                    <span class="material-icons forecast-icon">${day.icon}</span>
                    <span class="forecast-temps">
                        <span class="high">${day.temp_high}°</span> / 
                        <span class="low">${day.temp_low}°</span>
                    </span>
                </div>
            `).join('');
            forecastContainer.classList.remove('hidden');
            
            // Fetch and display AI weather insights
            try {
                const aiResponse = await this.backend.getWeatherInsights(weatherData);
                advisoryContent.innerHTML = `<p>${aiResponse.insight}</p>`;
            } catch (aiError) {
                console.error("Failed to get AI weather insights:", aiError);
                advisoryContainer.classList.add('hidden');
            }

        } catch (error) {
            console.error("Failed to fetch weather data:", error);
            weatherContainer.innerHTML = `<span class="material-icons">error_outline</span><span>Could not load weather</span>`;
            forecastContainer.classList.add('hidden');
            advisoryContainer.classList.add('hidden');
        }
    }

    // --- NEW: Reports Feature Methods ---
    private async _openReportsModal() {
        const modal = document.getElementById('reports-modal')!;
        modal.classList.remove('hidden');

        if (this.historicalIncidents.length === 0) {
            this.historicalIncidents = await this.backend.getHistoricalIncidents();
            this._populateHighwayFilter();
        }
        this._logActivity(`User ${this.currentUser?.email || 'Guest'} opened reports modal.`);
        this._renderReport();
    }

    private _closeReportsModal() {
        const modal = document.getElementById('reports-modal')!;
        modal.classList.add('hidden');
    }

    private _populateHighwayFilter() {
        const container = document.getElementById('highway-filter-container')!;
        const highwayNames = [...new Set(this.historicalIncidents.map(inc => inc.roadName))].sort();
        
        if(highwayNames.length === 0) {
            container.innerHTML = `<p>No highway data available.</p>`;
            return;
        }

        container.innerHTML = `
            <div class="highway-filter-control">
                <input type="checkbox" id="highway-filter-all" checked>
                <label for="highway-filter-all">Select All</label>
            </div>
        `;
        
        highwayNames.forEach(name => {
            const div = document.createElement('div');
            div.className = 'highway-filter-item';
            div.innerHTML = `
                <input type="checkbox" id="highway-${name.replace(/\s+/g, '-')}" class="highway-filter-checkbox" data-highway="${name}" checked>
                <label for="highway-${name.replace(/\s+/g, '-')}">${name}</label>
            `;
            container.appendChild(div);
        });

        // Add event listeners
        document.getElementById('highway-filter-all')?.addEventListener('change', (e) => {
            const isChecked = (e.target as HTMLInputElement).checked;
            document.querySelectorAll('.highway-filter-checkbox').forEach(cb => {
                (cb as HTMLInputElement).checked = isChecked;
            });
            this._renderReport();
        });

        container.querySelectorAll('.highway-filter-checkbox').forEach(checkbox => {
            checkbox.addEventListener('change', () => {
                const allChecked = Array.from(document.querySelectorAll('.highway-filter-checkbox')).every(cb => (cb as HTMLInputElement).checked);
                (document.getElementById('highway-filter-all') as HTMLInputElement).checked = allChecked;
                this._renderReport();
            });
        });
    }

    private _handleReportTypeChange(e: Event) {
        const target = e.currentTarget as HTMLElement;
        const type = target.dataset.type;
        document.querySelectorAll('.report-type-btn').forEach(btn => btn.classList.remove('active'));
        target.classList.add('active');

        // Snapshot is best for single day, so auto-switch date range
        if (type === 'snapshot') {
            document.querySelectorAll('.report-date-btn').forEach(btn => btn.classList.remove('active'));
            (document.querySelector('.report-date-btn[data-range="today"]') as HTMLElement).classList.add('active');
        }

        this._renderReport();
    }
    
    private _handleReportDateFilterChange(e: Event) {
        const target = e.currentTarget as HTMLElement;
        document.querySelectorAll('.report-date-btn').forEach(btn => btn.classList.remove('active'));
        target.classList.add('active');
        (document.getElementById('report-date-start') as HTMLInputElement).value = '';
        (document.getElementById('report-date-end') as HTMLInputElement).value = '';
        this._renderReport();
    }

    private _handleReportCustomDateChange() {
        document.querySelectorAll('.report-date-btn').forEach(btn => btn.classList.remove('active'));
        this._renderReport();
    }

    private _handleReportViewChange(e: Event) {
        const target = e.currentTarget as HTMLElement;
        document.querySelectorAll('.report-view-btn').forEach(btn => btn.classList.remove('active'));
        target.classList.add('active');
        this._renderReport();
    }

    private _getReportDateRange(): { start: Date, end: Date } {
        const activeButton = document.querySelector('.report-date-btn.active');
        const now = new Date();
        let start = new Date(now);
        let end = new Date(now);

        if (activeButton) {
            const range = activeButton.getAttribute('data-range');
            switch(range) {
                case 'today':
                    start.setHours(0, 0, 0, 0);
                    end.setHours(23, 59, 59, 999);
                    break;
                case 'week':
                    start.setDate(now.getDate() - now.getDay()); // Start of week (Sunday)
                    start.setHours(0, 0, 0, 0);
                    end.setHours(23, 59, 59, 999);
                    break;
                case 'month':
                    start = new Date(now.getFullYear(), now.getMonth(), 1);
                    end.setHours(23, 59, 59, 999);
                    break;
            }
        } else { // Custom range
            const startDateVal = (document.getElementById('report-date-start') as HTMLInputElement).value;
            const endDateVal = (document.getElementById('report-date-end') as HTMLInputElement).value;
            start = startDateVal ? new Date(startDateVal) : new Date(now.getFullYear(), 0, 1);
            end = endDateVal ? new Date(endDateVal) : now;
            
            start.setHours(0,0,0,0);
            end.setHours(23,59,59,999);
        }
        return { start, end };
    }
    
    private _renderReport() {
        const reportType = (document.querySelector('.report-type-btn.active') as HTMLElement).dataset.type;
        const activeView = (document.querySelector('.report-view-btn.active') as HTMLElement).dataset.view;
        const { start, end } = this._getReportDateRange();
        
        const selectedHighways: Set<string> = new Set();
        document.querySelectorAll('.highway-filter-checkbox:checked').forEach(cb => {
            selectedHighways.add((cb as HTMLElement).dataset.highway!);
        });
        
        const approvedIncidents = this.historicalIncidents.filter(inc => inc.status === 'approved');
        const highwayFilteredData = approvedIncidents.filter(inc => selectedHighways.has(inc.roadName));

        let reportData: any;
        let summaryText = '';

        if (reportType === 'resumption') {
            reportData = highwayFilteredData.filter(inc => {
                const endDate = new Date(inc.endDate);
                return endDate >= start && endDate <= end;
            });
            summaryText = `Total Resumed Incidents: <span id="report-total-count">${reportData.length}</span>`;
        } else { // snapshot
             // For snapshot, we group by day
            const dailySnapshots: { [key: string]: any[] } = {};
            for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
                const dayStr = d.toISOString().split