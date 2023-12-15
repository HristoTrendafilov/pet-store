import type { CSSProperties } from 'react';

import './errorMessage.scss';

type ErrorMessageProps = {
  message: string;
  style?: CSSProperties;
};

export function ErrorMessage(props: ErrorMessageProps) {
  const { message, style } = props;

  // Question: Because i want to put the Component without always checking for errors, is it OK to do this?
  if (!message) {
    return null;
  }

  return (
    <div className="system-error-message" style={style}>
      {message}
    </div>
  );
}
