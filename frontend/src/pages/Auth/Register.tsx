import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Button } from '../../components/common/Button';
import logger from '../../utils/logger';

export const Register = () => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  
  const { register, isAuthenticated, isLoading } = useAuth();
  const navigate = useNavigate();

  // 既にログインしている場合はダッシュボードへリダイレクト
  useEffect(() => {
    if (isAuthenticated) {
      logger.debug('既にログイン済み - ダッシュボードへリダイレクト');
      navigate('/dashboard', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    logger.debug(`ユーザー登録試行: ${email}`);
    
    // 基本的なバリデーション
    if (password.length < 8) {
      const errorMessage = 'パスワードは8文字以上で入力してください';
      logger.warn(`登録バリデーションエラー: ${errorMessage}`);
      setError(errorMessage);
      return;
    }
    
    if (password !== confirmPassword) {
      const errorMessage = 'パスワードと確認用パスワードが一致しません';
      logger.warn(`登録バリデーションエラー: ${errorMessage}`);
      setError(errorMessage);
      return;
    }
    
    try {
      await register({ username, email, password });
      logger.info(`ユーザー登録成功: ${email}`);
      navigate('/dashboard');
    } catch (err: any) {
      const errorMessage = err.message || '登録に失敗しました。入力内容を確認してください。';
      logger.error(`ユーザー登録失敗: ${errorMessage}`, { notify: false });
      setError(errorMessage);
    }
  };

  return (
    <div className="max-w-md mx-auto">
      <div className="bg-white p-8 rounded-lg shadow-md">
        <h2 className="text-2xl font-bold text-center mb-6">アカウント登録</h2>
        
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            <p>{error}</p>
          </div>
        )}
        
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="username" className="block text-gray-700 text-sm font-bold mb-2">
              ユーザー名
            </label>
            <input
              id="username"
              type="text"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>
          
          <div className="mb-4">
            <label htmlFor="email" className="block text-gray-700 text-sm font-bold mb-2">
              メールアドレス
            </label>
            <input
              id="email"
              type="email"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          
          <div className="mb-4">
            <label htmlFor="password" className="block text-gray-700 text-sm font-bold mb-2">
              パスワード
            </label>
            <input
              id="password"
              type="password"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={8}
            />
            <p className="text-xs text-gray-500 mt-1">8文字以上で入力してください</p>
          </div>
          
          <div className="mb-6">
            <label htmlFor="confirmPassword" className="block text-gray-700 text-sm font-bold mb-2">
              パスワード（確認用）
            </label>
            <input
              id="confirmPassword"
              type="password"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
          </div>
          
          <Button
            type="submit"
            className="w-full"
            isLoading={isLoading}
            disabled={isLoading}
          >
            登録する
          </Button>
        </form>
        
        <div className="mt-4 text-center">
          <p className="text-gray-600">
            すでにアカウントをお持ちの方は
            <Link to="/login" className="text-primary hover:underline">
              こちら
            </Link>
            からログインしてください。
          </p>
        </div>
      </div>
    </div>
  );
};
