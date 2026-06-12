'use client';

import { useState, useEffect } from 'react';

export type DeviceType = 'mobile' | 'desktop';

export function useDeviceType(): DeviceType {
  const [deviceType, setDeviceType] = useState<DeviceType>('desktop');

  useEffect(() => {
    function checkDevice() {
      if (typeof window !== 'undefined') {
        setDeviceType(window.innerWidth <= 1024 ? 'mobile' : 'desktop');
      }
    }

    checkDevice();

    window.addEventListener('resize', checkDevice);
    return () => window.removeEventListener('resize', checkDevice);
  }, []);

  return deviceType;
}
