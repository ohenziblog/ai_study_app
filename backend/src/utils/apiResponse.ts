/**
 * API応答の標準フォーマット
 */
export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  errors?: string[];
}

/**
 * エラー種別とHTTPステータスコードのマッピング
 */
export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  INTERNAL_ERROR: 500
};

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
  const response: ApiResponse<T> = {
    success,
    message
  };
  
  if (data !== undefined) response.data = data;
  if (errors && errors.length > 0) response.errors = errors;
  
  return response;
};
