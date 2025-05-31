// shared-typesから型定義をインポート
import { UserEntity, AuthAPI } from '@ai-study-app/shared-types';
export * from '@ai-study-app/shared-types';

// 既存のコードとの互換性のために型を再エクスポート
export type {
  UserEntity,
  AuthAPI
} from '@ai-study-app/shared-types';

// 既存のコードで使用されている型のエイリアス
export type User = UserEntity.User;
export type CreateUserDto = UserEntity.CreateUserDto;
export type UpdateUserDto = UserEntity.UpdateUserDto;
export type SafeUser = UserEntity.SafeUser;
export type RegisterDTO = AuthAPI.RegisterDTO;
