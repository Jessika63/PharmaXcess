import { useEffect, useRef, useCallback } from 'react';
import { useVoiceOverContext } from '../context/VoiceOverContext';

/**
 * Hook to manage VoiceOver functionality.
 * Use the web API SpeechSynthesis for TTS.
 */
export const useVoiceOver = () => {
  const utteranceRef = useRef(null);
  const isPlayingRef = useRef(false);
  const voicesLoadedRef = useRef(false);
  const { isVoiceOverEnabled } = useVoiceOverContext();

  // Load available voices on mount
  useEffect(() => {
    if ('speechSynthesis' in window) {
      // Function to load voices
      const loadVoices = () => {
        const voices = window.speechSynthesis.getVoices();
        if (voices.length > 0) {
          voicesLoadedRef.current = true;
        }
      };

      // Load immediately
      loadVoices();

      // Listen for voiceschanged event
      window.speechSynthesis.addEventListener('voiceschanged', loadVoices);

      return () => {
        window.speechSynthesis.removeEventListener('voiceschanged', loadVoices);
      };
    }
  }, []);

  // Function to speak a text
  const speak = useCallback((text, options = {}) => {
    // Do nothing if VoiceOver is disabled
    if (!isVoiceOverEnabled) {
      return;
    }

    // If the browser does not support speech synthesis
    if (!('speechSynthesis' in window)) {
      console.warn('La synthèse vocale n\'est pas supportée par ce navigateur');
      return;
    }

    // Function to perform the speaking with retries
    const performSpeak = (retryCount = 0) => {
      // Force reload voices
      const voices = window.speechSynthesis.getVoices();

      // If no voices after 5 attempts, give up with a message
      if (voices.length === 0 && retryCount >= 5) {
        console.error('Aucune voix disponible après 5 tentatives. Vérifiez les paramètres TTS de votre système.');
        alert('Synthèse vocale non disponible. Veuillez vérifier que votre système a des voix TTS installées.');
        return;
      }

      // If no voices, retry after a delay
      if (voices.length === 0) {
        const delay = 200 * (retryCount + 1); // 200ms, 400ms, 600ms, etc.
        setTimeout(() => performSpeak(retryCount + 1), delay);
        return;
      }

      // Stop any ongoing speech
      window.speechSynthesis.cancel();

      if (!text || text.trim() === '') {
        return;
      }

      // Create a new utterance
      const utterance = new SpeechSynthesisUtterance(text);
      
      // Default configuration
      utterance.lang = options.lang || 'fr-FR';
      utterance.rate = options.rate || 1.0;
      utterance.pitch = options.pitch || 1.0;
      utterance.volume = options.volume || 1.0;

      // Select a French voice if available
      const frenchVoices = voices.filter(voice => voice.lang.includes('fr'));
      
      if (frenchVoices.length > 0) {
        utterance.voice = frenchVoices[0];
      } else {
        // Use the first available voice if no French voice
        utterance.voice = voices[0];
      }

      // Optional event handlers
      utterance.onstart = () => {
        isPlayingRef.current = true;
        options.onStart?.();
      };

      utterance.onend = () => {
        isPlayingRef.current = false;
        options.onEnd?.();
      };

      utterance.onerror = (event) => {
        isPlayingRef.current = false;
        options.onError?.(event);
      };

      utteranceRef.current = utterance;
      
      // Start speaking
      window.speechSynthesis.speak(utterance);
      
      // Check status after a short delay
      setTimeout(() => {
        void window.speechSynthesis.speaking;
        void window.speechSynthesis.pending;
      }, 100);
    };

    // Start the speaking attempt
    performSpeak();
  }, [isVoiceOverEnabled]);

  // Function to stop speaking
  const stop = useCallback(() => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      isPlayingRef.current = false;
    }
  }, []);

  // Function to pause speaking
  const pause = useCallback(() => {
    if ('speechSynthesis' in window && isPlayingRef.current) {
      window.speechSynthesis.pause();
    }
  }, []);

  // Function to resume speaking
  const resume = useCallback(() => {
    if ('speechSynthesis' in window && window.speechSynthesis.paused) {
      window.speechSynthesis.resume();
    }
  }, []);

  // Cleanup on component unmount
  useEffect(() => {
    return () => {
      stop();
    };
  }, [stop]);

  return {
    speak,
    stop,
    pause,
    resume,
    isPlaying: isPlayingRef.current
  };
};

/**
 * Hook to automatically read a text when the component mounts
 * @param {string} text - Text to read
 * @param {object} options - Reading options
 */
export const useAutoVoiceOver = (text, options = {}) => {
  const { speak, stop } = useVoiceOver();
  const { isVoiceOverEnabled } = useVoiceOverContext();

  useEffect(() => {
    if (isVoiceOverEnabled && text) {
      // Small delay to ensure the page is loaded
      const timer = setTimeout(() => {
        speak(text, options);
      }, 500);

      return () => {
        clearTimeout(timer);
        stop();
      };
    }
  }, [text, isVoiceOverEnabled, speak, stop]);

  return { speak, stop };
};

export default useVoiceOver;
