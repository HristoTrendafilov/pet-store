import { type MouseEventHandler, type ReactNode, useCallback } from 'react';
import { createPortal } from 'react-dom';

import './Modal.css';

interface ModalProps {
  children: ReactNode;
  onBackdropClick: () => void;
}

export function Modal(props: ModalProps) {
  const { children, onBackdropClick } = props;

  const handleBackdropClick: MouseEventHandler<HTMLButtonElement> = useCallback(
    (e) => {
      if (e.currentTarget === e.target) {
        onBackdropClick();
      }
    },
    [onBackdropClick]
  );

  return createPortal(
    <div className="modal-wrapper" role="dialog">
      <button
        type="button"
        className="modal-backdrop"
        onClick={handleBackdropClick}
        aria-label="modal backdrop"
      />
      <div className="modal-content">{children}</div>
    </div>,
    document.body
  );
}
