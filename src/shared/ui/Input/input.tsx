import React from 'react';
import { cn } from '@/utils';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  prefix?: React.ReactNode;
  suffix?: React.ReactNode;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, prefix, suffix, ...props }, ref) => {
    return (
      <div className='space-y-2'>
        {label && (
          <label className='block text-sm font-medium text-gray-700 dark:text-gray-300'>
            {label}
          </label>
        )}
        <div className='relative'>
          {prefix && (
            <div className='absolute left-3 top-1/2 -translate-y-1/2 text-gray-500'>
              {prefix}
            </div>
          )}
          <input
            className={cn(
              'w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-gray-900 transition-colors placeholder:text-gray-500 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-0 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100 dark:placeholder:text-gray-400 dark:focus:border-primary-400',
              prefix && 'pl-10',
              suffix && 'pr-10',
              error && 'border-red-500 focus:border-red-500 focus:ring-red-500',
              className
            )}
            ref={ref}
            {...props}
          />
          {suffix && (
            <div className='absolute right-3 top-1/2 -translate-y-1/2 text-gray-500'>
              {suffix}
            </div>
          )}
        </div>
        {error && (
          <p className='text-sm text-red-600 dark:text-red-400'>{error}</p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';

export default Input;
