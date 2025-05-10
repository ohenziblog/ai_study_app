import type { Request, Response } from 'express';

const { Router } = require('express');
const answerController = require('../controllers/answerController');
const authMiddleware = require('../middlewares/auth');

const router = Router();

/**
 * @route POST /answers
 * @desc 問題への回答を記録する（自由回答式）
 */
router.post('/', authMiddleware, answerController.recordAnswer);

/**
 * @route POST /answers/multiple-choice
 * @desc 選択肢付き問題への回答を記録する
 */
router.post('/multiple-choice', authMiddleware, answerController.recordMultipleChoiceAnswer);

module.exports = router;
