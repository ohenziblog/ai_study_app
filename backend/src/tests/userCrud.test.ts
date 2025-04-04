require('reflect-metadata');
// 変数名を変更して衝突を避ける
const { AppDataSource: dataSource } = require('../config/DataSource');
const { User: UserEntity } = require('../models/User');

/**
 * ユーザーCRUD操作のテスト関数
 */
async function testUserCrudOperations() {
  console.log('--- ユーザーCRUD操作テスト開始 ---');

  try {
    // データベース接続の初期化
    await dataSource.initialize();
    console.log('データベース接続に成功しました');

    const userRepository = dataSource.getRepository(UserEntity);
    
    // 1. ユーザーの作成
    console.log('\n1. 新規ユーザーを作成します...');
    const newUser = userRepository.create({
      username: 'testuser',
      email: 'test@example.com',
      passwordHash: 'password123', // 実際のアプリでは必ずハッシュ化してください
      firstName: 'Test',
      lastName: 'User',
      isActive: true,
      role: 'student'
    });
    
    const savedUser = await userRepository.save(newUser);
    console.log('ユーザーが作成されました:', savedUser);
    
    // 2. ユーザーの検索
    console.log('\n2. 作成したユーザーを検索します...');
    const foundUser = await userRepository.findOneBy({ user_id: savedUser.user_id });
    console.log('検索結果:', foundUser);
    
    if (!foundUser) {
      throw new Error('ユーザーが見つかりませんでした');
    }
    
    // 3. ユーザーの更新
    console.log('\n3. ユーザーのメールアドレスを更新します...');
    foundUser.email = 'updated@example.com';
    const updatedUser = await userRepository.save(foundUser);
    console.log('更新後のユーザー:', updatedUser);
    
    // 更新の確認
    const confirmedUser = await userRepository.findOneBy({ user_id: savedUser.user_id });
    console.log('更新の確認:', confirmedUser);
    
    // 4. ユーザーの削除
    console.log('\n4. ユーザーを削除します...');
    await userRepository.remove(updatedUser);
    console.log('ユーザーが削除されました');
    
    // 削除の確認
    const deletedUser = await userRepository.findOneBy({ user_id: savedUser.user_id });
    console.log('削除の確認 (nullであるべき):', deletedUser);
    
    console.log('\n--- すべてのCRUD操作が正常に完了しました ---');
  } catch (error) {
    console.error('テスト中にエラーが発生しました:', error);
  } finally {
    // データベース接続のクローズ
    await dataSource.destroy();
    console.log('データベース接続を閉じました');
  }
}

// テストの実行
testUserCrudOperations()
  .then(() => process.exit(0))
  .catch(error => {
    console.error('予期しないエラーが発生しました:', error);
    process.exit(1);
  });
