import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { CheckboxGroup } from '../ui/CheckboxGroup';
import type { CheckboxOption } from '../ui/CheckboxGroup';
import type { CardDetail, Category } from '@/types/api';
import { useSearchStore } from '@/stores/searchStore';
import { LoadingOverlay } from '../ui/LoadingStates';

export interface FilterState {
  cardTypes: string[];
  categories: string[];
}

export interface FilterPanelProps {
  onFiltersChange?: (filters: FilterState) => void;
  onFilterChange?: (filters: FilterState) => Promise<void> | void;
  initialFilters?: FilterState;
  filters?: FilterState;
  className?: string;
  useStore?: boolean; // Flag to enable store integration
  isUpdating?: boolean;
  optimisticUpdates?: boolean;
}

export const FilterPanel: React.FC<FilterPanelProps> = ({
  onFiltersChange,
  onFilterChange,
  initialFilters = { cardTypes: [], categories: [] },
  filters: propFilters,
  className = '',
  useStore = false, // Default to false for backward compatibility
  isUpdating = false,
  optimisticUpdates = false,
}) => {
  // Store integration - only connect when explicitly enabled
  const storeCardTypes = useStore ? useSearchStore(state => state.activeCardTypes) : [];
  const storeCategories = useStore ? useSearchStore(state => state.activeCategories) : [];
  const setStoreCardTypes = useStore ? useSearchStore(state => state.setCardTypes) : null;
  const setStoreCategories = useStore ? useSearchStore(state => state.setCategories) : null;
  const clearStoreFilters = useStore ? useSearchStore(state => state.clearFilters) : null;

  // Use store state if enabled, otherwise use local state or prop filters
  const [localFilters, setLocalFilters] = useState<FilterState>(propFilters || initialFilters);
  const filters = propFilters || (useStore 
    ? { cardTypes: storeCardTypes, categories: storeCategories }
    : localFilters);
  
  // Store previous filters for rollback
  const previousFilters = useRef<FilterState>(filters);

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

  // Update filters when initialFilters change (only for local state mode)
  useEffect(() => {
    if (!useStore) {
      setLocalFilters(initialFilters);
    }
  }, [initialFilters, useStore]);

  // Load filter options from API
  const loadFilterOptions = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      // Load card types
      const cardsResponse = await fetch('/api/v1/cards');
      if (!cardsResponse.ok) {
        throw new Error('Failed to load card types');
      }
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
      if (!categoriesResponse.ok) {
        throw new Error('Failed to load categories');
      }
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
      console.error('Failed to load filters:', err);
      setError('필터를 불러오는 중 오류가 발생했습니다.');
      setIsLoading(false);
      // Clear options on error
      setCardOptions([]);
      setCategoryOptions([]);
    }
  }, []);

  useEffect(() => {
    loadFilterOptions();
  }, [loadFilterOptions]);

  // Handle filter changes with optimistic updates
  const handleCardTypesChange = useCallback(async (values: string[]) => {
    const newFilters = { ...filters, cardTypes: values };
    
    // Store current state for potential rollback
    if (optimisticUpdates) {
      previousFilters.current = { ...filters };
    }
    
    // Apply changes optimistically
    if (useStore && setStoreCardTypes) {
      setStoreCardTypes(values);
    } else {
      setLocalFilters(newFilters);
    }
    
    // Call the async handler if provided
    if (onFilterChange && optimisticUpdates) {
      try {
        await onFilterChange(newFilters);
      } catch (error) {
        // Rollback on error
        if (useStore && setStoreCardTypes) {
          setStoreCardTypes(previousFilters.current.cardTypes);
        } else {
          setLocalFilters(previousFilters.current);
        }
        console.error('Filter update failed:', error);
      }
    } else {
      // Call sync handler
      onFiltersChange?.(newFilters);
    }
  }, [filters, onFiltersChange, onFilterChange, useStore, setStoreCardTypes, optimisticUpdates]);

  const handleCategoriesChange = useCallback(async (values: string[]) => {
    const newFilters = { ...filters, categories: values };
    
    // Store current state for potential rollback
    if (optimisticUpdates) {
      previousFilters.current = { ...filters };
    }
    
    // Apply changes optimistically
    if (useStore && setStoreCategories) {
      setStoreCategories(values);
    } else {
      setLocalFilters(newFilters);
    }
    
    // Call the async handler if provided
    if (onFilterChange && optimisticUpdates) {
      try {
        await onFilterChange(newFilters);
      } catch (error) {
        // Rollback on error
        if (useStore && setStoreCategories) {
          setStoreCategories(previousFilters.current.categories);
        } else {
          setLocalFilters(previousFilters.current);
        }
        console.error('Filter update failed:', error);
      }
    } else {
      // Call sync handler
      onFiltersChange?.(newFilters);
    }
  }, [filters, onFiltersChange, onFilterChange, useStore, setStoreCategories, optimisticUpdates]);

  // Clear all filters
  const handleClearAll = useCallback(() => {
    if (useStore && clearStoreFilters) {
      clearStoreFilters();
    } else {
      const newFilters = { cardTypes: [], categories: [] };
      setLocalFilters(newFilters);
      onFiltersChange?.(newFilters);
    }
  }, [onFiltersChange, useStore, clearStoreFilters]);

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
    'bg-white rounded-lg shadow-sm border border-gray-200',
    isMobile ? 'fixed bottom-0 left-0 right-0 z-40' : '',
    className,
  ].filter(Boolean).join(' ');

  return (
    <>
      {/* Loading Overlay */}
      {isUpdating && (
        <LoadingOverlay message="Updating filters..." />
      )}
      
      <div 
        data-testid="filter-panel" 
        className={panelClasses}
        role="region"
        aria-label="필터 패널"
      >
      {/* Header */}
      <div className="px-5 py-4 border-b border-gray-200 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-blue-50 rounded-full flex items-center justify-center">
            <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
            </svg>
          </div>
          <h2 className="text-lg font-semibold text-gray-900">필터</h2>
          {hasActiveFilters && !isExpanded && isMobile && (
            <span
              data-testid="total-filter-badge"
              className="px-2.5 py-0.5 text-xs font-semibold bg-blue-100 text-blue-700 rounded-full"
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
              className="text-sm font-medium text-blue-600 hover:text-blue-700 transition-colors"
            >
              전체 해제
            </button>
          )}

          {isMobile && (
            <button
              data-testid="filter-collapse-button"
              onClick={toggleExpanded}
              className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
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
        } p-5 space-y-6 max-h-96 overflow-y-auto`}
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
              className="inline-block mt-2 px-2.5 py-1 text-xs font-semibold bg-blue-50 text-blue-600 rounded-full border border-blue-200"
            >
              {filters.cardTypes.length}개 선택됨
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
              className="inline-block mt-2 px-2.5 py-1 text-xs font-semibold bg-blue-50 text-blue-600 rounded-full border border-blue-200"
            >
              {filters.categories.length}개 선택됨
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
    </>
  );
};