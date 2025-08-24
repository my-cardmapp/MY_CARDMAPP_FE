import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import { ShareRouteButton } from './ShareRouteButton';
import type { Route } from '@/types/route';

// Mock the clipboard API
const clipboardMock = {
  writeText: vi.fn().mockResolvedValue(undefined),
};

Object.defineProperty(navigator, 'clipboard', {
  value: clipboardMock,
  writable: true,
});

describe('ShareRouteButton', () => {
  const mockRoute: Route = {
    summary: 'Test Route',
    distance: 1500,
    duration: 900,
    fare: 1200,
    polyline: 'encoded_polyline',
    steps: [],
  };

  const mockOrigin = {
    id: 1,
    name: 'Seoul Station',
    address: '서울역',
    location: { lat: 37.5547, lng: 126.9707 },
  };

  const mockDestination = {
    id: 2,
    name: 'Gangnam Station',
    address: '강남역',
    location: { lat: 37.4979, lng: 127.0276 },
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render share button', () => {
    render(
      <ShareRouteButton
        route={mockRoute}
        origin={mockOrigin}
        destination={mockDestination}
        mode="walking"
      />
    );

    const button = screen.getByRole('button', { name: /공유/i });
    expect(button).toBeInTheDocument();
  });

  it('should be disabled when route is not provided', () => {
    render(
      <ShareRouteButton
        route={null}
        origin={mockOrigin}
        destination={mockDestination}
        mode="walking"
      />
    );

    const button = screen.getByRole('button', { name: /공유/i });
    expect(button).toBeDisabled();
  });

  it('should copy URL to clipboard on click', async () => {
    render(
      <ShareRouteButton
        route={mockRoute}
        origin={mockOrigin}
        destination={mockDestination}
        mode="walking"
      />
    );

    const button = screen.getByRole('button', { name: /공유/i });
    fireEvent.click(button);

    await waitFor(() => {
      expect(navigator.clipboard.writeText).toHaveBeenCalledWith(
        expect.stringContaining('origin=')
      );
    });
  });

  it('should show success message after copying', async () => {
    render(
      <ShareRouteButton
        route={mockRoute}
        origin={mockOrigin}
        destination={mockDestination}
        mode="walking"
      />
    );

    const button = screen.getByRole('button', { name: /공유/i });
    fireEvent.click(button);

    await waitFor(() => {
      expect(screen.getByText(/복사되었습니다/i)).toBeInTheDocument();
    });
  });

  it('should show error message on clipboard failure', async () => {
    clipboardMock.writeText.mockRejectedValueOnce(new Error('Clipboard error'));

    render(
      <ShareRouteButton
        route={mockRoute}
        origin={mockOrigin}
        destination={mockDestination}
        mode="walking"
      />
    );

    const button = screen.getByRole('button', { name: /공유/i });
    fireEvent.click(button);

    await waitFor(() => {
      expect(screen.getByText(/복사 실패/i)).toBeInTheDocument();
    });
  });

  it('should handle waypoints in sharing', async () => {
    const waypoints = [
      {
        id: 3,
        name: 'Myeongdong',
        address: '명동',
        location: { lat: 37.5636, lng: 126.9869 },
      },
    ];

    render(
      <ShareRouteButton
        route={mockRoute}
        origin={mockOrigin}
        destination={mockDestination}
        waypoints={waypoints}
        mode="transit"
      />
    );

    const button = screen.getByRole('button', { name: /공유/i });
    fireEvent.click(button);

    await waitFor(() => {
      expect(navigator.clipboard.writeText).toHaveBeenCalledWith(
        expect.stringContaining('waypoints=')
      );
      expect(navigator.clipboard.writeText).toHaveBeenCalledWith(
        expect.stringContaining('mode=transit')
      );
    });
  });

  it('should render with custom className', () => {
    render(
      <ShareRouteButton
        route={mockRoute}
        origin={mockOrigin}
        destination={mockDestination}
        mode="walking"
        className="custom-class"
      />
    );

    const button = screen.getByRole('button', { name: /공유/i });
    expect(button).toHaveClass('custom-class');
  });

  it('should have aria-label for accessibility', () => {
    render(
      <ShareRouteButton
        route={mockRoute}
        origin={mockOrigin}
        destination={mockDestination}
        mode="walking"
      />
    );

    const button = screen.getByRole('button', { name: /공유/i });
    expect(button).toHaveAttribute('aria-label');
  });

  it('should reset success message after timeout', async () => {
    render(
      <ShareRouteButton
        route={mockRoute}
        origin={mockOrigin}
        destination={mockDestination}
        mode="walking"
      />
    );

    const button = screen.getByRole('button', { name: /공유/i });
    fireEvent.click(button);

    // Wait for success message to appear
    await waitFor(() => {
      expect(screen.getByText(/복사되었습니다/i)).toBeInTheDocument();
    });

    // Wait for message to disappear after timeout
    await waitFor(
      () => {
        expect(screen.queryByText(/복사되었습니다/i)).not.toBeInTheDocument();
      },
      { timeout: 4000 }
    );
  });
});