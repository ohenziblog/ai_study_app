import { useNavigate } from 'react-router-dom';
import { useCategories } from '../../hooks/useCategories';
import { Card } from '../../components/common/Card';

export const SubjectList = () => {
  const { data: categories, isLoading, error } = useCategories();
  const navigate = useNavigate();

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
        <p>教科情報の取得に失敗しました: {error.message}</p>
      </div>
    );
  }

  // 重複を除去する処理を追加
  const uniqueCategories = categories?.reduce<typeof categories>((acc, current) => {
    // すでに同じ名前のカテゴリーが追加されているか確認
    const isDuplicate = acc?.find((item) => item.name === current.name);
    
    // 重複していない場合のみaccに追加
    // 重複している場合は、より詳細な説明のあるエントリを優先
    if (!isDuplicate) {
      acc?.push(current);
    } else if (current.description.length > isDuplicate.description.length) {
      // 既存のエントリのインデックスを見つけて置き換え
      const index = acc?.findIndex((item) => item.name === current.name);
      if (index !== undefined && index >= 0) {
        acc![index] = current;
      }
    }
    return acc;
  }, []);

  return (
    <div className="w-full -w-screen-md mx-auto px-4">
      <div className="mb-12 text-center">
        <h1 className="flex justify-center text-3xl font-bold text-gray-800 mb-4">学習教科一覧</h1>
        <div className="w-24 h-1 bg-primary mx-auto mb-6 rounded-full"></div>
        <p className="text-gray-600 -w-2xl mx-auto px-4">
          学習したい教科を選択してください。各教科には専門的なスキルが含まれています。
        </p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {uniqueCategories?.map((category) => (
          <Card
            key={category.id}
            title={category.name}
            className="h-full"
            onClick={() => navigate(`/subjects/${category.id}`)}
          >
            <p className="text-gray-600 mb-6 leading-relaxed">{category.description}</p>
            <div className="mt-auto flex justify-end border-t pt-4 mt-4">
              <button
                className="text-primary hover:text-primary-dark font-medium flex items-center 
                          transition-all duration-200 hover:translate-x-1 group"
                onClick={(e) => {
                  e.stopPropagation();
                  navigate(`/subjects/${category.id}`);
                }}
              >
                詳細を見る
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-1 transition-transform group-hover:translate-x-1" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};
