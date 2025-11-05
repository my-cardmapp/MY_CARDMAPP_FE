'use client';

import React, { useState } from 'react';
import { SpriteIcon, AutoSpriteIcon, preloadAllSprites } from '@/components/common/SpriteIcon';
import { useSpriteMetrics, useSpritePreload } from '@/hooks/useSprite';
import { calculateNetworkSavings } from '@/utils/spriteUtils';
import '@/styles/sprites.css';

export default function SpriteDemoPage() {
  const [selectedType, setSelectedType] = useState<'cards' | 'categories' | 'ui'>('cards');
  const [isPreloaded, setIsPreloaded] = useState(false);
  
  // Preload sprites
  const { isLoading, loaded } = useSpritePreload(['cards', 'categories', 'ui']);
  
  // Get metrics for selected sprite type
  const { metrics, savings } = useSpriteMetrics(selectedType);

  // Sample icons for each type
  const cardIcons = ['CHILD_MEAL', 'CULTURE_NURI', 'LOCAL_LOVE', 'ZERO_PAY'];
  const categoryIcons = ['restaurant', 'convenience', 'cafe', 'bakery'];
  const uiIcons = ['close', 'search', 'location', 'filter', 'menu'];

  const handlePreloadAll = async () => {
    await preloadAllSprites();
    setIsPreloaded(true);
  };

  const getIconsForType = () => {
    switch (selectedType) {
      case 'cards':
        return cardIcons;
      case 'categories':
        return categoryIcons;
      case 'ui':
        return uiIcons;
      default:
        return [];
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Sprite Sheet Optimization Demo</h1>

        {/* Preload Status */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Sprite Loading Status</h2>
          <div className="flex items-center gap-4 mb-4">
            <button
              onClick={handlePreloadAll}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
              disabled={isLoading}
            >
              {isLoading ? 'Loading...' : 'Preload All Sprites'}
            </button>
            {isPreloaded && (
              <span className="text-green-600">✓ All sprites preloaded</span>
            )}
          </div>
          <div className="grid grid-cols-3 gap-4">
            {Object.entries(loaded).map(([type, isLoaded]) => (
              <div
                key={type}
                className={`p-3 rounded ${
                  isLoaded ? 'bg-green-100' : 'bg-gray-100'
                }`}
              >
                <span className="font-medium">{type}:</span>
                <span className="ml-2">
                  {isLoaded ? '✓ Loaded' : '○ Not loaded'}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Sprite Type Selector */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Select Sprite Type</h2>
          <div className="flex gap-4">
            {(['cards', 'categories', 'ui'] as const).map((type) => (
              <button
                key={type}
                onClick={() => setSelectedType(type)}
                className={`px-4 py-2 rounded ${
                  selectedType === type
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-200 hover:bg-gray-300'
                }`}
              >
                {type.charAt(0).toUpperCase() + type.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Metrics Display */}
        {metrics && savings && (
          <div className="bg-white rounded-lg shadow p-6 mb-6">
            <h2 className="text-xl font-semibold mb-4">Performance Metrics</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="p-3 bg-gray-50 rounded">
                <div className="text-sm text-gray-600">Total Icons</div>
                <div className="text-2xl font-bold">{metrics.totalIcons}</div>
              </div>
              <div className="p-3 bg-gray-50 rounded">
                <div className="text-sm text-gray-600">Sprite Size</div>
                <div className="text-2xl font-bold">{metrics.fileSize} KB</div>
              </div>
              <div className="p-3 bg-green-50 rounded">
                <div className="text-sm text-gray-600">Requests Saved</div>
                <div className="text-2xl font-bold text-green-600">
                  {savings.requests}
                </div>
              </div>
              <div className="p-3 bg-green-50 rounded">
                <div className="text-sm text-gray-600">Bandwidth Saved</div>
                <div className="text-2xl font-bold text-green-600">
                  {savings.percentage}%
                </div>
              </div>
            </div>
            <div className="mt-4 p-3 bg-blue-50 rounded">
              <div className="text-sm text-gray-600">Sprite Dimensions</div>
              <div className="font-mono">
                {metrics.spriteWidth} × {metrics.spriteHeight} pixels
              </div>
            </div>
          </div>
        )}

        {/* Icon Gallery */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Icon Gallery</h2>
          <div className="grid grid-cols-4 md:grid-cols-8 gap-4">
            {getIconsForType().map((iconName) => (
              <div
                key={iconName}
                className="flex flex-col items-center p-3 bg-gray-50 rounded hover:bg-gray-100"
              >
                <div className="mb-2 p-2 bg-white rounded shadow">
                  <SpriteIcon
                    type={selectedType}
                    name={iconName}
                    size={selectedType === 'cards' ? 48 : selectedType === 'categories' ? 32 : 24}
                    alt={iconName}
                  />
                </div>
                <span className="text-xs text-gray-600 text-center">
                  {iconName}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Interactive Examples */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Interactive Examples</h2>
          
          {/* Clickable Icons */}
          <div className="mb-6">
            <h3 className="font-semibold mb-2">Clickable Icons</h3>
            <div className="flex gap-4">
              <SpriteIcon
                type="ui"
                name="close"
                size={32}
                onClick={() => alert('Close clicked!')}
                className="cursor-pointer hover:opacity-80"
                alt="Close button"
              />
              <SpriteIcon
                type="ui"
                name="search"
                size={32}
                onClick={() => alert('Search clicked!')}
                className="cursor-pointer hover:opacity-80"
                alt="Search button"
              />
              <SpriteIcon
                type="ui"
                name="menu"
                size={32}
                onClick={() => alert('Menu clicked!')}
                className="cursor-pointer hover:opacity-80"
                alt="Menu button"
              />
            </div>
          </div>

          {/* Responsive Sizes */}
          <div className="mb-6">
            <h3 className="font-semibold mb-2">Responsive Sizes</h3>
            <div className="flex gap-4 items-end">
              <div className="text-center">
                <SpriteIcon type="cards" name="CHILD_MEAL" size={24} />
                <div className="text-xs mt-1">24px</div>
              </div>
              <div className="text-center">
                <SpriteIcon type="cards" name="CHILD_MEAL" size={32} />
                <div className="text-xs mt-1">32px</div>
              </div>
              <div className="text-center">
                <SpriteIcon type="cards" name="CHILD_MEAL" size={48} />
                <div className="text-xs mt-1">48px</div>
              </div>
              <div className="text-center">
                <SpriteIcon type="cards" name="CHILD_MEAL" size={64} />
                <div className="text-xs mt-1">64px</div>
              </div>
            </div>
          </div>

          {/* Auto Detection */}
          <div className="mb-6">
            <h3 className="font-semibold mb-2">Auto Type Detection</h3>
            <div className="flex gap-4">
              <AutoSpriteIcon name="CHILD_MEAL" size={32} />
              <AutoSpriteIcon name="restaurant" size={32} />
              <AutoSpriteIcon name="search" size={32} />
            </div>
            <p className="text-sm text-gray-600 mt-2">
              AutoSpriteIcon automatically detects the sprite type based on icon name
            </p>
          </div>
        </div>

        {/* Performance Comparison */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Performance Comparison</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-4 bg-red-50 rounded">
              <h3 className="font-semibold text-red-700 mb-2">Without Sprites</h3>
              <ul className="space-y-1 text-sm">
                <li>• {metrics?.totalIcons || 20} HTTP requests</li>
                <li>• ~{(metrics?.totalIcons || 20) * 2} KB total bandwidth</li>
                <li>• Waterfall loading pattern</li>
                <li>• Cache management per file</li>
              </ul>
            </div>
            <div className="p-4 bg-green-50 rounded">
              <h3 className="font-semibold text-green-700 mb-2">With Sprites</h3>
              <ul className="space-y-1 text-sm">
                <li>• 1 HTTP request per sprite</li>
                <li>• ~{metrics?.fileSize || 50} KB total bandwidth</li>
                <li>• Parallel loading</li>
                <li>• Single cache entry</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}