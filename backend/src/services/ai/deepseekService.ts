import axios from 'axios';
import crypto from 'crypto';
// dotenvの設定を読み込む（configオブジェクトをインポートするのではなく）
require('../../config/env');
// CommonJSスタイルでエクスポートされたloggerを正しく読み込む
const logger = require('../../utils/logger').default;

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
      if (!process.env.DEEPSEEK_API_KEY) {
        return deepseekService.mockGenerateQuestion(category, skill, targetDifficulty);
      }

      // DeepSeek APIエンドポイント（適切なエンドポイントに変更してください）
      const apiEndpoint = process.env.DEEPSEEK_API_ENDPOINT || 'https://api.deepseek.com/v1/chat/completions';
      
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
            'Authorization': `Bearer ${process.env.DEEPSEEK_API_KEY}`
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
          if (!process.env.DEEPSEEK_API_KEY) {
            return deepseekService.createSimpleSummary(questionText);
          }

          const apiEndpoint = process.env.DEEPSEEK_API_ENDPOINT || 'https://api.deepseek.com/v1/chat/completions';
          
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
                'Authorization': `Bearer ${process.env.DEEPSEEK_API_KEY}`
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
          // AIがアクセス可能なAPIエンドポイントがない場合は簡易ハッシュを返す
          if (!process.env.DEEPSEEK_API_KEY) {
            return deepseekService.createSimpleAbstractHash(questionText);
          }

          const apiEndpoint = process.env.DEEPSEEK_API_ENDPOINT || 'https://api.deepseek.com/v1/chat/completions';
          
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
                'Authorization': `Bearer ${process.env.DEEPSEEK_API_KEY}`
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
    // カテゴリとスキルに基づいたテンプレート問題のセット
    const questionTemplates = [
      {
        question: `${category.category_name}の分野において、${skill.skill_name}の主要な特徴は次のうちどれですか？`,
        options: [
          `理論的枠組みの一貫性`,
          `実践的応用の幅広さ`,
          `歴史的発展の特異性`,
          `概念の抽象度の高さ`
        ],
        correctAnswerIndex: 1,
        explanation: `${skill.skill_name}は、その理論的基盤よりも実践的な応用範囲の広さが特徴的です。様々な実務的な状況で活用されることで、その有用性が証明されています。`
      },
      {
        question: `${skill.skill_name}を理解する上で最も重要な概念は何ですか？`,
        options: [
          `構造的一貫性`,
          `機能的多様性`,
          `対象領域の特定性`,
          `適用範囲の柔軟性`
        ],
        correctAnswerIndex: 3,
        explanation: `${skill.skill_name}の最も重要な側面は、様々な状況に柔軟に適用できる点です。この適用範囲の柔軟性によって、異なる問題設定においても効果的に活用できます。`
      },
      {
        question: `${category.category_name}における${skill.skill_name}の応用で、最も効果的なアプローチは次のうちどれですか？`,
        options: [
          `段階的な適用と検証`,
          `包括的な理論分析`,
          `反復的な試行錯誤`,
          `統合的なシステム設計`
        ],
        correctAnswerIndex: 0,
        explanation: `${skill.skill_name}を${category.category_name}に応用する際は、段階的なアプローチが最も効果的です。各段階での適用結果を検証しながら進めることで、最適な結果を得ることができます。`
      }
    ];
    
    // ランダムにテンプレートを選択
    const template = questionTemplates[Math.floor(Math.random() * questionTemplates.length)];
    
    // 難易度に基づいてテンプレートを調整
    let adjustedTemplate = { ...template };
    if (targetDifficulty > 3) {
      // 難しい問題にするための調整
      adjustedTemplate.question = `${category.category_name}の高度な視点から見た場合、${skill.skill_name}における最も本質的な要素は次のうちどれですか？`;
    } else if (targetDifficulty < 2) {
      // 簡単な問題にするための調整
      adjustedTemplate.question = `${category.category_name}の基本として、${skill.skill_name}の主な目的は次のうちどれですか？`;
    }
    
    // ハッシュを生成
    const hash = crypto.createHash('sha256')
      .update(adjustedTemplate.question + JSON.stringify(adjustedTemplate.options))
      .digest('hex');
    
    return {
      hash,
      question: adjustedTemplate.question,
      options: adjustedTemplate.options,
      correctAnswerIndex: adjustedTemplate.correctAnswerIndex,
      explanation: adjustedTemplate.explanation,
      difficulty: targetDifficulty
    };
  },
};

module.exports = deepseekService;