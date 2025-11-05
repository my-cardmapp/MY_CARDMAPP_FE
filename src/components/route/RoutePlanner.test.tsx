import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { RoutePlanner } from './RoutePlanner';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { RouteMode } from '@/types/route';

// Mock the useRouteApi hook
vi.mock('@/hooks/useRouteApi', () => ({
  useRouteApi: () => ({
    calculateRoute: vi.fn(),
    optimizeRoute: vi.fn(),
  }),
}));

// Mock the AutocompleteDropdown component
vi.mock('@/components/search/AutocompleteDropdown', () => ({
  AutocompleteDropdown: ({ 
    value, 
    onChange, 
    onSelect, 
    placeholder, 
    label,
    error,
    'data-testid': dataTestId 
  }: any) => (
    <div data-testid={dataTestId}>
      <label>{label}</label>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        data-testid={`${dataTestId}-input`}
        aria-invalid={!!error}
      />
      {error && <span role="alert">{error}</span>}
      <button onClick={() => onSelect({ 
        id: 1, 
        name: '서울역', 
        address: '서울특별시 용산구 한강대로 405',
        location: { lat: 37.5547, lng: 126.9707 }
      })}>
        Select Location
      </button>
    </div>
  ),
}));

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });

  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
};

describe('RoutePlanner', () => {
  let user: ReturnType<typeof userEvent.setup>;

  beforeEach(() => {
    user = userEvent.setup();
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('Component Rendering', () => {
    it('should render origin input field', () => {
      render(<RoutePlanner />, { wrapper: createWrapper() });
      
      expect(screen.getByTestId('route-origin')).toBeInTheDocument();
      expect(screen.getByText('출발지')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('출발지를 입력하세요')).toBeInTheDocument();
    });

    it('should render destination input field', () => {
      render(<RoutePlanner />, { wrapper: createWrapper() });
      
      expect(screen.getByTestId('route-destination')).toBeInTheDocument();
      expect(screen.getByText('도착지')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('도착지를 입력하세요')).toBeInTheDocument();
    });

    it('should render mode selector with all options', () => {
      render(<RoutePlanner />, { wrapper: createWrapper() });
      
      const modeSelector = screen.getByRole('group', { name: /이동 수단/i });
      expect(modeSelector).toBeInTheDocument();
      
      expect(screen.getByRole('radio', { name: /도보/i })).toBeInTheDocument();
      expect(screen.getByRole('radio', { name: /대중교통/i })).toBeInTheDocument();
      expect(screen.getByRole('radio', { name: /자동차/i })).toBeInTheDocument();
    });

    it('should render calculate button', () => {
      render(<RoutePlanner />, { wrapper: createWrapper() });
      
      const button = screen.getByRole('button', { name: /경로 계산/i });
      expect(button).toBeInTheDocument();
    });

    it('should have walking mode selected by default', () => {
      render(<RoutePlanner />, { wrapper: createWrapper() });
      
      const walkingRadio = screen.getByRole('radio', { name: /도보/i });
      expect(walkingRadio).toBeChecked();
    });
  });

  describe('Input Handling', () => {
    it('should handle origin input changes', async () => {
      render(<RoutePlanner />, { wrapper: createWrapper() });
      
      const originInput = screen.getByTestId('route-origin-input');
      await user.type(originInput, '서울');
      
      expect(originInput).toHaveValue('서울');
    });

    it('should handle destination input changes', async () => {
      render(<RoutePlanner />, { wrapper: createWrapper() });
      
      const destInput = screen.getByTestId('route-destination-input');
      await user.type(destInput, '부산');
      
      expect(destInput).toHaveValue('부산');
    });

    it('should handle origin selection from autocomplete', async () => {
      render(<RoutePlanner />, { wrapper: createWrapper() });
      
      const originContainer = screen.getByTestId('route-origin');
      const selectButton = within(originContainer).getByText('Select Location');
      
      await user.click(selectButton);
      
      // After selection, the input should show the selected location name
      const originInput = screen.getByTestId('route-origin-input');
      expect(originInput).toHaveValue('서울역');
    });

    it('should handle destination selection from autocomplete', async () => {
      render(<RoutePlanner />, { wrapper: createWrapper() });
      
      const destContainer = screen.getByTestId('route-destination');
      const selectButton = within(destContainer).getByText('Select Location');
      
      await user.click(selectButton);
      
      const destInput = screen.getByTestId('route-destination-input');
      expect(destInput).toHaveValue('서울역');
    });
  });

  describe('Mode Selection', () => {
    it('should handle mode selection change to transit', async () => {
      render(<RoutePlanner />, { wrapper: createWrapper() });
      
      const transitRadio = screen.getByRole('radio', { name: /대중교통/i });
      await user.click(transitRadio);
      
      expect(transitRadio).toBeChecked();
      expect(screen.getByRole('radio', { name: /도보/i })).not.toBeChecked();
    });

    it('should handle mode selection change to driving', async () => {
      render(<RoutePlanner />, { wrapper: createWrapper() });
      
      const drivingRadio = screen.getByRole('radio', { name: /자동차/i });
      await user.click(drivingRadio);
      
      expect(drivingRadio).toBeChecked();
      expect(screen.getByRole('radio', { name: /도보/i })).not.toBeChecked();
    });
  });

  describe('Route Calculation', () => {
    it('should be disabled when origin is not selected', async () => {
      render(<RoutePlanner />, { wrapper: createWrapper() });
      
      // Select only destination
      const destContainer = screen.getByTestId('route-destination');
      const destSelect = within(destContainer).getByText('Select Location');
      await user.click(destSelect);
      
      const calculateButton = screen.getByRole('button', { name: /경로 계산/i });
      expect(calculateButton).toBeDisabled();
    });

    it('should be disabled when destination is not selected', async () => {
      render(<RoutePlanner />, { wrapper: createWrapper() });
      
      // Select only origin
      const originContainer = screen.getByTestId('route-origin');
      const originSelect = within(originContainer).getByText('Select Location');
      await user.click(originSelect);
      
      const calculateButton = screen.getByRole('button', { name: /경로 계산/i });
      expect(calculateButton).toBeDisabled();
    });

    it('should enable calculate button when both locations are selected', async () => {
      render(<RoutePlanner />, { wrapper: createWrapper() });
      
      // Select origin
      const originContainer = screen.getByTestId('route-origin');
      const originSelect = within(originContainer).getByText('Select Location');
      await user.click(originSelect);
      
      // Select destination
      const destContainer = screen.getByTestId('route-destination');
      const destSelect = within(destContainer).getByText('Select Location');
      await user.click(destSelect);
      
      const calculateButton = screen.getByRole('button', { name: /경로 계산/i });
      expect(calculateButton).not.toBeDisabled();
    });

    it('should call calculateRoute with correct parameters', async () => {
      const mockCalculateRoute = vi.fn().mockResolvedValue({
        data: {
          routes: [{
            summary: '서울역 → 부산역',
            distance: 325000,
            duration: 9000,
            polyline: 'encoded_polyline_string',
            steps: [],
          }],
        },
      });

      vi.mocked(await import('@/hooks/useRouteApi')).useRouteApi = () => ({
        calculateRoute: mockCalculateRoute,
        optimizeRoute: vi.fn(),
      });

      render(<RoutePlanner />, { wrapper: createWrapper() });
      
      // Select origin and destination
      const originContainer = screen.getByTestId('route-origin');
      await user.click(within(originContainer).getByText('Select Location'));
      
      const destContainer = screen.getByTestId('route-destination');
      await user.click(within(destContainer).getByText('Select Location'));
      
      // Select transit mode
      await user.click(screen.getByRole('radio', { name: /대중교통/i }));
      
      // Click calculate
      const calculateButton = screen.getByRole('button', { name: /경로 계산/i });
      await user.click(calculateButton);
      
      await waitFor(() => {
        expect(mockCalculateRoute).toHaveBeenCalledWith({
          origin: { lat: 37.5547, lng: 126.9707 },
          destination: { lat: 37.5547, lng: 126.9707 },
          mode: 'transit',
        });
      });
    });
  });

  describe('Loading State', () => {
    it('should show loading state during calculation', async () => {
      const mockCalculateRoute = vi.fn().mockImplementation(() => 
        new Promise(resolve => setTimeout(resolve, 100))
      );

      vi.mocked(await import('@/hooks/useRouteApi')).useRouteApi = () => ({
        calculateRoute: mockCalculateRoute,
        optimizeRoute: vi.fn(),
      });

      render(<RoutePlanner />, { wrapper: createWrapper() });
      
      // Select locations
      const originContainer = screen.getByTestId('route-origin');
      await user.click(within(originContainer).getByText('Select Location'));
      
      const destContainer = screen.getByTestId('route-destination');
      await user.click(within(destContainer).getByText('Select Location'));
      
      // Click calculate
      const calculateButton = screen.getByRole('button', { name: /경로 계산/i });
      await user.click(calculateButton);
      
      // Should show loading state
      expect(screen.getByText(/계산 중/i)).toBeInTheDocument();
      expect(calculateButton).toBeDisabled();
    });

    it('should hide loading state after calculation completes', async () => {
      const mockCalculateRoute = vi.fn().mockResolvedValue({
        data: {
          routes: [{
            summary: '테스트 경로',
            distance: 1000,
            duration: 600,
            steps: [],
          }],
        },
      });

      vi.mocked(await import('@/hooks/useRouteApi')).useRouteApi = () => ({
        calculateRoute: mockCalculateRoute,
        optimizeRoute: vi.fn(),
      });

      render(<RoutePlanner />, { wrapper: createWrapper() });
      
      // Select locations and calculate
      const originContainer = screen.getByTestId('route-origin');
      await user.click(within(originContainer).getByText('Select Location'));
      
      const destContainer = screen.getByTestId('route-destination');
      await user.click(within(destContainer).getByText('Select Location'));
      
      await user.click(screen.getByRole('button', { name: /경로 계산/i }));
      
      await waitFor(() => {
        expect(screen.queryByText(/계산 중/i)).not.toBeInTheDocument();
      });
    });
  });

  describe('Error Handling', () => {
    it('should show error when route calculation fails', async () => {
      const mockCalculateRoute = vi.fn().mockRejectedValue(
        new Error('경로를 계산할 수 없습니다')
      );

      vi.mocked(await import('@/hooks/useRouteApi')).useRouteApi = () => ({
        calculateRoute: mockCalculateRoute,
        optimizeRoute: vi.fn(),
      });

      render(<RoutePlanner />, { wrapper: createWrapper() });
      
      // Select locations and calculate
      const originContainer = screen.getByTestId('route-origin');
      await user.click(within(originContainer).getByText('Select Location'));
      
      const destContainer = screen.getByTestId('route-destination');
      await user.click(within(destContainer).getByText('Select Location'));
      
      await user.click(screen.getByRole('button', { name: /경로 계산/i }));
      
      await waitFor(() => {
        expect(screen.getByRole('alert')).toHaveTextContent('경로를 계산할 수 없습니다');
      });
    });

    it('should clear error when retrying', async () => {
      let callCount = 0;
      const mockCalculateRoute = vi.fn().mockImplementation(() => {
        callCount++;
        if (callCount === 1) {
          return Promise.reject(new Error('Network error'));
        }
        return Promise.resolve({
          data: {
            routes: [{
              summary: '성공',
              distance: 1000,
              duration: 600,
              steps: [],
            }],
          },
        });
      });

      vi.mocked(await import('@/hooks/useRouteApi')).useRouteApi = () => ({
        calculateRoute: mockCalculateRoute,
        optimizeRoute: vi.fn(),
      });

      render(<RoutePlanner />, { wrapper: createWrapper() });
      
      // Select locations
      const originContainer = screen.getByTestId('route-origin');
      await user.click(within(originContainer).getByText('Select Location'));
      
      const destContainer = screen.getByTestId('route-destination');
      await user.click(within(destContainer).getByText('Select Location'));
      
      // First attempt - should fail
      await user.click(screen.getByRole('button', { name: /경로 계산/i }));
      
      await waitFor(() => {
        expect(screen.getByRole('alert')).toBeInTheDocument();
      });
      
      // Second attempt - should succeed
      await user.click(screen.getByRole('button', { name: /경로 계산/i }));
      
      await waitFor(() => {
        expect(screen.queryByRole('alert')).not.toBeInTheDocument();
      });
    });
  });

  describe('Result Display', () => {
    it('should display route results after successful calculation', async () => {
      const mockCalculateRoute = vi.fn().mockResolvedValue({
        data: {
          routes: [{
            summary: '서울역 → 부산역',
            distance: 325000,
            duration: 9000,
            fare: 45000,
            steps: [
              { instruction: 'KTX 탑승', distance: 325000, duration: 9000 },
            ],
          }],
        },
      });

      vi.mocked(await import('@/hooks/useRouteApi')).useRouteApi = () => ({
        calculateRoute: mockCalculateRoute,
        optimizeRoute: vi.fn(),
      });

      render(<RoutePlanner />, { wrapper: createWrapper() });
      
      // Select locations and calculate
      const originContainer = screen.getByTestId('route-origin');
      await user.click(within(originContainer).getByText('Select Location'));
      
      const destContainer = screen.getByTestId('route-destination');
      await user.click(within(destContainer).getByText('Select Location'));
      
      await user.click(screen.getByRole('button', { name: /경로 계산/i }));
      
      await waitFor(() => {
        // Check distance display
        expect(screen.getByText(/325km/i)).toBeInTheDocument();
        
        // Check duration display
        expect(screen.getByText(/2시간 30분/i)).toBeInTheDocument();
        
        // Check fare display
        expect(screen.getByText(/45,000원/i)).toBeInTheDocument();
      });
    });

    it('should format distance correctly for short distances', async () => {
      const mockCalculateRoute = vi.fn().mockResolvedValue({
        data: {
          routes: [{
            summary: '짧은 경로',
            distance: 850,
            duration: 600,
            steps: [],
          }],
        },
      });

      vi.mocked(await import('@/hooks/useRouteApi')).useRouteApi = () => ({
        calculateRoute: mockCalculateRoute,
        optimizeRoute: vi.fn(),
      });

      render(<RoutePlanner />, { wrapper: createWrapper() });
      
      // Select locations and calculate
      const originContainer = screen.getByTestId('route-origin');
      await user.click(within(originContainer).getByText('Select Location'));
      
      const destContainer = screen.getByTestId('route-destination');
      await user.click(within(destContainer).getByText('Select Location'));
      
      await user.click(screen.getByRole('button', { name: /경로 계산/i }));
      
      await waitFor(() => {
        expect(screen.getByText(/850m/i)).toBeInTheDocument();
        expect(screen.getByText(/10분/i)).toBeInTheDocument();
      });
    });

    it('should display multiple route options when available', async () => {
      const mockCalculateRoute = vi.fn().mockResolvedValue({
        data: {
          routes: [
            {
              summary: '빠른 경로',
              distance: 5000,
              duration: 1800,
              steps: [],
            },
            {
              summary: '저렴한 경로',
              distance: 5500,
              duration: 2100,
              steps: [],
            },
          ],
        },
      });

      vi.mocked(await import('@/hooks/useRouteApi')).useRouteApi = () => ({
        calculateRoute: mockCalculateRoute,
        optimizeRoute: vi.fn(),
      });

      render(<RoutePlanner />, { wrapper: createWrapper() });
      
      // Select locations and calculate
      const originContainer = screen.getByTestId('route-origin');
      await user.click(within(originContainer).getByText('Select Location'));
      
      const destContainer = screen.getByTestId('route-destination');
      await user.click(within(destContainer).getByText('Select Location'));
      
      await user.click(screen.getByRole('button', { name: /경로 계산/i }));
      
      await waitFor(() => {
        expect(screen.getByText(/빠른 경로/i)).toBeInTheDocument();
        expect(screen.getByText(/저렴한 경로/i)).toBeInTheDocument();
      });
    });

    it('should allow clearing results and resetting form', async () => {
      const mockCalculateRoute = vi.fn().mockResolvedValue({
        data: {
          routes: [{
            summary: '테스트 경로',
            distance: 1000,
            duration: 600,
            steps: [],
          }],
        },
      });

      vi.mocked(await import('@/hooks/useRouteApi')).useRouteApi = () => ({
        calculateRoute: mockCalculateRoute,
        optimizeRoute: vi.fn(),
      });

      render(<RoutePlanner />, { wrapper: createWrapper() });
      
      // Calculate route
      const originContainer = screen.getByTestId('route-origin');
      await user.click(within(originContainer).getByText('Select Location'));
      
      const destContainer = screen.getByTestId('route-destination');
      await user.click(within(destContainer).getByText('Select Location'));
      
      await user.click(screen.getByRole('button', { name: /경로 계산/i }));
      
      await waitFor(() => {
        expect(screen.getByText(/1km/i)).toBeInTheDocument();
      });
      
      // Click clear button
      const clearButton = screen.getByRole('button', { name: /초기화/i });
      await user.click(clearButton);
      
      // Results should be cleared
      expect(screen.queryByText(/1km/i)).not.toBeInTheDocument();
      
      // Inputs should be cleared
      expect(screen.getByTestId('route-origin-input')).toHaveValue('');
      expect(screen.getByTestId('route-destination-input')).toHaveValue('');
    });
  });

  describe('Responsive Design', () => {
    it('should be mobile-friendly with stacked layout on small screens', () => {
      // Set viewport to mobile size
      window.innerWidth = 375;
      window.dispatchEvent(new Event('resize'));

      render(<RoutePlanner />, { wrapper: createWrapper() });
      
      const container = screen.getByTestId('route-planner');
      expect(container).toHaveClass('flex-col');
    });

    it('should use horizontal layout on larger screens', () => {
      // Set viewport to desktop size
      window.innerWidth = 1024;
      window.dispatchEvent(new Event('resize'));

      render(<RoutePlanner />, { wrapper: createWrapper() });
      
      const container = screen.getByTestId('route-planner');
      expect(container).toHaveClass('md:flex-row');
    });
  });
});