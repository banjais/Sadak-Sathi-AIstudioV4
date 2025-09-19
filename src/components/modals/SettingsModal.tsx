import React from 'react';
import { useTranslation } from '../../hooks/useTranslation';
import SettingsScreen from '../../screens/SettingsScreen';

const SettingsIcon = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="3" />
        <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06-.06a1.65 1.65 0 0 0-.33-1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
    </svg>
);

interface SettingsModalProps {
    isOpen: boolean;
    onClose: () => void;
    currentWakeWord: string;
    isWakeWordEnabled: boolean;
    onSave: (settings: { wakeWord: string; isEnabled: boolean }) => void;
}

const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose, currentWakeWord, isWakeWordEnabled, onSave }) => {
    const { t } = useTranslation();

    if (!isOpen) return null;

    return (
        <div className="modal-overlay" onClick={onClose} role="dialog" aria-modal="true" aria-labelledby="settings-modal-title">
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                <div className="modal-handle"></div>
                <header className="modal-header">
                    <h2 id="settings-modal-title">
                        <SettingsIcon /> {t('settingsTitle')}
                    </h2>
                    <button className="modal-close-button" onClick={onClose} aria-label={t('close')}>&times;</button>
                </header>
                <div className="modal-body" style={{ padding: 0 }}>
                    <SettingsScreen
                        initialWakeWord={currentWakeWord}
                        initialIsEnabled={isWakeWordEnabled}
                        onSave={(settings) => {
                            onSave(settings);
                        }}
                    />
                </div>
            </div>
        </div>
    );
};

export default SettingsModal;