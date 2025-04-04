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
  const usernameError = requiredValidator(data.username || '', 'ユーザー名');
  const emailError = requiredValidator(data.email || '', 'メールアドレス');
  const passwordError = requiredValidator(data.password || '', 'パスワード');
  
  if (usernameError) errors.push(usernameError);
  if (emailError) errors.push(emailError);
  if (passwordError) errors.push(passwordError);
  
  // 形式チェック
  if (data.email && !emailError) {
    const emailFormatError = emailValidator(data.email);
    if (emailFormatError) errors.push(emailFormatError);
  }
  
  // パスワード長チェック
  if (data.password && !passwordError) {
    const passwordLengthError = minLengthValidator(data.password, 8, 'パスワード');
    if (passwordLengthError) errors.push(passwordLengthError);
  }
  
  return createValidationResult(errors);
};

/**
 * ログインリクエストの検証
 * @param data リクエストデータ
 */
export const validateLoginRequest = (data: Partial<LoginRequestDTO>): ValidationResult => {
  const errors: string[] = [];
  
  // 必須項目チェック
  const emailError = requiredValidator(data.email || '', 'メールアドレス');
  const passwordError = requiredValidator(data.password || '', 'パスワード');
  
  if (emailError) errors.push(emailError);
  if (passwordError) errors.push(passwordError);
  
  return createValidationResult(errors);
};
