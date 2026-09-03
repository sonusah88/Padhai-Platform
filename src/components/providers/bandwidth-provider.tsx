'use client';

import { createContext, useContext, useState, useCallback, type ReactNode } from 'react';

interface BandwidthContextType {
  dataSaver: boolean;
  toggleDataSaver: () => void;
  imageQuality: number;
  videoQuality: '144p' | '240p' | '360p' | '480p' | '720p' | 'auto';
  setVideoQuality: (quality: '144p' | '240p' | '360p' | '480p' | '720p' | 'auto') => void;
}

const BandwidthContext = createContext<BandwidthContextType>({
  dataSaver: false,
  toggleDataSaver: () => {},
  imageQuality: 85,
  videoQuality: 'auto',
  setVideoQuality: () => {},
});

export function BandwidthProvider({ children }: { children: ReactNode }) {
  const [dataSaver, setDataSaver] = useState(false);
  const [videoQuality, setVideoQuality] = useState<BandwidthContextType['videoQuality']>('auto');

  const toggleDataSaver = useCallback(() => {
    setDataSaver(prev => {
      const next = !prev;
      // Toggle the data-saver class on <html> for CSS-based optimizations
      if (typeof document !== 'undefined') {
        document.documentElement.classList.toggle('data-saver', next);
      }
      if (next) {
        setVideoQuality('360p');
      } else {
        setVideoQuality('auto');
      }
      return next;
    });
  }, []);

  const imageQuality = dataSaver ? 40 : 85;

  return (
    <BandwidthContext.Provider
      value={{ dataSaver, toggleDataSaver, imageQuality, videoQuality, setVideoQuality }}
    >
      {children}
    </BandwidthContext.Provider>
  );
}

export function useBandwidth() {
  return useContext(BandwidthContext);
}
