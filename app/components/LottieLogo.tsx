"use client";

import { useEffect, useRef } from 'react';

export default function LottieLogo() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Load dotlottie-player script dynamically
    const script = document.createElement('script');
    script.src = "https://unpkg.com/@dotlottie/player-component@2.7.12/dist/dotlottie-player.mjs";
    script.type = "module";
    document.body.appendChild(script);

    // Create and append the player
    const player = document.createElement('dotlottie-player');
    player.setAttribute('src', 'https://lottie.host/942ca77c-c7df-4c56-84ad-ae46c75b7400/v3WIkjbt3B.lottie');
    player.setAttribute('background', 'transparent');
    player.setAttribute('speed', '1');
    player.setAttribute('loop', '');
    player.setAttribute('autoplay', '');
    player.style.width = '48px';
    player.style.height = '48px';

    if (containerRef.current) {
      containerRef.current.appendChild(player);
    }

    return () => {
      document.body.removeChild(script);
    };
  }, []);

  return <div ref={containerRef} className="flex items-center" />;
} 