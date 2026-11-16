import React from 'react';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'orange' | 'emerald' | 'cyan' | 'slate' | 'rose' | 'indigo';
  size?: 'sm' | 'md';
  icon?: React.ReactNode;
  className?: string;
}

const variantClasses = {
  orange: 'bg-orange-500/10 text-orange-400 border-orange-500/20',
  emerald: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  cyan: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20',
  slate: 'bg-slate-800/80 text-slate-300 border-slate-700/50',
  rose: 'bg-rose-500/10 text-rose-400 border-rose-500/20',
  indigo: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20',
};

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'slate',
  size = 'sm',
  icon,
  className = '',
}) => {
  return (
    <span
      className={`inline-flex items-center gap-1.5 font-mono font-medium rounded-md border tracking-tight ${
        size === 'sm' ? 'px-2 py-0.5 text-[11px]' : 'px-2.5 py-1 text-xs'
      } ${variantClasses[variant]} ${className}`}
    >
      {icon && <span className="shrink-0">{icon}</span>}
      {children}
    </span>
  );
};
