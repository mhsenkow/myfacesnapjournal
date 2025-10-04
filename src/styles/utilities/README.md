# Local Utility System

This directory contains our local CSS utility classes that mirror Tailwind's functionality while using our CSS custom properties for theme support.

## File Structure

- `colors.css` - Color utilities (background, text, border colors)
- `spacing.css` - Spacing utilities (padding, margin, gap)
- `typography.css` - Typography utilities (font sizes, weights, line heights)
- `layout.css` - Layout utilities (display, flexbox, grid, positioning)
- `borders.css` - Border utilities (width, style, radius, ring)
- `shadows.css` - Shadow utilities (box shadow, drop shadow, ring shadow)
- `transitions.css` - Transition and animation utilities

## Usage

All utilities are imported through `utilities.css` in the main stylesheet.

### Example Usage

```jsx
// Instead of Tailwind classes:
<div className="bg-blue-500 text-white p-4 rounded-lg shadow-md">

// Use our local utilities:
<div className="bg-primary-500 text-white p-md rounded-lg shadow-md">
```

## Theme Integration

All utilities use CSS custom properties defined in `theme.css`:

```css
/* Our utilities use these variables */
.bg-primary-500 { background-color: var(--color-primary-500); }
.p-md { padding: var(--spacing-md); }
.text-lg { font-size: var(--text-lg); }
```

## Benefits

1. **Theme Consistency**: All utilities respect the current theme
2. **No Build Step**: Pure CSS, no compilation needed
3. **Customizable**: Easy to modify and extend
4. **Performance**: Smaller bundle size than Tailwind
5. **Maintenance**: Full control over utility classes

## Migration

See `MIGRATION_STRATEGY.md` in the project root for detailed migration instructions.

## Testing

Use the `UtilityTest` component to verify all utilities work correctly:

```jsx
import { UtilityTest } from './components/UI/UtilityTest'

// Add to any page for testing
<UtilityTest />
```
