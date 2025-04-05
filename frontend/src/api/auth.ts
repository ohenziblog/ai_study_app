import apiClient from './axios';
import type { LoginRequest, RegisterRequest, AuthResponse, ApiResponse } from '../types/api';

/**
 * 認証関連の API
 */
export const authApi = {
  /**
   * ユーザー登録
   */
  register: async (data: RegisterRequest): Promise<AuthResponse> => {
    const response = await apiClient.post<ApiResponse<AuthResponse>>('/auth/register', data);
    
    if (response.data.success && response.data.data) {
      // トークンとユーザー情報をローカルストレージに保存
      localStorage.setItem('token', response.data.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.data.user));
      return response.data.data;
    }
    
    throw new Error(response.data.message || '登録に失敗しました');
  },
  
  /**
   * ログイン処理
   */
  login: async (data: LoginRequest): Promise<AuthResponse> => {
    const response = await apiClient.post<ApiResponse<AuthResponse>>('/auth/login', data);
    
    if (response.data.success && response.data.data) {
      // トークンとユーザー情報をローカルストレージに保存
      localStorage.setItem('token', response.data.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.data.user));
      return response.data.data;
    }
    
    throw new Error(response.data.message || 'ログインに失敗しました');
  },
  
  /**
   * ログアウト処理
   */
  logout: (): void => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },
  
  /**
   * 現在のログインユーザーを取得
   */
  getCurrentUser: (): AuthResponse['user'] | null => {
    const userStr = localStorage.getItem('user');
    if (!userStr) return null;
    
    try {
      return JSON.parse(userStr);
    } catch (error) {
      localStorage.removeItem('user');
      return null;
    }
  },
  
  /**
   * JWTトークンを取得
   */
  getToken: (): string | null => {
    return localStorage.getItem('token');
  },
  
  /**
   * ログイン状態チェック
   */
  isAuthenticated: (): boolean => {
    return !!localStorage.getItem('token');
  }
};
