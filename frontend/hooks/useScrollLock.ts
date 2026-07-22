import { useEffect, useState } from 'react';

export function useScrollLock() {
  const [isLocked, setIsLocked] = useState(false);

  const lock = () => {
    document.body.style.overflow = 'hidden';
    setIsLocked(true);
  };

  const unlock = () => {
    document.body.style.overflow = '';
    setIsLocked(false);
  };

  useEffect(() => {
    return () => {
      document.body.style.overflow = '';
    };
  }, []);

  return { isLocked, lock, unlock };
}
