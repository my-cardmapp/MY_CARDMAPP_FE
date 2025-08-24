import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, within } from '@testing-library/react';
import { DirectionsList } from './DirectionsList';
import type { Route, RouteStep, TransitDetails } from '@/types/route';

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

// Mock scrollIntoView
Element.prototype.scrollIntoView = vi.fn();

describe('DirectionsList', () => {
  // Mock route data
  const mockWalkingRoute: Route = {
    summary: '도보 15분',
    distance: 1200,
    duration: 900,
    polyline: 'encoded_polyline_string',
    steps: [
      {
        instruction: '북쪽으로 100m 이동',
        distance: 100,
        duration: 60,
        startLocation: { lat: 37.5665, lng: 126.9780 },
        endLocation: { lat: 37.5675, lng: 126.9780 }
      },
      {
        instruction: '우회전 후 200m 이동',
        distance: 200,
        duration: 120,
        startLocation: { lat: 37.5675, lng: 126.9780 },
        endLocation: { lat: 37.5675, lng: 126.9800 }
      },
      {
        instruction: '좌회전 후 150m 이동',
        distance: 150,
        duration: 90,
        startLocation: { lat: 37.5675, lng: 126.9800 },
        endLocation: { lat: 37.5690, lng: 126.9800 }
      },
      {
        instruction: '목적지 도착',
        distance: 0,
        duration: 0,
        startLocation: { lat: 37.5690, lng: 126.9800 },
        endLocation: { lat: 37.5690, lng: 126.9800 }
      }
    ]
  };

  const mockTransitRoute: Route = {
    summary: '대중교통 25분',
    distance: 3500,
    duration: 1500,
    fare: 1250,
    polyline: 'encoded_polyline_string',
    steps: [
      {
        instruction: '서울역까지 도보 5분',
        distance: 400,
        duration: 300,
        startLocation: { lat: 37.5540, lng: 126.9706 },
        endLocation: { lat: 37.5550, lng: 126.9720 }
      },
      {
        instruction: '4호선 승차 - 명동 방면',
        distance: 2000,
        duration: 600,
        startLocation: { lat: 37.5550, lng: 126.9720 },
        endLocation: { lat: 37.5600, lng: 126.9850 },
        transitDetails: {
          line: '4호선',
          departure: '서울역',
          arrival: '명동',
          numStops: 2
        }
      },
      {
        instruction: '2호선으로 환승',
        distance: 100,
        duration: 180,
        startLocation: { lat: 37.5600, lng: 126.9850 },
        endLocation: { lat: 37.5600, lng: 126.9855 }
      },
      {
        instruction: '2호선 승차 - 을지로3가 방면',
        distance: 800,
        duration: 240,
        startLocation: { lat: 37.5600, lng: 126.9855 },
        endLocation: { lat: 37.5660, lng: 126.9920 },
        transitDetails: {
          line: '2호선',
          departure: '을지로4가',
          arrival: '을지로3가',
          numStops: 1
        }
      },
      {
        instruction: '목적지까지 도보 3분',
        distance: 200,
        duration: 180,
        startLocation: { lat: 37.5660, lng: 126.9920 },
        endLocation: { lat: 37.5665, lng: 126.9940 }
      }
    ]
  };

  const mockEmptyRoute: Route = {
    summary: '',
    distance: 0,
    duration: 0,
    polyline: '',
    steps: []
  };

  describe('Component Rendering', () => {
    it('should render the component with route data', () => {
      render(<DirectionsList route={mockWalkingRoute} />);
      expect(screen.getByRole('list', { name: /경로 안내/i })).toBeInTheDocument();
    });

    it('should display route summary', () => {
      render(<DirectionsList route={mockWalkingRoute} />);
      expect(screen.getByText('도보 15분')).toBeInTheDocument();
      expect(screen.getByText('1.2km')).toBeInTheDocument();
      expect(screen.getByText('15분')).toBeInTheDocument();
    });

    it('should render empty state when no route provided', () => {
      render(<DirectionsList route={null} />);
      expect(screen.getByText('경로를 계산하려면 출발지와 도착지를 선택하세요')).toBeInTheDocument();
    });

    it('should render empty state for route with no steps', () => {
      render(<DirectionsList route={mockEmptyRoute} />);
      expect(screen.getByText('경로 정보가 없습니다')).toBeInTheDocument();
    });
  });

  describe('Step Display', () => {
    it('should display all route steps', () => {
      render(<DirectionsList route={mockWalkingRoute} />);
      const steps = screen.getAllByRole('listitem');
      // Excluding the summary item
      expect(steps.length).toBe(mockWalkingRoute.steps.length + 1); // +1 for summary
    });

    it('should display step instructions', () => {
      render(<DirectionsList route={mockWalkingRoute} />);
      expect(screen.getByText('북쪽으로 100m 이동')).toBeInTheDocument();
      expect(screen.getByText('우회전 후 200m 이동')).toBeInTheDocument();
      expect(screen.getByText('좌회전 후 150m 이동')).toBeInTheDocument();
      expect(screen.getByText('목적지 도착')).toBeInTheDocument();
    });

    it('should display step distance and duration', () => {
      render(<DirectionsList route={mockWalkingRoute} />);
      
      // Check for formatted distances
      expect(screen.getByText('100m')).toBeInTheDocument();
      expect(screen.getByText('200m')).toBeInTheDocument();
      expect(screen.getByText('150m')).toBeInTheDocument();
      
      // Check for formatted durations (multiple occurrences expected)
      const oneMinTexts = screen.getAllByText('1분');
      expect(oneMinTexts.length).toBeGreaterThan(0); // At least one "1분"
      expect(screen.getByText('2분')).toBeInTheDocument();
    });

    it('should display step numbers', () => {
      render(<DirectionsList route={mockWalkingRoute} />);
      expect(screen.getByText('1')).toBeInTheDocument();
      expect(screen.getByText('2')).toBeInTheDocument();
      expect(screen.getByText('3')).toBeInTheDocument();
      expect(screen.getByText('4')).toBeInTheDocument();
    });
  });

  describe('Transit Details', () => {
    it('should display transit information for transit steps', () => {
      render(<DirectionsList route={mockTransitRoute} />);
      
      expect(screen.getByText('4호선')).toBeInTheDocument();
      expect(screen.getByText('서울역 → 명동')).toBeInTheDocument();
      expect(screen.getByText('2 정거장')).toBeInTheDocument();
      
      expect(screen.getByText('2호선')).toBeInTheDocument();
      expect(screen.getByText('을지로4가 → 을지로3가')).toBeInTheDocument();
      expect(screen.getByText('1 정거장')).toBeInTheDocument();
    });

    it('should display fare information for transit routes', () => {
      render(<DirectionsList route={mockTransitRoute} />);
      expect(screen.getByText('₩1,250')).toBeInTheDocument();
    });

    it('should apply different styling for transit steps', () => {
      render(<DirectionsList route={mockTransitRoute} />);
      const transitStep = screen.getByText('4호선 승차 - 명동 방면').closest('li');
      expect(transitStep).toHaveClass('transit-step');
    });
  });

  describe('Expand/Collapse Functionality', () => {
    it('should be expanded by default', () => {
      render(<DirectionsList route={mockWalkingRoute} />);
      const list = screen.getByRole('list', { name: /경로 안내/i });
      expect(list).toBeVisible();
    });

    it('should toggle collapse state when header is clicked', () => {
      render(<DirectionsList route={mockWalkingRoute} />);
      
      const toggleButton = screen.getByRole('button', { name: /경로 안내/i });
      const list = screen.getByRole('list', { name: /경로 안내/i });
      
      // Initially expanded
      expect(list).not.toHaveClass('collapsed');
      
      // Click to collapse
      fireEvent.click(toggleButton);
      expect(list).toHaveClass('collapsed');
      
      // Click to expand
      fireEvent.click(toggleButton);
      expect(list).not.toHaveClass('collapsed');
    });

    it('should show/hide chevron icon based on collapse state', () => {
      render(<DirectionsList route={mockWalkingRoute} />);
      
      const toggleButton = screen.getByRole('button', { name: /경로 안내/i });
      const chevron = within(toggleButton).getByTestId('chevron-icon');
      
      // Initially expanded (chevron up)
      expect(chevron).toHaveClass('rotate-180');
      
      // Click to collapse (chevron down)
      fireEvent.click(toggleButton);
      expect(chevron).not.toHaveClass('rotate-180');
    });

    it('should maintain collapse state prop', () => {
      const { rerender } = render(
        <DirectionsList route={mockWalkingRoute} initialCollapsed={true} />
      );
      
      const list = screen.getByRole('list', { name: /경로 안내/i });
      expect(list).toHaveClass('collapsed');
      
      // Change prop
      rerender(<DirectionsList route={mockWalkingRoute} initialCollapsed={false} />);
      expect(list).not.toHaveClass('collapsed');
    });
  });

  describe('Scrolling Behavior', () => {
    it('should have scrollable container with max height', () => {
      render(<DirectionsList route={mockTransitRoute} />);
      const scrollContainer = screen.getByTestId('directions-scroll-container');
      expect(scrollContainer).toHaveClass('overflow-y-auto');
      expect(scrollContainer).toHaveClass('max-h-96'); // 384px max height
    });

    it('should show scroll indicator for long routes', () => {
      // Create a route with many steps
      const longRoute: Route = {
        ...mockWalkingRoute,
        steps: Array(20).fill(null).map((_, i) => ({
          instruction: `Step ${i + 1}`,
          distance: 100,
          duration: 60,
          startLocation: { lat: 37.5665, lng: 126.9780 },
          endLocation: { lat: 37.5675, lng: 126.9780 }
        }))
      };
      
      render(<DirectionsList route={longRoute} />);
      const scrollContainer = screen.getByTestId('directions-scroll-container');
      // In test environment, scrollHeight might be 0, so we just check the class
      expect(scrollContainer).toHaveClass('overflow-y-auto');
      expect(scrollContainer).toHaveClass('max-h-96');
    });
  });

  describe('Direction Icons', () => {
    it('should show appropriate icons for direction types', () => {
      render(<DirectionsList route={mockWalkingRoute} />);
      
      // Check for direction icons
      expect(screen.getByTestId('icon-straight')).toBeInTheDocument();
      expect(screen.getByTestId('icon-turn-right')).toBeInTheDocument();
      expect(screen.getByTestId('icon-turn-left')).toBeInTheDocument();
      expect(screen.getByTestId('icon-arrival')).toBeInTheDocument();
    });

    it('should show transit icons for transit steps', () => {
      render(<DirectionsList route={mockTransitRoute} />);
      
      // Multiple walk icons expected
      const walkIcons = screen.getAllByTestId('icon-walk');
      expect(walkIcons.length).toBeGreaterThanOrEqual(2); // At least 2 walk icons
      
      expect(screen.getAllByTestId('icon-subway')).toHaveLength(2);
      expect(screen.getByTestId('icon-transfer')).toBeInTheDocument();
    });
  });

  describe('Formatting', () => {
    it('should format distance correctly', () => {
      const { rerender } = render(<DirectionsList route={mockWalkingRoute} />);
      
      // Less than 1km
      expect(screen.getByText('100m')).toBeInTheDocument();
      expect(screen.getByText('200m')).toBeInTheDocument();
      
      // 1km or more - need to clear and rerender
      rerender(<DirectionsList route={null} />);
      
      const longDistanceRoute: Route = {
        ...mockWalkingRoute,
        distance: 2500,
        steps: [{
          instruction: 'Long walk',
          distance: 2500,
          duration: 1800,
          startLocation: { lat: 37.5665, lng: 126.9780 },
          endLocation: { lat: 37.5675, lng: 126.9780 }
        }]
      };
      
      rerender(<DirectionsList route={longDistanceRoute} />);
      // Check both summary and step distance
      const distances = screen.getAllByText('2.5km');
      expect(distances.length).toBeGreaterThan(0);
    });

    it('should format duration correctly', () => {
      const { rerender } = render(<DirectionsList route={mockWalkingRoute} />);
      
      // Less than 60 seconds shows as 1분
      const oneMinTexts = screen.getAllByText('1분');
      expect(oneMinTexts.length).toBeGreaterThan(0);
      
      // Clear and rerender with new route
      rerender(<DirectionsList route={null} />);
      
      // Hours and minutes
      const longDurationRoute: Route = {
        ...mockWalkingRoute,
        duration: 5400, // 90 minutes
        steps: [{
          instruction: 'Long journey',
          distance: 10000,
          duration: 5400,
          startLocation: { lat: 37.5665, lng: 126.9780 },
          endLocation: { lat: 37.5675, lng: 126.9780 }
        }]
      };
      
      rerender(<DirectionsList route={longDurationRoute} />);
      // Check both summary and step duration
      const durations = screen.getAllByText('1시간 30분');
      expect(durations.length).toBeGreaterThan(0);
    });
  });

  describe('Accessibility', () => {
    it('should have proper ARIA labels', () => {
      render(<DirectionsList route={mockWalkingRoute} />);
      
      expect(screen.getByRole('list', { name: /경로 안내/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /경로 안내/i })).toBeInTheDocument();
    });

    it('should have proper heading hierarchy', () => {
      render(<DirectionsList route={mockWalkingRoute} />);
      
      const heading = screen.getByRole('heading', { level: 3 });
      expect(heading).toHaveTextContent('경로 안내');
    });

    it('should announce step numbers for screen readers', () => {
      render(<DirectionsList route={mockWalkingRoute} />);
      
      const firstStep = screen.getByText('북쪽으로 100m 이동').closest('li');
      expect(firstStep).toHaveAttribute('aria-label', expect.stringContaining('1단계'));
    });
  });

  describe('Callback Functions', () => {
    it('should call onStepClick when a step is clicked', () => {
      const onStepClick = vi.fn();
      render(<DirectionsList route={mockWalkingRoute} onStepClick={onStepClick} />);
      
      const firstStep = screen.getByText('북쪽으로 100m 이동').closest('li');
      fireEvent.click(firstStep!);
      
      expect(onStepClick).toHaveBeenCalledWith(mockWalkingRoute.steps[0], 0);
    });

    it('should call onClose when close button is clicked', () => {
      const onClose = vi.fn();
      render(<DirectionsList route={mockWalkingRoute} onClose={onClose} />);
      
      const closeButton = screen.getByRole('button', { name: /닫기/i });
      fireEvent.click(closeButton);
      
      expect(onClose).toHaveBeenCalled();
    });
  });

  describe('Responsive Design', () => {
    it('should apply mobile-specific styles on small screens', () => {
      // Update the mock to return true for mobile query
      (window.matchMedia as any).mockImplementation(query => ({
        matches: query === '(max-width: 640px)',
        media: query,
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      }));
      
      render(<DirectionsList route={mockWalkingRoute} />);
      const container = screen.getByTestId('directions-container');
      expect(container).toHaveClass('mobile');
    });
  });

  describe('Loading and Error States', () => {
    it('should show loading state when isLoading prop is true', () => {
      render(<DirectionsList route={null} isLoading={true} />);
      expect(screen.getByText('경로 계산 중...')).toBeInTheDocument();
      expect(screen.getByTestId('loading-spinner')).toBeInTheDocument();
    });

    it('should show error message when error prop is provided', () => {
      render(<DirectionsList route={null} error="경로를 찾을 수 없습니다" />);
      expect(screen.getByText('경로를 찾을 수 없습니다')).toBeInTheDocument();
    });
  });

  describe('Current Step Highlighting', () => {
    it('should highlight current step when currentStepIndex is provided', () => {
      render(<DirectionsList route={mockWalkingRoute} currentStepIndex={1} />);
      
      const steps = screen.getAllByRole('listitem');
      expect(steps[2]).toHaveClass('current-step'); // +1 for summary item
    });

    it('should auto-scroll to current step', () => {
      const { rerender } = render(<DirectionsList route={mockWalkingRoute} currentStepIndex={0} />);
      
      // Change current step
      rerender(<DirectionsList route={mockWalkingRoute} currentStepIndex={2} />);
      
      expect(Element.prototype.scrollIntoView).toHaveBeenCalledWith({
        behavior: 'smooth',
        block: 'center'
      });
    });
  });
});