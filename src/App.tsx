import React from 'react';
import HomeScreen from './screens/HomeScreen';
import Notch from './components/ui/Notch';
import { ThemeProvider } from './context/ThemeContext';
import { LanguageProvider } from './context/LanguageContext';
import { ThemeColorProvider } from './context/ThemeColorContext';

const App = () => {
  return (
    <ThemeProvider>
      <ThemeColorProvider>
        <LanguageProvider>
          <Notch />
          <HomeScreen />
        </LanguageProvider>
      </ThemeColorProvider>
    </ThemeProvider>
  );
};

export default App;
