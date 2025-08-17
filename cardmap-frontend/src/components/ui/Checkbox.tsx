import React, { useState, useCallback, useRef, useEffect } from 'react';

export interface CheckboxProps {
  id: string;
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
  className?: string;
  color?: string;
  icon?: string;
  badge?: number;
  indeterminate?: boolean;
  description?: string;
}

export const Checkbox: React.FC<CheckboxProps> = ({
  id,
  label,
  checked,
  onChange,
  disabled = false,
  className = '',
  color,
  icon,
  badge,
  indeterminate = false,
  description,
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const checkboxRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (checkboxRef.current) {
      checkboxRef.current.indeterminate = indeterminate;
    }
  }, [indeterminate]);

  const handleChange = useCallback(() => {
    if (!disabled) {
      onChange(!checked);
    }
  }, [checked, onChange, disabled]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === ' ' && !disabled) {
      e.preventDefault();
      onChange(!checked);
    }
  }, [checked, onChange, disabled]);

  const containerClasses = [
    'checkbox-container',
    'flex items-center p-2 rounded-lg transition-all duration-200',
    isHovered && !disabled ? 'hover bg-gray-50' : '',
    isFocused ? 'focused ring-2 ring-blue-500 ring-opacity-50' : '',
    disabled ? 'disabled opacity-50 cursor-not-allowed' : 'cursor-pointer',
    className,
  ].filter(Boolean).join(' ');

  const checkboxClasses = [
    'w-5 h-5 rounded border-2 transition-all duration-200',
    checked || indeterminate
      ? 'bg-blue-500 border-blue-500'
      : 'bg-white border-gray-300',
    !disabled ? 'hover:border-blue-400' : '',
  ].filter(Boolean).join(' ');

  return (
    <div
      data-testid="checkbox-container"
      className={containerClasses}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <input
        ref={checkboxRef}
        type="checkbox"
        id={id}
        checked={checked}
        onChange={handleChange}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        onKeyDown={handleKeyDown}
        disabled={disabled}
        className="sr-only"
        aria-checked={indeterminate ? 'mixed' : checked}
        aria-disabled={disabled}
      />
      <label
        htmlFor={id}
        className="flex items-center cursor-pointer select-none w-full"
      >
        <span 
          className={`${checkboxClasses} flex items-center justify-center mr-3 flex-shrink-0`}
          role="presentation"
        >
          {(checked || indeterminate) && (
            <svg
              className="w-3 h-3 text-white"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              {indeterminate ? (
                <rect x="4" y="9" width="12" height="2" />
              ) : (
                <path
                  fillRule="evenodd"
                  d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                  clipRule="evenodd"
                />
              )}
            </svg>
          )}
        </span>
        
        {color && (
          <span
            data-testid="checkbox-color-indicator"
            className="w-4 h-4 rounded-full mr-2 flex-shrink-0"
            style={{ backgroundColor: color }}
          />
        )}
        
        {icon && (
          <span data-testid="checkbox-icon" className="mr-2 text-lg flex-shrink-0">
            {icon}
          </span>
        )}
        
        <span className="flex flex-col flex-grow">
          <span className="text-sm font-medium text-gray-900">{label}</span>
          {description && (
            <span className="text-xs text-gray-500 mt-0.5">{description}</span>
          )}
        </span>
        
        {badge !== undefined && badge > 0 && (
          <span
            data-testid="checkbox-badge"
            className="ml-2 px-2 py-0.5 text-xs font-medium bg-blue-100 text-blue-800 rounded-full flex-shrink-0"
          >
            {badge}
          </span>
        )}
      </label>
    </div>
  );
};