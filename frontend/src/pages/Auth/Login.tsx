import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Button } from '../../components/common/Button';
import { useEffect } from 'react';
import logger from '../../utils/logger';

export const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  
  const { login, isAuthenticated, isLoading } = useAuth();
  const navigate = useNavigate();

  // 既にログインしている場合はダッシュボードへリダイレクト
  useEffect(() => {
    if (isAuthenticated) {
      logger.debug('既にログイン済み - ダッシュボードへリダイレクト');
      navigate('/dashboard', { replace: true });
    }
  }
  , [isAuthenticated, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    logger.debug(`ログイン試行: ${email}`);
    
    try {
      await login({ email, password });
      logger.info(`ログイン成功: ${email}`);
      navigate('/dashboard');
    } catch (err: any) {
      const errorMessage = err.message || 'ログインに失敗しました。メールアドレスとパスワードを確認してください。';
      logger.error(`ログイン失敗: ${errorMessage}`, { notify: false });
      setError(errorMessage);
    }
  };

  return (
    <div className="max-w-md mx-auto">
      <div className="bg-white p-8 rounded-lg shadow-md">
        <h2 className="text-2xl font-bold text-center mb-6">ログイン</h2>
        
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            <p>{error}</p>
          </div>
        )}
        
        <form onSubmit={handleSubmit}>
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
          
          <div className="mb-6">
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
            />
          </div>
          
          <Button
            type="submit"
            className="w-full"
            isLoading={isLoading}
            disabled={isLoading}
          >
            ログイン
          </Button>
        </form>
        
        <div className="mt-4 text-center">
          <p className="text-gray-600">
            アカウントをお持ちでない方は
            <Link to="/register" className="text-primary hover:underline">
              こちら
            </Link>
            から登録できます。
          </p>
        </div>
      </div>
    </div>
  );
};
