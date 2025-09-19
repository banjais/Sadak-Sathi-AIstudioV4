import React from 'react';
import { useTranslation } from '../../hooks/useTranslation';

// SVG Icons for POIs
const FuelIcon = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 8V5a2 2 0 0 0-2-2H8a2 2 0 0 0-2 2v11a2 2 0 0 0 2 2h4a2 2 0 0 0 2-2v-3"/><line x1="14" y1="12" x2="6" y2="12"/></svg>;
const HospitalIcon = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2" /><line x1="12" y1="8" x2="12" y2="16" /><line x1="8" y1="12" x2="16" y2="12" /></svg>;
const HotelIcon = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 7.66V20a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V7.66"/><path d="M22 7.66V5a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v2.66"/><path d="M8 7v15"/><path d="M16 7v15"/></svg>;
const ServicesIcon = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06-.06a1.65 1.65 0 0 0-.33-1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>;


interface POIFilterProps {
    filters: {
        Fuel: boolean;
        Hospital: boolean;
        Hotel: boolean;
        Services: boolean;
    };
    onToggle: (poiType: 'Fuel' | 'Hospital' | 'Hotel' | 'Services') => void;
}

const poiTypes = [
    { type: 'Fuel', icon: <FuelIcon />, labelKey: 'poi_fuel_label' },
    { type: 'Hospital', icon: <HospitalIcon />, labelKey: 'poi_hospital_label' },
    { type: 'Hotel', icon: <HotelIcon />, labelKey: 'poi_hotel_label' },
    { type: 'Services', icon: <ServicesIcon />, labelKey: 'poi_services_label' }
] as const;


const POIFilter: React.FC<POIFilterProps> = ({ filters, onToggle }) => {
    const { t } = useTranslation();

    return (
        <div className="poi-filter-container">
            {poiTypes.map(({ type, icon, labelKey }) => (
                 <button
                    key={type}
                    className={`poi-filter-button ${filters[type] ? 'active' : ''}`}
                    onClick={() => onToggle(type)}
                    aria-label={t(labelKey)}
                    aria-pressed={filters[type]}
                >
                    {icon}
                    <span>{t(labelKey)}</span>
                </button>
            ))}
        </div>
    );
};

export default POIFilter;