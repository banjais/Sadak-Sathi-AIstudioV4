import React, { useState, useEffect } from 'react';
import { useTranslation } from '../../hooks/useTranslation';
import { Route, RoutePreference } from '../../api/routingApi';

// Helper function to format duration from seconds
const formatDuration = (seconds: number): string => {
    if (seconds < 60) return `~1 min`;
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const parts: string[] = [];
    if (h > 0) parts.push(`${h}h`);
    if (m > 0) parts.push(`${m}m`);
    return parts.join(' ');
};

// Helper function to format distance from meters
const formatDistance = (meters: number): string => {
    return `${(meters / 1000).toFixed(1)} km`;
};

// Icons
const ClockIcon = () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>;
const DistanceIcon = () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg>;
const ArrivalIcon = () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" /><circle cx="12" cy="10" r="3" /></svg>;

// New preference icons
const FastestIcon = () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" /></svg>;
const ShortestIcon = () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="4" y1="12" x2="20" y2="12" /><polyline points="14 6 20 12 14 18" /><polyline points="10 18 4 12 10 6" /></svg>;
const AvoidHighwaysIcon = () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2v20"/><path d="M18 2v20"/><path d="M6 2v20"/><line x1="2" y1="2" x2="22" y2="22"/></svg>;
const ErrorIcon = () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" /></svg>;

interface DirectionsPanelProps {
    route: Route | null;
    isLoading: boolean;
    error: string | null;
    onStart: () => void;
    onClose: () => void;
    onSave: () => void;
    onShowDetails: () => void;
    preference: RoutePreference;
    onPreferenceChange: (preference: RoutePreference) => void;
}

const preferenceOptions: { id: RoutePreference; icon: React.FC; labelKey: string }[] = [
    { id: 'fastest', icon: FastestIcon, labelKey: 'routePreference_fastest' },
    { id: 'shortest', icon: ShortestIcon, labelKey: 'routePreference_shortest' },
    { id: 'avoidHighways', icon: AvoidHighwaysIcon, labelKey: 'routePreference_avoidHighways' }
];

const DirectionsPanel: React.FC<DirectionsPanelProps> = ({ route, isLoading, error, onStart, onClose, onSave, onShowDetails, preference, onPreferenceChange }) => {
    const { t } = useTranslation();
    const [eta, setEta] = useState('');

    useEffect(() => {
        if (!route) return;

        const calculateAndSetETA = () => {
            // For very short trips, display '~1 min' to match duration format and avoid confusion.
            if (route.duration < 60) {
                setEta('~1 min');
                return;
            }
            const now = new Date();
            const arrivalTime = new Date(now.getTime() + route.duration * 1000);
            const formattedTime = arrivalTime.toLocaleTimeString(undefined, {
                hour: '2-digit',
                minute: '2-digit',
            });
            setEta(formattedTime);
        };

        calculateAndSetETA(); // Initial calculation

        // Only set an interval to update the ETA for longer trips.
        let intervalId: number | undefined;
        if (route.duration >= 60) {
            intervalId = window.setInterval(calculateAndSetETA, 30000); // Update every 30 seconds
        }

        return () => {
            if (intervalId) {
                clearInterval(intervalId);
            }
        };
    }, [route]);

    return (
        <div className="directions-panel">
            <button className="directions-close-button" onClick={onClose} aria-label={t('close')}>&times;</button>
            <div className="directions-content">
                {isLoading && (
                    <div className="directions-loader">
                        <div className="loader-large"></div>
                        <span>{t('calculatingRoute')}</span>
                    </div>
                )}
                {error && !isLoading && (
                     <div className="directions-loader" style={{ color: 'var(--c-danger)' }}>
                        <ErrorIcon />
                        <span>{error}</span>
                    </div>
                )}
                {!isLoading && !error && route && (
                    <>
                        <div className="directions-preferences">
                            {preferenceOptions.map(opt => (
                                <button
                                    key={opt.id}
                                    className={`preference-button ${preference === opt.id ? 'active' : ''}`}
                                    onClick={() => onPreferenceChange(opt.id)}
                                    aria-pressed={preference === opt.id}
                                >
                                    <opt.icon />
                                    {t(opt.labelKey)}
                                </button>
                            ))}
                        </div>
                        <div className="directions-summary">
                            <div className="summary-item">
                                <ClockIcon />
                                <span>{formatDuration(route.duration)}</span>
                            </div>
                            <div className="summary-item">
                                <ArrivalIcon />
                                <span>{t('eta')} {eta}</span>
                            </div>
                            <div className="summary-item">
                                <DistanceIcon />
                                <span>{formatDistance(route.distance)}</span>
                            </div>
                        </div>
                        <div className="directions-actions">
                            <button className="directions-secondary-button" onClick={onSave}>
                                {t('saveRoute')}
                            </button>
                             <button className="directions-secondary-button" onClick={onShowDetails}>
                                {t('details')}
                            </button>
                            <button className="directions-start-button" onClick={onStart}>
                                {t('startNavigation')}
                            </button>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

export default DirectionsPanel;