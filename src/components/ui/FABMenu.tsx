import React, { useState } from 'react';
import { useTranslation } from '../../hooks/useTranslation';

// Modern Icons
const PlusIcon = () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>;
const GpsIcon = () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="3 11 22 2 13 21 11 13 3 11" /></svg>;
const ReportIcon = () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" /><line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" /></svg>;
const RouteIcon = () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><polygon points="10 8 16 12 10 16 10 8" /></svg>;
const DownloadIcon = () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" /></svg>;
const LayersIcon = () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 2 7 12 12 22 7 12 2" /><polyline points="2 17 12 22 22 17" /><polyline points="2 12 12 17 22 12" /></svg>;
const FilterIcon = () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" /></svg>;
const AiIcon = () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 8V4H8" /><rect x="4" y="4" width="16" height="16" rx="2" /><path d="M2 14h2" /><path d="M20 14h2" /><path d="M15 13v2" /><path d="M9 13v2" /></svg>;
const RoadIcon = () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" /><path d="M6.5 2H20v15H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" /><line x1="12" y1="2" x2="12" y2="17" /></svg>;
const SettingsIcon = () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06-.06a1.65 1.65 0 0 0-.33-1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" /></svg>;
const TrafficIcon = () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="7" y="2" width="10" height="20" rx="5" ry="5" /><circle cx="12" cy="7" r="1.5" fill="currentColor" stroke="none" /><circle cx="12" cy="12" r="1.5" fill="currentColor" stroke="none" /><circle cx="12" cy="17" r="1.5" fill="currentColor" stroke="none" /></svg>;
const ListIcon = () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="8" y1="6" x2="21" y2="6" /><line x1="8" y1="12" x2="21" y2="12" /><line x1="8" y1="18" x2="21" y2="18" /><line x1="3" y1="6" x2="3.01" y2="6" /><line x1="3" y1="12" x2="3.01" y2="12" /><line x1="3" y1="18" x2="3.01" y2="18" /></svg>;


interface FABMenuProps {
    onReportIncident: () => void;
    onRecenter: () => void;
    onSavedRoutes: () => void;
    onOfflineMaps: () => void;
    onSelectLayer: () => void;
    onFilterIncidents: () => void;
    onOpenAiCompanion: () => void;
    onTogglePavementLayer: () => void;
    isPavementLayerActive: boolean;
    onOpenSettings: () => void;
    onToggleTrafficLayer: () => void;
    isTrafficLayerActive: boolean;
    onOpenNearbyList: () => void;
}

const FABMenu: React.FC<FABMenuProps> = ({ 
    onReportIncident, 
    onRecenter, 
    onSavedRoutes, 
    onOfflineMaps, 
    onSelectLayer, 
    onFilterIncidents,
    onOpenAiCompanion,
    onTogglePavementLayer,
    isPavementLayerActive,
    onOpenSettings,
    onToggleTrafficLayer,
    isTrafficLayerActive,
    onOpenNearbyList,
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const { t } = useTranslation();

    const toggleMenu = () => setIsOpen(!isOpen);

    const handleItemClick = (action: () => void) => {
        action();
        setIsOpen(false);
    };

    return (
        <div className="fab-container">
            {isOpen && (
                <div className="fab-menu">
                     <button className="fab-menu-item" onClick={() => handleItemClick(onOpenAiCompanion)} aria-label={t('aiCompanionTitle')}>
                        <AiIcon />
                    </button>
                    <button className="fab-menu-item" onClick={() => handleItemClick(onReportIncident)} aria-label={t('reportAnIncident')}>
                        <ReportIcon />
                    </button>
                     <button className="fab-menu-item" onClick={() => handleItemClick(onOpenNearbyList)} aria-label={t('nearbyPlaces')}>
                        <ListIcon />
                    </button>
                    <button className="fab-menu-item" onClick={() => handleItemClick(onFilterIncidents)} aria-label={t('filterIncidentsTitle')}>
                        <FilterIcon />
                    </button>
                    <button className={`fab-menu-item ${isTrafficLayerActive ? 'active' : ''}`} onClick={() => handleItemClick(onToggleTrafficLayer)} aria-label={t('toggleTrafficLayer')} aria-pressed={isTrafficLayerActive}>
                        <TrafficIcon />
                    </button>
                     <button className={`fab-menu-item ${isPavementLayerActive ? 'active' : ''}`} onClick={() => handleItemClick(onTogglePavementLayer)} aria-label={t('togglePavementLayer')} aria-pressed={isPavementLayerActive}>
                        <RoadIcon />
                    </button>
                    <button className="fab-menu-item" onClick={() => handleItemClick(onRecenter)} aria-label={t('recenterMap')}>
                        <GpsIcon />
                    </button>
                     <button className="fab-menu-item" onClick={() => handleItemClick(onSavedRoutes)} aria-label={t('savedRoutesTitle')}>
                        <RouteIcon />
                    </button>
                    <button className="fab-menu-item" onClick={() => handleItemClick(onOfflineMaps)} aria-label={t('offlineMapsTitle')}>
                        <DownloadIcon />
                    </button>
                    <button className="fab-menu-item" onClick={() => handleItemClick(onSelectLayer)} aria-label={t('selectMapLayer')}>
                        <LayersIcon />
                    </button>
                    <button className="fab-menu-item" onClick={() => handleItemClick(onOpenSettings)} aria-label={t('settingsTitle')}>
                        <SettingsIcon />
                    </button>
                </div>
            )}
            <button className={`fab-main ${isOpen ? 'open' : ''}`} onClick={toggleMenu} aria-haspopup="true" aria-expanded={isOpen} aria-label={t('openMenu')}>
                <PlusIcon />
            </button>
        </div>
    );
};

export default FABMenu;