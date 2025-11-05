import React from 'react';
import { cn } from '@/lib/utils';

interface ErrorMessageProps {
  message: string;
  onRetry?: () => void;
  className?: string;
}

export const ErrorMessage: React.FC<ErrorMessageProps> = ({
  message,
  onRetry,
  className
}) => {
  return (
    <div
      data-testid="error-message-container"
      className={cn(
        'flex flex-col items-center justify-center p-6 text-red-600',
        className
      )}
    >
      <svg
        data-testid="error-icon"
        className="w-12 h-12 mb-4"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
        />
      </svg>
      
      <p className="text-center text-lg font-medium mb-4">{message}</p>
      
      {onRetry && (
        <button
          onClick={onRetry}
          className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
        >
          Retry
        </button>
      )}
    </div>
  );
};

interface NetworkErrorProps {
  onRetry: () => void;
  className?: string;
}

export const NetworkError: React.FC<NetworkErrorProps> = ({
  onRetry,
  className
}) => {
  return (
    <div
      role="alert"
      className={cn(
        'flex flex-col items-center justify-center p-8 bg-red-50 rounded-lg',
        className
      )}
    >
      <svg
        data-testid="network-error-icon"
        className="w-16 h-16 mb-4 text-red-500"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M18.364 5.636a9 9 0 010 12.728m0 0l-2.829-2.829m2.829 2.829L21 21M15.536 8.464a5 5 0 010 7.072m0 0l-2.829-2.829m-4.243 2.829a4.978 4.978 0 01-1.414-2.83m-1.414 5.658a9 9 0 01-2.167-9.238m7.824 2.167a1 1 0 111.414 1.414m-1.414-1.414L3 3m8.293 8.293l1.414 1.414"
        />
      </svg>
      
      <h3 className="text-xl font-semibold text-gray-900 mb-2">
        Network Error
      </h3>
      
      <p className="text-gray-600 text-center mb-6">
        Please check your internet connection and try again.
      </p>
      
      <button
        onClick={onRetry}
        className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
      >
        Try Again
      </button>
    </div>
  );
};

interface EmptyStateAction {
  label: string;
  onClick: () => void;
}

interface EmptyStateProps {
  message?: string;
  suggestions?: string[];
  action?: EmptyStateAction;
  className?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  message = 'No results found',
  suggestions,
  action,
  className
}) => {
  return (
    <div
      data-testid="empty-state-container"
      className={cn(
        'flex flex-col items-center justify-center p-8 bg-gray-50 rounded-lg',
        className
      )}
    >
      <svg
        data-testid="empty-state-icon"
        className="w-16 h-16 mb-4 text-gray-400"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
        />
      </svg>
      
      <h3 className="text-xl font-semibold text-gray-900 mb-2">
        {message}
      </h3>
      
      {suggestions && suggestions.length > 0 && (
        <div className="mt-4 space-y-2">
          <p className="text-sm text-gray-600 font-medium">Suggestions:</p>
          <ul className="list-disc list-inside space-y-1">
            {suggestions.map((suggestion, index) => (
              <li key={index} className="text-sm text-gray-600">
                {suggestion}
              </li>
            ))}
          </ul>
        </div>
      )}
      
      {action && (
        <button
          onClick={action.onClick}
          className="mt-6 px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
        >
          {action.label}
        </button>
      )}
    </div>
  );
};

interface TimeoutErrorProps {
  duration?: number;
  onRetry: () => void;
  className?: string;
}

export const TimeoutError: React.FC<TimeoutErrorProps> = ({
  duration,
  onRetry,
  className
}) => {
  return (
    <div
      role="alert"
      className={cn(
        'flex flex-col items-center justify-center p-8 bg-orange-50 rounded-lg',
        className
      )}
    >
      <svg
        data-testid="timeout-error-icon"
        className="w-16 h-16 mb-4 text-orange-500"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
        />
      </svg>
      
      <h3 className="text-xl font-semibold text-gray-900 mb-2">
        Request Timed Out
      </h3>
      
      <p className="text-gray-600 text-center mb-2">
        {duration
          ? `The request took longer than ${duration} seconds.`
          : 'The request took too long to complete.'}
      </p>
      
      <p className="text-sm text-gray-500 mb-6">
        Please try again later.
      </p>
      
      <button
        onClick={onRetry}
        className="px-6 py-2 bg-orange-600 text-white rounded-md hover:bg-orange-700 transition-colors"
      >
        Retry
      </button>
    </div>
  );
};