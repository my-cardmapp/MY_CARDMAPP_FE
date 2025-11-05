import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent, within } from '@testing-library/react';
import { SavedRoutesList } from './SavedRoutesList';
import { useRouteSharing } from '@/hooks/useRouteSharing';
import type { Route } from '@/types/route';

// Mock the hook
vi.mock('@/hooks/useRouteSharing');

describe('SavedRoutesList', () => {
  const mockRoute: Route = {
    summary: 'Test Route',
    distance: 1500,
    duration: 900,
    polyline: 'encoded',
    steps: [],
  };

  const mockSavedRoutes = [
    {
      id: 'route-1',
      name: 'Home to Work',
      route: mockRoute,
      origin: {
        name: 'Home',
        location: { lat: 37.5547, lng: 126.9707 },
      },
      destination: {
        name: 'Work',
        location: { lat: 37.4979, lng: 127.0276 },
      },
      mode: 'transit' as const,
      timestamp: Date.now() - 86400000, // 1 day ago
    },
    {
      id: 'route-2',
      name: 'Shopping Route',
      route: mockRoute,
      origin: {
        name: 'Home',
        location: { lat: 37.5547, lng: 126.9707 },
      },
      destination: {
        name: 'Mall',
        location: { lat: 37.5063, lng: 127.0536 },
      },
      mode: 'walking' as const,
      timestamp: Date.now() - 3600000, // 1 hour ago
    },
  ];

  const mockRouteHistory = [
    {
      id: 'history-1',
      name: 'Recent Trip',
      route: mockRoute,
      origin: {
        name: 'Station A',
        location: { lat: 37.5547, lng: 126.9707 },
      },
      destination: {
        name: 'Station B',
        location: { lat: 37.4979, lng: 127.0276 },
      },
      mode: 'walking' as const,
      timestamp: Date.now() - 1800000, // 30 minutes ago
    },
  ];

  const mockDeleteRoute = vi.fn();
  const mockClearAllRoutes = vi.fn();
  const mockClearHistory = vi.fn();
  const mockOnRouteLoad = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    (useRouteSharing as any).mockReturnValue({
      savedRoutes: mockSavedRoutes,
      routeHistory: mockRouteHistory,
      deleteRoute: mockDeleteRoute,
      clearAllRoutes: mockClearAllRoutes,
      clearHistory: mockClearHistory,
    });
  });

  it('should render saved routes', () => {
    render(<SavedRoutesList onRouteLoad={mockOnRouteLoad} />);

    expect(screen.getByText('Home to Work')).toBeInTheDocument();
    expect(screen.getByText('Shopping Route')).toBeInTheDocument();
  });

  it('should display route details', () => {
    render(<SavedRoutesList onRouteLoad={mockOnRouteLoad} />);

    expect(screen.getByText(/Home → Work/)).toBeInTheDocument();
    expect(screen.getByText(/대중교통/)).toBeInTheDocument();
    expect(screen.getByText(/도보/)).toBeInTheDocument();
  });

  it('should load route on click', () => {
    render(<SavedRoutesList onRouteLoad={mockOnRouteLoad} />);

    const firstRoute = screen.getByText('Home to Work').closest('div');
    fireEvent.click(firstRoute!);

    expect(mockOnRouteLoad).toHaveBeenCalledWith(
      mockSavedRoutes[0].origin,
      mockSavedRoutes[0].destination,
      mockSavedRoutes[0].waypoints,
      mockSavedRoutes[0].mode
    );
  });

  it('should delete individual route', () => {
    render(<SavedRoutesList onRouteLoad={mockOnRouteLoad} />);

    // Find all delete buttons (excluding "모두 삭제")
    const deleteButtons = screen.getAllByRole('button', { name: /^삭제$/i });
    expect(deleteButtons).toHaveLength(2); // Two saved routes
    
    fireEvent.click(deleteButtons[0]);

    expect(mockDeleteRoute).toHaveBeenCalledWith('route-1');
  });

  it('should clear all saved routes', () => {
    render(<SavedRoutesList onRouteLoad={mockOnRouteLoad} />);

    const clearButton = screen.getByRole('button', { name: /모두 삭제/i });
    fireEvent.click(clearButton);

    expect(mockClearAllRoutes).toHaveBeenCalled();
  });

  it('should show route history', () => {
    render(<SavedRoutesList onRouteLoad={mockOnRouteLoad} showHistory />);

    // Click on the history tab
    const historyTab = screen.getByRole('tab', { name: /최근 경로/i });
    fireEvent.click(historyTab);

    expect(screen.getByText('Recent Trip')).toBeInTheDocument();
    expect(screen.getByText(/Station A → Station B/)).toBeInTheDocument();
  });

  it('should clear history', () => {
    render(<SavedRoutesList onRouteLoad={mockOnRouteLoad} showHistory />);

    // Click on the history tab first
    const historyTab = screen.getByRole('tab', { name: /최근 경로/i });
    fireEvent.click(historyTab);

    const clearHistoryButton = screen.getByRole('button', { name: /기록 삭제/i });
    fireEvent.click(clearHistoryButton);

    expect(mockClearHistory).toHaveBeenCalled();
  });

  it('should format timestamps correctly', () => {
    render(<SavedRoutesList onRouteLoad={mockOnRouteLoad} />);

    // Should show relative time
    expect(screen.getByText(/1일 전/i)).toBeInTheDocument();
    expect(screen.getByText(/1시간 전/i)).toBeInTheDocument();
  });

  it('should show empty state when no routes', () => {
    (useRouteSharing as any).mockReturnValue({
      savedRoutes: [],
      routeHistory: [],
      deleteRoute: mockDeleteRoute,
      clearAllRoutes: mockClearAllRoutes,
      clearHistory: mockClearHistory,
    });

    render(<SavedRoutesList onRouteLoad={mockOnRouteLoad} />);

    expect(screen.getByText(/저장된 경로가 없습니다/i)).toBeInTheDocument();
  });

  it('should handle tab switching between saved and history', () => {
    render(<SavedRoutesList onRouteLoad={mockOnRouteLoad} showHistory />);

    const historyTab = screen.getByRole('tab', { name: /최근 경로/i });
    fireEvent.click(historyTab);

    expect(screen.getByText('Recent Trip')).toBeInTheDocument();

    const savedTab = screen.getByRole('tab', { name: /저장된 경로/i });
    fireEvent.click(savedTab);

    expect(screen.getByText('Home to Work')).toBeInTheDocument();
  });

  it('should prevent event bubbling on delete', () => {
    render(<SavedRoutesList onRouteLoad={mockOnRouteLoad} />);

    // Find the first delete button (exact match to avoid "모두 삭제")
    const deleteButtons = screen.getAllByRole('button', { name: /^삭제$/i });
    
    fireEvent.click(deleteButtons[0]);

    expect(mockDeleteRoute).toHaveBeenCalledWith('route-1');
    expect(mockOnRouteLoad).not.toHaveBeenCalled();
  });
});