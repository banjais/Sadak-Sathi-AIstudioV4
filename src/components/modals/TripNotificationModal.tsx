import React, { useEffect } from 'react';
import { useTranslation } from '../../hooks/useTranslation';
import { SavedRoute } from './SavedRoutesModal';

interface TripNotificationModalProps {
    isOpen: boolean;
    onClose: () => void;
    trip: SavedRoute | null;
    onStartTrip: (trip: SavedRoute) => void;
}

const TripNotificationModal: React.FC<TripNotificationModalProps> = ({ isOpen, onClose, trip, onStartTrip }) => {
    const { t } = useTranslation();

    // Auto-dismiss after 20 seconds if no action is taken
    useEffect(() => {
        if (isOpen) {
            const timer = setTimeout(() => {
                onClose();
            }, 20000); 
            return () => clearTimeout(timer);
        }
    }, [isOpen, onClose]);
    
    if (!isOpen || !trip) return null;

    return (
        <div className="modal-overlay" onClick={onClose} role="dialog" aria-modal="true" aria-labelledby="notification-title">
            <div className={`modal-content ${isOpen ? 'open' : ''}`} onClick={(e) => e.stopPropagation()}>
                <div className="modal-handle"></div>
                <div className="modal-body trip-notification-body">
                    <h3 id="notification-title">{t('timeToLeaveTitle')}</h3>
                    <p>{t('timeToLeaveMessage', { destination: trip.end.name })}</p>
                </div>
                <footer className="modal-footer">
                    <button type="button" className="modal-button" onClick={onClose}>
                        {t('dismiss')}
                    </button>
                    <button type="button" className="modal-button modal-button-primary" onClick={() => onStartTrip(trip)}>
                        {t('startNow')}
                    </button>
                </footer>
            </div>
        </div>
    );
};

export default TripNotificationModal;