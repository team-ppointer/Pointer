import { useEffect, useState } from 'react';

export default function useTouchDetector() {
  const [isTouching, setIsTouching] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    const handleTouchStart = () => setIsTouching(true);
    const handleTouchEnd = () => setIsTouching(false);

    window.addEventListener('touchstart', handleTouchStart);
    window.addEventListener('touchend', handleTouchEnd);

    return () => {
      window.removeEventListener('touchstart', handleTouchStart);
      window.removeEventListener('touchend', handleTouchEnd);
    };
  }, []);

  return isTouching;
}
