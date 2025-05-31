import { Router, Request, Response } from 'express'
import { AuthController } from './auth.controller'
import { validateLoginData } from './middlewares/auth.validatData.middleware'
import { authenticateToken } from './middlewares/auth.middleware'

const router = Router()

router.post('/auth/refresh', AuthController.refreshToken)
// 用户登录路由
router.post('/login', validateLoginData, AuthController.login)
// 用户登出路由
router.post('/logout', authenticateToken, AuthController.logout)
export default router