import { type ReactNode, useCallback, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';

import './Modal.css';

interface ModalProps {
  children: ReactNode;
  onBackdropClick: () => void;
}

export function Modal(props: ModalProps) {
  const { children, onBackdropClick } = props;

  const modalBackdropRef = useRef<HTMLDivElement>(null);

  // Question: With this function and useEffect() there should be a simpler way for handling
  const handleBackdropClick = useCallback(
    (event: MouseEvent) => {
      if (
        modalBackdropRef.current &&
        modalBackdropRef.current === event.target
      ) {
        onBackdropClick();
      }
    },
    [onBackdropClick]
  );

  useEffect(() => {
    const ref = modalBackdropRef.current;
    ref?.addEventListener('click', handleBackdropClick);

    return () => {
      ref?.removeEventListener('click', handleBackdropClick);
    };
  }, [handleBackdropClick]);

  return createPortal(
    <div ref={modalBackdropRef} className="modal-backdrop">
      {children}
    </div>,
    document.body
  );
}
