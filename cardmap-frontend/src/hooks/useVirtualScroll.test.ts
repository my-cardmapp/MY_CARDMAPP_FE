import { describe, it, expect, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useVirtualScroll } from './useVirtualScroll';

// Mock @tanstack/react-virtual
const mockScrollToIndex = vi.fn();
const mockScrollToOffset = vi.fn();
const mockMeasureElement = vi.fn();

vi.mock('@tanstack/react-virtual', () => ({
  useVirtualizer: vi.fn((options) => {
    // 옵션 저장 (테스트 검증용)
    (global as any).lastVirtualizerOptions = options;
    
    return {
      getVirtualItems: () => [
        { index: 0, start: 0, size: 80, key: '0' },
        { index: 1, start: 80, size: 80, key: '1' },
        { index: 2, start: 160, size: 80, key: '2' },
      ],
      getTotalSize: () => options.count * (options.estimateSize?.(0) || 80),
      scrollToIndex: mockScrollToIndex,
      scrollToOffset: mockScrollToOffset,
      measureElement: mockMeasureElement,
      scrollOffset: 0,
      range: { startIndex: 0, endIndex: 2 },
    };
  })
}));

describe('useVirtualScroll', () => {
  it('기본 옵션으로 초기화된다', () => {
    const parentRef = { current: document.createElement('div') };
    const { result } = renderHook(() => 
      useVirtualScroll({
        items: Array(100).fill(null),
        parentRef,
      })
    );

    expect(result.current.virtualItems).toHaveLength(3);
    expect(result.current.totalSize).toBe(8000); // 100 * 80
  });

  it('아이템 높이를 동적으로 계산한다', () => {
    const parentRef = { current: document.createElement('div') };
    const estimateSize = vi.fn((index) => 50 + index * 10);
    
    renderHook(() => 
      useVirtualScroll({
        items: Array(10).fill(null),
        parentRef,
        estimateSize,
      })
    );

    // estimateSize 함수가 호출되었는지 확인
    expect(estimateSize).toHaveBeenCalled();
  });

  it('특정 인덱스로 스크롤한다', () => {
    const parentRef = { current: document.createElement('div') };
    const { result } = renderHook(() => 
      useVirtualScroll({
        items: Array(100).fill(null),
        parentRef,
      })
    );

    act(() => {
      result.current.scrollToIndex(50);
    });

    expect(mockScrollToIndex).toHaveBeenCalledWith(50, expect.any(Object));
  });

  it('오프셋으로 스크롤한다', () => {
    const parentRef = { current: document.createElement('div') };
    const { result } = renderHook(() => 
      useVirtualScroll({
        items: Array(100).fill(null),
        parentRef,
      })
    );

    act(() => {
      result.current.scrollToOffset(1000);
    });

    expect(mockScrollToOffset).toHaveBeenCalledWith(1000);
  });

  it('스크롤 맨 위로 이동한다', () => {
    const parentRef = { current: document.createElement('div') };
    const { result } = renderHook(() => 
      useVirtualScroll({
        items: Array(100).fill(null),
        parentRef,
      })
    );

    act(() => {
      result.current.scrollToTop();
    });

    expect(mockScrollToOffset).toHaveBeenCalledWith(0);
  });

  it('스크롤 맨 아래로 이동한다', () => {
    const parentRef = { current: document.createElement('div') };
    const { result } = renderHook(() => 
      useVirtualScroll({
        items: Array(100).fill(null),
        parentRef,
      })
    );

    act(() => {
      result.current.scrollToBottom();
    });

    expect(mockScrollToIndex).toHaveBeenCalledWith(99, expect.objectContaining({
      align: 'end'
    }));
  });

  it('오버스캔 설정을 적용한다', () => {
    const parentRef = { current: document.createElement('div') };
    renderHook(() => 
      useVirtualScroll({
        items: Array(100).fill(null),
        parentRef,
        overscan: 10,
      })
    );

    const options = (global as any).lastVirtualizerOptions;
    expect(options.overscan).toBe(10);
  });

  it('수평 스크롤 모드를 지원한다', () => {
    const parentRef = { current: document.createElement('div') };
    renderHook(() => 
      useVirtualScroll({
        items: Array(100).fill(null),
        parentRef,
        horizontal: true,
      })
    );

    const options = (global as any).lastVirtualizerOptions;
    expect(options.horizontal).toBe(true);
  });

  it('아이템 변경 시 스크롤 위치를 유지한다', () => {
    const parentRef = { current: document.createElement('div') };
    const { result, rerender } = renderHook(
      ({ items }) => useVirtualScroll({ items, parentRef }),
      { initialProps: { items: Array(100).fill(null) } }
    );

    // 스크롤 위치 변경
    act(() => {
      result.current.scrollToOffset(500);
    });

    const callCount = mockScrollToOffset.mock.calls.length;

    // 아이템 변경
    rerender({ items: Array(90).fill(null) });

    // scrollToOffset이 추가로 호출되지 않음 (위치 유지)
    expect(mockScrollToOffset.mock.calls.length).toBe(callCount);
  });

  it('가시 범위 정보를 제공한다', () => {
    const parentRef = { current: document.createElement('div') };
    const { result } = renderHook(() => 
      useVirtualScroll({
        items: Array(100).fill(null),
        parentRef,
      })
    );

    expect(result.current.visibleRange).toEqual({
      startIndex: 0,
      endIndex: 2,
    });
  });

  it('스크롤 위치 정보를 제공한다', () => {
    const parentRef = { current: document.createElement('div') };
    const { result } = renderHook(() => 
      useVirtualScroll({
        items: Array(100).fill(null),
        parentRef,
      })
    );

    expect(result.current.scrollOffset).toBe(0);
  });

  it('요소 측정 함수를 제공한다', () => {
    const parentRef = { current: document.createElement('div') };
    const { result } = renderHook(() => 
      useVirtualScroll({
        items: Array(100).fill(null),
        parentRef,
      })
    );

    const element = document.createElement('div');
    result.current.measureElement(element);

    expect(mockMeasureElement).toHaveBeenCalledWith(element);
  });

  it('스크롤 방향을 감지한다', () => {
    const parentRef = { current: document.createElement('div') };
    const onScrollDirectionChange = vi.fn();
    
    renderHook(() => 
      useVirtualScroll({
        items: Array(100).fill(null),
        parentRef,
        onScrollDirectionChange,
      })
    );

    const options = (global as any).lastVirtualizerOptions;
    
    // 스크롤 다운
    act(() => {
      options.onChange?.({ scrollOffset: 100 });
    });

    // 스크롤 업
    act(() => {
      options.onChange?.({ scrollOffset: 50 });
    });

    expect(onScrollDirectionChange).toHaveBeenCalledWith('down');
    expect(onScrollDirectionChange).toHaveBeenCalledWith('up');
  });

  it('스무스 스크롤 옵션을 지원한다', () => {
    const parentRef = { current: document.createElement('div') };
    const { result } = renderHook(() => 
      useVirtualScroll({
        items: Array(100).fill(null),
        parentRef,
        smoothScroll: true,
      })
    );

    act(() => {
      result.current.scrollToIndex(50);
    });

    expect(mockScrollToIndex).toHaveBeenCalledWith(50, expect.objectContaining({
      behavior: 'smooth'
    }));
  });
});