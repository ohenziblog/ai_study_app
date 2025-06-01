import apiClient from './axios';
import type { LoginRequest, RegisterRequest, AuthResponse, ApiResponse } from '../types';
import logger from '../utils/logger';

/**
 * 認証関連の API
 */
export const authApi = {
  /**
   * ユーザー登録
   */
  register: async (data: RegisterRequest): Promise<AuthResponse> => {
    logger.debug(`ユーザー登録リクエスト: ${data.email}`);
    const response = await apiClient.post<ApiResponse<AuthResponse>>('/auth/register', data);
    
    if (response.data.success && response.data.data) {
      // トークンとユーザー情報をローカルストレージに保存
      localStorage.setItem('token', response.data.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.data.user));
      logger.info(`ユーザー登録成功: ${data.email}`);
      return response.data.data;
    }
    
    const errorMessage = response.data.message || '登録に失敗しました';
    logger.error(errorMessage);
    throw new Error(errorMessage);
  },
  
  /**
   * ログイン処理
   */
  login: async (data: LoginRequest): Promise<AuthResponse> => {
    logger.debug(`ログインリクエスト: ${data.email}`);
    const response = await apiClient.post<ApiResponse<AuthResponse>>('/auth/login', data);
    
    if (response.data.success && response.data.data) {
      // トークンとユーザー情報をローカルストレージに保存
      localStorage.setItem('token', response.data.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.data.user));
      logger.info(`ログイン成功: ${data.email}`);
      return response.data.data;
    }
    
    const errorMessage = response.data.message || 'ログインに失敗しました';
    logger.error(errorMessage);
    throw new Error(errorMessage);
  },
  
  /**
   * ログアウト処理
   */
  logout: (): void => {
    logger.debug('ログアウト処理を実行');
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    logger.info('ログアウト完了');
  },
  
  /**
   * 現在のログインユーザーを取得
   */
  getCurrentUser: (): AuthResponse['user'] | null => {
    const userStr = localStorage.getItem('user');
    if (!userStr) {
      logger.debug('保存されたユーザー情報が見つかりません');
      return null;
    }
    
    try {
      const user = JSON.parse(userStr);
      logger.debug(`保存されたユーザー情報を取得: ${user.email}`);
      return user;
    } catch (error) {
      logger.error('保存されたユーザー情報の解析に失敗しました', { notify: false });
      localStorage.removeItem('user');
      return null;
    }
  },
  
  /**
   * JWTトークンを取得
   */
  getToken: (): string | null => {
    const token = localStorage.getItem('token');
    logger.debug(`トークン取得: ${token ? '成功' : '未設定'}`);
    return token;
  },
  
  /**
   * ログイン状態チェック
   */
  isAuthenticated: (): boolean => {
    const isAuth = !!localStorage.getItem('token');
    logger.debug(`認証状態確認: ${isAuth ? '認証済み' : '未認証'}`);
    return isAuth;
  }
};
