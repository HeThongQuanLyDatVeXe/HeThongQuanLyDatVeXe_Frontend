import React from 'react';

interface FloatingInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
  isPassword?: boolean;
  showPassword?: boolean;
  onTogglePassword?: () => void;
}

export const FloatingInput: React.FC<FloatingInputProps> = ({
  label,
  error,
  className = '',
  id,
  isPassword,
  showPassword,
  onTogglePassword,
  ...props
}) => {
  return (
    <div className="flex flex-col gap-1 w-full">
      <div className="floating-label-group relative">
        <input
          id={id}
          type={isPassword ? (showPassword ? 'text' : 'password') : props.type}
          className={`
            w-full h-[48px] bg-transparent border rounded-lg px-4 py-3 
            transition-all duration-200 outline-none fancy-input
            ${isPassword ? 'pr-12' : ''}
            ${error ? 'border-red-500 focus:border-red-500' : 'border-outline-variant/60 focus:border-primary-hover'}
            ${className}
          `}
          placeholder=" "
          {...props}
        />
        <label 
          htmlFor={id}
          className={`
            text-sm absolute left-4 top-3 transition-all duration-200 pointer-events-none
            ${error ? 'text-red-500' : 'text-on-surface-variant/80'}
          `}
        >
          {label}
        </label>
        {isPassword && onTogglePassword && (
          <button
            type="button"
            onClick={onTogglePassword}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-on-surface-variant hover:text-primary-hover focus:outline-none select-none flex items-center justify-center cursor-pointer"
          >
            <span className="material-symbols-outlined text-[20px]">
              {showPassword ? 'visibility_off' : 'visibility'}
            </span>
          </button>
        )}
      </div>
      {error && <span className="text-[11px] text-red-500 font-medium px-2">{error}</span>}
    </div>
  );
};
