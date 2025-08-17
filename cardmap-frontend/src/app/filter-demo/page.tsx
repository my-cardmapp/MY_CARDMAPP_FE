'use client';

import React, { useState } from 'react';
import { FilterPanel } from '@/components/search/FilterPanel';
import type { FilterState } from '@/components/search/FilterPanel';

export default function FilterDemoPage() {
  const [filters, setFilters] = useState<FilterState>({
    cardTypes: [],
    categories: []
  });

  const handleFiltersChange = (newFilters: FilterState) => {
    setFilters(newFilters);
    console.log('Filters changed:', newFilters);
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Filter Panel Demo</h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Filter Panel */}
          <div className="lg:col-span-1">
            <FilterPanel 
              onFiltersChange={handleFiltersChange}
              initialFilters={filters}
            />
          </div>
          
          {/* Results Area */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Active Filters</h2>
              
              {filters.cardTypes.length === 0 && filters.categories.length === 0 ? (
                <p className="text-gray-500">No filters selected</p>
              ) : (
                <div className="space-y-4">
                  {filters.cardTypes.length > 0 && (
                    <div>
                      <h3 className="text-sm font-medium text-gray-700 mb-2">Card Types:</h3>
                      <div className="flex flex-wrap gap-2">
                        {filters.cardTypes.map(type => (
                          <span
                            key={type}
                            className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
                          >
                            {type}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {filters.categories.length > 0 && (
                    <div>
                      <h3 className="text-sm font-medium text-gray-700 mb-2">Categories:</h3>
                      <div className="flex flex-wrap gap-2">
                        {filters.categories.map(category => (
                          <span
                            key={category}
                            className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm"
                          >
                            {category}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
              
              <div className="mt-8 p-4 bg-gray-50 rounded">
                <h3 className="text-sm font-medium text-gray-700 mb-2">API Call Preview:</h3>
                <pre className="text-xs bg-gray-800 text-gray-100 p-3 rounded overflow-x-auto">
                  {JSON.stringify({
                    endpoint: '/api/v1/merchants',
                    params: {
                      cardTypes: filters.cardTypes,
                      categories: filters.categories,
                      page: 0,
                      size: 20
                    }
                  }, null, 2)}
                </pre>
              </div>
            </div>
          </div>
        </div>
        
        {/* Mobile Test View */}
        <div className="mt-12">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Mobile View (375px width)</h2>
          <div className="border-2 border-gray-300 rounded-lg overflow-hidden" style={{ width: '375px', height: '667px' }}>
            <iframe
              src="/filter-demo"
              style={{ width: '375px', height: '667px', border: 'none' }}
              title="Mobile View"
            />
          </div>
        </div>
      </div>
    </div>
  );
}