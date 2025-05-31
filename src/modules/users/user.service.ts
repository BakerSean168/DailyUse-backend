import { UserModel } from "./user.model";
import type {
  User,
  LoginRequest,
  RegisterRequest,
  SafeUser,
} from "./types/user";
import type { TResponse } from "../../types";

/**
 * 用户服务类 - 处理所有用户相关的业务逻辑
 */
export class UserService {
  /**
   * 用户注册
   * @param {RegisterRequest} param0 - 包含username、password、email的注册请求对象
   * @returns {Promise<TResponse>} 注册结果响应
   */
  static async register({
    username,
    password,
    email,
  }: RegisterRequest): Promise<TResponse> {
    try {
      // 检查用户是否已存在
      const existingUser = await UserModel.findByUsername(username);
      if (existingUser) {
        return {
          success: false,
          message: "用户已存在",
        };
      }

      // 创建新用户
      const result = await UserModel.createUser(username, password, email);
      // 检查是否创建成功
      if (result) {
        return {
          success: true,
          message: "注册成功",
          data: {
            id: result,
            username,
            email,
          },
        };
      } else {
        return {
          success: false,
          message: "注册失败",
        };
      }
    } catch (error) {
      // 错误处理
      return {
        success: false,
        message: error instanceof Error ? error.message : "注册失败",
      };
    }
  }

  

  /**
   * 获取当前用户信息
   * @param {string} userId - 用户ID
   * @returns {Promise<TResponse<SafeUser>>} 当前用户信息响应
   */
  static async getCurrentUser(
    userId: string
  ): Promise<TResponse<SafeUser>> {
    try {
      const user = await UserModel.findById(userId);
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
      return {
        success: true,
        message: "获取用户信息成功",
        data: userWithoutPassword,
      };
    } catch (error) {
      return {
        success: false,
        message: error instanceof Error ? error.message : "获取用户信息失败",
      };
    }
  }

  /**
   * 获取所有用户列表
   * @returns {Promise<TResponse<User[]>>} 用户列表响应
   */
  static async getAllUsers(): Promise<TResponse<User[]>> {
    try {
      const users = await UserModel.getAllUsers();
      return {
        success: true,
        message: "获取用户列表成功",
        data: users,
      };
    } catch (error) {
      return {
        success: false,
        message: error instanceof Error ? error.message : "获取用户列表失败",
      };
    }
  }

  
}
