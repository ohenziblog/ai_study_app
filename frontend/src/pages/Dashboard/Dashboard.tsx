import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useQuestionHistory } from '../../hooks/useQuestions';
import { useCategories } from '../../hooks/useCategories';
import { Card } from '../../components/common/Card';
import apiClient from '../../api/axios';
import logger from '../../utils/logger';
import type { UserAPI } from '../../types'

// shared-typesから型をインポート
type UserSkillLevel = UserAPI.UserSkillLevelResponse;

export const Dashboard = () => {
  const { user } = useAuth();
  const { data: recentHistory, isLoading: historyLoading } = useQuestionHistory(5);
  const { data: categories, isLoading: categoriesLoading } = useCategories();
  const [skillLevels, setSkillLevels] = useState<UserSkillLevel[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // ユーザーのスキルレベルを取得
  useEffect(() => {
    const fetchUserSkillLevels = async () => {
      try {
        if (!user?.userId) {
          logger.error('ユーザーIDが見つかりません', { notify: false });
          setIsLoading(false);
          return;
        }
        
        // ユーザーIDをクエリパラメータとして追加
        // 文字列型に確実に変換して送信
        const userId = String(user.userId);
        const response = await apiClient.get(`/users/skill-levels`, { 
          params: { userId }
        });
        
        if (response.data.success && response.data.data) {
          logger.info(`スキルレベル取得成功 - ${response.data.data.length}件のスキルデータを取得`);
          setSkillLevels(response.data.data);
        } else {
          // レスポンスが成功だが、データが不適切な場合
          logger.warn('スキルレベルのデータが正しい形式ではありません');
          setSkillLevels([]);
        }
      } catch (error) {
        // axiosインターセプターで既に通知されているため、ここでは再通知しない
        logger.error(`スキルレベルの取得に失敗しました: ${error instanceof Error ? error.message : String(error)}`, { notify: false });
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserSkillLevels();
  }, [user]); // userを依存配列に追加

  // スキルレベルをIRT値から分かりやすい表現に変換
  const getSkillLevelText = (level: number): string => {
    if (level < -2) return '初心者';
    if (level < -1) return '入門';
    if (level < 0) return '基礎';
    if (level < 1) return '標準';
    if (level < 2) return '応用';
    return '熟練';
  };

  // 正答率を計算
  const getCorrectRate = (total: number, correct: number): string => {
    if (total === 0) return '0%';
    return `${Math.round((correct / total) * 100)}%`;
  };

  // ロード中表示
  if ((historyLoading || categoriesLoading || isLoading) && !recentHistory && !categories) {
    logger.debug('ダッシュボードデータ読込中...');
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
      </div>
    );
  }

  logger.debug(`ダッシュボード表示 - スキルレベル: ${skillLevels.length}件, 履歴: ${recentHistory?.length || 0}件`);
  return (
    <div>
      <div className="mb-10 text-center">
        <h1 className="text-3xl font-bold text-gray-800 mb-3">ダッシュボード</h1>
        <div className="w-20 h-1 bg-primary mx-auto mb-4 rounded-full"></div>
        <p className="text-gray-600 max-w-2xl mx-auto">
          こんにちは、{user?.username || 'ゲスト'}さん。学習進捗の確認や新しい学習を始めることができます。
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-10">
        {/* 学習進捗カード */}
        <Card title="学習進捗">
          {skillLevels.length > 0 ? (
            <div className="space-y-4">
              {skillLevels.slice(0, 5).map((skill) => (
                <div key={skill.skillId} className="flex justify-between items-center">
                  <div>
                    <p className="font-medium">{skill.skillName}</p>
                    <p className="text-sm text-gray-500">{skill.categoryName}</p>
                  </div>
                  <div className="text-right">
                    <span className="bg-primary bg-opacity-10 text-primary px-2 py-1 rounded text-sm font-medium">
                      {getSkillLevelText(skill.skillLevel)}
                    </span>
                    <p className="text-sm text-gray-500 mt-1">
                      正答率: {getCorrectRate(skill.totalAttempts, skill.correctAttempts)}
                    </p>
                  </div>
                </div>
              ))}
              
              {skillLevels.length > 5 && (
                <div className="text-right mt-2">
                  <Link to="/profile" className="text-primary hover:underline text-sm">
                    すべての進捗を見る →
                  </Link>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-4">
              <p className="text-gray-500">まだ学習記録がありません。</p>
              <p className="text-gray-500 mt-2">
                <Link to="/subjects" className="text-primary hover:underline">
                  学習を始める
                </Link>
                と、ここに進捗が表示されます。
              </p>
            </div>
          )}
        </Card>

        {/* 最近の学習履歴カード */}
        <Card title="最近の学習履歴">
          {recentHistory && recentHistory.length > 0 ? (
            <div className="space-y-4">
              {recentHistory.map((item: any) => (
                <div key={item.questionId} className="border-b border-gray-100 pb-3 last:border-b-0 last:pb-0">
                  <div className="flex justify-between items-start">
                    <div className="max-w-xs">
                      <p className="font-medium truncate">{item.questionText}</p>
                      <div className="flex mt-1 space-x-2">
                        <span className="bg-primary bg-opacity-10 text-primary px-2 py-0.5 rounded-full text-xs">
                          {item.category?.name || '不明'}
                        </span>
                        {item.skill && (
                          <span className="bg-secondary bg-opacity-10 text-secondary px-2 py-0.5 rounded-full text-xs">
                            {item.skill.name}
                          </span>
                        )}
                      </div>
                    </div>
                    {item.isCorrect !== null && (
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        item.isCorrect 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {item.isCorrect ? '正解' : '不正解'}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    {new Date(item.askedAt).toLocaleString()}
                  </p>
                </div>
              ))}
              
              <div className="text-right mt-2">
                <Link to="/history" className="text-primary hover:underline text-sm">
                  すべての履歴を見る →
                </Link>
              </div>
            </div>
          ) : (
            <div className="text-center py-4">
              <p className="text-gray-500">まだ学習履歴がありません。</p>
              <p className="text-gray-500 mt-2">
                <Link to="/subjects" className="text-primary hover:underline">
                  学習を始める
                </Link>
                と、ここに履歴が表示されます。
              </p>
            </div>
          )}
        </Card>
      </div>

      <h2 className="text-2xl font-bold text-gray-800 mb-6 pb-2 border-b border-gray-200">おすすめの教科</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {categories?.slice(0, 3).map((category) => (
          <Card
            key={category.id}
            title={category.name}
            className="h-full"
            onClick={() => {}}
          >
            <p className="text-gray-600 mb-4">{category.description}</p>
            <div className="mt-auto">
              <Link 
                to={`/subjects/${category.id}`} 
                className="text-primary hover:text-primary-dark font-medium"
              >
                詳細を見る →
              </Link>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};
