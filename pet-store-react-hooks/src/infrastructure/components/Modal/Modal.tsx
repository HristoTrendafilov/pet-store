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
    <button
      type="button"
      onClick={handleBackdropClick}
      className="modal-backdrop"
      aria-label="modal"
    >
      {children}
    </button>,
    document.body
  );
}
