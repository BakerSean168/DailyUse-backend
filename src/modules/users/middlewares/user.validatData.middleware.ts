import { Request, Response, NextFunction } from 'express'
import { RegisterRequest } from '../../users/types/user'

/**
 * 验证注册请求数据
 */
export const validateRegisterData = (
  req: Request<{}, {}, RegisterRequest>,
  res: Response,
  next: NextFunction
): void => {
  const { username, password, email } = req.body

  // 检查必需字段
  if (!username || !password || !email) {
    res.status(400).json({
      success: false,
      message: '请提供完整的注册信息（用户名、密码和邮箱）'
    })
    return
  }

  // 验证用户名格式
  if (username.length < 3) {
    res.status(400).json({
      success: false,
      message: '用户名至少需要3个字符'
    })
    return
  }

  // 验证密码强度
  if (password.length < 8) {
    res.status(400).json({
      success: false,
      message: '密码至少需要8个字符'
    })
    return
  }

  // 验证邮箱格式
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(email)) {
    res.status(400).json({
      success: false,
      message: '请提供有效的邮箱地址'
    })
    return
  }

  next()
}