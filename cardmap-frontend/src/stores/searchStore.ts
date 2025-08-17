import { create } from 'zustand';
import { devtools, subscribeWithSelector } from 'zustand/middleware';
import { shallow } from 'zustand/shallow';
import type { Merchant } from '@/types/api';

export interface FilterState {
  cardTypes: string[];
  categories: string[];
}

export interface SearchState {
  // Search
  query: string;
  suggestions: string[];
  
  // Filters
  activeCardTypes: string[];
  activeCategories: string[];
  
  // View
  viewMode: 'list' | 'map';
  
  // Results
  merchants: Merchant[];
  isLoading: boolean;
  error: string | null;
  
  // Pagination
  page: number;
  totalPages: number;
  totalResults: number;
  
  // Store name for devtools
  $storeName: string;
}

export interface SearchActions {
  // Query actions
  setQuery: (query: string) => void;
  clearQuery: () => void;
  setSuggestions: (suggestions: string[]) => void;
  
  // Filter actions
  toggleCardType: (cardType: string) => void;
  toggleCategory: (category: string) => void;
  setCardTypes: (cardTypes: string[]) => void;
  setCategories: (categories: string[]) => void;
  clearFilters: () => void;
  clearCardTypes: () => void;
  clearCategories: () => void;
  
  // View actions
  setViewMode: (mode: 'list' | 'map') => void;
  toggleViewMode: () => void;
  
  // Result actions
  setMerchants: (merchants: Merchant[]) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  clearError: () => void;
  setPagination: (pagination: { page: number; totalPages: number; totalResults: number }) => void;
  
  // Computed getters
  activeFilterCount: () => number;
  hasActiveFilters: () => boolean;
  getFilterString: () => string;
  isCardTypeActive: (cardType: string) => boolean;
  isCategoryActive: (category: string) => boolean;
  getFilterState: () => FilterState;
  setFilterState: (state: FilterState) => void;
  
  // Batch operations
  batchUpdate: (updates: Partial<SearchState>) => void;
  reset: () => void;
  
  // URL synchronization helpers
  toURLParams: () => URLSearchParams;
  fromURLParams: (params: URLSearchParams) => void;
  
  // Search execution
  executeSearch: (searchFn: (params: any) => Promise<void>) => Promise<void>;
  
  // Subscribe for devtools
  subscribe: (listener: () => void) => () => void;
}

export type SearchStore = SearchState & SearchActions;

const initialState: SearchState = {
  query: '',
  suggestions: [],
  activeCardTypes: [],
  activeCategories: [],
  viewMode: 'map',
  merchants: [],
  isLoading: false,
  error: null,
  page: 0,
  totalPages: 0,
  totalResults: 0,
  $storeName: 'searchStore'
};

export const useSearchStore = create<SearchStore>()(
  devtools(
    subscribeWithSelector((set, get) => ({
      ...initialState,

      // Query actions
      setQuery: (query) => {
        const currentQuery = get().query;
        if (currentQuery === query) return; // Prevent unnecessary updates
        set({ query }, false, 'setQuery');
      },

      clearQuery: () => set({ query: '' }, false, 'clearQuery'),

      setSuggestions: (suggestions) => set({ suggestions }, false, 'setSuggestions'),

      // Filter actions
      toggleCardType: (cardType) => {
        const current = get().activeCardTypes;
        const updated = current.includes(cardType)
          ? current.filter(ct => ct !== cardType)
          : [...current, cardType];
        set({ activeCardTypes: updated }, false, 'toggleCardType');
      },

      toggleCategory: (category) => {
        const current = get().activeCategories;
        const updated = current.includes(category)
          ? current.filter(cat => cat !== category)
          : [...current, category];
        set({ activeCategories: updated }, false, 'toggleCategory');
      },

      setCardTypes: (cardTypes) => {
        const current = get().activeCardTypes;
        // Use shallow comparison to prevent unnecessary updates
        if (shallow(current, cardTypes)) return;
        set({ activeCardTypes: cardTypes }, false, 'setCardTypes');
      },

      setCategories: (categories) => {
        const current = get().activeCategories;
        // Use shallow comparison to prevent unnecessary updates
        if (shallow(current, categories)) return;
        set({ activeCategories: categories }, false, 'setCategories');
      },

      clearFilters: () => set({ 
        activeCardTypes: [], 
        activeCategories: [] 
      }, false, 'clearFilters'),

      clearCardTypes: () => set({ activeCardTypes: [] }, false, 'clearCardTypes'),

      clearCategories: () => set({ activeCategories: [] }, false, 'clearCategories'),

      // View actions
      setViewMode: (mode) => set({ viewMode: mode }, false, 'setViewMode'),

      toggleViewMode: () => {
        const current = get().viewMode;
        set({ viewMode: current === 'map' ? 'list' : 'map' }, false, 'toggleViewMode');
      },

      // Result actions
      setMerchants: (merchants) => set({ merchants }, false, 'setMerchants'),

      setLoading: (loading) => set({ isLoading: loading }, false, 'setLoading'),

      setError: (error) => set({ error }, false, 'setError'),

      clearError: () => set({ error: null }, false, 'clearError'),

      setPagination: ({ page, totalPages, totalResults }) => set({ 
        page, 
        totalPages, 
        totalResults 
      }, false, 'setPagination'),

      // Computed getters - using regular functions
      activeFilterCount: () => {
        const cardCount = get().activeCardTypes.length;
        const categoryCount = get().activeCategories.length;
        return cardCount + categoryCount;
      },

      hasActiveFilters: () => {
        const hasCards = get().activeCardTypes.length > 0;
        const hasCategories = get().activeCategories.length > 0;
        return hasCards || hasCategories;
      },

      getFilterString: () => {
        const state = get();
        const filters: string[] = [];
        
        if (state.activeCardTypes.length > 0) {
          filters.push(`Cards: ${state.activeCardTypes.join(', ')}`);
        }
        
        if (state.activeCategories.length > 0) {
          filters.push(`Categories: ${state.activeCategories.join(', ')}`);
        }
        
        return filters.join(' | ');
      },

      isCardTypeActive: (cardType) => {
        return get().activeCardTypes.includes(cardType);
      },

      isCategoryActive: (category) => {
        return get().activeCategories.includes(category);
      },

      getFilterState: () => {
        const state = get();
        return {
          cardTypes: state.activeCardTypes,
          categories: state.activeCategories
        };
      },

      setFilterState: (filterState) => {
        set({
          activeCardTypes: filterState.cardTypes,
          activeCategories: filterState.categories
        }, false, 'setFilterState');
      },

      // Batch operations
      batchUpdate: (updates) => {
        set(updates, false, 'batchUpdate');
      },

      reset: () => set(initialState, false, 'reset'),

      // URL synchronization helpers
      toURLParams: () => {
        const state = get();
        const params = new URLSearchParams();
        
        if (state.query) {
          params.set('q', state.query);
        }
        
        if (state.activeCardTypes.length > 0) {
          params.set('cards', state.activeCardTypes.join(','));
        }
        
        if (state.activeCategories.length > 0) {
          params.set('categories', state.activeCategories.join(','));
        }
        
        if (state.viewMode !== 'map') {
          params.set('view', state.viewMode);
        }
        
        return params;
      },

      fromURLParams: (params) => {
        const query = params.get('q') || '';
        const cards = params.get('cards');
        const categories = params.get('categories');
        const view = params.get('view') as 'list' | 'map' | null;
        
        set({
          query,
          activeCardTypes: cards ? cards.split(',') : [],
          activeCategories: categories ? categories.split(',') : [],
          viewMode: view === 'list' ? 'list' : 'map'
        }, false, 'fromURLParams');
      },

      // Search execution
      executeSearch: async (searchFn) => {
        const state = get();
        set({ isLoading: true, error: null }, false, 'executeSearch:start');
        
        try {
          await searchFn({
            query: state.query,
            cardTypes: state.activeCardTypes,
            categories: state.activeCategories,
            page: state.page
          });
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Search failed';
          set({ 
            error: errorMessage, 
            isLoading: false 
          }, false, 'executeSearch:error');
        }
      },

      // Subscribe method for testing
      subscribe: (listener) => {
        return useSearchStore.subscribe(listener);
      }
    })),
    {
      name: 'searchStore'
    }
  )
);