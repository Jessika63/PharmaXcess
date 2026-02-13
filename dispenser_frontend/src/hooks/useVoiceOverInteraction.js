import React from 'react';
import { useVoiceOver } from '../hooks/useVoiceOver';

/**
 * Personnalized handlers for VoiceOver interaction on focus and mouse enter.
 * Usage in a component:
 * const buttonHandlers = useVoiceOverInteraction("Text to read");
 * <button {...buttonHandlers}>My button</button>
 */
export const useVoiceOverInteraction = (text) => {
  const { speak } = useVoiceOver();

  return {
    onFocus: () => {
      if (text) speak(text);
    },
    onMouseEnter: () => {
      if (text) speak(text);
    }
  };
};

export default useVoiceOverInteraction;
