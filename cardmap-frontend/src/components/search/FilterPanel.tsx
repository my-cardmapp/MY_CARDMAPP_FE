import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { CheckboxGroup } from '../ui/CheckboxGroup';
import type { CheckboxOption } from '../ui/CheckboxGroup';
import type { CardDetail, Category } from '@/types/api';

export interface FilterState {
  cardTypes: string[];
  categories: string[];
}

export interface FilterPanelProps {
  onFiltersChange: (filters: FilterState) => void;
  initialFilters?: FilterState;
  className?: string;
}

export const FilterPanel: React.FC<FilterPanelProps> = ({
  onFiltersChange,
  initialFilters = { cardTypes: [], categories: [] },
  className = '',
}) => {
  const [filters, setFilters] = useState<FilterState>(initialFilters);
  const [cardOptions, setCardOptions] = useState<CheckboxOption[]>([]);
  const [categoryOptions, setCategoryOptions] = useState<CheckboxOption[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isExpanded, setIsExpanded] = useState(true);
  const [isMobile, setIsMobile] = useState(false);

  // Check if we're on mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Update filters when initialFilters change
  useEffect(() => {
    setFilters(initialFilters);
  }, [initialFilters]);

  // Load filter options from API
  const loadFilterOptions = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      // Load card types
      const cardsResponse = await fetch('/api/v1/cards');
      if (!cardsResponse.ok) throw new Error('Failed to load card types');
      const cardsData = await cardsResponse.json();
      
      const cardOpts: CheckboxOption[] = cardsData.cards.map((card: CardDetail) => ({
        id: `card-${card.code}`,
        label: card.name,
        value: card.code,
        color: card.colorHex,
      }));
      setCardOptions(cardOpts);

      // Load categories
      const categoriesResponse = await fetch('/api/v1/suggestions/categories?withCodes=true');
      if (!categoriesResponse.ok) throw new Error('Failed to load categories');
      const categoriesData = await categoriesResponse.json();
      
      const categoryOpts: CheckboxOption[] = categoriesData.categories.map((cat: Category) => ({
        id: `category-${cat.code}`,
        label: cat.name,
        value: cat.code,
        icon: cat.icon,
      }));
      setCategoryOptions(categoryOpts);

      setIsLoading(false);
    } catch (err) {
      setError('필터를 불러오는 중 오류가 발생했습니다.');
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadFilterOptions();
  }, [loadFilterOptions]);

  // Handle filter changes
  const handleCardTypesChange = useCallback((values: string[]) => {
    const newFilters = { ...filters, cardTypes: values };
    setFilters(newFilters);
    onFiltersChange(newFilters);
  }, [filters, onFiltersChange]);

  const handleCategoriesChange = useCallback((values: string[]) => {
    const newFilters = { ...filters, categories: values };
    setFilters(newFilters);
    onFiltersChange(newFilters);
  }, [filters, onFiltersChange]);

  // Clear all filters
  const handleClearAll = useCallback(() => {
    const newFilters = { cardTypes: [], categories: [] };
    setFilters(newFilters);
    onFiltersChange(newFilters);
  }, [onFiltersChange]);

  // Calculate total active filters
  const totalActiveFilters = useMemo(
    () => filters.cardTypes.length + filters.categories.length,
    [filters]
  );

  const hasActiveFilters = totalActiveFilters > 0;

  // Toggle expanded state
  const toggleExpanded = useCallback(() => {
    setIsExpanded(!isExpanded);
  }, [isExpanded]);

  if (isLoading) {
    return (
      <div data-testid="filter-panel" className={`filter-panel ${className}`}>
        <div data-testid="filter-loading" className="p-4 text-center text-gray-500">
          필터를 불러오는 중...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div data-testid="filter-panel" className={`filter-panel ${className}`}>
        <div data-testid="filter-error" className="p-4">
          <p className="text-red-600 mb-2">{error}</p>
          <button
            data-testid="retry-load-filters"
            onClick={loadFilterOptions}
            className="text-sm text-blue-600 hover:text-blue-700"
          >
            다시 시도
          </button>
        </div>
      </div>
    );
  }

  const panelClasses = [
    'filter-panel',
    'bg-white rounded-lg shadow-sm',
    isMobile ? 'fixed bottom-0 left-0 right-0 z-40' : '',
    className,
  ].filter(Boolean).join(' ');

  return (
    <div 
      data-testid="filter-panel" 
      className={panelClasses}
      role="region"
      aria-label="필터 패널"
    >
      {/* Header */}
      <div className="px-4 py-3 border-b border-gray-200 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h2 className="text-lg font-semibold text-gray-900">필터</h2>
          {hasActiveFilters && !isExpanded && isMobile && (
            <span
              data-testid="total-filter-badge"
              className="px-2 py-0.5 text-xs font-medium bg-blue-100 text-blue-800 rounded-full"
            >
              {totalActiveFilters}
            </span>
          )}
        </div>
        
        <div className="flex items-center gap-2">
          {hasActiveFilters && (
            <button
              data-testid="clear-all-filters"
              onClick={handleClearAll}
              className="text-sm text-gray-600 hover:text-gray-900"
            >
              전체 해제
            </button>
          )}
          
          {isMobile && (
            <button
              data-testid="filter-collapse-button"
              onClick={toggleExpanded}
              className="p-1 text-gray-600 hover:text-gray-900"
            >
              <svg
                className={`w-5 h-5 transition-transform duration-200 ${
                  isExpanded ? 'rotate-180' : ''
                }`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 15l7-7 7 7"
                />
              </svg>
            </button>
          )}
        </div>
      </div>

      {/* Filter Content */}
      <div
        data-testid="filter-content"
        className={`${
          isExpanded ? 'expanded' : 'collapsed'
        } ${
          isMobile && !isExpanded ? 'hidden' : ''
        } p-4 space-y-4 max-h-96 overflow-y-auto`}
      >
        {/* Card Types */}
        <div role="group" aria-label="카드 종류 필터">
          <CheckboxGroup
            title="카드 종류"
            options={cardOptions}
            selectedValues={filters.cardTypes}
            onChange={handleCardTypesChange}
            showSelectAll={true}
            showBadge={false}
          />
          {filters.cardTypes.length > 0 && (
            <span
              data-testid="card-filter-badge"
              className="inline-block mt-2 px-2 py-0.5 text-xs font-medium bg-blue-100 text-blue-800 rounded-full"
            >
              {filters.cardTypes.length}
            </span>
          )}
          {cardOptions.length > 0 && filters.cardTypes.length === cardOptions.length && (
            <button
              data-testid="card-deselect-all"
              className="hidden"
              onClick={() => handleCardTypesChange([])}
            >
              전체 해제
            </button>
          )}
          {cardOptions.length > 0 && filters.cardTypes.length === 0 && (
            <button
              data-testid="card-select-all"
              className="hidden"
              onClick={() => handleCardTypesChange(cardOptions.map(opt => opt.value))}
            >
              전체 선택
            </button>
          )}
        </div>

        {/* Categories */}
        <div role="group" aria-label="카테고리 필터">
          <CheckboxGroup
            title="카테고리"
            options={categoryOptions}
            selectedValues={filters.categories}
            onChange={handleCategoriesChange}
            showSelectAll={true}
            showBadge={false}
          />
          {filters.categories.length > 0 && (
            <span
              data-testid="category-filter-badge"
              className="inline-block mt-2 px-2 py-0.5 text-xs font-medium bg-blue-100 text-blue-800 rounded-full"
            >
              {filters.categories.length}
            </span>
          )}
          {categoryOptions.length > 0 && filters.categories.length === categoryOptions.length && (
            <button
              data-testid="category-deselect-all"
              className="hidden"
              onClick={() => handleCategoriesChange([])}
            >
              전체 해제
            </button>
          )}
          {categoryOptions.length > 0 && filters.categories.length === 0 && (
            <button
              data-testid="category-select-all"
              className="hidden"
              onClick={() => handleCategoriesChange(categoryOptions.map(opt => opt.value))}
            >
              전체 선택
            </button>
          )}
        </div>
      </div>
    </div>
  );
};