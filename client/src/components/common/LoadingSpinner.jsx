import React from 'react';
import { Loader2 } from 'lucide-react';

export const LoadingSpinner = ({ size = 'md', message = 'Loading...', fullScreen = false }) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-7 h-7',
    lg: 'w-10 h-10',
  };

  const content = (
    <div className="flex flex-col items-center justify-center gap-3 p-6 text-slate-500">
      <Loader2 className={`${sizeClasses[size] || sizeClasses.md} animate-spin text-brand-600`} />
      {message && <p className="text-sm font-medium text-slate-600 animate-pulse">{message}</p>}
    </div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/80 backdrop-blur-sm">
        {content}
      </div>
    );
  }

  return content;
};

export default LoadingSpinner;
