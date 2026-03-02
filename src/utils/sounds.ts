// 8-bit Sound Generator using Web Audio API
const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();

export const play8BitSound = (type: 'shot' | 'hit' | 'spawn' | 'laugh' | 'gameover') => {
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();

    osc.connect(gain);
    gain.connect(audioCtx.destination);

    const now = audioCtx.currentTime;

    switch (type) {
        case 'shot':
            osc.type = 'square';
            osc.frequency.setValueAtTime(880, now);
            osc.frequency.exponentialRampToValueAtTime(110, now + 0.1);
            gain.gain.setValueAtTime(0.3, now);
            gain.gain.exponentialRampToValueAtTime(0.01, now + 0.1);
            osc.start(now);
            osc.stop(now + 0.1);
            break;
        case 'hit':
            osc.type = 'sawtooth';
            osc.frequency.setValueAtTime(220, now);
            osc.frequency.exponentialRampToValueAtTime(880, now + 0.05);
            gain.gain.setValueAtTime(0.3, now);
            gain.gain.exponentialRampToValueAtTime(0.01, now + 0.05);
            osc.start(now);
            osc.stop(now + 0.05);
            break;
        case 'spawn':
            osc.type = 'sine';
            osc.frequency.setValueAtTime(440, now);
            osc.frequency.linearRampToValueAtTime(880, now + 0.1);
            gain.gain.setValueAtTime(0.2, now);
            gain.gain.exponentialRampToValueAtTime(0.01, now + 0.1);
            osc.start(now);
            osc.stop(now + 0.1);
            break;
        case 'laugh':
            // Two short beeps
            osc.type = 'square';
            osc.frequency.setValueAtTime(440, now);
            osc.start(now);
            osc.stop(now + 0.05);

            const osc2 = audioCtx.createOscillator();
            const gain2 = audioCtx.createGain();
            osc2.connect(gain2);
            gain2.connect(audioCtx.destination);
            osc2.type = 'square';
            osc2.frequency.setValueAtTime(554, now + 0.1);
            gain2.gain.setValueAtTime(0.2, now + 0.1);
            gain2.gain.exponentialRampToValueAtTime(0.01, now + 0.15);
            osc2.start(now + 0.1);
            osc2.stop(now + 0.15);
            break;
        case 'gameover':
            osc.type = 'triangle';
            osc.frequency.setValueAtTime(440, now);
            osc.frequency.linearRampToValueAtTime(110, now + 0.5);
            gain.gain.setValueAtTime(0.3, now);
            gain.gain.exponentialRampToValueAtTime(0.01, now + 0.5);
            osc.start(now);
            osc.stop(now + 0.5);
            break;
    }
};

export const SFX = {
    SHOT: 'shot',
    HIT: 'hit',
    SPAWN: 'spawn',
    LAUGH: 'laugh',
    GAME_OVER: 'gameover'
} as const;

export const playSound = (type: keyof typeof SFX | string) => {
    // Check if it's one of our synth sounds
    if (type === 'shot' || type === 'hit' || type === 'spawn' || type === 'laugh' || type === 'gameover') {
        play8BitSound(type);
    } else {
        // Fallback for external URLs if needed
        const audio = new Audio(type);
        audio.volume = 0.3;
        audio.play().catch(() => { });
    }
};
