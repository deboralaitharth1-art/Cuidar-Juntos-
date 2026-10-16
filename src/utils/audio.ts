/**
 * Generates a clean, gentle chime tone using Web Audio API
 * No external media files needed - works completely offline!
 */
export function playChimeTone() {
  try {
    const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioContextClass) return;

    const ctx = new AudioContextClass();
    
    // Play two gentle harmonious bells (E5 -> B5)
    const playNote = (freq: number, delay: number, duration: number) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, ctx.currentTime + delay);

      gain.gain.setValueAtTime(0, ctx.currentTime + delay);
      gain.gain.linearRampToValueAtTime(0.25, ctx.currentTime + delay + 0.04);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + delay + duration);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(ctx.currentTime + delay);
      osc.stop(ctx.currentTime + delay + duration);
    };

    playNote(659.25, 0.0, 0.8); // E5
    playNote(987.77, 0.25, 1.2); // B5
    playNote(1318.51, 0.5, 1.5); // E6
  } catch {
    // Audio context may be restricted by autoplay policies until user interaction
  }
}
