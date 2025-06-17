import { MD3LightTheme } from 'react-native-paper';

export const theme = {
  ...MD3LightTheme,
  colors: {
    ...MD3LightTheme.colors,
    primary: '#4F46E5',
    secondary: '#7C3AED',
    tertiary: '#059669',
    surface: '#FFFFFF',
    background: '#F8FAFC',
    outline: '#E2E8F0',
    onPrimary: '#FFFFFF',
    onSecondary: '#FFFFFF',
    onSurface: '#1E293B',
    onBackground: '#1E293B',
    error: '#EF4444',
    success: '#10B981',
    warning: '#F59E0B',
    info: '#3B82F6'
  },
  fonts: {
    ...MD3LightTheme.fonts,
    displayLarge: {
      fontSize: 57,
      fontWeight: '400',
      lineHeight: 64,
    },
    displayMedium: {
      fontSize: 45,
      fontWeight: '400',
      lineHeight: 52,
    },
    displaySmall: {
      fontSize: 36,
      fontWeight: '400',
      lineHeight: 44,
    },
    headlineLarge: {
      fontSize: 32,
      fontWeight: '600',
      lineHeight: 40,
    },
    headlineMedium: {
      fontSize: 28,
      fontWeight: '600',
      lineHeight: 36,
    },
    headlineSmall: {
      fontSize: 24,
      fontWeight: '600',
      lineHeight: 32,
    },
    titleLarge: {
      fontSize: 22,
      fontWeight: '600',
      lineHeight: 28,
    },
    titleMedium: {
      fontSize: 16,
      fontWeight: '600',
      lineHeight: 24,
    },
    titleSmall: {
      fontSize: 14,
      fontWeight: '600',
      lineHeight: 20,
    },
    bodyLarge: {
      fontSize: 16,
      fontWeight: '400',
      lineHeight: 24,
    },
    bodyMedium: {
      fontSize: 14,
      fontWeight: '400',
      lineHeight: 20,
    },
    bodySmall: {
      fontSize: 12,
      fontWeight: '400',
      lineHeight: 16,
    },
    labelLarge: {
      fontSize: 14,
      fontWeight: '500',
      lineHeight: 20,
    },
    labelMedium: {
      fontSize: 12,
      fontWeight: '500',
      lineHeight: 16,
    },
    labelSmall: {
      fontSize: 11,
      fontWeight: '500',
      lineHeight: 16,
    }
  }
};