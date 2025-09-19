import React, { useState, useEffect } from 'react';
import { useTranslation } from '../../hooks/useTranslation';

const CompassIcon = () => (
    <svg width="100" height="100" viewBox="0 0 100 100" className="compass-svg">
        <circle cx="50" cy="50" r="48" fill="none" stroke="#fff" strokeWidth="2" opacity="0.5"/>
        <path d="M50 2 L45 15 L55 15 Z" fill="#e54e4e" />
        <path d="M50 98 L45 85 L55 85 Z" fill="#fff" />
        <text x="50" y="20" textAnchor="middle" fill="#fff" fontSize="12" dy="-5">N</text>
        <text x="50" y="90" textAnchor="middle" fill="#fff" fontSize="12" dy="5">S</text>
        <text x="15" y="55" textAnchor="middle" fill="#fff" fontSize="12">W</text>
        <text x="85" y="55" textAnchor="middle" fill="#fff" fontSize="12">E</text>
    </svg>
);

const Compass = () => {
    const [heading, setHeading] = useState(0);
    const [permissionNeeded, setPermissionNeeded] = useState(false);
    const { t } = useTranslation();

    const handleOrientation = (event: DeviceOrientationEvent | any) => {
        let alpha = event.alpha;
        // Safari uses webkitCompassHeading
        if (typeof event.webkitCompassHeading !== 'undefined') {
            alpha = event.webkitCompassHeading;
        }
        if (alpha !== null) {
            setHeading(alpha);
        }
    };

    useEffect(() => {
        try {
            // First, check if the API is supported at all.
            if (typeof DeviceOrientationEvent === 'undefined') {
                console.warn("DeviceOrientationEvent not supported on this browser.");
                return;
            }

            // Then, feature detect for the iOS 13+ permission model.
            if (typeof (DeviceOrientationEvent as any).requestPermission === 'function') {
                setPermissionNeeded(true);
            } else {
                window.addEventListener('deviceorientation', handleOrientation);
            }

            return () => {
                // Ensure we only try to remove the listener if the API exists.
                if (typeof DeviceOrientationEvent !== 'undefined') {
                     window.removeEventListener('deviceorientation', handleOrientation);
                }
            };
        } catch (error) {
             console.error("Could not initialize Compass due to an error with DeviceOrientationEvent:", error);
        }
    }, []);

    const requestPermission = () => {
        (DeviceOrientationEvent as any).requestPermission()
            .then((response: string) => {
                if (response === 'granted') {
                    window.addEventListener('deviceorientation', handleOrientation);
                    setPermissionNeeded(false);
                }
            })
            .catch(console.error);
    };

    if (permissionNeeded) {
        return <button onClick={requestPermission} className="compass-permission-btn">{t('enableCompass')}</button>
    }

    return (
        <div className="compass">
            <div className="compass-dial" style={{ transform: `rotate(${-heading}deg)` }}>
                <CompassIcon />
            </div>
        </div>
    );
};

export default Compass;