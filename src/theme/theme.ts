import { MD3LightTheme as DefaultTheme } from 'react-native-paper';

// Translating variables from your old index.css to a Material Design 3 theme
export const theme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: '#3498db', // --primary-color
    onPrimary: '#ffffff', // --text-color-light
    primaryContainer: '#cce5ff',
    onPrimaryContainer: '#001d35',
    secondary: '#f39c12', // --warning-color
    background: '#f5f5f5', // A slightly better background color
    surface: '#ffffff', // --panel-bg-color
    onSurface: '#2c3e50', // --text-color
    onSurfaceVariant: '#7f8c8d', // --text-color-muted
    error: '#e74c3c', // --danger-color
    outline: '#dce4e8', // --border-color
    elevation: {
        ...DefaultTheme.colors.elevation,
        level2: '#ffffff' // Header background
    }
  },
};