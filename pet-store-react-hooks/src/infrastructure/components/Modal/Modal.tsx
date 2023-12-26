import { type ReactNode, useEffect } from 'react';
import { createPortal } from 'react-dom';

import './Modal.css';

const modalRoot = document.getElementById('modal-root') as HTMLDivElement;

interface ModalProps {
  children: ReactNode;
  onBackdropClick: () => void;
}

export function Modal(props: ModalProps) {
  const { children, onBackdropClick } = props;

  useEffect(() => {
    const handleBackdropClick = (event: MouseEvent) => {
      if (modalRoot && modalRoot === event.target) {
        onBackdropClick();
      }
    };

    modalRoot.classList.add('modal-backdrop');
    modalRoot.addEventListener('click', handleBackdropClick);

    return () => {
      modalRoot.removeAttribute('class');
      modalRoot.removeEventListener('click', handleBackdropClick);
    };
  }, [onBackdropClick]);

  if (!modalRoot) {
    return null;
  }

  return createPortal(children, modalRoot);
}
