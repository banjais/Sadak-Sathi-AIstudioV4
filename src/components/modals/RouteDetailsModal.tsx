import React, { useState, useEffect } from 'react';
import { useTranslation } from '../../hooks/useTranslation';
import { Route } from '../../api/routingApi';

// Props for the modal
interface RouteDetailsModalProps {
    isOpen: boolean;
    onClose: () => void;
    route: Route | null;
}

const RouteIcon = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" /><polygon points="10 8 16 12 10 16 10 8" />
    </svg>
);

// Icons for directions
const TurnLeftIcon = () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 14 4 9 9 4" /><path d="M20 20v-7a4 4 0 0 0-4-4H4" /></svg>;
const TurnRightIcon = () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 14 20 9 15 4" /><path d="M4 20v-7a4 4 0 0 1 4-4h12" /></svg>;
const StraightIcon = () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="19" x2="12" y2="5" /><polyline points="5 12 12 5 19 12" /></svg>;
const DestinationIcon = () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" /><circle cx="12" cy="10" r="3" /></svg>;
const ClockIcon = () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>;
const DistanceIcon = () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg>;

const formatDuration = (seconds: number): string => {
    if (seconds < 60) return `~1 min`;
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const parts: string[] = [];
    if (h > 0) parts.push(`${h}h`);
    if (m > 0) parts.push(`${m}m`);
    return parts.join(' ');
};

const getInstructionIcon = (instructionKey: string) => {
    if (instructionKey.includes('left')) return <TurnLeftIcon />;
    if (instructionKey.includes('right')) return <TurnRightIcon />;
    if (instructionKey.includes('arrive')) return <DestinationIcon />;
    return <StraightIcon />;
};

const formatDistance = (meters: number): string => {
    if (meters < 1000) return `${Math.round(meters)} m`;
    return `${(meters / 1000).toFixed(1)} km`;
};

const RouteDetailsModal: React.FC<RouteDetailsModalProps> = ({ isOpen, onClose, route }) => {
    const { t } = useTranslation();
    const [stepsWithEtas, setStepsWithEtas] = useState<any[]>([]);

    useEffect(() => {
        if (!isOpen || !route) {
            return;
        }

        const calculateEtas = () => {
            const startTime = Date.now();
            let cumulativeDurationSeconds = 0;

            const steps = route.legs.flatMap(leg => leg.steps).map(step => {
                cumulativeDurationSeconds += step.duration;
                const arrivalTime = new Date(startTime + cumulativeDurationSeconds * 1000);
                const formattedTime = arrivalTime.toLocaleTimeString(undefined, {
                    hour: '2-digit',
                    minute: '2-digit',
                });
                return { ...step, eta: formattedTime };
            });
            setStepsWithEtas(steps);
        };

        calculateEtas();
        const intervalId = setInterval(calculateEtas, 30000); // Update every 30 seconds

        return () => clearInterval(intervalId);
    }, [isOpen, route]);

    if (!isOpen || !route) return null;

    return (
        <div className="modal-overlay" onClick={onClose} role="dialog" aria-modal="true" aria-labelledby="route-details-title">
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                <div className="modal-handle"></div>
                <header className="modal-header">
                    <h2 id="route-details-title"><RouteIcon /> {t('details')}</h2>
                    <button className="modal-close-button" onClick={onClose} aria-label={t('close')}>&times;</button>
                </header>
                <div className="modal-body">
                    <div className="directions-summary">
                        <div className="summary-item">
                            <ClockIcon />
                            <span>{formatDuration(route.duration)}</span>
                        </div>
                        <div className="summary-item">
                            <DistanceIcon />
                            <span>{formatDistance(route.distance)}</span>
                        </div>
                    </div>
                    <ul className="directions-list">
                        {stepsWithEtas.map((step, index) => (
                            <li key={index} className="direction-item">
                                <div className="direction-icon">
                                    {getInstructionIcon(step.instructionKey)}
                                </div>
                                <div className="direction-text">
                                    <p>{t(step.instructionKey)}</p>
                                    <span>{formatDistance(step.distance)}</span>
                                </div>
                                <div className="direction-eta">
                                    <span>{step.eta}</span>
                                </div>
                            </li>
                        ))}
                    </ul>
                </div>
                <footer className="modal-footer">
                    <button type="button" className="modal-button modal-button-primary" onClick={onClose}>{t('close')}</button>
                </footer>
            </div>
        </div>
    );
};

export default RouteDetailsModal;