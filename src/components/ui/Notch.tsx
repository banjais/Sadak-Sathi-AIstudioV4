import React, { useState, useEffect } from 'react';

const WifiIcon = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12.55a11 11 0 0 1 14.08 0"/><path d="M1.42 9a16 16 0 0 1 21.16 0"/><path d="M8.53 16.11a6 6 0 0 1 6.95 0"/><line x1="12" y1="20" x2="12.01" y2="20"/></svg>;
const SignalIcon = () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M2 16.1A5 5 0 0 1 5.9 20" />
        <path d="M2 12.05A9 9 0 0 1 9.95 20" />
        <path d="M2 8a13 13 0 0 1 13.95 20" />
        <path d="M2 4a17 17 0 0 1 17.95 20" />
    </svg>
);
const BatteryIcon = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="1" y="6" width="18" height="12" rx="2" ry="2"/><line x1="23" y1="13" x2="23" y2="11"/></svg>;


const Notch = () => {
    const [time, setTime] = useState('');

    useEffect(() => {
        const updateClock = () => {
            const now = new Date();
            const hours = String(now.getHours()).padStart(2, '0');
            const minutes = String(now.getMinutes()).padStart(2, '0');
            setTime(`${hours}:${minutes}`);
        };

        updateClock();
        const timerId = setInterval(updateClock, 1000); // Update every second to catch minute change

        return () => clearInterval(timerId);
    }, []);

    return (
        <div className="notch">
            <span className="time">{time}</span>
            <div className="notch-icons">
                <SignalIcon />
                <WifiIcon />
                <BatteryIcon />
            </div>
        </div>
    );
};

export default Notch;