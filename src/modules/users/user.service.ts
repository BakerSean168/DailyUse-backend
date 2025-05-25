import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { UserModel } from './user.model'
import { JWT_SECRET } from '../auth/auth.middleware'
import type { User, LoginRequest ,RegisterRequest, SafeUser } from './types/user'
import type { TResponse } from '../../types'

/**
 * 用户服务类 - 处理所有用户相关的业务逻辑
 */
export class UserService {
  /**
   * 用户注册
   * @param {RegisterRequest} param0 - 包含username、password、email的注册请求对象
   * @returns {Promise<TResponse>} 注册结果响应
   */
  static async register({ username, password, email }: RegisterRequest): Promise<TResponse> {
    try {
      // 检查用户是否已存在
      const existingUser = await UserModel.findByUsername(username)
      if (existingUser) {
        return {
          success: false,
          message: '用户已存在'
        }
      }
  
      // 创建新用户
      const result = await UserModel.createUser(username, password, email)
      // 检查是否创建成功
      if (result.affectedRows > 0) {
        return {
          success: true,
          message: '注册成功',
          data: {
            id: result.insertId,
            username,
            email
          }
        }
      } else {
        return {
          success: false,
          message: '注册失败'
        }
      }
    } catch (error) {
      // 错误处理
      return {
        success: false,
        message: error instanceof Error ? error.message : '注册失败'
      }
    }
  }

  /**
 * 用户登录
 * @param {LoginRequest} loginData - 登录请求数据对象
 * @param {string} loginData.username - 用户名
 * @param {string} loginData.password - 密码
 * @param {string} [loginData.email] - 可选的邮箱
 * @param {string} [loginData.phone] - 可选的手机号
 * @returns {Promise<TResponse<{ token: string }>>} 登录结果响应，包含JWT token
 */
  static async login({username, password, email, phone}: LoginRequest): Promise<TResponse<{ userWithoutPassword: SafeUser,token: string }>> {
    try {
      // 查找用户
      const user = await UserModel.findByUsername(username)
      if (!user) {
        return {
          success: false,
          message: '用户不存在'
        }
      }
      const userWithoutPassword: SafeUser = {
        id: user.id,
        username: user.username,
        email: user.email,
        phone: user.phone,
        created_at: user.created_at
      }

      // 验证密码
      const validPassword = await bcrypt.compare(password, user.password)
      if (!validPassword) {
        return {
          success: false,
          message: '密码错误'
        }
      }
  
      // 生成JWT token
      const token = jwt.sign(
        { userId: user.id, username: user.username },
        JWT_SECRET,
        { expiresIn: '1h' }
      )
  
      return {
        success: true,
        message: '登录成功',
        data: { 
          userWithoutPassword,
          token }
      }
    } catch (error) {
      return {
        success: false,
        message: error instanceof Error ? error.message : '登录失败'
      }
    }
  }

  /**
   * 获取所有用户列表
   * @returns {Promise<TResponse<User[]>>} 用户列表响应
   */
  static async getAllUsers(): Promise<TResponse<User[]>> {
    try {
      const users = await UserModel.getAllUsers()
      return {
        success: true,
        message: '获取用户列表成功',
        data: users
      }
    } catch (error) {
      return {
        success: false,
        message: error instanceof Error ? error.message : '获取用户列表失败'
      }
    }
  }
}