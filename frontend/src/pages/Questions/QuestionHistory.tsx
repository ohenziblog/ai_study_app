import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useQuestionHistory } from '../../hooks/useQuestions';
import { Button } from '../../components/common/Button';
import logger from '../../utils/logger';

export const QuestionHistory = () => {
  const [limit, setLimit] = useState(10);
  const { data: history = [], isLoading, error, isError } = useQuestionHistory(limit);
  const [hasApiError, setHasApiError] = useState(false);
  
  // エラー状態の監視
  useEffect(() => {
    if (isError && error) {
      logger.warn(`学習履歴表示エラー状態を検知: ${error.message || 'Unknown error'}`);
      setHasApiError(true);
    } else {
      setHasApiError(false);
    }
  }, [isError, error]);

  if (isLoading) {
    logger.debug('学習履歴読込中...');
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
      </div>
    );
  }

  // ※ useQuestionHistoryのエラーハンドリング改善により、ここに到達することはほとんどなくなるはずです
  if (isError && error) {
    const errorMessage = error.message || '不明なエラーが発生しました';
    logger.error(`学習履歴取得エラー: ${errorMessage}`, { notify: false });
    
    return (
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
        <p>学習履歴の取得に失敗しました: {errorMessage}</p>
        <div className="mt-4 flex justify-end">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => window.location.reload()}
          >
            再読み込み
          </Button>
        </div>
      </div>
    );
  }

  logger.debug(`学習履歴表示 - ${history?.length || 0}件の履歴を表示`);

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800">学習履歴</h1>
        <p className="text-gray-600 mt-2">
          これまでの学習問題と結果を確認できます。
        </p>
      </div>

      {/* APIエラーが発生している場合に警告を表示 */}
      {hasApiError && (
        <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 mb-6" role="alert">
          <p className="font-bold">データ取得に問題があります</p>
          <p>一部のデータが正しく表示されていない可能性があります。しばらく経ってから再度お試しください。</p>
        </div>
      )}

      {history && history.length > 0 ? (
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">学習日時</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">教科</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">スキル</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">問題</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">結果</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {history.map((item: any) => (
                <tr key={item.questionId || `history-item-${Math.random()}`}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {item.askedAt ? new Date(item.askedAt).toLocaleString() : '日時不明'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-primary bg-opacity-10 text-primary">
                      {item.category?.name || '不明'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-secondary bg-opacity-10 text-secondary">
                      {item.skill?.name || '不明'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">
                    <div className="max-w-xs truncate">{item.questionText || '問題文不明'}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {item.isCorrect !== null ? (
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        item.isCorrect 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {item.isCorrect ? '正解' : '不正解'}
                      </span>
                    ) : (
                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 text-gray-800">
                        未回答
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          
          {history.length >= limit && (
            <div className="px-6 py-3 bg-gray-50 border-t border-gray-200 text-right">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  const newLimit = limit + 10;
                  logger.debug(`さらに履歴を表示 - 表示件数を${newLimit}件に増加`);
                  setLimit(newLimit);
                }}
              >
                さらに表示
              </Button>
            </div>
          )}
        </div>
      ) : (
        <div className="bg-white p-6 rounded-lg shadow-md text-center">
          <p className="text-gray-600 mb-4">まだ学習履歴がありません。</p>
          <Link to="/subjects">
            <Button>学習を始める</Button>
          </Link>
        </div>
      )}
    </div>
  );
};
