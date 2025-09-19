import React, { useState, useRef, useEffect } from 'react';
import { useTranslation } from '../../hooks/useTranslation';
import LanguageSelector from './LanguageSelector';
import LanguageDropdown from './LanguageDropdown';
import ThemeToggle from './ThemeToggle';
import ThemeColorSelector from './ThemeColorSelector';
import * as Flags from './icons/Flags';

export type LocationStatus = 'on' | 'off' | 'searching' | 'weak';

interface HeaderProps {
    locationStatus: LocationStatus;
    onOpenAlerts: () => void;
    hasAlerts: boolean;
}

// --- Icons ---

const HeaderIcon = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="header-logo" aria-label="Sadak Sathi App Icon">
        <path d="M16 3.13a1 1 0 0 1 0 1.74l-2 1.15a1 1 0 0 0-.5.87v4.22a1 1 0 0 0 .5.87l2 1.15a1 1 0 0 1 0 1.74l-8 4.62a1 1 0 0 1-1 0l-8-4.62a1 1 0 0 1 0-1.74l2-1.15a1 1 0 0 0 .5-.87V7.89a1 1 0 0 0-.5-.87L1 5.87a1 1 0 0 1 0-1.74l8-4.62a1 1 0 0 1 1 0l8 4.62z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M5 17.13v-4.24a1 1 0 0 1 .5-.87l2-1.15" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
);

const AlertsIcon = () => (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
        <path d="M13.73 21a2 2 0 0 1-3.46 0" />
    </svg>
);


// --- Main Component ---

const internationalFlagMap: { [key: string]: React.FC } = {
    en: Flags.USA,
    es: Flags.Spain,
    zh: Flags.China,
    ja: Flags.Japan,
    ko: Flags.SouthKorea,
    hi: Flags.India,
    fr: Flags.France,
    ar: Flags.SaudiArabia,
    de: Flags.Germany,
    ru: Flags.Russia,
    bn: Flags.India
};

const regionalNepaliLangs = new Set(['newa', 'taj', 'mai', 'bho', 'thr']);

const regionalLangNameMap: { [key: string]: string } = {
    newa: '(नेवारी)',
    taj: '(तामाङ)',
    mai: '(मैथिली)',
    bho: '(भोजपुरी)',
    thr: '(थारु)',
};

const Header: React.FC<HeaderProps> = ({ locationStatus, onOpenAlerts, hasAlerts }) => {
    const { t, language } = useTranslation();
    const [isLanguageDropdownOpen, setLanguageDropdownOpen] = useState(false);
    const languageDropdownRef = useRef<HTMLDivElement>(null);

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (languageDropdownRef.current && !languageDropdownRef.current.contains(event.target as Node)) {
                setLanguageDropdownOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    const getFlagComponent = () => {
        if (language === 'ne' || regionalNepaliLangs.has(language)) {
            return Flags.Nepal;
        }
        return internationalFlagMap[language] || Flags.USA;
    };
    
    const getSubtitleText = () => {
        const baseSubtitle = t('appSubtitle_smart');
        if (regionalNepaliLangs.has(language)) {
            return `${baseSubtitle} ${regionalLangNameMap[language]}`;
        }
        return baseSubtitle;
    };
    
    const getLocationStatusTitle = () => {
        switch (locationStatus) {
            case 'on': return t('locationOn');
            case 'off': return t('locationOff');
            case 'weak': return t('locationWeak');
            case 'searching': return t('locationSearching');
            default: return '';
        }
    };

    const FlagComponent = getFlagComponent();
    const subtitleText = getSubtitleText();

    return (
        <header className="main-header">
            <div className="header-left">
                <div 
                    className={`header-logo-container location-${locationStatus}`}
                    title={getLocationStatusTitle()}
                >
                    <HeaderIcon />
                </div>
                <div className="header-text-container">
                    <h1 className="header-title">Sadak Sathi</h1>
                    <p className="header-subtitle">
                        <FlagComponent />
                        <span>{subtitleText}</span>
                    </p>
                </div>
            </div>
            <div className="header-right">
                <button 
                    className="header-icon-button alerts-button" 
                    onClick={onOpenAlerts} 
                    aria-label={t('alertsCenterTitle')}
                >
                    <AlertsIcon />
                    {hasAlerts && <span className="alerts-badge"></span>}
                </button>
                <div className="language-selector-container" ref={languageDropdownRef}>
                    <LanguageSelector onClick={() => setLanguageDropdownOpen(prev => !prev)} />
                    {isLanguageDropdownOpen && <LanguageDropdown onClose={() => setLanguageDropdownOpen(false)} />}
                </div>
                <ThemeColorSelector />
                <ThemeToggle />
            </div>
        </header>
    );
};

export default Header;