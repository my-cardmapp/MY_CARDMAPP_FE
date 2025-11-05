# Redux DevTools Integration Guide

## Overview

CardMap application includes comprehensive Redux DevTools integration for all Zustand stores, providing powerful debugging capabilities during development.

## Features

### 1. Redux DevTools Extension Integration
- All stores automatically connect to Redux DevTools Extension
- Time-travel debugging support
- Action tracking with payloads
- State diff visualization
- Performance timing for actions

### 2. Development-Only State Logger
- Console logging of state changes
- Grouped logs with timestamps
- State diff calculation
- Collapsible log groups

### 3. State Export/Import
- Export current state to JSON file
- Import state from JSON
- Validate imported state
- Batch state operations

### 4. Performance Monitoring
- Action execution time measurement
- Performance callbacks
- Trace mode for detailed timing

## Usage

### Browser DevTools

1. **Install Redux DevTools Extension**
   - Chrome: [Redux DevTools](https://chrome.google.com/webstore/detail/redux-devtools/lmhkpmbekcpmknklioeibfkpmmfibljd)
   - Firefox: [Redux DevTools](https://addons.mozilla.org/en-US/firefox/addon/reduxdevtools/)

2. **Open DevTools**
   - Press `F12` to open browser DevTools
   - Navigate to "Redux" tab
   - Select store from dropdown (map-store, merchant-store, searchStore)

3. **Available Actions**
   - View action history
   - Time-travel through states
   - Dispatch custom actions
   - Export/Import state
   - View state diff

### Console Commands

The application exposes global DevTools in development mode:

```javascript
// Access DevTools
window.__CARDMAP_DEVTOOLS__

// Export all states to file
window.__CARDMAP_DEVTOOLS__.exportStateToFile()

// Export with custom filename
window.__CARDMAP_DEVTOOLS__.exportStateToFile('my-state.json')

// Import state from JSON string
window.__CARDMAP_DEVTOOLS__.importStateFromJSON(jsonString)

// Reset all stores
window.__CARDMAP_DEVTOOLS__.resetAllStores()

// Log current state
window.__CARDMAP_DEVTOOLS__.logCurrentState()

// Get state snapshots
const snapshot = window.__CARDMAP_DEVTOOLS__.getStoreSnapshots()

// Compare snapshots
window.__CARDMAP_DEVTOOLS__.compareSnapshots(before, after)

// Measure action performance
await window.__CARDMAP_DEVTOOLS__.measureAction('myAction', async () => {
  // Your action code
})

// Direct store access
window.__CARDMAP_DEVTOOLS__.stores.map.getState()
window.__CARDMAP_DEVTOOLS__.stores.merchant.getState()
window.__CARDMAP_DEVTOOLS__.stores.search.getState()
```

## Store-Specific Features

### MapStore Actions
- `setMap` - Set map instance
- `setViewport` - Update viewport (center, zoom)
- `fitBounds` - Fit map to bounds
- `setControls` - Update map controls
- `setMarkers` - Set marker data
- `toggleClustering` - Toggle marker clustering

### MerchantStore Actions
- `setMerchants` - Set merchant list
- `setFilters` - Update filters
- `toggleCardType` - Toggle card type filter
- `toggleCategory` - Toggle category filter
- `fetchMerchants` - Fetch merchants from API
- `searchMerchants` - Search merchants

### SearchStore Actions
- `setQuery` - Set search query
- `toggleCardType` - Toggle card filter
- `toggleCategory` - Toggle category filter
- `setViewMode` - Change view mode (list/map)
- `executeSearch` - Execute search

## Custom Store Integration

### Basic Setup

```typescript
import { create } from 'zustand';
import { createDevtools } from '@/stores/devtools';

interface MyStore {
  count: number;
  increment: () => void;
}

const useMyStore = create<MyStore>()(
  createDevtools<MyStore>('MyStore')((set) => ({
    count: 0,
    increment: () => set((state) => ({ 
      count: state.count + 1 
    }), false, 'increment'),
  }))
);
```

### With Performance Tracking

```typescript
const useMyStore = create<MyStore>()(
  createDevtools<MyStore>('MyStore', {
    trace: true,
    onActionComplete: (data) => {
      console.log(`Action ${data.action} took ${data.duration}ms`);
    }
  })((set) => ({
    // Store implementation
  }))
);
```

### With State Logger

```typescript
import { createStateLogger } from '@/stores/devtools';

const useMyStore = create<MyStore>()(
  createStateLogger<MyStore>('MyStore', {
    collapsed: true,
    diff: true
  })((set) => ({
    // Store implementation
  }))
);
```

## Performance Tips

1. **Production Build**
   - DevTools are automatically disabled in production
   - No performance overhead in production builds

2. **Trace Mode**
   - Enable trace mode only when debugging performance issues
   - Disable for normal development to reduce overhead

3. **State Size**
   - Keep state serializable (no functions, classes)
   - Avoid storing large objects in state
   - Use normalized data structures

4. **Action Names**
   - Use descriptive action names
   - Follow naming conventions (camelCase)
   - Group related actions with prefixes

## Troubleshooting

### DevTools Not Showing

1. Check Redux DevTools Extension is installed
2. Verify development mode (`NODE_ENV !== 'production'`)
3. Check browser console for errors
4. Try refreshing the page

### State Not Updating

1. Ensure actions are properly named
2. Check for state mutations (use immutable updates)
3. Verify store subscription

### Performance Issues

1. Disable trace mode if not needed
2. Reduce state update frequency
3. Use shallow equality checks for selectors

## Environment Variables

```bash
# Disable DevTools (even in development)
NEXT_PUBLIC_DISABLE_DEVTOOLS=true

# Enable verbose logging
NEXT_PUBLIC_DEVTOOLS_VERBOSE=true
```

## Best Practices

1. **Action Naming**
   ```typescript
   // Good
   set({ loading: true }, false, 'fetchData:start')
   set({ data }, false, 'fetchData:success')
   set({ error }, false, 'fetchData:error')
   
   // Bad
   set({ loading: true })  // No action name
   ```

2. **State Structure**
   ```typescript
   // Good - Normalized
   {
     entities: { [id]: entity },
     ids: string[],
     selectedId: string | null
   }
   
   // Bad - Nested
   {
     items: [{ id, nested: { deep: {} } }]
   }
   ```

3. **Selective DevTools**
   ```typescript
   // Only in development
   if (process.env.NODE_ENV !== 'production') {
     window.__CARDMAP_DEVTOOLS__.logCurrentState();
   }
   ```

## Security Notes

- DevTools are **completely disabled** in production builds
- No state or actions are exposed in production
- Console commands only work in development
- State exports should not contain sensitive data

## Further Resources

- [Zustand Documentation](https://github.com/pmndrs/zustand)
- [Redux DevTools Extension](https://github.com/reduxjs/redux-devtools)
- [Chrome DevTools](https://developer.chrome.com/docs/devtools/)