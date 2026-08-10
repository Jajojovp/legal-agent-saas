'use client';

import { useEffect, useRef } from 'react';

interface AdBannerProps {
  format?: 'banner' | 'leaderboard' | 'skyscraper';
  className?: string;
}

export function AdBanner({ format = 'leaderboard', className = '' }: AdBannerProps) {
  const adRef = useRef<HTMLDivElement>(null);

  const dimensions = {
    banner: 'w-full h-[90px]',
    leaderboard: 'w-full h-[90px] md:h-[120px]',
    skyscraper: 'w-[160px] h-[600px]',
  };

  return (
    <div className={`py-8 px-4 bg-[#0B0F15] ${className}`}>
      <div className="max-w-7xl mx-auto">
        <p className="text-center text-xs text-gray-600 mb-2 uppercase tracking-wider">— Advertisement —</p>
        <div
          ref={adRef}
          id={`ad-banner-${format}`}
          className={`${dimensions[format]} bg-[#101010] border border-white/5 rounded-xl flex items-center justify-center mx-auto`}
        >
          <div className="text-center p-4">
            <div className="w-8 h-8 mx-auto mb-2 opacity-20">
              <svg viewBox="0 0 24 24" fill="none" className="w-full h-full text-white">
                <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <p className="text-gray-600 text-sm">Ad Placeholder — {format}</p>
            <p className="text-gray-700 text-xs mt-1">Google AdSense / Terra Ads</p>
          </div>
        </div>
      </div>
    </div>
  );
}
