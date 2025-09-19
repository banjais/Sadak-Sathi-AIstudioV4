import React, { useState } from 'react';
import { useTranslation } from '../hooks/useTranslation';

interface SettingsScreenProps {
    initialWakeWord: string;
    initialIsEnabled: boolean;
    onSave: (settings: { wakeWord: string; isEnabled: boolean }) => void;
}

const SettingsScreen: React.FC<SettingsScreenProps> = ({ initialWakeWord, initialIsEnabled, onSave }) => {
    const { t } = useTranslation();
    const [wakeWord, setWakeWord] = useState(initialWakeWord);
    const [isEnabled, setIsEnabled] = useState(initialIsEnabled);
    const [savedMessage, setSavedMessage] = useState(false);

    const handleSave = (e: React.FormEvent) => {
        e.preventDefault();
        onSave({ wakeWord, isEnabled });
        setSavedMessage(true);
        setTimeout(() => setSavedMessage(false), 2000);
    };

    return (
        <form className="settings-screen" onSubmit={handleSave}>
            <div className="settings-section">
                <h3>{t('wakeWordDetection')}</h3>
                <div className="toggle-switch">
                    <label htmlFor="enable-wake-word">{t('enableWakeWord')}</label>
                    <input
                        id="enable-wake-word"
                        type="checkbox"
                        checked={isEnabled}
                        onChange={(e) => setIsEnabled(e.target.checked)}
                    />
                </div>
                <div className="wake-word-input-container form-group">
                    <label htmlFor="wake-word">{t('wakeWordLabel')}</label>
                    <input
                        id="wake-word"
                        type="text"
                        value={wakeWord}
                        onChange={(e) => setWakeWord(e.target.value)}
                        placeholder={t('wakeWordPlaceholder')}
                        disabled={!isEnabled}
                        required
                    />
                </div>
            </div>

            <div className="settings-footer">
                <button type="submit" className="modal-button modal-button-primary settings-save-button">
                    {savedMessage ? t('settingsSaved') : t('saveSettings')}
                </button>
            </div>
        </form>
    );
};

export default SettingsScreen;