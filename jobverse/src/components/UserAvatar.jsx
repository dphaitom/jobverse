// src/components/UserAvatar.jsx
// Reusable Avatar component for both candidates and employers
import { User, Building2 } from 'lucide-react';

const UserAvatar = ({ 
  user, 
  size = 'md', 
  className = '',
  showBadge = false,
  rounded = 'full' // 'full' for circle, '2xl' for rounded square
}) => {
  const sizeClasses = {
    xs: 'w-6 h-6 text-xs',
    sm: 'w-8 h-8 text-sm',
    md: 'w-10 h-10 text-base',
    lg: 'w-14 h-14 text-xl',
    xl: 'w-20 h-20 text-3xl',
    '2xl': 'w-32 h-32 text-5xl',
  };

  const iconSizes = {
    xs: 'w-3 h-3',
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-7 h-7',
    xl: 'w-10 h-10',
    '2xl': 'w-16 h-16',
  };

  const roundedClass = rounded === 'full' ? 'rounded-full' : 'rounded-2xl';

  const isEmployer = user?.role === 'EMPLOYER';
  const hasAvatar = user?.profile?.avatarUrl || user?.avatarUrl;
  const avatarUrl = user?.profile?.avatarUrl || user?.avatarUrl;
  const displayName = user?.fullName || user?.name || user?.email || '';
  const initial = displayName?.charAt(0)?.toUpperCase() || '?';

  // Gradient colors based on role
  const gradientClass = isEmployer 
    ? 'bg-gradient-to-br from-emerald-500 to-teal-600'
    : 'bg-gradient-to-br from-violet-500 to-indigo-600';

  if (hasAvatar) {
    return (
      <div className={`relative ${className}`}>
        <img
          src={avatarUrl.startsWith('http') ? avatarUrl : `http://localhost:8080/api${avatarUrl}`}
          alt={displayName}
          className={`${sizeClasses[size]} ${roundedClass} object-cover`}
          onError={(e) => {
            // Fallback to default avatar on error
            e.target.style.display = 'none';
            e.target.nextSibling.style.display = 'flex';
          }}
        />
        <div 
          className={`${sizeClasses[size]} ${roundedClass} ${gradientClass} items-center justify-center hidden`}
        >
          {isEmployer ? (
            <Building2 className={`${iconSizes[size]} text-white`} />
          ) : (
            <span className="font-semibold text-white">{initial}</span>
          )}
        </div>
        {showBadge && isEmployer && (
          <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 bg-emerald-500 rounded-full border-2 border-gray-900 flex items-center justify-center">
            <Building2 className="w-2 h-2 text-white" />
          </div>
        )}
      </div>
    );
  }

  return (
    <div className={`relative ${className}`}>
      <div 
        className={`${sizeClasses[size]} ${roundedClass} ${gradientClass} flex items-center justify-center`}
      >
        {isEmployer ? (
          <Building2 className={`${iconSizes[size]} text-white`} />
        ) : (
          <span className="font-semibold text-white">{initial}</span>
        )}
      </div>
      {showBadge && isEmployer && (
        <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 bg-emerald-500 rounded-full border-2 border-gray-900 flex items-center justify-center">
          <Building2 className="w-2 h-2 text-white" />
        </div>
      )}
    </div>
  );
};

export default UserAvatar;
