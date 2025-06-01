import React, { useEffect, useState } from 'react';
import { AlertCircle, Loader } from 'lucide-react';
import Button from './ui/Button';

interface LoadingFallbackProps {
  timeout?: number;
  message?: string;
  timeoutMessage?: string;
  onRetry?: () => void;
}

const LoadingFallback: React.FC<LoadingFallbackProps> = ({
  timeout = 5000,
  message = 'Loading...',
  timeoutMessage = 'Taking longer than expected. Please try again.',
  onRetry
}) => {
  const [hasTimedOut, setHasTimedOut] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setHasTimedOut(true);
    }, timeout);

    return () => clearTimeout(timer);
  }, [timeout]);

  if (hasTimedOut) {
    return (
      <div className="min-h-[200px] flex items-center justify-center">
        <div className="text-center">
          <AlertCircle size={48} className="text-orange-500 mx-auto mb-4" />
          <p className="text-gray-600 mb-4">{timeoutMessage}</p>
          {onRetry && (
            <Button onClick={onRetry}>
              Try Again
            </Button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[200px] flex items-center justify-center">
      <div className="text-center">
        <Loader size={40} className="animate-spin text-orange-500 mx-auto mb-4" />
        <p className="text-gray-600">{message}</p>
      </div>
    </div>
  );
};

export default LoadingFallback;