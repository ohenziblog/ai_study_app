// shared-typesから型定義をインポート
import { ApiResponse, HTTPTypes } from '@ai-study-app/shared-types';

// HTTPステータスコードをshared-typesから使用
export const HTTP_STATUS = HTTPTypes.HTTP_STATUS;

/**
 * 標準化されたAPIレスポンスを作成する
 * @param success 成功したかどうか
 * @param message メッセージ
 * @param data レスポンスデータ（オプション）
 * @param errors エラーメッセージ（オプション）
 */
export const createApiResponse = <T>(
  success: boolean,
  message: string,
  data?: T,
  errors?: string[]
): ApiResponse<T> => {
  return {
    success,
    message,
    data,
    errors
  };
};
