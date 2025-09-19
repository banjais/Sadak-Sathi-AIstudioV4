import React, { useState } from 'react';
import { useTranslation } from '../../hooks/useTranslation';
import { Place } from '../../api/geocodingApi';

export type ListeningState = 'idle' | 'wake-word' | 'command';

const SearchIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
    </svg>
);

const LocationIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" /><circle cx="12" cy="10" r="3" />
    </svg>
);

const MapIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6"></polygon>
        <line x1="8" y1="2" x2="8" y2="18"></line>
        <line x1="16" y1="6" x2="16" y2="22"></line>
    </svg>
);


const MicIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" /><path d="M19 10v2a7 7 0 0 1-14 0v-2" /><line x1="12" y1="19" x2="12" y2="23" />
    </svg>
);

const SearchLoader = () => <div className="search-loader"></div>;

// Helper function to format distance from meters
const formatDistance = (meters: number): string => {
    if (meters < 1000) {
        return `${Math.round(meters)} m`;
    }
    return `${(meters / 1000).toFixed(1)} km`;
};


interface SearchBarProps {
    value: string;
    onChange: (query: string) => void;
    isLoading: boolean;
    suggestions: Place[];
    onPlaceSelect: (place: Place) => void;
    onVoiceInput: () => void;
    listeningState: ListeningState;
    searchError: string | null;
}

const SearchBar: React.FC<SearchBarProps> = ({
    value,
    onChange,
    isLoading,
    suggestions,
    onPlaceSelect,
    onVoiceInput,
    listeningState,
    searchError,
}) => {
    const { t } = useTranslation();
    const [isFocused, setIsFocused] = useState(false);

    const handleSelect = (place: Place) => {
        setIsFocused(false);
        onPlaceSelect(place);
    };

    const handleClear = () => {
        onChange('');
    };
    
    const getPlaceholder = () => {
        if (listeningState === 'command') return t('voiceTooltip_listening');
        return t('searchPlaceholder');
    };

    const voiceBtnClass = () => {
        if (listeningState === 'command') return 'listening-command';
        if (listeningState === 'wake-word') return 'listening-wake-word';
        return '';
    };

    return (
        <div className="search-container">
            <div className="search-bar">
                <SearchIcon />
                <input
                    type="text"
                    placeholder={getPlaceholder()}
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    onFocus={() => setIsFocused(true)}
                    onBlur={() => {
                        // Delay hiding suggestions to allow click on a suggestion to register
                        setTimeout(() => setIsFocused(false), 200);
                    }}
                    role="combobox"
                    aria-autocomplete="list"
                    aria-expanded={isFocused && (suggestions.length > 0 || !!searchError)}
                    aria-controls="search-suggestions-list"
                />
                <div className="search-bar-actions">
                    {isLoading ? (
                        <SearchLoader />
                    ) : value ? (
                        <button onClick={handleClear} aria-label={t('close')}>&times;</button>
                    ) : (
                         <button className={`search-voice-btn ${voiceBtnClass()}`} onClick={onVoiceInput} aria-label={t('voiceSearch')}>
                            <MicIcon />
                        </button>
                    )}
                </div>
            </div>
            {isFocused && (suggestions.length > 0 || searchError) && (
                <div id="search-suggestions-list" className="search-suggestions" role="listbox">
                    {searchError ? (
                         <div className="suggestion-item" style={{ color: 'var(--c-danger)' }}>{searchError}</div>
                    ) : (
                        suggestions.map((place) => (
                            <button
                                key={place.id}
                                className="suggestion-item"
                                onClick={() => handleSelect(place)}
                                role="option"
                                aria-selected="false"
                            >
                                {place.type === 'region' ? <MapIcon /> : <LocationIcon />}
                                <span style={{ flexGrow: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{t(place.nameKey)}</span>
                                {place.distance !== undefined && (
                                    <span style={{ fontSize: '0.8rem', color: 'var(--c-text-secondary)', flexShrink: 0, marginLeft: '0.5rem' }}>
                                        {formatDistance(place.distance)}
                                    </span>
                                )}
                            </button>
                        ))
                    )}
                </div>
            )}
        </div>
    );
};

export default SearchBar;