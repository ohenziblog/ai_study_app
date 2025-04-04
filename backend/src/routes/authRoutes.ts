import type { Request, Response } from 'express';

const { Router } = require('express');
const authController = require('../controllers/authController');

const router = Router();

/**
 * @route POST /auth/register
 * @desc ユーザー登録
 */
router.post('/register', authController.register);

/**
 * @route POST /auth/login
 * @desc ユーザーログイン
 */
router.post('/login', authController.login);

module.exports = router;
