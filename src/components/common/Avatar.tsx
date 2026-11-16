import React from 'react';
import { UserStatus } from '../../types';

interface AvatarProps {
  src?: string;
  name: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  status?: UserStatus;
  isHost?: boolean;
  className?: string;
}

const sizeClasses = {
  xs: 'w-6 h-6 text-xs',
  sm: 'w-8 h-8 text-xs',
  md: 'w-10 h-10 text-sm',
  lg: 'w-12 h-12 text-base',
  xl: 'w-16 h-16 text-lg',
  '2xl': 'w-20 h-20 text-xl font-bold',
};

const statusSizeClasses = {
  xs: 'w-1.5 h-1.5 border-[1px]',
  sm: 'w-2.5 h-2.5 border-[1.5px]',
  md: 'w-3 h-3 border-2',
  lg: 'w-3.5 h-3.5 border-2',
  xl: 'w-4 h-4 border-2',
  '2xl': 'w-5 h-5 border-[2.5px]',
};

const statusColors: Record<UserStatus, string> = {
  online: 'bg-emerald-500 shadow-emerald-500/50',
  busy: 'bg-rose-500 shadow-rose-500/50',
  away: 'bg-amber-500 shadow-amber-500/50',
  offline: 'bg-slate-500 shadow-slate-500/50',
};

export const Avatar: React.FC<AvatarProps> = ({
  src,
  name,
  size = 'md',
  status,
  isHost,
  className = '',
}) => {
  const initials = name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .substring(0, 2)
    .toUpperCase();

  return (
    <div className={`relative inline-block select-none shrink-0 ${className}`}>
      <div
        className={`${sizeClasses[size]} rounded-2xl overflow-hidden bg-gradient-to-br from-slate-700 to-slate-900 border border-white/10 flex items-center justify-center font-medium text-slate-200 shadow-inner`}
      >
        {src ? (
          <img
            src={src}
            alt={name}
            className="w-full h-full object-cover transition-opacity duration-200"
            onError={(e) => {
              // Fallback to initials if image fails
              (e.target as HTMLElement).style.display = 'none';
            }}
          />
        ) : (
          <span>{initials}</span>
        )}
      </div>

      {/* Online / Status Indicator */}
      {status && (
        <span
          className={`absolute bottom-0 right-0 rounded-full ${statusSizeClasses[size]} ${statusColors[status]} border-[#0B0E14] shadow-sm transform translate-x-[15%] translate-y-[15%]`}
        />
      )}

      {/* Hotspot Host Badge */}
      {isHost && (
        <span
          title="Hotspot Gateway Host"
          className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-orange-500 text-[9px] font-bold text-white shadow-md shadow-orange-500/30 border border-[#0B0E14]"
        >
          ⚡
        </span>
      )}
    </div>
  );
};
