import React, { useState } from 'react';
import { FaVolumeUp, FaVolumeMute } from 'react-icons/fa';
import useVoiceOver from '../../hooks/useVoiceOver';

/**
 * VoiceOver button component to toggle voice reading
 * @param {string} text - Text to read 
 * @param {object} options - Voice reading options
 */
const VoiceOverButton = ({ text, options = {} }) => {
  const { speak, stop, isPlaying } = useVoiceOver();
  const [isActive, setIsActive] = useState(false);

  const handleToggle = () => {
    if (isActive) {
      stop();
      setIsActive(false);
    } else {
      speak(text, {
        ...options,
        onEnd: () => setIsActive(false),
        onError: () => setIsActive(false)
      });
      setIsActive(true);
    }
  };

  return (
    <button
      onClick={handleToggle}
      className={`fixed bottom-8 right-8 z-50 p-4 rounded-full shadow-2xl transition-all duration-300 hover:scale-110 ${
        isActive 
          ? 'bg-green-500 hover:bg-green-600 animate-pulse' 
          : 'bg-black hover:bg-gray-800'
      }`}
      aria-label={isActive ? 'Arrêter la lecture vocale' : 'Activer la lecture vocale'}
      title={isActive ? 'Arrêter la lecture vocale' : 'Activer la lecture vocale'}
    >
      {isActive ? (
        <FaVolumeUp className="text-white text-3xl" />
      ) : (
        <FaVolumeMute className="text-white text-3xl" />
      )}
    </button>
  );
};

export default VoiceOverButton;
