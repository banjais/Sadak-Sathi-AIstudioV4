import React from 'react';
import { useTranslation } from '../../hooks/useTranslation';

interface LayerSelectionModalProps {
    isOpen: boolean;
    onClose: () => void;
    currentLayer: string;
    onChangeLayer: (layerId: string) => void;
}

const availableLayers = [
    {
        id: 'Streets',
        nameKey: 'layer_streets',
        descKey: 'layer_streets_desc',
        thumbnailUrl: 'https://basemaps.cartocdn.com/rastertiles/voyager/13/4425/2896.png'
    },
    {
        id: 'Satellite',
        nameKey: 'layer_satellite',
        descKey: 'layer_satellite_desc',
        thumbnailUrl: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/13/2896/4425'
    },
    {
        id: 'Topographic',
        nameKey: 'layer_topo',
        descKey: 'layer_topo_desc',
        thumbnailUrl: 'https://tile.opentopomap.org/13/4425/2896.png'
    },
];

const LayerSelectionModal: React.FC<LayerSelectionModalProps> = ({ isOpen, onClose, currentLayer, onChangeLayer }) => {
    const { t } = useTranslation();

    if (!isOpen) return null;

    const handleSelect = (layerId: string) => {
        onChangeLayer(layerId);
        onClose();
    };

    return (
        <div className="modal-overlay" onClick={onClose} role="dialog" aria-modal="true" aria-labelledby="layer-modal-title">
            <div className={`modal-content ${isOpen ? 'open' : ''}`} onClick={(e) => e.stopPropagation()}>
                <div className="modal-handle"></div>
                <header className="modal-header">
                    <h2 id="layer-modal-title">{t('selectMapLayer')}</h2>
                    <button className="modal-close-button" onClick={onClose} aria-label={t('close')}>&times;</button>
                </header>
                <div className="modal-body">
                    <div className="layer-selection-container">
                        {availableLayers.map((layer) => (
                            <button
                                key={layer.id}
                                className={`layer-selection-card ${currentLayer === layer.id ? 'active' : ''}`}
                                onClick={() => handleSelect(layer.id)}
                                aria-pressed={currentLayer === layer.id}
                            >
                                <img src={layer.thumbnailUrl} alt={`${t(layer.nameKey)} map style thumbnail`} className="layer-thumbnail" />
                                <div className="layer-info">
                                    <h3>{t(layer.nameKey)}</h3>
                                    <p>{t(layer.descKey)}</p>
                                </div>
                            </button>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LayerSelectionModal;
