import React from 'react';
import { useTranslation } from '../../hooks/useTranslation';

const PavementLegend: React.FC = () => {
    const { t } = useTranslation();

    return (
        <div className="pavement-legend">
            <h4 className="legend-title">{t('legend_pavement_title')}</h4>
            <ul className="legend-items">
                <li className="legend-item">
                    <span className="legend-swatch good"></span>
                    {t('legend_pavement_good')}
                </li>
                <li className="legend-item">
                    <span className="legend-swatch fair"></span>
                    {t('legend_pavement_fair')}
                </li>
                <li className="legend-item">
                    <span className="legend-swatch poor"></span>
                    {t('legend_pavement_poor')}
                </li>
            </ul>
        </div>
    );
};

export default PavementLegend;