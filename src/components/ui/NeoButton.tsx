import type { ReactNode } from 'react';

interface NeoButtonProps {
  children: ReactNode;
  onClick?: () => void;
  className?: string;
  type?: 'button' | 'submit';
  disabled?: boolean;
  accent?: boolean;
}

export default function NeoButton({ children, onClick, className = '', type = 'button', disabled, accent }: NeoButtonProps) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`neo-button font-medium text-sm ${accent ? 'text-soft-indigo' : 'text-gray-600'} ${disabled ? 'opacity-50 cursor-not-allowed' : ''} ${className}`}
    >
      {children}
    </button>
  );
}
