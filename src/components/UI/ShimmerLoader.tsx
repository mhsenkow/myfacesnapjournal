/**
 * Shimmer Loading Components
 * 
 * Provides shimmer loading effects for various UI elements
 */

import React from 'react';

interface ShimmerProps {
  className?: string;
  children?: React.ReactNode;
}

const ShimmerBase: React.FC<ShimmerProps> = ({ className = '', children }) => (
  <div className={`animate-pulse bg-gradient-to-r from-neutral-200 via-neutral-100 to-neutral-200 dark:from-neutral-800 dark:via-neutral-700 dark:to-neutral-800 bg-[length:200%_100%] ${className}`}>
    {children}
  </div>
);

export const ShimmerText: React.FC<{ lines?: number; className?: string }> = ({ 
  lines = 1, 
  className = '' 
}) => (
  <div className={`space-y-2 ${className}`}>
    {Array.from({ length: lines }).map((_, i) => (
      <ShimmerBase
        key={i}
        className={`h-4 rounded ${
          i === lines - 1 ? 'w-3/4' : 'w-full'
        }`}
      />
    ))}
  </div>
);

export const ShimmerCard: React.FC<{ className?: string }> = ({ className = '' }) => (
  <div className={`glass-subtle p-4 rounded-lg ${className}`}>
    <div className="space-y-3">
      <ShimmerBase className="h-4 w-1/2 rounded" />
      <ShimmerBase className="h-6 w-1/3 rounded" />
      <ShimmerBase className="h-2 w-full rounded-full" />
    </div>
  </div>
);

export const ShimmerMetric: React.FC<{ className?: string }> = ({ className = '' }) => (
  <div className={`glass-subtle p-4 rounded-lg ${className}`}>
    <div className="space-y-2">
      <ShimmerBase className="h-4 w-20 rounded" />
      <ShimmerBase className="h-8 w-16 rounded" />
    </div>
  </div>
);

export const ShimmerProgressBar: React.FC<{ className?: string }> = ({ className = '' }) => (
  <div className={`space-y-2 ${className}`}>
    <div className="flex justify-between">
      <ShimmerBase className="h-4 w-24 rounded" />
      <ShimmerBase className="h-4 w-12 rounded" />
    </div>
    <div className="w-full bg-neutral-200 dark:bg-neutral-700 rounded-full h-2">
      <ShimmerBase className="h-2 w-3/4 rounded-full" />
    </div>
  </div>
);

export const ShimmerInsight: React.FC<{ className?: string }> = ({ className = '' }) => (
  <div className={`glass-subtle p-3 rounded-lg ${className}`}>
    <ShimmerText lines={2} />
  </div>
);

export const ShimmerTabs: React.FC<{ count?: number; className?: string }> = ({ 
  count = 4, 
  className = '' 
}) => (
  <div className={`flex gap-1 mb-4 p-1 glass-subtle rounded-lg ${className}`}>
    {Array.from({ length: count }).map((_, i) => (
      <ShimmerBase key={i} className="h-8 w-16 rounded-md" />
    ))}
  </div>
);

export default ShimmerBase;
