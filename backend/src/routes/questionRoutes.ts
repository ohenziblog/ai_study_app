import type { Request, Response } from 'express';

const { Router } = require('express');
const questionController = require('../controllers/questionController');
const authMiddleware = require('../middlewares/auth');

const router = Router();

/**
 * @route GET /questions
 * @desc 新しい問題を取得する
 */
router.get('/', authMiddleware, questionController.getQuestion);

/**
 * @route GET /questions/history
 * @desc ユーザーの最近の問題履歴を取得する
 */
router.get('/history', authMiddleware, questionController.getQuestionHistory);

module.exports = router;
