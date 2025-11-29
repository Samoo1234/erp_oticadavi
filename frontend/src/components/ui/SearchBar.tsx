import React, { useState, useCallback } from 'react';
import { MagnifyingGlassIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { clsx } from 'clsx';

export interface SearchBarProps {
  placeholder?: string;
  value?: string;
  onChange: (value: string) => void;
  onSearch?: (value: string) => void;
  debounceMs?: number;
  className?: string;
  showClearButton?: boolean;
  autoFocus?: boolean;
}

export const SearchBar: React.FC<SearchBarProps> = ({
  placeholder = 'Buscar...',
  value: controlledValue,
  onChange,
  onSearch,
  debounceMs = 300,
  className,
  showClearButton = true,
  autoFocus = false,
}) => {
  const [internalValue, setInternalValue] = useState('');
  const value = controlledValue ?? internalValue;

  const debounceTimerRef = React.useRef<NodeJS.Timeout>();

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const newValue = e.target.value;
      
      if (controlledValue === undefined) {
        setInternalValue(newValue);
      }

      // Clear previous timer
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }

      // Set new timer for debounced onChange
      debounceTimerRef.current = setTimeout(() => {
        onChange(newValue);
      }, debounceMs);
    },
    [onChange, debounceMs, controlledValue]
  );

  const handleClear = useCallback(() => {
    if (controlledValue === undefined) {
      setInternalValue('');
    }
    onChange('');
  }, [onChange, controlledValue]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Enter' && onSearch) {
        onSearch(value);
      }
    },
    [onSearch, value]
  );

  return (
    <div className={clsx('relative', className)}>
      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
        <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
      </div>
      <input
        type="text"
        value={value}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        autoFocus={autoFocus}
        className={clsx(
          'block w-full pl-10 pr-10 py-2 border border-gray-300 rounded-lg',
          'focus:ring-blue-500 focus:border-blue-500',
          'placeholder-gray-400 text-gray-900',
          'transition-colors duration-200'
        )}
      />
      {showClearButton && value && (
        <button
          type="button"
          onClick={handleClear}
          className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
        >
          <XMarkIcon className="h-5 w-5" />
        </button>
      )}
    </div>
  );
};

export default SearchBar;
