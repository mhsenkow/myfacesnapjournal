# Migration Strategy: Tailwind to Local Utilities

## Overview

This document outlines the strategy for gradually migrating from Tailwind CSS to our local utility system while maintaining UI consistency and theme support.

## Current Status

✅ **Completed:**
- Local utility system created with CSS custom properties
- Theme system integration maintained
- All major utility categories implemented

## Migration Approach

### Phase 1: Parallel System (Current)
- Both Tailwind and local utilities are available
- New components can use either system
- Existing components remain unchanged
- Theme switching works with both systems

### Phase 2: Gradual Component Migration
- Start with new components using local utilities
- Migrate existing components one by one
- Test thoroughly after each migration
- Maintain visual consistency

### Phase 3: Tailwind Removal
- Remove Tailwind dependencies
- Clean up unused imports
- Optimize build process

## Utility Class Mapping

### Colors
```css
/* Tailwind → Local */
bg-blue-500 → bg-primary-500
text-gray-700 → text-neutral-700
border-red-300 → border-error-300
```

### Spacing
```css
/* Tailwind → Local */
p-4 → p-md
m-2 → m-sm
gap-6 → gap-lg
```

### Typography
```css
/* Tailwind → Local */
text-lg → text-lg (unchanged)
font-semibold → font-semibold (unchanged)
leading-relaxed → leading-relaxed (unchanged)
```

### Layout
```css
/* Tailwind → Local */
flex → flex (unchanged)
grid-cols-3 → grid-cols-3 (unchanged)
w-full → w-full (unchanged)
```

### Borders & Shadows
```css
/* Tailwind → Local */
rounded-lg → rounded-lg (unchanged)
shadow-md → shadow-md (unchanged)
border-2 → border-2 (unchanged)
```

## Theme Compatibility

Our local utilities use the same CSS custom properties as the existing theme system:

- `--color-primary-*` for primary colors
- `--color-neutral-*` for neutral colors
- `--spacing-*` for spacing values
- `--text-*` for typography
- `--radius-*` for border radius
- `--shadow-*` for shadows

## Benefits of Local System

1. **Theme Consistency**: All utilities use CSS custom properties
2. **No Build Dependencies**: Pure CSS, no JavaScript compilation
3. **Customization**: Easy to modify and extend
4. **Performance**: Smaller bundle size
5. **Maintenance**: Full control over utility classes

## Testing Checklist

For each component migration:

- [ ] Visual appearance matches original
- [ ] Theme switching works (light/dark/brutalist)
- [ ] Responsive behavior maintained
- [ ] Hover/focus states work correctly
- [ ] Animations and transitions preserved
- [ ] Accessibility features intact

## Rollback Plan

If issues arise:
1. Revert component to Tailwind classes
2. Document the issue
3. Fix local utility if needed
4. Re-attempt migration

## Timeline

- **Week 1-2**: Test local utilities with new components
- **Week 3-4**: Migrate 2-3 existing components
- **Week 5-6**: Migrate remaining components
- **Week 7**: Remove Tailwind dependencies

## Files to Update

### High Priority (Core Components)
- `src/components/Layout/Layout.tsx`
- `src/components/Layout/Sidebar.tsx`
- `src/components/UI/PostInspector.tsx`

### Medium Priority (Feature Components)
- `src/components/Journal/JournalControls.tsx`
- `src/components/Notifications/NotificationPanel.tsx`
- `src/components/Profile/BlueskyProfileInfo.tsx`

### Low Priority (Specialized Components)
- Modal components
- Form components
- Icon components

## Notes

- Keep both systems during migration for safety
- Test theme switching thoroughly
- Document any custom utility classes needed
- Maintain consistent naming conventions
