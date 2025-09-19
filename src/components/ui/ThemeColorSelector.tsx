import React, { useState, useRef, useEffect } from 'react';
import { useThemeColor, themeColors } from '../../context/ThemeColorContext';
import { PaletteIcon } from './icons/CustomIcons';

const ThemeColorSelector = () => {
    const { themeColor, setThemeColor } = useThemeColor();
    const [isOpen, setIsOpen] = useState(false);
    const popoverRef = useRef<HTMLDivElement>(null);

    const handleSelectColor = (colorName: keyof typeof themeColors) => {
        setThemeColor(colorName);
        setIsOpen(false); // Close popover on selection
        window.dispatchEvent(new CustomEvent('ui-reset-to-landing'));
    };

    // Close popover when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (popoverRef.current && !popoverRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    return (
        <div className="theme-selector-container" ref={popoverRef}>
            <button
                className="header-icon-button"
                onClick={() => setIsOpen(prev => !prev)}
                aria-haspopup="true"
                aria-expanded={isOpen}
                aria-label="Select theme color"
            >
                <PaletteIcon />
            </button>

            {isOpen && (
                <div className="theme-color-popover">
                    <div className="theme-color-bar">
                        {Object.keys(themeColors).map((name) => (
                            <button
                                key={name}
                                className={`theme-color-swatch swatch-${name} ${themeColor === name ? 'active' : ''}`}
                                onClick={() => handleSelectColor(name as keyof typeof themeColors)}
                                aria-label={`Select ${name} color`}
                            />
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default ThemeColorSelector;