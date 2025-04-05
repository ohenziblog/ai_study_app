import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

export const Navbar = () => {
  const { isAuthenticated, user, logout } = useAuth();

  return (
    <nav className="bg-primary text-white shadow-md">
      <div className="container mx-auto px-4 py-3">
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <Link to="/" className="text-2xl font-bold">AIスタディ</Link>
            
            {isAuthenticated && (
              <div className="hidden md:flex space-x-4">
                <Link to="/dashboard" className="hover:text-secondary">ダッシュボード</Link>
                <Link to="/subjects" className="hover:text-secondary">教科一覧</Link>
                <Link to="/history" className="hover:text-secondary">学習履歴</Link>
              </div>
            )}
          </div>
          
          <div className="flex items-center space-x-4">
            {isAuthenticated ? (
              <>
                <span className="hidden md:inline">{user?.username}さん</span>
                <button 
                  onClick={logout}
                  className="bg-white text-primary hover:bg-gray-100 px-3 py-1 rounded-md text-sm font-medium"
                >
                  ログアウト
                </button>
              </>
            ) : (
              <>
                <Link 
                  to="/login" 
                  className="hover:text-secondary"
                >
                  ログイン
                </Link>
                <Link 
                  to="/register" 
                  className="bg-white text-primary hover:bg-gray-100 px-3 py-1 rounded-md text-sm font-medium"
                >
                  新規登録
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};
