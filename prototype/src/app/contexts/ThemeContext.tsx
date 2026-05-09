import React, { createContext, useContext, useState, ReactNode } from 'react';

export type ThemeColor = 'blue' | 'purple' | 'grey' | 'yellow' | 'green';

interface ThemeContextType {
  theme: ThemeColor;
  setTheme: (theme: ThemeColor) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const themeColors = {
  blue: {
    primary: '#1E88E5',
    primaryDark: '#1565C0',
    primaryLight: '#42A5F5',
    accent: '#00ACC1',
    accentLight: '#4DD0E1',
    success: '#26A69A',
    warning: '#FFA726',
    background: '#F5F9FC',
    backgroundAlt: '#E3F2FD',
    cardBackground: '#FFFFFF',
    cardBackgroundAlt: '#EBF5FB',
    textPrimary: '#1A237E',
    textSecondary: '#546E7A',
    textMuted: '#90A4AE',
    border: '#B3E5FC',
    chartColors: ['#1E88E5', '#00ACC1', '#42A5F5', '#26A69A', '#4DD0E1', '#7986CB'],
  },
  purple: {
    primary: '#7B1FA2',
    primaryDark: '#6A1B9A',
    primaryLight: '#9C27B0',
    accent: '#AB47BC',
    accentLight: '#CE93D8',
    success: '#66BB6A',
    warning: '#FFA726',
    background: '#F8F5FA',
    backgroundAlt: '#F3E5F5',
    cardBackground: '#FFFFFF',
    cardBackgroundAlt: '#F3E5F5',
    textPrimary: '#4A148C',
    textSecondary: '#6A1B9A',
    textMuted: '#9575CD',
    border: '#E1BEE7',
    chartColors: ['#7B1FA2', '#AB47BC', '#9C27B0', '#CE93D8', '#BA68C8', '#8E24AA'],
  },
  grey: {
    primary: '#546E7A',
    primaryDark: '#37474F',
    primaryLight: '#78909C',
    accent: '#607D8B',
    accentLight: '#90A4AE',
    success: '#66BB6A',
    warning: '#FFB74D',
    background: '#F5F7FA',
    backgroundAlt: '#ECEFF1',
    cardBackground: '#FFFFFF',
    cardBackgroundAlt: '#F5F7FA',
    textPrimary: '#263238',
    textSecondary: '#455A64',
    textMuted: '#78909C',
    border: '#CFD8DC',
    chartColors: ['#546E7A', '#607D8B', '#78909C', '#90A4AE', '#B0BEC5', '#455A64'],
  },
  yellow: {
    primary: '#F9A825',
    primaryDark: '#F57F17',
    primaryLight: '#FDD835',
    accent: '#FFB300',
    accentLight: '#FFD54F',
    success: '#66BB6A',
    warning: '#FF7043',
    background: '#FFFEF7',
    backgroundAlt: '#FFF9E6',
    cardBackground: '#FFFFFF',
    cardBackgroundAlt: '#FFFEF7',
    textPrimary: '#F57F17',
    textSecondary: '#F9A825',
    textMuted: '#FBC02D',
    border: '#FFF59D',
    chartColors: ['#F9A825', '#FFB300', '#FDD835', '#FFD54F', '#FFEB3B', '#FBC02D'],
  },
  green: {
    primary: '#00796B',
    primaryDark: '#004D40',
    primaryLight: '#26A69A',
    accent: '#009688',
    accentLight: '#4DB6AC',
    success: '#66BB6A',
    warning: '#FFA726',
    background: '#F1F8F7',
    backgroundAlt: '#E0F2F1',
    cardBackground: '#FFFFFF',
    cardBackgroundAlt: '#E8F5E9',
    textPrimary: '#004D40',
    textSecondary: '#00695C',
    textMuted: '#4DB6AC',
    border: '#B2DFDB',
    chartColors: ['#00796B', '#009688', '#26A69A', '#4DB6AC', '#80CBC4', '#00897B'],
  },
};

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<ThemeColor>('blue');

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}