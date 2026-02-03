import React, { createContext, useContext, useState, useEffect } from 'react';

const VoiceOverContext = createContext();

export const useVoiceOverContext = () => {
  const context = useContext(VoiceOverContext);
  if (!context) {
    throw new Error('useVoiceOverContext must be used within a VoiceOverProvider');
  }
  return context;
};

export const VoiceOverProvider = ({ children }) => {
  // VoiceOver setup by default 
  const [isVoiceOverEnabled, setIsVoiceOverEnabled] = useState(true);

  // Function to stop all ongoing speech
  const stopAllSpeech = () => {
    if (window.speechSynthesis) {
      window.speechSynthesis.cancel();
      // Ensure that everything is stopped
      setTimeout(() => {
        if (window.speechSynthesis.speaking) {
          window.speechSynthesis.cancel();
        }
      }, 50);
    }
  };

  const toggleVoiceOver = () => {
    const newState = !isVoiceOverEnabled;
    setIsVoiceOverEnabled(newState);
    
    // If we disable VoiceOver, stop any ongoing speech
    if (!newState) {
      stopAllSpeech();
    }
  };

  const enableVoiceOver = () => {
    setIsVoiceOverEnabled(true);
  };

  const disableVoiceOver = () => {
    setIsVoiceOverEnabled(false);
    stopAllSpeech();
  };

  // Cleanup on component unmount
  useEffect(() => {
    return () => {
      stopAllSpeech();
    };
  }, []);

  return (
    <VoiceOverContext.Provider 
      value={{ 
        isVoiceOverEnabled, 
        toggleVoiceOver,
        enableVoiceOver,
        disableVoiceOver
      }}
    >
      {children}
    </VoiceOverContext.Provider>
  );
};
