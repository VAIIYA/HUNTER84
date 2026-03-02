import { createClient } from '@libsql/client';
import { drizzle } from 'drizzle-orm/libsql';

const url = import.meta.env.VITE_TURSO_DATABASE_URL;
const authToken = import.meta.env.VITE_TURSO_AUTH_TOKEN;

// Validation: Only create client if URL is present. 
// auth is optional for local/dev but usually needed for Turso.
export const client = url
    ? createClient({ url, authToken })
    : null;

export const db = client ? drizzle(client) : null;
