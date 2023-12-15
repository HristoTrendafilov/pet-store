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

  // Question: It bugs the hell out of me that in the DOM tree with the OutsideAlerter happens nesting of 2 <div>
  // Is it fine this way? Probably not...
  return createPortal(<div>{children}</div>, modalRoot);
}
