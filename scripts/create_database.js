// 该脚本用于创建数据库和表
const mysql = require('mysql2/promise');

async function initDatabase() {
  try {
    // 首先创建与MySQL的连接（不指定数据库）
    const connection = await mysql.createConnection({
      host: 'localhost',
      user: 'root',
      password: 'Sichuan168@'  // 替换为你的MySQL密码
    });

    // 创建数据库
    await connection.query('CREATE DATABASE IF NOT EXISTS dailyuse');
    
    // 切换到新创建的数据库
    await connection.query('USE dailyuse');
    
    // 创建用户表
    await connection.query(`
      CREATE TABLE IF NOT EXISTS users (
        id INT PRIMARY KEY AUTO_INCREMENT,
        username VARCHAR(255) NOT NULL UNIQUE,
        password VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    console.log('Database and tables created successfully!');
    await connection.end();
  } catch (error) {
    console.error('Error initializing database:', error);
    process.exit(1);
  }
}

initDatabase();