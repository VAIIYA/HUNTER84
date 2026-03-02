import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Target, Zap } from 'lucide-react';
import { GameBackground } from './GameBackground';

interface Duck {
    id: number;
    x: number;
    y: number;
    vx: number;
    vy: number;
    status: 'flying' | 'hit' | 'escaped';
    variant: 'normal' | 'blue' | 'red';
    frame: number;
}

interface GameEngineProps {
    onGameOver: (score: number, kills: number) => void;
}

const DUCK_SIZE = 80;
const MAX_DUCKS = 10;
const TICK_RATE = 16; // ~60fps

export const GameEngine: React.FC<GameEngineProps> = ({ onGameOver }) => {
    const [score, setScore] = useState(0);
    const [ammo, setAmmo] = useState(3);
    const [ducks, setDucks] = useState<Duck[]>([]);
    const [ducksSpawned, setDucksSpawned] = useState(0);
    const [dogAction, setDogAction] = useState<'none' | 'laughing' | 'holding'>('none');

    const gameRef = useRef<HTMLDivElement>(null);
    const duckIdCounter = useRef(0);
    const lastTick = useRef(Date.now());

    // Spawn Logic
    const spawnDuck = useCallback(() => {
        if (ducksSpawned >= MAX_DUCKS) return;

        setDucksSpawned(prev => prev + 1);
        const speed = 3 + (ducksSpawned * 0.2);
        const angle = (Math.random() * Math.PI / 2) + Math.PI / 4; // Upward-ish

        const newDuck: Duck = {
            id: duckIdCounter.current++,
            x: Math.random() * (window.innerWidth - DUCK_SIZE),
            y: window.innerHeight - 150,
            vx: Math.cos(angle) * speed * (Math.random() > 0.5 ? 1 : -1),
            vy: -Math.sin(angle) * speed,
            status: 'flying',
            variant: ['normal', 'blue', 'red'][Math.floor(Math.random() * 3)] as any,
            frame: 0
        };
        setDucks(prev => [...prev, newDuck]);
        setAmmo(3);
    }, [ducksSpawned]);

    // Main Physics Loop
    useEffect(() => {
        const interval = setInterval(() => {
            setDucks(currentDucks => {
                return currentDucks.map(duck => {
                    if (duck.status !== 'flying') {
                        if (duck.status === 'hit') {
                            return { ...duck, y: duck.y + 10, frame: 2 }; // Falling
                        }
                        return duck;
                    }

                    let nextX = duck.x + duck.vx;
                    let nextY = duck.y + duck.vy;
                    let nextVx = duck.vx;
                    let nextVy = duck.vy;

                    // Bounce off walls (DVD Style)
                    if (nextX <= 0 || nextX >= window.innerWidth - DUCK_SIZE) {
                        nextVx = -nextVx;
                        nextX = duck.x + nextVx;
                    }
                    if (nextY <= 0) {
                        nextVy = -nextVy;
                        nextY = duck.y + nextVy;
                    }

                    // Escape logic (if it goes below some point after some time, or just stays too long)
                    if (nextY > window.innerHeight && duck.vy > 0) {
                        // Let's not escape via bottom automatically unless it's a "miss"
                    }

                    return {
                        ...duck,
                        x: nextX,
                        y: nextY,
                        vx: nextVx,
                        vy: nextVy,
                        frame: (duck.frame + 0.1) % 2 // Animation toggle
                    };
                });
            });
        }, TICK_RATE);

        return () => clearInterval(interval);
    }, []);

    // Spawner and Win Check
    useEffect(() => {
        if (ducksSpawned < MAX_DUCKS && ducks.filter(d => d.status === 'flying').length === 0) {
            const timeout = setTimeout(spawnDuck, 1000);
            return () => clearTimeout(timeout);
        }

        if (ducksSpawned >= MAX_DUCKS && ducks.length > 0 && ducks.every(d => d.status !== 'flying' && d.y > window.innerHeight)) {
            onGameOver(score, Math.floor(score / 100));
        }
    }, [ducks, ducksSpawned, spawnDuck, onGameOver, score]);

    const handleShoot = (e: React.MouseEvent | React.TouchEvent, duckId?: number) => {
        if (ammo <= 0) return;
        setAmmo(prev => prev - 1);

        if (duckId !== undefined) {
            setDucks(prev => prev.map(d =>
                d.id === duckId ? { ...d, status: 'hit' as const, vx: 0, vy: 0 } : d
            ));
            setScore(prev => prev + 100);
            setDogAction('holding');
            setTimeout(() => setDogAction('none'), 1500);
        }
    };

    return (
        <div className="game-container" ref={gameRef} onClick={(e) => handleShoot(e)} style={{ cursor: 'crosshair' }}>
            <GameBackground />

            <div className="ui-layer interactive">
                {/* HUD */}
                <div style={{ position: 'absolute', bottom: '5%', left: '50%', transform: 'translateX(-50%)', display: 'flex', gap: '40px', zIndex: 20 }}>
                    <div className="glass-panel" style={{ padding: '15px 30px', display: 'flex', alignItems: 'center', gap: '15px', border: '2px solid var(--retro-light)' }}>
                        <span className="retro-text" style={{ fontSize: '12px' }}>SCORE</span>
                        <span className="retro-text" style={{ fontSize: '24px', color: 'var(--retro-light)' }}>{score.toString().padStart(6, '0')}</span>
                    </div>
                    <div className="glass-panel" style={{ padding: '15px 30px', display: 'flex', alignItems: 'center', gap: '15px' }}>
                        <span className="retro-text" style={{ fontSize: '12px' }}>SHOTS</span>
                        <div style={{ display: 'flex', gap: '8px' }}>
                            {[1, 2, 3].map(i => (
                                <Zap key={i} size={24} fill={i <= ammo ? 'var(--retro-light)' : 'rgba(255,255,255,0.1)'} color={i <= ammo ? 'var(--retro-light)' : 'transparent'} />
                            ))}
                        </div>
                    </div>
                </div>

                {/* Ducks */}
                {ducks.map(duck => (
                    <div
                        key={duck.id}
                        style={{
                            position: 'absolute',
                            left: duck.x,
                            top: duck.y,
                            width: DUCK_SIZE,
                            height: DUCK_SIZE,
                            zIndex: 10,
                            transform: `scaleX(${duck.vx > 0 ? 1 : -1})`, // Flip based on direction
                            transition: duck.status === 'hit' ? 'none' : 'transform 0.1s linear',
                            pointerEvents: duck.status === 'flying' ? 'auto' : 'none'
                        }}
                        onClick={(e) => { e.stopPropagation(); handleShoot(e, duck.id); }}
                    >
                        <img
                            src={duck.status === 'hit' ? '/assets/duck_up.png' : (Math.floor(duck.frame) === 0 ? '/assets/duck_up.png' : '/assets/duck_down.png')}
                            style={{
                                width: '100%',
                                height: '100%',
                                imageRendering: 'pixelated',
                                filter: duck.variant === 'red' ? 'hue-rotate(300deg)' : duck.variant === 'blue' ? 'hue-rotate(200deg)' : 'none',
                                transform: duck.status === 'hit' ? 'scaleY(-1) rotate(180deg)' : 'none'
                            }}
                        />
                    </div>
                ))}

                {/* Dog Action */}
                <AnimatePresence>
                    {dogAction !== 'none' && (
                        <motion.div
                            initial={{ y: 200 }} animate={{ y: -60 }} exit={{ y: 200 }}
                            style={{ position: 'absolute', bottom: '30%', left: '50%', x: '-50%', zIndex: 15, textAlign: 'center' }}
                        >
                            <div style={{ fontSize: '100px', filter: 'drop-shadow(0 0 10px rgba(0,0,0,0.5))' }}>
                                {dogAction === 'laughing' ? '😂' : '🐕'}
                            </div>
                            <div className="retro-text" style={{ background: 'black', padding: '5px 10px', borderRadius: '5px' }}>
                                {dogAction === 'laughing' ? 'HA HA!' : 'GOT IT!'}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            <div style={{ position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', pointerEvents: 'none', opacity: 0.1 }}>
                <Target size={120} color="white" />
            </div>
        </div>
    );
};
