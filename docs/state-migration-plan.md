# State Management Migration Plan: Context API to Zustand

## Executive Summary

This document outlines the comprehensive plan to migrate from React Context API to Zustand for state management in the Card-Map frontend application. The migration aims to improve performance, reduce re-renders, and provide better developer experience while maintaining zero downtime.

## Table of Contents

1. [Current State Architecture](#current-state-architecture)
2. [Migration Goals](#migration-goals)
3. [Component Dependencies](#component-dependencies)
4. [Migration Strategy](#migration-strategy)
5. [Breaking Changes](#breaking-changes)
6. [Risk Assessment](#risk-assessment)
7. [Migration Checklist](#migration-checklist)
8. [Timeline & Phases](#timeline-phases)

## Current State Architecture

### 1. MapContext (React Context API)
- **Location**: `src/contexts/MapContext.tsx`
- **Purpose**: Manages Naver Map instance and script loading state
- **State Properties**:
  - `map`: Naver Maps instance (stored in ref)
  - `isMapReady`: Boolean flag for map initialization
  - `isScriptLoaded`: Boolean flag for script loading
  - `isScriptError`: Boolean flag for script errors
- **Methods**:
  - `setMap()`: Updates map instance
  - `getMap()`: Returns current map instance
- **Performance Optimizations**:
  - Uses `useRef` for map instance to prevent re-renders
  - Memoized context value
  - Callbacks are wrapped in `useCallback`

### 2. SearchStore (Already Zustand)
- **Location**: `src/stores/searchStore.ts`
- **Purpose**: Manages search, filters, and results
- **Already Implemented Features**:
  - DevTools integration
  - Shallow equality checks
  - URL synchronization
  - Batch operations
  - Computed getters
  - Request execution helpers

### 3. Merchant State (No Global Store)
- **Location**: `src/hooks/useMerchantApi.ts`
- **Purpose**: Fetches merchant data with deduplication
- **Current Implementation**:
  - Local state using refs
  - Request deduplication with singleton
  - Abort controller management
  - No global state sharing

## Migration Goals

1. **Performance Improvements**
   - Eliminate unnecessary re-renders from Context API
   - Implement atomic subscriptions for specific state slices
   - Reduce component tree re-renders

2. **Developer Experience**
   - Consistent state management patterns
   - Better DevTools integration
   - Improved TypeScript support
   - Easier testing

3. **Feature Enhancements**
   - Time-travel debugging
   - State persistence
   - Middleware support
   - Better state composition

4. **Code Quality**
   - Remove prop drilling
   - Cleaner component code
   - Better separation of concerns

## Component Dependencies

### Direct MapContext Consumers

| Component | Usage | Dependency Level | Migration Priority |
|-----------|-------|------------------|-------------------|
| `MapContainer` | Primary consumer, manages map instance | High | 1 |
| `ViewportMapContainer` | Extended map functionality | High | 2 |
| `RouteLayer` | Displays routes on map | Medium | 3 |
| `MapControls` | Map control interactions | Low | 4 |
| Test files | Testing utilities | Low | 5 |

### Dependency Graph
```
MapProvider (Context)
├── MapContainer
│   ├── ViewportMarkerRenderer (via prop)
│   ├── MapControls (indirect)
│   └── MapSkeleton (UI only)
├── ViewportMapContainer
│   └── ViewportMarkerRenderer
└── RouteLayer
    └── Route rendering logic
```

### State Flow Analysis

1. **Map Instance Flow**:
   - NaverMapScript loads → MapProvider sets loaded state
   - MapContainer initializes map → Calls setMap in context
   - Other components access map via useMapContext

2. **Merchant Data Flow**:
   - Map bounds change → useMerchantApi fetches data
   - Data flows through props to ViewportMarkerRenderer
   - No global state coordination

## Migration Strategy

### Phase 1: Create Map Store (Week 1)
1. Create `mapStore.ts` with Zustand
2. Implement all MapContext functionality
3. Add DevTools and middleware
4. Create migration adapter hook

### Phase 2: Create Merchant Store (Week 1)
1. Create `merchantStore.ts` for global merchant state
2. Move useMerchantApi logic to store
3. Implement caching and deduplication
4. Add viewport-based fetching

### Phase 3: Parallel Implementation (Week 2)
1. Create compatibility layer for gradual migration
2. Update components one by one
3. Maintain backward compatibility
4. Run both systems in parallel

### Phase 4: Migration & Testing (Week 2-3)
1. Migrate MapContainer
2. Migrate ViewportMapContainer
3. Migrate RouteLayer
4. Update all tests
5. Remove Context API code

### Phase 5: Optimization & Cleanup (Week 3)
1. Performance optimization
2. Remove migration adapters
3. Documentation update
4. Final testing

## Breaking Changes

### API Changes

| Current (Context) | New (Zustand) | Impact |
|-------------------|---------------|---------|
| `useMapContext()` | `useMapStore()` | All consumers need update |
| `<MapProvider>` wrapper | No wrapper needed | App structure change |
| `map` getter | `map` selector | Minor syntax change |
| `setMap(map)` | `setMap(map)` | No change |
| `getMap()` | Direct state access | Simplified API |

### Component Changes

1. **App Layout**:
   - Remove `<MapProvider>` wrapper
   - Initialize stores at app root

2. **Component Imports**:
   ```typescript
   // Before
   import { useMapContext } from '@/contexts/MapContext'
   
   // After
   import { useMapStore } from '@/stores/mapStore'
   ```

3. **State Access**:
   ```typescript
   // Before
   const { map, isMapReady } = useMapContext()
   
   // After
   const map = useMapStore(state => state.map)
   const isMapReady = useMapStore(state => state.isMapReady)
   ```

## Risk Assessment

### High Risk Areas
1. **Map Instance Management**: Critical for all map functionality
   - Mitigation: Extensive testing, gradual rollout
2. **Script Loading Timing**: Race conditions possible
   - Mitigation: Keep existing timeout logic, add retry mechanism

### Medium Risk Areas
1. **Component Re-render Performance**: May change render patterns
   - Mitigation: Use selectors, shallow equality
2. **Test Coverage**: Tests need significant updates
   - Mitigation: Update tests alongside component migration

### Low Risk Areas
1. **DevTools Integration**: Already proven with searchStore
2. **TypeScript Types**: Can reuse existing interfaces

## Migration Checklist

### Pre-Migration
- [ ] Document current state architecture ✓
- [ ] Map all component dependencies ✓
- [ ] Create migration plan ✓
- [ ] Set up testing environment
- [ ] Create rollback plan

### Phase 1: Map Store
- [ ] Create mapStore.ts with Zustand
- [ ] Implement map instance management
- [ ] Add script loading state
- [ ] Create migration adapter hook
- [ ] Write unit tests

### Phase 2: Merchant Store
- [ ] Create merchantStore.ts
- [ ] Implement data fetching logic
- [ ] Add request deduplication
- [ ] Implement caching strategy
- [ ] Write unit tests

### Phase 3: Component Migration
- [ ] Create compatibility layer
- [ ] Migrate MapContainer
- [ ] Migrate ViewportMapContainer
- [ ] Migrate RouteLayer
- [ ] Update MapControls

### Phase 4: Testing
- [ ] Update component tests
- [ ] Update integration tests
- [ ] Perform regression testing
- [ ] Test performance improvements
- [ ] Validate DevTools integration

### Phase 5: Cleanup
- [ ] Remove MapContext
- [ ] Remove MapProvider
- [ ] Remove migration adapters
- [ ] Update documentation
- [ ] Final performance audit

## Timeline & Phases

### Week 1: Foundation
- Days 1-2: Create mapStore and merchantStore
- Days 3-4: Implement core functionality
- Day 5: Initial testing and validation

### Week 2: Migration
- Days 1-2: Create compatibility layer
- Days 3-4: Migrate components
- Day 5: Testing and bug fixes

### Week 3: Finalization
- Days 1-2: Complete migration
- Day 3: Performance optimization
- Days 4-5: Documentation and cleanup

## Success Criteria

1. **Functional Requirements**
   - All existing features work without regression
   - Map loads and initializes correctly
   - Merchant data fetches and displays properly
   - No breaking changes for end users

2. **Performance Metrics**
   - Reduce unnecessary re-renders by >50%
   - Improve initial load time
   - Maintain or improve memory usage
   - Better time-to-interactive

3. **Developer Experience**
   - Cleaner component code
   - Better debugging capabilities
   - Improved test coverage
   - Comprehensive documentation

## Rollback Plan

1. **Version Control**
   - Create feature branch for migration
   - Keep Context API code in separate branch
   - Tag stable version before migration

2. **Feature Flags**
   - Implement feature flag for new store
   - Allow runtime switching if needed
   - Gradual rollout to users

3. **Monitoring**
   - Track error rates
   - Monitor performance metrics
   - User feedback channels
   - Automated alerts

## Appendix

### A. Reference Documentation
- [Zustand Documentation](https://github.com/pmndrs/zustand)
- [React Context API](https://react.dev/reference/react/useContext)
- [Migration Best Practices](https://docs.pmnd.rs/zustand/guides/migrating-from-context)

### B. Code Examples
- See `src/stores/searchStore.ts` for Zustand patterns
- Migration adapter examples in technical plan

### C. Testing Strategy
- Unit tests with @testing-library/react
- Integration tests with MSW
- E2E tests with Playwright
- Performance benchmarks

---

**Document Version**: 1.0.0  
**Last Updated**: 2024-01-28  
**Author**: Frontend Team  
**Status**: Ready for Review