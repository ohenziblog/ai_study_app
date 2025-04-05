import { useState, useEffect, useRef } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { useQuestion, useSubmitAnswer } from '../../hooks/useQuestions';
import { Button } from '../../components/common/Button';

export const Question = () => {
  const [searchParams] = useSearchParams();
  const categoryId = searchParams.get('category_id') ? parseInt(searchParams.get('category_id')!) : undefined;
  const skillId = searchParams.get('skill_id') ? parseInt(searchParams.get('skill_id')!) : undefined;
  
  const { data: question, isLoading, error, refetch } = useQuestion(categoryId, skillId);
  const submitAnswerMutation = useSubmitAnswer();
  const navigate = useNavigate();
  
  const [answer, setAnswer] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error', message: string } | null>(null);
  const [startTime, setStartTime] = useState<number>(0);
  const answerTextareaRef = useRef<HTMLTextAreaElement>(null);

  // 問題が読み込まれたら解答開始時間を記録
  useEffect(() => {
    if (question && !isLoading) {
      setStartTime(Date.now());
      // テキストエリアにフォーカス
      if (answerTextareaRef.current) {
        answerTextareaRef.current.focus();
      }
    }
  }, [question, isLoading]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!question || isSubmitting || !answer.trim()) return;
    
    const timeTaken = Math.floor((Date.now() - startTime) / 1000); // 秒単位
    
    setIsSubmitting(true);
    setFeedback(null);
    
    try {
      // この例では回答の正誤判定はバックエンドで行うと仮定します
      // 実際の実装では正誤判定ロジックをここに追加するか、バックエンドに任せます
      const isCorrect = true; // 仮の値
      
      const result = await submitAnswerMutation.mutateAsync({
        questionId: question.question_id,
        answerText: answer,
        isCorrect,
        timeTaken,
      });
      
      setFeedback({
        type: result.question.isCorrect ? 'success' : 'error',
        message: result.question.isCorrect 
          ? '正解です！次の問題に進みましょう。' 
          : '不正解です。次の問題で頑張りましょう。'
      });
      
      // フィードバック表示後、自動的に次の問題へ
      setTimeout(() => {
        setAnswer('');
        setFeedback(null);
        refetch();
      }, 3000);
    } catch (err: any) {
      setFeedback({
        type: 'error',
        message: err.message || '回答の送信中にエラーが発生しました。'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
      </div>
    );
  }

  if (error || !question) {
    return (
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
        <p>問題の取得に失敗しました: {error?.message || '問題が見つかりません'}</p>
        <div className="mt-4">
          <Link to="/subjects" className="text-primary hover:underline">
            ← 教科一覧に戻る
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-6 flex justify-between items-center">
        <Link to={categoryId ? `/subjects/${categoryId}` : '/subjects'} className="text-primary hover:underline flex items-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M9.707 14.707a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 1.414L7.414 9H15a1 1 0 110 2H7.414l2.293 2.293a1 1 0 010 1.414z" clipRule="evenodd" />
          </svg>
          戻る
        </Link>
        
        <div className="flex items-center">
          <span className="text-sm text-gray-600 mr-2">教科:</span>
          <span className="bg-primary text-white px-3 py-1 rounded-full text-sm">
            {question.category?.name || '不明'}
          </span>
          
          {question.skill && (
            <>
              <span className="text-sm text-gray-600 mx-2">スキル:</span>
              <span className="bg-secondary text-white px-3 py-1 rounded-full text-sm">
                {question.skill.name}
              </span>
            </>
          )}
        </div>
      </div>
      
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">問題</h2>
        <p className="text-gray-800 whitespace-pre-line">{question.question_text}</p>
      </div>
      
      <form onSubmit={handleSubmit}>
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h3 className="text-xl font-bold text-gray-800 mb-4">回答</h3>
          <textarea
            ref={answerTextareaRef}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary min-h-[150px]"
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
            placeholder="ここに回答を入力してください..."
            required
            disabled={isSubmitting}
          />
        </div>
        
        {feedback && (
          <div className={`p-4 mb-6 rounded-md ${
            feedback.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-700'
          }`}>
            <p>{feedback.message}</p>
          </div>
        )}
        
        <div className="flex justify-between">
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate(categoryId ? `/subjects/${categoryId}` : '/subjects')}
          >
            学習をやめる
          </Button>
          
          <Button
            type="submit"
            isLoading={isSubmitting}
            disabled={isSubmitting || !answer.trim()}
          >
            回答を送信
          </Button>
        </div>
      </form>
    </div>
  );
};
