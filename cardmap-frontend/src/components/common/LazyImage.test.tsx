import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { LazyImage } from './LazyImage';

// Mock the useLazyImage hook
vi.mock('@/hooks/useLazyLoad', () => ({
  useLazyImage: vi.fn(() => ({
    imgRef: vi.fn(),
    imgSrc: undefined,
    isLoaded: false,
    isError: false,
  })),
}));

import { useLazyImage } from '@/hooks/useLazyLoad';

describe('LazyImage Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render placeholder initially', () => {
    render(
      <LazyImage
        src="/test-image.jpg"
        alt="Test image"
        width={200}
        height={200}
      />
    );

    const placeholder = screen.getByTestId('lazy-image-placeholder');
    expect(placeholder).toBeInTheDocument();
    expect(placeholder).toHaveClass('animate-pulse');
  });

  it('should render custom placeholder', () => {
    const CustomPlaceholder = () => <div>Loading...</div>;
    
    render(
      <LazyImage
        src="/test-image.jpg"
        alt="Test image"
        placeholder={<CustomPlaceholder />}
      />
    );

    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });

  it('should render image when loaded', async () => {
    const mockUseLazyImage = vi.mocked(useLazyImage);
    mockUseLazyImage.mockReturnValue({
      imgRef: vi.fn(),
      imgSrc: '/test-image.jpg',
      isLoaded: true,
      isError: false,
    });

    render(
      <LazyImage
        src="/test-image.jpg"
        alt="Test image"
        width={200}
        height={200}
      />
    );

    await waitFor(() => {
      const img = screen.getByAltText('Test image');
      expect(img).toBeInTheDocument();
      expect(img).toHaveAttribute('src', '/test-image.jpg');
    });
  });

  it('should apply blur effect during loading', () => {
    const mockUseLazyImage = vi.mocked(useLazyImage);
    mockUseLazyImage.mockReturnValue({
      imgRef: vi.fn(),
      imgSrc: '/test-image.jpg',
      isLoaded: false,
      isError: false,
    });

    render(
      <LazyImage
        src="/test-image.jpg"
        alt="Test image"
        withBlur
      />
    );

    const container = screen.getByTestId('lazy-image-container');
    expect(container.querySelector('img')).toHaveClass('blur-md');
  });

  it('should remove blur effect when loaded', () => {
    const mockUseLazyImage = vi.mocked(useLazyImage);
    mockUseLazyImage.mockReturnValue({
      imgRef: vi.fn(),
      imgSrc: '/test-image.jpg',
      isLoaded: true,
      isError: false,
    });

    render(
      <LazyImage
        src="/test-image.jpg"
        alt="Test image"
        withBlur
      />
    );

    const img = screen.getByAltText('Test image');
    expect(img).not.toHaveClass('blur-md');
    expect(img).toHaveClass('blur-0');
  });

  it('should render error fallback when loading fails', () => {
    const mockUseLazyImage = vi.mocked(useLazyImage);
    mockUseLazyImage.mockReturnValue({
      imgRef: vi.fn(),
      imgSrc: undefined,
      isLoaded: false,
      isError: true,
    });

    render(
      <LazyImage
        src="/test-image.jpg"
        alt="Test image"
        fallback="/fallback-image.jpg"
      />
    );

    const img = screen.getByAltText('Test image');
    expect(img).toHaveAttribute('src', '/fallback-image.jpg');
  });

  it('should render custom error component', () => {
    const mockUseLazyImage = vi.mocked(useLazyImage);
    mockUseLazyImage.mockReturnValue({
      imgRef: vi.fn(),
      imgSrc: undefined,
      isLoaded: false,
      isError: true,
    });

    const ErrorComponent = () => <div>Error loading image</div>;

    render(
      <LazyImage
        src="/test-image.jpg"
        alt="Test image"
        errorComponent={<ErrorComponent />}
      />
    );

    expect(screen.getByText('Error loading image')).toBeInTheDocument();
  });

  it('should pass className to container', () => {
    render(
      <LazyImage
        src="/test-image.jpg"
        alt="Test image"
        className="custom-class"
      />
    );

    const container = screen.getByTestId('lazy-image-container');
    expect(container).toHaveClass('custom-class');
  });

  it('should pass imgClassName to image element', () => {
    const mockUseLazyImage = vi.mocked(useLazyImage);
    mockUseLazyImage.mockReturnValue({
      imgRef: vi.fn(),
      imgSrc: '/test-image.jpg',
      isLoaded: true,
      isError: false,
    });

    render(
      <LazyImage
        src="/test-image.jpg"
        alt="Test image"
        imgClassName="rounded-lg"
      />
    );

    const img = screen.getByAltText('Test image');
    expect(img).toHaveClass('rounded-lg');
  });

  it('should set aspect ratio when provided', () => {
    render(
      <LazyImage
        src="/test-image.jpg"
        alt="Test image"
        aspectRatio="16/9"
      />
    );

    const container = screen.getByTestId('lazy-image-container');
    expect(container).toHaveStyle({ aspectRatio: '16/9' });
  });

  it('should use responsive sizes', () => {
    const mockUseLazyImage = vi.mocked(useLazyImage);
    mockUseLazyImage.mockReturnValue({
      imgRef: vi.fn(),
      imgSrc: '/test-image.jpg',
      isLoaded: true,
      isError: false,
    });

    render(
      <LazyImage
        src="/test-image.jpg"
        alt="Test image"
        sizes="(max-width: 768px) 100vw, 50vw"
      />
    );

    const img = screen.getByAltText('Test image');
    expect(img).toHaveAttribute('sizes', '(max-width: 768px) 100vw, 50vw');
  });

  it('should support srcset for responsive images', () => {
    const mockUseLazyImage = vi.mocked(useLazyImage);
    mockUseLazyImage.mockReturnValue({
      imgRef: vi.fn(),
      imgSrc: '/test-image.jpg',
      isLoaded: true,
      isError: false,
    });

    const srcSet = '/test-image-small.jpg 480w, /test-image-medium.jpg 800w';

    render(
      <LazyImage
        src="/test-image.jpg"
        alt="Test image"
        srcSet={srcSet}
      />
    );

    const img = screen.getByAltText('Test image');
    expect(img).toHaveAttribute('srcset', srcSet);
  });

  it('should call onLoad callback when image loads', () => {
    const onLoad = vi.fn();
    const mockUseLazyImage = vi.mocked(useLazyImage);
    mockUseLazyImage.mockReturnValue({
      imgRef: vi.fn(),
      imgSrc: '/test-image.jpg',
      isLoaded: true,
      isError: false,
    });

    render(
      <LazyImage
        src="/test-image.jpg"
        alt="Test image"
        onLoad={onLoad}
      />
    );

    // Simulate image load event
    const img = screen.getByAltText('Test image');
    img.dispatchEvent(new Event('load'));

    expect(onLoad).toHaveBeenCalled();
  });

  it('should support loading eager for critical images', () => {
    const mockUseLazyImage = vi.mocked(useLazyImage);
    mockUseLazyImage.mockReturnValue({
      imgRef: vi.fn(),
      imgSrc: '/test-image.jpg',
      isLoaded: true,
      isError: false,
    });

    render(
      <LazyImage
        src="/test-image.jpg"
        alt="Test image"
        loading="eager"
      />
    );

    const img = screen.getByAltText('Test image');
    expect(img).toHaveAttribute('loading', 'eager');
  });
});