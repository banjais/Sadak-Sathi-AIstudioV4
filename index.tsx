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


// Fix: Replaced incorrect `FunctionDeclarationTool` with `Tool` and added `Type` for schema definitions.
import { GoogleGenAI, Tool, Type, GenerateContentResponse } from "@google/genai";

// Fix: To resolve "Cannot find namespace 'L'", declare the namespace for Leaflet types.
declare namespace L {
    type Map = any;
    type GeoJSON = any;
    type TileLayer = any;
    type FeatureGroup = any;
    type Marker = any;
    type Polyline = any;
    type LatLng = any;
    type LatLngBounds = any;
    // Fix: Add missing DivIcon type to Leaflet namespace declaration.
    type DivIcon = any;
}
declare var L: any;
// Web Speech API
const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
const SpeechSynthesis = window.speechSynthesis;

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });


// =================================================================================
// ARCHITECTURE REFACTOR: "Backend-Ready" API Simulation
// =================================================================================
const ROAD_DATA_URL = 'https://script.google.com/macros/s/AKfycbx6gmAt6XdIUqQstWfn1GdBTdAxXcsZkLwZ006ajJaCTRdlCgMzFa0Qw-di2IkKChxW/exec';

// --- NEW: Nepal-centric configuration ---
const NEPAL_BORDER_GEOJSON = { "type": "Polygon", "coordinates": [[[80.058, 28.995], [80.12, 30.448], [81.5, 30.222], [82.8, 29.5], [84.0, 28.5], [85.0, 27.8], [86.0, 28.0], [88.2, 27.5], [88.1, 26.3], [85.8, 26.6], [83.5, 27.5], [82.0, 27.9], [80.058, 28.995]]] };
const nepalBounds = L.latLngBounds([[26.3, 80.0], [30.5, 88.2]]);


const api = {
    /**
     * Represents fetching the base map geometry (e.g., from a shapefile).
     * Since the shapefile URL is not provided, this uses mock data as a stable source for road lines.
     */
    getRoadGeometries: async (): Promise<any> => {
        console.log("API: Using mock road geometry data.");
        return Promise.resolve({
            "type": "FeatureCollection", "features": [
                { "type": "Feature", "properties": { "name": "Araniko Highway", "code": "H03", "status": "Resumed" }, "geometry": { "type": "LineString", "coordinates": [[85.3, 27.7], [85.4, 27.75], [85.5, 27.7]] } },
                { "type": "Feature", "properties": { "name": "Prithvi Highway", "code": "H04", "status": "One-Lane" }, "geometry": { "type": "LineString", "coordinates": [[84.4, 27.7], [84.8, 27.65], [85.3, 27.7]] } },
                { "type": "Feature", "properties": { "name": "Local Road", "code": "L22", "status": "Blocked" }, "geometry": { "type": "LineString", "coordinates": [[85.32, 27.68], [85.35, 27.69], [85.34, 27.66]] } },
                { "type": "Feature", "properties": { "name": "Ring Road", "code": "H16", "status": "Resumed" }, "geometry": { "type": "LineString", "coordinates": [[85.316, 27.691], [85.300, 27.680], [85.310, 27.670], [85.322, 27.693]] } }
            ]
        });
    },

    /**
     * Fetches and processes the LIVE road status markers from the official Google Sheet data source.
     * This function is designed to handle point data, not line geometries.
     */
    getRoadStatuses: async (): Promise<any> => {
        console.log("API: Fetching live road status markers...");
        try {
            const response = await fetch(ROAD_DATA_URL);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const rawData = await response.json();

            let statusArray: any[] = [];
            // Handle both direct array responses and object-wrapped array responses from the API
            if (Array.isArray(rawData)) {
                statusArray = rawData;
            } else if (rawData && typeof rawData === 'object' && rawData.data && Array.isArray(rawData.data)) {
                // A common API pattern is to wrap the array in a 'data' property
                statusArray = rawData.data;
            } else {
                // If the data is in an unexpected format, log the error and return an empty set.
                console.error("API: Live status data is not in a recognized array format.", rawData);
                return { type: "FeatureCollection", features: [] };
            }

            // --- NEW: Filter data to be within Nepal's borders ---
            const filteredStatusArray = statusArray.filter(item => {
                if (item.lat && item.lng) {
                    return nepalBounds.contains([item.lat, item.lng]);
                }
                return false;
            });

            // Map Nepali status text to the app's internal English keys
            const statusMap: { [key: string]: string } = {
                "अवरुद्व": "Blocked",
                "एकतर्फी": "One-Lane",
                "सञ्चालित": "Resumed"
            };
            
            const features = filteredStatusArray.map(item => {
                if (!item.lat || !item.lng) return null; // Skip items without coordinates

                const englishStatus = statusMap[item.status] || 'Unknown';
                return {
                    type: "Feature",
                    properties: {
                        name: `Status on ${item.highway}`,
                        highwayName: item.highway, // Add original highway name for easier matching
                        code: item.serial,
                        status: englishStatus,
                        cause: item.cause,
                        section: item.section,
                        description: item.description,
                        contactName: item.contact?.name,
                        contactNumber: item.contact?.number,
                        category: 'road_status' // Assign a specific category for icons and filtering
                    },
                    geometry: {
                        type: "Point",
                        coordinates: [item.lng, item.lat] // GeoJSON is [lng, lat]
                    }
                };
            }).filter(Boolean); // Filter out any null items

            console.log(`API: Processed ${features.length} live road status markers within Nepal.`);
            return {
                type: "FeatureCollection",
                features: features
            };

        } catch (error) {
            console.error("API: Failed to fetch or process live road status markers.", error);
            return { type: "FeatureCollection", features: [] }; // Return empty but valid GeoJSON on error
        }
    },

    getPOIs: async (): Promise<any[]> => {
        console.log("API: Fetching POIs...");
        await new Promise(resolve => setTimeout(resolve, 300));
        return Promise.resolve([
            { id: 1, name: "Maitighar Mandala", lat: 27.693, lng: 85.322, type: 'poi', status_key: 'status_good_condition', category: 'landmark' },
            { id: 2, name: "Thapathali Bridge", lat: 27.691, lng: 85.316, type: 'poi', status_key: 'status_maintenance', category: 'bridge' },
            { id: 5, name: "Patan Hospital", lat: 27.671, lng: 85.318, type: 'poi', status_key: 'status_open_247', category: 'hospital' },
            { id: 6, name: "Himalayan Java Coffee", lat: 27.695, lng: 85.320, type: 'poi', status_key: 'status_open', category: 'coffee' },
            { id: 7, name: "Civil Mall", lat: 27.699, lng: 85.314, type: 'poi', status_key: 'status_open', category: 'shopping' },
            { id: 8, name: "Bota Restaurant", lat: 27.701, lng: 85.315, type: 'poi', status_key: 'status_open', category: 'restaurant' },
            { id: 9, name: "Nabil Bank ATM", lat: 27.692, lng: 85.318, type: 'poi', status_key: 'status_open_247', category: 'atm' },
            { id: 10, name: "Sajha Petrol Pump", lat: 27.675, lng: 85.319, type: 'poi', status_key: 'status_open', category: 'fuel' },
            { id: 11, "name": "Police Station, Jawalakhel", lat: 27.674, lng: 85.311, type: 'poi', status_key: 'status_open_247', category: 'police' }
        ]);
    },
    getIncidents: async (): Promise<any[]> => {
        console.log("API: Fetching Incidents (Waze simulation)...");
        await new Promise(resolve => setTimeout(resolve, 100));
        // More realistic Waze-like data
        return Promise.resolve([
             { id: 3, name: "Major Traffic Jam", lat: 27.693, lng: 85.341, type: 'incident', status_key: 'status_incident', category: 'traffic', severity: 'Major', incidentType: 'Jam' },
             { id: 4, name: "Road construction", lat: 27.685, lng: 85.320, type: 'incident', status_key: 'status_incident', category: 'construction', severity: 'Minor', incidentType: 'Construction' }
        ]);
    }
};

// =================================================================================
// App State & Configuration
// =================================================================================
let map: L.Map;
let roadsLayer: L.GeoJSON;
let poisLayer: L.FeatureGroup;
let alertsLayer: L.FeatureGroup;
let userMarker: L.Marker;
let routeLine: L.Polyline | null = null;
let routeStartMarker: L.Marker | null = null;
let routeEndMarker: L.Marker | null = null;
let currentLang = 'en';
let allPois: any[] = [];
let allIncidents: any[] = [];
let allRoadsData: any = null;
let allItemsMap = new Map<string, any>(); // Correction: For optimized POI lookups
let isVoiceResponseEnabled = true; // State for AI voice response feature
let isAudioUnlocked = false; // Flag to check if user interaction has occurred
let activeChat: any = null; // To hold the AI chat session
let currentAppMode: 'driving' | 'riding' | 'exploring' | 'connect' = 'driving';
let currentAlertMessageKey: string | null = null;
let routePreferences = {
    preferHighways: false,
    avoidTolls: false,
    preferScenic: false
};
let recognition: any | null = null;
let isListening = false;
let activeVoiceButton: HTMLElement | null = null;
let baseLayers: { [key: string]: L.TileLayer } = {};
let currentBaseLayer: L.TileLayer | null = null;
let lastLightBaseLayer = 'streets'; // To remember the last used light theme map
let cameraStream: MediaStream | null = null;
let isFrontCamera = false; // For the new Live Cam feature
let isAnalyzingCamera = false;
let analysisIntervalId: number | null = null;
let isAnalysisAPICallRunning = false;


// User Authentication State
type UserRole = 'user' | 'admin' | 'superadmin';
interface User {
    email: string;
    role: UserRole;
    avatar?: string;
}
let currentUser: User | null = null;

// Mock User Database
const mockUsers: User[] = [
    { email: 'user@example.com', role: 'user' },
    { email: 'admin@example.com', role: 'admin' },
    { email: 'super@example.com', role: 'superadmin' }
];

// =================================================================================
// Internationalization (i18n)
// =================================================================================
const englishTranslations = {
    app_subtitle: "Your Smart Road Companion",
    gps_searching: "GPS Status: Searching...",
    profile: "Profile",
    alert_ask_ai: "Ask AI",
    alert_dismiss: "Dismiss Alert",
    route_preferences: "Route Preferences",
    prefer_highways: "Prefer Highways",
    avoid_tolls: "Avoid Tolls",
    prefer_scenic_route: "Prefer Scenic Route",
    app_settings: "App Settings",
    language: "Language",
    dark_mode: "Dark Mode",
    toggle_dark_mode: "Toggle dark mode",
    ai_voice_response: "AI Voice Response",
    layers: "Data Layers",
    roads: "Roads",
    pois: "Points of Interest",
    incidents: "Live Alerts",
    center_location: "Center on my location",
    display_panel_title: "Nearby Information",
    no_items_found: "No items found.",
    route_finder: "Route Finder",
    from: "From",
    from_placeholder: "Start location",
    to: "To",
    to_placeholder: "Destination",
    find_route_btn: "Find Optimal Route",
    get_directions: "Get Directions",
    calculating_route: "Calculating...",
    share_route: "Share Route",
    clear_route_btn: "Clear Route",
    ai_chat_title: "AI Assistant",
    ai_chat_placeholder: "Type a message...",
    close_chat: "Close Chat",
    use_microphone: "Use microphone",
    stop_listening: "Stop listening",
    send_message: "Send Message",
    select_mode: "Select Mode",
    mode_driving: "Driving",
    mode_riding: "Riding",
    mode_exploring: "Exploring",
    mode_connect: "Connect",
    close: "Close",
    error_both_locations: "Please enter both a start and destination.",
    error_location_not_found: "Could not find one or both locations. Please use exact names from the list.",
    error_no_route: "The AI could not determine a route. Please try different locations or preferences.",
    error_no_geometry: "Could not find geometric data for the suggested route. Please check the data source.",
    error_generic_route: "An error occurred while finding the route. Please try again.",
    route_success_message: "Route from {fromName} to {toName} displayed.",
    route_start: "Start",
    route_destination: "Destination",
    status_good_condition: "Good condition",
    status_maintenance: "Under maintenance",
    status_open_247: "Open 24/7",
    status_open: "Open",
    status_incident: "Incident",
    status_resumed: "Resumed",
    status_one_lane: "One-Lane",
    status_blocked: "Blocked",
    fuel_low_alert: "Fuel level is critically low. I can search for nearby petrol stations.",
    pressure_low_alert: "Tire pressure is low. I can find the nearest repair shop for you.",
    planning_route: "Okay, planning a route from {start} to {end}.",
    ai_connection_error: "Sorry, I'm having trouble connecting right now.",
    map_style_streets: "Streets",
    map_style_satellite: "Satellite",
    map_style_terrain: "Terrain",
    map_style_dark: "Dark",
    lang_cat_international: "International",
    lang_cat_national: "National",
    route_details_distance: "Distance",
    route_details_time: "Est. Time",
    route_details_directions: "Directions",
    start_navigation: "Start Navigation",
    swap_locations: "Swap locations",
    error_email_not_registered: "This email is not registered.",
    error_invalid_otp: "Invalid OTP. Please try again.",
    error_user_not_found: "An error occurred. User not found.",
    error_geolocation_permission: "Location permission denied. Please enable it in your browser settings.",
    error_geolocation_unavailable: "Could not determine your location. Please check your connection and try again.",
    error_no_user_location: "Your current location is not available. Cannot find the nearest starting point.",
    language_proposal: "It looks like you're speaking {language}. Would you like to switch the app to {language}?",
    route_copied_toast: "Route copied to clipboard!",
    error_copy_route: "Failed to copy route.",
    voice_input_start: "Use voice for start location",
    voice_input_end: "Use voice for destination",
    view_on_gmaps: "View on Google Maps",
    error_gmaps_link_incomplete_route: "Cannot generate map link: route is not fully defined.",
    error_speech_recognition_unsupported: "Speech Recognition is not supported in this browser.",
    error_speech_no_speech: "No speech was detected. Please try again.",
    error_speech_audio_capture: "Could not start audio capture. Please check your microphone.",
    error_speech_not_allowed: "Microphone access was denied. Please enable it in your browser settings.",
    error_speech_network: "A network error occurred during speech recognition.",
    error_speech_generic: "An unknown speech recognition error occurred.",
    route_options_title: "Route Options",
    select_route: "Select Route",
    admin_ip_cam_url_saved: "IP Camera URL saved.",
};

const spanishTranslations = {
    app_subtitle: "Tu Compañero Inteligente de Carretera",
    gps_searching: "Estado GPS: Buscando...",
    profile: "Perfil",
    alert_ask_ai: "Preguntar a la IA",
    alert_dismiss: "Descartar",
    route_preferences: "Preferencias de Ruta",
    prefer_highways: "Preferir Autopistas",
    avoid_tolls: "Evitar Peajes",
    prefer_scenic_route: "Preferir Ruta Panorámica",
    app_settings: "Ajustes de la App",
    language: "Idioma",
    dark_mode: "Modo Oscuro",
    toggle_dark_mode: "Activar modo oscuro",
    ai_voice_response: "Respuesta de Voz de IA",
    layers: "Capas de Datos",
    roads: "Carreteras",
    pois: "Puntos de Interés",
    incidents: "Alertas en Vivo",
    center_location: "Centrar en mi ubicación",
    display_panel_title: "Información Cercana",
    no_items_found: "No se encontraron elementos.",
    route_finder: "Buscador de Rutas",
    from: "Desde",
    from_placeholder: "Lugar de inicio",
    to: "Hasta",
    to_placeholder: "Destino",
    find_route_btn: "Encontrar Ruta Óptima",
    get_directions: "Obtener Direcciones",
    calculating_route: "Calculando...",
    share_route: "Compartir Ruta",
    clear_route_btn: "Borrar Ruta",
    ai_chat_title: "Asistente de IA",
    ai_chat_placeholder: "Escribe un mensaje...",
    close_chat: "Cerrar Chat",
    use_microphone: "Usar micrófono",
    stop_listening: "Dejar de escuchar",
    send_message: "Enviar Mensaje",
    select_mode: "Seleccionar Modo",
    mode_driving: "Conduciendo",
    mode_riding: "En Moto",
    mode_exploring: "Explorando",
    mode_connect: "Conectar",
    close: "Cerrar",
    error_both_locations: "Por favor, introduce un origen y un destino.",
    error_location_not_found: "No se pudo encontrar una o ambas ubicaciones. Por favor, usa nombres exactos de la lista.",
    error_no_route: "La IA no pudo determinar una ruta. Por favor, prueba con diferentes ubicaciones o preferencias.",
    error_no_geometry: "No se pudieron encontrar datos geométricos para la ruta sugerida. Por favor, comprueba la fuente de datos.",
    error_generic_route: "Ocurrió un error al buscar la ruta. Por favor, inténtalo de nuevo.",
    route_success_message: "Ruta de {fromName} a {toName} mostrada.",
    route_start: "Inicio",
    route_destination: "Destino",
    status_good_condition: "Buen estado",
    status_maintenance: "En mantenimiento",
    status_open_247: "Abierto 24/7",
    status_open: "Abierto",
    status_incident: "Incidente",
    status_resumed: "Reanudado",
    status_one_lane: "Un Carril",
    status_blocked: "Bloqueado",
    fuel_low_alert: "El nivel de combustible es críticamente bajo. Puedo buscar gasolineras cercanas.",
    pressure_low_alert: "La presión de los neumáticos es baja. Puedo encontrar el taller de reparación más cercano para ti.",
    planning_route: "De acuerdo, planeando una ruta de {start} a {end}.",
    ai_connection_error: "Lo siento, tengo problemas para conectarme en este momento.",
    map_style_streets: "Calles",
    map_style_satellite: "Satélite",
    map_style_terrain: "Terreno",
    map_style_dark: "Oscuro",
    lang_cat_international: "Internacional",
    lang_cat_national: "Nacional",
    route_details_distance: "Distancia",
    route_details_time: "Tiempo Est.",
    route_details_directions: "Direcciones",
    start_navigation: "Iniciar Navegación",
    swap_locations: "Invertir ubicaciones",
    error_email_not_registered: "Este correo no está registrado.",
    error_invalid_otp: "OTP inválido. Por favor, inténtalo de nuevo.",
    error_user_not_found: "Ocurrió un error. Usuario no encontrado.",
    error_geolocation_permission: "Permiso de ubicación denegado. Por favor, actívalo en los ajustes de tu navegador.",
    error_geolocation_unavailable: "No se pudo determinar tu ubicación. Por favor, comprueba tu conexión e inténtalo de nuevo.",
    error_no_user_location: "Tu ubicación actual no está disponible. No se puede encontrar el punto de partida más cercano.",
    language_proposal: "Parece que estás hablando {language}. ¿Te gustaría cambiar el idioma de la app a {language}?",
    route_copied_toast: "¡Ruta copiada al portapapeles!",
    error_copy_route: "Error al copiar la ruta.",
    voice_input_start: "Usar voz para origen",
    voice_input_end: "Usar voz para destino",
    view_on_gmaps: "Ver en Google Maps",
    error_gmaps_link_incomplete_route: "No se puede generar el enlace del mapa: la ruta no está completamente definida.",
    error_speech_recognition_unsupported: "El reconocimiento de voz no es compatible con este navegador.",
    error_speech_no_speech: "No se detectó voz. Por favor, inténtalo de nuevo.",
    error_speech_audio_capture: "No se pudo iniciar la captura de audio. Por favor, comprueba tu micrófono.",
    error_speech_not_allowed: "Se denegó el acceso al micrófono. Por favor, actívalo en la configuración de tu navegador.",
    error_speech_network: "Ocurrió un error de red durante el reconocimiento de voz.",
    error_speech_generic: "Ocurrió un error desconocido en el reconocimiento de voz.",
    route_options_title: "Opciones de Ruta",
    select_route: "Seleccionar Ruta",
    admin_ip_cam_url_saved: "URL de la cámara IP guardada.",
};

const frenchTranslations = {
    app_subtitle: "Votre Compagnon de Route Intelligent",
    gps_searching: "Statut GPS : Recherche...",
    profile: "Profil",
    alert_ask_ai: "Demander à l'IA",
    alert_dismiss: "Rejeter",
    route_preferences: "Préférences d'Itinéraire",
    prefer_highways: "Préférer les autoroutes",
    avoid_tolls: "Éviter les péages",
    prefer_scenic_route: "Préférer la route panoramique",
    app_settings: "Paramètres de l'App",
    language: "Langue",
    dark_mode: "Mode Sombre",
    toggle_dark_mode: "Activer le mode sombre",
    ai_voice_response: "Réponse Vocale de l'IA",
    layers: "Couches de Données",
    roads: "Routes",
    pois: "Points d'Intérêt",
    incidents: "Alertes en Direct",
    center_location: "Centrer sur ma position",
    display_panel_title: "Informations à Proximité",
    no_items_found: "Aucun élément trouvé.",
    route_finder: "Recherche d'Itinéraire",
    from: "De",
    from_placeholder: "Lieu de départ",
    to: "À",
    to_placeholder: "Destination",
    find_route_btn: "Trouver l'Itinéraire Optimal",
    get_directions: "Obtenir l'Itinéraire",
    calculating_route: "Calcul en cours...",
    share_route: "Partager l'itinéraire",
    clear_route_btn: "Effacer l'Itinéraire",
    ai_chat_title: "Assistant IA",
    ai_chat_placeholder: "Écrivez un message...",
    close_chat: "Fermer le Chat",
    use_microphone: "Utiliser le microphone",
    stop_listening: "Arrêter l'écoute",
    send_message: "Envoyer le Message",
    select_mode: "Sélectionner le Mode",
    mode_driving: "Conduite",
    mode_riding: "À Moto",
    mode_exploring: "Exploration",
    mode_connect: "Connecter",
    close: "Fermer",
    error_both_locations: "Veuillez saisir un point de départ et une destination.",
    error_location_not_found: "Un ou les deux lieux n'ont pas pu être trouvés. Veuillez utiliser les noms exacts de la liste.",
    error_no_route: "L'IA n'a pas pu déterminer d'itinéraire. Veuillez essayer d'autres lieux ou préférences.",
    error_no_geometry: "Impossible de trouver les données géométriques pour l'itinéraire suggéré. Veuillez vérifier la source des données.",
    error_generic_route: "Une erreur est survenue lors de la recherche de l'itinéraire. Veuillez réessayer.",
    route_success_message: "Itinéraire de {fromName} à {toName} affiché.",
    route_start: "Départ",
    route_destination: "Destination",
    status_good_condition: "Bon état",
    status_maintenance: "En maintenance",
    status_open_247: "Ouvert 24/7",
    status_open: "Ouvert",
    status_incident: "Incident",
    status_resumed: "Repris",
    status_one_lane: "Une Voie",
    status_blocked: "Bloqué",
    fuel_low_alert: "Le niveau de carburant est très bas. Je peux rechercher des stations-service à proximité.",
    pressure_low_alert: "La pression des pneus est basse. Je peux trouver le garage le plus proche pour vous.",
    planning_route: "D'accord, planification d'un itinéraire de {start} à {end}.",
    ai_connection_error: "Désolé, j'ai des difficultés à me connecter en ce moment.",
    map_style_streets: "Rues",
    map_style_satellite: "Satellite",
    map_style_terrain: "Terrain",
    map_style_dark: "Sombre",
    lang_cat_international: "International",
    lang_cat_national: "National",
    route_details_distance: "Distance",
    route_details_time: "Temps Est.",
    route_details_directions: "Directions",
    start_navigation: "Démarrer la Navigation",
    swap_locations: "Inverser les lieux",
    error_email_not_registered: "Cet e-mail n'est pas enregistré.",
    error_invalid_otp: "OTP invalide. Veuillez réessayer.",
    error_user_not_found: "Une erreur est survenue. Utilisateur non trouvé.",
    error_geolocation_permission: "Permission de localisation refusée. Veuillez l'activer dans les paramètres de votre navigateur.",
    error_geolocation_unavailable: "Impossible de déterminer votre position. Veuillez vérifier votre connexion et réessayer.",
    error_no_user_location: "Votre position actuelle n'est pas disponible. Impossible de trouver le point de départ le plus proche.",
    language_proposal: "Il semble que vous parlez {language}. Souhaitez-vous basculer l'application en {language} ?",
    route_copied_toast: "Itinéraire copié dans le presse-papiers !",
    error_copy_route: "Échec de la copie de l'itinéraire.",
    voice_input_start: "Utiliser la voix pour le départ",
    voice_input_end: "Utiliser la voix pour la destination",
    view_on_gmaps: "Voir sur Google Maps",
    error_gmaps_link_incomplete_route: "Impossible de générer le lien de la carte : l'itinéraire n'est pas entièrement défini.",
    error_speech_recognition_unsupported: "La reconnaissance vocale n'est pas prise en charge par ce navigateur.",
    error_speech_no_speech: "Aucune parole n'a été détectée. Veuillez réessayer.",
    error_speech_audio_capture: "Impossible de démarrer la capture audio. Veuillez vérifier votre microphone.",
    error_speech_not_allowed: "L'accès au microphone a été refusé. Veuillez l'activer dans les paramètres de votre navigateur.",
    error_speech_network: "Une erreur réseau est survenue lors de la reconnaissance vocale.",
    error_speech_generic: "Une erreur de reconnaissance vocale inconnue est survenue.",
    route_options_title: "Options d'Itinéraire",
    select_route: "Sélectionner l'Itinéraire",
    admin_ip_cam_url_saved: "URL de la caméra IP enregistrée.",
};

const nepaliTranslations = {
    app_subtitle: "तपाईंको स्मार्ट रोड साथी",
    gps_searching: "GPS स्थिति: खोजी गर्दै...",
    profile: "प्रोफाइल",
    alert_ask_ai: "AI लाई सोध्नुहोस्",
    alert_dismiss: "खारेज गर्नुहोस्",
    route_preferences: "मार्ग प्राथमिकताहरू",
    prefer_highways: "राजमार्गहरू प्राथमिकता दिनुहोस्",
    avoid_tolls: "टोलहरू बेवास्ता गर्नुहोस्",
    prefer_scenic_route: "रमणीय मार्ग प्राथमिकता दिनुहोस्",
    app_settings: "एप सेटिङहरू",
    language: "भाषा",
    dark_mode: "डार्क मोड",
    toggle_dark_mode: "डार्क मोड टगल गर्नुहोस्",
    ai_voice_response: "एआई आवाज प्रतिक्रिया",
    layers: "डाटा तहहरू",
    roads: "सडकहरू",
    pois: "चासोका ठाउँहरू",
    incidents: "प्रत्यक्ष अलर्टहरू",
    center_location: "मेरो स्थानमा केन्द्रित गर्नुहोस्",
    display_panel_title: "नजिकैको जानकारी",
    no_items_found: "कुनै वस्तु फेला परेन।",
    route_finder: "मार्ग खोजकर्ता",
    from: "बाट",
    from_placeholder: "सुरु स्थान",
    to: "सम्म",
    to_placeholder: "गन्तव्य",
    find_route_btn: "उत्तम मार्ग खोज्नुहोस्",
    get_directions: "निर्देशनहरू पाउनुहोस्",
    calculating_route: "गणना गर्दै...",
    share_route: "मार्ग साझा गर्नुहोस्",
    clear_route_btn: "मार्ग हटाउनुहोस्",
    ai_chat_title: "एआई सहायक",
    ai_chat_placeholder: "सन्देश टाइप गर्नुहोस्...",
    close_chat: "च्याट बन्द गर्नुहोस्",
    use_microphone: "माइक्रोफोन प्रयोग गर्नुहोस्",
    stop_listening: "सुन्न बन्द गर्नुहोस्",
    send_message: "सन्देश पठाउनुहोस्",
    select_mode: "मोड चयन गर्नुहोस्",
    mode_driving: "ड्राइभिङ",
    mode_riding: "राइडिङ",
    mode_exploring: "अन्वेषण",
    mode_connect: "जडान",
    close: "बन्द गर्नुहोस्",
    error_both_locations: "कृपया सुरु र गन्तव्य दुवै स्थानहरू प्रविष्ट गर्नुहोस्।",
    error_location_not_found: "एक वा दुबै स्थानहरू फेला पार्न सकिएन। कृपया सूचीबाट सही नामहरू प्रयोग गर्नुहोस्।",
    error_no_route: "एआईले मार्ग निर्धारण गर्न सकेन। कृपया फरक स्थानहरू वा प्राथमिकताहरू प्रयास गर्नुहोस्।",
    error_no_geometry: "सुझाव गरिएको मार्गको लागि ज्यामितीय डाटा फेला पार्न सकिएन। कृपया डाटा स्रोत जाँच गर्नुहोस्।",
    error_generic_route: "मार्ग खोज्दा त्रुटि भयो। कृपया फेरि प्रयास गर्नुहोस्।",
    route_success_message: "{fromName} देखि {toName} सम्मको मार्ग देखाइयो।",
    route_start: "सुरु",
    route_destination: "गन्तव्य",
    status_good_condition: "राम्रो अवस्था",
    status_maintenance: "मर्मत अन्तर्गत",
    status_open_247: "२४/७ खुला",
    status_open: "खुला",
    status_incident: "घटना",
    status_resumed: "सुचारु",
    status_one_lane: "एक-लेन",
    status_blocked: "अवरुद्ध",
    fuel_low_alert: "इन्धनको स्तर एकदमै कम छ। म नजिकैको पेट्रोल स्टेशनहरू खोज्न सक्छु।",
    pressure_low_alert: "टायर प्रेसर कम छ। म तपाईंको लागि नजिकैको मर्मत पसल फेला पार्न सक्छु।",
    planning_route: "ठीक छ, {start} देखि {end} सम्मको मार्ग योजना गर्दै।",
    ai_connection_error: "माफ गर्नुहोस्, मलाई अहिले जडान गर्न समस्या भइरहेको छ।",
    map_style_streets: "सडकहरू",
    map_style_satellite: "स्याटेलाइट",
    map_style_terrain: "भू-भाग",
    map_style_dark: "डार्क",
    lang_cat_international: "अन्तर्राष्ट्रिय",
    lang_cat_national: "राष्ट्रिय",
    route_details_distance: "दूरी",
    route_details_time: "अनुमानित समय",
    route_details_directions: "निर्देशनहरू",
    start_navigation: "नेभिगेसन सुरु गर्नुहोस्",
    swap_locations: "स्थानहरू बदल्नुहोस्",
    error_email_not_registered: "यो इमेल दर्ता गरिएको छैन।",
    error_invalid_otp: "अमान्य OTP। कृपया फेरि प्रयास गर्नुहोस्।",
    error_user_not_found: "एक त्रुटि भयो। प्रयोगकर्ता फेला परेन।",
    error_geolocation_permission: "स्थान अनुमति अस्वीकार गरियो। कृपया आफ्नो ब्राउजर सेटिङहरूमा सक्षम गर्नुहोस्।",
    error_geolocation_unavailable: "तपाईंको स्थान निर्धारण गर्न सकिएन। कृपया आफ्नो जडान जाँच गर्नुहोस् र फेरि प्रयास गर्नुहोस्।",
    error_no_user_location: "तपाईंको हालको स्थान उपलब्ध छैन। नजिकको सुरूवात बिन्दु फेला पार्न सकिँदैन।",
    language_proposal: "तपाईं {language} बोल्दै हुनुहुन्छ जस्तो छ। के तपाईं एपलाई {language} मा स्विच गर्न चाहनुहुन्छ?",
    route_copied_toast: "मार्ग क्लिपबोर्डमा प्रतिलिपि गरियो!",
    error_copy_route: "मार्ग प्रतिलिपि गर्न असफल भयो।",
    voice_input_start: "सुरु स्थानको लागि आवाज प्रयोग गर्नुहोस्",
    voice_input_end: "गन्तव्यको लागि आवाज प्रयोग गर्नुहोस्",
    view_on_gmaps: "Google नक्सामा हेर्नुहोस्",
    error_gmaps_link_incomplete_route: "नक्सा लिङ्क उत्पन्न गर्न सकिँदैन: मार्ग पूर्ण रूपमा परिभाषित छैन।",
    error_speech_recognition_unsupported: "यस ब्राउजरमा वाक् पहिचान समर्थित छैन।",
    error_speech_no_speech: "कुनै आवाज फेला परेन। कृपया फेरि प्रयास गर्नुहोस्।",
    error_speech_audio_capture: "अडियो क्याप्चर सुरु गर्न सकिएन। कृपया आफ्नो माइक्रोफोन जाँच गर्नुहोस्।",
    error_speech_not_allowed: "माइक्रोफोन पहुँच अस्वीकार गरियो। कृपया आफ्नो ब्राउजर सेटिङहरूमा सक्षम गर्नुहोस्।",
    error_speech_network: "वाक् पहिचानको क्रममा नेटवर्क त्रुटि भयो।",
    error_speech_generic: "एक अज्ञात वाक् पहिचान त्रुटि भयो।",
    route_options_title: "मार्ग विकल्पहरू",
    select_route: "मार्ग चयन गर्नुहोस्",
    admin_ip_cam_url_saved: "आईपी क्यामेरा URL सुरक्षित गरियो।",
};

const translations: { [key: string]: any } = {
    en: englishTranslations,
    es: spanishTranslations,
    fr: frenchTranslations,
    de: englishTranslations, // Placeholder
    it: englishTranslations, // Placeholder
    zh: englishTranslations, // Placeholder
    ja: englishTranslations, // Placeholder
    ko: englishTranslations, // Placeholder
    ar: englishTranslations, // Placeholder
    ru: englishTranslations, // Placeholder
    hi: englishTranslations, // Placeholder
    np: nepaliTranslations,
    mth: nepaliTranslations, // Placeholder
    bjp: nepaliTranslations, // Placeholder
    th: nepaliTranslations,  // Placeholder
    tm: nepaliTranslations,  // Placeholder
    new: nepaliTranslations, // Placeholder
    mg: nepaliTranslations,  // Placeholder
    dot: nepaliTranslations  // Placeholder
};

const synthesisLangCodeMap: { [key: string]: string } = {
    en: 'en-US', es: 'es-ES', fr: 'fr-FR', de: 'de-DE', it: 'it-IT',
    zh: 'zh-CN', ja: 'ja-JP', ko: 'ko-KR', ar: 'ar-SA', ru: 'ru-RU',
    hi: 'hi-IN', np: 'ne-NP', mth: 'ne-NP', bjp: 'ne-NP', th: 'ne-NP',
    tm: 'ne-NP', new: 'ne-NP', mg: 'ne-NP', dot: 'ne-NP'
};

const langCodeToNameMap: { [key: string]: string } = {
    'en': 'English', 'es': 'Spanish', 'fr': 'French', 'de': 'German', 'it': 'Italian',
    'zh': 'Chinese', 'ja': 'Japanese', 'ko': 'Korean', 'ar': 'Arabic', 'ru': 'Russian',
    'hi': 'Hindi', 'np': 'Nepali', 'mth': 'Maithili', 'bjp': 'Bhojpuri', 'th': 'Tharu',
    'tm': 'Tamang', 'new': 'Newar', 'mg': 'Magar', 'dot': 'Doteli'
};


/**
 * Translates a key into the current language.
 * @param key The key to translate.
 * @param replacements An object of replacements for placeholders.
 * @returns The translated string.
 */
function translate(key: string, replacements: { [key: string]: string } = {}): string {
    let text = translations[currentLang]?.[key] || translations['en'][key] || key;
    for (const placeholder in replacements) {
        text = text.replace(`{${placeholder}}`, replacements[placeholder]);
    }
    return text;
}

/**
 * Updates all UI text based on the current language.
 */
function updateUIText() {
    console.log(`Updating UI text for language: ${currentLang}`);
    document.querySelectorAll('[data-lang-key]').forEach(element => {
        const key = element.getAttribute('data-lang-key')!;
        (element as HTMLElement).innerText = translate(key);
    });
    document.querySelectorAll('[data-lang-key-placeholder]').forEach(element => {
        const key = element.getAttribute('data-lang-key-placeholder')!;
        (element as HTMLInputElement).placeholder = translate(key);
    });
    document.querySelectorAll('[data-lang-key-title]').forEach(element => {
        const key = element.getAttribute('data-lang-key-title')!;
        (element as HTMLElement).title = translate(key);
    });
    document.querySelectorAll('[data-lang-key-aria-label]').forEach(element => {
        const key = element.getAttribute('data-lang-key-aria-label')!;
        element.setAttribute('aria-label', translate(key));
    });

    // Special case for the active mode button label
    const appModeBtnLabel = document.querySelector('#app-mode-btn .label');
    if (appModeBtnLabel) {
        const modeKey = `mode_${currentAppMode}`;
        appModeBtnLabel.setAttribute('data-lang-key', modeKey);
        appModeBtnLabel.textContent = translate(modeKey);
    }
}

/**
 * Changes the application's language.
 * @param langCode The language code to switch to.
 */
function changeLanguage(langCode: string) {
    if (translations[langCode]) {
        currentLang = langCode;
        document.documentElement.lang = langCode;
        localStorage.setItem('preferredLang', langCode);
        console.log(`Language changed to ${langCode}`);

        // Update active class on language options
        document.querySelectorAll('.lang-option').forEach(btn => {
            btn.classList.toggle('active', btn.getAttribute('data-lang') === langCode);
        });

        updateUIText();
        // Re-initialize the AI with the new language context
        initAI();
    }
}


// =================================================================================
// Map Initialization & Functions
// =================================================================================
function initMap() {
    map = L.map('map', {
        center: [28.3949, 84.1240], // Center of Nepal
        zoom: 7,
        zoomControl: false, // We are using custom controls
        maxBounds: nepalBounds, // --- NEW: Constrain map view
        minZoom: 7, // --- NEW: Prevent zooming out too far
    });

    baseLayers = {
        'streets': L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        }),
        'satellite': L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
            attribution: 'Tiles &copy; Esri'
        }),
        'terrain': L.tileLayer('https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png', {
            attribution: 'Map data: &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, <a href="http://viewfinderpanoramas.org">SRTM</a> | Map style: &copy; <a href="https://opentopomap.org">OpenTopoMap</a> (<a href="https://creativecommons.org/licenses/by-sa/3.0/">CC-BY-SA</a>)'
        }),
        'dark': L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
        })
    };

    currentBaseLayer = baseLayers['streets'];
    currentBaseLayer.addTo(map);

    // --- NEW: Add Nepal border highlight layer ---
    L.geoJSON(NEPAL_BORDER_GEOJSON, {
        style: {
            className: 'nepal-border' // Use CSS for styling
        }
    }).addTo(map);

    poisLayer = L.featureGroup().addTo(map);
    alertsLayer = L.featureGroup().addTo(map);
    roadsLayer = L.geoJSON(undefined, {
        style: (feature) => {
            switch (feature?.properties.status) {
                case 'Resumed': return { color: "#2ecc71", weight: 4, opacity: 0.8 }; // Green
                case 'One-Lane': return { color: "#f39c12", weight: 4, opacity: 0.8, dashArray: '8, 8' }; // Orange, dashed
                case 'Blocked': return { color: "#e74c3c", weight: 6, opacity: 0.9 }; // Red, thick
                default: return { color: "#95a5a6", weight: 3, opacity: 0.7 }; // Grey for unknown
            }
        },
        onEachFeature: (feature, layer) => {
            if (feature.properties && feature.properties.name) {
                const statusKey = `status_${feature.properties.status.toLowerCase().replace('-', '_')}`;
                const statusText = translate(statusKey);
                const roadCode = feature.properties.code || 'N/A';
                const popupContent = `
                    <div class="custom-popup">
                        <h3 class="popup-title">${feature.properties.name}</h3>
                        <p class="popup-subtitle">Code: ${roadCode}</p>
                        <p class="popup-status">Status: ${statusText || feature.properties.status}</p>
                    </div>
                `;
                layer.bindPopup(popupContent);
            }
        }
    }).addTo(map);

    updateUserLocation();
}

function updateUserLocation() {
    const gpsIndicator = document.getElementById('gps-status-indicator')!;
    gpsIndicator.classList.add('searching');

    navigator.geolocation.watchPosition(position => {
        const { latitude, longitude } = position.coords;
        const latLng: L.LatLng = L.latLng(latitude, longitude);

        if (userMarker) {
            userMarker.setLatLng(latLng);
        } else {
            const userIcon = L.divIcon({
                html: `<span class="material-icons">navigation</span>`,
                className: 'user-marker-icon',
                iconSize: [36, 36],
                iconAnchor: [18, 18]
            });
            userMarker = L.marker(latLng, { icon: userIcon }).addTo(map);
        }

        gpsIndicator.classList.remove('searching', 'lost');
        gpsIndicator.classList.add('connected');

        if (!map.getBounds().contains(latLng)) {
            map.panTo(latLng);
        }
    }, error => {
        console.error(`Geolocation error (${error.code}): ${error.message}`);
        gpsIndicator.classList.remove('searching', 'connected');
        gpsIndicator.classList.add('lost');
        // Correction: Show user-friendly toast notification for geolocation errors
        let userMessageKey = 'error_geolocation_unavailable';
        if (error.code === 1) { // PERMISSION_DENIED
            userMessageKey = 'error_geolocation_permission';
        }
        showToast(translate(userMessageKey), 'error');
    }, {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0
    });
}

// =================================================================================
// Data Fetching and Display
// =================================================================================

async function fetchAndDisplayData() {
    try {
        // Fetch all data sources concurrently.
        const [roadGeometries, roadStatuses, pois, incidents] = await Promise.all([
            api.getRoadGeometries(),
            api.getRoadStatuses(),
            api.getPOIs(),
            api.getIncidents()
        ]);
        
        // --- DATA MERGE LOGIC ---
        // Create a lookup map of live statuses from the official data source.
        const liveStatusMap = new Map<string, string>();
        if (roadStatuses && Array.isArray(roadStatuses.features)) {
            roadStatuses.features.forEach((statusFeature: any) => {
                const highwayName = statusFeature.properties.highwayName;
                const status = statusFeature.properties.status;
                if (highwayName && status) {
                    // If multiple statuses for one highway, the last one wins.
                    liveStatusMap.set(highwayName, status);
                }
            });
        }

        // Create a new GeoJSON object with the live statuses merged into the road geometries.
        // This makes the road colors reflect the live data.
        const updatedGeometries = JSON.parse(JSON.stringify(roadGeometries)); // Deep copy to prevent mutation
        updatedGeometries.features.forEach((feature: any) => {
            const roadName = feature.properties.name;
            if (liveStatusMap.has(roadName)) {
                feature.properties.status = liveStatusMap.get(roadName);
            }
        });
        
        allRoadsData = updatedGeometries; // Use the merged data for AI routing and display.

        // Transform live status points into a format for the alerts/markers layer.
        // We still want to display these as clickable points with detailed popups.
        const liveStatusPois = roadStatuses.features.map((f: any) => ({
            id: `status-${f.properties.code}`,
            name: f.properties.name,
            lat: f.geometry.coordinates[1],
            lng: f.geometry.coordinates[0],
            type: 'incident',
            status_key: `status_${f.properties.status.toLowerCase()}`,
            category: 'road_status',
            fullDetails: f.properties
        }));
        
        allPois = pois;
        allIncidents = [...incidents, ...liveStatusPois];
        
        // Populate the optimized lookup map for quick searches.
        allItemsMap.clear();
        [...allPois, ...allIncidents].forEach(item => {
            allItemsMap.set(item.name.toLowerCase(), item);
        });

        // Add the updated road geometries to the map. Leaflet will style them based on the new status.
        roadsLayer.clearLayers().addData(updatedGeometries);
        
        updateDisplayedItems(); // Display all POIs and incident/status markers.

        // Populate route finder datalist with all available locations.
        const datalist = document.getElementById('locations-datalist') as HTMLDataListElement;
        datalist.innerHTML = '';
        const locationNames = new Set([...allPois, ...allIncidents].map(item => item.name));
        locationNames.forEach(name => {
            const option = document.createElement('option');
            option.value = name;
            datalist.appendChild(option);
        });

        setupDynamicFilters();

    } catch (error) {
        console.error("Failed to fetch map data:", error);
        showToast("Failed to load map data. Please try refreshing.", "error");
    }
}


function setupDynamicFilters() {
    const filtersContainer = document.getElementById('display-panel-filters')!;
    const allItems = [...allPois, ...allIncidents];
    const categories = new Set(allItems.map(item => item.category));

    let filterButtonsHTML = `<button class="filter-btn active" data-filter="all" title="All"><span class="material-icons">apps</span></button>`;

    const categoryIcons: { [key: string]: string } = {
        'landmark': 'account_balance', 'bridge': 'emergency', 'hospital': 'local_hospital',
        'coffee': 'local_cafe', 'shopping': 'shopping_cart', 'traffic': 'traffic',
        'construction': 'construction', 'restaurant': 'restaurant', 'atm': 'atm',
        'fuel': 'local_gas_station', 'police': 'local_police', 'poi': 'place', 'incident': 'warning',
        'road_status': 'info' // New category
    };

    categories.forEach(category => {
        const icon = categoryIcons[category] || 'place';
        const title = category.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase());
        filterButtonsHTML += `<button class="filter-btn" data-filter="${category}" title="${title}"><span class="material-icons">${icon}</span></button>`;
    });

    filtersContainer.innerHTML = filterButtonsHTML;

    filtersContainer.querySelectorAll('.filter-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            filtersContainer.querySelector('.filter-btn.active')?.classList.remove('active');
            btn.classList.add('active');
            const filter = btn.getAttribute('data-filter')!;
            filterAndDisplayItems(filter);
        });
    });
}


function updateDisplayedItems() {
    poisLayer.clearLayers();
    alertsLayer.clearLayers();

    const allItems = [...allPois, ...allIncidents];

    allItems.forEach(item => {
        const icon = createMapIcon(item.category);
        const marker = L.marker([item.lat, item.lng], { icon: icon });
        (marker as any).itemId = item.id; // Attach our app-specific ID for easy lookups
        
        let popupContent;
        // Create a richer popup for the live road status markers
        if (item.category === 'road_status') {
            const details = item.fullDetails;
            popupContent = `
                <div class="custom-popup">
                    <h3 class="popup-title">${details.name}</h3>
                    <p class="popup-subtitle">Section: ${details.section || 'N/A'}</p>
                    <p class="popup-status">Status: ${translate(item.status_key)} (Cause: ${details.cause || 'N/A'})</p>
                    <p class="popup-description">${details.description || 'No additional details.'}</p>
                    <p class="popup-contact">Contact: ${details.contactName || 'N/A'} (${details.contactNumber || 'N/A'})</p>
                </div>
            `;
        } else {
            // Standard popup for other POIs
            popupContent = `
                <div class="custom-popup">
                    <h3 class="popup-title">${item.name}</h3>
                    <p class="popup-status">${translate(item.status_key)}</p>
                    <button class="popup-directions-btn" data-name="${item.name}">
                        <span class="material-icons">directions</span>
                        <span>${translate('get_directions')}</span>
                    </button>
                </div>
            `;
        }
        marker.bindPopup(popupContent);
        
        // Associate item ID with the marker's DOM element for highlighting
        marker.on('add', () => {
            (marker.getElement() as HTMLElement).dataset.itemId = String(item.id);
        });

        if (item.type === 'poi' || item.type === 'bridge') {
            poisLayer.addLayer(marker);
        } else if (item.type === 'incident') {
            alertsLayer.addLayer(marker);
        }
    });

    filterAndDisplayItems('all'); // Display all items initially
}

function filterAndDisplayItems(filter: string) {
    const listElement = document.getElementById('display-panel-list')!;
    listElement.innerHTML = '';

    const itemsToShow = (filter === 'all')
        ? [...allPois, ...allIncidents]
        : [...allPois, ...allIncidents].filter(item => item.category === filter);

    if (itemsToShow.length === 0) {
        listElement.innerHTML = `<p style="padding: 1rem; text-align: center;">${translate('no_items_found')}</p>`;
        return;
    }
    
    // Sort alphabetically by name
    itemsToShow.sort((a, b) => a.name.localeCompare(b.name));

    itemsToShow.forEach(item => {
        const card = document.createElement('div');
        card.className = 'info-card';
        card.dataset.itemId = String(item.id);
        card.innerHTML = `
            <h3>${item.name}</h3>
            <p>${translate(item.status_key)}</p>
        `;
        card.addEventListener('click', () => panToItem(item));
        
        // Add hover listeners for highlighting
        card.addEventListener('mouseenter', () => highlightMarker(item.id, true));
        card.addEventListener('mouseleave', () => highlightMarker(item.id, false));
        
        listElement.appendChild(card);
    });
}

function highlightMarker(itemId: number | string, shouldHighlight: boolean) {
    const markerElement = document.querySelector(`.leaflet-marker-icon[data-item-id="${itemId}"]`) as HTMLElement;
    if (markerElement) {
        markerElement.classList.toggle('map-marker-highlight', shouldHighlight);
    }
}


/**
 * Pans and zooms the map to a specific item and opens its popup.
 * This is triggered by clicking an item in the side panel.
 * @param item The POI or incident object to focus on.
 */
function panToItem(item: any) {
    map.flyTo([item.lat, item.lng], 16);

    // Determine which layer group the item belongs to.
    const targetLayer = (item.type === 'poi' || item.type === 'bridge') ? poisLayer : alertsLayer;

    // Iterate through the layers to find the matching marker by its unique ID.
    targetLayer.eachLayer((layer: any) => {
        // Refactored: Use a robust ID match instead of fragile coordinate comparison.
        // The `itemId` custom property is attached when the marker is created.
        if (layer.itemId === item.id) {
            // A short delay ensures the flyTo animation is smooth before the popup opens.
            setTimeout(() => {
                layer.openPopup();
            }, 300); // 300ms delay to wait for pan animation
        }
    });
}

function createMapIcon(category: string): L.DivIcon {
    const icons: { [key: string]: string } = {
        'landmark': 'account_balance', 'bridge': 'emergency', 'hospital': 'local_hospital',
        'coffee': 'local_cafe', 'shopping': 'shopping_cart', 'traffic': 'traffic',
        'construction': 'construction', 'restaurant': 'restaurant', 'atm': 'atm',
        'fuel': 'local_gas_station', 'police': 'local_police', 'default': 'place',
        'road_status': 'info'
    };
    const colors: { [key: string]: string } = {
        'landmark': '#9b59b6', 'bridge': '#e74c3c', 'hospital': '#c0392b',
        'coffee': '#e67e22', 'shopping': '#3498db', 'traffic': '#f39c12',
        'construction': '#f1c40f', 'restaurant': '#16a085', 'atm': '#27ae60',
        'fuel': '#2c3e50', 'police': '#2980b9', 'default': '#7f8c8d',
        'road_status': '#8e44ad'
    };
    const iconName = icons[category] || icons['default'];
    const iconColor = colors[category] || colors['default'];

    const html = `
        <div class="icon-background" style="background-color: ${iconColor};">
            <span class="material-icons">${iconName}</span>
        </div>
    `;

    return L.divIcon({
        html: html,
        className: 'custom-map-icon',
        iconSize: [36, 36],
        iconAnchor: [18, 18],
        popupAnchor: [0, -20]
    });
}

// =================================================================================
// AI & Persona Functions
// =================================================================================
function loadPersona() {
    const avatarPreview = document.getElementById('persona-avatar-preview') as HTMLImageElement;
    const nameInput = document.getElementById('persona-name-input') as HTMLInputElement;
    const descInput = document.getElementById('persona-desc-input') as HTMLTextAreaElement;
    const chatAvatar = document.getElementById('chat-ai-avatar') as HTMLImageElement;
    const chatName = document.getElementById('chat-ai-name') as HTMLElement;

    const savedAvatar = localStorage.getItem('aiAvatar');
    const savedName = localStorage.getItem('aiName') || 'Sadak Sathi';
    const savedDesc = localStorage.getItem('aiPersonaDesc') || `You are a warm, knowledgeable, and slightly formal AI assistant, modeled after a caring French father in his 50s showing his family around a new country. Your name is Jean-Pierre. You are patient, protective, and find joy in explaining details. Your primary goal is to ensure the user's journey is safe, efficient, and interesting. Address the user with a respectful and friendly tone.`;

    if (savedAvatar) {
        avatarPreview.src = savedAvatar;
        chatAvatar.src = savedAvatar;
    }
    nameInput.value = savedName;
    descInput.value = savedDesc;
    chatName.textContent = savedName;

    // Set a default value if the description is empty on first load.
    if (!localStorage.getItem('aiPersonaDesc')) {
        localStorage.setItem('aiPersonaDesc', savedDesc);
    }
}

async function initAI() {
    const aiName = localStorage.getItem('aiName') || 'Sadak Sathi';
    const personaDesc = localStorage.getItem('aiPersonaDesc') || 'You are a helpful AI road co-pilot.';
    const systemInstruction = `${personaDesc}. Your name is ${aiName}. You are integrated into a map application called Sadak Sathi for driving in Nepal. Your current user interface language is ${currentLang} (${langCodeToNameMap[currentLang]}). All your text responses MUST be in this language. If the user speaks in a different language, respond in their language, then use the 'proposeLanguageSwitch' function to ask if they want to change the UI language. You have access to real-time data about roads, points of interest (POIs), and traffic incidents. You can also find routes for the user. Be helpful, concise, and proactive.`;

    const functionDeclarations: Tool[] = [
        {
            functionDeclarations: [
                {
                    name: "findRoute",
                    description: "Finds and displays the optimal route between two locations based on user preferences.",
                    parameters: {
                        type: Type.OBJECT,
                        properties: {
                            start: { type: Type.STRING, description: "The starting location, e.g., 'Maitighar Mandala'" },
                            end: { type: Type.STRING, description: "The destination location, e.g., 'Civil Mall'" },
                        },
                        required: ["start", "end"]
                    }
                },
                {
                    name: "proposeLanguageSwitch",
                    description: "Call this function when you detect the user is speaking a language different from the current UI language.",
                    parameters: {
                        type: Type.OBJECT,
                        properties: {
                            detectedLanguageCode: { type: Type.STRING, description: "The BCP-47 language code detected, e.g., 'fr', 'hi', 'np'" },
                        },
                        required: ["detectedLanguageCode"]
                    }
                }
            ]
        }
    ];

    try {
        activeChat = ai.chats.create({
            model: 'gemini-2.5-flash',
            config: {
                systemInstruction: systemInstruction,
                tools: functionDeclarations
            }
        });
        console.log("AI chat initialized with new persona and language:", currentLang);
    } catch (e) {
        console.error("Failed to initialize AI chat:", e);
        addMessageToChat(translate('ai_connection_error'), 'ai');
    }
}

async function handleAIChat(prompt: string, isFunctionResponse = false, functionResponseData: any = null) {
    if (!activeChat) {
        console.error("Chat not initialized.");
        addMessageToChat(translate('ai_connection_error'), 'ai');
        return;
    }

    const typingIndicator = document.querySelector('.typing-indicator') as HTMLElement;
    typingIndicator.classList.remove('hidden');
    document.getElementById('language-switch-proposal')?.classList.add('hidden');

    try {
        const response: GenerateContentResponse = isFunctionResponse
            ? await activeChat.sendMessage({ functionResponse: functionResponseData })
            : await activeChat.sendMessage({ message: prompt });
            
        typingIndicator.classList.add('hidden');
        
        if (response?.candidates?.[0]?.content?.parts?.[0]?.functionCall) {
            const functionCall = response.candidates[0].content.parts[0].functionCall;
            const { name, args } = functionCall;

            if (name === 'findRoute') {
                const fromInput = document.getElementById('from-input') as HTMLInputElement;
                const toInput = document.getElementById('to-input') as HTMLInputElement;
                fromInput.value = args.start as string;
                toInput.value = args.end as string;

                addMessageToChat(translate('planning_route', { start: args.start as string, end: args.end as string }), 'ai');
                speak(translate('planning_route', { start: args.start as string, end: args.end as string }));
                
                (document.getElementById('ai-chat-modal') as HTMLElement).classList.add('hidden');
                (document.getElementById('route-finder-panel') as HTMLElement).classList.remove('hidden');

                const success = await handleFindRoute(true);
                
                const functionResponse = {
                    name: "findRoute",
                    response: {
                        name: "findRoute",
                        content: { result: success ? "Route options found and displayed to the user." : "Failed to find any routes." },
                    },
                };
                await handleAIChat("", true, functionResponse as any);
            } else if (name === 'proposeLanguageSwitch') {
                const detectedCode = args.detectedLanguageCode as string;
                const proposalBanner = document.getElementById('language-switch-proposal')!;
                const proposalText = document.getElementById('language-proposal-text')!;
                
                if (langCodeToNameMap[detectedCode]) {
                    const languageName = langCodeToNameMap[detectedCode];
                    proposalText.textContent = translate('language_proposal', { language: languageName });
                    
                    (document.getElementById('confirm-lang-switch') as HTMLElement).dataset.lang = detectedCode;
                    proposalBanner.classList.remove('hidden');
                }
            }

        } else {
            const text = response.text;
            addMessageToChat(text, 'ai');
            speak(text);
        }

    } catch (error) {
        console.error("AI chat error:", error);
        typingIndicator.classList.add('hidden');
        addMessageToChat(translate('ai_connection_error'), 'ai');
    }
}

function addMessageToChat(text: string, sender: 'user' | 'ai') {
    const chatMessages = document.querySelector('.chat-messages') as HTMLElement;
    const messageDiv = document.createElement('div');
    messageDiv.classList.add('message', `${sender}-message`);
    messageDiv.textContent = text;
    chatMessages.appendChild(messageDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;
}


function speak(text: string) {
    if (!isVoiceResponseEnabled || !SpeechSynthesis || !isAudioUnlocked) return;
    SpeechSynthesis.cancel(); // Cancel any previous speech
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = synthesisLangCodeMap[currentLang] || 'en-US';
    SpeechSynthesis.speak(utterance);
}

/**
 * Toggles voice recognition for a given input field.
 * @param button The microphone button that was clicked.
 * @param targetInput The input element to populate with the transcript.
 * @param onResultCallback An optional callback to run after a result is successfully received.
 */
function toggleVoiceRecognition(button: HTMLElement, targetInput: HTMLInputElement, onResultCallback?: (transcript: string) => void) {
    if (!SpeechRecognition) {
        showToast(translate('error_speech_recognition_unsupported'), "error");
        return;
    }

    if (isListening && recognition) {
        recognition.stop();
        return;
    }

    recognition = new SpeechRecognition();
    recognition.lang = currentLang; // Use current app language for better accuracy
    recognition.interimResults = false;
    recognition.continuous = false;

    // Store original state to restore it later
    let originalAriaLabel: string | null = null;
    let originalIcon: string | null = null;
    const micIcon = button.querySelector('.material-icons');
    
    recognition.onstart = () => {
        isListening = true;
        activeVoiceButton = button;
        button.classList.add('listening');
        
        // Generalize UI feedback for any voice button
        if (micIcon) {
            originalIcon = micIcon.textContent;
            micIcon.textContent = 'mic_off';
        }
        originalAriaLabel = button.getAttribute('aria-label');
        button.setAttribute('aria-label', translate('stop_listening'));
    };

    recognition.onend = () => {
        isListening = false;
        if (activeVoiceButton) {
            activeVoiceButton.classList.remove('listening');
             // Generalize UI reset for any voice button
            if (micIcon && originalIcon) {
                micIcon.textContent = originalIcon;
            }
            if (originalAriaLabel) {
                activeVoiceButton.setAttribute('aria-label', originalAriaLabel);
            }
        }
        activeVoiceButton = null;
        recognition = null; // Clean up the instance
    };

    recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        targetInput.value = transcript;
        // Execute the callback if it exists
        if (onResultCallback) {
            onResultCallback(transcript);
        }
    };

    recognition.onerror = (event: any) => {
        console.error("Speech recognition error:", event.error);
        let errorKey = 'error_speech_generic';
        switch (event.error) {
            case 'no-speech':
                errorKey = 'error_speech_no_speech';
                break;
            case 'audio-capture':
                errorKey = 'error_speech_audio_capture';
                break;
            case 'not-allowed':
                errorKey = 'error_speech_not_allowed';
                break;
            case 'network':
                errorKey = 'error_speech_network';
                break;
        }
        showToast(translate(errorKey), 'error');
    };

    recognition.start();
}


// =================================================================================
// Route Finding
// =================================================================================
const routeAlternativesSchema = {
    type: Type.OBJECT,
    properties: {
        alternatives: {
            type: Type.ARRAY,
            description: "An array of up to 3 diverse route options.",
            items: {
                type: Type.OBJECT,
                properties: {
                    name: { type: Type.STRING, description: "A short, catchy name for the route (e.g., 'Fastest Route', 'Scenic Path', 'Toll-Free Way')." },
                    explanation: { type: Type.STRING, description: "A brief, user-friendly explanation of why this route is suggested, mentioning key benefits like speed, scenery, or cost." },
                    route: {
                        type: Type.ARRAY,
                        description: "An array of road names in sequential order for this route.",
                        items: { type: Type.STRING }
                    }
                },
                required: ["name", "explanation", "route"]
            }
        }
    },
    required: ["alternatives"]
};

async function handleFindRoute(calledFromAI = false) {
    const fromInput = document.getElementById('from-input') as HTMLInputElement;
    const toInput = document.getElementById('to-input') as HTMLInputElement;
    const loadingOverlay = document.querySelector('#route-finder-panel .loading-overlay') as HTMLElement;

    loadingOverlay.classList.remove('hidden');

    try {
        const fromName = fromInput.value.trim();
        const toName = toInput.value.trim();

        if (!fromName || !toName) {
            showToast(translate('error_both_locations'), 'error');
            return false;
        }

        const fromPOI = findPOIByName(fromName);
        const toPOI = findPOIByName(toName);

        if (!fromPOI || !toPOI) {
            showToast(translate('error_location_not_found'), 'error');
            return false;
        }

        const prefs = `User preferences: ${routePreferences.preferHighways ? "Prefer highways" : "No highway preference"}, ${routePreferences.avoidTolls ? "Avoid tolls" : "Tolls are acceptable"}, ${routePreferences.preferScenic ? "Prefer scenic routes" : "No scenic preference"}.`;
        const incidentsInfo = `Current traffic incidents (Waze-like data): ${JSON.stringify(allIncidents.map(i => ({ name: i.name, location: i.lat + ',' + i.lng, severity: i.severity, type: i.incidentType })))}.`;
        
        const prompt = `
CRITICAL INSTRUCTIONS: You are an expert route planning AI for Nepal, using official Department of Roads data. Your response MUST be a JSON object that strictly adheres to the provided schema.

Your task is to generate up to 3 route alternatives from "${fromName}" to "${toName}" using the live data provided below.

**DATA INTERPRETATION RULES - THIS IS MANDATORY:**
1.  **Road Status 'Blocked'**: This road is IMPASSABLE. You MUST NOT include any road with a 'Blocked' status in ANY route suggestion. This is a non-negotiable safety and logistics rule.
2.  **Road Status 'One-Lane'**: This road is open but has significantly reduced capacity, causing major delays. You MUST AVOID 'One-Lane' roads when calculating the 'Fastest Route'. They can be used for alternative routes, but you must state in the explanation that this road will be slow.
3.  **Road Status 'Resumed'**: This is a normal, fully operational road. These are the BEST roads to use and should be prioritized for all routes, especially the fastest one.

**ROUTE GENERATION RULES:**
1.  **The Fastest Route is Paramount**:
    - You MUST identify the single fastest route. This is your most important task.
    - This route MUST prioritize 'Resumed' roads, avoid 'One-Lane' roads, and avoid all 'Major' severity traffic incidents.
2.  **Generate Diverse Alternatives**:
    - After establishing the fastest route, you may generate up to two additional, distinct alternatives.
    - These alternatives can use 'One-Lane' roads (but never 'Blocked' roads) or cater to user preferences (e.g., scenic, avoid tolls).
3.  **MANDATORY Evidence-Based Explanations - Your response will be rejected if this is not followed:**
    - Every single route alternative in your response MUST have a clear, data-driven explanation. Do not use generic phrases.
    - **For the "Fastest Route"**:
        - The explanation is a mandatory report. It MUST explicitly name which major traffic incidents (from the provided data) it avoids.
        - It MUST state that it prioritizes 'Resumed' status roads for speed. For example: "This is the fastest option because it avoids the Major Jam on Ring Road and primarily uses the Prithvi Highway (H04), which currently has a 'Resumed' status."
    - **For Other Alternatives (e.g., Scenic, Toll-Free)**:
        - The explanation MUST clearly state the main benefit and connect it to the provided data or user preferences.
        - If the route is scenic and the user prefers scenic routes, state: "This route is suggested for its scenic value, aligning with your preference for scenic drives."
        - If the route avoids tolls and the user wants to avoid tolls, state: "This option avoids all tolls, as requested in your preferences."
        - If there is a trade-off, you MUST state it. For example: "This route is more direct but uses a 'One-Lane' section on the Araniko Highway, which may cause significant delays."

**PROVIDED DATA:**
1.  **User Preferences**: ${prefs}
2.  **Current Traffic Incidents**: ${incidentsInfo}
3.  **Available Roads & Their Live Status (with Official Codes)**: ${JSON.stringify(allRoadsData)}

Generate the JSON response now.
        `;
        
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: routeAlternativesSchema
            }
        });

        const result = JSON.parse(response.text);
        
        if (!result.alternatives || result.alternatives.length === 0) {
            showToast(translate('error_no_route'), 'error');
            return false;
        }
        
        displayRouteOptions(result.alternatives, fromPOI, toPOI);
        return true;

    } catch (error) {
        console.error("Error finding route alternatives:", error);
        showToast(translate('error_generic_route'), 'error');
        return false;
    } finally {
        loadingOverlay.classList.add('hidden');
    }
}

/**
 * Calculates distance and estimated travel time for a route.
 * @param coordinates An array of L.LatLng points.
 * @returns An object with distance in km and time in minutes.
 */
function calculateRouteMetrics(coordinates: L.LatLng[]): { distanceKm: number, timeMinutes: number } {
    let totalDistanceMeters = 0;
    if (coordinates.length > 1) {
        for (let i = 0; i < coordinates.length - 1; i++) {
            totalDistanceMeters += coordinates[i].distanceTo(coordinates[i + 1]);
        }
    }
    const distanceKm = totalDistanceMeters / 1000;

    // An average speed for varied routes in Nepal.
    const AVERAGE_SPEED_KMPH = 40; 
    const timeMinutes = Math.round((distanceKm / AVERAGE_SPEED_KMPH) * 60);

    return { distanceKm, timeMinutes };
}


function displayRouteOptions(alternatives: any[], fromPOI: any, toPOI: any) {
    const modal = document.getElementById('route-options-modal')!;
    const list = document.getElementById('route-options-list')!;
    list.innerHTML = '';

    alternatives.forEach(alt => {
        if (!alt.route || alt.route.length === 0) return; // Skip invalid alternatives

        const routeCoordinates: L.LatLng[] = [];
        alt.route.forEach((roadName: string) => {
            const roadFeature = allRoadsData.features.find((f: any) => f.properties.name === roadName);
            if (roadFeature) {
                roadFeature.geometry.coordinates.forEach((coord: number[]) => {
                    routeCoordinates.push(L.latLng(coord[1], coord[0]));
                });
            }
        });

        // --- REFACTORED: Use the new helper function ---
        const { distanceKm, timeMinutes } = calculateRouteMetrics(routeCoordinates);

        const card = document.createElement('div');
        card.className = 'route-option-card';
        
        // Use an icon based on the route name
        let icon = 'alt_route';
        if (alt.name.toLowerCase().includes('fast')) icon = 'bolt';
        if (alt.name.toLowerCase().includes('scenic')) icon = 'landscape';
        if (alt.name.toLowerCase().includes('toll')) icon = 'money_off';
        if (alt.name.toLowerCase().includes('avoid')) icon = 'shield';

        card.innerHTML = `
            <div class="route-option-header">
                <h4><span class="material-icons">${icon}</span> ${alt.name}</h4>
                <div class="route-option-details">
                    <span>${distanceKm.toFixed(1)} km</span>
                    <span>~${timeMinutes} min</span>
                </div>
            </div>
            <p>${alt.explanation}</p>
            <button class="primary-btn" style="width: 100%;">${translate('select_route')}</button>
        `;

        card.querySelector('button')!.addEventListener('click', () => {
            selectAndDrawRoute(alt, routeCoordinates, fromPOI, toPOI);
            modal.classList.add('hidden');
        });

        list.appendChild(card);
    });
    
    document.getElementById('route-finder-panel')!.classList.add('hidden');
    modal.classList.remove('hidden');
}

function selectAndDrawRoute(alternative: any, coordinates: L.LatLng[], fromPOI: any, toPOI: any) {
    clearRoute();

    routeLine = L.polyline(coordinates, { color: '#e74c3c', weight: 5, opacity: 0.8, dashArray: '10, 5' }).addTo(map);

    const startIcon = L.divIcon({ html: `<span class="material-icons" style="color: #2ecc71; font-size: 36px;">place</span>`, className: 'route-marker-icon', iconAnchor: [18, 36] });
    const endIcon = L.divIcon({ html: `<span class="material-icons" style="color: #e74c3c; font-size: 36px;">flag</span>`, className: 'route-marker-icon', iconAnchor: [18, 36] });

    routeStartMarker = L.marker([fromPOI.lat, fromPOI.lng], { icon: startIcon }).addTo(map).bindPopup(`<b>${translate('route_start')}:</b> ${fromPOI.name}`);
    routeEndMarker = L.marker([toPOI.lat, toPOI.lng], { icon: endIcon }).addTo(map).bindPopup(`<b>${translate('route_destination')}:</b> ${toPOI.name}`);

    const bounds = L.latLngBounds(coordinates.length > 0 ? coordinates : [fromPOI, toPOI]);
    
    // --- NEW: Cinematic "Fly-in" Animation ---
    const isLocalUser = userMarker && nepalBounds.contains(userMarker.getLatLng());
    if (isLocalUser) {
        // Standard zoom for local users
        map.flyToBounds(bounds.pad(0.2));
    } else {
        // Dramatic fly-in for international users or users without GPS
        map.flyTo([28.3949, 84.1240], 7, { duration: 1.5 }); // Fly to center of Nepal
        setTimeout(() => {
            map.flyToBounds(bounds.pad(0.2), { duration: 1.5 }); // Then zoom to the route
        }, 1600); // Wait for the first animation to be near completion
    }


    showToast(alternative.explanation, 'info', 6000);

    displayRouteDetails(alternative.route, coordinates);
}

function displayRouteDetails(roadNames: string[], coordinates: L.LatLng[]) {
    const panel = document.getElementById('route-details-panel')!;
    const distanceEl = document.getElementById('route-distance')!;
    const timeEl = document.getElementById('route-time')!;
    const directionsList = document.getElementById('route-directions-list')!;

    // --- REFACTORED: Use the new helper function ---
    const { distanceKm, timeMinutes } = calculateRouteMetrics(coordinates);

    distanceEl.textContent = `${distanceKm.toFixed(1)} km`;
    // Add tilde for consistency with the options modal
    timeEl.textContent = `~${timeMinutes} min`;
    
    directionsList.innerHTML = roadNames.map((name, index) => `
        <div class="direction-item">
            <span class="direction-step">${index + 1}</span>
            <div class="direction-text">${name}</div>
        </div>
    `).join('');

    panel.classList.remove('hidden');
}

// Correction: Use optimized lookup map
function findPOIByName(name: string): any | null {
    return allItemsMap.get(name.toLowerCase()) || null;
}

function clearRoute() {
    if (routeLine) {
        map.removeLayer(routeLine);
        routeLine = null;
    }
    if (routeStartMarker) {
        map.removeLayer(routeStartMarker);
        routeStartMarker = null;
    }
    if (routeEndMarker) {
        map.removeLayer(routeEndMarker);
        routeEndMarker = null;
    }
    document.getElementById('route-details-panel')!.classList.add('hidden');
}

function handleShareRoute() {
    if (!routeStartMarker || !routeEndMarker) {
        console.warn("Cannot share route, start or end marker is missing.");
        return;
    }

    const fromInput = document.getElementById('from-input') as HTMLInputElement;
    const toInput = document.getElementById('to-input') as HTMLInputElement;

    const fromName = fromInput.value;
    const toName = toInput.value;

    const startLatLng = routeStartMarker.getLatLng();
    const endLatLng = routeEndMarker.getLatLng();

    const googleMapsUrl = `https://maps.google.com/?saddr=${startLatLng.lat},${startLatLng.lng}&daddr=${endLatLng.lat},${endLatLng.lng}`;
    
    const shareText = `Route from ${fromName} to ${toName} via Sadak Sathi.\n\nView here: ${googleMapsUrl}`;
    
    navigator.clipboard.writeText(shareText).then(() => {
        showToast(translate('route_copied_toast'), 'success');
    }).catch(err => {
        console.error('Failed to copy route to clipboard:', err);
        showToast(translate('error_copy_route'), 'error');
    });
}

function handleViewOnGoogleMaps() {
    if (!routeStartMarker || !routeEndMarker) {
        console.warn("Cannot view route on maps, start or end marker is missing.");
        showToast(translate('error_gmaps_link_incomplete_route'), 'error');
        return;
    }

    const startLatLng = routeStartMarker.getLatLng();
    const endLatLng = routeEndMarker.getLatLng();

    const googleMapsUrl = `https://maps.google.com/?saddr=${startLatLng.lat},${startLatLng.lng}&daddr=${endLatLng.lat},${endLatLng.lng}`;
    
    window.open(googleMapsUrl, '_blank', 'noopener,noreferrer');
}

// =================================================================================
// User Authentication & Admin
// =================================================================================

function showAuthError(view: 'login' | 'otp', messageKey: string) {
    clearAuthErrors();
    const errorElement = document.getElementById(`${view}-error-message`) as HTMLElement;
    if (errorElement) {
        errorElement.textContent = translate(messageKey);
        errorElement.classList.remove('hidden');
    }
}

function clearAuthErrors() {
    (document.getElementById('login-error-message') as HTMLElement).classList.add('hidden');
    (document.getElementById('otp-error-message') as HTMLElement).classList.add('hidden');
}


function updateUserUI() {
    const profileBtnIcon = document.querySelector('#profile-btn .material-icons') as HTMLElement;
    const profileBtnLabel = document.querySelector('#profile-btn .label') as HTMLElement;
    
    if (currentUser) {
        // Logged In State
        profileBtnIcon.textContent = 'person';
        profileBtnLabel.textContent = currentUser.email.split('@')[0];
        
        const profileView = document.getElementById('profile-view')!;
        (document.getElementById('profile-email') as HTMLElement).textContent = currentUser.email;
        const roleBadge = document.getElementById('profile-role-badge') as HTMLElement;
        roleBadge.textContent = currentUser.role;
        roleBadge.dataset.role = currentUser.role;

        // Role-based access for Admin Panel
        document.getElementById('admin-panel-btn')!.classList.toggle('hidden', currentUser.role !== 'superadmin');

        document.getElementById('login-view')!.classList.add('hidden');
        document.getElementById('otp-view')!.classList.add('hidden');
        profileView.classList.remove('hidden');

    } else {
        // Logged Out State
        profileBtnIcon.textContent = 'login';
        profileBtnLabel.textContent = translate('profile');
        
        document.getElementById('login-view')!.classList.remove('hidden');
        document.getElementById('otp-view')!.classList.add('hidden');
        document.getElementById('profile-view')!.classList.add('hidden');
    }
}

async function handleSendOtp(event: Event) {
    event.preventDefault();
    const emailInput = document.getElementById('login-email') as HTMLInputElement;
    const email = emailInput.value.trim().toLowerCase();

    const user = mockUsers.find(u => u.email === email);
    if (!user) {
        showAuthError('login', 'error_email_not_registered');
        return;
    }
    
    // --- SIMULATION ONLY ---
    // In a real app, this would be a backend call.
    showToast(`OTP for ${email} is 123456`, 'info');
    
    clearAuthErrors();
    (document.getElementById('otp-email-display') as HTMLElement).textContent = email;
    document.getElementById('login-view')!.classList.add('hidden');
    document.getElementById('otp-view')!.classList.remove('hidden');
    (document.getElementById('otp-input') as HTMLInputElement).focus();
}

async function handleLogin(event: Event) {
    event.preventDefault();
    const email = (document.getElementById('otp-email-display') as HTMLElement).textContent;
    const otp = (document.getElementById('otp-input') as HTMLInputElement).value;
    
    // --- SIMULATION ONLY ---
    if (otp !== '123456' || !email) {
        showAuthError('otp', 'error_invalid_otp');
        return;
    }
    
    const user = mockUsers.find(u => u.email === email);
    if (user) {
        currentUser = user;
        localStorage.setItem('currentUserEmail', user.email);
        updateUserUI();
    } else {
        showAuthError('otp', 'error_user_not_found');
    }
}

function handleLogout() {
    currentUser = null;
    localStorage.removeItem('currentUserEmail');
    (document.getElementById('profile-modal') as HTMLElement).classList.add('hidden');
    updateUserUI();
}

function checkSession() {
    const savedEmail = localStorage.getItem('currentUserEmail');
    if (savedEmail) {
        const user = mockUsers.find(u => u.email === savedEmail);
        if (user) {
            currentUser = user;
        }
    }
    updateUserUI();
}

function openAdminPanel() {
    (document.getElementById('admin-road-data-url') as HTMLInputElement).value = ROAD_DATA_URL;
    (document.getElementById('admin-traffic-data-url') as HTMLInputElement).placeholder = "Future Waze/Firebase URL";
    (document.getElementById('admin-ip-cam-url') as HTMLInputElement).value = localStorage.getItem('ipCamUrl') || '';

    (document.getElementById('profile-modal') as HTMLElement).classList.add('hidden');
    (document.getElementById('admin-panel-modal') as HTMLElement).classList.remove('hidden');
}


// =================================================================================
// Event Listeners
// =================================================================================
function setupEventListeners() {
    const appContainer = document.getElementById('app-container')!;
    const profileBtn = document.getElementById('profile-btn')!;
    const profileModal = document.getElementById('profile-modal')!;
    const settingsPanel = document.getElementById('settings-panel')!;
    const centerBtn = document.getElementById('center-location-btn')!;
    const aiAssistantBtn = document.getElementById('ai-assistant-btn')!;
    const headerAiChatBtn = document.getElementById('header-ai-chat-btn')!;
    const chatModal = document.getElementById('ai-chat-modal')!;
    const closeChatBtn = document.getElementById('close-chat-btn')!;
    const chatForm = document.getElementById('chat-form')!;
    const chatInput = document.getElementById('chat-input') as HTMLInputElement;
    const routeFinderTrigger = document.getElementById('route-finder-trigger')!;
    const routeFinderPanel = document.getElementById('route-finder-panel')!;
    const routeFinderClose = document.getElementById('route-finder-close')!;
    const findRouteBtn = document.getElementById('find-route-btn')!;
    const clearRouteBtn = document.getElementById('clear-route-btn')!;
    const appModeBtn = document.getElementById('app-mode-btn')!;
    const appModeModal = document.getElementById('app-mode-modal')!;
    const displayPanelHeader = document.getElementById('display-panel-header')!;
    const displayPanel = document.getElementById('display-panel')!;
    const routeOptionsModal = document.getElementById('route-options-modal')!;
    const adminPanelModal = document.getElementById('admin-panel-modal')!;

    // Theme Toggle (moved to header)
    const themeToggle = document.getElementById('theme-toggle')!;
    themeToggle.addEventListener('click', () => {
        const isDark = appContainer.dataset.theme === 'dark';
        appContainer.dataset.theme = isDark ? 'light' : 'dark';
        (themeToggle.querySelector('.material-icons') as HTMLElement).textContent = isDark ? 'light_mode' : 'dark_mode';
        localStorage.setItem('theme', appContainer.dataset.theme);
        
        if (appContainer.dataset.theme === 'dark') {
            if(currentBaseLayer !== baseLayers['dark']) {
                map.removeLayer(currentBaseLayer);
                currentBaseLayer = baseLayers['dark'];
                currentBaseLayer.addTo(map);
                document.querySelector('.style-option.active')?.classList.remove('active');
                document.querySelector('.style-option[data-style="dark"]')?.classList.add('active');
            }
        } else {
             if(currentBaseLayer === baseLayers['dark']) {
                map.removeLayer(currentBaseLayer);
                currentBaseLayer = baseLayers[lastLightBaseLayer];
                currentBaseLayer.addTo(map);
                 document.querySelector('.style-option.active')?.classList.remove('active');
                document.querySelector(`.style-option[data-style="${lastLightBaseLayer}"]`)?.classList.add('active');
             }
        }
    });

    // Profile & Settings
    profileBtn.addEventListener('click', () => {
        clearAuthErrors();
        profileModal.classList.remove('hidden');
    });
    profileModal.querySelector('.modal-close-btn')!.addEventListener('click', () => profileModal.classList.add('hidden'));
    document.getElementById('open-settings-btn')!.addEventListener('click', () => {
        profileModal.classList.add('hidden');
        settingsPanel.classList.add('open');
    });

    // Login/Logout/Admin Listeners
    document.getElementById('login-form')!.addEventListener('submit', handleSendOtp);
    document.getElementById('otp-form')!.addEventListener('submit', handleLogin);
    document.getElementById('logout-btn')!.addEventListener('click', handleLogout);
    document.getElementById('admin-panel-btn')!.addEventListener('click', openAdminPanel);
    adminPanelModal.querySelector('.modal-close-btn')!.addEventListener('click', () => adminPanelModal.classList.add('hidden'));
    document.getElementById('save-ip-cam-btn')!.addEventListener('click', () => {
        const url = (document.getElementById('admin-ip-cam-url') as HTMLInputElement).value;
        localStorage.setItem('ipCamUrl', url);
        showToast(translate('admin_ip_cam_url_saved'), 'success');
        adminPanelModal.classList.add('hidden');
    });

    
    // Redesigned Language Selector
    const langSelectorBtn = document.getElementById('language-selector-btn')!;
    const langPopup = document.getElementById('language-popup')!;
    langSelectorBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        const isHidden = langPopup.classList.toggle('hidden');
        langSelectorBtn.setAttribute('aria-expanded', isHidden ? 'false' : 'true');
    });

    document.querySelectorAll('.lang-category-header').forEach(header => {
        header.addEventListener('click', (e) => {
            e.stopPropagation();
            const category = (header as HTMLElement).closest('.lang-category');
            if (!category) return;

            // Accordion: close other open categories
            document.querySelectorAll('.lang-category.open').forEach(openCategory => {
                if (openCategory !== category) {
                    openCategory.classList.remove('open');
                }
            });
            category.classList.toggle('open');
        });
    });

    document.querySelectorAll('.lang-option').forEach(btn => {
        btn.addEventListener('click', () => {
            const lang = btn.getAttribute('data-lang')!;
            changeLanguage(lang);
            langPopup.classList.add('hidden');
            langSelectorBtn.setAttribute('aria-expanded', 'false');
        });
    });

    // AI Chat
    aiAssistantBtn.addEventListener('click', () => chatModal.classList.remove('hidden'));
    headerAiChatBtn.addEventListener('click', () => chatModal.classList.remove('hidden'));
    closeChatBtn.addEventListener('click', () => chatModal.classList.add('hidden'));
    chatForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const prompt = chatInput.value.trim();
        if (prompt) {
            addMessageToChat(prompt, 'user');
            handleAIChat(prompt);
            chatInput.value = '';
        }
    });
    
    // Language Switch Proposal Buttons
    document.getElementById('confirm-lang-switch')!.addEventListener('click', (e) => {
        const langCode = (e.currentTarget as HTMLElement).dataset.lang;
        if (langCode) {
            changeLanguage(langCode);
        }
        document.getElementById('language-switch-proposal')!.classList.add('hidden');
    });
    document.getElementById('decline-lang-switch')!.addEventListener('click', () => {
        document.getElementById('language-switch-proposal')!.classList.add('hidden');
    });


    // Live Cam Feature
    const liveCamBtn = document.getElementById('live-cam-btn')!;
    liveCamBtn.addEventListener('click', () => {
        if (currentAppMode === 'driving') {
            showToast('Live Cam is disabled in Driving mode for your safety.', 'info');
            return;
        }
        const camPanel = document.getElementById('live-cam-panel')!;
        const isOpening = camPanel.classList.contains('hidden');
        startLiveCam(isOpening);
    });

    document.getElementById('close-cam-btn')!.addEventListener('click', () => startLiveCam(false));
    document.getElementById('flip-cam-btn')!.addEventListener('click', () => {
        isFrontCamera = !isFrontCamera;
        startLiveCam(true); // Restart the stream with the new camera
    });
    document.getElementById('toggle-cam-analysis-btn')!.addEventListener('click', toggleCameraAnalysis);
    
    // Make Live Cam panel draggable
    const liveCamPanel = document.getElementById('live-cam-panel')!;
    const liveCamHeader = document.getElementById('live-cam-header')!;
    let isDragging = false;
    let offsetX: number, offsetY: number;

    liveCamHeader.addEventListener('mousedown', (e) => {
        isDragging = true;
        offsetX = e.clientX - liveCamPanel.offsetLeft;
        offsetY = e.clientY - liveCamPanel.offsetTop;
        liveCamPanel.style.cursor = 'grabbing';
    });

    document.addEventListener('mousemove', (e) => {
        if (isDragging) {
            liveCamPanel.style.left = `${e.clientX - offsetX}px`;
            liveCamPanel.style.top = `${e.clientY - offsetY}px`;
        }
    });

    document.addEventListener('mouseup', () => {
        isDragging = false;
        liveCamPanel.style.cursor = 'default';
    });

    // Route Finder
    routeFinderTrigger.addEventListener('click', () => routeFinderPanel.classList.remove('hidden'));
    routeFinderClose.addEventListener('click', () => routeFinderPanel.classList.add('hidden'));
    findRouteBtn.addEventListener('click', () => handleFindRoute());
    clearRouteBtn.addEventListener('click', clearRoute);
    
    document.getElementById('swap-locations-btn')!.addEventListener('click', () => {
        const fromInput = document.getElementById('from-input') as HTMLInputElement;
        const toInput = document.getElementById('to-input') as HTMLInputElement;
        const temp = fromInput.value;
        fromInput.value = toInput.value;
        toInput.value = temp;
    });

    // Route Details Panel
    document.getElementById('route-details-close')!.addEventListener('click', clearRoute);
    document.getElementById('share-route-btn')!.addEventListener('click', handleShareRoute);
    document.getElementById('view-gmaps-btn')!.addEventListener('click', handleViewOnGoogleMaps);

    // Route Options Modal
    routeOptionsModal.querySelector('.modal-close-btn')!.addEventListener('click', () => {
        routeOptionsModal.classList.add('hidden');
    });

    // App Mode
    appModeBtn.addEventListener('click', () => appModeModal.classList.remove('hidden'));
    appModeModal.addEventListener('click', (e) => {
        const target = e.target as HTMLElement;
        if (target.closest('.modal-close-btn') || target.classList.contains('modal-overlay')) {
            appModeModal.classList.add('hidden');
        }
        const modeBtn = target.closest('.mode-select-btn');
        if (modeBtn) {
            currentAppMode = modeBtn.getAttribute('data-mode') as any;
            appContainer.dataset.mode = currentAppMode;
            appModeModal.classList.add('hidden');
            const modeKey = `mode_${currentAppMode}`;
            const modeText = translate(modeKey);
            (appModeBtn.querySelector('.label') as HTMLElement).textContent = modeText;
            (appModeBtn.querySelector('.label') as HTMLElement).setAttribute('data-lang-key', modeKey);
        }
    });

    // Display Panel Toggle
    displayPanelHeader.addEventListener('click', () => displayPanel.classList.toggle('collapsed'));

    // Route Preferences
    document.getElementById('pref-highways')!.addEventListener('change', e => routePreferences.preferHighways = (e.target as HTMLInputElement).checked);
    document.getElementById('pref-no-tolls')!.addEventListener('change', e => routePreferences.avoidTolls = (e.target as HTMLInputElement).checked);
    document.getElementById('pref-scenic')!.addEventListener('change', e => routePreferences.preferScenic = (e.target as HTMLInputElement).checked);
    
    // Proactive Alert Buttons
    document.getElementById('alert-ask-ai-btn')!.addEventListener('click', () => {
        const alertMessage = document.getElementById('alert-message')!.textContent;
        chatModal.classList.remove('hidden');
        chatInput.value = alertMessage || '';
        document.getElementById('proactive-alert')!.classList.add('hidden');
        handleAIChat(alertMessage || 'Tell me more about this alert.');
    });
    document.getElementById('alert-close-btn')!.addEventListener('click', () => {
        document.getElementById('proactive-alert')!.classList.add('hidden');
        currentAlertMessageKey = null;
    });

    // Voice Response Toggle
    document.getElementById('toggle-voice-response')!.addEventListener('change', e => {
        isVoiceResponseEnabled = (e.target as HTMLInputElement).checked;
        if (!isVoiceResponseEnabled) SpeechSynthesis.cancel();
    });
    
    // Unlock audio context on first user interaction
    document.body.addEventListener('click', () => {
        if (!isAudioUnlocked) {
            const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
            if (audioCtx.state === 'suspended') {
                audioCtx.resume();
            }
            if(SpeechSynthesis.getVoices().length === 0) {
                 SpeechSynthesis.onvoiceschanged = () => {};
                 SpeechSynthesis.speak(new SpeechSynthesisUtterance(''));
            }
            isAudioUnlocked = true;
            console.log("Audio unlocked by user interaction.");
        }
    }, { once: true });
    
    // Voice Command Buttons
    const fromInput = document.getElementById('from-input') as HTMLInputElement;
    const toInput = document.getElementById('to-input') as HTMLInputElement;
    document.getElementById('from-voice-btn')!.addEventListener('click', (e) => {
        toggleVoiceRecognition(e.currentTarget as HTMLElement, fromInput, () => {
            // After filling 'From', automatically focus the 'To' input
            toInput.focus();
        });
    });
    document.getElementById('to-voice-btn')!.addEventListener('click', (e) => {
        toggleVoiceRecognition(e.currentTarget as HTMLElement, toInput, () => {
            // After filling 'To', if 'From' is also filled, find the route
            if (fromInput.value.trim() !== '') {
                handleFindRoute();
            }
        });
    });
    document.getElementById('voice-command-btn')!.addEventListener('click', (e) => {
        // For chat, we don't just fill the input, we submit the message directly.
        toggleVoiceRecognition(e.currentTarget as HTMLElement, chatInput, (transcript) => {
            if (transcript) {
                addMessageToChat(transcript, 'user');
                handleAIChat(transcript);
                chatInput.value = ''; // Clear input after sending
            }
        });
    });

    // NEW MAP CONTROLS
    const mapOptionsBtn = document.getElementById('map-options-btn')!;
    const mapOptionsPopup = document.getElementById('map-options-popup')!;

    document.getElementById('zoom-in-btn')!.addEventListener('click', () => map.zoomIn());
    document.getElementById('zoom-out-btn')!.addEventListener('click', () => map.zoomOut());

    centerBtn.addEventListener('click', () => {
        if (userMarker) {
            map.flyTo(userMarker.getLatLng(), 15);
        }
    });

    document.getElementById('toggle-roads')!.addEventListener('change', (e) => {
        const checkbox = e.target as HTMLInputElement;
        if (checkbox.checked) map.addLayer(roadsLayer);
        else map.removeLayer(roadsLayer);
    });
    document.getElementById('toggle-pois')!.addEventListener('change', (e) => {
        const checkbox = e.target as HTMLInputElement;
        if (checkbox.checked) map.addLayer(poisLayer);
        else map.removeLayer(poisLayer);
    });
    document.getElementById('toggle-incidents')!.addEventListener('change', (e) => {
        const checkbox = e.target as HTMLInputElement;
        if (checkbox.checked) map.addLayer(alertsLayer);
        else map.removeLayer(alertsLayer);
    });

    document.querySelectorAll('.style-option').forEach(btn => {
        btn.addEventListener('click', () => {
            const style = btn.getAttribute('data-style')!;
            if (baseLayers[style] && currentBaseLayer !== baseLayers[style]) {
                map.removeLayer(currentBaseLayer);
                currentBaseLayer = baseLayers[style];
                currentBaseLayer.addTo(map);
                document.querySelector('.style-option.active')?.classList.remove('active');
                btn.classList.add('active');
                if(style !== 'dark') lastLightBaseLayer = style;
            }
        });
    });

    // Global click listener to close popups
    document.addEventListener('click', (e) => {
        const target = e.target as HTMLElement;
        if (!mapOptionsPopup.classList.contains('hidden') && !target.closest('#map-options-selector')) {
            mapOptionsPopup.classList.add('hidden');
        }
        if (settingsPanel.classList.contains('open') && !target.closest('#settings-panel') && !target.closest('#open-settings-btn')) {
             settingsPanel.classList.remove('open');
        }
        if (!langPopup.classList.contains('hidden') && !target.closest('#language-selector-container')) {
             langPopup.classList.add('hidden');
             langSelectorBtn.setAttribute('aria-expanded', 'false');
        }
        
        // Correction: Handle "Get Directions" button clicks with fixed logic
        const directionsBtn = target.closest('.popup-directions-btn');
        if (directionsBtn) {
            map.closePopup();
            const destName = (directionsBtn as HTMLElement).dataset.name;
            if (destName) {
                if (!userMarker) {
                    showToast(translate('error_no_user_location'), 'error');
                    return;
                }
                const userLatLng = userMarker.getLatLng();
                const closestPOI = findClosestPOI(userLatLng);

                if (closestPOI) {
                    (document.getElementById('from-input') as HTMLInputElement).value = closestPOI.name;
                    (document.getElementById('to-input') as HTMLInputElement).value = destName;
                    routeFinderPanel.classList.remove('hidden');
                } else {
                    showToast(translate('error_no_user_location'), 'error');
                }
            }
        }
    });

    mapOptionsBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        mapOptionsPopup.classList.toggle('hidden');
    });

    // Persona Settings Listeners
    const personaAvatarUpload = document.getElementById('persona-avatar-upload') as HTMLInputElement;
    const personaAvatarPreview = document.getElementById('persona-avatar-preview') as HTMLImageElement;
    const chatAvatar = document.getElementById('chat-ai-avatar') as HTMLImageElement;
    const personaNameInput = document.getElementById('persona-name-input') as HTMLInputElement;
    const personaDescInput = document.getElementById('persona-desc-input') as HTMLTextAreaElement;

    personaAvatarUpload.addEventListener('change', () => {
        const file = personaAvatarUpload.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                const imageUrl = e.target?.result as string;
                personaAvatarPreview.src = imageUrl;
                chatAvatar.src = imageUrl;
                localStorage.setItem('aiAvatar', imageUrl);
            };
            reader.readAsDataURL(file);
        }
    });

    personaNameInput.addEventListener('input', () => {
        const newName = personaNameInput.value;
        (document.getElementById('chat-ai-name') as HTMLElement).textContent = newName;
        localStorage.setItem('aiName', newName);
        initAI(); // Re-initialize AI with new name context
    });

    personaDescInput.addEventListener('input', () => {
        localStorage.setItem('aiPersonaDesc', personaDescInput.value);
        initAI(); // Re-initialize AI with new persona
    });
}

// Correction: Helper function to find the closest POI to a given location.
function findClosestPOI(latlng: L.LatLng): any | null {
    const allItems = [...allPois, ...allIncidents];
    if (allItems.length === 0) return null;

    let closestItem = null;
    let minDistance = Infinity;

    allItems.forEach(item => {
        const itemLatLng = L.latLng(item.lat, item.lng);
        const distance = latlng.distanceTo(itemLatLng);
        if (distance < minDistance) {
            minDistance = distance;
            closestItem = item;
        }
    });

    return closestItem;
}


// =================================================================================
// Live Camera and AI Analysis
// =================================================================================

async function startLiveCam(enable: boolean) {
    const videoElement = document.getElementById('live-cam-video') as HTMLVideoElement;
    const ipCamElement = document.getElementById('ip-cam-stream') as HTMLImageElement;
    const placeholder = document.getElementById('live-cam-placeholder')!.parentElement!;
    const panel = document.getElementById('live-cam-panel') as HTMLElement;
    const flipCamBtn = document.getElementById('flip-cam-btn') as HTMLButtonElement;

    const ipCamUrl = localStorage.getItem('ipCamUrl');

    if (enable) {
        panel.classList.remove('hidden');

        // --- NEW: IP Camera Logic ---
        if (ipCamUrl) {
            console.log("Starting IP Camera stream:", ipCamUrl);
            videoElement.classList.add('hidden');
            ipCamElement.src = ipCamUrl;
            ipCamElement.classList.remove('hidden');
            placeholder.classList.add('hidden');
            flipCamBtn.style.display = 'none'; // Hide flip button for IP cams
            stopAnalysisLoop(); // Analysis not supported for IP cams in this version
            document.getElementById('toggle-cam-analysis-btn')!.style.display = 'none';
            return; // Exit here for IP camera
        }

        // --- Fallback to Device Camera ---
        flipCamBtn.style.display = 'flex';
        document.getElementById('toggle-cam-analysis-btn')!.style.display = 'flex';
        ipCamElement.classList.add('hidden');

        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
            console.warn('Camera API not available.');
            placeholder.classList.remove('hidden');
            videoElement.classList.add('hidden');
            return;
        }
        try {
            if (cameraStream) {
                cameraStream.getTracks().forEach(track => track.stop());
            }

            const constraints = {
                video: {
                    facingMode: isFrontCamera ? 'user' : 'environment'
                }
            };
            cameraStream = await navigator.mediaDevices.getUserMedia(constraints);
            videoElement.srcObject = cameraStream;
            videoElement.classList.remove('hidden');
            placeholder.classList.add('hidden');
            
            if (isAnalyzingCamera) {
                startAnalysisLoop();
            }
        } catch (err) {
            console.error("Error accessing camera:", err);
            videoElement.classList.add('hidden');
            placeholder.classList.remove('hidden');
        }
    } else {
        if (cameraStream) {
            cameraStream.getTracks().forEach(track => track.stop());
            cameraStream = null;
            videoElement.srcObject = null;
        }
        ipCamElement.src = ''; // Stop IP cam stream
        stopAnalysisLoop();
        clearAnalysisOverlay();
        panel.classList.add('hidden');
    }
}


function toggleCameraAnalysis() {
    isAnalyzingCamera = !isAnalyzingCamera;
    const toggleBtn = document.getElementById('toggle-cam-analysis-btn')!;
    const icon = toggleBtn.querySelector('.material-icons')!;
    toggleBtn.classList.toggle('active', isAnalyzingCamera);

    if (isAnalyzingCamera) {
        icon.textContent = 'visibility';
        startAnalysisLoop();
        showToast("Live analysis started.", "info");
    } else {
        icon.textContent = 'visibility_off';
        stopAnalysisLoop();
        clearAnalysisOverlay();
        showToast("Live analysis stopped.", "info");
    }
}

function startAnalysisLoop() {
    if (analysisIntervalId || !cameraStream) return;
    analyzeCameraFrame();
    analysisIntervalId = window.setInterval(analyzeCameraFrame, 3000); // 3 seconds interval
}

function stopAnalysisLoop() {
    if (analysisIntervalId) {
        clearInterval(analysisIntervalId);
        analysisIntervalId = null;
    }
}

async function analyzeCameraFrame() {
    if (isAnalysisAPICallRunning || !cameraStream) return;

    isAnalysisAPICallRunning = true;
    const videoElement = document.getElementById('live-cam-video') as HTMLVideoElement;
    
    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = videoElement.videoWidth;
    tempCanvas.height = videoElement.videoHeight;
    const tempCtx = tempCanvas.getContext('2d');
    if (!tempCtx) {
        isAnalysisAPICallRunning = false;
        return;
    }
    tempCtx.drawImage(videoElement, 0, 0, tempCanvas.width, tempCanvas.height);
    const base64ImageData = tempCanvas.toDataURL('image/jpeg').split(',')[1];

    try {
        const imagePart = { inlineData: { data: base64ImageData, mimeType: 'image/jpeg' } };
        const prompt = `Analyze this image from a vehicle's camera. Identify potential traffic hazards (like pedestrians, stopped cars, obstacles, animals) or notable points of interest (like landmarks, signs, shops). For each item, provide a name, a type ('hazard' or 'poi'), a brief description, and a normalized bounding box {x, y, width, height} where coordinates are from 0.0 to 1.0. If nothing noteworthy is found, return an empty array in the 'detections' field.`;
        
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: { parts: [imagePart, { text: prompt }] },
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        detections: {
                            type: Type.ARRAY,
                            items: {
                                type: Type.OBJECT,
                                properties: {
                                    name: { type: Type.STRING },
                                    type: { type: Type.STRING },
                                    description: { type: Type.STRING },
                                    boundingBox: {
                                        type: Type.OBJECT,
                                        properties: {
                                            x: { type: Type.NUMBER },
                                            y: { type: Type.NUMBER },
                                            width: { type: Type.NUMBER },
                                            height: { type: Type.NUMBER }
                                        },
                                        required: ["x", "y", "width", "height"]
                                    }
                                },
                                required: ["name", "type", "description", "boundingBox"]
                            }
                        }
                    }
                }
            }
        });
        
        const result = JSON.parse(response.text);
        if (result.detections && result.detections.length > 0) {
            drawDetections(result.detections);
            const firstHazard = result.detections.find((d: any) => d.type === 'hazard');
            if (firstHazard) {
                showToast(`Hazard detected: ${firstHazard.name}`, 'error');
            }
        } else {
            clearAnalysisOverlay();
        }

    } catch (error) {
        console.error("Error analyzing camera frame:", error);
    } finally {
        isAnalysisAPICallRunning = false;
    }
}

function drawDetections(detections: any[]) {
    const overlayCanvas = document.getElementById('live-cam-overlay') as HTMLCanvasElement;
    const videoElement = document.getElementById('live-cam-video') as HTMLVideoElement;

    overlayCanvas.width = videoElement.clientWidth;
    overlayCanvas.height = videoElement.clientHeight;
    const ctx = overlayCanvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, overlayCanvas.width, overlayCanvas.height);

    detections.forEach(detection => {
        const { boundingBox, name, type } = detection;
        const x = boundingBox.x * overlayCanvas.width;
        const y = boundingBox.y * overlayCanvas.height;
        const width = boundingBox.width * overlayCanvas.width;
        const height = boundingBox.height * overlayCanvas.height;

        const color = type === 'hazard' ? '#e74c3c' : '#3498db';
        ctx.strokeStyle = color;
        ctx.lineWidth = 2;
        ctx.fillStyle = color;
        ctx.font = '14px Roboto';
        
        ctx.strokeRect(x, y, width, height);

        const text = name.toUpperCase();
        const textMetrics = ctx.measureText(text);
        const textWidth = textMetrics.width;
        const textHeight = 14; 
        
        ctx.fillRect(x, y - textHeight - 4, textWidth + 8, textHeight + 4);
        ctx.fillStyle = 'white';
        ctx.fillText(text, x + 4, y - 4);
    });
}

function clearAnalysisOverlay() {
    const overlayCanvas = document.getElementById('live-cam-overlay') as HTMLCanvasElement;
    const ctx = overlayCanvas.getContext('2d');
    if (ctx) {
        ctx.clearRect(0, 0, overlayCanvas.width, overlayCanvas.height);
    }
}

function showProactiveAlert(messageKey: string) {
    const alertBanner = document.getElementById('proactive-alert')!;
    const messageElement = document.getElementById('alert-message')!;

    messageElement.setAttribute('data-lang-key', messageKey);
    messageElement.innerText = translate(messageKey);

    alertBanner.classList.remove('hidden');

    setTimeout(() => {
        if (!alertBanner.classList.contains('hidden')) {
            alertBanner.classList.add('hidden');
        }
    }, 10000);
}

// Correction: New function to show toast notifications
function showToast(message: string, type: 'error' | 'success' | 'info' = 'info', duration: number = 4000) {
    const toast = document.getElementById('toast-notification') as HTMLElement;
    const toastMessage = document.getElementById('toast-message') as HTMLElement;
    const toastIcon = document.getElementById('toast-icon') as HTMLElement;

    toastMessage.textContent = message;
    toast.dataset.type = type;

    switch (type) {
        case 'error':
            toastIcon.textContent = 'error';
            break;
        case 'success':
            toastIcon.textContent = 'check_circle';
            break;
        default:
            toastIcon.textContent = 'info';
            break;
    }

    toast.classList.remove('hidden');

    setTimeout(() => {
        toast.classList.add('hidden');
    }, duration);
}

// =================================================================================
// App Initialization
// =================================================================================
document.addEventListener('DOMContentLoaded', () => {
    // Set initial theme
    const savedTheme = localStorage.getItem('theme') || 'light';
    const appContainer = document.getElementById('app-container')!;
    appContainer.dataset.theme = savedTheme;
    if (savedTheme === 'dark') {
        (document.querySelector('#theme-toggle .material-icons') as HTMLElement).textContent = 'dark_mode';
    } else {
        (document.querySelector('#theme-toggle .material-icons') as HTMLElement).textContent = 'light_mode';
    }

    const savedLang = localStorage.getItem('preferredLang') || 'en';
    
    initMap();
    fetchAndDisplayData();
    loadPersona();
    setupEventListeners();
    checkSession(); // Check for logged in user
    changeLanguage(savedLang); // This also calls updateUIText and initAI
    
    // Temporarily disable proactive alerts for cleaner testing
    /*
    setInterval(() => {
        if (Math.random() < 0.1) showProactiveAlert(translate('fuel_low_alert'));
    }, 30000);

    setInterval(() => {
        if (Math.random() < 0.05) showProactiveAlert(translate('pressure_low_alert'));
    }, 60000);
    */
});