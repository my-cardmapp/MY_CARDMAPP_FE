'use client';

import { useEffect } from 'react';
import { useURLSync } from '@/hooks/useURLSync';
import { useSearchStore } from '@/stores/searchStore';
import SearchWithFilters from './SearchWithFilters';

/**
 * Search component with URL synchronization
 * Wraps SearchWithFilters and adds URL parameter sync
 */
export default function SearchWithURLSync() {
  const { syncToURL, syncFromURL } = useURLSync({
    debounceMs: 500,
    replaceHistory: true,
  });

  // Subscribe to store changes and sync to URL
  useEffect(() => {
    const unsubscribe = useSearchStore.subscribe(
      // Selector for what to listen to
      (state) => ({
        query: state.query,
        activeCardTypes: state.activeCardTypes,
        activeCategories: state.activeCategories,
        viewMode: state.viewMode,
        page: state.page,
      }),
      // Callback when selected state changes
      () => {
        syncToURL();
      },
      {
        equalityFn: (prev, next) => 
          prev.query === next.query &&
          JSON.stringify(prev.activeCardTypes) === JSON.stringify(next.activeCardTypes) &&
          JSON.stringify(prev.activeCategories) === JSON.stringify(next.activeCategories) &&
          prev.viewMode === next.viewMode &&
          prev.page === next.page
      }
    );

    return unsubscribe;
  }, [syncToURL]);

  // Sync from URL on mount (handled by useURLSync internally)
  // No need to call syncFromURL here as it's done on mount

  return <SearchWithFilters />;
}