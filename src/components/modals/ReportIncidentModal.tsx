import React, { useState, useEffect } from 'react';
import { useTranslation } from '../../hooks/useTranslation';
import { submitIncidentReport } from '../../api/incidentsApi';

// Props for the modal
interface ReportIncidentModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmitSuccess: () => void; // Callback for successful submission
    initialIncidentType?: string | null;
}

const IncidentIcon = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" /><line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" />
    </svg>
);

const CameraIcon = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" /><circle cx="12" cy="13" r="4" />
    </svg>
);

const CheckIcon = () => (
     <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="#34c759" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="20 6 9 17 4 12" />
    </svg>
);


const ReportIncidentModal: React.FC<ReportIncidentModalProps> = ({ isOpen, onClose, onSubmitSuccess, initialIncidentType }) => {
    const { t } = useTranslation();
    // FIX: Using incident types consistent with the filter modal ('Blocked' instead of 'Roadblock')
    const [incidentType, setIncidentType] = useState('Blocked');
    const [description, setDescription] = useState('');
    const [photo, setPhoto] = useState<File | null>(null);
    const [photoPreview, setPhotoPreview] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [error, setError] = useState<string | null>(null);
    
    useEffect(() => {
        // Reset form when modal is closed, or set initial type when opened
        if (isOpen) {
            setIncidentType(initialIncidentType || 'Blocked');
        } else {
            const timer = setTimeout(() => {
                setIncidentType('Blocked');
                setDescription('');
                setPhoto(null);
                setPhotoPreview(null);
                setIsSubmitting(false);
                setIsSubmitted(false);
                setError(null);
            }, 300); // Wait for closing animation
            return () => clearTimeout(timer);
        }
    }, [isOpen, initialIncidentType]);

    const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setPhoto(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setPhotoPreview(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        setError(null);
        try {
            if (!navigator.geolocation) {
                throw new Error('Geolocation is not supported by this browser.');
            }
            // Get user's current location
            const position = await new Promise<GeolocationPosition>((resolve, reject) => {
                navigator.geolocation.getCurrentPosition(resolve, reject, { timeout: 10000 });
            });
            const { latitude, longitude } = position.coords;

            const result = await submitIncidentReport({
                incidentType,
                description,
                photo,
                location: { lat: latitude, lng: longitude }
            });

            if (!result.success) {
                 throw new Error(result.message || 'Failed to submit report.');
            }
            
            setIsSubmitted(true);
            onSubmitSuccess(); // Notify parent component
            setTimeout(() => {
                onClose();
            }, 2000); // Close modal after 2 seconds
        } catch (error) {
            console.error("Failed to submit report:", error);
            setError(error instanceof Error ? error.message : t('error_submit_incident'));
            setIsSubmitting(false);
        }
    };

    if (!isOpen && !isSubmitted) return null;

    return (
        <div className="modal-overlay" onClick={onClose} role="dialog" aria-modal="true" aria-labelledby="modal-title">
            <div className={`modal-content ${isOpen ? 'open' : ''}`} onClick={(e) => e.stopPropagation()}>
                <div className="modal-handle"></div>
                 {isSubmitted ? (
                    <div className="modal-success-view">
                        <CheckIcon />
                        <h2 id="modal-title">{t('reportSubmitted')}</h2>
                        <p>{t('thankYouMessage')}</p>
                    </div>
                ) : (
                    <>
                        <header className="modal-header">
                            <h2 id="modal-title">
                                {/* FIX: Corrected component name from Incident to IncidentIcon and completed the header */}
                                <IncidentIcon /> {t('reportAnIncident')}
                            </h2>
                            <button className="modal-close-button" onClick={onClose} aria-label={t('close')}>&times;</button>
                        </header>
                        <form className="modal-body" onSubmit={handleSubmit}>
                            {error && <p className="modal-error">{error}</p>}
                            <div className="form-group">
                                <label htmlFor="incidentType">{t('incidentType')}</label>
                                <select id="incidentType" value={incidentType} onChange={(e) => setIncidentType(e.target.value)}>
                                    <option value="Blocked">{t('incident_blocked')}</option>
                                    <option value="One-Lane">{t('incident_one-lane')}</option>
                                    <option value="Traffic Jam">{t('incident_traffic_jam')}</option>
                                    <option value="Road Hazard">{t('incident_road_hazard')}</option>
                                    <option value="Vehicle Breakdown">{t('incident_vehicle_breakdown')}</option>
                                    <option value="Other">{t('incident_other')}</option>
                                </select>
                            </div>
                            <div className="form-group">
                                <label htmlFor="description">{t('description')}</label>
                                <textarea
                                    id="description"
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    placeholder={t('incident_add_description')}
                                    rows={3}
                                />
                            </div>
                            <div className="form-group">
                                <label htmlFor="photo-upload" className="photo-upload-label">
                                    <CameraIcon />
                                    <span>{photo ? t('changePhoto') : t('addPhoto')}</span>
                                </label>
                                <input id="photo-upload" type="file" accept="image/*" onChange={handlePhotoChange} style={{ display: 'none' }} />
                                {photoPreview && <img src={photoPreview} alt="Incident preview" className="photo-preview" />}
                            </div>
                            <footer className="modal-footer">
                                <button type="button" className="modal-button" onClick={onClose}>
                                    {t('cancel')}
                                </button>
                                <button type="submit" className="modal-button modal-button-primary" disabled={isSubmitting}>
                                    {isSubmitting ? <div className="loader-small"></div> : t('submitReport')}
                                </button>
                            </footer>
                        </form>
                    </>
                )}
            </div>
        </div>
    );
};

// FIX: Added the missing default export
export default ReportIncidentModal;
