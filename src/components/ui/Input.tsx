import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  helperText?: string;
  error?: string;
  fullWidth?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

const Input: React.FC<InputProps> = ({
  label,
  helperText,
  error,
  fullWidth = false,
  className = '',
  leftIcon,
  rightIcon,
  ...props
}) => {
  const inputBaseStyles = 'bg-white border rounded-lg py-2 px-4 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent';
  const inputErrorStyles = error ? 'border-red-500' : 'border-gray-300';
  const widthStyle = fullWidth ? 'w-full' : '';
  
  const inputClassName = `${inputBaseStyles} ${inputErrorStyles} ${widthStyle} ${className}`;
  
  return (
    <div className={`mb-4 ${widthStyle}`}>
      {label && (
        <label className="block text-gray-700 text-sm font-medium mb-1" htmlFor={props.id}>
          {label}
        </label>
      )}
      <div className="relative">
        {leftIcon && (
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            {leftIcon}
          </div>
        )}
        <input
          className={`${inputClassName} ${leftIcon ? 'pl-10' : ''} ${rightIcon ? 'pr-10' : ''}`}
          {...props}
        />
        {rightIcon && (
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
            {rightIcon}
          </div>
        )}
      </div>
      {error ? (
        <p className="text-red-500 text-xs mt-1">{error}</p>
      ) : helperText ? (
        <p className="text-gray-500 text-xs mt-1">{helperText}</p>
      ) : null}
    </div>
  );
};

export default Input;