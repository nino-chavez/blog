/**
 * PlatformHeader component for Signal Dispatch presentations
 * Icon + platform name for OS-specific slides
 */

import type { ReactNode } from 'react';

export type Platform = 'windows' | 'macos' | 'linux';

interface PlatformHeaderProps {
  platform: Platform;
  customIcon?: ReactNode;
}

const platformConfig: Record<Platform, { bg: string; color: string; name: string }> = {
  windows: {
    bg: 'bg-[#0078D4]',
    color: 'text-[#0078D4]',
    name: 'Windows',
  },
  macos: {
    bg: 'bg-gradient-to-br from-gray-700 to-gray-900',
    color: 'text-white/60',
    name: 'macOS',
  },
  linux: {
    bg: 'bg-[#E95420]',
    color: 'text-[#E95420]',
    name: 'Linux',
  },
};

const defaultIcons: Record<Platform, ReactNode> = {
  windows: (
    <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="currentColor">
      <path d="M0 3.449L9.75 2.1v9.451H0m10.949-9.602L24 0v11.4H10.949M0 12.6h9.75v9.451L0 20.699M10.949 12.6H24V24l-12.9-1.801"/>
    </svg>
  ),
  macos: (
    <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
      <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83"/>
    </svg>
  ),
  linux: (
    <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z"/>
    </svg>
  ),
};

export function PlatformHeader({ platform, customIcon }: PlatformHeaderProps) {
  const config = platformConfig[platform];
  const icon = customIcon || defaultIcons[platform];

  return (
    <div className="flex items-center gap-3 mb-4">
      <div className={`w-8 h-8 rounded flex items-center justify-center ${config.bg}`}>
        {icon}
      </div>
      <span className={`text-sm font-semibold uppercase tracking-widest ${config.color}`}>
        {config.name}
      </span>
    </div>
  );
}

export default PlatformHeader;
