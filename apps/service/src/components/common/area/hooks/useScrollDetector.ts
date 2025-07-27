import { useEffect, useState } from 'react';

export default function useScrollDetector() {
  const [isScrolling, setIsScrolling] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    let scrollTimeout: NodeJS.Timeout;

    const handleScroll = () => {
      if (!isScrolling) {
        setIsScrolling(true);
      }

      if (scrollTimeout) {
        clearTimeout(scrollTimeout);
      }

      scrollTimeout = setTimeout(() => {
        setIsScrolling(false);
      }, 700);
    };

    window.addEventListener('scroll', handleScroll);

    return () => {
      window.removeEventListener('scroll', handleScroll);
      if (scrollTimeout) {
        clearTimeout(scrollTimeout);
      }
    };
  }, [isScrolling]);

  return isScrolling;
}
