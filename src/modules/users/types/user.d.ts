declare namespace Express {
  export type User = {
    user?: {
      id: number;
      username: string;
      password: string;
      email: string;
      phone?: string;
      created_at: Date;
      iat?: number;
    };
  };
}

// 用户相关类型定义
export type User = {
  id: string;
  username: string;
  password: string;
  avatar?: string;
  email?: string;
  phone?: string;
  created_at: Date;
  iat?: number;
};

export type SafeUser = Omit<User, 'password'>;

// 用户注册请求体
export type RegisterRequest = {
  username: string;
  password: string;
  email: string;
};

// 用户登录请求体
export type LoginRequest = {
  username: string;
  password: string;
  email?: string;
  phone?: string;
};

export type ProtectRequest = {
  username: string;
  password: string;
};

// API响应格式
export type ApiResponse<T = any> = {
  success: boolean;
  message?: string;
  data?: T;
};

// JWT令牌负载
export type JwtPayload = {
  userId: string;
  username: string;
  iat?: number;
  exp?: number;
};
