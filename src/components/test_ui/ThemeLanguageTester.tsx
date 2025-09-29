import React from 'react';
import { View, Text, Switch, StyleSheet } from 'react-native';
import { translations } from '../../untils/i18n';
import { useLanguage } from '../../asycnc_store/LanguageContext';
import { useTheme } from '../../asycnc_store/ThemeContext';

export default function ThemeLanguageTester() {
 
  const { language, toggleLanguage } = useLanguage();
  const t = translations[language];


  const { theme, toggleTheme } = useTheme();
  const isDark = theme === 'dark';
  // Lựa chọn style theo theme hiện tại
  const styles = isDark ? darkStyles : whiteStyles;

  return (
    <View style={styles.container}>
      <Text style={styles.text}>{t.greeting}</Text>
      <View style={styles.row}>
        <Text style={styles.text}>{t.toggle_theme}</Text>
        <Switch value={isDark} onValueChange={toggleTheme} />
      </View>
      <View style={styles.row}>
        <Text style={styles.text}>{t.toggle_language}</Text>
        <Switch value={language === 'en'} onValueChange={toggleLanguage} />
      </View>
    </View>
  );
}

const darkStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#333',
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 10,
    gap: 10,
  },
  text: {
    color: '#fff',
    fontSize: 16,
  },
});

const whiteStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 10,
    gap: 10,
  },
  text: {
    color: '#000',
    fontSize: 16,
  },
});
