import { questionApi } from '../../src/api/questions';
import apiClient from '../../src/api/axios';
import logger from '../../src/utils/logger';

// apiClientのモック
jest.mock('../../src/api/axios');
const mockedApiClient = apiClient as jest.Mocked<typeof apiClient>;

// loggerはsetupTests.tsでグローバルにモック済み

describe('questionApi', () => {
  beforeEach(() => {
    // テスト前にモックをリセット
    jest.clearAllMocks();
  });

  describe('getQuestionHistory', () => {
    it('正常にデータを取得できた場合、データを返すこと', async () => {
      // モックレスポンスデータ
      const mockHistoryData = [
        { 
          questionId: 1, 
          questionText: 'テスト問題1', 
          isCorrect: true,
          askedAt: '2025-05-15T10:00:00Z',
          category: { id: 1, name: '数学' },
          skill: { id: 1, name: '代数' }
        },
        { 
          questionId: 2, 
          questionText: 'テスト問題2', 
          isCorrect: false,
          askedAt: '2025-05-15T11:00:00Z',
          category: { id: 2, name: '物理' },
          skill: { id: 2, name: '力学' }
        },
      ];
      
      // apiClientのgetメソッドのモック実装
      mockedApiClient.get.mockResolvedValue({
        data: {
          success: true,
          data: mockHistoryData,
          message: ''
        }
      });

      // 関数を実行
      const result = await questionApi.getQuestionHistory(10);
      
      // apiClientが正しく呼び出されたか検証
      expect(mockedApiClient.get).toHaveBeenCalledWith('/questions/history', {
        params: { limit: 10 }
      });
      
      // loggerが正しく呼び出されたか検証
      expect(logger.debug).toHaveBeenCalledWith('問題履歴取得リクエスト - 件数: 10');
      expect(logger.info).toHaveBeenCalledWith('問題履歴取得成功 - 2件取得');
      
      // 返り値が期待通りか検証
      expect(result).toEqual(mockHistoryData);
    });

    it('APIから失敗レスポンスが返された場合、エラーをスローすること', async () => {
      // 失敗レスポンスのモック
      const errorMessage = '履歴取得に失敗しました';
      mockedApiClient.get.mockResolvedValue({
        data: {
          success: false,
          data: null,
          message: errorMessage
        }
      });

      // 関数の実行とエラーのキャッチ
      await expect(questionApi.getQuestionHistory(5))
        .rejects
        .toThrow(errorMessage);
      
      // loggerが正しく呼び出されたか検証
      expect(logger.debug).toHaveBeenCalledWith('問題履歴取得リクエスト - 件数: 5');
      expect(logger.error).toHaveBeenCalledWith(errorMessage);
    });

    it('API呼び出しが例外をスローした場合、エラーを伝播すること', async () => {
      // apiClientがエラーをスローするように設定
      const networkError = new Error('ネットワークエラー');
      mockedApiClient.get.mockRejectedValue(networkError);

      // 関数の実行とエラーのキャッチ
      await expect(questionApi.getQuestionHistory())
        .rejects
        .toThrow(networkError);
      
      // loggerが正しく呼び出されたか検証
      expect(logger.debug).toHaveBeenCalledWith('問題履歴取得リクエスト - 件数: 10');
      // この場合、logger.errorは呼び出されない（関数内のtry-catchに到達する前にエラーが発生するため）
    });

    it('引数を指定しない場合、デフォルト値の10が使用されること', async () => {
      // 正常レスポンスのモック
      mockedApiClient.get.mockResolvedValue({
        data: {
          success: true,
          data: [],
          message: ''
        }
      });

      // 引数なしで関数を実行
      await questionApi.getQuestionHistory();
      
      // apiClientが正しいパラメータで呼び出されたか検証
      expect(mockedApiClient.get).toHaveBeenCalledWith('/questions/history', {
        params: { limit: 10 }
      });
    });
  });
});