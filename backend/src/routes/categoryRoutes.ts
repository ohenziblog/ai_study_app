import type { Request, Response } from 'express';
import type { AuthRequest } from '../types/express';

const { Router } = require('express');
const categoryController = require('../controllers/categoryController');
const authMiddleware = require('../middlewares/auth');

const router = Router();

/**
 * @route GET /categories
 * @desc すべてのカテゴリー（教科）を取得
 * @access Public - 認証不要
 */
router.get('/', categoryController.getAllCategories);

/**
 * @route GET /categories/:id
 * @desc 特定のカテゴリー（教科）を取得
 * @access Public - 認証不要
 */
router.get('/:id', categoryController.getCategoryById);

/**
 * @route GET /categories/:id/skills
 * @desc 特定のカテゴリーに属するスキル一覧を取得
 * @access Public - 認証不要
 */
router.get('/:id/skills', categoryController.getCategorySkills);

// 以下は認証が必要な管理者向けAPIのため、authMiddlewareを適用

/**
 * @route POST /categories
 * @desc 新しいカテゴリーを作成（管理者用）
 * @access Private - 認証必要
 */
router.post('/', authMiddleware, categoryController.createCategory);

/**
 * @route PUT /categories/:id
 * @desc カテゴリーを更新（管理者用）
 * @access Private - 認証必要
 */
router.put('/:id', authMiddleware, categoryController.updateCategory);

/**
 * @route DELETE /categories/:id
 * @desc カテゴリーを削除（管理者用）
 * @access Private - 認証必要
 */
router.delete('/:id', authMiddleware, categoryController.deleteCategory);

module.exports = router;
