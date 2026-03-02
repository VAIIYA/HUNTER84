import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';

export const players = sqliteTable('players', {
    walletAddress: text('wallet_address').primaryKey(),
    username: text('username'),
    totalKills: integer('total_kills').default(0),
    totalWins: integer('total_wins').default(0),
    highScore: integer('high_score').default(0),
    lastPlayedAt: integer('last_played_at', { mode: 'timestamp' }),
});

export const leaderboard = sqliteTable('leaderboard', {
    id: integer('id').primaryKey({ autoIncrement: true }),
    walletAddress: text('wallet_address').notNull(),
    score: integer('score').notNull(),
    createdAt: integer('created_at', { mode: 'timestamp' }).$defaultFn(() => new Date()),
});
