import { useEffect } from 'react';

declare global {
  interface Window {
    adsbygoogle?: unknown[];
  }
}

type AdSlotProps = {
  slot: string;
  className?: string;
  format?: 'auto' | 'rectangle' | 'horizontal' | 'vertical';
};

export default function AdSlot({ slot, className = '', format = 'auto' }: AdSlotProps) {
  const client = import.meta.env.VITE_ADSENSE_CLIENT;

  useEffect(() => {
    if (!client || !slot) return;

    try {
      (window.adsbygoogle = window.adsbygoogle || []).push({});
    } catch {
      // Ignore ad push errors to keep UI stable.
    }
  }, [client, slot]);

  if (!client || !slot) return null;

  return (
    <div className={`bg-white border border-gray-200 rounded-xl p-3 ${className}`}>
      <ins
        className="adsbygoogle"
        style={{ display: 'block' }}
        data-ad-client={client}
        data-ad-slot={slot}
        data-ad-format={format}
        data-full-width-responsive="true"
      />
    </div>
  );
}
