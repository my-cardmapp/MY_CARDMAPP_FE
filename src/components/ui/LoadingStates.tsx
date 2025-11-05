import React from 'react';
import { cn } from '@/lib/utils';

interface SkeletonCardProps {
  className?: string;
}

export const SkeletonCard: React.FC<SkeletonCardProps> = ({ className }) => {
  return (
    <div
      data-testid="skeleton-card"
      className={cn(
        'bg-white rounded-lg shadow-sm p-4 animate-pulse',
        className
      )}
    >
      {/* Image placeholder */}
      <div
        data-testid="skeleton-image"
        className="w-full h-48 bg-gray-200 rounded-md mb-4"
      />
      
      {/* Title placeholder */}
      <div
        data-testid="skeleton-title"
        className="h-6 bg-gray-200 rounded w-3/4 mb-3"
      />
      
      {/* Description placeholders */}
      <div className="space-y-2 mb-4">
        <div
          data-testid="skeleton-description-1"
          className="h-4 bg-gray-200 rounded w-full"
        />
        <div
          data-testid="skeleton-description-2"
          className="h-4 bg-gray-200 rounded w-5/6"
        />
        <div
          data-testid="skeleton-description-3"
          className="h-4 bg-gray-200 rounded w-4/6"
        />
      </div>
      
      {/* Footer placeholder */}
      <div
        data-testid="skeleton-footer"
        className="flex items-center justify-between"
      >
        <div className="h-4 bg-gray-200 rounded w-24" />
        <div className="h-8 bg-gray-200 rounded w-20" />
      </div>
    </div>
  );
};

interface SkeletonListProps {
  count?: number;
  className?: string;
}

export const SkeletonList: React.FC<SkeletonListProps> = ({ 
  count = 3, 
  className 
}) => {
  return (
    <div
      data-testid="skeleton-list"
      className={cn('space-y-4', className)}
    >
      {Array.from({ length: count }).map((_, index) => (
        <SkeletonCard key={index} />
      ))}
    </div>
  );
};

interface LoadingSpinnerProps {
  size?: 'small' | 'medium' | 'large';
  message?: string;
  className?: string;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = 'medium',
  message,
  className
}) => {
  const sizeClasses = {
    small: 'h-4 w-4',
    medium: 'h-8 w-8',
    large: 'h-12 w-12'
  };

  return (
    <div
      data-testid="loading-spinner-container"
      className={cn('flex flex-col items-center justify-center', className)}
    >
      <svg
        data-testid="loading-spinner"
        className={cn(
          'animate-spin text-blue-600',
          sizeClasses[size]
        )}
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
      >
        <circle
          className="opacity-25"
          cx="12"
          cy="12"
          r="10"
          stroke="currentColor"
          strokeWidth="4"
        />
        <path
          className="opacity-75"
          fill="currentColor"
          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
        />
      </svg>
      {message && (
        <p
          data-testid="loading-message"
          className="mt-3 text-sm text-gray-600"
        >
          {message}
        </p>
      )}
    </div>
  );
};

interface LoadingOverlayProps {
  message?: string;
}

export const LoadingOverlay: React.FC<LoadingOverlayProps> = ({ message }) => {
  return (
    <div
      data-testid="loading-overlay"
      className="fixed inset-0 z-50 flex items-center justify-center"
      role="status"
      aria-label={message || 'Loading'}
    >
      <div
        data-testid="loading-backdrop"
        className="absolute inset-0 bg-black/20 backdrop-blur-sm"
      />
      <div
        data-testid="loading-overlay-content"
        className="relative flex flex-col items-center justify-center p-8 bg-white rounded-lg shadow-lg"
      >
        <LoadingSpinner size="large" message={message} />
      </div>
    </div>
  );
};