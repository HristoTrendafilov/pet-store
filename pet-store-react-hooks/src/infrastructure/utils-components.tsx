import React, { useEffect, useRef } from 'react';

type OutsideAlerterProps = {
  onAlert: () => void;
  children: React.ReactNode | React.ReactNode[];
};

export function OutsideAlerter(props: OutsideAlerterProps) {
  const { onAlert, children } = props;

  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (ref.current && !ref.current.contains(event.target as HTMLElement)) {
        onAlert();
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [ref, onAlert]);

  return <div ref={ref}>{children}</div>;
}
