import { type MouseEventHandler, type ReactNode, useCallback } from 'react';
import { createPortal } from 'react-dom';

import './Modal.css';

interface ModalProps {
  children: ReactNode;
  onBackdropClick: () => void;
  name?: string;
}

export function Modal(props: ModalProps) {
  const { children, onBackdropClick, name } = props;

  const handleBackdropClick: MouseEventHandler<HTMLButtonElement> =
    useCallback(() => {
      onBackdropClick();
    }, [onBackdropClick]);

  return createPortal(
    <div className="modal-wrapper" role="dialog" aria-label={name}>
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
