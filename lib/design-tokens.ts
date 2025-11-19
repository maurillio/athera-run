/**
 * Design Tokens - Athletic Performance Design System
 * Athera Run v4.0.0
 */

// Spacing scale (4px base)
export const spacing = {
  0: '0',
  1: '0.25rem', // 4px
  2: '0.5rem', // 8px
  3: '0.75rem', // 12px
  4: '1rem', // 16px
  5: '1.25rem', // 20px
  6: '1.5rem', // 24px
  8: '2rem', // 32px
  10: '2.5rem', // 40px
  12: '3rem', // 48px
  16: '4rem', // 64px
  20: '5rem', // 80px
  24: '6rem', // 96px
} as const;

// Typography scale
export const typography = {
  display: {
    fontSize: '3rem', // 48px
    lineHeight: '1.1',
    fontWeight: '700',
    fontFamily: 'Poppins, Inter, sans-serif',
  },
  h1: {
    fontSize: '2.25rem', // 36px
    lineHeight: '1.2',
    fontWeight: '700',
    fontFamily: 'Poppins, Inter, sans-serif',
  },
  h2: {
    fontSize: '1.875rem', // 30px
    lineHeight: '1.3',
    fontWeight: '600',
    fontFamily: 'Inter, sans-serif',
  },
  h3: {
    fontSize: '1.5rem', // 24px
    lineHeight: '1.4',
    fontWeight: '600',
    fontFamily: 'Inter, sans-serif',
  },
  h4: {
    fontSize: '1.25rem', // 20px
    lineHeight: '1.5',
    fontWeight: '600',
    fontFamily: 'Inter, sans-serif',
  },
  bodyLarge: {
    fontSize: '1.125rem', // 18px
    lineHeight: '1.6',
    fontWeight: '400',
  },
  body: {
    fontSize: '1rem', // 16px
    lineHeight: '1.6',
    fontWeight: '400',
  },
  bodySmall: {
    fontSize: '0.875rem', // 14px
    lineHeight: '1.6',
    fontWeight: '400',
  },
  caption: {
    fontSize: '0.75rem', // 12px
    lineHeight: '1.5',
    fontWeight: '500',
  },
} as const;

// Color palette - Athletic Performance
export const colors = {
  brand: {
    primary: '#E64A19',
    primaryDark: '#D94216',
    primaryLight: '#FF6E40',
    secondary: '#1E293B',
    secondaryDark: '#0F172A',
    secondaryLight: '#334155',
    accent: '#10B981',
    accentDark: '#059669',
    accentLight: '#34D399',
  },
  slate: {
    50: '#F8FAFC',
    100: '#F1F5F9',
    200: '#E2E8F0',
    300: '#CBD5E1',
    400: '#94A3B8',
    500: '#64748B',
    600: '#475569',
    700: '#334155',
    800: '#1E293B',
    900: '#0F172A',
  },
  semantic: {
    success: '#10B981',
    error: '#EF4444',
    warning: '#F59E0B',
    info: '#3B82F6',
  },
} as const;

// Elevation system (shadows)
export const elevation = {
  1: '0 1px 3px rgba(0, 0, 0, 0.05)',
  2: '0 4px 6px rgba(0, 0, 0, 0.07)',
  3: '0 10px 15px rgba(0, 0, 0, 0.1)',
  4: '0 20px 25px rgba(0, 0, 0, 0.15)',
} as const;

// Border radius
export const radius = {
  sm: '0.5rem', // 8px
  md: '0.625rem', // 10px
  lg: '0.75rem', // 12px
  xl: '1rem', // 16px
  '2xl': '1.5rem', // 24px
  full: '9999px',
} as const;

// Breakpoints
export const breakpoints = {
  sm: '640px',
  md: '768px',
  lg: '1024px',
  xl: '1280px',
  '2xl': '1536px',
} as const;

// Animation durations
export const duration = {
  fast: '150ms',
  normal: '200ms',
  slow: '300ms',
  slower: '500ms',
} as const;

// Z-index scale
export const zIndex = {
  base: 0,
  dropdown: 10,
  sticky: 20,
  fixed: 30,
  modal: 40,
  popover: 50,
  tooltip: 60,
} as const;

// Icon sizes
export const iconSize = {
  xs: '16px',
  sm: '20px',
  md: '24px',
  lg: '32px',
  xl: '48px',
} as const;

// Export all tokens
export const tokens = {
  spacing,
  typography,
  colors,
  elevation,
  radius,
  breakpoints,
  duration,
  zIndex,
  iconSize,
} as const;

export default tokens;
