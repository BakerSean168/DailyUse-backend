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
      CREATE TABLE IF NOT EXISTS users (
        -- 基础信息
        id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
        username VARCHAR(50) NOT NULL UNIQUE COMMENT '用户名',
        email VARCHAR(255) UNIQUE COMMENT '邮箱',
        phone VARCHAR(20) UNIQUE COMMENT '手机号',
        password VARCHAR(255) NOT NULL COMMENT '密码哈希',
        
        -- 个人信息
        first_name VARCHAR(50) COMMENT '名',
        last_name VARCHAR(50) COMMENT '姓',
        display_name VARCHAR(100) COMMENT '显示名称',
        avatar VARCHAR(500) COMMENT '头像URL',
        bio TEXT COMMENT '个人简介',
        
        -- 账户状态
        status ENUM('active', 'inactive', 'suspended', 'pending') DEFAULT 'pending' COMMENT '账户状态',
        is_email_verified BOOLEAN DEFAULT FALSE COMMENT '邮箱是否验证',
        is_phone_verified BOOLEAN DEFAULT FALSE COMMENT '手机是否验证',
        email_verification_token VARCHAR(255) COMMENT '邮箱验证令牌',
        phone_verification_code VARCHAR(10) COMMENT '手机验证码',
        
        -- 安全相关
        password_reset_token VARCHAR(255) COMMENT '密码重置令牌',
        password_reset_expires TIMESTAMP NULL COMMENT '密码重置过期时间',
        two_factor_secret VARCHAR(255) COMMENT '双因子认证密钥',
        two_factor_enabled BOOLEAN DEFAULT FALSE COMMENT '是否启用双因子认证',
        failed_login_attempts INT DEFAULT 0 COMMENT '失败登录次数',
        locked_until TIMESTAMP NULL COMMENT '账户锁定到期时间',
        
        -- 第三方登录
        account_type ENUM('local', 'google', 'facebook', 'github', 'apple') DEFAULT 'local' COMMENT '账户类型',
        google_id VARCHAR(100) COMMENT 'Google ID',
        facebook_id VARCHAR(100) COMMENT 'Facebook ID',
        github_id VARCHAR(100) COMMENT 'GitHub ID',
        apple_id VARCHAR(100) COMMENT 'Apple ID',
        
        -- 地理信息
        country_code VARCHAR(3) COMMENT '国家代码',
        timezone VARCHAR(50) DEFAULT 'UTC' COMMENT '时区',
        language VARCHAR(10) DEFAULT 'en' COMMENT '语言偏好',
        
        -- 订阅和权限
        subscription_type ENUM('free', 'premium', 'enterprise') DEFAULT 'free' COMMENT '订阅类型',
        subscription_expires TIMESTAMP NULL COMMENT '订阅过期时间',
        role ENUM('user', 'admin', 'moderator', 'super_admin') DEFAULT 'user' COMMENT '用户角色',
        permissions JSON COMMENT '自定义权限',
        
        -- 隐私设置
        privacy_settings JSON COMMENT '隐私设置',
        notification_preferences JSON COMMENT '通知偏好',
        
        -- 统计信息
        login_count INT DEFAULT 0 COMMENT '登录次数',
        last_login_at TIMESTAMP NULL COMMENT '最后登录时间',
        last_login_ip VARCHAR(45) COMMENT '最后登录IP',
        last_activity_at TIMESTAMP NULL COMMENT '最后活动时间',
        
        -- Token管理
        refresh_token TEXT COMMENT '刷新令牌',
        refresh_token_expires TIMESTAMP NULL COMMENT '刷新令牌过期时间',
        
        -- 时间戳
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
        deleted_at TIMESTAMP NULL COMMENT '软删除时间',
        
        -- 索引
        INDEX idx_email (email),
        INDEX idx_phone (phone),
        INDEX idx_username (username),
        INDEX idx_status (status),
        INDEX idx_created_at (created_at),
        INDEX idx_last_login (last_login_at),
        INDEX idx_subscription (subscription_type, subscription_expires)
      ) COMMENT='用户表';
    `);
    
    // 创建数据同步表
    await connection.query(`
      CREATE TABLE IF NOT EXISTS user_data (
        id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
        user_id VARCHAR(36) NOT NULL,
        file_name VARCHAR(255) NOT NULL CHECK (file_name != ''),
        file_content JSON,
        version INT NOT NULL DEFAULT 1,
        last_modified TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        UNIQUE (user_id, file_name),
        INDEX idx_user_id (user_id),
        INDEX idx_last_modified (last_modified)
      ) COMMENT='用户数据同步表';
    `);

    // 创建用户活动日志表
    await connection.query(`
      CREATE TABLE IF NOT EXISTS user_activity_logs (
        id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
        user_id VARCHAR(36) NOT NULL,
        action VARCHAR(100) NOT NULL COMMENT '操作类型',
        description TEXT COMMENT '操作描述',
        ip_address VARCHAR(45) COMMENT 'IP地址',
        user_agent TEXT COMMENT '用户代理',
        metadata JSON COMMENT '额外元数据',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        INDEX idx_user_id (user_id),
        INDEX idx_action (action),
        INDEX idx_created_at (created_at)
      ) COMMENT='用户活动日志表';
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
