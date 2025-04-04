import type { Request as ExpressRequest, Response as ExpressResponse, NextFunction as ExpressNextFunction } from 'express';
import type { User } from '../models/User';

/**
 * 拡張されたExpressリクエスト型
 * 認証されたユーザー情報を含むリクエスト
 */
export interface AuthRequest extends ExpressRequest {
  user?: User;
}

// 元のExpress型をエクスポート
export type Request = ExpressRequest;
export type Response = ExpressResponse;
export type NextFunction = ExpressNextFunction;
