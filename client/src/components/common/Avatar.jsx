import React from 'react';

const getInitials = (name = '') => {
  const parts = name.trim().split(' ');
  if (parts.length >= 2) {
    return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
  }
  return name.slice(0, 2).toUpperCase() || 'U';
};

const getColorClass = (name = '') => {
  const colors = [
    'bg-indigo-500 text-white',
    'bg-emerald-500 text-white',
    'bg-blue-500 text-white',
    'bg-amber-500 text-white',
    'bg-rose-500 text-white',
    'bg-purple-500 text-white',
    'bg-teal-500 text-white',
  ];
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return colors[Math.abs(hash) % colors.length];
};

export const Avatar = ({
  user,
  name,
  avatarUrl,
  size = 'md',
  showName = false,
  subtitle,
  className = '',
}) => {
  const userName = user?.name || name || 'Anonymous';
  const url = user?.avatar || avatarUrl;

  const sizeClasses = {
    xs: 'w-6 h-6 text-xs',
    sm: 'w-8 h-8 text-xs',
    md: 'w-9 h-9 text-sm',
    lg: 'w-12 h-12 text-base font-medium',
    xl: 'w-16 h-16 text-xl font-semibold',
  };

  const currentSizeClass = sizeClasses[size] || sizeClasses.md;
  const colorClass = getColorClass(userName);

  return (
    <div className={`inline-flex items-center gap-2.5 ${className}`}>
      <div
        className={`relative flex items-center justify-center rounded-full ring-2 ring-white shadow-sm overflow-hidden flex-shrink-0 ${currentSizeClass} ${
          !url ? colorClass : 'bg-slate-200'
        }`}
        title={userName}
      >
        {url ? (
          <img
            src={url}
            alt={userName}
            className="w-full h-full object-cover"
            onError={(e) => {
              e.target.style.display = 'none';
            }}
          />
        ) : (
          <span>{getInitials(userName)}</span>
        )}
      </div>

      {showName && (
        <div className="flex flex-col text-left truncate">
          <span className="text-sm font-semibold text-slate-800 leading-tight truncate">
            {userName}
          </span>
          {subtitle && (
            <span className="text-xs text-slate-500 truncate">{subtitle}</span>
          )}
        </div>
      )}
    </div>
  );
};

export default Avatar;
