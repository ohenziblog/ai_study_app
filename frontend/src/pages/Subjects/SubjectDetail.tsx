import { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useCategoryWithSkills } from '../../hooks/useCategories';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { useAuth } from '../../contexts/AuthContext';

export const SubjectDetail = () => {
  const { id } = useParams<{ id: string }>();
  const categoryId = parseInt(id || '0');
  const { data, isLoading, error } = useCategoryWithSkills(categoryId);
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  
  // 選択されたスキル
  const [selectedSkillId, setSelectedSkillId] = useState<number | null>(null);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
        <p>スキル情報の取得に失敗しました: {error?.message || 'カテゴリーが見つかりません'}</p>
        <div className="mt-4">
          <Link to="/subjects" className="text-primary hover:underline">
            ← 教科一覧に戻る
          </Link>
        </div>
      </div>
    );
  }

  const { category, skills } = data;

  const handleStartLearning = () => {
    // 選択されたスキルがあれば、そのスキルの問題ページへ
    if (selectedSkillId) {
      navigate(`/question?skill_id=${selectedSkillId}&category_id=${categoryId}`);
    } else {
      // なければカテゴリー全体の問題ページへ
      navigate(`/question?category_id=${categoryId}`);
    }
  };

  // 難易度に応じたバッジのスタイルを返す関数
  const getDifficultyBadgeStyle = (difficulty: number) => {
    if (difficulty < 2.0) return 'bg-green-100 text-green-800';
    if (difficulty < 3.0) return 'bg-blue-100 text-blue-800';
    if (difficulty < 4.0) return 'bg-yellow-100 text-yellow-800';
    return 'bg-red-100 text-red-800';
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <Link to="/subjects" className="text-primary hover:underline flex items-center mb-6">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M9.707 14.707a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 1.414L7.414 9H15a1 1 0 110 2H7.414l2.293 2.293a1 1 0 010 1.414z" clipRule="evenodd" />
          </svg>
          教科一覧に戻る
        </Link>
      </div>

      <div className="bg-white p-8 rounded-lg shadow-md mb-12 text-center border-2 border-gray-100">
        <h1 className="text-3xl font-bold text-gray-800 mb-3">{category.name}</h1>
        <div className="w-24 h-1 bg-primary mx-auto mb-4 rounded-full"></div>
        <p className="text-gray-600 max-w-2xl mx-auto">{category.description}</p>
      </div>

      <div className="mb-10 text-center">
        <h2 className="text-2xl font-bold text-gray-800 mb-3">スキル一覧</h2>
        <div className="w-16 h-1 bg-secondary mx-auto mb-4 rounded-full"></div>
        <p className="text-gray-600 max-w-2xl mx-auto mb-8">
          以下から学習したいスキルを選択できます。選択せずに学習を始めると、すべてのスキルから問題が出題されます。
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {skills.map((skill) => (
          <Card
            key={skill.id}
            className={`h-full border-2 transition-colors ${
              selectedSkillId === skill.id ? 'border-primary' : 'border-transparent'
            }`}
            onClick={() => setSelectedSkillId(skill.id === selectedSkillId ? null : skill.id)}
          >
            <div className="flex justify-between items-start mb-3">
              <h3 className="text-xl font-semibold text-gray-800">{skill.name}</h3>
              <span className={`text-xs px-2 py-1 rounded-full ${getDifficultyBadgeStyle(skill.difficulty)}`}>
                難易度: {skill.difficulty.toFixed(1)}
              </span>
            </div>
            <p className="text-gray-600">{skill.description}</p>
          </Card>
        ))}
      </div>

      <div className="flex justify-center">
        {isAuthenticated ? (
          <Button
            onClick={handleStartLearning}
            size="lg"
            className="px-8"
          >
            {selectedSkillId 
              ? '選択したスキルで学習を始める' 
              : 'この教科で学習を始める'}
          </Button>
        ) : (
          <div className="text-center">
            <p className="text-gray-600 mb-3">
              学習を始めるにはログインが必要です
            </p>
            <Button
              onClick={() => navigate('/login')}
              variant="primary"
            >
              ログインする
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};
