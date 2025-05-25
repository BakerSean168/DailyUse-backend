import { JwtPayload } from "../modules/users/types/user";

declare global {
  namespace Express {
    export interface Request {
      user?: JwtPayload;
    }
  }
}

export type TResponse<T = any> = {
  success: boolean;
  message: string;
  data?: T;
};

// API响应格式
export type ApiResponse<T = any> = {
  success: boolean;
  message?: string;
  data?: T;
};