/**
 * バリデーション結果を表す型
 */
export interface ValidationResult {
  isValid: boolean;
  errors: string[];
}

/**
 * バリデーション結果を作成する
 * @param errors エラーメッセージの配列（空配列なら検証成功）
 */
export const createValidationResult = (errors: string[] = []): ValidationResult => {
  return {
    isValid: errors.length === 0,
    errors
  };
};

/**
 * 文字列の必須チェック
 * @param value 検証する値
 * @param fieldName フィールド名
 * @returns エラーメッセージ（有効なら空文字）
 */
export const requiredValidator = (value: string, fieldName: string): string => {
  return !value || value.trim() === '' 
    ? `${fieldName}は必須です` 
    : '';
};

/**
 * メールアドレスの形式チェック
 * @param email 検証するメールアドレス
 * @returns エラーメッセージ（有効なら空文字）
 */
export const emailValidator = (email: string): string => {
  return !email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) 
    ? '有効なメールアドレス形式ではありません' 
    : '';
};

/**
 * 最小文字数チェック
 * @param value 検証する値
 * @param min 最小文字数
 * @param fieldName フィールド名
 * @returns エラーメッセージ（有効なら空文字）
 */
export const minLengthValidator = (value: string, min: number, fieldName: string): string => {
  return !value || value.length < min 
    ? `${fieldName}は${min}文字以上である必要があります` 
    : '';
};
