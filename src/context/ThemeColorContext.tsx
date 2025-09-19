import React, { createContext, useState, useContext, useEffect, ReactNode, useMemo } from 'react';

// Define the available theme colors
export const themeColors = {
    default: { primary: '#3B82F6', light: '#60A5FA', dark: '#1E3A8A', rgb: '59, 130, 246' },
    green:  { primary: '#10B981', light: '#34D399', dark: '#065F46', rgb: '16, 185, 129' },
    rose:   { primary: '#F43F5E', light: '#FB7185', dark: '#881337', rgb: '244, 63, 94' },
    amber:  { primary: '#F59E0B', light: '#FBBF24', dark: '#78350F', rgb: '245, 158, 11' },
    violet: { primary: '#8B5CF6', light: '#A78BFA', dark: '#4C1D95', rgb: '139, 92, 246' },
    gray:   { primary: '#6B7280', light: '#9CA3AF', dark: '#1F2937', rgb: '107, 114, 128' },
    white:  { primary: '#D1D5DB', light: '#E5E7EB', dark: '#4B5563', rgb: '209, 213, 219' }
};

type ThemeColorName = keyof typeof themeColors;

interface ThemeColorContextType {
    themeColor: ThemeColorName;
    setThemeColor: (colorName: ThemeColorName) => void;
}

const ThemeColorContext = createContext<ThemeColorContextType | undefined>(undefined);

const THEME_COLOR_STORAGE_KEY = 'sadak-sathi-theme-color';
const STYLE_ELEMENT_ID = 'dynamic-theme-color-style';

export const ThemeColorProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [themeColor, setThemeColor] = useState<ThemeColorName>(() => {
        try {
            const stored = localStorage.getItem(THEME_COLOR_STORAGE_KEY);
            if (stored === 'blue') return 'default'; // Migrate old value
            
            // Check if the stored value is a valid key in our new themeColors object
            if (stored && Object.keys(themeColors).includes(stored)) {
                return stored as ThemeColorName;
            }
        } catch (e) {
             console.warn("Could not access localStorage. Defaulting theme color.");
        }
        return 'default'; // Fallback to default
    });

    useEffect(() => {
        // Get the color values
        const colors = themeColors[themeColor];

        // Create the CSS string
        const css = `
            :root {
                --c-primary: ${colors.primary};
                --c-primary-light: ${colors.light};
                --c-primary-dark: ${colors.dark};
                --c-primary-rgb: ${colors.rgb};
            }
        `;

        // Guard against environments where document.head might not be ready
        if (document.head) {
            // Find or create the style element
            let styleElement = document.getElementById(STYLE_ELEMENT_ID);
            if (!styleElement) {
                styleElement = document.createElement('style');
                styleElement.id = STYLE_ELEMENT_ID;
                document.head.appendChild(styleElement);
            }

            // Update the content of the style element
            if (styleElement.innerHTML !== css) {
                styleElement.innerHTML = css;
            }
        }
        
        // Save the choice to local storage
        try {
            localStorage.setItem(THEME_COLOR_STORAGE_KEY, themeColor);
        } catch (e) {
            console.warn("Could not write theme color to localStorage.");
        }

    }, [themeColor]);

    const value = useMemo(() => ({ themeColor, setThemeColor }), [themeColor]);

    return (
        <ThemeColorContext.Provider value={value}>
            {children}
        </ThemeColorContext.Provider>
    );
};

export const useThemeColor = (): ThemeColorContextType => {
    const context = useContext(ThemeColorContext);
    if (!context) {
        throw new Error('useThemeColor must be used within a ThemeColorProvider');
    }
    return context;
};