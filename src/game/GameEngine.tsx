import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Target, Zap, Heart } from 'lucide-react';

interface Duck {
    id: number;
    x: number;
    y: number;
    targetX: number;
    targetY: number;
    status: 'flying' | 'hit' | 'escaped';
    variant: 'normal' | 'blue' | 'red';
}

interface GameEngineProps {
    onGameOver: (score: number, kills: number) => void;
}

const DUCK_SIZE = 80;
const ROUND_TIME = 10; // seconds

export const GameEngine: React.FC<GameEngineProps> = ({ onGameOver }) => {
    const [score, setScore] = useState(0);
    const [ammo, setAmmo] = useState(3);
    const [ducks, setDucks] = useState<Duck[]>([]);
    const [round, setRound] = useState(1);
    const [timeLeft, setTimeLeft] = useState(ROUND_TIME);
    const [dogAction, setDogAction] = useState<'none' | 'laughing' | 'holding'>('none');

    const [ducksSpawned, setDucksSpawned] = useState(0);
    const MAX_DUCKS = 10;
    const gameRef = useRef<HTMLDivElement>(null);
    const duckIdCounter = useRef(0);

    useEffect(() => {
        if (ducksSpawned >= MAX_DUCKS && ducks.length > 0 && ducks.every(d => d.status !== 'flying')) {
            onGameOver(score, Math.floor(score / 100));
        }
    }, [ducksSpawned, ducks, score, onGameOver]);

    const spawnDuck = () => {
        if (ducksSpawned >= MAX_DUCKS) return;

        setDucksSpawned(prev => prev + 1);
        const newDuck: Duck = {
            id: duckIdCounter.current++,
            x: Math.random() * (window.innerWidth - DUCK_SIZE),
            y: window.innerHeight,
            targetX: Math.random() * (window.innerWidth - DUCK_SIZE),
            targetY: Math.random() * (window.innerHeight * 0.5),
            status: 'flying',
            variant: ['normal', 'blue', 'red'][Math.floor(Math.random() * 3)] as any,
        };
        setDucks(prev => [...prev.filter(d => d.status !== 'escaped'), newDuck]);
        setAmmo(3);
    };

    // Game Loop for spawning
    useEffect(() => {
        const timer = setInterval(() => {
            setTimeLeft(prev => {
                if (prev <= 1) {
                    // End of round logic? For now just spawn next if none
                    return ROUND_TIME;
                }
                return prev - 1;
            });
        }, 1000);

        const spawner = setInterval(() => {
            if (ducks.filter(d => d.status === 'flying').length === 0) {
                spawnDuck();
            }
        }, 2000);

        return () => {
            clearInterval(timer);
            clearInterval(spawner);
        };
    }, [ducks]);

    const handleShoot = (e: React.MouseEvent | React.TouchEvent, duckId?: number) => {
        if (ammo <= 0) return;

        setAmmo(prev => prev - 1);

        if (duckId !== undefined) {
            setDucks(prev => prev.map(d =>
                d.id === duckId ? { ...d, status: 'hit' as const } : d
            ));
            setScore(prev => prev + 100 * round);
            setDogAction('holding');
            setTimeout(() => setDogAction('none'), 1500);
        } else {
            // Punish miss?
        }
    };

    const handleDuckEscape = (id: number) => {
        setDucks(prev => prev.map(d => d.id === id ? { ...d, status: 'escaped' as const } : d));
        setDogAction('laughing');
        setTimeout(() => setDogAction('none'), 1500);
    };

    return (
        <div className="ui-layer interactive" ref={gameRef} onClick={(e) => handleShoot(e)} style={{ cursor: 'crosshair', overflow: 'hidden' }}>

            {/* HUD Overlay */}
            <div style={{ position: 'absolute', bottom: '15%', left: '50%', transform: 'translateX(-50%)', display: 'flex', gap: '40px', zIndex: 20 }}>
                <div className="glass-panel" style={{ padding: '10px 20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span className="retro-text" style={{ fontSize: '10px' }}>SCORE</span>
                    <span className="retro-text" style={{ fontSize: '20px', color: 'var(--retro-light)' }}>{score.toString().padStart(6, '0')}</span>
                </div>
                <div className="glass-panel" style={{ padding: '10px 20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span className="retro-text" style={{ fontSize: '10px' }}>AMMO</span>
                    <div style={{ display: 'flex', gap: '5px' }}>
                        {[1, 2, 3].map(i => (
                            <Zap key={i} size={18} fill={i <= ammo ? 'var(--retro-light)' : 'rgba(255,255,255,0.1)'} color={i <= ammo ? 'var(--retro-light)' : 'transparent'} />
                        ))}
                    </div>
                </div>
            </div>

            {/* Ducks */}
            <AnimatePresence>
                {ducks.map(duck => (
                    duck.status !== 'escaped' && (
                        <motion.div
                            key={duck.id}
                            initial={{ x: duck.x, y: duck.y }}
                            animate={duck.status === 'flying' ? {
                                x: [duck.x, Math.random() * (window.innerWidth - DUCK_SIZE), Math.random() * (window.innerWidth - DUCK_SIZE), window.innerWidth / 2],
                                y: [duck.y, Math.random() * (window.innerHeight * 0.4), -DUCK_SIZE],
                            } : {
                                y: window.innerHeight + DUCK_SIZE,
                                rotate: 180
                            }}
                            transition={duck.status === 'flying' ? {
                                duration: 4 / (round * 0.8),
                                ease: "linear",
                                times: [0, 0.3, 0.6, 1],
                            } : {
                                duration: 0.8,
                                ease: "circIn"
                            }}
                            onAnimationComplete={() => {
                                if (duck.status === 'flying') handleDuckEscape(duck.id);
                            }}
                            style={{
                                position: 'absolute',
                                width: DUCK_SIZE,
                                height: DUCK_SIZE,
                                zIndex: 5,
                                pointerEvents: duck.status === 'flying' ? 'auto' : 'none'
                            }}
                            onClick={(e) => {
                                e.stopPropagation();
                                handleShoot(e, duck.id);
                            }}
                        >
                            <img
                                src="/assets/duck.png"
                                style={{
                                    width: '100%',
                                    height: '100%',
                                    imageRendering: 'pixelated',
                                    transform: duck.status === 'hit' ? 'scaleY(-1)' : 'none',
                                    filter: duck.variant === 'red' ? 'hue-rotate(300deg)' : duck.variant === 'blue' ? 'hue-rotate(200deg)' : 'none'
                                }}
                            />
                        </motion.div>
                    )
                ))}
            </AnimatePresence>

            {/* Dog Animations */}
            <AnimatePresence>
                {dogAction !== 'none' && (
                    <motion.div
                        initial={{ y: 200 }}
                        animate={{ y: -50 }}
                        exit={{ y: 200 }}
                        style={{
                            position: 'absolute',
                            bottom: '30%',
                            left: '50%',
                            translateX: '-50%',
                            zIndex: 5,
                            textAlign: 'center'
                        }}
                    >
                        <div className="retro-text" style={{ marginBottom: '10px', fontSize: '12px' }}>
                            {dogAction === 'laughing' ? 'HEHEHE!' : 'GOT ONE!'}
                        </div>
                        {/* Using a placeholder circle/emoji for Dog since img gen failed */}
                        <div style={{ fontSize: '80px' }}>{dogAction === 'laughing' ? '🙊' : '🐶'}</div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Crosshair (for desktop) */}
            <div style={{ position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', pointerEvents: 'none', opacity: 0.2 }}>
                <Target size={100} color="white" />
            </div>

        </div>
    );
};
