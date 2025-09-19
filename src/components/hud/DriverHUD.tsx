import React, { useState, useEffect, useRef, useCallback } from 'react';
import Compass from './Compass';
import Speedometer from './Speedometer';
import { useTranslation } from '../../hooks/useTranslation';

const SaveIcon = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" />
        <polyline points="17 21 17 13 7 13 7 21" />
        <polyline points="7 3 7 8 15 8" />
    </svg>
);


// Helper to format duration from seconds
const formatDuration = (seconds: number): string => {
    if (seconds < 60) return `~1 min`;
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const parts: string[] = [];
    if (h > 0) parts.push(`${h}h`);
    if (m > 0) parts.push(`${m}m`);
    return parts.join(' ');
};

// Helper function to format distance from meters
const formatDistance = (meters: number): string => {
    if (meters < 1000) {
        return `${Math.round(meters)} m`;
    }
    return `${(meters / 1000).toFixed(1)} km`;
};

interface DriverHUDProps {
    speedLimit?: number;
    speed: number;
    // Navigation props
    progress?: number; // 0-100
    remainingDistance?: number; // meters
    remainingTime?: number; // seconds
    onSaveRoute: () => void;
}

const SpeedLimitDisplay: React.FC<{ limit: number }> = ({ limit }) => (
    <div className="speed-limit-display" aria-label={`Speed limit: ${limit} kilometers per hour`}>
        <span className="speed-limit-value">{limit}</span>
    </div>
);


const DriverHUD: React.FC<DriverHUDProps> = ({ speedLimit, speed, progress, remainingDistance, remainingTime, onSaveRoute }) => {
    const { t } = useTranslation();
    const [isVisible, setIsVisible] = useState(true);
    const timeoutRef = useRef<number | null>(null);

    const resetTimer = useCallback(() => {
        setIsVisible(true);
        if (timeoutRef.current) {
            window.clearTimeout(timeoutRef.current);
        }
        timeoutRef.current = window.setTimeout(() => {
            setIsVisible(false);
        }, 5000); // Hide after 5 seconds
    }, []);

    useEffect(() => {
        // Set up activity listeners
        window.addEventListener('mousemove', resetTimer);
        window.addEventListener('touchstart', resetTimer);
        window.addEventListener('scroll', resetTimer);

        resetTimer(); // Initial call

        return () => {
            if (timeoutRef.current) {
                window.clearTimeout(timeoutRef.current);
            }
            window.removeEventListener('mousemove', resetTimer);
            window.removeEventListener('touchstart', resetTimer);
            window.removeEventListener('scroll', resetTimer);
        };
    }, [resetTimer]);
    
    const isNavigating = typeof progress !== 'undefined';
    const progressPercent = Math.min(100, Math.max(0, progress || 0));

    return (
        <div className={`driver-hud ${isVisible ? 'visible' : ''}`}>
            <div className="hud-top-row">
                <div className="speed-cluster">
                    <Speedometer speed={speed} />
                    {speedLimit && <SpeedLimitDisplay limit={speedLimit} />}
                </div>
                <Compass />
            </div>

            {isNavigating && (
                 <div className="navigation-progress-container">
                    <div className="navigation-progress-header">
                        <div className="navigation-progress-info">
                            <span>{remainingTime !== undefined ? formatDuration(remainingTime) : '--'}</span>
                            <span className="progress-percentage">{remainingDistance !== undefined ? formatDistance(remainingDistance) : '--'}</span>
                        </div>
                        <button className="hud-save-button" onClick={onSaveRoute} aria-label={t('saveRoute')}>
                            <SaveIcon />
                        </button>
                    </div>
                    <div className="progress-bar-bg">
                        <div className="progress-bar-fill" style={{ width: `${progressPercent}%` }}></div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default DriverHUD;