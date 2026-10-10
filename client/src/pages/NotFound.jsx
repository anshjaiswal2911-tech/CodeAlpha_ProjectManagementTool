import React from 'react';
import { Link } from 'react-router-dom';
import { Layers, ArrowLeft } from 'lucide-react';

export const NotFound = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center bg-slate-50">
      <div className="w-16 h-16 rounded-2xl bg-brand-50 flex items-center justify-center text-brand-600 mb-4">
        <Layers className="w-8 h-8" />
      </div>
      <h1 className="text-4xl font-extrabold text-slate-900 mb-2">404</h1>
      <h2 className="text-xl font-bold text-slate-700 mb-2">Page Not Found</h2>
      <p className="text-sm text-slate-500 max-w-sm mb-6">
        The project, board, or page you are looking for does not exist or has been moved.
      </p>
      <Link
        to="/dashboard"
        className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-white bg-brand-600 hover:bg-brand-700 rounded-xl shadow-sm transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Return to Dashboard
      </Link>
    </div>
  );
};

export default NotFound;
