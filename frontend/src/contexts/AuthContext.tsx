import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { authApi } from '../api/auth';
import type { User, LoginRequest, RegisterRequest } from '../types';
import logger from '../utils/logger';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (data: LoginRequest) => Promise<void>;
  register: (data: RegisterRequest) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // アプリ起動時に保存されているユーザー情報をロード
    const loadUser = () => {
      const currentUser = authApi.getCurrentUser();
      setUser(currentUser);
      if (currentUser) {
        logger.info(`ユーザー情報をロードしました: ${currentUser.username}`);
      } else {
        logger.debug('保存されたユーザー情報が見つかりません');
      }
      setIsLoading(false);
    };

    loadUser();
  }, []);

  const login = async (data: LoginRequest) => {
    setIsLoading(true);
    try {
      const response = await authApi.login(data);
      setUser(response.user);
      logger.info(`ログイン成功: ${response.user.username}`);
    } catch (error) {
      logger.error(`ログイン失敗: ${error instanceof Error ? error.message : String(error)}`, { notify: true });
      throw error; // エラーを上位コンポーネントに伝播
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (data: RegisterRequest) => {
    setIsLoading(true);
    try {
      const response = await authApi.register(data);
      setUser(response.user);
      logger.info(`新規ユーザー登録成功: ${response.user.username}`);
    } catch (error) {
      logger.error(`ユーザー登録失敗: ${error instanceof Error ? error.message : String(error)}`, { notify: true });
      throw error; // エラーを上位コンポーネントに伝播
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    authApi.logout();
    setUser(null);
    logger.info('ログアウト成功');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        register,
        logout
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
