import React from 'react';
import { useTranslation } from '../../hooks/useTranslation';
import { WeatherAlert } from '../../api/weatherApi';

interface WeatherAlertModalProps {
    isOpen: boolean;
    onClose: () => void;
    alert: WeatherAlert | null;
}

const AlertIcon = () => (
    <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
        <line x1="12" y1="9" x2="12" y2="13" />
        <line x1="12" y1="17" x2="12.01" y2="17" />
    </svg>
);


const WeatherAlertModal: React.FC<WeatherAlertModalProps> = ({ isOpen, onClose, alert }) => {
    const { t } = useTranslation();

    if (!isOpen || !alert) return null;

    return (
        <div className="modal-overlay" onClick={onClose} role="dialog" aria-modal="true" aria-labelledby="weather-alert-title">
            <div className={`modal-content ${isOpen ? 'open' : ''}`} onClick={(e) => e.stopPropagation()}>
                <div className="modal-handle"></div>
                <header className="modal-header">
                    <h2 id="weather-alert-title">
                        {t('weatherAlertTitle')}
                    </h2>
                    <button className="modal-close-button" onClick={onClose} aria-label={t('close')}>&times;</button>
                </header>
                <div className="modal-body weather-alert-modal-body">
                    <div className="weather-alert-modal-icon">
                        <AlertIcon />
                    </div>
                    <h3 style={{ textAlign: 'center', marginBottom: '0.5rem' }}>{t(alert.titleKey)}</h3>
                    <p>{t(alert.descriptionKey)}</p>
                </div>
                <footer className="modal-footer">
                    <button type="button" className="modal-button modal-button-primary" onClick={onClose}>
                        {t('acknowledge')}
                    </button>
                </footer>
            </div>
        </div>
    );
};

export default WeatherAlertModal;
