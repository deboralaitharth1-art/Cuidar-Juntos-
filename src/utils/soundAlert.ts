/**
 * Sound Alert and Notification Utility for Cuidar Juntos
 * Uses Web Audio API to synthesize pleasing medical reminder chimes offline.
 */

let audioCtx: AudioContext | null = null;

function getAudioContext(): AudioContext | null {
  try {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextClass) return null;
    if (!audioCtx) {
      audioCtx = new AudioContextClass();
    }
    if (audioCtx.state === 'suspended') {
      audioCtx.resume();
    }
    return audioCtx;
  } catch (e) {
    console.warn('Web Audio API not accessible:', e);
    return null;
  }
}

/**
 * Play gentle, hospital-grade ascending chime for medication reminders
 */
export function playMedicationChime(): void {
  const ctx = getAudioContext();
  if (!ctx) return;

  try {
    const now = ctx.currentTime;
    // Pleasant melodic chime chords: E5 (659.25), G#5 (830.61), B5 (987.77), E6 (1318.51)
    const notes = [
      { freq: 659.25, time: now + 0.00, dur: 0.4 },
      { freq: 830.61, time: now + 0.15, dur: 0.4 },
      { freq: 987.77, time: now + 0.30, dur: 0.5 },
      { freq: 1318.51, time: now + 0.45, dur: 0.8 },
    ];

    notes.forEach(({ freq, time, dur }) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, time);

      // Smooth attack and soft exponential decay
      gain.gain.setValueAtTime(0.0001, time);
      gain.gain.exponentialRampToValueAtTime(0.28, time + 0.04);
      gain.gain.exponentialRampToValueAtTime(0.0001, time + dur);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(time);
      osc.stop(time + dur);
    });

    // Optional phone vibration
    if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
      try {
        navigator.vibrate([150, 80, 150]);
      } catch {}
    }
  } catch (err) {
    console.warn('Could not play chime:', err);
  }
}

/**
 * Request browser desktop/mobile notifications
 */
export async function requestNotificationPermission(): Promise<boolean> {
  if (typeof window === 'undefined' || !('Notification' in window)) {
    return false;
  }
  if (Notification.permission === 'granted') {
    return true;
  }
  if (Notification.permission !== 'denied') {
    const res = await Notification.requestPermission();
    return res === 'granted';
  }
  return false;
}

/**
 * Trigger local browser notification if permitted
 */
export function sendLocalNotification(title: string, body: string): void {
  if (typeof window === 'undefined' || !('Notification' in window)) return;
  if (Notification.permission === 'granted') {
    try {
      new Notification(title, {
        body,
        icon: '/src/assets/images/app_logo_1792159235320.jpg',
        badge: '/src/assets/images/app_logo_1792159235320.jpg'
      });
    } catch (e) {
      console.warn('Notification trigger error:', e);
    }
  }
}
