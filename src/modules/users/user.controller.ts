import { Request, Response } from 'express'
import { UserService } from './user.service'
import { RegisterRequest, LoginRequest, ApiResponse, User, SafeUser } from './types/user'

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

  /**
   * 获取当前用户信息
   * 用来实现快速登录
   *  客户端通过保存的 refresh token 获取当前用户信息
   *  然后返回用户信息，实现快速登录
   * @param {Request} req - Express请求对象
   * @param {Response} res - Express响应对象
   */
  static async getCurrentUser(
    req: Request,
    res: Response<ApiResponse<SafeUser>>
  ): Promise<void> {
    try {
      const user = req.user // 从请求对象中获取用户信息
      if (!user || !user.userId) {
        res.status(401).json({ 
          success: false, 
          message: '未授权访问' 
        })
        return
      }
      const userInfo = await UserService.getCurrentUser(user.userId)
      const response: ApiResponse<SafeUser> = {
        success: true,
        data: userInfo.data, // 确保类型安全
        message: '获取用户信息成功'
      }
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