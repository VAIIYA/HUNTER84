export const SFX = {
    SHOT: 'https://cdn.freesound.org/previews/167/167074_211516-lq.mp3', // Laser/Shot
    HIT: 'https://cdn.freesound.org/previews/442/442127_9159316-lq.mp3', // Pop/Hit
    SPAWN: 'https://cdn.freesound.org/previews/341/341235_2339599-lq.mp3', // Whistle/Spawn
    LAUGH: 'https://cdn.freesound.org/previews/456/456440_9333534-lq.mp3', // Laugh
    GAME_OVER: 'https://cdn.freesound.org/previews/173/173859_1639316-lq.mp3' // Sad tune
};

export const playSound = (url: string) => {
    try {
        const audio = new Audio(url);
        audio.volume = 0.4;
        audio.play().catch(e => console.log("Audio play blocked", e));
    } catch (e) {
        console.error("Audio error", e);
    }
};
