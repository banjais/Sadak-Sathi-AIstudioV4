import React, { useState, useEffect } from 'react';
import { useTranslation } from '../../hooks/useTranslation';

interface IncidentFilterModalProps {
    isOpen: boolean;
    onClose: () => void;
    filters: { [key: string]: boolean };
    onFiltersChange: (newFilters: { [key: string]: boolean }) => void;
}

const FilterIcon = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"></polygon>
    </svg>
);

const incidentTypeMapping: { [key: string]: string } = {
    'Blocked': 'incident_blocked',
    'One-Lane': 'incident_one-lane',
    'Traffic Jam': 'incident_traffic_jam',
    'Road Hazard': 'incident_road_hazard',
    'Vehicle Breakdown': 'incident_vehicle_breakdown',
    'Other': 'incident_other'
};

const IncidentFilterModal: React.FC<IncidentFilterModalProps> = ({ isOpen, onClose, filters, onFiltersChange }) => {
    const { t } = useTranslation();
    const [tempFilters, setTempFilters] = useState(filters);

    useEffect(() => {
        if (isOpen) {
            setTempFilters(filters);
        }
    }, [isOpen, filters]);

    const handleCheckboxChange = (type: string) => {
        setTempFilters(prev => ({ ...prev, [type]: !prev[type] }));
    };

    const handleApply = () => {
        onFiltersChange(tempFilters);
        onClose();
    };

    const handleReset = () => {
        const allTrue = Object.keys(tempFilters).reduce((acc, key) => {
            acc[key] = true;
            return acc;
        }, {} as { [key: string]: boolean });
        setTempFilters(allTrue);
    };

    if (!isOpen) return null;

    return (
        <div className="modal-overlay" onClick={onClose} role="dialog" aria-modal="true" aria-labelledby="filter-modal-title">
            <div className={`modal-content ${isOpen ? 'open' : ''}`} onClick={(e) => e.stopPropagation()}>
                <div className="modal-handle"></div>
                <header className="modal-header">
                    <h2 id="filter-modal-title">
                        <FilterIcon /> {t('filterIncidentsTitle')}
                    </h2>
                    <button className="modal-close-button" onClick={onClose} aria-label={t('close')}>&times;</button>
                </header>
                <div className="modal-body">
                    <div className="filter-list">
                        {Object.entries(incidentTypeMapping).map(([key, translationKey]) => (
                            <div key={key} className="filter-item" onClick={() => handleCheckboxChange(key)}>
                                <label htmlFor={`filter-${key}`}>{t(translationKey)}</label>
                                <input
                                    type="checkbox"
                                    id={`filter-${key}`}
                                    checked={!!tempFilters[key]}
                                    onChange={() => handleCheckboxChange(key)}
                                />
                            </div>
                        ))}
                    </div>
                </div>
                <footer className="modal-footer">
                    <button type="button" className="modal-button" onClick={handleReset}>
                        {t('resetFilters')}
                    </button>
                    <button type="button" className="modal-button modal-button-primary" onClick={handleApply}>
                        {t('applyFilters')}
                    </button>
                </footer>
            </div>
        </div>
    );
};

export default IncidentFilterModal;