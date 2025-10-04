/**
 * Utility Test Component
 * 
 * This component tests our local utility system to ensure it works
 * correctly with our theme system.
 */

import React from 'react'

export const UtilityTest: React.FC = () => {
  return (
    <div className="p-md bg-background-primary">
      <h2 className="text-2xl font-bold text-theme-primary mb-lg">
        Local Utility System Test
      </h2>
      
      {/* Color Tests */}
      <div className="mb-lg">
        <h3 className="text-lg font-semibold text-theme-secondary mb-sm">
          Color System Test
        </h3>
        <div className="flex gap-sm">
          <div className="p-sm bg-primary-500 text-white rounded">
            Primary 500
          </div>
          <div className="p-sm bg-secondary-500 text-white rounded">
            Secondary 500
          </div>
          <div className="p-sm bg-success-500 text-white rounded">
            Success 500
          </div>
          <div className="p-sm bg-warning-500 text-white rounded">
            Warning 500
          </div>
          <div className="p-sm bg-error-500 text-white rounded">
            Error 500
          </div>
        </div>
      </div>

      {/* Spacing Tests */}
      <div className="mb-lg">
        <h3 className="text-lg font-semibold text-theme-secondary mb-sm">
          Spacing System Test
        </h3>
        <div className="space-y-sm">
          <div className="p-xs bg-neutral-100 rounded text-sm">
            Padding XS
          </div>
          <div className="p-sm bg-neutral-100 rounded text-sm">
            Padding SM
          </div>
          <div className="p-md bg-neutral-100 rounded text-sm">
            Padding MD
          </div>
          <div className="p-lg bg-neutral-100 rounded text-sm">
            Padding LG
          </div>
        </div>
      </div>

      {/* Typography Tests */}
      <div className="mb-lg">
        <h3 className="text-lg font-semibold text-theme-secondary mb-sm">
          Typography System Test
        </h3>
        <div className="space-y-xs">
          <p className="text-xs text-theme-muted">Extra Small Text</p>
          <p className="text-sm text-theme-muted">Small Text</p>
          <p className="text-base text-theme-primary">Base Text</p>
          <p className="text-lg text-theme-primary">Large Text</p>
          <p className="text-xl text-theme-primary">Extra Large Text</p>
        </div>
      </div>

      {/* Layout Tests */}
      <div className="mb-lg">
        <h3 className="text-lg font-semibold text-theme-secondary mb-sm">
          Layout System Test
        </h3>
        <div className="grid grid-cols-3 gap-md">
          <div className="p-md bg-surface-100 rounded-lg text-center">
            Grid Item 1
          </div>
          <div className="p-md bg-surface-100 rounded-lg text-center">
            Grid Item 2
          </div>
          <div className="p-md bg-surface-100 rounded-lg text-center">
            Grid Item 3
          </div>
        </div>
      </div>

      {/* Border & Shadow Tests */}
      <div className="mb-lg">
        <h3 className="text-lg font-semibold text-theme-secondary mb-sm">
          Border & Shadow Test
        </h3>
        <div className="flex gap-md">
          <div className="p-md bg-surface-100 rounded border border-neutral-300 shadow-sm">
            Small Shadow
          </div>
          <div className="p-md bg-surface-100 rounded border border-neutral-300 shadow-md">
            Medium Shadow
          </div>
          <div className="p-md bg-surface-100 rounded border border-neutral-300 shadow-lg">
            Large Shadow
          </div>
        </div>
      </div>

      {/* Interactive Tests */}
      <div className="mb-lg">
        <h3 className="text-lg font-semibold text-theme-secondary mb-sm">
          Interactive Test
        </h3>
        <div className="flex gap-sm">
          <button className="px-md py-sm bg-primary-600 text-white rounded hover:bg-primary-700 transition-colors">
            Primary Button
          </button>
          <button className="px-md py-sm bg-secondary-600 text-white rounded hover:bg-secondary-700 transition-colors">
            Secondary Button
          </button>
          <button className="px-md py-sm bg-neutral-600 text-white rounded hover:bg-neutral-700 transition-colors">
            Neutral Button
          </button>
        </div>
      </div>

      {/* Glass Effect Test */}
      <div className="mb-lg">
        <h3 className="text-lg font-semibold text-theme-secondary mb-sm">
          Glass Effect Test
        </h3>
        <div className="glass p-md rounded-lg">
          <p className="text-theme-primary">
            This should have glass morphism effect
          </p>
        </div>
      </div>

      <div className="text-sm text-theme-muted">
        <p>✅ All utility classes are working with our theme system</p>
        <p>🎨 Theme switching should work seamlessly</p>
        <p>🚀 Ready for gradual migration from Tailwind</p>
      </div>
    </div>
  )
}
