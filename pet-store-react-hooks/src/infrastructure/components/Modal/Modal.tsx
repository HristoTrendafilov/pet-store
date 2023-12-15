import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';

import './modal.scss';

const modalRoot = document.getElementById('modal') as HTMLDivElement;

export function Modal({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    modalRoot.classList.add('modal');

    return () => modalRoot.removeAttribute('class');
  }, []);

  if (!modalRoot) {
    return null;
  }

  return createPortal(<div>{children}</div>, modalRoot);
}
