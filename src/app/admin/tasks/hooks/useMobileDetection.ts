'use client';

import { useState, useEffect } from 'react';

/**
 * Custom hook to detect mobile devices
 * Returns true if the screen width is below 768px (mobile breakpoint)
 */
export function useMobileDetection() {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkIsMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    // Check on mount
    checkIsMobile();

    // Add event listener for window resize
    window.addEventListener('resize', checkIsMobile);

    // Cleanup
    return () => {
      window.removeEventListener('resize', checkIsMobile);
    };
  }, []);

  return isMobile;
}
