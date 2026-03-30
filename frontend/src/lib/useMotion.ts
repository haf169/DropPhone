// =============================================
// Motion Hook — Capacitor Motion API
// Phát hiện rơi tự do và va đập
// =============================================
'use client';

import { useEffect, useRef, useCallback } from 'react';

export interface MotionOptions {
  onFreeFall: (force: number) => void;
  onImpact: (force: number) => void;
  sensitivity: number; // 1=low, 2=medium, 3=high
  enabled: boolean;
  freeFallEnabled: boolean;
  impactEnabled: boolean;
}

// Ngưỡng phát hiện (có thể điều chỉnh theo sensitivity)
const THRESHOLDS = {
  freeFall: [1.2, 0.7, 0.3],   // G-force ÍT = rơi tự do  [low, med, high]
  impact:   [4.0, 3.0, 2.0],   // G-force LỚN = va đập
};

export function useMotion(options: MotionOptions) {
  const {
    onFreeFall, onImpact, sensitivity, enabled,
    freeFallEnabled, impactEnabled,
  } = options;

  const lastAccel = useRef({ x: 0, y: 0, z: 0 });
  const cooldown = useRef(false);
  const listenerRef = useRef<(() => void) | null>(null);

  const handleAccel = useCallback((event: DeviceMotionEvent) => {
    if (!enabled || cooldown.current) return;
    const accel = event.accelerationIncludingGravity;
    if (!accel || accel.x == null) return;

    const x = accel.x ?? 0;
    const y = accel.y ?? 0;
    const z = accel.z ?? 0;

    // G-force magnitude
    const gForce = Math.sqrt(x * x + y * y + z * z) / 9.81;

    const idx = sensitivity - 1; // 0,1,2
    const fallThreshold = THRESHOLDS.freeFall[idx];
    const impactThreshold = THRESHOLDS.impact[idx];

    if (freeFallEnabled && gForce < fallThreshold) {
      cooldown.current = true;
      onFreeFall(gForce);
      setTimeout(() => { cooldown.current = false; }, 2000);
    } else if (impactEnabled && gForce > impactThreshold) {
      // Kiểm tra delta so với frame trước để tránh false positive
      const dx = Math.abs(x - lastAccel.current.x);
      const dy = Math.abs(y - lastAccel.current.y);
      const dz = Math.abs(z - lastAccel.current.z);
      if (dx + dy + dz > 5) {
        cooldown.current = true;
        onImpact(gForce);
        setTimeout(() => { cooldown.current = false; }, 2000);
      }
    }

    lastAccel.current = { x, y, z };
  }, [enabled, freeFallEnabled, impactEnabled, sensitivity, onFreeFall, onImpact]);

  useEffect(() => {
    if (!enabled) return;

    // Request permission (iOS 13+)
    const requestAndListen = async () => {
      try {
        // @ts-ignore — DeviceMotionEvent.requestPermission trên iOS
        if (typeof DeviceMotionEvent?.requestPermission === 'function') {
          const perm = await (DeviceMotionEvent as any).requestPermission();
          if (perm !== 'granted') return;
        }
        window.addEventListener('devicemotion', handleAccel);
        listenerRef.current = () => window.removeEventListener('devicemotion', handleAccel);
      } catch (err) {
        console.warn('Motion API not available:', err);
      }
    };

    requestAndListen();
    return () => { listenerRef.current?.(); };
  }, [enabled, handleAccel]);
}

// Yêu cầu permission iOS
export async function requestMotionPermission(): Promise<boolean> {
  try {
    // @ts-ignore
    if (typeof DeviceMotionEvent?.requestPermission === 'function') {
      const result = await (DeviceMotionEvent as any).requestPermission();
      return result === 'granted';
    }
    return true; // Android / Desktop không cần permission
  } catch {
    return false;
  }
}
