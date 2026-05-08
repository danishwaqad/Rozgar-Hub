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
  const hasAdSenseScript = typeof document !== 'undefined'
    && !!document.querySelector('script[src*="adsbygoogle.js"]');
  const hasValidClient = typeof client === 'string' && client.startsWith('ca-pub-');
  const shouldRenderAd = hasAdSenseScript && hasValidClient && !!slot;

  useEffect(() => {
    if (!shouldRenderAd) return;

    try {
      (window.adsbygoogle = window.adsbygoogle || []).push({});
    } catch {
      // Ignore ad push errors to keep UI stable.
    }
  }, [shouldRenderAd]);

  if (!shouldRenderAd) return null;

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
