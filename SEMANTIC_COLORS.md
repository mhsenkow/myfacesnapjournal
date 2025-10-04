# Semantic Color System

## Overview

Our semantic color system provides theme-aware, semantic color utilities that automatically adapt to the current theme. Instead of using hardcoded colors like `text-red-600` or `bg-blue-500`, we use semantic classes that represent the purpose or meaning of the color.

## Benefits

1. **Theme Consistency**: Colors automatically adapt to light/dark/brutalist themes
2. **Semantic Meaning**: Colors represent purpose, not specific hues
3. **Maintainability**: Change theme colors in one place
4. **Accessibility**: Ensures proper contrast ratios across themes
5. **Future-Proof**: Easy to add new themes or color schemes

## Available Semantic Colors

### Primary Colors
- `.bg-semantic-primary` - Main brand color background
- `.bg-semantic-primary-light` - Light version for subtle backgrounds
- `.bg-semantic-primary-dark` - Dark version for emphasis
- `.text-semantic-primary` - Main brand color text
- `.text-semantic-primary-light` - Light version for muted text
- `.text-semantic-primary-dark` - Dark version for emphasis

### Secondary Colors
- `.bg-semantic-secondary` - Supporting color background
- `.bg-semantic-secondary-light` - Light version
- `.bg-semantic-secondary-dark` - Dark version
- `.text-semantic-secondary` - Supporting color text
- `.text-semantic-secondary-light` - Light version
- `.text-semantic-secondary-dark` - Dark version

### Tertiary Colors
- `.bg-semantic-tertiary` - Subtle color background
- `.bg-semantic-tertiary-light` - Light version
- `.bg-semantic-tertiary-dark` - Dark version
- `.text-semantic-tertiary` - Subtle color text
- `.text-semantic-tertiary-light` - Light version
- `.text-semantic-tertiary-dark` - Dark version

### Success Colors
- `.bg-semantic-success` - Success state background
- `.bg-semantic-success-light` - Light success background
- `.bg-semantic-success-dark` - Dark success background
- `.text-semantic-success` - Success state text
- `.text-semantic-success-light` - Light success text
- `.text-semantic-success-dark` - Dark success text

### Warning Colors
- `.bg-semantic-warning` - Warning state background
- `.bg-semantic-warning-light` - Light warning background
- `.bg-semantic-warning-dark` - Dark warning background
- `.text-semantic-warning` - Warning state text
- `.text-semantic-warning-light` - Light warning text
- `.text-semantic-warning-dark` - Dark warning text

### Error Colors
- `.bg-semantic-error` - Error state background
- `.bg-semantic-error-light` - Light error background
- `.bg-semantic-error-dark` - Dark error background
- `.text-semantic-error` - Error state text
- `.text-semantic-error-light` - Light error text
- `.text-semantic-error-dark` - Dark error text

### Info Colors
- `.bg-semantic-info` - Informational background
- `.bg-semantic-info-light` - Light info background
- `.bg-semantic-info-dark` - Dark info background
- `.text-semantic-info` - Informational text
- `.text-semantic-info-light` - Light info text
- `.text-semantic-info-dark` - Dark info text

### Neutral Colors
- `.bg-semantic-neutral` - Neutral background
- `.bg-semantic-neutral-light` - Light neutral background
- `.bg-semantic-neutral-dark` - Dark neutral background
- `.text-semantic-neutral` - Neutral text
- `.text-semantic-neutral-light` - Light neutral text
- `.text-semantic-neutral-dark` - Dark neutral text

## Usage Examples

### Before (Hardcoded Colors)
```jsx
// ❌ Hardcoded colors - not theme-aware
<button className="bg-blue-500 hover:bg-blue-600 text-white">
  Primary Action
</button>

<div className="bg-red-100 text-red-800 border border-red-200">
  Error Message
</div>

<span className="text-green-600">Success!</span>
```

### After (Semantic Colors)
```jsx
// ✅ Semantic colors - theme-aware
<button className="bg-semantic-primary bg-semantic-primary-hover text-white">
  Primary Action
</button>

<div className="bg-semantic-error-light text-semantic-error border border-semantic-error">
  Error Message
</div>

<span className="text-semantic-success">Success!</span>
```

## Theme Mapping

The semantic colors automatically map to appropriate colors in each theme:

### Light Theme
- `--color-semantic-primary` → `--color-primary-600` (purple)
- `--color-semantic-success` → `--color-success-600` (green)
- `--color-semantic-warning` → `--color-warning-600` (yellow)
- `--color-semantic-error` → `--color-error-600` (red)

### Dark Theme
- Same mappings but with appropriate contrast adjustments

### Brutalist Theme
- High contrast, bold colors for maximum impact

## Migration Guide

When migrating from hardcoded colors to semantic colors:

1. **Identify the purpose** of the color (primary, secondary, error, etc.)
2. **Choose the appropriate semantic class** based on purpose
3. **Select the right intensity** (light, normal, dark)
4. **Test across all themes** to ensure proper contrast

### Common Mappings
- `text-red-600` → `text-semantic-error`
- `bg-blue-500` → `bg-semantic-primary`
- `text-green-600` → `text-semantic-success`
- `bg-yellow-100` → `bg-semantic-warning-light`
- `text-gray-600` → `text-semantic-neutral`

## Customization

To customize semantic colors, modify the CSS variables in `src/styles/theme.css`:

```css
/* Customize semantic primary color */
--color-semantic-primary: var(--color-primary-600);
--color-semantic-primary-hover: var(--color-primary-700);
--color-semantic-primary-light: var(--color-primary-100);
--color-semantic-primary-dark: var(--color-primary-800);
```

This system ensures that all colors remain consistent and theme-aware throughout the application.
