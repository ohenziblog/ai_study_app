import { ReactNode } from 'react';
import { Navbar } from './Navbar';

interface LayoutProps {
  children: ReactNode;
}

export const Layout = ({ children }: LayoutProps) => {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-grow py-8">
        <div className="max-w-screen-md mx-auto px-4">
          {children}
        </div>
      </main>
      <footer className="bg-gray-800 text-white py-4 mt-auto">
        <div className="text-center px-4 max-w-screen-md mx-auto">
          <p>© 2025 AIスタディ - 個別最適化学習アプリ</p>
        </div>
      </footer>
    </div>
  );
};
