import { createConnection } from "mysql2/promise";

async function initDatabase(): Promise<void> {
  try {
    // 首先创建与MySQL的连接（不指定数据库）
    const connection = await createConnection({
      host: "localhost",
      user: "root",
      password: "Sichuan168@", // 替换为你的MySQL密码
    });

    // 创建数据库
    await connection.query("CREATE DATABASE IF NOT EXISTS dailyuse");

    // 切换到新创建的数据库
    await connection.query("USE dailyuse");

    // 创建用户表
    await connection.query(`
      CREATE TABLE users (
    id INT PRIMARY KEY AUTO_INCREMENT,
    username VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    avatar TEXT,
    email TEXT,
    phone TEXT,
    accountType TEXT DEFAULT 'local',
    onlineId TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  )
    `);
    // 添加新列（如果不存在）
    const alterQueries = [
      "ALTER TABLE users ADD COLUMN IF NOT EXISTS avatar TEXT",
      "ALTER TABLE users ADD COLUMN IF NOT EXISTS email TEXT",
      "ALTER TABLE users ADD COLUMN IF NOT EXISTS phone TEXT",
      "ALTER TABLE users ADD COLUMN IF NOT EXISTS accountType TEXT DEFAULT 'local'",
      "ALTER TABLE users ADD COLUMN IF NOT EXISTS onlineId TEXT",
    ];

    for (const query of alterQueries) {
      try {
        await connection.query(query);
      } catch (error) {
        // 如果列已存在，MySQL会抛出错误，我们可以忽略
        console.log(`Column might already exist: ${error.message}`);
      }
    }
    // 创建数据同步表
    await connection.query(`
      CREATE TABLE IF NOT EXISTS user_data (
        id INT PRIMARY KEY AUTO_INCREMENT,
        user_id INT NOT NULL,
        FOREIGN KEY (user_id) REFERENCES users(id),
        file_name VARCHAR(255) NOT NULL CHECK (file_name != ''),
        file_content JSON,
        version INT NOT NULL DEFAULT 1,
        last_modified TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        UNIQUE (user_id, file_name),
        INDEX idx_user_id (user_id),
        INDEX idx_last_modified (last_modified)
      )
    `);
    console.log("Database and tables created successfully!");
    await connection.end();
  } catch (error) {
    console.error(
      "Error initializing database:",
      error instanceof Error ? error.message : error
    );
    process.exit(1);
  }
}

initDatabase();
