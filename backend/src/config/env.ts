/**
 * 環境変数の初期化を一箇所で管理するモジュール
 * アプリケーション内の複数のファイルから参照される
 */
const dotenv = require('dotenv');

// 環境変数を読み込み
const result = dotenv.config();

// .envファイルが読み込めなかった場合はエラーメッセージを表示
if (result.error) {
  console.warn('⚠️ .envファイルが見つからないか、読み込めませんでした');
  console.warn('デフォルト設定またはシステム環境変数を使用します');
} else {
  console.log('✅ 環境変数を読み込みました');
}

// process.envが他のファイルで使えるようにexportなしで終了
// このファイルをrequireするだけで環境変数が初期化される
