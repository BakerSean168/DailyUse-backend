import { Request, Response, NextFunction } from 'express'
import jwt from 'jsonwebtoken'
import { JwtPayload } from '../../users/types/user'

// JWT密钥 - 在生产环境中应该使用环境变量
export const JWT_SECRET = 'your-secret-key'
export const REFRESH_TOKEN_SECRET = 'your-refresh-token-secret-key'
/**
 * JWT认证中间件
 * 验证请求头中的Bearer token是否有效
 * @param {Request} req - Express请求对象
 * @param {Response} res - Express响应对象
 * @param {NextFunction} next - Express next函数
 */
export const authenticateToken = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  // 从请求头中获取token
  const authHeader = req.headers['authorization']
  const token = authHeader && authHeader.split(' ')[1] // Bearer TOKEN

  // 如果没有token，返回401未授权
  if (!token) {
    res.status(401).json({ message: '未提供认证令牌' })
    return
  }

  try {
    // 验证token
    const user = jwt.verify(token, JWT_SECRET) as JwtPayload
    // 将用户信息添加到请求对象中
    req.user = user
    // 继续处理请求
    next()
  } catch (error) {
    // token无效或过期
    res.status(403).json({ message: '令牌无效' })
  }
}