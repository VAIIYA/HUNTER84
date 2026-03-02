import { createClient } from '@libsql/client';
import { drizzle } from 'drizzle-orm/libsql';

const url = import.meta.env.VITE_TURSO_DATABASE_URL;
const authToken = import.meta.env.VITE_TURSO_AUTH_TOKEN;

export const client = createClient({
    url: url || 'file:local.db',
    authToken: authToken,
});

export const db = drizzle(client);
