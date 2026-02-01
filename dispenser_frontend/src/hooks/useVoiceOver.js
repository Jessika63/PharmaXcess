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
          console.log('Voices loaded:', voices.length);
          console.log('Available French voices:', voices.filter(v => v.lang.includes('fr')).map(v => v.name));
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
    console.log('speak() called with:', { text, isVoiceOverEnabled });
    
    // Do nothing if VoiceOver is disabled
    if (!isVoiceOverEnabled) {
      console.log('VoiceOver is disabled, not speaking');
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
      console.log(`Attempt ${retryCount + 1}: voices available:`, voices.length);

      // If no voices after 5 attempts, give up with a message
      if (voices.length === 0 && retryCount >= 5) {
        console.error('Aucune voix disponible après 5 tentatives. Vérifiez les paramètres TTS de votre système.');
        alert('Synthèse vocale non disponible. Veuillez vérifier que votre système a des voix TTS installées.');
        return;
      }

      // If no voices, retry after a delay
      if (voices.length === 0) {
        const delay = 200 * (retryCount + 1); // 200ms, 400ms, 600ms, etc.
        console.log(`No voices yet, retrying in ${delay}ms...`);
        setTimeout(() => performSpeak(retryCount + 1), delay);
        return;
      }

      // Stop any ongoing speech
      window.speechSynthesis.cancel();

      if (!text || text.trim() === '') {
        console.log('Empty text, not speaking');
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
      console.log('Available French voices:', frenchVoices.map(v => v.name));
      
      if (frenchVoices.length > 0) {
        utterance.voice = frenchVoices[0];
        console.log('Using French voice:', frenchVoices[0].name);
      } else {
        // Use the first available voice if no French voice
        utterance.voice = voices[0];
        console.log('No French voice, using:', voices[0].name);
      }

      console.log('Utterance created:', { 
        lang: utterance.lang, 
        rate: utterance.rate, 
        volume: utterance.volume,
        voice: utterance.voice?.name 
      });

      // Optional event handlers
      utterance.onstart = () => {
        console.log('✅ Speech started successfully!');
        isPlayingRef.current = true;
        options.onStart?.();
      };

      utterance.onend = () => {
        console.log('Speech ended');
        isPlayingRef.current = false;
        options.onEnd?.();
      };

      utterance.onerror = (event) => {
        console.error('❌ Erreur de synthèse vocale:', event);
        isPlayingRef.current = false;
        options.onError?.(event);
      };

      utteranceRef.current = utterance;
      
      // Start speaking
      console.log('Calling speechSynthesis.speak()');
      window.speechSynthesis.speak(utterance);
      
      // Check status after a short delay
      setTimeout(() => {
        console.log('Status check - speaking:', window.speechSynthesis.speaking, 'pending:', window.speechSynthesis.pending);
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
