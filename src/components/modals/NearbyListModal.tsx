import React, { useState } from 'react';
import { useTranslation } from '../../hooks/useTranslation';

// Define a union type for the feature
type Feature = {
  id: number | string;
  type: string;
  titleKey?: string;
  nameKey?: string;
  lat: number;
  lng: number;
  distance?: number;
};

interface NearbyListModalProps {
    isOpen: boolean;
    onClose: () => void;
    incidents: Feature[];
    pois: Feature[];
    userLocation: { lat: number; lng: number } | null;
    onFeatureSelect: (feature: Feature) => void;
}

// Icons
const ListIcon = () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="8" y1="6" x2="21" y2="6" /><line x1="8" y1="12" x2="21" y2="12" /><line x1="8" y1="18" x2="21" y2="18" /><line x1="3" y1="6" x2="3.01" y2="6" /><line x1="3" y1="12" x2="3.01" y2="12" /><line x1="3" y1="18" x2="3.01" y2="18" /></svg>;
const BlockedIcon = () => <svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" /><line x1="4.93" y1="4.93" x2="19.07" y2="19.07" /></svg>;
const OneLaneIcon = () => <svg viewBox="0 0 24 24"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><path d="M9 16l1-8"/><path d="M15 16l-1-8"/></svg>;
const TrafficJamIcon = () => <svg viewBox="0 0 24 24"><path d="M10 2H6v4h4V2zm8 0h-4v4h4V2zm-2 10h-2V8h2v4zm-4 0H8V8h4v4zm10 4h-2v-4h2v4zM4 16H2v-4h2v4zm-2 6h20v-4H2v4z"/></svg>;
const RoadHazardIcon = () => <svg viewBox="0 0 24 24"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" /><line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" /></svg>;
const BreakdownIcon = () => <svg viewBox="0 0 24 24"><path d="M14 17.25V15a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v2.25"/><path d="M12 13V2l-3 4h6L12 2z"/><circle cx="6" cy="19" r="2"/><circle cx="18" cy="19" r="2"/><path d="M4.5 19H2m18 0h-2.5"/><path d="M19 15h-2a2 2 0 0 0-2 2v2.25"/></svg>;
const OtherIcon = () => <svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" /><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" /><line x1="12" y1="17" x2="12.01" y2="17" /></svg>;
const FuelIcon = () => <svg viewBox="0 0 24 24"><path d="M14 8V5a2 2 0 0 0-2-2H8a2 2 0 0 0-2 2v11a2 2 0 0 0 2 2h4a2 2 0 0 0 2-2v-3"/><line x1="14" y1="12" x2="6" y2="12"/></svg>;
const HospitalIcon = () => <svg viewBox="0 0 24 24"><rect x="3" y="3" width="18" height="18" rx="2" ry="2" /><line x1="12" y1="8" x2="12" y2="16" /><line x1="8" y1="12" x2="16" y2="12" /></svg>;
const HotelIcon = () => <svg viewBox="0 0 24 24"><path d="M2 7.66V20a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V7.66"/><path d="M22 7.66V5a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v2.66"/><path d="M8 7v15"/><path d="M16 7v15"/></svg>;
const ServicesIcon = () => <svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06-.06a1.65 1.65 0 0 0-.33-1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>;


const featureMeta: { [key: string]: { icon: React.ReactNode; colorClass: string; typeKey: string } } = {
    'Blocked': { icon: <BlockedIcon />, colorClass: 'nearby-icon-blocked', typeKey: 'incident_blocked' },
    'One-Lane': { icon: <OneLaneIcon />, colorClass: 'nearby-icon-one-lane', typeKey: 'incident_one-lane' },
    'Traffic Jam': { icon: <TrafficJamIcon />, colorClass: 'nearby-icon-traffic-jam', typeKey: 'incident_traffic_jam' },
    'Road Hazard': { icon: <RoadHazardIcon />, colorClass: 'nearby-icon-road-hazard', typeKey: 'incident_road_hazard' },
    'Vehicle Breakdown': { icon: <BreakdownIcon />, colorClass: 'nearby-icon-vehicle-breakdown', typeKey: 'incident_vehicle_breakdown' },
    'Other': { icon: <OtherIcon />, colorClass: 'nearby-icon-other', typeKey: 'incident_other' },
    'Fuel': { icon: <FuelIcon />, colorClass: 'nearby-icon-fuel', typeKey: 'poi_fuel_label' },
    'Hospital': { icon: <HospitalIcon />, colorClass: 'nearby-icon-hospital', typeKey: 'poi_hospital_label' },
    'Hotel': { icon: <HotelIcon />, colorClass: 'nearby-icon-hotel', typeKey: 'poi_hotel_label' },
    'Services': { icon: <ServicesIcon />, colorClass: 'nearby-icon-services', typeKey: 'poi_services_label' },
};

const NearbyListModal: React.FC<NearbyListModalProps> = ({ isOpen, onClose, incidents, pois, onFeatureSelect }) => {
    const { t } = useTranslation();
    const [activeTab, setActiveTab] = useState<'incidents' | 'pois'>('incidents');

    const formatDistance = (meters: number): string => {
        if (meters < 1000) return `${Math.round(meters)} m`;
        return `${(meters / 1000).toFixed(1)} km`;
    };

    const renderListItem = (feature: Feature) => {
        const title = feature.titleKey ? t(feature.titleKey) : (feature.nameKey ? t(feature.nameKey) : 'Unknown');
        const meta = featureMeta[feature.type] || featureMeta['Other'];

        return (
            <li key={`${feature.type}-${feature.id}`} className="nearby-list-item" onClick={() => onFeatureSelect(feature)}>
                <div className={`nearby-item-icon ${meta.colorClass}`}>
                    {meta.icon}
                </div>
                <div className="nearby-item-info">
                    <h4>{title}</h4>
                    <p>{t(meta.typeKey)}</p>
                </div>
                {feature.distance !== undefined && (
                    <span className="nearby-item-distance">
                        {formatDistance(feature.distance)}
                    </span>
                )}
            </li>
        );
    };
    
    if (!isOpen) return null;

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className={`modal-content ${isOpen ? 'open' : ''}`} onClick={(e) => e.stopPropagation()}>
                <div className="modal-handle"></div>
                <header className="modal-header">
                    <h2><ListIcon /> {t('nearbyListTitle')}</h2>
                    <button className="modal-close-button" onClick={onClose} aria-label={t('close')}>&times;</button>
                </header>
                 <div className="modal-tabs">
                    <button className={`modal-tab-button ${activeTab === 'incidents' ? 'active' : ''}`} onClick={() => setActiveTab('incidents')}>{t('incidentsTab')}</button>
                    <button className={`modal-tab-button ${activeTab === 'pois' ? 'active' : ''}`} onClick={() => setActiveTab('pois')}>{t('poisTab')}</button>
                </div>
                <div className="modal-body">
                    {activeTab === 'incidents' && (
                        incidents.length > 0 ? (
                            <ul className="nearby-list">{incidents.map(renderListItem)}</ul>
                        ) : (
                            <p className="empty-state-message">{t('noIncidentsNearby')}</p>
                        )
                    )}
                     {activeTab === 'pois' && (
                        pois.length > 0 ? (
                            <ul className="nearby-list">{pois.map(renderListItem)}</ul>
                        ) : (
                            <p className="empty-state-message">{t('noPoisNearby')}</p>
                        )
                    )}
                </div>
            </div>
        </div>
    );
};

export default NearbyListModal;