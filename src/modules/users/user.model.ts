import { Pool, RowDataPacket, ResultSetHeader } from 'mysql2/promise'
import bcrypt from 'bcryptjs'
import { pool } from '../../config/database'
import { User } from './types/user'

/**
 * 用户数据模型类 - 处理与数据库的直接交互
 */
export class UserModel {
  /**
   * 通过用户名查找用户
   * @param {string} username - 要查找的用户名
   * @returns {Promise<User | undefined>} 返回用户对象或undefined
   */
  static async findByUsername(username: string): Promise<User | undefined> {
    const [users] = await pool.execute<(User & RowDataPacket)[]>(
      'SELECT * FROM users WHERE username = ?',
      [username]
    )
    return users[0]
  }

  /**
   * 通过用户ID查找用户
   * @param {string} id - 要查找的用户ID
   * @returns {Promise<User | undefined>} 返回用户对象或undefined
   */
  static async findById(id: string): Promise<User | undefined> {
    const [users] = await pool.execute<(User & RowDataPacket)[]>(
      'SELECT * FROM users WHERE id = ?',
      [id]
    )
    return users[0]
  }

  /**
   * 创建新用户
   * @param {string} username - 用户名
   * @param {string} password - 原始密码（将被加密）
   * @param {string} email - 邮箱（可选）
   * @returns {Promise<ResultSetHeader>} MySQL插入操作的结果
   */
  static async createUser(username: string, password: string, email?: string): Promise<string> {
    // 对密码进行加密
    const hashedPassword = await bcrypt.hash(password, 10)
    const userId = crypto.randomUUID() // 生成唯一的用户ID
    // 根据是否提供email使用不同的SQL
    if (email) {
      await pool.execute(
        'INSERT INTO users (id, username, password, email) VALUES (?, ?, ?, ?)',
        [userId, username, hashedPassword, email]
      )
    } else {
      await pool.execute(
        'INSERT INTO users (id, username, password) VALUES (?, ?, ?)',
        [userId, username, hashedPassword]
      )
    }
    return userId
  }

  /**
   * 更新用户信息
   * @param {string} id - 用户ID
   * @param {object} data - 要更新的数据
   * @returns {Promise<boolean>} 是否更新成功
   */
  static async updateUser(id: string, data: {
    avatar?: string,
    email?: string,
    phone?: string,
  }): Promise<boolean> {
    const fields: string[] = []
    const values: any[] = []
    
    if (data.avatar !== undefined) {
      fields.push('avatar = ?')
      values.push(data.avatar)
    }
    if (data.email !== undefined) {
      fields.push('email = ?')
      values.push(data.email)
    }
    if (data.phone !== undefined) {
      fields.push('phone = ?')
      values.push(data.phone)
    }
    
    if (fields.length === 0) return false
    
    values.push(id)
    const [result] = await pool.execute<ResultSetHeader>(
      `UPDATE users SET ${fields.join(', ')} WHERE id = ?`,
      values
    )
    return result.affectedRows > 0
  }

  /**
   * 验证用户密码
   * @param {string} plainPassword - 明文密码
   * @param {string} hashedPassword - 加密后的密码
   * @returns {Promise<boolean>} 密码是否匹配
   */
  static async verifyPassword(plainPassword: string, hashedPassword: string): Promise<boolean> {
    return await bcrypt.compare(plainPassword, hashedPassword)
  }

  /**
   * 获取所有用户列表
   * @returns {Promise<User[]>} 用户列表
   */
  static async getAllUsers(): Promise<User[]> {
    const [users] = await pool.execute<(User & RowDataPacket)[]>(
      'SELECT id, username, avatar, email, phone, accountType, created_at FROM users'
    )
    return users
  }

  /**
   * 删除用户
   * @param {string} id - 用户ID
   * @returns {Promise<boolean>} 是否删除成功
   */
  static async deleteUser(id: string): Promise<boolean> {
    const [result] = await pool.execute<ResultSetHeader>(
      'DELETE FROM users WHERE id = ?',
      [id]
    )
    return result.affectedRows > 0
  }

  /**
   * 保存 Refresh Token
   */
  static async saveRefreshToken(userId: string, refreshToken: string): Promise<void> {
    await pool.execute(
      'UPDATE users SET refresh_token = ? WHERE id = ?',
      [refreshToken, userId]
    )
  }

  /**
   * 验证 Refresh Token
   */
  static async verifyRefreshToken(userId: string, refreshToken: string): Promise<boolean> {
    const [rows] = await pool.execute<(User & RowDataPacket)[]>(
      'SELECT refresh_token FROM users WHERE id = ?',
      [userId]
    )
    return rows[0]?.refresh_token === refreshToken
  }

  /**
   * 撤销 Refresh Token
   */
  static async revokeRefreshToken(userId: string, refreshToken: string): Promise<void> {
    await pool.execute(
      'UPDATE users SET refresh_token = NULL WHERE id = ? AND refresh_token = ?',
      [userId, refreshToken]
    )
  }
}