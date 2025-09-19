import React, { useState, useEffect } from 'react';

interface NotificationProps {
    message: string | null;
    onDismiss: () => void;
}

const AlertIcon = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
        <line x1="12" y1="9" x2="12" y2="13"></line>
        <line x1="12" y1="17" x2="12.01" y2="17"></line>
    </svg>
);

const Notification: React.FC<NotificationProps> = ({ message, onDismiss }) => {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        let timer: number;
        if (message) {
            setIsVisible(true);
            timer = window.setTimeout(() => {
                onDismiss();
            }, 8000); // 8 seconds
        } else {
            setIsVisible(false);
        }
        return () => clearTimeout(timer);
    }, [message, onDismiss]);

    if (!message) {
         return <div className={`incident-alert-container ${isVisible ? 'visible' : ''}`}></div>;
    }

    return (
        <div
            className={`incident-alert-container ${isVisible ? 'visible' : ''}`}
            onClick={onDismiss}
            role="alert"
            aria-live="assertive"
        >
            <div className="incident-alert-icon">
                <AlertIcon />
            </div>
            <span className="incident-alert-text">{message}</span>
        </div>
    );
};

export default Notification;