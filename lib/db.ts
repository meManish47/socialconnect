import { Pool, PoolClient, QueryResult } from "pg";

declare global {
  // eslint-disable-next-line no-var
  var pgPool: Pool | undefined;
}

function getDatabaseUrl(): string {
  const url = process.env.DATABASE_URL;
  if (!url) {
    throw new Error("DATABASE_URL is not set");
  }
  return url;
}

function getPool(): Pool {
  if (global.pgPool) return global.pgPool;
  const pool = new Pool({
    connectionString: getDatabaseUrl(),
    ssl: process.env.NODE_ENV === "production" ? { rejectUnauthorized: false } : false,
  });
  if (process.env.NODE_ENV !== "production") {
    global.pgPool = pool;
  }
  return pool;
}

export const db = {
  query: (text: string, params?: unknown[]): Promise<QueryResult> => getPool().query(text, params),
  connect: (): Promise<PoolClient> => getPool().connect(),
};
