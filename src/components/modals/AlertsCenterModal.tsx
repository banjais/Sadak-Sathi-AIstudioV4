import React from 'react';
import { useTranslation } from '../../hooks/useTranslation';
import { WeatherData } from '../../api/weatherApi';
import { haversineDistance } from '../../utils/geometry';

// Define a union type for the feature
type Feature = {
  id: number | string;
  type: string;
  titleKey?: string;
  nameKey?: string;
  descriptionKey?: string;
  lat: number;
  lng: number;
};

interface AlertsCenterModalProps {
    isOpen: boolean;
    onClose: () => void;
    weatherData: WeatherData | null;
    incidents: Feature[];
    pointsOfInterest: Feature[];
    userLocation: { lat: number; lng: number } | null;
    onFeatureSelect: (feature: Feature) => void;
}

// --- Icons ---

const AlertsIcon = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
        <path d="M13.73 21a2 2 0 0 1-3.46 0" />
    </svg>
);

const WeatherAlertIcon = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
        <line x1="12" y1="9" x2="12" y2="13" />
        <line x1="12" y1="17" x2="12.01" y2="17" />
    </svg>
);

const IncidentIcon = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
       <circle cx="12" cy="12" r="10" /><line x1="4.93" y1="4.93" x2="19.07" y2="19.07" />
    </svg>
);

const WeatherConditionIcon: React.FC<{ condition: WeatherData['condition'] }> = ({ condition }) => {
    switch (condition) {
        case 'Clear':
            return <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="5" /><line x1="12" y1="1" x2="12" y2="3" /><line x1="12" y1="21" x2="12" y2="23" /><line x1="4.22" y1="4.22" x2="5.64" y2="5.64" /><line x1="18.36" y1="18.36" x2="19.78" y2="19.78" /><line x1="1" y1="12" x2="3" y2="12" /><line x1="21" y1="12" x2="23" y2="12" /><line x1="4.22" y1="19.78" x2="5.64" y2="18.36" /><line x1="18.36" y1="5.64" x2="19.78" y2="4.22" /></svg>;
        case 'Clouds':
            return <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 10h-1.26A8 8 0 1 0 9 20h9a5 5 0 0 0 0-10z" /></svg>;
        case 'Rain':
            return <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 16.58A5 5 0 0 0 18 8h-1.26A8 8 0 1 0 4 16.25" /><line x1="8" y1="20" x2="8" y2="22" /><line x1="12" y1="20" x2="12" y2="22" /><line x1="16" y1="20" x2="16" y2="22" /></svg>;
        default:
            return <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="5" /></svg>;
    }
};

const WindIcon = () => <svg width="24" height="24" className="detail-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9.59 4.59A2 2 0 1 1 11 8H2m10.59 11.41A2 2 0 1 0 14 16H2m15.73-8.27A2.5 2.5 0 1 1 19.5 12H2" /></svg>;
const RainIcon = () => <svg width="24" height="24" className="detail-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0L12 2.69z" /></svg>;
const VisibilityIcon = () => <svg width="24" height="24" className="detail-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7z" /><circle cx="12" cy="12" r="3" /></svg>;
const PressureIcon = () => <svg width="24" height="24" className="detail-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20z" /><path d="M12 7v5l3 3" /></svg>;


const AlertsCenterModal: React.FC<AlertsCenterModalProps> = ({ 
    isOpen, 
    onClose, 
    weatherData,
    incidents,
    pointsOfInterest,
    userLocation,
    onFeatureSelect,
}) => {
    const { t } = useTranslation();

    if (!isOpen) return null;

    const severeWeatherAlerts = weatherData?.alerts.filter(a => a.severity === 'severe') || [];
    const criticalIncidents = incidents.filter(i => i.type === 'Blocked');

    const allFeatures = [...incidents, ...pointsOfInterest];
    
    // Sort features by distance from user if location is available
    if (userLocation) {
        allFeatures.sort((a, b) => {
            const distA = haversineDistance([a.lat, a.lng], [userLocation.lat, userLocation.lng]);
            const distB = haversineDistance([b.lat, b.lng], [userLocation.lat, userLocation.lng]);
            return distA - distB;
        });
    }

    const renderFeatureItem = (feature: Feature) => {
        const title = feature.titleKey ? t(feature.titleKey) : (feature.nameKey ? t(feature.nameKey) : 'Unknown');
        const isCritical = feature.type === 'Blocked';
        
        let distanceText = '';
        if (userLocation) {
            const distanceMeters = haversineDistance([feature.lat, feature.lng], [userLocation.lat, userLocation.lng]);
            if (distanceMeters < 1000) {
                distanceText = `${Math.round(distanceMeters)} m`;
            } else {
                distanceText = `${(distanceMeters / 1000).toFixed(1)} km`;
            }
        }

        return (
            <li key={`${feature.type}-${feature.id}`} className={`alert-item ${isCritical ? 'critical' : ''}`} onClick={() => onFeatureSelect(feature)}>
                <div className="alert-item-icon">
                    {isCritical ? <IncidentIcon /> : null}
                </div>
                <div className="alert-item-content">
                    <h4>{title}</h4>
                    <p>{t(`incident_${feature.type.toLowerCase().replace(/ /g, '_')}`)} {distanceText && `• ${distanceText}`}</p>
                </div>
            </li>
        );
    };

    return (
        <div className="modal-overlay" onClick={onClose} role="dialog" aria-modal="true" aria-labelledby="alerts-center-title">
            <div className={`modal-content ${isOpen ? 'open' : ''}`} onClick={(e) => e.stopPropagation()}>
                <div className="modal-handle"></div>
                <header className="modal-header">
                    <h2 id="alerts-center-title">
                        <AlertsIcon /> {t('alertsCenterTitle')}
                    </h2>
                    <button className="modal-close-button" onClick={onClose} aria-label={t('close')}>&times;</button>
                </header>
                <div className="modal-body alerts-center-body">
                    
                    <div className="alerts-section">
                        {weatherData ? (
                            <>
                                <div className="weather-display">
                                    <div className="weather-summary">
                                        <div className="weather-icon">
                                            <WeatherConditionIcon condition={weatherData.condition} />
                                        </div>
                                        <span className="weather-temp">{Math.round(weatherData.temperature)}°C</span>
                                    </div>
                                    <span>{t(weatherData.conditionKey)}</span>
                                </div>
                                <div className="weather-details-grid">
                                    <div className="weather-detail-item">
                                        <WindIcon />
                                        <span className="detail-value">{weatherData.windSpeed} km/h</span>
                                        <span className="detail-label">{t('wind')}</span>
                                    </div>
                                    <div className="weather-detail-item">
                                        <RainIcon />
                                        <span className="detail-value">{weatherData.rainProbability}%</span>
                                        <span className="detail-label">{t('rain')}</span>
                                    </div>
                                    <div className="weather-detail-item">
                                        <VisibilityIcon />
                                        <span className="detail-value">{weatherData.visibility} km</span>
                                        <span className="detail-label">{t('visibility')}</span>
                                    </div>
                                    <div className="weather-detail-item">
                                        <PressureIcon />
                                        <span className="detail-value">{weatherData.pressure} hPa</span>
                                        <span className="detail-label">{t('pressure')}</span>
                                    </div>
                                </div>
                            </>
                        ) : (
                             <div className="weather-display" style={{ textAlign: 'center', color: 'var(--c-text-secondary)'}}>
                                {t('error_fetch_weather')}
                            </div>
                        )}
                    </div>
                    
                    {severeWeatherAlerts.length > 0 && (
                        <div className="alerts-section weather-alerts-section">
                            <h3>{t('weatherAlerts')}</h3>
                            <ul>
                                {severeWeatherAlerts.map(alert => (
                                    <li key={alert.id} className="alert-item critical">
                                        <div className="alert-item-icon"><WeatherAlertIcon /></div>
                                        <div className="alert-item-content">
                                            <h4>{t(alert.titleKey)}</h4>
                                            <p>{t(alert.descriptionKey)}</p>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}
                    
                    {criticalIncidents.length > 0 && (
                         <div className="alerts-section">
                            <h3>{t('criticalIncidents')}</h3>
                            <ul className="alert-list">
                                {criticalIncidents.map(renderFeatureItem)}
                            </ul>
                        </div>
                    )}

                    <div className="alerts-section">
                        <h3>{t('nearbyReports')}</h3>
                        {allFeatures.length > 0 ? (
                            <ul className="alert-list">
                                {allFeatures.slice(0, 10).map(renderFeatureItem)}
                            </ul>
                        ) : (
                            <p>{t('noNearbyReports')}</p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AlertsCenterModal;
