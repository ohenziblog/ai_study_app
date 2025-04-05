import axios from 'axios';
import { HTTP_ERROR_MESSAGES, NETWORK_ERROR_MESSAGES } from '../constants/errorMessages';
import { notifyError, notifyHttpError } from '../utils/notifications';

// 環境変数からベースURLを取得（ハードコーディングを避ける）
const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001';

const apiClient = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// リクエストインターセプター
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// レスポンスインターセプター（強化版）
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    // レスポンスが存在する場合のみステータスコードを取得
    const statusCode = error.response?.status;
    
    if (error.response) {
      // 様々なエラーコードに対応するswitch文
      switch (statusCode) {
        case 401:
          // 認証エラー: ログアウト処理を実行
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          
          // 現在のURLを保存してログイン後にリダイレクトできるようにする（オプション）
          const currentPath = window.location.pathname;
          if (currentPath !== '/login') {
            localStorage.setItem('redirectAfterLogin', currentPath);
          }
          
          window.location.href = '/login';
          break;
          
        case 403:
        case 404:
        case 500:
        case 502:
        case 503:
          // 共通関数を使用してエラーを通知
          notifyHttpError(statusCode);
          break;
          
        default:
          // その他のエラー
          notifyError(error.response.data?.message || HTTP_ERROR_MESSAGES.default);
          break;
      }
    } else if (error.request) {
      // リクエストを送信したがレスポンスを受け取れなかった場合
      notifyError(NETWORK_ERROR_MESSAGES.connection);
    } else {
      // リクエストの設定時にエラーが発生した場合
      notifyError(`通信エラー: ${error.message}`);
    }
    
    // エラーを次のハンドラに渡す
    return Promise.reject(error);
  }
);

export default apiClient;
