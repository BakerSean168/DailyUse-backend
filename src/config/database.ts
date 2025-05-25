import { createPool, Pool } from 'mysql2/promise'

export const pool: Pool = createPool({
  host: 'localhost',
  user: 'root',
  password: 'Sichuan168@',  // 替换为你的MySQL密码
  database: 'dailyuse',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
})
