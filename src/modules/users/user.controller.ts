import { Request, Response } from 'express'
import { UserService } from './user.service'
import { RegisterRequest, LoginRequest, ApiResponse, User } from './types/user'

/**
 * 用户控制器类 - 处理HTTP请求和响应
 */
export class UserController {
  /**
   * 处理用户注册请求
   * @param {Request} req - Express请求对象
   * @param {Response} res - Express响应对象
   */
  static async register(
    req: Request<{}, {}, RegisterRequest>,
    res: Response<ApiResponse>
  ): Promise<void> {
    try {
      const { username, password, email } = req.body
      const response = await UserService.register({ username, password, email })
      res.status(201).json(response)
    } catch (error) {
      console.error(error)
      res.status(400).json({ 
        success: false, 
        message: error instanceof Error ? error.message : '注册失败'
      })
    }
  }

  /**
   * 处理用户登录请求
   * @param {Request} req - Express请求对象
   * @param {Response} res - Express响应对象
   */
  static async login(
    req: Request<{}, {}, LoginRequest>,
    res: Response<ApiResponse<{ token: string }>>
  ): Promise<void> {
    try {
      const { username, password } = req.body
      const response = await UserService.login({username, password})
      res.json(response)
    } catch (error) {
      console.error(error)
      res.status(400).json({ 
        success: false, 
        message: error instanceof Error ? error.message : '登录失败'
      })
    }
  }

  /**
   * 获取所有用户列表
   * @param {Request} req - Express请求对象
   * @param {Response} res - Express响应对象
   */
  static async getAllUsers(
    req: Request,
    res: Response<ApiResponse<User[]>>
  ): Promise<void> {
    try {
      const response = await UserService.getAllUsers()
      res.json(response)
    } catch (error) {
      console.error(error)
      res.status(500).json({ 
        success: false, 
        message: '服务器错误' 
      })
    }
  }
}