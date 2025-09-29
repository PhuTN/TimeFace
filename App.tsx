import React from 'react';

import AppNavigator from './src/navigation/AppNavigator';

import { LanguageProvider } from './src/asycnc_store/LanguageContext';
import { ThemeProvider } from './src/asycnc_store/ThemeContext';

export default function App() {
  return (
    <ThemeProvider>
      <LanguageProvider>
        <AppNavigator />
      </LanguageProvider>
    </ThemeProvider>
  );
}
