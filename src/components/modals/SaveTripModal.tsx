import React, { useState, useEffect } from 'react';
import { useTranslation } from '../../hooks/useTranslation';

const SaveIcon = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" />
        <polyline points="17 21 17 13 7 13 7 21" />
        <polyline points="7 3 7 8 15 8" />
    </svg>
);

interface SaveTripModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (name: string, departureTime?: number) => void;
}

const SaveTripModal: React.FC<SaveTripModalProps> = ({ isOpen, onClose, onSave }) => {
    const { t } = useTranslation();
    const [routeName, setRouteName] = useState('');
    const [departureDateTime, setDepartureDateTime] = useState('');

    useEffect(() => {
        if (!isOpen) {
            setRouteName('');
            setDepartureDateTime('');
        }
    }, [isOpen]);
    
    const handleSaveJustRoute = () => {
        if (routeName.trim()) {
            onSave(routeName.trim());
        }
    };

    const handlePlanTrip = () => {
        if (routeName.trim() && departureDateTime) {
            const departureTimestamp = new Date(departureDateTime).getTime();
            onSave(routeName.trim(), departureTimestamp);
        }
    };

    const isFormValid = routeName.trim() !== '';

    if (!isOpen) return null;

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className={`modal-content ${isOpen ? 'open' : ''}`} onClick={(e) => e.stopPropagation()}>
                <div className="modal-handle"></div>
                <header className="modal-header">
                    <h2><SaveIcon /> {t('saveTripTitle')}</h2>
                    <button className="modal-close-button" onClick={onClose} aria-label={t('close')}>&times;</button>
                </header>
                <div className="modal-body">
                    <div className="form-group">
                        <label htmlFor="routeName">{t('routeNameLabel')}</label>
                        <input
                            id="routeName"
                            type="text"
                            value={routeName}
                            onChange={(e) => setRouteName(e.target.value)}
                            placeholder={t('routeNamePlaceholder')}
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label htmlFor="departureTime">{t('departureTimeLabel')}</label>
                        <input
                            id="departureTime"
                            type="datetime-local"
                            value={departureDateTime}
                            onChange={(e) => setDepartureDateTime(e.target.value)}
                        />
                    </div>
                </div>
                <footer className="modal-footer">
                    <button type="button" className="modal-button" onClick={handleSaveJustRoute} disabled={!isFormValid}>
                        {t('saveJustRoute')}
                    </button>
                    <button type="button" className="modal-button modal-button-primary" onClick={handlePlanTrip} disabled={!isFormValid || !departureDateTime}>
                        {t('planTrip')}
                    </button>
                </footer>
            </div>
        </div>
    );
};

export default SaveTripModal;