import { Router, Request, Response } from 'express'
import { UserController } from './user.controller'
import { authenticateToken } from '../auth/middlewares/auth.middleware'
import { ApiResponse } from './types/user'
import { validateRegisterData } from './middlewares/user.validatData.middleware'
/**
 * 用户路由模块
 */
const router = Router()

// 用户注册路由
router.post('/register', validateRegisterData, UserController.register)



// 获取用户列表路由
router.get('/users', UserController.getAllUsers)

// 获取当前用户信息路由
router.get('/current', authenticateToken, UserController.getCurrentUser)

// 受保护的路由示例 - 需要JWT认证
router.get('/protected', authenticateToken, (
  req: Request,
  res: Response<ApiResponse>
) => {
  res.json({ 
    success: true,
    message: '这是受保护的内容', 
    data: { user: req.user } 
  })
})

export default router