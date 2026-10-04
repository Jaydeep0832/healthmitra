import React from 'react';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  message?: string;
}

const sizes = {
  sm: 'w-5 h-5 border-2',
  md: 'w-8 h-8 border-3',
  lg: 'w-12 h-12 border-4',
};

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = 'md',
  message,
}) => {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-8">
      <div
        className={`${sizes[size]} border-blue-200 border-t-blue-600 rounded-full animate-spin`}
      />
      {message && (
        <p className="text-sm text-gray-500 animate-pulse">{message}</p>
      )}
    </div>
  );
};

export default LoadingSpinner;
