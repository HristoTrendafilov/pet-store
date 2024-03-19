import type { CSSProperties } from 'react';

import './ErrorMessage.css';

interface ErrorMessageProps {
  message: string;
  style?: CSSProperties;
}

export function ErrorMessage(props: ErrorMessageProps) {
  const { message, style } = props;

  return (
    <div
      role="alert"
      aria-label="system error message"
      className="system-error-message"
      style={style}
    >
      {message}
    </div>
  );
}
