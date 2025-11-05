import React, { CSSProperties, ImgHTMLAttributes } from 'react';
import { useLazyImage } from '@/hooks/useLazyLoad';
import { cn } from '@/lib/utils';

interface LazyImageProps extends Omit<ImgHTMLAttributes<HTMLImageElement>, 'src' | 'ref'> {
  src: string;
  alt: string;
  fallback?: string;
  placeholder?: React.ReactNode;
  errorComponent?: React.ReactNode;
  className?: string;
  imgClassName?: string;
  width?: number | string;
  height?: number | string;
  aspectRatio?: string;
  withBlur?: boolean;
  onLoad?: () => void;
  onError?: () => void;
  srcSet?: string;
  sizes?: string;
  loading?: 'lazy' | 'eager';
  rootMargin?: string;
  threshold?: number | number[];
}

/**
 * LazyImage component with Intersection Observer for lazy loading
 * Provides placeholder, error handling, and blur transition effects
 */
export const LazyImage: React.FC<LazyImageProps> = ({
  src,
  alt,
  fallback = '/images/placeholder.jpg',
  placeholder,
  errorComponent,
  className,
  imgClassName,
  width,
  height,
  aspectRatio,
  withBlur = false,
  onLoad,
  onError,
  srcSet,
  sizes,
  loading = 'lazy',
  rootMargin = '50px',
  threshold = 0,
  ...imgProps
}) => {
  const { imgRef, imgSrc, isLoaded, isError } = useLazyImage(src, {
    rootMargin,
    threshold,
    once: true,
  });

  const containerStyle: CSSProperties = {
    width: width ? (typeof width === 'number' ? `${width}px` : width) : undefined,
    height: height ? (typeof height === 'number' ? `${height}px` : height) : undefined,
    aspectRatio: aspectRatio,
  };

  // Handle error state
  if (isError) {
    if (errorComponent) {
      return <>{errorComponent}</>;
    }
    
    if (fallback) {
      return (
        <div
          data-testid="lazy-image-container"
          className={cn('relative overflow-hidden', className)}
          style={containerStyle}
        >
          <img
            src={fallback}
            alt={alt}
            className={cn('w-full h-full object-cover', imgClassName)}
            width={width}
            height={height}
            onError={onError}
            {...imgProps}
          />
        </div>
      );
    }
    
    return (
      <div
        data-testid="lazy-image-container"
        className={cn(
          'relative overflow-hidden bg-gray-200 flex items-center justify-center',
          className
        )}
        style={containerStyle}
      >
        <svg
          className="w-10 h-10 text-gray-400"
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path
            fillRule="evenodd"
            d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z"
            clipRule="evenodd"
          />
        </svg>
      </div>
    );
  }

  // Show placeholder while loading
  if (!imgSrc && !isLoaded) {
    if (placeholder) {
      return <>{placeholder}</>;
    }
    
    return (
      <div
        data-testid="lazy-image-placeholder"
        className={cn(
          'relative overflow-hidden bg-gray-200 animate-pulse',
          className
        )}
        style={containerStyle}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer" />
      </div>
    );
  }

  return (
    <div
      ref={imgRef as any}
      data-testid="lazy-image-container"
      className={cn('relative overflow-hidden', className)}
      style={containerStyle}
    >
      <img
        src={imgSrc || src}
        alt={alt}
        className={cn(
          'w-full h-full object-cover transition-all duration-300',
          withBlur && !isLoaded && 'blur-md scale-110',
          withBlur && isLoaded && 'blur-0 scale-100',
          imgClassName
        )}
        width={width}
        height={height}
        srcSet={srcSet}
        sizes={sizes}
        loading={loading}
        onLoad={() => {
          onLoad?.();
        }}
        onError={() => {
          onError?.();
        }}
        {...imgProps}
      />
    </div>
  );
};

/**
 * LazyBackground component for lazy loading background images
 */
interface LazyBackgroundProps {
  src: string;
  className?: string;
  children?: React.ReactNode;
  rootMargin?: string;
  threshold?: number | number[];
}

export const LazyBackground: React.FC<LazyBackgroundProps> = ({
  src,
  className,
  children,
  rootMargin = '100px',
  threshold = 0,
}) => {
  const { imgRef, imgSrc, isLoaded } = useLazyImage(src, {
    rootMargin,
    threshold,
    once: true,
  });

  return (
    <div
      ref={imgRef as any}
      className={cn(
        'relative transition-opacity duration-500',
        !isLoaded && 'opacity-0',
        isLoaded && 'opacity-100',
        className
      )}
      style={{
        backgroundImage: imgSrc ? `url(${imgSrc})` : undefined,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
    >
      {children}
    </div>
  );
};