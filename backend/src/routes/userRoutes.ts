// 型定義のみをインポート
import type { Request, Response } from 'express';

const { Router } = require('express');
const userController = require('../controllers/userController');

const router = Router();

/**
 * @route GET /users
 * @desc ユーザー一覧を取得
 */
router.get('/', userController.getAllUsers);

/**
 * @route GET /users/skill-levels
 * @desc ユーザーのスキルレベルを取得
 * @param {string} userId - クエリパラメータでユーザーのIDを指定
 */
router.get('/skill-levels', userController.getUserSkillLevels);

/**
 * @route GET /users/:id
 * @desc 指定されたIDのユーザーを取得
 */
router.get('/:id', userController.getUserById);

/**
 * @route POST /users
 * @desc 新しいユーザーを作成
 */
router.post('/', userController.createUser);

/**
 * @route PUT /users/:id
 * @desc 指定されたIDのユーザーを更新
 */
router.put('/:id', userController.updateUser);

/**
 * @route DELETE /users/:id
 * @desc 指定されたIDのユーザーを削除
 */
router.delete('/:id', userController.deleteUser);

module.exports = router;
