import React from 'react';

interface SpeedometerProps {
    speed: number;
}

const Speedometer: React.FC<SpeedometerProps> = ({ speed }) => {
    const MAX_SPEED = 160;
    const progress = Math.min(Math.max(speed, 0), MAX_SPEED) / MAX_SPEED;

    const ARC_RADIUS = 40;
    const ARC_CIRCUMFERENCE = 2 * Math.PI * ARC_RADIUS;
    // An SVG path for a semicircle (180 degrees) is used for simplicity
    const ARC_LENGTH = ARC_CIRCUMFERENCE / 2;
    const strokeDashoffset = ARC_LENGTH * (1 - progress);

    const gradientId = "speedGradient";

    return (
        <div className="speedometer-gauge">
            <svg viewBox="0 0 100 60" className="speedometer-svg">
                <defs>
                    <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="var(--c-success)" />
                        <stop offset="50%" stopColor="var(--c-warning)" />
                        <stop offset="100%" stopColor="var(--c-danger)" />
                    </linearGradient>
                </defs>
                {/* Background Arc */}
                <path
                    d="M 10 50 A 40 40 0 0 1 90 50"
                    fill="none"
                    stroke="var(--c-border)"
                    strokeWidth="10"
                    strokeLinecap="round"
                />
                {/* Progress Arc */}
                <path
                    d="M 10 50 A 40 40 0 0 1 90 50"
                    fill="none"
                    stroke={`url(#${gradientId})`}
                    strokeWidth="10"
                    strokeLinecap="round"
                    strokeDasharray={ARC_LENGTH}
                    strokeDashoffset={strokeDashoffset}
                />
            </svg>
            <div className="speedometer-readout">
                <span className="speed-value">{speed}</span>
                <span className="speed-unit">km/h</span>
            </div>
        </div>
    );
};

export default Speedometer;