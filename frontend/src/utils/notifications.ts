import { HTTP_ERROR_MESSAGES } from '../constants/errorMessages';
import { toast } from 'react-toastify';

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
  
  // react-toastifyを使用した通知
  toast.error(message, {
    position: "top-right",
    autoClose: options?.autoDismiss === false ? false : (options?.duration || 5000),
    hideProgressBar: false,
    closeOnClick: true,
    pauseOnHover: true,
    draggable: true,
  });
  
  // 開発環境では追加でコンソールにも表示
  if (import.meta.env.DEV) {
    const title = options?.title || 'エラー';
    console.error(`${title}: ${message}`);
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
  toast.success(message, {
    position: "top-right",
    autoClose: 3000,
    hideProgressBar: false,
    closeOnClick: true,
    pauseOnHover: true,
    draggable: true,
  });
  
  // 開発環境では追加でコンソールにも表示
  if (import.meta.env.DEV) {
    console.log(`成功: ${message}`);
  }
};
