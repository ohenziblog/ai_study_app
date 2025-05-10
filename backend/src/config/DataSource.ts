// モジュールとして認識させるための空のエクスポート宣言
export {};

// 環境変数の初期化を共通モジュールから行う
require('./env');
const { DataSource } = require('typeorm');
const path = require('path');
const { SnakeNamingStrategy } = require('typeorm-naming-strategies');

const { User } = require('../models/User');
const { Category } = require('../models/Category');
const { Skill } = require('../models/Skill');
const { UserSkillLevel } = require('../models/UserSkillLevel');
const { RecentQuestion } = require('../models/RecentQuestion');

// AppDataSourceの宣言内の名前は変更せず、エクスポート時に名前空間を提供
const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  username: process.env.DB_USERNAME || 'app_user',
  password: process.env.DB_PASSWORD || 'secure_password',
  database: process.env.DB_DATABASE || 'ai_learning_app',
  synchronize: false,
  logging: process.env.NODE_ENV !== 'production',
  entities: [User, Category, Skill, UserSkillLevel, RecentQuestion],
  migrations: [path.join(__dirname, '../migrations/**/*.{js,ts}')],
  subscribers: [],
  ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false,
  // キャッシュを無効化して常に最新のメタデータを使用
  cache: false,
  // 公式のSnakeNamingStrategyを使用
  namingStrategy: new SnakeNamingStrategy()
});

// モジュールとして明示的にエクスポート
module.exports = { AppDataSource };
