import type { Request, Response } from 'express';
import type { AuthRequest } from '../types/express';

const { Router } = require('express');
const skillController = require('../controllers/skillController');
const authMiddleware = require('../middlewares/auth');

const router = Router();

/**
 * @route GET /skills
 * @desc すべてのスキルを取得
 * @access Public - 認証不要
 */
router.get('/', skillController.getAllSkills);

/**
 * @route GET /skills/category/:categoryId
 * @desc 特定のカテゴリーに属するスキルを取得
 * @access Public - 認証不要
 */
router.get('/category/:categoryId', skillController.getSkillsByCategory);

/**
 * @route GET /skills/:id
 * @desc 特定のスキルを取得
 * @access Public - 認証不要
 */
router.get('/:id', skillController.getSkillById);

// 以下は認証が必要な管理者向けAPIのため、authMiddlewareを適用

/**
 * @route POST /skills
 * @desc 新しいスキルを作成（管理者用）
 * @access Private - 認証必要
 */
router.post('/', authMiddleware, skillController.createSkill);

/**
 * @route PUT /skills/:id
 * @desc スキルを更新（管理者用）
 * @access Private - 認証必要
 */
router.put('/:id', authMiddleware, skillController.updateSkill);

/**
 * @route DELETE /skills/:id
 * @desc スキルを削除（管理者用）
 * @access Private - 認証必要
 */
router.delete('/:id', authMiddleware, skillController.deleteSkill);

module.exports = router;
