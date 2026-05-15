import minimist from 'minimist';
import { initDb, getPool } from './db';

const argv = minimist(process.argv.slice(2));

const dbConfig = {
  host: argv['db-host'] || '127.0.0.1',
  port: Number(argv['db-port']) || 3306,
  database: argv['db-name'] || 'taskdb',
  user: argv['db-user'] || 'mywebapp',
  password: argv['db-password'] || '',
};

async function migrate(): Promise<void> {
  console.log('==> Starting database migration queries...');
  initDb(dbConfig);
  const pool = getPool();
  let conn;
  try {
    conn = await pool.getConnection();

    await conn.query(`
      CREATE TABLE IF NOT EXISTS tasks (
                                         id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
                                         title VARCHAR(255) NOT NULL,
        status ENUM('pending', 'done') NOT NULL DEFAULT 'pending',
        created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
        )
    `);

    await conn.query(`
      CREATE INDEX IF NOT EXISTS idx_tasks_status ON tasks (status)
    `);

    console.log('==> SQL queries executed successfully');
  } catch (err) {
    console.error('Migration database logic failed:', err);
    process.exit(1);
  } finally {
    if (conn) conn.release();
    await pool.end();
  }
}
migrate()
    .then(() => {
      console.log('Migration completed successfully. Exiting.');
      process.exit(0);
    })
    .catch((err) => {
      console.error('Fatal top-level migration error:', err);
      process.exit(1);
    });