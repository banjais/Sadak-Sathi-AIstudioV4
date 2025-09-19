import React from 'react';
import { useTranslation } from '../../hooks/useTranslation';

const DrivingIcon = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 16 10s-1.3-1.4-2.2-2.3c-.5-.4-1.1-.7-1.8-.7H5c-.6 0-1.1.4-1.4.9L2 12v9c0 .6.4 1 1 1h2"/>
        <path d="M7 17h9"/>
        <circle cx="7" cy="17" r="2"/>
        <circle cx="17" cy="17" r="2"/>
    </svg>
);

const ExploringIcon = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10"/>
        <path d="M12 2L12 22"/>
        <path d="M2 12L22 12"/>
        <path d="M12 2a10 10 0 00-4 18.5"/>
        <path d="M12 2a10 10 0 014 18.5"/>
    </svg>
);

interface ModeSelectionModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSelectMode: (mode: 'driving' | 'exploring') => void;
}

const ModeSelectionModal: React.FC<ModeSelectionModalProps> = ({ isOpen, onClose, onSelectMode }) => {
    const { t } = useTranslation();

    if (!isOpen) return null;

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className={`modal-content ${isOpen ? 'open' : ''}`} onClick={(e) => e.stopPropagation()}>
                <div className="modal-handle"></div>
                <header className="modal-header">
                    <h2>{t('selectMode')}</h2>
                    <button className="modal-close-button" onClick={onClose} aria-label={t('close')}>&times;</button>
                </header>
                <div className="modal-body">
                    <div className="mode-selection-container">
                        <div className="mode-selection-card" onClick={() => onSelectMode('driving')}>
                            <DrivingIcon />
                            <h3>{t('drivingMode')}</h3>
                            <p>{t('drivingModeDesc')}</p>
                        </div>
                        <div className="mode-selection-card" onClick={() => onSelectMode('exploring')}>
                            <ExploringIcon />
                            <h3>{t('exploringMode')}</h3>
                            <p>{t('exploringModeDesc')}</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ModeSelectionModal;