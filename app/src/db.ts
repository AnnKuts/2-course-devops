import mariadb from 'mariadb';

export interface DbConfig {
  host: string;
  port: number;
  database: string;
  user: string;
  password: string;
}

let pool: mariadb.Pool | null = null;

export function initDb(config: DbConfig): void {
  pool = mariadb.createPool({
    host: config.host,
    port: config.port,
    database: config.database,
    user: config.user,
    password: config.password,
    connectionLimit: 5,
  });
}

export function getPool(): mariadb.Pool {
  if (!pool) {
    throw new Error('Database pool is not initialized');
  }
  return pool;
}

export async function checkDbConnection(): Promise<boolean> {
  let conn: mariadb.PoolConnection | undefined;
  try {
    conn = await getPool().getConnection();
    return true;
  } catch {
    return false;
  } finally {
    if (conn) conn.release();
  }
}
