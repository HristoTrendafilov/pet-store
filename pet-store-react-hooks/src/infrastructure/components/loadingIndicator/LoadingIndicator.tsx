import { useEffect, useState } from 'react';

import './loadingIndicator.css';

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

  if (!showIndicator) {
    return null;
  }

  return (
    <div className="spinner-wrapper">
      <div className="loading-spinner" />
    </div>
  );
}
