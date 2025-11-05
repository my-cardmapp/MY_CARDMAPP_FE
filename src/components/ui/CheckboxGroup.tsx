import React, { useCallback, useMemo } from 'react';
import { Checkbox } from './Checkbox';

export interface CheckboxOption {
  id: string;
  label: string;
  value: string;
  disabled?: boolean;
  color?: string;
  icon?: string;
  description?: string;
}

export interface CheckboxGroupProps {
  title: string;
  options: CheckboxOption[];
  selectedValues: string[];
  onChange: (values: string[]) => void;
  className?: string;
  titleClassName?: string;
  showSelectAll?: boolean;
  showBadge?: boolean;
  disabled?: boolean;
}

export const CheckboxGroup: React.FC<CheckboxGroupProps> = ({
  title,
  options,
  selectedValues,
  onChange,
  className = '',
  titleClassName = '',
  showSelectAll = false,
  showBadge = false,
  disabled = false,
}) => {
  const allSelected = useMemo(
    () => options.every(option => selectedValues.includes(option.value)),
    [options, selectedValues]
  );

  const someSelected = useMemo(
    () => selectedValues.length > 0 && !allSelected,
    [selectedValues, allSelected]
  );

  const handleSelectAll = useCallback(() => {
    if (allSelected) {
      onChange([]);
    } else {
      const allValues = options
        .filter(option => !option.disabled)
        .map(option => option.value);
      onChange(allValues);
    }
  }, [allSelected, options, onChange]);

  const handleOptionChange = useCallback(
    (value: string, checked: boolean) => {
      if (checked) {
        onChange([...selectedValues, value]);
      } else {
        onChange(selectedValues.filter(v => v !== value));
      }
    },
    [selectedValues, onChange]
  );

  const groupClasses = [
    'checkbox-group',
    'p-4 bg-white rounded-lg border border-gray-200',
    className,
  ].filter(Boolean).join(' ');

  return (
    <div 
      data-testid="checkbox-group" 
      className={groupClasses}
      role="group"
      aria-labelledby={`${title.toLowerCase().replace(/\s+/g, '-')}-title`}
      aria-label={`${title} 필터`}
    >
      <div className="flex items-center justify-between mb-3">
        <h3 
          id={`${title.toLowerCase().replace(/\s+/g, '-')}-title`}
          className={`text-sm font-semibold text-gray-900 ${titleClassName}`}
        >
          {title}
        </h3>
        
        <div className="flex items-center gap-2">
          {showBadge && selectedValues.length > 0 && (
            <span
              data-testid="group-badge"
              className="px-2 py-0.5 text-xs font-medium bg-blue-100 text-blue-800 rounded-full"
            >
              {selectedValues.length}
            </span>
          )}
          
          {showSelectAll && (
            <>
              {someSelected && (
                <input
                  type="checkbox"
                  data-testid="select-all-checkbox"
                  className="sr-only"
                  aria-checked="mixed"
                  readOnly
                />
              )}
              <button
                type="button"
                onClick={handleSelectAll}
                disabled={disabled}
                className={`text-xs font-medium transition-colors duration-200 ${
                  disabled
                    ? 'text-gray-400 cursor-not-allowed'
                    : 'text-blue-600 hover:text-blue-700'
                }`}
              >
                {allSelected ? '전체 해제' : '전체 선택'}
              </button>
            </>
          )}
        </div>
      </div>
      
      <div className="space-y-1">
        {options.map(option => (
          <Checkbox
            key={option.id}
            id={option.id}
            label={option.label}
            checked={selectedValues.includes(option.value)}
            onChange={(checked) => handleOptionChange(option.value, checked)}
            disabled={disabled || option.disabled}
            color={option.color}
            icon={option.icon}
            description={option.description}
          />
        ))}
      </div>
    </div>
  );
};