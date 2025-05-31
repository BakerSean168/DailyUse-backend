import { Request, Response } from "express";
import { AuthService } from "./auth.service";
import { TResponse } from "../../types/index";
import {
  LoginRequest,
  ApiResponse,
} from "../users/types/user";
export class AuthController {
  static async refreshToken(
    req: Request<{}, {}, { refreshToken: string }>,
    res: Response<TResponse<{ accessToken: string }>>
  ): Promise<void> {
    const { refreshToken } = req.body;

    // 调用 AuthService 刷新 Token
    const response = await AuthService.refreshToken(refreshToken);

    // 返回响应
    if (response.success) {
      res.json(response);
    } else {
      res.status(400).json(response);
    }
  }

  /**
   * 处理用户登录请求
   * @param {Request} req - Express请求对象
   * @param {Response} res - Express响应对象
   */
  static async login(
    req: Request<{}, {}, LoginRequest>,
    res: Response<ApiResponse>
  ): Promise<void> {
    try {
      const { username, password } = req.body;
      const response = await AuthService.login({ username, password });
      res.json(response);
    } catch (error) {
      console.error(error);
      res.status(400).json({
        success: false,
        message: error instanceof Error ? error.message : "登录失败",
      });
    }
  }

  static async logout(
    req: Request<{}, {}, { userId: string, refreshToken: string }>,
    res: Response<ApiResponse>
  ): Promise<void> {
    try {
      const { userId, refreshToken } = req.body;
      const response = await AuthService.logout(userId, refreshToken);
      res.json(response);
    } catch (error) {
      console.error(error);
      res.status(400).json({
        success: false,
        message: error instanceof Error ? error.message : "登出失败",
      });
    }
  }
}
