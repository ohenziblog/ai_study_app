/**
 * シンプルなロガーユーティリティ
 */
const logger = {
  info: (message: string) => {
    console.log(`[INFO] ${new Date().toISOString()} - ${message}`);
  },
  error: (message: any) => {
    console.error(`[ERROR] ${new Date().toISOString()} - `, message);
  },
  warn: (message: string) => {
    console.warn(`[WARN] ${new Date().toISOString()} - ${message}`);
  },
  debug: (message: string) => {
    if (process.env.NODE_ENV !== 'production') {
      console.log(`[DEBUG] ${new Date().toISOString()} - ${message}`);
    }
  }
};

module.exports = { default: logger };
