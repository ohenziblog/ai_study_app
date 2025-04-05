import { HTTP_ERROR_MESSAGES } from '../constants/errorMessages';

/**
 * エラー通知ユーティリティ
 * アプリケーション全体で一貫したエラー通知を提供します
 */

/**
 * エラーメッセージをユーザーに通知する
 * 
 * @param message エラーメッセージ
 * @param options 通知オプション
 */
export const notifyError = (message: string, options?: {
  title?: string;
  autoDismiss?: boolean;
  duration?: number;
}) => {
  // エラーをコンソールに記録（開発環境向け）
  console.error(message);
  
  // TODO: 本番環境では適切なUIコンポーネントに置き換える
  // 例: toast.error(message) や errorStore.setError(message) など
  
  // 開発環境では簡易的なアラートを表示
  if (import.meta.env.DEV) {
    const title = options?.title || 'エラー';
    alert(`${title}: ${message}`);
  }
};

/**
 * HTTP/ネットワークエラーを通知する
 * 
 * @param statusCode HTTPステータスコード
 * @param fallbackMessage デフォルトメッセージ
 */
export const notifyHttpError = (statusCode?: number, fallbackMessage?: string) => {
  const message = statusCode && HTTP_ERROR_MESSAGES[statusCode as keyof typeof HTTP_ERROR_MESSAGES]
    ? HTTP_ERROR_MESSAGES[statusCode as keyof typeof HTTP_ERROR_MESSAGES]
    : fallbackMessage || HTTP_ERROR_MESSAGES.default;
    
  notifyError(message);
};

/**
 * 成功メッセージをユーザーに通知する
 * 
 * @param message 成功メッセージ
 */
export const notifySuccess = (message: string) => {
  // TODO: 本番環境では適切なUIコンポーネントに置き換える
  // 例: toast.success(message) など
  
  // 開発環境では簡易的なアラートを表示
  if (import.meta.env.DEV) {
    alert(`成功: ${message}`);
  }
};
