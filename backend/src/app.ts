// src/app.ts
// 環境変数の初期化を共通モジュールから行う
require('./config/env');
// 型定義のみをインポート
import type { Request, Response, NextFunction } from 'express';

const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
require('reflect-metadata');

// ルーターのインポート
const userRoutes = require('./routes/userRoutes');
const authRoutes = require('./routes/authRoutes');
const questionRoutes = require('./routes/questionRoutes');
const answerRoutes = require('./routes/answerRoutes');
const categoryRoutes = require('./routes/categoryRoutes');
const skillRoutes = require('./routes/skillRoutes');

// Expressアプリケーションを初期化
const app = express();

// === 🌐 ミドルウェア定義 ===
app.use(cors({ origin: 'http://localhost:5173' }));
app.use(express.json());
app.use(morgan('dev')); // リクエストログ出力

// === 📌 ルーティング登録 ===
app.use('/users', userRoutes);
app.use('/auth', authRoutes);
app.use('/questions', questionRoutes);
app.use('/answers', answerRoutes);
app.use('/categories', categoryRoutes);
app.use('/skills', skillRoutes);

// === ✅ ヘルスチェックなど共通ルート ===
app.get('/', (req: Request, res: Response) => {
  res.json({ message: 'AI学習アプリのAPIサーバーへようこそ！' });
});

// === 🚧 エラーハンドリング（将来JWT認証エラーなどに備える）===
app.use((err: Error, req: Request, res: Response, _next: NextFunction) => {
  console.error(err.stack);
  res.status(500).json({ error: err.message });
});

module.exports = app;
