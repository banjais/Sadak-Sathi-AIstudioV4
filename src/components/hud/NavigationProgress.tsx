import React from 'react';
import { useTranslation } from '../../hooks/useTranslation';

interface NavigationProgressProps {
    progress: number;
    destinationName: string;
}

const NavigationProgress: React.FC<NavigationProgressProps> = ({ progress, destinationName }) => {
    const { t } = useTranslation();
    const progressPercent = Math.min(100, Math.max(0, progress));

    return (
        <div className="navigation-progress-container">
            <div className="navigation-progress-header">
                <span>{t('destination')}: {destinationName}</span>
                <span className="progress-percentage">{Math.round(progressPercent)}%</span>
            </div>
            <div className="progress-bar-bg">
                <div className="progress-bar-fill" style={{ width: `${progressPercent}%` }}></div>
            </div>
        </div>
    );
};

export default NavigationProgress;