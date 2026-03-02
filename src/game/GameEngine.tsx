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

const DUCK_SIZE = 120; // Bigger ducks
const MAX_DUCKS = 10;
const TICK_RATE = 16;

export const GameEngine: React.FC<GameEngineProps> = ({ onGameOver }) => {
    const [score, setScore] = useState(0);
    const [ammo, setAmmo] = useState(3);
    const [ducks, setDucks] = useState<Duck[]>([]);
    const [ducksSpawned, setDucksSpawned] = useState(0);
    const [dogAction, setDogAction] = useState<'none' | 'laughing' | 'holding'>('none');

    const duckIdCounter = useRef(0);
    const isSpawningRef = useRef(false);

    // Spawn Logic
    const spawnDuck = useCallback(() => {
        console.log("SPAWN DUCK RUNNING", { ducksSpawned });
        if (ducksSpawned >= MAX_DUCKS) return;

        const w = window.innerWidth || 1200;
        const h = window.innerHeight || 800;

        const speed = 4 + (ducksSpawned * 0.5);
        const angle = (Math.random() * Math.PI / 4) + Math.PI / 4;

        const newDuck: Duck = {
            id: duckIdCounter.current++,
            x: Math.random() * (w - DUCK_SIZE),
            y: h - 250,
            vx: Math.cos(angle) * speed * (Math.random() > 0.5 ? 1 : -1),
            vy: -Math.sin(angle) * speed,
            status: 'flying',
            variant: ['normal', 'blue', 'red'][Math.floor(Math.random() * 3)] as any,
            frame: 0
        };

        setDucks(prev => [...prev, newDuck]);
        setDucksSpawned(prev => prev + 1);
        setAmmo(3);
        isSpawningRef.current = false;
        console.log("DUCK ADDED TO STATE", newDuck);
    }, [ducksSpawned]);

    // Spawner Control
    useEffect(() => {
        const flying = ducks.filter(d => d.status === 'flying').length;
        if (ducksSpawned < MAX_DUCKS && flying === 0 && !isSpawningRef.current) {
            isSpawningRef.current = true;
            console.log("SCHEDULING SPAWN");
            const timer = setTimeout(spawnDuck, 800);
            return () => clearTimeout(timer);
        }
    }, [ducks.length, ducksSpawned, spawnDuck]);

    // Physics
    useEffect(() => {
        const timer = setInterval(() => {
            setDucks(prev => prev.map(d => {
                if (d.status !== 'flying') {
                    if (d.status === 'hit' && d.y < window.innerHeight + 100) {
                        return { ...d, y: d.y + 15 };
                    }
                    return d;
                }

                let nx = d.x + d.vx;
                let ny = d.y + d.vy;
                let nvx = d.vx;
                let nvy = d.vy;

                if (nx <= 0 || nx >= window.innerWidth - DUCK_SIZE) nvx = -nvx;
                if (ny <= 0) nvy = -nvy;
                if (ny > window.innerHeight && d.vy > 0) nvy = -nvy;

                return {
                    ...d,
                    x: nx,
                    y: ny,
                    vx: nvx,
                    vy: nvy,
                    frame: (d.frame + 0.2) % 2
                };
            }));
        }, TICK_RATE);
        return () => clearInterval(timer);
    }, []);

    // Win check
    useEffect(() => {
        if (ducksSpawned >= MAX_DUCKS && ducks.length > 0) {
            if (ducks.every(d => d.status !== 'flying' && d.y > window.innerHeight)) {
                onGameOver(score, Math.floor(score / 100));
            }
        }
    }, [ducks, ducksSpawned, onGameOver, score]);

    const handleShoot = (e: React.MouseEvent | React.TouchEvent, duckId?: number) => {
        if (ammo <= 0) return;
        setAmmo(prev => prev - 1);
        if (duckId !== undefined) {
            setDucks(prev => prev.map(d => d.id === duckId ? { ...d, status: 'hit', vx: 0, vy: 0 } : d));
            setScore(prev => prev + 100);
            setDogAction('holding');
            setTimeout(() => setDogAction('none'), 1200);
        }
    };

    return (
        <div className="ui-layer interactive" onClick={(e) => handleShoot(e)} style={{ cursor: 'crosshair', pointerEvents: 'auto', zIndex: 100 }}>
            <GameBackground />

            {/* HUD */}
            <div style={{ position: 'absolute', bottom: '5%', left: '50%', transform: 'translateX(-50%)', display: 'flex', gap: '40px', zIndex: 200 }}>
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

            {/* Ducks Layer */}
            <div className="ducks-layer" style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none', zIndex: 150 }}>
                {ducks.map(duck => (
                    <div
                        key={duck.id}
                        style={{
                            position: 'absolute',
                            left: duck.x,
                            top: duck.y,
                            width: DUCK_SIZE,
                            height: DUCK_SIZE,
                            transform: `scaleX(${duck.vx > 0 ? 1 : -1})`,
                            transition: duck.status === 'hit' ? 'none' : 'transform 0.05s linear',
                            pointerEvents: duck.status === 'flying' ? 'auto' : 'none'
                        }}
                        onClick={(e) => { e.stopPropagation(); handleShoot(e, duck.id); }}
                    >
                        <img
                            src={Math.floor(duck.frame) === 0 ? '/assets/duck_up.png' : '/assets/duck_down.png'}
                            alt="DUCK"
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
            </div>

            {/* Dog Layer */}
            <AnimatePresence>
                {dogAction !== 'none' && (
                    <motion.div
                        initial={{ y: 200 }} animate={{ y: -60 }} exit={{ y: 200 }}
                        style={{ position: 'absolute', bottom: '30%', left: '50%', transform: 'translateX(-50%)', zIndex: 110, textAlign: 'center' }}
                    >
                        <div style={{ fontSize: '100px', filter: 'drop-shadow(0 0 10px rgba(0,0,0,0.5))' }}>
                            {dogAction === 'laughing' ? '😂' : '🐕'}
                        </div>
                        <div className="retro-text" style={{ background: 'black', padding: '10px 20px', borderRadius: '5px' }}>
                            {dogAction === 'laughing' ? 'HA HA!' : 'GOT IT!'}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            <div style={{ position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', pointerEvents: 'none', opacity: 0.2 }}>
                <Target size={120} color="white" />
            </div>
        </div>
    );
};
