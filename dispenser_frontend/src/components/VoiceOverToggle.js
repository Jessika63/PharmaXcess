import React from 'react';
import { FaVolumeUp, FaVolumeMute } from 'react-icons/fa';
import { useVoiceOverContext } from '../context/VoiceOverContext';

/**
 * Toggle button for VoiceOver feature.
 * To place only once in the app, preferably in App.js or a layout component.
 */
const VoiceOverToggle = () => {
  const { isVoiceOverEnabled, toggleVoiceOver } = useVoiceOverContext();

  return (
    <button
      onClick={toggleVoiceOver}
      className={`fixed top-8 right-8 z-50 p-4 rounded-full shadow-2xl transition-all duration-300 hover:scale-110 ${
        isVoiceOverEnabled 
          ? 'bg-green-500 hover:bg-green-600' 
          : 'bg-gray-400 hover:bg-gray-500'
      }`}
      aria-label={isVoiceOverEnabled ? 'Désactiver la lecture vocale' : 'Activer la lecture vocale'}
      title={isVoiceOverEnabled ? 'Désactiver la lecture vocale' : 'Activer la lecture vocale'}
    >
      {isVoiceOverEnabled ? (
        <FaVolumeUp className="text-white text-3xl" />
      ) : (
        <FaVolumeMute className="text-white text-3xl" />
      )}
    </button>
  );
};

export default VoiceOverToggle;
