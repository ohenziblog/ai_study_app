import axios from 'axios';
import crypto from 'crypto';
// 設定を正しく読み込む
const config = require('../../config/env');
// CommonJSスタイルでエクスポートされたloggerを正しく読み込む
const logger = require('../../utils/logger').default;

// モジュールレベルの定数として設定値を保存
const DEEPSEEK_API_KEY = config.DEEPSEEK_API_KEY;
const DEEPSEEK_API_ENDPOINT = config.DEEPSEEK_API_ENDPOINT || 'https://api.deepseek.com/v1/chat/completions';

/**
 * キャッシュマップの管理とキャッシュ処理を行うユーティリティ関数
 * @param cacheName グローバルに保存するキャッシュの名前
 * @param key キャッシュのキー
 * @param maxSize キャッシュの最大サイズ
 * @param fallbackFn キャッシュミス時に実行する関数
 * @returns キャッシュされた値またはfallbackFnの結果
 */
const getOrSetCache = async (cacheName: string, key: string, maxSize: number, fallbackFn: () => Promise<string> | string): Promise<string> => {
  // グローバルキャッシュの取得または初期化
  const cache = (global as any)[cacheName] || new Map();
  (global as any)[cacheName] = cache;
  
  // キャッシュにあればそれを返す
  if (cache.has(key)) {
    logger.debug(`${cacheName}をキャッシュから取得しました`);
    return cache.get(key);
  }
  
  // キャッシュミスの場合、渡された関数を実行
  const result = await fallbackFn();
  
  // キャッシュに保存（最大サイズに制限）
  if (cache.size >= maxSize) {
    // 最初のキーを削除（FIFO）
    const firstKey = cache.keys().next().value;
    cache.delete(firstKey);
  }
  cache.set(key, result);
  
  return result;
};

/**
 * DeepSeek AIサービス
 * 問題生成、問題要約、抽象ハッシュ生成などの機能を提供
 */
const deepseekService = {
  /**
   * AIを使用して問題を生成する
   * @param category カテゴリ情報
   * @param skill スキル情報
   * @param targetDifficulty 目標難易度（0-5のスケール）
   * @param recentSummaries 最近の問題の要約リスト
   * @param structuredKeywords 中期の問題のカテゴリ別キーワード
   * @param olderKeywords 古い問題のキーワード
   * @returns 生成された問題
   */
  generateQuestion: async (
    category: any,
    skill: any,
    targetDifficulty: number,
    recentSummaries: Array<{ text: string, category: string }>,
    structuredKeywords: Record<string, string[]>,
    olderKeywords: string[]
  ) => {
    try {
      // AIがアクセス可能なAPIエンドポイントがない場合は開発用生成ロジックを使用
      if (!DEEPSEEK_API_KEY) {
        return deepseekService.mockGenerateQuestion(category, skill, targetDifficulty);
      }

      // DeepSeek APIエンドポイント（適切なエンドポイントに変更してください）
      const apiEndpoint = DEEPSEEK_API_ENDPOINT;
      
      // 類似問題を避けるためのコンテキストを構築
      const avoidanceContext = deepseekService.buildAvoidanceContext(
        recentSummaries,
        structuredKeywords,
        olderKeywords
      );

      // AIへのプロンプト構築
      const prompt = `
あなたは教育AIアシスタントです。以下の条件に基づいて、教育的な問題を生成してください。

## 基本情報
- カテゴリ: ${category.category_name}
- スキル: ${skill.skill_name}
- 難易度: ${targetDifficulty}/5（0が最も簡単、5が最も難しい）

## 問題の要件
- 4つの選択肢を持つ多肢選択問題を作成してください
- 各選択肢は明確に区別でき、1つだけが正解であること
- 問題文は明確で、学習者の理解度を測定できるものであること
- 詳細な解説を含めること
- 適切な難易度を保つこと

## 既存の問題との重複を避けるための情報
${avoidanceContext}

## 出力形式
以下の形式で出力してください：
{
  "question": "問題文をここに記述",
  "options": ["選択肢1", "選択肢2", "選択肢3", "選択肢4"],
  "correctAnswerIndex": 正解の選択肢のインデックス（0-3）,
  "explanation": "解説文をここに記述",
  "difficulty": 実際の難易度（0-5のスケール）
}
`;

      // DeepSeek APIリクエスト
      const response = await axios.post(
        apiEndpoint,
        {
          model: "deepseek-chat",
          messages: [
            {
              role: "user",
              content: prompt
            }
          ],
          temperature: 0.7,
          max_tokens: 1000
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${DEEPSEEK_API_KEY}`
          }
        }
      );

      // レスポンスからJSONを抽出（通常はresponse.data.choices[0].message.contentなど）
      const aiResponse = response.data.choices[0].message.content;
      
      // JSON文字列を抽出（余計なテキストがある場合）
      const jsonMatch = aiResponse.match(/\{[\s\S]*\}/);
      const jsonStr = jsonMatch ? jsonMatch[0] : aiResponse;
      
      // JSONをパース
      const questionData = JSON.parse(jsonStr);
      
      // ハッシュを生成
      const hash = crypto.createHash('sha256')
        .update(questionData.question + JSON.stringify(questionData.options))
        .digest('hex');
      
      return {
        ...questionData,
        hash
      };
    } catch (error) {
      logger.error(`問題生成中にエラーが発生しました: ${error}`);
      
      // エラー時はモック問題生成にフォールバック
      return deepseekService.mockGenerateQuestion(category, skill, targetDifficulty);
    }
  },

  /**
   * 類似問題回避のためのコンテキストを構築
   * @param recentSummaries 最近の問題の要約リスト
   * @param structuredKeywords 中期の問題のカテゴリ別キーワード
   * @param olderKeywords 古い問題のキーワード
   * @returns 構築されたコンテキスト文字列
   */
  buildAvoidanceContext: (
    recentSummaries: Array<{ text: string, category: string }>,
    structuredKeywords: Record<string, string[]>,
    olderKeywords: string[]
  ): string => {
    let context = '### 最近出題した問題（これらとは異なる問題を作成してください）:\n';
    
    // 最近の問題要約
    if (recentSummaries.length > 0) {
      recentSummaries.forEach((summary, index) => {
        context += `${index + 1}. [${summary.category}] ${summary.text}\n`;
      });
    } else {
      context += 'なし\n';
    }
    
    // 中期の問題のキーワード（カテゴリ別）
    context += '\n### 最近出題した問題のコンセプト（これらの組み合わせは避けてください）:\n';
    if (Object.keys(structuredKeywords).length > 0) {
      for (const [category, keywords] of Object.entries(structuredKeywords)) {
        if (keywords.length > 0) {
          context += `- ${category}: ${keywords.join(', ')}\n`;
        }
      }
    } else {
      context += 'なし\n';
    }
    
    // 古い問題のキーワード
    context += '\n### 過去に出題した問題のトピック（これらを組み合わせた問題は避けてください）:\n';
    if (olderKeywords.length > 0) {
      context += olderKeywords.join(', ');
    } else {
      context += 'なし';
    }
    
    return context;
  },

  /**
   * 問題の簡潔な要約を生成（次回以降の類似問題回避に使用）
   * @param questionText 問題文
   * @param options 選択肢
   * @returns 問題の簡潔な要約
   */
  generateQuestionSummary: async (questionText: string, options: string[]): Promise<string> => {
    try {
      // キャッシュキーを生成（問題文と選択肢のハッシュ）
      const cacheKey = crypto.createHash('md5')
        .update(questionText + JSON.stringify(options))
        .digest('hex');
      
      // キャッシュ処理をユーティリティ関数に委譲
      return await getOrSetCache(
        'summaryCache',
        cacheKey,
        1000,
        async () => {
          // AIがアクセス可能なAPIエンドポイントがない場合は簡易要約を返す
          if (!DEEPSEEK_API_KEY) {
            return deepseekService.createSimpleSummary(questionText);
          }

          const apiEndpoint = DEEPSEEK_API_ENDPOINT;
          
          const prompt = `
以下の問題文と選択肢を30文字以内で要約してください。主要なトピックと問われている内容を簡潔に表現してください。

## 問題
${questionText}

## 選択肢
${options.join('\n')}

## 要求
- 30文字以内の簡潔な要約
- 問題の主要トピックと問われている内容を含める
- 簡潔かつ具体的に
`;

          const response = await axios.post(
            apiEndpoint,
            {
              model: "deepseek-chat",
              messages: [{ role: "user", content: prompt }],
              temperature: 0.3,
              max_tokens: 100
            },
            {
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${DEEPSEEK_API_KEY}`
              }
            }
          );

          // レスポンスから要約を取得
          let summary = response.data.choices[0].message.content.trim();
          
          // 30文字に制限
          if (summary.length > 30) {
            summary = summary.substring(0, 27) + '...';
          }
          
          return summary;
        }
      );
    } catch (error) {
      logger.error(`問題要約生成中にエラーが発生しました: ${error}`);
      return deepseekService.createSimpleSummary(questionText);
    }
  },

  /**
   * 問題のコンセプトキーワードを含む抽象化ハッシュを生成
   * @param questionText 問題文
   * @param options 選択肢
   * @returns コンセプトキーワードのカンマ区切り文字列
   */
  generateAbstractHash: async (questionText: string, options: string[]): Promise<string> => {
    try {
      // キャッシュキーを生成（問題文と選択肢のハッシュ）
      const cacheKey = crypto.createHash('md5')
        .update(questionText + JSON.stringify(options))
        .digest('hex');
      
      // キャッシュ処理をユーティリティ関数に委譲
      return await getOrSetCache(
        'hashCache',
        cacheKey,
        1000,
        async () => {
          // AIがアクセス可能なAPIエンドポイントがない場合は簡易要約を返す
          if (!DEEPSEEK_API_KEY) {
            return deepseekService.createSimpleAbstractHash(questionText);
          }

          const apiEndpoint = DEEPSEEK_API_ENDPOINT;
          
          const prompt = `
以下の問題から主要なコンセプトとキーワードを3〜5個抽出し、カンマ区切りで出力してください。これらのキーワードは問題の本質を表し、類似問題を特定するために使用されます。

## 問題
${questionText}

## 選択肢
${options.join('\n')}

## 要求
- 3〜5個の主要コンセプトとキーワードを抽出
- カンマ区切りで出力
- 一般的すぎる言葉は避け、問題の本質を表す具体的な用語を使用
- 例: "二次方程式,解の公式,判別式"

## 出力形式
キーワード1,キーワード2,キーワード3
`;

          const response = await axios.post(
            apiEndpoint,
            {
              model: "deepseek-chat",
              messages: [{ role: "user", content: prompt }],
              temperature: 0.3,
              max_tokens: 100
            },
            {
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${DEEPSEEK_API_KEY}`
              }
            }
          );

          // レスポンスからキーワードを取得
          return response.data.choices[0].message.content.trim();
        }
      );
    } catch (error) {
      logger.error(`問題の抽象ハッシュ生成中にエラーが発生しました: ${error}`);
      return deepseekService.createSimpleAbstractHash(questionText);
    }
  },

  /**
   * 問題テキストから簡易的な要約を作成する（AIサービスが利用できない場合のフォールバック）
   * @param questionText 問題文
   * @returns 簡易的な要約
   */
  createSimpleSummary: (questionText: string): string => {
    // 問題文の最初の30文字を取得（または全体が30文字未満ならそのまま）
    const words = questionText.split(/\s+/);
    let summary = words.slice(0, 5).join(' ');
    
    if (summary.length > 30) {
      summary = summary.substring(0, 27) + '...';
    }
    
    return summary;
  },

  /**
   * 問題テキストから簡易的な抽象ハッシュを作成する（AIサービスが利用できない場合のフォールバック）
   * @param questionText 問題文
   * @returns 簡易的な抽象ハッシュ
   */
  createSimpleAbstractHash: (questionText: string): string => {
    // 重要そうな単語を抽出（英数字を含む2文字以上の単語）
    const words = questionText
      .replace(/[.,?!;:(){}[\]<>]/g, ' ')
      .split(/\s+/)
      .filter(word => word.length > 2)
      // ストップワードを除外
      .filter(word => !['the', 'and', 'that', 'this', 'for', 'with', 'what', 'which'].includes(word.toLowerCase()));
    
    // 出現頻度をカウント
    const wordCounts = new Map<string, number>();
    words.forEach(word => {
      const lowercaseWord = word.toLowerCase();
      wordCounts.set(lowercaseWord, (wordCounts.get(lowercaseWord) || 0) + 1);
    });
    
    // 出現頻度順にソート
    const sortedWords = Array.from(wordCounts.entries())
      .sort((a, b) => b[1] - a[1])
      .map(entry => entry[0]);
    
    // 上位3-5単語を取得（存在する場合）
    const keywordCount = Math.min(Math.max(3, sortedWords.length), 5);
    const keywords = sortedWords.slice(0, keywordCount);
    
    return keywords.join(',');
  },

  /**
   * モック問題生成（開発用・APIエラー時のフォールバック）
   * @param category カテゴリ情報
   * @param skill スキル情報
   * @param targetDifficulty 目標難易度
   * @returns 生成された問題
   */
  mockGenerateQuestion: (category: any, skill: any, targetDifficulty: number) => {
    // カテゴリとスキルのID情報を確認
    const categoryId = category.categoryId || '不明';
    const skillId = skill.skillId || '不明';
    
    // ランダムな正解選択肢インデックス (0-3)
    const randomCorrectIndex = Math.floor(Math.random() * 4);
    
    // 選択肢のラベル
    const optionLabels = ['A', 'B', 'C', 'D'];
    const correctLetter = optionLabels[randomCorrectIndex];
    
    // 多様なテンプレート問題（問題文に正解を含める）
    const questionTemplates = [
      {
        question: `【開発用モック】【正解:${correctLetter}】【カテゴリID:${categoryId}, スキルID:${skillId}】${category.categoryName}における${skill.skillName}の主要な特徴を選択してください。`,
        options: [
          `A: 理論的枠組みの一貫性と論理的構造`,
          `B: 実践的応用の幅広さと具体的な実装手法`,
          `C: 歴史的発展の特異性と技術的な変遷過程`,
          `D: 概念の抽象度の高さと体系的な分類方法`
        ],
        explanation: `この問題は開発テスト用です。正解選択肢は「${correctLetter}」（インデックス:${randomCorrectIndex}）と明記されています。カテゴリ:${category.categoryName}(ID:${categoryId})、スキル:${skill.skillName}(ID:${skillId})、難易度:${targetDifficulty}/5`
      },
      {
        question: `【デバッグ用】【正解は${correctLetter}】【カテゴリID:${categoryId}, スキルID:${skillId}】${skill.skillName}を理解する上で最も重要な概念を選んでください。`,
        options: [
          `A: 構造的一貫性 - 内部要素間の論理的関連性`,
          `B: 機能的多様性 - 異なる状況での適応能力`,
          `C: 対象領域の特定性 - 応用範囲の明確な境界`,
          `D: 実装の柔軟性 - 様々な環境への適応性`
        ],
        explanation: `開発テスト用問題。問題文に記載のとおり正解は「${correctLetter}」です。この問題はカテゴリ「${category.categoryName}」(ID:${categoryId})のスキル「${skill.skillName}」(ID:${skillId})に関するテスト問題です。難易度:${targetDifficulty}/5`
      },
      {
        question: `【開発テスト】【${correctLetter}が正解】【カテゴリ:${category.categoryName}(ID:${categoryId}), スキル:${skill.skillName}(ID:${skillId})】開発効率を向上させるアプローチはどれですか？`,
        options: [
          `A: 段階的な適用と継続的な検証プロセス`,
          `B: 包括的な理論分析と詳細な計画立案`,
          `C: 反復的な試行錯誤と迅速なフィードバック`,
          `D: 統合的なシステム設計と全体最適化`
        ],
        explanation: `この問題は開発テスト用モックです。問題文に明記されているとおり「${correctLetter}」が正解です。選択肢インデックス:${randomCorrectIndex}、難易度:${targetDifficulty}/5`
      },
      {
        question: `【モックデータ】【正答:${correctLetter}(${randomCorrectIndex})】【カテゴリID:${categoryId}「${category.categoryName}」、スキルID:${skillId}「${skill.skillName}」】次の選択肢から「${correctLetter}」を選んでください。`,
        options: [
          `A: プロジェクト初期段階での適用（これが正解なら「A」を選択）`,
          `B: 既存システムの最適化（これが正解なら「B」を選択）`,
          `C: チーム開発における標準化（これが正解なら「C」を選択）`,
          `D: システム全体のアーキテクチャ（これが正解なら「D」を選択）`
        ],
        explanation: `開発用モックデータです。正解は問題文と選択肢に記載のとおり「${correctLetter}」（インデックス:${randomCorrectIndex}）です。カテゴリID:${categoryId}、スキルID:${skillId}、難易度:${targetDifficulty}/5`
      }
    ];
    
    // ランダムにテンプレートを選択
    const templateIndex = Math.floor(Math.random() * questionTemplates.length);
    const template = questionTemplates[templateIndex];
    
    // 選択されたテンプレートに対して、ランダムな正解インデックスを設定
    let adjustedTemplate = { ...template };
    
    // 難易度に基づいて問題文を調整（難易度情報も問題文に含める）
    if (targetDifficulty > 3) {
      // 難しい問題にするための調整（詳細な文脈を追加）
      adjustedTemplate.question = `【高難度:${targetDifficulty}/5】【正解:${correctLetter}】【カテゴリID:${categoryId}, スキルID:${skillId}】${category.categoryName}の高度な実践における${skill.skillName}の要素として、選択肢「${correctLetter}」を選んでください。`;
    } else if (targetDifficulty < 2) {
      // 簡単な問題にするための調整（シンプルな言い回しに）
      adjustedTemplate.question = `【初級:${targetDifficulty}/5】【正解:${correctLetter}】【カテゴリID:${categoryId}, スキルID:${skillId}】${category.categoryName}における${skill.skillName}について、選択肢「${correctLetter}」を選んでください。`;
    }
    
    // ハッシュを生成
    const hash = crypto.createHash('sha256')
      .update(adjustedTemplate.question + JSON.stringify(adjustedTemplate.options))
      .digest('hex');
    
    return {
      hash,
      question: adjustedTemplate.question,
      options: adjustedTemplate.options,
      correctAnswerIndex: randomCorrectIndex, // ランダムな正解インデックスを使用
      explanation: adjustedTemplate.explanation,
      difficulty: targetDifficulty
    };
  },
};

module.exports = deepseekService;