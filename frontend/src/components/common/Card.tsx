import { ReactNode } from 'react';

interface CardProps {
  title?: string;
  children: ReactNode;
  className?: string;
  onClick?: () => void;
}

export const Card = ({ title, children, className = '', onClick }: CardProps) => {
  return (
    <div 
      className={`bg-white rounded-lg shadow-md overflow-hidden border border-gray-200 
                 hover:shadow-lg transition-all duration-200 ${
                   onClick ? 'cursor-pointer hover:translate-y-[-5px]' : ''
                 } ${className}`}
      onClick={onClick}
    >
      {title && (
        <div className="border-b border-gray-200 px-6 py-4 bg-gray-50">
          <h3 className="text-xl font-semibold text-gray-800 text-center">{title}</h3>
        </div>
      )}
      <div className="px-6 py-5 text-gray-700 leading-relaxed">
        {children}
      </div>
    </div>
  );
};
