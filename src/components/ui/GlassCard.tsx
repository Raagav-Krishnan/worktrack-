import type { ReactNode } from 'react';

interface GlassCardProps {
  children: ReactNode;
  className?: string;
  onClick?: () => void;
  hover?: boolean;
}

export default function GlassCard({ children, className = '', onClick, hover }: GlassCardProps) {
  return (
    <div
      onClick={onClick}
      className={`glass-card p-6 ${hover ? 'hover:translate-y-[-2px] hover:shadow-lg transition-all duration-300 cursor-pointer' : ''} ${onClick ? 'cursor-pointer' : ''} ${className}`}
    >
      {children}
    </div>
  );
}
