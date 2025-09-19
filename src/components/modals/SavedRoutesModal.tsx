import React, { useState, useEffect } from 'react';
import { useTranslation } from '../../hooks/useTranslation';

// Mock route data structure
export interface SavedRoute {
  id: string;
  name: string;
  start: { name: string; lat: number; lng: number };
  end: { name: string; lat: number; lng: number };
  distance: number; // in meters
  duration: number; // in seconds
  departureTime?: number; // timestamp
}

// Mock local storage access
const SAVED_ROUTES_KEY = 'sadak-sathi-saved-routes';

const getSavedRoutes = (): SavedRoute[] => {
    try {
        const data = localStorage.getItem(SAVED_ROUTES_KEY);
        if (data) {
            try {
                return JSON.parse(data);
            } catch (parseError) {
                console.error("Corrupted saved routes data in localStorage. Clearing.", parseError);
                try {
                    localStorage.removeItem(SAVED_ROUTES_KEY);
                } catch (removeError) {
                    console.error("Failed to remove corrupted routes key.", removeError);
                }
                return [];
            }
        }
        return [];
    } catch (e) {
        console.error("Failed to read saved routes from localStorage. It might be disabled.", e);
        return [];
    }
};

const saveRoutesToStorage = (routes: SavedRoute[]) => {
    try {
        localStorage.setItem(SAVED_ROUTES_KEY, JSON.stringify(routes));
    } catch (e) {
        console.error("Failed to save routes to localStorage", e);
    }
};

// Icons
const TrashIcon = () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6" /><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" /><line x1="10" y1="11" x2="10" y2="17" /><line x1="14" y1="11" x2="14" y2="17" /></svg>;

interface SavedRoutesModalProps {
    isOpen: boolean;
    onClose: () => void;
    onLoadRoute: (route: SavedRoute) => void;
}

const SavedRoutesModal: React.FC<SavedRoutesModalProps> = ({ isOpen, onClose, onLoadRoute }) => {
    const { t } = useTranslation();
    const [allRoutes, setAllRoutes] = useState<SavedRoute[]>([]);
    const [activeTab, setActiveTab] = useState<'routes' | 'trips'>('routes');
    const [timeNow, setTimeNow] = useState(Date.now());

    useEffect(() => {
        if (isOpen) {
            setAllRoutes(getSavedRoutes());
            const timer = setInterval(() => setTimeNow(Date.now()), 1000); // Update time for countdown
            return () => clearInterval(timer);
        }
    }, [isOpen]);

    const handleDeleteRoute = (e: React.MouseEvent, routeId: string) => {
        e.stopPropagation(); // prevent li click
        const updatedRoutes = allRoutes.filter(route => route.id !== routeId);
        setAllRoutes(updatedRoutes);
        saveRoutesToStorage(updatedRoutes);
    };

    const handleLoadRoute = (route: SavedRoute) => {
        onLoadRoute(route);
        onClose();
    };
    
    const formatDuration = (seconds: number): string => {
        const h = Math.floor(seconds / 3600);
        const m = Math.floor((seconds % 3600) / 60);
        return `${h > 0 ? `${h}h ` : ''}${m}m`;
    };

    const formatCountdown = (departureTime: number): string => {
        // Ensure we are working with seconds and handle the case where time has passed.
        const remainingSeconds = Math.max(0, Math.round((departureTime - timeNow) / 1000));

        if (remainingSeconds === 0) {
            return t('departed');
        }
        
        const days = Math.floor(remainingSeconds / 86400);
        if (days > 0) {
            return t('departsInDays', { count: days });
        }

        // For trips within the next 24 hours, provide a dynamic HH:MM:SS timer for real-time feedback.
        const hours = Math.floor(remainingSeconds / 3600);
        const minutes = Math.floor((remainingSeconds % 3600) / 60);
        const seconds = remainingSeconds % 60;

        const pad = (num: number) => String(num).padStart(2, '0');

        return `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
    };

    const savedOnlyRoutes = allRoutes.filter(r => !r.departureTime);
    const plannedTrips = allRoutes.filter(r => r.departureTime).sort((a, b) => a.departureTime! - b.departureTime!);

    const renderRouteItem = (route: SavedRoute) => (
        <li key={route.id} className="saved-route-item" onClick={() => handleLoadRoute(route)}>
            <div className="saved-route-info">
                <h3>{route.name}</h3>
                <p>{route.start.name} → {route.end.name}</p>
                 <div className="trip-details">
                    <span>{`${(route.distance / 1000).toFixed(1)} km, ${formatDuration(route.duration)}`}</span>
                    {route.departureTime && (
                        <>
                            <span>{new Date(route.departureTime).toLocaleString()}</span>
                            <span className="trip-countdown">{formatCountdown(route.departureTime)}</span>
                        </>
                    )}
                 </div>
            </div>
            <div className="saved-route-actions">
                {route.departureTime && <button className="start-trip-btn" onClick={(e) => { e.stopPropagation(); handleLoadRoute(route); }}>{t('startNow')}</button>}
                <button onClick={(e) => handleDeleteRoute(e, route.id)} className="delete-route-btn" aria-label={t('delete')}><TrashIcon /></button>
            </div>
        </li>
    );

    if (!isOpen) return null;

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className={`modal-content ${isOpen ? 'open' : ''}`} onClick={(e) => e.stopPropagation()}>
                <div className="modal-handle"></div>
                <header className="modal-header">
                    <h2>{t('savedRoutesTitle')}</h2>
                    <button className="modal-close-button" onClick={onClose} aria-label={t('close')}>&times;</button>
                </header>
                <div className="modal-tabs">
                    <button className={`modal-tab-button ${activeTab === 'routes' ? 'active' : ''}`} onClick={() => setActiveTab('routes')}>{t('savedRoutes')}</button>
                    <button className={`modal-tab-button ${activeTab === 'trips' ? 'active' : ''}`} onClick={() => setActiveTab('trips')}>{t('plannedTrips')}</button>
                </div>
                <div className="modal-body">
                    {activeTab === 'routes' && (
                        savedOnlyRoutes.length > 0 ? (
                            <ul className="saved-routes-list">{savedOnlyRoutes.map(renderRouteItem)}</ul>
                        ) : (
                            <p className="empty-state-message">{t('noSavedRoutes')}</p>
                        )
                    )}
                    {activeTab === 'trips' && (
                        plannedTrips.length > 0 ? (
                            <ul className="saved-routes-list">{plannedTrips.map(renderRouteItem)}</ul>
                        ) : (
                             <p className="empty-state-message">{t('noPlannedTrips')}</p>
                        )
                    )}
                </div>
            </div>
        </div>
    );
};

export default SavedRoutesModal;