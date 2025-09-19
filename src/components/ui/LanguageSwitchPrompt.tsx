import React, { useEffect } from 'react';
import { useTranslation } from '../../hooks/useTranslation';

// This map helps display the language name in the prompt.
// It should be kept in sync with supported languages.
const languageNameMap: { [key:string]: string } = {
    en: 'English',
    ne: 'नेपाली',
    es: 'Español',
    zh: '中文',
    ja: '日本語',
    hi: 'हिन्दी',
    fr: 'Français',
    ar: 'العربية',
    de: 'Deutsch',
    ru: 'Русский',
    newa: 'नेवारी',
    taj: 'तामाङ',
    mai: 'मैथिली',
    bho: 'भोजपुरी',
    thr: 'थारु',
    bn: 'বাংলা',
    ur: 'اردو',
    mr: 'मराठी',
};

interface LanguageSwitchPromptProps {
    detectedLang: string;
    onSwitch: () => void;
    onDismiss: () => void;
}

const LanguageSwitchPrompt: React.FC<LanguageSwitchPromptProps> = ({ detectedLang, onSwitch, onDismiss }) => {
    const { t } = useTranslation();

    // Auto-dismiss after 8 seconds
    useEffect(() => {
        const timer = setTimeout(() => {
            onDismiss();
        }, 8000);

        return () => clearTimeout(timer);
    }, [onDismiss]);

    const detectedLanguageName = languageNameMap[detectedLang] || detectedLang;
    const promptText = t('switchToLanguagePrompt').replace('{{languageName}}', detectedLanguageName);

    return (
        <div className="language-switch-prompt-container">
            <div className="language-switch-prompt">
                <span className="language-switch-prompt-text">{promptText}</span>
                <div className="language-switch-prompt-actions">
                    <button className="language-switch-button dismiss" onClick={onDismiss}>{t('dismiss')}</button>
                    <button className="language-switch-button switch" onClick={onSwitch}>{t('switchTo')}</button>
                </div>
            </div>
        </div>
    );
};

export default LanguageSwitchPrompt;