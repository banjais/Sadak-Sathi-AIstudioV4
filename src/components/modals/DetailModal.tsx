import React from 'react';
import { useTranslation } from '../../hooks/useTranslation';

// Define a union type for the feature
type Feature = {
  id: number | string;
  type: string;
  titleKey?: string; // For incidents
  nameKey?: string; // For POIs
  descriptionKey?: string;
  lat: number;
  lng: number;
};

interface DetailModalProps {
    isOpen: boolean;
    onClose: () => void;
    feature: Feature | null;
    onGetDirections: (feature: Feature) => void;
}

// A helper to get icon and color based on type
const getFeatureStyle = (type: string) => {
    switch (type) {
        // Incidents
        case 'Blocked':
            return {
                icon: (
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="12" cy="12" r="10" /><line x1="4.93" y1="4.93" x2="19.07" y2="19.07" />
                    </svg>
                ),
                colorClass: 'detail-icon-blocked',
            };
        case 'One-Lane':
             return {
                icon: (
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><path d="M9 16l1-8"/><path d="M15 16l-1-8"/>
                    </svg>
                ),
                colorClass: 'detail-icon-one-lane',
            };
        // POIs
        case 'Fuel':
            return {
                icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 8V5a2 2 0 0 0-2-2H8a2 2 0 0 0-2 2v11a2 2 0 0 0 2 2h4a2 2 0 0 0 2-2v-3"/><line x1="14" y1="12" x2="6" y2="12"/></svg>,
                colorClass: 'detail-icon-fuel',
            };
        case 'Hospital':
            return {
                icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2" /><line x1="12" y1="8" x2="12" y2="16" /><line x1="8" y1="12" x2="16" y2="12" /></svg>,
                colorClass: 'detail-icon-hospital',
            };
        case 'Hotel':
             return {
                icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 7.66V20a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V7.66"/><path d="M22 7.66V5a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v2.66"/><path d="M8 7v15"/><path d="M16 7v15"/></svg>,
                colorClass: 'detail-icon-hotel',
            };
        case 'Services':
             return {
                icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06-.06a1.65 1.65 0 0 0-.33-1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>,
                colorClass: 'detail-icon-services',
            };
        default:
             return {
                icon: null,
                colorClass: '',
            };
    }
};

const getFeatureTypeTranslationKey = (type: string) => {
    const key = `incident_${type.toLowerCase().replace(/ /g, '_')}`;
    const poiKey = `poi_${type.toLowerCase()}_label`;

    const incidentKeys = ['incident_blocked', 'incident_one-lane', 'incident_traffic_jam', 'incident_road_hazard', 'incident_vehicle_breakdown', 'incident_other'];
    const poiKeys = ['poi_fuel_label', 'poi_hospital_label', 'poi_hotel_label', 'poi_services_label'];

    if (incidentKeys.includes(key)) return key;
    if (poiKeys.includes(poiKey)) return poiKey;
    
    return type;
};

const DetailModal: React.FC<DetailModalProps> = ({ isOpen, onClose, feature, onGetDirections }) => {
    const { t } = useTranslation();

    if (!isOpen || !feature) return null;

    const title = feature.titleKey ? t(feature.titleKey) : (feature.nameKey ? t(feature.nameKey) : t('details'));
    const { icon, colorClass } = getFeatureStyle(feature.type);
    const translatedType = t(getFeatureTypeTranslationKey(feature.type));
    
    const handleDirectionsClick = () => {
        onGetDirections(feature);
    };

    return (
        <div className="modal-overlay" onClick={onClose} role="dialog" aria-modal="true" aria-labelledby="detail-modal-title">
            <div className={`modal-content ${isOpen ? 'open' : ''}`} onClick={(e) => e.stopPropagation()}>
                <div className="modal-handle"></div>
                <header className="modal-header">
                    <h2 id="detail-modal-title" className="detail-modal-title">
                        {icon && <span className={`detail-modal-icon ${colorClass}`}>{icon}</span>}
                        {title}
                    </h2>
                    <button className="modal-close-button" onClick={onClose} aria-label={t('close')}>&times;</button>
                </header>
                <div className="modal-body">
                    <div className="detail-modal-content">
                        <p className="detail-modal-type">
                            <strong>{t('incidentType')}:</strong> {translatedType}
                        </p>
                        {feature.descriptionKey && <p>{t(feature.descriptionKey)}</p>}
                        <p className="detail-modal-coords">
                            <strong>{t('location')}:</strong> {feature.lat.toFixed(4)}, {feature.lng.toFixed(4)}
                        </p>
                    </div>
                </div>
                 <footer className="modal-footer">
                    <button type="button" className="modal-button" onClick={onClose}>
                        {t('close')}
                    </button>
                    <button type="button" className="modal-button modal-button-primary" onClick={handleDirectionsClick}>
                        {t('directions')}
                    </button>
                </footer>
            </div>
        </div>
    );
};

export default DetailModal;