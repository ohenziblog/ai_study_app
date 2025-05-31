import { ValidationResult, createValidationResult, requiredValidator, emailValidator, minLengthValidator } from '../utils/validation';
import type { RegisterDTO } from '../types/User';

/**
 * ログインリクエスト
 */
export interface LoginRequestDTO {
  email: string;
  password: string;
}

/**
 * ユーザー登録リクエストの検証
 * @param data リクエストデータ
 */
export const validateRegisterRequest = (data: Partial<RegisterDTO>): ValidationResult => {
  const errors: string[] = [];
  
  // 必須項目チェック
  const usernameValidation = requiredValidator(data.username || '', 'ユーザー名');
  const emailValidation = requiredValidator(data.email || '', 'メールアドレス');
  const passwordValidation = requiredValidator(data.password || '', 'パスワード');
  
  if (!usernameValidation.isValid) errors.push(...usernameValidation.errors);
  if (!emailValidation.isValid) errors.push(...emailValidation.errors);
  if (!passwordValidation.isValid) errors.push(...passwordValidation.errors);
  
  // 形式チェック
  if (data.email && emailValidation.isValid) {
    const emailFormatValidation = emailValidator(data.email);
    if (!emailFormatValidation.isValid) errors.push(...emailFormatValidation.errors);
  }
  
  // パスワード長チェック
  if (data.password && passwordValidation.isValid) {
    const passwordLengthValidation = minLengthValidator(data.password, 8, 'パスワード');
    if (!passwordLengthValidation.isValid) errors.push(...passwordLengthValidation.errors);
  }
  
  return createValidationResult(errors.length === 0, errors);
};

/**
 * ログインリクエストの検証
 * @param data リクエストデータ
 */
export const validateLoginRequest = (data: Partial<LoginRequestDTO>): ValidationResult => {
  const errors: string[] = [];
  
  // 必須項目チェック
  const emailValidation = requiredValidator(data.email || '', 'メールアドレス');
  const passwordValidation = requiredValidator(data.password || '', 'パスワード');
  
  if (!emailValidation.isValid) errors.push(...emailValidation.errors);
  if (!passwordValidation.isValid) errors.push(...passwordValidation.errors);
  
  return createValidationResult(errors.length === 0, errors);
};
