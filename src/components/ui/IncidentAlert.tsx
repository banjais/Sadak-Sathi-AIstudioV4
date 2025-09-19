import React, { useState, useEffect } from 'react';
import { useTranslation } from '../../hooks/useTranslation';

interface IncidentAlertProps {
    incident: any | null;
    onClick: (incident: any) => void;
}

const AlertIcon = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
        <line x1="12" y1="9" x2="12" y2="13" />
        <line x1="12" y1="17" x2="12.01" y2="17" />
    </svg>
);

const IncidentAlert: React.FC<IncidentAlertProps> = ({ incident, onClick }) => {
    const { t } = useTranslation();
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        // This effect controls the visibility and animation of the alert.
        // It becomes visible when a new incident is passed in.
        setIsVisible(!!incident);
    }, [incident]);

    if (!incident) {
        // Even if invisible, we keep the element in the DOM for a moment 
        // to allow the exit animation (if we were to add one).
        // For a simple slide up/down, this is sufficient.
        return <div className={`incident-alert-container ${isVisible ? 'visible' : ''}`}></div>;
    }

    return (
        <div
            className={`incident-alert-container ${isVisible ? 'visible' : ''}`}
            onClick={() => onClick(incident)}
            role="alert"
            aria-live="assertive"
        >
            <div className="incident-alert-icon">
                <AlertIcon />
            </div>
            <span className="incident-alert-text">{t(incident.titleKey)}</span>
        </div>
    );
};

export default IncidentAlert;