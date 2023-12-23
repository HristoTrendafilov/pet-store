import type { CSSProperties } from 'react';

import './errorMessage.css';

interface ErrorMessageProps {
  message: string;
  style?: CSSProperties;
}

export function ErrorMessage(props: ErrorMessageProps) {
  const { message, style } = props;

  return (
    <div className="system-error-message" style={style}>
      {message}
    </div>
  );
}
