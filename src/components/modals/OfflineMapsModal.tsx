import React, { useState, useEffect, useCallback } from 'react';
import { useTranslation } from '../../hooks/useTranslation';
import { nepalRegions, Region, getRegionStatuses, RegionStatus, downloadTilesForRegion, deleteTilesForRegion } from '../../api/offlineMapApi';

const DownloadIcon = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>;
const CheckIcon = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>;
const TrashIcon = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>;

interface OfflineMapsModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const OfflineMapsModal: React.FC<OfflineMapsModalProps> = ({ isOpen, onClose }) => {
    const { t } = useTranslation();
    const [regionStatuses, setRegionStatuses] = useState<RegionStatus>(getRegionStatuses());
    const [isProcessing, setIsProcessing] = useState<string | null>(null);

    const updateStatuses = useCallback(() => {
        setRegionStatuses(getRegionStatuses());
    }, []);

    useEffect(() => {
        if (isOpen) {
            window.addEventListener('region-status-change', updateStatuses);
            updateStatuses();
        }
        return () => {
            window.removeEventListener('region-status-change', updateStatuses);
        };
    }, [isOpen, updateStatuses]);

    const handleDownload = async (region: Region) => {
        setIsProcessing(region.id);
        await downloadTilesForRegion(region, (progress) => {
            // The event listener will handle UI updates
        });
        setIsProcessing(null);
    };

    const handleDelete = async (region: Region) => {
        setIsProcessing(region.id);
        await deleteTilesForRegion(region, () => {});
        setIsProcessing(null);
    };

    const getRegionComponent = (region: Region) => {
        const statusInfo = regionStatuses[region.id];
        const status = statusInfo?.status || 'none';
        const progress = statusInfo?.progress || 0;
        const processingThisRegion = isProcessing === region.id;

        let actionButton;
        switch (status) {
            case 'downloaded':
                actionButton = (
                    <button className="offline-region-button delete" onClick={() => handleDelete(region)} disabled={!!isProcessing}>
                        <TrashIcon /> {t('delete')}
                    </button>
                );
                break;
            case 'downloading':
                actionButton = <div className="loader-small"></div>;
                break;
            default:
                actionButton = (
                    <button className="offline-region-button download" onClick={() => handleDownload(region)} disabled={!!isProcessing}>
                        <DownloadIcon /> {t('download')}
                    </button>
                );
                break;
        }

        return (
            <li key={region.id} className="offline-region-item">
                <div className="offline-region-info">
                    <h3>{t(region.nameKey)}</h3>
                    {status === 'downloading' && (
                        <div className="progress-bar-container">
                             <div className="progress-bar" style={{ width: `${progress}%` }}></div>
                             <span className="progress-text">{progress}%</span>
                        </div>
                    )}
                     {status === 'downloaded' && <span className="status-text downloaded"><CheckIcon /> {t('downloaded')}</span>}
                </div>
                <div className="offline-region-action">
                    {processingThisRegion ? <div className="loader-small"></div> : actionButton}
                </div>
            </li>
        );
    };

    if (!isOpen) return null;

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className={`modal-content ${isOpen ? 'open' : ''}`} onClick={(e) => e.stopPropagation()}>
                <div className="modal-handle"></div>
                <header className="modal-header">
                    <h2>{t('offlineMapsTitle')}</h2>
                    <button className="modal-close-button" onClick={onClose} aria-label={t('close')}>&times;</button>
                </header>
                <div className="modal-body">
                    <p className="offline-maps-info">{t('offlineMapsDescription')}</p>
                    <ul className="offline-region-list">
                        {nepalRegions.map(region => getRegionComponent(region))}
                    </ul>
                </div>
            </div>
        </div>
    );
};

export default OfflineMapsModal;
