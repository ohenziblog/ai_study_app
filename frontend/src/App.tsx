import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { Layout } from './components/layout/Layout';

// ページコンポーネント
import { Login } from './pages/Auth/Login';
import { Register } from './pages/Auth/Register';
import { Dashboard } from './pages/Dashboard/Dashboard';
import { SubjectList } from './pages/Subjects/SubjectList';
import { SubjectDetail } from './pages/Subjects/SubjectDetail';
import { Question } from './pages/Questions/Question';
import { QuestionHistory } from './pages/Questions/QuestionHistory';
import { NotFound } from './pages/NotFound';

// 保護されたルート用のラッパーコンポーネント
const ProtectedRoute = ({ children }: { children: JSX.Element }) => {
  const { isAuthenticated, isLoading } = useAuth();
  
  if (isLoading) {
    return <div className="flex justify-center items-center h-screen">読込中...</div>;
  }
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  return children;
};

function App() {
  return (
    <Router>
      <AuthProvider>
        <Layout>
          <Routes>
            {/* 認証ページ */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            
            {/* 保護されたルート */}
            <Route path="/dashboard" element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            } />
            
            {/* 教科・スキル関連ページ */}
            <Route path="/subjects" element={<SubjectList />} />
            <Route path="/subjects/:id" element={<SubjectDetail />} />
            
            {/* 問題・回答関連ページ */}
            <Route path="/question" element={
              <ProtectedRoute>
                <Question />
              </ProtectedRoute>
            } />
            <Route path="/history" element={
              <ProtectedRoute>
                <QuestionHistory />
              </ProtectedRoute>
            } />
            
            {/* ホームページ（今回はSubjectListにリダイレクト） */}
            <Route path="/" element={<Navigate to="/subjects" replace />} />
            
            {/* 404ページ */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Layout>
      </AuthProvider>
    </Router>
  );
}

export default App;
