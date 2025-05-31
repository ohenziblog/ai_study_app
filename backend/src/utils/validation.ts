// shared-typesから型定義をインポート
import { ValidationResult } from '@ai-study-app/shared-types';

// ValidationResult型はshared-typesから使用
export type { ValidationResult } from '@ai-study-app/shared-types';

/**
 * ValidationResultオブジェクトを作成するヘルパー関数
 */
export const createValidationResult = (isValid: boolean, errors: string[] = []): ValidationResult => {
  return { isValid, errors };
};

/**
 * 必須フィールドのバリデーター
 */
export const requiredValidator = (value: any, fieldName: string): ValidationResult => {
  if (!value || (typeof value === 'string' && value.trim() === '')) {
    return createValidationResult(false, [`${fieldName}は必須です`]);
  }
  return createValidationResult(true);
};

/**
 * メールアドレスの形式をチェックする
 */
export const emailValidator = (email: string): ValidationResult => {
  const errors: string[] = [];
  
  if (!email) {
    errors.push('メールアドレスは必須です');
  } else if (!/\S+@\S+\.\S+/.test(email)) {
    errors.push('有効なメールアドレスを入力してください');
  }
  
  return createValidationResult(errors.length === 0, errors);
};

/**
 * 最小文字数をチェックするバリデーター
 */
export const minLengthValidator = (value: string, minLength: number, fieldName: string): ValidationResult => {
  if (!value || value.length < minLength) {
    return createValidationResult(false, [`${fieldName}は${minLength}文字以上で入力してください`]);
  }
  return createValidationResult(true);
};

/**
 * メールアドレスの形式をチェックする（既存の関数）
 */
export const validateEmail = (email: string): ValidationResult => {
  return emailValidator(email);
};

/**
 * パスワードの強度をチェックする
 */
export const validatePassword = (password: string): ValidationResult => {
  const errors: string[] = [];
  
  if (!password) {
    errors.push('パスワードは必須です');
  } else {
    if (password.length < 8) {
      errors.push('パスワードは8文字以上で入力してください');
    }
    if (!/(?=.*[a-z])/.test(password)) {
      errors.push('パスワードには小文字を含めてください');
    }
    if (!/(?=.*[A-Z])/.test(password)) {
      errors.push('パスワードには大文字を含めてください');
    }
    if (!/(?=.*\d)/.test(password)) {
      errors.push('パスワードには数字を含めてください');
    }
  }
  
  return createValidationResult(errors.length === 0, errors);
};
