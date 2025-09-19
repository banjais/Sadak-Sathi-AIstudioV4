import React from 'react';
import { useTranslation } from '../../hooks/useTranslation';
import AiCompanionScreen from '../../screens/AiCompanionScreen';
import { WeatherData } from '../../api/weatherApi';

const AiIcon = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 8V4H8" />
        <rect x="4" y="4" width="16" height="16" rx="2" />
        <path d="M2 14h2" />
        <path d="M20 14h2" />
        <path d="M15 13v2" />
        <path d="M9 13v2" />
    </svg>
);


interface AiCompanionModalProps {
    isOpen: boolean;
    onClose: () => void;
    initialQuery?: string | null;
    userLocation: [number, number] | null;
    weatherData: WeatherData | null;
}

const AiCompanionModal: React.FC<AiCompanionModalProps> = ({ isOpen, onClose, initialQuery, userLocation, weatherData }) => {
    const { t } = useTranslation();

    if (!isOpen) return null;

    return (
        <div className="modal-overlay" onClick={onClose} role="dialog" aria-modal="true" aria-labelledby="ai-modal-title">
            <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ height: '85%' }}>
                <div className="modal-handle"></div>
                <header className="modal-header">
                    <h2 id="ai-modal-title">
                        <AiIcon /> {t('aiCompanionTitle')}
                    </h2>
                    <button className="modal-close-button" onClick={onClose} aria-label={t('close')}>&times;</button>
                </header>
                <div className="modal-body" style={{ padding: 0, display: 'flex' }}>
                    <AiCompanionScreen initialQuery={initialQuery || null} userLocation={userLocation} weatherData={weatherData} />
                </div>
            </div>
        </div>
    );
};

export default AiCompanionModal;