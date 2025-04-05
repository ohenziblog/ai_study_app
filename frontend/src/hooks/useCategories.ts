import { useQuery, UseQueryResult } from '@tanstack/react-query';
import { categoryApi } from '../api/categories';
import type { Category, ApiResponse } from '../types/api';

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
    queryFn: () => categoryApi.getAllCategories(),
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
  skills: Array<{
    id: number;
    name: string;
    description: string;
    category_id: number;
    difficulty: number;
  }>;
}, Error> => {
  return useQuery({
    queryKey: ['category', categoryId, 'skills'],
    queryFn: () => categoryId ? categoryApi.getCategorySkills(categoryId) : Promise.reject('カテゴリーIDが指定されていません'),
    enabled: !!categoryId, // categoryIdが存在する場合のみクエリを実行
    staleTime: 5 * 60 * 1000, // 5分間キャッシュを利用
    retry: 1, // エラー時に1回だけ再試行
  });
};
