'use client';

import { useEffect, useState } from 'react';

export default function FlashBanner({
  error,
  success,
  timeout = 4000,
}: {
  error?: string | null;
  success?: string | null;
  timeout?: number;
}) {
  const [visible, setVisible] = useState<boolean>(Boolean(error || success));

  useEffect(() => {
    setVisible(Boolean(error || success));
    if (!error && !success) return;
    const t = setTimeout(() => setVisible(false), timeout);
    return () => clearTimeout(t);
  }, [error, success, timeout]);

  if (!visible) return null;

  if (error) {
    return (
      <div role="alert" className="alert alert-error">
        <span>{error}</span>
      </div>
    );
  }
  if (success) {
    return (
      <div role="alert" className="alert alert-success">
        <span>{success}</span>
      </div>
    );
  }
  return null;
}
