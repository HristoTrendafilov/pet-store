import { useEffect, useState } from 'react';

import './loadingIndicator.scss';

export function LoadingIndicator({ delay }: { delay?: number }) {
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
