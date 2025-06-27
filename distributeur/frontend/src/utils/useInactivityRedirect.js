import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';

// Usage: useInactivityRedirect(() => setShowWarning(true));
export default function useInactivityRedirect(onWarn, warnDelay = 2 * 60 * 1000, redirectDelay = 3 * 60 * 1000) {
  const navigate = useNavigate();
  const warnTimeout = useRef();
  const redirectTimeout = useRef();

  useEffect(() => {
    const resetTimers = () => {
      if (warnTimeout.current) clearTimeout(warnTimeout.current);
      if (redirectTimeout.current) clearTimeout(redirectTimeout.current);
      warnTimeout.current = setTimeout(() => {
        onWarn();
        redirectTimeout.current = setTimeout(() => {
          navigate('/');
        }, redirectDelay - warnDelay);
      }, warnDelay);
    };

    // List of events that indicate user activity
    const events = ['mousemove', 'mousedown', 'keydown', 'touchstart', 'scroll'];
    events.forEach(event => window.addEventListener(event, resetTimers));
    resetTimers();

    return () => {
      if (warnTimeout.current) clearTimeout(warnTimeout.current);
      if (redirectTimeout.current) clearTimeout(redirectTimeout.current);
      events.forEach(event => window.removeEventListener(event, resetTimers));
    };
  }, [onWarn, warnDelay, redirectDelay, navigate]);
} 