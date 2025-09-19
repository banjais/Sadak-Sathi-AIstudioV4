import React from 'react';
import { useTranslation } from '../../hooks/useTranslation';

interface InfoPanelProps {
    onClose: () => void;
    title: string;
    children: React.ReactNode;
}

const InfoPanel: React.FC<InfoPanelProps> = ({ onClose, title, children }) => {
    const { t } = useTranslation();

    return (
        <div className="info-panel">
            <div className="info-panel-header">
                <h3>{title}</h3>
                <button onClick={onClose} aria-label={t('close')}>&times;</button>
            </div>
            <div className="info-panel-body">
                {children}
            </div>
        </div>
    );
};

export default InfoPanel;
