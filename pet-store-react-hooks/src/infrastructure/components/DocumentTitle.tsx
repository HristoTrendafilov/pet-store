import { useEffect } from 'react';

type DocumentTitleProps = {
  title: string;
};

export function DocumentTitle(props: DocumentTitleProps) {
  const { title } = props;

  useEffect(() => {
    document.title = title;
  }, [title]);

  return null;
}
