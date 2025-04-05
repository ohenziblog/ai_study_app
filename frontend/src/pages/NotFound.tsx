import { Link } from 'react-router-dom';
import { Button } from '../components/common/Button';

export const NotFound = () => {
  return (
    <div className="flex flex-col items-center justify-center py-12">
      <h1 className="text-6xl font-bold text-gray-800 mb-4">404</h1>
      <p className="text-2xl font-semibold text-gray-600 mb-8">ページが見つかりません</p>
      <p className="text-gray-500 max-w-md text-center mb-8">
        お探しのページは存在しないか、移動または削除された可能性があります。
      </p>
      <Link to="/">
        <Button>
          ホームに戻る
        </Button>
      </Link>
    </div>
  );
};
