import { useState, useEffect, useRef } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { 
  useQuestion, 
  useSubmitAnswer, 
  useSubmitMultipleChoiceAnswer,
  isMultipleChoiceQuestion
} from '../../hooks/useQuestions';
import { Button } from '../../components/common/Button';
import logger from '../../utils/logger';

export const Question = () => {
  const [searchParams] = useSearchParams();
  const categoryId = searchParams.get('categoryId') ? parseInt(searchParams.get('categoryId')!) : undefined;
  const skillId = searchParams.get('skillId') ? parseInt(searchParams.get('skillId')!) : undefined;
  
  const { data: question, isLoading, error, refetch } = useQuestion(categoryId, skillId);
  const submitAnswerMutation = useSubmitAnswer();
  const submitMultipleChoiceMutation = useSubmitMultipleChoiceAnswer();
  const navigate = useNavigate();
  
  const [answer, setAnswer] = useState('');
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error', message: string } | null>(null);
  const [showExplanation, setShowExplanation] = useState(false);
  const [startTime, setStartTime] = useState<number>(0);
  const answerTextareaRef = useRef<HTMLTextAreaElement>(null);

  // 問題が読み込まれたら解答開始時間を記録
  useEffect(() => {
    if (question && !isLoading) {
      setStartTime(Date.now());
      setSelectedOption(null);
      setShowExplanation(false);
      setFeedback(null);
      
      logger.debug(`問題表示 - ID: ${question.id}, タイプ: ${isMultipleChoiceQuestion(question) ? '選択式' : '記述式'}`);
      
      // テキストエリアにフォーカス（自由回答形式の場合）
      if (!isMultipleChoiceQuestion(question) && answerTextareaRef.current) {
        answerTextareaRef.current.focus();
      }
    }
  }, [question, isLoading]);

  // 自由回答形式での回答提出
  const handleSubmitFreeForm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!question || isSubmitting || !answer.trim()) return;
    
    const timeTaken = Math.floor((Date.now() - startTime) / 1000); // 秒単位
    logger.debug(`記述式回答提出 - 問題ID: ${question.id}, 解答時間: ${timeTaken}秒`);
    
    setIsSubmitting(true);
    setFeedback(null);
    
    try {
      // この例では回答の正誤判定はバックエンドで行うと仮定します
      // 実際の実装では正誤判定ロジックをここに追加するか、バックエンドに任せます
      const isCorrect = true; // 仮の値
      
      const result = await submitAnswerMutation.mutateAsync({
        questionId: question.id,
        answerText: answer,
        isCorrect,
        timeTaken,
      });
      
      const resultCorrect = result.question.isCorrect;
      logger.info(`回答結果 - 問題ID: ${question.id}, 結果: ${resultCorrect ? '正解' : '不正解'}`);
      
      setFeedback({
        type: resultCorrect ? 'success' : 'error',
        message: resultCorrect 
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
      const errorMessage = err.message || '回答の送信中にエラーが発生しました。';
      logger.error(`回答送信エラー: ${error instanceof Error ? error.message : String(error)}`, { notify: false });
      
      setFeedback({
        type: 'error',
        message: errorMessage
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // 選択肢を選んだときのハンドラ
  const handleOptionSelect = async (optionIndex: number) => {
    if (isSubmitting || showExplanation) return;
    
    setSelectedOption(optionIndex);
    setIsSubmitting(true);
    
    const timeTaken = Math.floor((Date.now() - startTime) / 1000); // 秒単位
    logger.debug(`選択肢回答 - 問題ID: ${question?.id}, 選択肢: ${optionIndex}, 解答時間: ${timeTaken}秒`);
    
    try {
      if (question && isMultipleChoiceQuestion(question)) {
        const result = await submitMultipleChoiceMutation.mutateAsync({
          questionId: question.id,
          selectedOptionIndex: optionIndex,
          timeTaken,
        });
        
        const isCorrect = result.question.isCorrect;
        logger.info(`選択肢回答結果 - 問題ID: ${question.id}, 結果: ${isCorrect ? '正解' : '不正解'}`);
        
        setFeedback({
          type: isCorrect ? 'success' : 'error',
          message: isCorrect 
            ? '正解です！' 
            : '不正解です。'
        });
        
        // 解説を表示
        setShowExplanation(true);
      }
    } catch (err: any) {
      const errorMessage = err.message || '回答の送信中にエラーが発生しました。';
      logger.error(`選択肢回答送信エラー: ${error instanceof Error ? error.message : String(error)}`, { notify: false });
      
      setFeedback({
        type: 'error',
        message: errorMessage
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // 次の問題に進む
  const handleNextQuestion = () => {
    logger.debug('次の問題に進む');
    setAnswer('');
    setSelectedOption(null);
    setFeedback(null);
    setShowExplanation(false);
    refetch();
  };

  if (isLoading) {
    logger.debug('問題読み込み中...');
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
      </div>
    );
  }

  if (error || !question) {
    const errorMessage = error?.message || '問題が見つかりません';
    logger.error(`問題取得エラー: ${errorMessage}`, { notify: false });
    
    return (
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
        <p>問題の取得に失敗しました: {errorMessage}</p>
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
        <p className="text-gray-800 whitespace-pre-line">{question.questionText}</p>
      </div>
      
      {/* 問題タイプに応じて適切なUIを表示 */}
      {isMultipleChoiceQuestion(question) ? (
        // 4択問題UI
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h3 className="text-xl font-bold text-gray-800 mb-4">選択肢</h3>
          <div className="space-y-3">
            {question.options.map((option, index) => (
              <button
                key={index}
                className={`w-full text-left p-4 rounded-md border transition-colors ${
                  selectedOption === index
                    ? selectedOption === question.correctOptionIndex
                      ? 'bg-green-100 border-green-500'
                      : 'bg-red-100 border-red-500'
                    : selectedOption !== null && index === question.correctOptionIndex
                    ? 'bg-green-100 border-green-500'
                    : 'bg-white border-gray-300 hover:border-primary'
                }`}
                onClick={() => handleOptionSelect(index)}
                disabled={isSubmitting || selectedOption !== null}
              >
                <span className="mr-3 inline-block w-6 h-6 text-center rounded-full bg-gray-200">
                  {String.fromCharCode(65 + index)}
                </span>
                {option}
              </button>
            ))}
          </div>
          
          {/* フィードバックメッセージ表示エリア */}
          {feedback && isMultipleChoiceQuestion(question) && (
            <div className={`mt-4 p-4 rounded-md ${
              feedback.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-700'
            }`}>
              <p className="font-bold">{feedback.message}</p>
            </div>
          )}
          
          {/* 解説表示エリア */}
          {showExplanation && isMultipleChoiceQuestion(question) && (
            <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-md">
              <h4 className="font-bold text-blue-800 mb-2">解説</h4>
              <p className="text-gray-800">{question.explanation}</p>
            </div>
          )}
          
          {/* 次の問題ボタン */}
          {selectedOption !== null && (
            <div className="mt-6 flex justify-end">
              <Button
                type="button"
                onClick={handleNextQuestion}
              >
                次の問題へ
              </Button>
            </div>
          )}
        </div>
      ) : (
        // 自由回答問題UI
        <form onSubmit={handleSubmitFreeForm}>
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
      )}
    </div>
  );
};
