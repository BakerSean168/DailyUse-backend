import type { TResponse } from "../../types";
import { UserModel } from "../users/user.model";
import { LoginRequest, SafeUser } from "../users/types/user";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { JWT_SECRET, REFRESH_TOKEN_SECRET } from "./middlewares/auth.middleware";


export class AuthService {
    /**
   * 刷新 Access Token
   */
  static async refreshToken(
    refreshToken: string
  ): Promise<TResponse<{ accessToken: string }>> {
    try {
      // 验证 Refresh Token
      const decoded = jwt.verify(refreshToken, REFRESH_TOKEN_SECRET) as any;

      // 检查用户是否仍然存在
      const user = await UserModel.findById(decoded.userId);
      if (!user) {
        return {
          success: false,
          message: "用户不存在",
        };
      }

      // 检查 Refresh Token 是否在数据库中
      const isValidRefreshToken = await UserModel.verifyRefreshToken(
        decoded.userId,
        refreshToken
      );
      if (!isValidRefreshToken) {
        return {
          success: false,
          message: "Refresh Token 无效",
        };
      }

      // 生成新的 Access Token
      const newAccessToken = jwt.sign(
        { userId: user.id, username: user.username },
        JWT_SECRET,
        { expiresIn: "15m" }
      );

      return {
        success: true,
        message: "Token 刷新成功",
        data: { accessToken: newAccessToken },
      };
    } catch (error) {
      return {
        success: false,
        message: "Refresh Token 无效或已过期",
      };
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
  static async login({
    username,
    password,
    email,
    phone,
  }: LoginRequest): Promise<
    TResponse<{
      userWithoutPassword: SafeUser;
      accessToken: string;
      refreshToken: string;
    }>
  > {
    try {
      // 查找用户
      const user = await UserModel.findByUsername(username);
      if (!user) {
        return {
          success: false,
          message: "用户不存在",
        };
      }
      const userWithoutPassword: SafeUser = {
        id: user.id,
        username: user.username,
        email: user.email,
        phone: user.phone,
        created_at: user.created_at,
      };

      // 验证密码
      const validPassword = await bcrypt.compare(password, user.password);
      if (!validPassword) {
        return {
          success: false,
          message: "密码错误",
        };
      }

      // 生成短期 Access Token (15分钟)
      const accessToken = jwt.sign(
        { userId: user.id, username: user.username },
        JWT_SECRET,
        { expiresIn: "15m" }
      );

      // 生成长期 Refresh Token (30天)
      const refreshToken = jwt.sign(
        { userId: user.id, username: user.username },
        REFRESH_TOKEN_SECRET,
        { expiresIn: "30d" }
      );

      // 将 Refresh Token 存储到数据库
      await UserModel.saveRefreshToken(user.id, refreshToken);

      return {
        success: true,
        message: "登录成功",
        data: {
          userWithoutPassword,
          accessToken,
          refreshToken,
        },
      };
    } catch (error) {
      return {
        success: false,
        message: error instanceof Error ? error.message : "登录失败",
      };
    }
  }

  /**
   * 登出 - 撤销 Refresh Token
   */
  static async logout(
    userId: string,
    refreshToken: string
  ): Promise<TResponse> {
    try {
      await UserModel.revokeRefreshToken(userId, refreshToken);
      return {
        success: true,
        message: "登出成功",
      };
    } catch (error) {
      return {
        success: false,
        message: error instanceof Error ? error.message : "登出失败",
      };
    }
  }

}