// Typewriter sound effect using Web Audio API
export class TypewriterSound {
  private audioContext: AudioContext | null = null;

  private initAudioContext() {
    if (!this.audioContext) {
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    return this.audioContext;
  }

  // Play a single "beep" sound like Japanese game typewriter effect
  playBeep() {
    try {
      const ctx = this.initAudioContext();
      if (!ctx) return;

      const now = ctx.currentTime;
      const duration = 0.08; // 80ms beep for better perception

      // Create oscillator for the "beep" sound
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.connect(gain);
      gain.connect(ctx.destination);

      // Short high-pitched beep (like keyboard typing)
      osc.frequency.value = 1000; // 1000 Hz frequency (higher pitch)
      osc.type = 'sine';

      // Envelope: quick attack, quick decay (louder)
      gain.gain.setValueAtTime(0.3, now); // Increased from 0.1 to 0.3
      gain.gain.exponentialRampToValueAtTime(0.05, now + duration); // Increased from 0.01

      osc.start(now);
      osc.stop(now + duration);
    } catch (error) {
      // Silently fail if Web Audio API is not available
      console.debug('Typewriter sound not available');
    }
  }
}

export const typewriterSound = new TypewriterSound();
