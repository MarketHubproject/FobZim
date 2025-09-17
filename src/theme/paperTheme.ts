import { MD3LightTheme } from 'react-native-paper';
import { colors } from './colors';

export const paperTheme = {
  ...MD3LightTheme,
  colors: {
    ...MD3LightTheme.colors,
    primary: colors.primary,
    primaryContainer: colors.primary + '20', // 20% opacity
    secondary: colors.secondary,
    secondaryContainer: colors.secondary + '20',
    tertiary: colors.accent,
    tertiaryContainer: colors.accent + '20',
    surface: colors.surface,
    surfaceVariant: colors.background,
    background: colors.background,
    error: colors.error,
    onPrimary: colors.white,
    onSecondary: colors.black,
    onTertiary: colors.white,
    onSurface: colors.textPrimary,
    onSurfaceVariant: colors.textSecondary,
    onBackground: colors.textPrimary,
    onError: colors.white,
    outline: colors.border,
    outlineVariant: colors.muted,
  },
};