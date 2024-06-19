import { useEffect, useState } from 'react';

import './LoadingIndicator.css';

interface LoadingIndicatorProps {
  delay?: number;
}

export function LoadingIndicator(props: LoadingIndicatorProps) {
  const { delay } = props;

  const [showIndicator, setShowIndicator] = useState<boolean>(false);

  useEffect(() => {
    const timer = setTimeout(() => setShowIndicator(true), delay || 0);

    return () => {
      clearTimeout(timer);
    };
  }, [delay]);

  if (!showIndicator && process.env.NODE_ENV !== 'test') {
    return null;
  }

  return (
    <div role="alert" aria-label="loading" className="spinner-wrapper">
      <div className="loading-spinner" />
    </div>
  );
}
