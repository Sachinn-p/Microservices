import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

export function Button({ variant = 'primary', fullWidth, className, children, ...props }) {
  const baseStyles = 'px-4 py-2 rounded font-semibold transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed';
  
  const variants = {
    primary: 'bg-primary text-white shadow hover:-translate-y-[1px] hover:bg-primary-hover active:translate-y-0',
    secondary: 'bg-surface border border-border text-main hover:bg-[#fafafa]',
    ghost: 'text-muted hover:text-main hover:bg-border bg-transparent',
  };

  return (
    <button 
      className={cn(baseStyles, variants[variant], fullWidth && 'w-full', className)} 
      {...props}
    >
      {children}
    </button>
  );
}
