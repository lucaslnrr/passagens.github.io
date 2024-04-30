import { useEffect } from 'react';
import { signOut } from './utils/firebase';
// Adjust the value of MILLISECONDS_PER_MINUTE to set the desired inactivity duration
const MILLISECONDS_PER_MINUTE = 1000 * 60;
const INACTIVITY_DURATION = 10 * MILLISECONDS_PER_MINUTE;

export function useSessionTimeout() {
  useEffect(() => {
     let lastActivityTimestamp = Date.now();
     let sessionTimeoutId;
 
     function handleInactivity() {
       const currentTimestamp = Date.now();
       const timeSinceLastActivity = currentTimestamp - lastActivityTimestamp;
 
       if (timeSinceLastActivity >= INACTIVITY_DURATION) {
         signOut(); // Call your signOut function here
       } else {
         lastActivityTimestamp = currentTimestamp;
         sessionTimeoutId = setTimeout(handleInactivity, INACTIVITY_DURATION - timeSinceLastActivity);
       }
     }
 
     const events = ['mousedown', 'mousemove', 'keydown', 'scroll'];
     events.forEach(event => document.addEventListener(event, handleInactivity));
 
     // Start the session timeout timer
     handleInactivity();
 
     return () => {
       events.forEach(event => document.removeEventListener(event, handleInactivity));
       clearTimeout(sessionTimeoutId);
     };
  }, []);
 }