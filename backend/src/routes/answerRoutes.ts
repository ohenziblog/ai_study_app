import type { Request, Response } from 'express';

const { Router } = require('express');
const answerController = require('../controllers/answerController');
const authMiddleware = require('../middlewares/auth');

const router = Router();

/**
 * @route POST /answers
 * @desc 問題への回答を記録する
 */
router.post('/', authMiddleware, answerController.recordAnswer);

module.exports = router;
