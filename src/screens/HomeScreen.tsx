// FIX: Add minimal TypeScript definitions for Web Speech API to fix compile errors if they are not in the default lib.
interface SpeechRecognitionErrorEvent extends Event {
    error: string;
}
interface SpeechRecognitionResult {
    isFinal: boolean;
    [index: number]: SpeechRecognitionAlternative;
}
interface SpeechRecognitionAlternative {
    transcript: string;
    confidence: number;
}
// FIX: Add missing property to SpeechRecognitionEvent interface for voice command processing.
interface SpeechRecognitionEvent extends Event {
    results: SpeechRecognitionResult[];
    resultIndex: number;
}
interface SpeechRecognition extends EventTarget {
    continuous: boolean;
    interimResults: boolean;
    lang: string;
    start: () => void;
    stop: () => void;
    onend: (() => void) | null;
    onerror: ((event: SpeechRecognitionErrorEvent) => void) | null;
    onresult: ((event: SpeechRecognitionEvent) => void) | null;
    onstart: (() => void) | null;
}
declare var SpeechRecognition: { new(): SpeechRecognition };
declare var webkitSpeechRecognition: { new(): SpeechRecognition };


import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import L from 'leaflet';

// Components
import Header, { LocationStatus } from '../components/ui/Header';
import MapView from '../components/map/MapView';
import SearchBar, { ListeningState } from '../components/ui/SearchBar';
import FABMenu from '../components/ui/FABMenu';
import POIFilter from '../components/ui/POIFilter';
import DriverHUD from '../components/hud/DriverHUD';
import LandingView from '../components/ui/LandingView';
import IncidentAlert from '../components/ui/IncidentAlert';
import LanguageSwitchPrompt from '../components/ui/LanguageSwitchPrompt';
import DirectionsPanel from '../components/routing/DirectionsPanel';
import Notification from '../components/ui/Notification';
import PavementLegend from '../components/ui/PavementLegend';

// Modals
import ReportIncidentModal from '../components/modals/ReportIncidentModal';
import DetailModal from '../components/modals/DetailModal';
import WeatherAlertModal from '../components/modals/WeatherAlertModal';
import LayerSelectionModal from '../components/modals/LayerSelectionModal';
import OfflineMapsModal from '../components/modals/OfflineMapsModal';
import SavedRoutesModal, { SavedRoute } from '../components/modals/SavedRoutesModal';
import IncidentFilterModal from '../components/modals/IncidentFilterModal';
import AlertsCenterModal from '../components/modals/AlertsCenterModal';
import SaveTripModal from '../components/modals/SaveTripModal';
import TripNotificationModal from '../components/modals/TripNotificationModal';
import AiCompanionModal from '../components/modals/AiCompanionModal';
import RouteDetailsModal from '../components/modals/RouteDetailsModal';
import SettingsModal from '../components/modals/SettingsModal';
import NearbyListModal from '../components/modals/NearbyListModal';


// API & Hooks
import { useTranslation } from '../hooks/useTranslation';
import useDebounce from '../hooks/useDebounce';
import { fetchRoadIncidents, fetchPointsOfInterest } from '../api/roadStatusApi';
import { fetchWeather, WeatherData, WeatherAlert } from '../api/weatherApi';
import { searchPlaces, Place } from '../api/geocodingApi';
import { fetchRoute, Route, simulateDriving, SimulatedPosition, RoutePreference } from '../api/routingApi';
import { fetchTrafficData } from '../api/trafficApi';
import { haversineDistance, calculateDistanceCovered } from '../utils/geometry';
import { speak, playSoundEffect } from '../utils/audioFeedback';
import { detectSpokenLanguage } from '../utils/languageDetection';

type AppMode = 'landing' | 'exploring' | 'routing' | 'navigating';
type Feature = any; // A generic type for incidents and POIs

const defaultCenter: [number, number] = [27.7172, 85.3240];
const defaultZoom = 13;

const HomeScreen = () => {
    const { t, language, changeLanguage } = useTranslation();
    const [isLoading, setIsLoading] = useState(true);
    const [appMode, setAppMode] = useState<AppMode>('landing');
    
    // Map State
    const [map, setMap] = useState<L.Map | null>(null);
    const [mapBounds, setMapBounds] = useState<L.LatLngBounds | null>(null);
    const [userLocation, setUserLocation] = useState<[number, number] | null>(null);
    const userLocationRef = useRef(userLocation);
    const [locationStatus, setLocationStatus] = useState<LocationStatus>('searching');
    
    // Data State
    const [incidents, setIncidents] = useState<Feature[]>([]);
    const [pointsOfInterest, setPointsOfInterest] = useState<Feature[]>([]);
    const [weatherData, setWeatherData] = useState<WeatherData | null>(null);
    const [trafficData, setTrafficData] = useState<any | null>(null);
    
    // UI State
    const [isUiBlocked, setIsUiBlocked] = useState(false);
    const [modal, setModal] = useState<string | null>(null);
    const [selectedFeature, setSelectedFeature] = useState<Feature | null>(null);
    const [activeIncidentAlert, setActiveIncidentAlert] = useState<Feature | null>(null);
    const [activeWeatherAlert, setActiveWeatherAlert] = useState<WeatherAlert | null>(null);
    const [notificationMessage, setNotificationMessage] = useState<string | null>(null);
    const [showPavementLayer, setShowPavementLayer] = useState(false);
    const [showTrafficLayer, setShowTrafficLayer] = useState(false);
    const [currentLayer, setCurrentLayer] = useState('Streets');

    // Search and Routing State
    const [searchQuery, setSearchQuery] = useState('');
    const debouncedSearchQuery = useDebounce(searchQuery, 300);
    const [searchSuggestions, setSearchSuggestions] = useState<Place[]>([]);
    const [isSearching, setIsSearching] = useState(false);
    const [searchError, setSearchError] = useState<string | null>(null);
    const [route, setRoute] = useState<Route | null>(null);
    const [isCalculatingRoute, setIsCalculatingRoute] = useState(false);
    const [routeError, setRouteError] = useState<string | null>(null);
    const [routePreference, setRoutePreference] = useState<RoutePreference>('fastest');
    const [destination, setDestination] = useState<Place | null>(null);

    // Navigation State
    const [simulatedPositions, setSimulatedPositions] = useState<SimulatedPosition[]>([]);
    const [currentSpeed, setCurrentSpeed] = useState(0);
    const [navigationProgress, setNavigationProgress] = useState(0);
    const [remainingDistance, setRemainingDistance] = useState(0);
    const [remainingTime, setRemainingTime] = useState(0);
    
    // Voice Recognition State
    const [listeningState, setListeningState] = useState<ListeningState>('idle');
    const [detectedLanguage, setDetectedLanguage] = useState<string | null>(null);
    const [aiInitialQuery, setAiInitialQuery] = useState<string | null>(null);
    const [voiceSettings, setVoiceSettings] = useState(() => {
        try {
            const saved = localStorage.getItem('voiceSettings');
            return saved ? JSON.parse(saved) : { isEnabled: true, wakeWord: 'hey sathi' };
        } catch {
            return { isEnabled: true, wakeWord: 'hey sathi' };
        }
    });

    const recognitionRef = useRef<SpeechRecognition | null>(null);
    const recognitionErrorRef = useRef(false);
    const lastStartTimeRef = useRef(0);
    const isTransitioningRef = useRef(false); // Used as a semaphore for state changes

    const recognitionHandlersRef = useRef({
        onResult: (event: SpeechRecognitionEvent) => {},
        onError: (event: SpeechRecognitionErrorEvent) => {},
        onEnd: () => {},
        onStart: () => {},
    });
    
    // Filters State
    const [poiFilters, setPoiFilters] = useState({ Fuel: false, Hospital: false, Hotel: false, Services: false });
    const [incidentFilters, setIncidentFilters] = useState<{ [key: string]: boolean }>({
        'Blocked': true, 'One-Lane': true, 'Traffic Jam': true,
        'Road Hazard': true, 'Vehicle Breakdown': true, 'Other': true
    });
    
    // Trip Planning State
    const [tripToNotify, setTripToNotify] = useState<SavedRoute | null>(null);
    
    // --- Memos ---
    const hasAlerts = useMemo(() => {
        return (weatherData?.alerts?.length ?? 0) > 0 || incidents.some(i => i.type === 'Blocked');
    }, [weatherData, incidents]);
    
    // Initial data load
    useEffect(() => {
        const loadInitialData = async () => {
            try {
                const pois = await fetchPointsOfInterest();
                setPointsOfInterest(pois);
                const incidentsData = await fetchRoadIncidents(new L.LatLngBounds(defaultCenter, defaultCenter)); // Initial load for default area
                setIncidents(incidentsData);
            } catch (error) {
                console.error("Failed to load initial data:", error);
            }
            setIsLoading(false);
        };
        loadInitialData();
    }, []);

    // Geolocation watcher
    useEffect(() => {
        if ('geolocation' in navigator) {
            const watcher = navigator.geolocation.watchPosition(
                (position) => {
                    const { latitude, longitude } = position.coords;
                    setUserLocation([latitude, longitude]);
                    setLocationStatus('on');
                },
                (error) => {
                    console.error("Geolocation error:", error);
                    setLocationStatus(error.code === 3 ? 'weak' : 'off'); // 3 is timeout
                },
                { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
            );
            return () => navigator.geolocation.clearWatch(watcher);
        } else {
            setLocationStatus('off');
        }
    }, []);
    
    // Debounced search effect
    useEffect(() => {
        if (debouncedSearchQuery) {
            setIsSearching(true);
            setSearchError(null);
            searchPlaces(debouncedSearchQuery, mapBounds, userLocation)
                .then(setSearchSuggestions)
                .catch(() => setSearchError(t('error_search_places')))
                .finally(() => setIsSearching(false));
        } else {
            setSearchSuggestions([]);
            setSearchError(null);
        }
    }, [debouncedSearchQuery, mapBounds, userLocation, t]);
    
    // API calls based on map bounds
    const debouncedMapBounds = useDebounce(mapBounds, 500);
    useEffect(() => {
        if (debouncedMapBounds) {
            fetchRoadIncidents(debouncedMapBounds)
                .then(setIncidents)
                .catch(() => setNotificationMessage(t('error_fetch_incidents')));
            
            if (showTrafficLayer) {
                fetchTrafficData(debouncedMapBounds)
                    .then(setTrafficData)
                    .catch(console.error);
            }
        }
    }, [debouncedMapBounds, showTrafficLayer, t]);
    
    // Weather API call based on user location
    useEffect(() => {
        if (userLocation) {
            fetchWeather(userLocation[0], userLocation[1])
                .then(data => {
                    setWeatherData(data);
                    const severeAlert = data?.alerts.find(a => a.severity === 'severe');
                    if (severeAlert) {
                        setActiveWeatherAlert(severeAlert);
                        setModal('weatherAlert');
                    }
                })
                .catch(() => setNotificationMessage(t('error_fetch_weather')));
        }
    }, [userLocation, t]);
    
    // Trip notification checker
    useEffect(() => {
        const checkPlannedTrips = () => {
            try {
                const savedRoutes = localStorage.getItem('sadak-sathi-saved-routes');
                if (!savedRoutes) return;

                const trips: SavedRoute[] = JSON.parse(savedRoutes).filter((r: SavedRoute) => r.departureTime);
                const now = Date.now();

                const upcomingTrip = trips.find(trip => {
                    const timeDiff = trip.departureTime! - now;
                    return timeDiff > 0 && timeDiff < 5 * 60 * 1000; // 5 minutes
                });

                if (upcomingTrip) {
                    setTripToNotify(upcomingTrip);
                    setModal('tripNotification');
                }
            } catch (e) {
                console.error("Failed to check planned trips:", e);
            }
        };

        const interval = setInterval(checkPlannedTrips, 60000); // Check every minute
        return () => clearInterval(interval);
    }, []);
    
    // --- Handlers ---
    const handleRecenter = useCallback(() => {
        if (map && userLocation) {
            map.flyTo(userLocation, Math.max(map.getZoom(), 15));
        }
    }, [map, userLocation]);
    
    const handleExplore = (poiType?: keyof typeof poiFilters) => {
        setAppMode('exploring');
        if (poiType) {
            setPoiFilters({
                Fuel: false,
                Hospital: false,
                Hotel: false,
                Services: false,
                [poiType]: true,
            });
        }
    };

    const handlePlaceSelect = useCallback(async (place: Place) => {
        setIsUiBlocked(true);
        setSearchQuery(place.nameKey ? t(place.nameKey) : '');
        setSearchSuggestions([]);
        setDestination(place);
        setAppMode('routing');
        
        if (map) {
             if (place.bounds) {
                map.flyToBounds(place.bounds);
            } else {
                map.flyTo([place.lat, place.lng], 15);
            }
        }
        
        if (!userLocation) {
            setNotificationMessage(t('notification_no_location_desc'));
            setRouteError(t('notification_no_location_title'));
            setIsUiBlocked(false);
            return;
        }

        setIsCalculatingRoute(true);
        setRouteError(null);
        try {
            const newRoute = await fetchRoute({ lat: userLocation[0], lng: userLocation[1] }, { lat: place.lat, lng: place.lng }, { preference: routePreference });
            setRoute(newRoute);
        } catch (error) {
            setRouteError(t('error_route_calculation'));
            setNotificationMessage(t('error_route_calculation'));
        } finally {
            setIsCalculatingRoute(false);
            setIsUiBlocked(false);
        }
    }, [map, userLocation, routePreference, t]);

    const handlePreferenceChange = useCallback(async (pref: RoutePreference) => {
        setRoutePreference(pref);
        if (!userLocation || !destination) return;

        setIsCalculatingRoute(true);
        setRouteError(null);
        setRoute(null);
        try {
            const newRoute = await fetchRoute({ lat: userLocation[0], lng: userLocation[1] }, { lat: destination.lat, lng: destination.lng }, { preference: pref });
            setRoute(newRoute);
        } catch (error) {
            setRouteError(t('error_route_calculation'));
            setNotificationMessage(t('error_route_calculation'));
        } finally {
            setIsCalculatingRoute(false);
        }
    }, [userLocation, destination, t]);

    const handleStartNavigation = () => {
        if (route) {
            setAppMode('navigating');
            const positions = simulateDriving(route, 60);
            setSimulatedPositions(positions);
            if (map && route.geometry.length > 0) {
                 map.flyTo(route.geometry[0], 18);
            }
        }
    };
    
    // UI reset listener
    useEffect(() => {
        const resetToLanding = () => {
            setAppMode('landing');
            setRoute(null);
            setSearchQuery('');
            setDestination(null);
        };
        window.addEventListener('ui-reset-to-landing', resetToLanding);
        return () => window.removeEventListener('ui-reset-to-landing', resetToLanding);
    }, []);

    const handleCloseRouting = () => {
        setAppMode(searchQuery ? 'exploring' : 'landing');
        setRoute(null);
        setRouteError(null);
        setDestination(null);
    };

    const handleEndNavigation = () => {
        setAppMode('landing');
        setRoute(null);
        setSearchQuery('');
        setDestination(null);
        setSimulatedPositions([]);
        setNavigationProgress(0);
        setCurrentSpeed(0);
        if(map) map.flyTo(userLocation || defaultCenter, defaultZoom);
    };

    const handleSaveVoiceSettings = useCallback((settings: { wakeWord: string; isEnabled: boolean }) => {
        setVoiceSettings(settings);
        try {
            localStorage.setItem('voiceSettings', JSON.stringify(settings));
        } catch(e) { console.error("Could not save voice settings:", e); }
    }, []);
    
    const onTogglePavementLayer = useCallback(() => {
        setShowPavementLayer(prev => !prev);
    }, []);

    // --- Voice Recognition Logic ---
    const handleSearch = useCallback((query: string) => {
        setSearchQuery(query);
    }, []);

    const parseVoiceCommand = useCallback((command: string): boolean => {
        const lowerCaseCommand = command.toLowerCase();
        
        // Simplified keyword matching
        const keywords = {
            report: ['report', 'incident', t('voice_cmd_report'), t('voice_cmd_incident')],
            navigate: ['navigate to', 'directions to', 'go to', t('voice_cmd_navigate_to'), t('voice_cmd_directions_to')],
            status: ['status', 'traffic', 'road', t('voice_cmd_traffic'), t('voice_cmd_status')],
            find: ['find', 'show me', 'where is', t('voice_command_finding_poi').split(' ')[0]],
            pavement: ['pavement', 'road quality', t('togglePavementLayer').toLowerCase()],
        };

        const incidentTypes: { [key: string]: string } = {
            [t('incident_blocked').toLowerCase()]: 'Blocked',
            [t('incident_one-lane').toLowerCase()]: 'One-Lane',
            [t('incident_traffic_jam').toLowerCase()]: 'Traffic Jam',
            [t('incident_road_hazard').toLowerCase()]: 'Road Hazard',
            [t('incident_vehicle_breakdown').toLowerCase()]: 'Vehicle Breakdown',
            [t('incident_other').toLowerCase()]: 'Other',
        };

        if (keywords.pavement.some(kw => lowerCaseCommand.includes(kw))) {
            speak(t('togglePavementLayer'), language, t);
            onTogglePavementLayer();
            return true;
        }

        for (const kw of keywords.report) {
            if (lowerCaseCommand.startsWith(kw)) {
                let incidentType: string | null = null;
                for (const typeStr in incidentTypes) {
                    if (lowerCaseCommand.includes(typeStr)) {
                        incidentType = incidentTypes[typeStr];
                        break;
                    }
                }
                if (incidentType) {
                     speak(t('voice_command_reporting_specific_incident', { incident: t(`incident_${incidentType.toLowerCase()}`) }), language, t);
                } else {
                     speak(t('voice_command_reporting_incident'), language, t);
                }
                setModal('reportIncident');
                return true;
            }
        }
        
        for (const kw of keywords.navigate) {
            if (lowerCaseCommand.startsWith(kw)) {
                const destination = lowerCaseCommand.replace(kw, '').trim();
                if (destination) {
                    speak(t('voice_command_searching_for', { destination }), language, t);
                    handleSearch(destination);
                    return true;
                }
            }
        }
        
        if (keywords.status.some(kw => lowerCaseCommand.includes(kw))) {
            speak(t('voice_command_checking_status'), language, t);
            setModal('alertsCenter');
            return true;
        }
        
        return false; // Command not recognized
    }, [t, handleSearch, onTogglePavementLayer, language]);

    const handleRecognitionResult = useCallback((event: SpeechRecognitionEvent) => {
        let finalTranscript = '';
        for (let i = event.resultIndex; i < event.results.length; ++i) {
            if (event.results[i].isFinal) {
                finalTranscript += event.results[i][0].transcript;
            }
        }
        finalTranscript = finalTranscript.trim();
        if (!finalTranscript) return;

        const recognition = recognitionRef.current;
        if (!recognition) return;
        
        if (listeningState === 'wake-word') {
            if (finalTranscript.toLowerCase().includes(voiceSettings.wakeWord.toLowerCase())) {
                isTransitioningRef.current = true; // Signal intent to switch mode
                playSoundEffect('donkey');
                speak(t('wakeWordAcknowledged'), language, t);
                recognition.stop(); // This will trigger onEnd
            }
        } else if (listeningState === 'command') {
            setListeningState('idle'); // Stop listening after command
            const lang = detectSpokenLanguage(finalTranscript);
            if (lang && lang !== language && lang !== 'en') {
                setDetectedLanguage(lang);
            } else {
                if (!parseVoiceCommand(finalTranscript)) {
                    setAiInitialQuery(finalTranscript);
                    setModal('aiCompanion');
                }
            }
        }
    }, [t, parseVoiceCommand, language, listeningState, voiceSettings.wakeWord]);
    
    const handleRecognitionError = useCallback((event: SpeechRecognitionErrorEvent) => {
        recognitionErrorRef.current = true;
        isTransitioningRef.current = false;
        let errorKey = 'voice_error_generic';
        if (event.error === 'network') errorKey = 'voice_error_network';
        else if (event.error === 'not-allowed' || event.error === 'service-not-allowed') {
            errorKey = 'voice_error_permission';
            handleSaveVoiceSettings({ ...voiceSettings, isEnabled: false });
        } else if (event.error === 'audio-capture') errorKey = 'voice_error_audio';
        
        setNotificationMessage(t(errorKey));
        setListeningState('idle');
    }, [t, voiceSettings, handleSaveVoiceSettings]);

    const handleRecognitionStart = useCallback(() => {
        // The transition is now complete, reset the semaphore.
        isTransitioningRef.current = false; 
    }, []);
    
    const startRecognition = useCallback((mode: 'wake-word' | 'command') => {
        const recognition = recognitionRef.current;
        if (!recognition) return;
        
        try {
            recognition.stop(); // Stop any previous instance
        } catch(e) { /* Ignore if already stopped */ }

        recognition.lang = language;
        recognition.continuous = (mode === 'wake-word');
        recognition.interimResults = true;
        recognitionErrorRef.current = false;
        
        try {
            lastStartTimeRef.current = Date.now();
            recognition.start();
            setListeningState(mode);
        } catch (e) {
            if (!(e instanceof DOMException && e.name === 'InvalidStateError')) {
                 console.error("Error starting speech recognition:", e);
            }
        }
    }, [language]);
    
    const stopRecognition = useCallback(() => {
        if (recognitionRef.current) {
            try {
                isTransitioningRef.current = false;
                recognitionRef.current.stop();
            } catch(e) {
                console.warn("Speech recognition couldn't be stopped, may have already stopped.", e);
            }
        }
        setListeningState('idle');
    }, []);

    const handleRecognitionEnd = useCallback(() => {
        // This is the core of the race condition fix.
        // If isTransitioningRef is true, it means onResult triggered this stop intentionally
        // to switch to 'command' mode.
        if (isTransitioningRef.current) {
            startRecognition('command');
            // onStart will reset the isTransitioningRef flag
            return;
        }

        // If not transitioning, this was an unexpected end (e.g., silence, network drop).
        // Check for rapid-fire restart errors.
        const timeSinceStart = Date.now() - lastStartTimeRef.current;
        if (timeSinceStart < 500) {
          recognitionErrorRef.current = true;
        }
        
        // Only restart if enabled and no error occurred.
        if (voiceSettings.isEnabled && !recognitionErrorRef.current) {
            setTimeout(() => startRecognition('wake-word'), 100); 
        } else {
            setListeningState('idle');
        }
    }, [startRecognition, voiceSettings.isEnabled]);
    
    useEffect(() => {
        recognitionHandlersRef.current = {
            onResult: handleRecognitionResult,
            onError: handleRecognitionError,
            onEnd: handleRecognitionEnd,
            onStart: handleRecognitionStart,
        };
    }, [handleRecognitionResult, handleRecognitionError, handleRecognitionEnd, handleRecognitionStart]);

    useEffect(() => {
        const SpeechRecognitionAPI = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
        if (!SpeechRecognitionAPI) {
            if (voiceSettings.isEnabled) {
                 setNotificationMessage(t('notification_voice_unsupported_desc'));
            }
            return;
        }

        if (!recognitionRef.current) {
            recognitionRef.current = new SpeechRecognitionAPI();
        }
        
        const recognition = recognitionRef.current;
        recognition.onresult = (event) => recognitionHandlersRef.current.onResult(event);
        recognition.onerror = (event) => recognitionHandlersRef.current.onError(event as SpeechRecognitionErrorEvent);
        recognition.onend = () => recognitionHandlersRef.current.onEnd();
        recognition.onstart = () => recognitionHandlersRef.current.onStart();

        if (voiceSettings.isEnabled && listeningState === 'idle') {
            startRecognition('wake-word');
        } else if (!voiceSettings.isEnabled) {
            stopRecognition();
        }

        return () => {
             if (recognition) {
                recognition.onresult = null;
                recognition.onerror = null;
                recognition.onend = null;
                recognition.onstart = null;
                try { recognition.stop(); } catch(e) { /* Ignore */ }
            }
        };
    }, [voiceSettings.isEnabled, startRecognition, stopRecognition, t, listeningState]);

    return (
        <div className="home-screen">
            {isLoading ? (
                <></>
            ) : (
                <>
                    <div className="main-content">
                        <MapView
                            center={defaultCenter}
                            zoom={defaultZoom}
                            userLocation={userLocation}
                            incidents={incidents}
                            pointsOfInterest={pointsOfInterest}
                            routeGeometry={route?.geometry ?? null}
                            isNavigating={appMode === 'navigating'}
                            onMapReady={setMap}
                            onMapBoundsChange={setMapBounds}
                            onFeatureClick={(feature) => { setSelectedFeature(feature); setModal('detail'); }}
                            poiFilters={poiFilters}
                            incidentFilters={incidentFilters}
                            currentLayer={currentLayer}
                            showPavementLayer={showPavementLayer}
                            trafficData={showTrafficLayer ? trafficData : null}
                        />

                        {appMode !== 'navigating' && (
                            <Header 
                                locationStatus={locationStatus}
                                onOpenAlerts={() => setModal('alertsCenter')}
                                hasAlerts={hasAlerts}
                            />
                        )}

                        {appMode === 'navigating' && (
                            <DriverHUD
                                speedLimit={route?.speedLimit}
                                speed={currentSpeed}
                                progress={navigationProgress}
                                remainingDistance={remainingDistance}
                                remainingTime={remainingTime}
                                onSaveRoute={() => setModal('saveTrip')}
                            />
                        )}
                        
                        <div className="ui-overlay">
                           <Notification message={notificationMessage} onDismiss={() => setNotificationMessage(null)} />
                           {detectedLanguage && (
                                <LanguageSwitchPrompt 
                                    detectedLang={detectedLanguage}
                                    onSwitch={() => {
                                        changeLanguage(detectedLanguage as any);
                                        setDetectedLanguage(null);
                                    }}
                                    onDismiss={() => {
                                        setDetectedLanguage(null);
                                    }}
                                />
                           )}

                            {appMode !== 'navigating' && (
                                <div className="floating-search-container">
                                    <SearchBar
                                        value={searchQuery}
                                        onChange={setSearchQuery}
                                        isLoading={isSearching}
                                        suggestions={searchSuggestions}
                                        onPlaceSelect={handlePlaceSelect}
                                        onVoiceInput={() => {
                                            if (listeningState === 'wake-word') {
                                                isTransitioningRef.current = true;
                                                recognitionRef.current?.stop();
                                            }
                                        }}
                                        listeningState={listeningState}
                                        searchError={searchError}
                                    />
                                    {appMode === 'exploring' && <POIFilter filters={poiFilters} onToggle={(type) => setPoiFilters(prev => ({ ...prev, [type]: !prev[type] }))} />}
                                </div>
                            )}

                            <div className="bottom-ui">
                                {appMode === 'landing' && <LandingView onExplore={handleExplore} />}
                                {appMode === 'exploring' && showPavementLayer && <PavementLegend />}
                                {appMode !== 'navigating' && (
                                    <FABMenu
                                        onReportIncident={() => setModal('reportIncident')}
                                        onRecenter={handleRecenter}
                                        onSavedRoutes={() => setModal('savedRoutes')}
                                        onOfflineMaps={() => setModal('offlineMaps')}
                                        onSelectLayer={() => setModal('layerSelection')}
                                        onFilterIncidents={() => setModal('incidentFilter')}
                                        onOpenAiCompanion={() => { setAiInitialQuery(null); setModal('aiCompanion'); }}
                                        onTogglePavementLayer={onTogglePavementLayer}
                                        isPavementLayerActive={showPavementLayer}
                                        onOpenSettings={() => setModal('settings')}
                                        onToggleTrafficLayer={() => setShowTrafficLayer(p => !p)}
                                        isTrafficLayerActive={showTrafficLayer}
                                        onOpenNearbyList={() => setModal('nearbyList')}
                                    />
                                )}
                            </div>
                        </div>
                    </div>
                    {appMode === 'routing' && (
                        <DirectionsPanel
                            route={route}
                            isLoading={isCalculatingRoute}
                            error={routeError}
                            onStart={handleStartNavigation}
                            onClose={handleCloseRouting}
                            onSave={() => setModal('saveTrip')}
                            onShowDetails={() => setModal('routeDetails')}
                            preference={routePreference}
                            onPreferenceChange={handlePreferenceChange}
                        />
                    )}
                </>
            )}

            {/* --- Modals --- */}
            <ReportIncidentModal isOpen={modal === 'reportIncident'} onClose={() => setModal(null)} onSubmitSuccess={() => setNotificationMessage('Report submitted!')}/>
            <DetailModal isOpen={modal === 'detail'} onClose={() => setModal(null)} feature={selectedFeature} onGetDirections={(feature) => { setModal(null); handlePlaceSelect(feature as Place); }} />
            <WeatherAlertModal isOpen={modal === 'weatherAlert'} onClose={() => setModal(null)} alert={activeWeatherAlert} />
            <LayerSelectionModal isOpen={modal === 'layerSelection'} onClose={() => setModal(null)} currentLayer={currentLayer} onChangeLayer={setCurrentLayer} />
            <OfflineMapsModal isOpen={modal === 'offlineMaps'} onClose={() => setModal(null)} />
            <SavedRoutesModal isOpen={modal === 'savedRoutes'} onClose={() => setModal(null)} onLoadRoute={(routeToLoad) => handlePlaceSelect({ id: routeToLoad.id, nameKey: routeToLoad.end.name, lat: routeToLoad.end.lat, lng: routeToLoad.end.lng, type: 'place' })} />
            <IncidentFilterModal isOpen={modal === 'incidentFilter'} onClose={() => setModal(null)} filters={incidentFilters} onFiltersChange={setIncidentFilters} />
            <AlertsCenterModal 
                isOpen={modal === 'alertsCenter'} 
                onClose={() => setModal(null)} 
                weatherData={weatherData} 
                incidents={incidents} 
                pointsOfInterest={pointsOfInterest}
                userLocation={userLocation ? { lat: userLocation[0], lng: userLocation[1] } : null}
                onFeatureSelect={(feature) => { setModal(null); setSelectedFeature(feature); setModal('detail'); }}
            />
             <SaveTripModal 
                isOpen={modal === 'saveTrip'} 
                onClose={() => setModal(null)} 
                onSave={(name, departureTime) => {
                    if (!route || !destination || !userLocation) return;
                    
                    const newSavedRoute: SavedRoute = {
                        id: `route_${Date.now()}`,
                        name: name,
                        start: { name: t('yourLocation'), lat: userLocation[0], lng: userLocation[1] },
                        end: { name: t(destination.nameKey), lat: destination.lat, lng: destination.lng },
                        distance: route.distance,
                        duration: route.duration,
                        ...(departureTime && { departureTime })
                    };
                    
                    try {
                        const existing = localStorage.getItem('sadak-sathi-saved-routes');
                        const routes = existing ? JSON.parse(existing) : [];
                        routes.push(newSavedRoute);
                        localStorage.setItem('sadak-sathi-saved-routes', JSON.stringify(routes));
                        setNotificationMessage(departureTime ? 'Trip planned!' : 'Route saved!');
                    } catch (e) {
                        console.error("Failed to save route:", e);
                        setNotificationMessage("Failed to save route.");
                    }
                    setModal(null);
                }}
            />
            <TripNotificationModal
                isOpen={modal === 'tripNotification'}
                onClose={() => setModal(null)}
                trip={tripToNotify}
                onStartTrip={(trip) => {
                     setModal(null);
                     handlePlaceSelect({ id: trip.id, nameKey: trip.end.name, lat: trip.end.lat, lng: trip.end.lng, type: 'place' });
                }}
            />
            <AiCompanionModal 
                isOpen={modal === 'aiCompanion'}
                onClose={() => setModal(null)}
                initialQuery={aiInitialQuery}
                userLocation={userLocation}
                weatherData={weatherData}
            />
            <RouteDetailsModal
                isOpen={modal === 'routeDetails'}
                onClose={() => setModal(null)}
                route={route}
            />
            <SettingsModal
                isOpen={modal === 'settings'}
                onClose={() => setModal(null)}
                currentWakeWord={voiceSettings.wakeWord}
                isWakeWordEnabled={voiceSettings.isEnabled}
                onSave={handleSaveVoiceSettings}
            />
            <NearbyListModal
                isOpen={modal === 'nearbyList'}
                onClose={() => setModal(null)}
                incidents={incidents.map(i => ({...i, distance: userLocation ? haversineDistance([i.lat, i.lng], userLocation) : undefined }))
                    .sort((a,b) => (a.distance ?? Infinity) - (b.distance ?? Infinity))}
                pois={pointsOfInterest.map(p => ({...p, distance: userLocation ? haversineDistance([p.lat, p.lng], userLocation) : undefined }))
                    .sort((a,b) => (a.distance ?? Infinity) - (b.distance ?? Infinity))}
                userLocation={userLocation ? { lat: userLocation[0], lng: userLocation[1] } : null}
                onFeatureSelect={(feature) => { setModal(null); setSelectedFeature(feature); setModal('detail'); }}
            />
        </div>
    );
};

export default HomeScreen;