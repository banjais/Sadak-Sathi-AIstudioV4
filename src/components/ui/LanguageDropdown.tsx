import React, { useState } from 'react';
import { useTranslation } from '../../hooks/useTranslation';
import * as Flags from './icons/Flags';

interface LanguageDropdownProps {
    onClose: () => void;
}

const ChevronDownIcon = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="6 9 12 15 18 9" />
    </svg>
);

type Language = {
    code: string;
    name: string;
    flag: keyof typeof Flags;
};

const languages: { national: Language[], international: Language[] } = {
    national: [
        { code: 'ne', name: 'नेपाली', flag: 'Nepal' },
        { code: 'newa', name: 'नेवारी', flag: 'Nepal' },
        { code: 'taj', name: 'तामाङ', flag: 'Nepal' },
        { code: 'mai', name: 'मैथिली', flag: 'Nepal' },
        { code: 'bho', name: 'भोजपुरी', flag: 'Nepal' },
        { code: 'thr', name: 'थारु', flag: 'Nepal' }
    ],
    international: [
        { code: 'en', name: 'English', flag: 'USA' },
        { code: 'es', name: 'Español', flag: 'Spain' },
        { code: 'zh', name: '中文', flag: 'China' },
        { code: 'ja', name: '日本語', flag: 'Japan' },
        { code: 'ko', name: '한국어', flag: 'SouthKorea' },
        { code: 'hi', name: 'हिन्दी', flag: 'India' },
        { code: 'fr', name: 'Français', flag: 'France' },
        { code: 'ar', name: 'العربية', flag: 'SaudiArabia' },
        { code: 'de', name: 'Deutsch', flag: 'Germany' },
        { code: 'ru', name: 'Русский', flag: 'Russia' },
        { code: 'bn', name: 'বাংলা', flag: 'India' },
        { code: 'ur', name: 'اردو', flag: 'Pakistan' },
        { code: 'mr', name: 'मराठी', flag: 'India' }
    ]
};

const supportedLangs = new Set(['en', 'ne', 'es', 'zh', 'ja', 'ko', 'hi', 'fr', 'ar', 'de', 'ru', 'newa', 'taj', 'mai', 'bho', 'thr', 'bn', 'ur', 'mr']);

const LanguageDropdown: React.FC<LanguageDropdownProps> = ({ onClose }) => {
    const { language, changeLanguage, t } = useTranslation();
    const [expandedSections, setExpandedSections] = useState({
        national: true,
        international: true,
    });

    const toggleSection = (section: 'national' | 'international') => {
        setExpandedSections(prev => ({ ...prev, [section]: !prev[section] }));
    };

    const handleLanguageSelect = (langCode: string) => {
        if (supportedLangs.has(langCode)) {
            changeLanguage(langCode as any);
            onClose();
        }
    };

    const renderLanguageItem = (lang: Language, isNational: boolean) => {
        const FlagComponent = Flags[lang.flag];
        const isSupported = supportedLangs.has(lang.code);
        return (
            <button
                key={lang.code}
                className={`language-dropdown-item ${language === lang.code ? 'selected' : ''} ${!isSupported ? 'unsupported' : ''}`}
                onClick={() => handleLanguageSelect(lang.code)}
                disabled={!isSupported}
            >
                {isNational ? <span className="language-prefix-dash">-</span> : <FlagComponent />}
                <span>{lang.name}</span>
            </button>
        );
    };

    return (
        <div className="language-dropdown">
            <div className="language-dropdown-section">
                <button 
                    className="language-dropdown-header" 
                    onClick={() => toggleSection('national')}
                    aria-expanded={expandedSections.national}
                >
                    <div className="language-dropdown-header-icon">
                        <Flags.Nepal />
                        <span>{t('nepal')}</span>
                    </div>
                    <div className={`section-toggle-chevron ${!expandedSections.national ? 'collapsed' : ''}`}>
                        <ChevronDownIcon />
                    </div>
                </button>
                <div className={`language-list-container ${expandedSections.national ? 'expanded' : 'collapsed'}`}>
                    {languages.national.map(lang => renderLanguageItem(lang, true))}
                </div>
            </div>
            <div className="language-dropdown-section">
                <button 
                    className="language-dropdown-header" 
                    onClick={() => toggleSection('international')}
                    aria-expanded={expandedSections.international}
                >
                    <div className="language-dropdown-header-icon">
                       <Flags.GlobeIcon />
                       <span>{t('international')}</span>
                    </div>
                    <div className={`section-toggle-chevron ${!expandedSections.international ? 'collapsed' : ''}`}>
                        <ChevronDownIcon />
                    </div>
                </button>
                <div className={`language-list-container ${expandedSections.international ? 'expanded' : 'collapsed'}`}>
                    {languages.international.map(lang => renderLanguageItem(lang, false))}
                </div>
            </div>
        </div>
    );
};

export default LanguageDropdown;