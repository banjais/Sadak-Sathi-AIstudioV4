import React from 'react';

// Using inline SVGs for flags to avoid external dependencies or image loading.
// These are simplified representations.

const FlagWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="36" height="24" viewBox="0 0 36 24" className="flag-icon">
        {children}
    </svg>
);

export const Nepal = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 -10 210 280" className="flag-icon">
        {/* The shape is a single path with a thick stroke for the blue border and a crimson fill */}
        <path 
            d="M5 5 L192 128 L72 128 L192 252 L5 252 Z" 
            fill="#DC143C" 
            stroke="#003893" 
            strokeWidth="10" 
        />
        
        {/* Upper Symbol: Crescent moon and 8-point sun */}
        <path d="M55 83 A 35 35 0 1 0 55 17 A 30 30 0 1 1 55 83 Z" fill="#fff"/>
        <g fill="#fff" transform="translate(55 50) scale(1.4)">
            <path d="M0-8 L1.5 2 L-5 0 H5 Z"/>
            <path d="M0-8 L1.5 2 L-5 0 H5 Z" transform="rotate(45)"/>
            <path d="M0-8 L1.5 2 L-5 0 H5 Z" transform="rotate(90)"/>
            <path d="M0-8 L1.5 2 L-5 0 H5 Z" transform="rotate(135)"/>
            <path d="M0-8 L1.5 2 L-5 0 H5 Z" transform="rotate(180)"/>
            <path d="M0-8 L1.5 2 L-5 0 H5 Z" transform="rotate(225)"/>
            <path d="M0-8 L1.5 2 L-5 0 H5 Z" transform="rotate(270)"/>
            <path d="M0-8 L1.5 2 L-5 0 H5 Z" transform="rotate(315)"/>
        </g>

        {/* Lower Symbol: 12-point sun */}
        <g fill="#fff" transform="translate(55 190) scale(2)">
            <path d="M0-10 L2 4 L-6 1 H6 Z"/>
            <path d="M0-10 L2 4 L-6 1 H6 Z" transform="rotate(30)"/>
            <path d="M0-10 L2 4 L-6 1 H6 Z" transform="rotate(60)"/>
            <path d="M0-10 L2 4 L-6 1 H6 Z" transform="rotate(90)"/>
            <path d="M0-10 L2 4 L-6 1 H6 Z" transform="rotate(120)"/>
            <path d="M0-10 L2 4 L-6 1 H6 Z" transform="rotate(150)"/>
            <path d="M0-10 L2 4 L-6 1 H6 Z" transform="rotate(180)"/>
            <path d="M0-10 L2 4 L-6 1 H6 Z" transform="rotate(210)"/>
            <path d="M0-10 L2 4 L-6 1 H6 Z" transform="rotate(240)"/>
            <path d="M0-10 L2 4 L-6 1 H6 Z" transform="rotate(270)"/>
            <path d="M0-10 L2 4 L-6 1 H6 Z" transform="rotate(300)"/>
            <path d="M0-10 L2 4 L-6 1 H6 Z" transform="rotate(330)"/>
        </g>
    </svg>
);
export const USA = () => (
    <FlagWrapper>
        <path fill="#BF0A30" d="M0 0h36v2H0zm0 4h36v2H0zm0 4h36v2H0zm0 4h36v2H0zm0 4h36v2H0zm0 4h36v2H0z"/>
        <path fill="#002868" d="M0 0h18v14H0z"/>
    </FlagWrapper>
);
export const Spain = () => (
    <FlagWrapper>
        <path fill="#C60B1E" d="M0 0h36v24H0z"/>
        <path fill="#FFC400" d="M0 6h36v12H0z"/>
    </FlagWrapper>
);
export const China = () => (
    <FlagWrapper>
        <path fill="#EE1C25" d="M0 0h36v24H0z"/>
    </FlagWrapper>
);
export const India = () => (
    <FlagWrapper>
        <path fill="#FF9933" d="M0 0h36v8H0z"/>
        <path fill="#FFF" d="M0 8h36v8H0z"/>
        <path fill="#138808" d="M0 16h36v8H0z"/>
    </FlagWrapper>
);
export const France = () => (
    <FlagWrapper>
        <path fill="#002395" d="M0 0h12v24H0z"/>
        <path fill="#FFF" d="M12 0h12v24H12z"/>
        <path fill="#ED2939" d="M24 0h12v24H24z"/>
    </FlagWrapper>
);
export const SaudiArabia = () => (
    <FlagWrapper>
        <path fill="#006C35" d="M0 0h36v24H0z"/>
    </FlagWrapper>
);
export const Germany = () => (
    <FlagWrapper>
        <path fill="#000" d="M0 0h36v8H0z"/>
        <path fill="#D00" d="M0 8h36v8H0z"/>
        <path fill="#FFCE00" d="M0 16h36v8H0z"/>
    </FlagWrapper>
);
export const Japan = () => (
    <FlagWrapper>
        <path fill="#fff" d="M0 0h36v24H0z"/>
        <circle fill="#BC002D" cx="18" cy="12" r="6"/>
    </FlagWrapper>
);
export const SouthKorea = () => (
    <FlagWrapper>
        <path fill="#fff" d="M0 0h36v24H0z"/>
        <circle fill="#CD2E3A" cx="18" cy="12" r="5"/>
        <circle fill="#0047A0" cx="18" cy="12" r="5" clipPath="path('M 18 7 A 5 5 0 0 0 18 17 Z')"/>
    </FlagWrapper>
);
export const Russia = () => (
    <FlagWrapper>
        <path fill="#fff" d="M0 0h36v8H0z"/>
        <path fill="#0039A6" d="M0 8h36v8H0z"/>
        <path fill="#D52B1E" d="M0 16h36v8H0z"/>
    </FlagWrapper>
);
export const Pakistan = () => (
    <FlagWrapper>
        <path fill="#006643" d="M0 0h36v24H0z"/>
        <path fill="#fff" d="M0 0h9v24H0z"/>
    </FlagWrapper>
);

export const GlobeIcon = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" className="flag-icon">
        <circle cx="12" cy="12" r="10" fill="none" stroke="#3b82f6" strokeWidth="2"/>
        <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" fill="none" stroke="#3b82f6" strokeWidth="2" strokeLinecap="round"/>
        <line x1="2" y1="12" x2="22" y2="12" stroke="#3b82f6" strokeWidth="2"/>
    </svg>
);