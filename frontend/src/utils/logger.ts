/**
 * フロントエンド用シンプルなロガーユーティリティ
 * バックエンドと同様のインターフェースを提供しつつ、フロントエンド特有の機能を追加
 */
import { notifyError } from './notifications';

const logger = {
  info: (message: string) => {
    console.log(`[INFO] ${new Date().toISOString()} - ${message}`);
  },
  
  error: (message: any, options?: {
    notify?: boolean; // ユーザー通知を表示するかどうか
    title?: string;
  }) => {
    console.error(`[ERROR] ${new Date().toISOString()} - `, message);
    
    // ユーザーに通知する（デフォルトで有効）
    if (options?.notify !== false) {
      const errorMessage = typeof message === 'string' ? message : 
                          message instanceof Error ? message.message : 
                          'エラーが発生しました';
      notifyError(errorMessage, { title: options?.title });
    }
  },
  
  warn: (message: string) => {
    console.warn(`[WARN] ${new Date().toISOString()} - ${message}`);
  },
  
  debug: (message: string) => {
    if (import.meta.env.DEV) { // Viteの環境変数を使用
      console.log(`[DEBUG] ${new Date().toISOString()} - ${message}`);
    }
  }
};

export default logger;