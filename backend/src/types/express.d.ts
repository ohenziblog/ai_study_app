// shared-typesから型定義をインポート
import type { Request as ExpressRequest, Response as ExpressResponse, NextFunction as ExpressNextFunction } from 'express';
import type { ExpressTypes, UserEntity } from '@ai-study-app/shared-types';

// 拡張されたExpressリクエスト型をshared-typesから使用
export type AuthRequest = ExpressRequest & ExpressTypes.AuthRequest;

// 元のExpress型をエクスポート
export type Request = ExpressRequest;
export type Response = ExpressResponse;
export type NextFunction = ExpressNextFunction;
