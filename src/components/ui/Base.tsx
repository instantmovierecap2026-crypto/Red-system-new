import React from 'react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function Button({ 
  className, 
  variant = 'primary', 
  size = 'md', 
  ...props 
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { 
  variant?: 'primary' | 'secondary' | 'danger' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
}) {
  const variants = {
    primary: 'bg-blue-600 text-white hover:bg-blue-700 shadow-sm shadow-blue-500/20 active:scale-95',
    secondary: 'bg-slate-900 text-white hover:bg-slate-800 active:scale-95 border border-slate-800',
    danger: 'bg-red-600 text-white hover:bg-red-700 active:scale-95',
    outline: 'border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 active:scale-95',
    ghost: 'hover:bg-slate-100 text-slate-600 active:scale-95',
  };

  const sizes = {
    sm: 'px-3 py-1.5 text-xs font-bold uppercase tracking-wider',
    md: 'px-4 py-2 text-sm font-semibold',
    lg: 'px-6 py-3 text-sm font-bold uppercase tracking-widest',
  };

  return (
    <button 
      className={cn(
        'inline-flex items-center justify-center rounded-lg transition-all focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed',
        variants[variant],
        sizes[size],
        className
      )}
      {...props}
    />
  );
}

export function Card({ className, children, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn('bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden', className)} {...props}>
      {children}
    </div>
  );
}

export function Input({ className, label, error, ...props }: React.InputHTMLAttributes<HTMLInputElement> & { label?: string, error?: string }) {
  return (
    <div className="space-y-1.5 w-full">
      {label && <label className="text-[10px] uppercase font-bold text-slate-500 tracking-wider ml-1">{label}</label>}
      <input 
        className={cn(
          'w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all placeholder:text-slate-400',
          error ? 'border-red-500 focus:ring-red-500' : 'hover:border-slate-300',
          className
        )} 
        {...props} 
      />
      {error && <p className="text-[10px] font-bold text-red-500 uppercase tracking-tight pl-1">{error}</p>}
    </div>
  );
}

export function Select({ className, label, error, options, ...props }: React.SelectHTMLAttributes<HTMLSelectElement> & { label?: string, error?: string, options: { label: string, value: string | number }[] }) {
  return (
    <div className="space-y-1.5 w-full">
      {label && <label className="text-[10px] uppercase font-bold text-slate-500 tracking-wider ml-1">{label}</label>}
      <div className="relative">
        <select 
          className={cn(
            'w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all appearance-none cursor-pointer',
            error ? 'border-red-500 focus:ring-red-500' : 'hover:border-slate-300',
            className
          )} 
          {...props}
        >
          {options.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
        </select>
        <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" /></svg>
        </div>
      </div>
      {error && <p className="text-[10px] font-bold text-red-500 uppercase tracking-tight pl-1">{error}</p>}
    </div>
  );
}

export function Badge({ children, variant = 'default' }: { children: React.ReactNode, variant?: 'default' | 'success' | 'warning' | 'danger' }) {
  const styles = {
    default: 'bg-slate-100 text-slate-600 border border-slate-200',
    success: 'bg-green-100 text-green-700 border border-green-200',
    warning: 'bg-amber-100 text-amber-700 border border-amber-200',
    danger: 'bg-red-100 text-red-700 border border-red-200',
  };
  return (
    <span className={cn('px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider', styles[variant])}>
      {children}
    </span>
  );
}
