import React, { useState } from 'react';
import { WalletContextProvider } from './components/WalletContextProvider';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { useWallet } from '@solana/wallet-adapter-react';
import { Menu, Play, Users, User, Trophy, Zap } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import './styles/index.css';

// HUNTER 84 Game UI/Logic types
type GameState = 'start' | 'playing' | 'leaderboard' | 'profile';

import { GameEngine } from './game/GameEngine';
import { useGameStats } from './hooks/useGameStats';

const App = () => {
    const { publicKey } = useWallet();
    const [view, setView] = useState<GameState>('start');
    const { stats, topScores, saveScore, refresh } = useGameStats(publicKey?.toBase58());

    return (
        <div className="game-container">
            {/* HUD / Navigation bar (Always visible but styled) */}
            <div className="ui-layer" style={{ padding: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div className="glass-panel interactive" style={{ padding: '8px 16px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <Zap size={20} color="var(--retro-light)" />
                    <span className="retro-text" style={{ fontSize: '14px' }}>HUNTER 84</span>
                </div>

                <div className="interactive" style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                    {view !== 'start' && (
                        <button className="glass-panel" onClick={() => setView('start')} style={{ padding: '10px' }}>
                            <Menu size={24} color="white" />
                        </button>
                    )}
                    <WalletMultiButton />
                </div>
            </div>

            {/* Main Views */}
            <AnimatePresence mode="wait" onExitComplete={refresh}>
                {view === 'start' && <StartScreen onStart={() => setView('playing')} onViewLeaderboard={() => setView('leaderboard')} onViewProfile={() => setView('profile')} />}
                {view === 'playing' && <GameEngine onGameOver={(s: number, k: number) => { saveScore(s, k); setView('start'); }} />}
                {view === 'leaderboard' && <Leaderboard onBack={() => setView('start')} items={topScores} />}
                {view === 'profile' && <Profile onBack={() => setView('start')} userKey={publicKey?.toBase58()} stats={stats} />}
            </AnimatePresence>

            {/* Retro Sky and Grass Background (CSS/SVG) */}
            <div className="bg-elements" style={{ position: 'absolute', bottom: 0, left: 0, width: '100%', height: '30%', backgroundColor: 'var(--secondary)', borderTop: '4px solid #33691E', zIndex: 1 }}>
                <div style={{ position: 'absolute', top: '-60px', left: '10%', width: '120px', height: '120px', backgroundColor: 'var(--retro-brown)', borderRadius: '10px 10px 0 0', opacity: 0.1 }}></div>
            </div>
        </div>
    );
};

// --- View Components (PLACEHOLDERS) ---

const StartScreen = ({ onStart, onViewLeaderboard, onViewProfile }: any) => (
    <motion.div
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        className="ui-layer interactive" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(8px)' }}
    >
        <div style={{ position: 'absolute', top: '15%', textAlign: 'center' }}>
            <motion.h1
                initial={{ y: -50 }} animate={{ y: 0 }}
                style={{ fontSize: '5rem', textShadow: '8px 8px 0 var(--accent)', marginBottom: '10px', letterSpacing: '4px' }}
            >
                HUNTER 84
            </motion.h1>
            <p style={{ opacity: 0.6, letterSpacing: '4px', fontStyle: 'italic' }}>RETRO SHOOTER . SKILL OVER LUCK . 2026</p>
        </div>

        <div style={{ display: 'flex', gap: '25px', width: '100%', maxWidth: '900px', padding: '20px', flexWrap: 'wrap', justifyContent: 'center' }}>
            <MenuCard icon={<Play size={32} fill="white" />} label="HUNT NOW" color="var(--accent)" onClick={onStart} description="Start a new round" />
            <MenuCard icon={<Trophy size={32} />} label="RANKINGS" color="var(--glass-border)" onClick={onViewLeaderboard} description="Top survivalists" />
            <MenuCard icon={<User size={32} />} label="PROFILE" color="var(--glass-border)" onClick={onViewProfile} description="Stats & Wallet" />
        </div>

        <div style={{ position: 'absolute', bottom: '10%', opacity: 0.3, fontSize: '10px' }} className="retro-text">
            MINTED ON SOLANA | PROTECTED BY HUNTER PROTOCOL
        </div>
    </motion.div>
);

const MenuCard = ({ icon, label, color, onClick, description }: any) => (
    <motion.button
        whileHover={{ scale: 1.05, y: -5 }}
        whileTap={{ scale: 0.95 }}
        onClick={onClick}
        className="glass-panel"
        style={{
            width: '260px', padding: '40px 20px', display: 'flex', flexDirection: 'column',
            alignItems: 'center', gap: '20px', background: color === 'var(--accent)' ? 'var(--accent)' : 'var(--glass)'
        }}
    >
        <div style={{ marginBottom: '10px' }}>{icon}</div>
        <div className="retro-text" style={{ fontSize: '16px' }}>{label}</div>
        <div style={{ fontSize: '12px', opacity: 0.6, textTransform: 'uppercase', letterSpacing: '1px' }}>{description}</div>
    </motion.button>
);

const Leaderboard = ({ onBack, items }: any) => (
    <motion.div initial={{ x: 300, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: -300, opacity: 0 }} className="ui-layer interactive" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '100px 20px' }}>
        <div className="glass-panel" style={{ width: '100%', maxWidth: '600px', padding: '40px', position: 'relative' }}>
            <h2 className="retro-text" style={{ marginBottom: '30px' }}>TOP HUNTERS</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {(items || []).map((item: any, i: number) => (
                    <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '15px', borderBottom: '1px solid var(--glass-border)' }}>
                        <span className="retro-text" style={{ fontSize: '10px', opacity: 0.5 }}>{item.walletAddress.slice(0, 6)}...</span>
                        <span className="retro-text" style={{ fontSize: '12px', color: 'var(--retro-light)' }}>{item.score} PTS</span>
                    </div>
                ))}
                {(!items || items.length === 0) && <p className="retro-text" style={{ fontSize: '10px', opacity: 0.5 }}>No data yet</p>}
            </div>
            <button onClick={onBack} className="retro-text" style={{ position: 'absolute', top: '40px', right: '40px', fontSize: '10px', opacity: 0.5 }}>BACK</button>
        </div>
    </motion.div>
);

const Profile = ({ onBack, userKey, stats }: any) => (
    <motion.div initial={{ y: 300, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 300, opacity: 0 }} className="ui-layer interactive" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '100px 20px' }}>
        <div className="glass-panel" style={{ width: '100%', maxWidth: '600px', padding: '40px', textAlign: 'center' }}>
            <User size={64} style={{ marginBottom: '20px' }} />
            <h2 className="retro-text" style={{ marginBottom: '10px' }}>YOUR STATS</h2>
            <p style={{ fontSize: '12px', opacity: 0.6, marginBottom: '30px', wordBreak: 'break-all' }}>{userKey || 'No Wallet Connected'}</p>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                <div className="glass-panel" style={{ padding: '20px' }}>
                    <div className="retro-text" style={{ fontSize: '10px', marginBottom: '10px' }}>WINS</div>
                    <div className="retro-text" style={{ fontSize: '24px' }}>{stats?.totalWins || 0}</div>
                </div>
                <div className="glass-panel" style={{ padding: '20px' }}>
                    <div className="retro-text" style={{ fontSize: '10px', marginBottom: '10px' }}>KILLS</div>
                    <div className="retro-text" style={{ fontSize: '24px' }}>{stats?.totalKills || 0}</div>
                </div>
                <div className="glass-panel" style={{ padding: '20px', gridColumn: 'span 2' }}>
                    <div className="retro-text" style={{ fontSize: '10px', marginBottom: '10px' }}>HIGH SCORE</div>
                    <div className="retro-text" style={{ fontSize: '24px', color: 'var(--retro-light)' }}>{stats?.highScore || 0}</div>
                </div>
            </div>
            <button onClick={onBack} className="retro-text" style={{ marginTop: '40px', opacity: 0.5 }}>BACK</button>
        </div>
    </motion.div>
);

const Wrapper = () => (
    <WalletContextProvider>
        <App />
    </WalletContextProvider>
);

export default Wrapper;
