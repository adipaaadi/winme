import { useEffect } from 'react';

export default function usePageTitle(title) {
  useEffect(() => {
    document.title = title ? `${title} · WinMe` : 'WinMe — Thirty minutes with the people who\u2019ve done it';
  }, [title]);
}
