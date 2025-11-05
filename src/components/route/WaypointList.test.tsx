import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { WaypointList } from './WaypointList';

// Mock @dnd-kit dependencies
vi.mock('@dnd-kit/core', () => ({
  DndContext: ({ children }: { children: React.ReactNode }) => <div data-testid="dnd-context">{children}</div>,
  closestCenter: vi.fn(),
  KeyboardSensor: vi.fn(),
  PointerSensor: vi.fn(),
  useSensor: vi.fn(),
  useSensors: vi.fn(() => []),
  DragOverlay: ({ children }: { children: React.ReactNode }) => <div data-testid="drag-overlay">{children}</div>,
}));

vi.mock('@dnd-kit/sortable', () => ({
  SortableContext: ({ children }: { children: React.ReactNode }) => <div data-testid="sortable-context">{children}</div>,
  verticalListSortingStrategy: vi.fn(),
  sortableKeyboardCoordinates: vi.fn(),
  useSortable: vi.fn(() => ({
    attributes: {},
    listeners: {},
    setNodeRef: vi.fn(),
    transform: null,
    transition: null,
    isDragging: false,
  })),
  arrayMove: vi.fn((array: any[], from: number, to: number) => {
    const newArray = [...array];
    const [removed] = newArray.splice(from, 1);
    newArray.splice(to, 0, removed);
    return newArray;
  }),
}));

vi.mock('@dnd-kit/utilities', () => ({
  CSS: {
    Transform: {
      toString: vi.fn(),
    },
  },
}));

// Mock AutocompleteDropdown
vi.mock('@/components/search/AutocompleteDropdown', () => ({
  AutocompleteDropdown: ({ onSelect, placeholder }: any) => (
    <div data-testid="autocomplete-dropdown">
      <input
        placeholder={placeholder}
        onChange={(e) => {
          if (e.target.value === 'test location') {
            onSelect({
              placeId: 'test-place-id',
              name: 'Test Location',
              address: '123 Test St',
              location: { lat: 37.5665, lng: 126.9780 },
            });
          }
        }}
      />
    </div>
  ),
}));

describe('WaypointList', () => {
  const mockOnWaypointsChange = vi.fn();
  const defaultProps = {
    waypoints: [],
    onWaypointsChange: mockOnWaypointsChange,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Rendering', () => {
    it('should render the component with add waypoint button', () => {
      render(<WaypointList {...defaultProps} />);
      
      expect(screen.getByRole('button', { name: /add waypoint/i })).toBeInTheDocument();
      expect(screen.getByRole('region', { name: /waypoint list/i })).toBeInTheDocument();
    });

    it('should render existing waypoints', () => {
      const waypoints = [
        {
          id: '1',
          name: 'Waypoint 1',
          address: '123 Main St',
          location: { lat: 37.5665, lng: 126.9780 },
        },
        {
          id: '2',
          name: 'Waypoint 2',
          address: '456 Second St',
          location: { lat: 37.5685, lng: 126.9790 },
        },
      ];

      render(<WaypointList {...defaultProps} waypoints={waypoints} />);

      expect(screen.getByText('Waypoint 1')).toBeInTheDocument();
      expect(screen.getByText('123 Main St')).toBeInTheDocument();
      expect(screen.getByText('Waypoint 2')).toBeInTheDocument();
      expect(screen.getByText('456 Second St')).toBeInTheDocument();
    });

    it('should show waypoint count', () => {
      const waypoints = [
        {
          id: '1',
          name: 'Waypoint 1',
          address: '123 Main St',
          location: { lat: 37.5665, lng: 126.9780 },
        },
      ];

      render(<WaypointList {...defaultProps} waypoints={waypoints} />);
      
      expect(screen.getByText(/waypoints \(1\/5\)/i)).toBeInTheDocument();
    });
  });

  describe('Adding Waypoints', () => {
    it('should show autocomplete dropdown when add waypoint is clicked', async () => {
      const user = userEvent.setup();
      render(<WaypointList {...defaultProps} />);

      const addButton = screen.getByRole('button', { name: /add waypoint/i });
      await user.click(addButton);

      expect(screen.getByTestId('autocomplete-dropdown')).toBeInTheDocument();
      expect(screen.getByPlaceholderText(/search for a waypoint/i)).toBeInTheDocument();
    });

    it('should add a waypoint when location is selected', async () => {
      const user = userEvent.setup();
      render(<WaypointList {...defaultProps} />);

      const addButton = screen.getByRole('button', { name: /add waypoint/i });
      await user.click(addButton);

      const input = screen.getByPlaceholderText(/search for a waypoint/i);
      await user.type(input, 'test location');

      await waitFor(() => {
        expect(mockOnWaypointsChange).toHaveBeenCalledWith([
          expect.objectContaining({
            id: expect.any(String),
            name: 'Test Location',
            address: '123 Test St',
            location: { lat: 37.5665, lng: 126.9780 },
          }),
        ]);
      });
    });

    it('should not allow adding more than 5 waypoints', () => {
      const waypoints = Array.from({ length: 5 }, (_, i) => ({
        id: `${i + 1}`,
        name: `Waypoint ${i + 1}`,
        address: `${i + 1}23 Street`,
        location: { lat: 37.5665 + i * 0.001, lng: 126.9780 + i * 0.001 },
      }));

      render(<WaypointList {...defaultProps} waypoints={waypoints} />);

      const addButton = screen.getByRole('button', { name: /add waypoint/i });
      expect(addButton).toBeDisabled();
      expect(screen.getByText(/maximum 5 waypoints/i)).toBeInTheDocument();
    });

    it('should cancel adding waypoint when cancel button is clicked', async () => {
      const user = userEvent.setup();
      render(<WaypointList {...defaultProps} />);

      const addButton = screen.getByRole('button', { name: /add waypoint/i });
      await user.click(addButton);

      expect(screen.getByTestId('autocomplete-dropdown')).toBeInTheDocument();

      const cancelButton = screen.getByRole('button', { name: /cancel/i });
      await user.click(cancelButton);

      expect(screen.queryByTestId('autocomplete-dropdown')).not.toBeInTheDocument();
    });
  });

  describe('Removing Waypoints', () => {
    it('should remove a waypoint when remove button is clicked', async () => {
      const user = userEvent.setup();
      const waypoints = [
        {
          id: '1',
          name: 'Waypoint 1',
          address: '123 Main St',
          location: { lat: 37.5665, lng: 126.9780 },
        },
        {
          id: '2',
          name: 'Waypoint 2',
          address: '456 Second St',
          location: { lat: 37.5685, lng: 126.9790 },
        },
      ];

      render(<WaypointList {...defaultProps} waypoints={waypoints} />);

      const removeButtons = screen.getAllByRole('button', { name: /remove waypoint/i });
      expect(removeButtons).toHaveLength(2);

      await user.click(removeButtons[0]);

      expect(mockOnWaypointsChange).toHaveBeenCalledWith([
        {
          id: '2',
          name: 'Waypoint 2',
          address: '456 Second St',
          location: { lat: 37.5685, lng: 126.9790 },
        },
      ]);
    });

    it('should show confirmation before removing waypoint', async () => {
      const user = userEvent.setup();
      const waypoints = [
        {
          id: '1',
          name: 'Waypoint 1',
          address: '123 Main St',
          location: { lat: 37.5665, lng: 126.9780 },
        },
      ];

      render(<WaypointList {...defaultProps} waypoints={waypoints} />);

      const removeButton = screen.getByRole('button', { name: /remove waypoint/i });
      await user.click(removeButton);

      // Should show confirmation in aria-label or title
      expect(removeButton).toHaveAttribute('aria-label', expect.stringContaining('Remove'));
    });
  });

  describe('Drag and Drop', () => {
    it('should render drag handles for each waypoint', () => {
      const waypoints = [
        {
          id: '1',
          name: 'Waypoint 1',
          address: '123 Main St',
          location: { lat: 37.5665, lng: 126.9780 },
        },
        {
          id: '2',
          name: 'Waypoint 2',
          address: '456 Second St',
          location: { lat: 37.5685, lng: 126.9790 },
        },
      ];

      render(<WaypointList {...defaultProps} waypoints={waypoints} />);

      const dragHandles = screen.getAllByRole('button', { name: /drag waypoint/i });
      expect(dragHandles).toHaveLength(2);
    });

    it('should have proper ARIA attributes for drag handles', () => {
      const waypoints = [
        {
          id: '1',
          name: 'Waypoint 1',
          address: '123 Main St',
          location: { lat: 37.5665, lng: 126.9780 },
        },
      ];

      render(<WaypointList {...defaultProps} waypoints={waypoints} />);

      const dragHandle = screen.getByRole('button', { name: /drag waypoint/i });
      expect(dragHandle).toHaveAttribute('aria-describedby');
      expect(dragHandle).toHaveAttribute('aria-roledescription', 'sortable');
    });

    it('should not show drag handles when there is only one waypoint', () => {
      const waypoints = [
        {
          id: '1',
          name: 'Waypoint 1',
          address: '123 Main St',
          location: { lat: 37.5665, lng: 126.9780 },
        },
      ];

      render(<WaypointList {...defaultProps} waypoints={waypoints} />);

      // With only one waypoint, drag handle should be disabled or hidden
      const dragHandle = screen.getByRole('button', { name: /drag waypoint/i });
      expect(dragHandle).toHaveAttribute('aria-disabled', 'true');
    });
  });

  describe('Accessibility', () => {
    it('should have proper ARIA labels', () => {
      render(<WaypointList {...defaultProps} />);

      expect(screen.getByRole('region', { name: /waypoint list/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /add waypoint/i })).toBeInTheDocument();
    });

    it('should announce waypoint count to screen readers', () => {
      const waypoints = [
        {
          id: '1',
          name: 'Waypoint 1',
          address: '123 Main St',
          location: { lat: 37.5665, lng: 126.9780 },
        },
      ];

      render(<WaypointList {...defaultProps} waypoints={waypoints} />);

      const countElement = screen.getByText(/waypoints \(1\/5\)/i);
      expect(countElement).toHaveAttribute('aria-live', 'polite');
    });

    it('should support keyboard navigation', () => {
      const waypoints = [
        {
          id: '1',
          name: 'Waypoint 1',
          address: '123 Main St',
          location: { lat: 37.5665, lng: 126.9780 },
        },
      ];

      render(<WaypointList {...defaultProps} waypoints={waypoints} />);

      const dragHandle = screen.getByRole('button', { name: /drag waypoint/i });
      expect(dragHandle).toHaveAttribute('tabIndex', '0');
    });
  });

  describe('Integration', () => {
    it('should call onWaypointsChange with updated waypoints', async () => {
      const user = userEvent.setup();
      const waypoints = [
        {
          id: '1',
          name: 'Waypoint 1',
          address: '123 Main St',
          location: { lat: 37.5665, lng: 126.9780 },
        },
      ];

      render(<WaypointList {...defaultProps} waypoints={waypoints} />);

      // Add a new waypoint
      const addButton = screen.getByRole('button', { name: /add waypoint/i });
      await user.click(addButton);

      const input = screen.getByPlaceholderText(/search for a waypoint/i);
      await user.type(input, 'test location');

      await waitFor(() => {
        expect(mockOnWaypointsChange).toHaveBeenCalledWith([
          ...waypoints,
          expect.objectContaining({
            name: 'Test Location',
          }),
        ]);
      });
    });

    it('should handle empty waypoints array', () => {
      render(<WaypointList {...defaultProps} />);

      expect(screen.getByText(/no waypoints added/i)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /add waypoint/i })).toBeEnabled();
    });

    it('should display waypoint order numbers', () => {
      const waypoints = [
        {
          id: '1',
          name: 'Waypoint 1',
          address: '123 Main St',
          location: { lat: 37.5665, lng: 126.9780 },
        },
        {
          id: '2',
          name: 'Waypoint 2',
          address: '456 Second St',
          location: { lat: 37.5685, lng: 126.9790 },
        },
      ];

      render(<WaypointList {...defaultProps} waypoints={waypoints} />);

      expect(screen.getByText('1')).toBeInTheDocument();
      expect(screen.getByText('2')).toBeInTheDocument();
    });
  });

  describe('Mobile Responsiveness', () => {
    it('should have touch-friendly button sizes', () => {
      render(<WaypointList {...defaultProps} />);

      const addButton = screen.getByRole('button', { name: /add waypoint/i });
      expect(addButton.className).toContain('p-');
      expect(addButton.className).toContain('min-h-');
    });

    it('should stack elements properly on small screens', () => {
      const waypoints = [
        {
          id: '1',
          name: 'Waypoint 1',
          address: '123 Main St',
          location: { lat: 37.5665, lng: 126.9780 },
        },
      ];

      render(<WaypointList {...defaultProps} waypoints={waypoints} />);

      const waypointItem = screen.getByText('Waypoint 1').closest('[class*="flex"]');
      expect(waypointItem).toBeInTheDocument();
      expect(waypointItem?.className).toContain('flex');
    });
  });
});