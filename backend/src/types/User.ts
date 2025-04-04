/**
 * ユーザー型定義
 * TypeORM User エンティティの型情報
 */
export interface User {
  user_id: number;
  username: string;
  email: string;
  passwordHash: string;
  firstName?: string;
  lastName?: string;
  createdAt: Date;
  updatedAt: Date;
  lastLoginAt?: Date;
  isActive: boolean;
  role: string;
  settings: object;
}

/**
 * ユーザー作成リクエスト型
 */
export interface CreateUserDto {
  username: string;
  email: string;
  password: string;
  firstName?: string;
  lastName?: string;
  role?: string;
}

/**
 * ユーザー更新リクエスト型
 */
export interface UpdateUserDto {
  username?: string;
  email?: string;
  firstName?: string;
  lastName?: string;
  isActive?: boolean;
}

/**
 * ユーザー登録リクエスト型
 */
export interface RegisterDTO {
  username: string;
  email: string;
  password: string;
  firstName?: string;
  lastName?: string;
}

/**
 * パスワード情報を除いた安全なユーザー型
 */
export interface SafeUser {
  user_id: number;
  username: string;
  email: string;
  firstName?: string;
  lastName?: string;
  role: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  lastLoginAt?: Date;
  settings: object;
}
