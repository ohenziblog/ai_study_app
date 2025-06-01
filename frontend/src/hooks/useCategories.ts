import { useQuery, UseQueryResult } from '@tanstack/react-query';
import { categoryApi } from '../api/categories';
import type { Category, Skill } from '@ai-study-app/shared-types';
import logger from '../utils/logger';

/**
 * すべての教科（カテゴリー）を取得するカスタムフック
 * 
 * @returns UseQueryResult - データ取得状態を含むオブジェクト
 * - data: 取得したカテゴリー配列（未取得時はundefined）
 * - isLoading: 読み込み中かどうか
 * - error: エラー情報（エラーがない場合はnull）
 * - その他React Queryが提供する値
 */
export const useCategories = (): UseQueryResult<Category[], Error> => {
  return useQuery<Category[], Error>({
    queryKey: ['categories'],
    queryFn: async () => {
      try {
        logger.debug('カテゴリー一覧を取得中...');
        const categories = await categoryApi.getAllCategories();
        logger.debug(`${categories.length}件のカテゴリーを取得しました`);
        return categories;
      } catch (error) {
        logger.error(`カテゴリー一覧の取得に失敗しました: ${error instanceof Error ? error.message : String(error)}`, { notify: false });
        throw error;
      }
    },
    staleTime: 5 * 60 * 1000, // 5分間キャッシュを利用
    retry: 2, // エラー時に2回まで再試行
  });
};

/**
 * 特定のカテゴリーと関連するスキルを取得するカスタムフック
 * 
 * @param categoryId - 取得したいカテゴリーのID
 * @returns UseQueryResult - データ取得状態を含むオブジェクト
 */
export const useCategoryWithSkills = (categoryId: number | undefined): UseQueryResult<{
  category: Category;
  skills: Skill[];
} | undefined, Error> => {
  return useQuery({
    queryKey: ['category', categoryId, 'skills'],
    queryFn: async () => {
      if (!categoryId) {
        logger.error('カテゴリーIDが指定されていません');
        return Promise.reject('カテゴリーIDが指定されていません');
      }
      
      try {
        logger.debug(`カテゴリーID: ${categoryId} のスキル情報を取得中...`);
        const result = await categoryApi.getCategorySkills(categoryId);
        logger.debug(`カテゴリー「${result.category.name}」のスキル ${result.skills.length}件を取得しました`);
        return result;
      } catch (error) {
        logger.error(`カテゴリーID: ${categoryId} のスキル情報取得に失敗しました: ${error instanceof Error ? error.message : String(error)}`, { notify: false });
      }
    },
    enabled: !!categoryId, // categoryIdが存在する場合のみクエリを実行
    staleTime: 5 * 60 * 1000, // 5分間キャッシュを利用
    retry: 1, // エラー時に1回だけ再試行
  });
};