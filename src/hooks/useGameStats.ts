import { useEffect, useState } from 'react';
import { db } from '../db/client';
import { players, leaderboard } from '../db/schema';
import { eq, desc } from 'drizzle-orm';

export function useGameStats(walletAddress?: string) {
    const [stats, setStats] = useState<any>(null);
    const [topScores, setTopScores] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);

    const fetchStats = async () => {
        if (!walletAddress || !db) return;
        setLoading(true);
        try {
            const result = await db.select().from(players).where(eq(players.walletAddress, walletAddress)).get();
            setStats(result || { walletAddress, totalKills: 0, totalWins: 0, highScore: 0 });
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    const fetchLeaderboard = async () => {
        if (!db) return;
        try {
            const result = await db.select().from(leaderboard).orderBy(desc(leaderboard.score)).limit(10).all();
            setTopScores(result);
        } catch (e) {
            console.error(e);
        }
    };

    const saveScore = async (score: number, kills: number) => {
        if (!walletAddress || !db) return;
        try {
            // Upsert player stats
            const existing = await db.select().from(players).where(eq(players.walletAddress, walletAddress)).get();
            if (!existing) {
                await db.insert(players).values({
                    walletAddress,
                    totalKills: kills,
                    totalWins: score > 500 ? 1 : 0,
                    highScore: score,
                }).run();
            } else {
                await db.update(players).set({
                    totalKills: (existing.totalKills || 0) + kills,
                    totalWins: (existing.totalWins || 0) + (score > 500 ? 1 : 0),
                    highScore: Math.max(existing.highScore || 0, score),
                }).where(eq(players.walletAddress, walletAddress)).run();
            }

            // Add to leaderboard history if high enough
            await db.insert(leaderboard).values({
                walletAddress,
                score,
            }).run();

            await fetchStats();
            await fetchLeaderboard();
        } catch (e) {
            console.error(e);
        }
    };

    useEffect(() => {
        fetchLeaderboard();
    }, []);

    useEffect(() => {
        if (walletAddress) fetchStats();
    }, [walletAddress]);

    return { stats, topScores, loading, saveScore, refresh: () => { fetchStats(); fetchLeaderboard(); } };
}
