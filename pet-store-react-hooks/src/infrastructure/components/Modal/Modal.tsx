import React from 'react';
import { createPortal } from 'react-dom';

const modalRoot = document.getElementById('modal') as HTMLDivElement;

export function Modal({ children }: { children: React.ReactNode }) {
  if (!modalRoot) {
    return null;
  }

  return createPortal(<div>{children}</div>, modalRoot);
}
