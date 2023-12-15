type ErrorMessageProps = {
  message: string;
};

export function ErrorMessage(props: ErrorMessageProps) {
  const { message } = props;

  // Question: Because i want to put the Component without always checking for errors, is it OK to do this?
  if (message) {
    return null;
  }

  return <div className="system-error-message">{message}</div>;
}
