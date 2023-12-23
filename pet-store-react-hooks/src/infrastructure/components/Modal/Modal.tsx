import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';

import './modal.css';

const modalRoot = document.getElementById('modal') as HTMLDivElement;

interface ModalProps {
  children: React.ReactNode;
}

export function Modal(props: ModalProps) {
  const { children } = props;

  useEffect(() => {
    modalRoot.classList.add('modal');

    return () => modalRoot.removeAttribute('class');
  }, []);

  if (!modalRoot) {
    return null;
  }

  return createPortal(children, modalRoot);
}
