import React from 'react';
import {Pressable, StyleSheet, Text, ViewStyle} from 'react-native';

type Props = {
  code: 'vi' | 'en';
  onToggle: (next: 'vi' | 'en') => void;
  style?: ViewStyle;
};

/** A simple compact switch with text VIE/ENG */
export default function LangSwitch({code, onToggle, style}: Props) {
  const isEn = code === 'en';
  const label = isEn ? 'ENG' : 'VIE';
  return (
    <Pressable
      accessibilityRole="switch"
      accessibilityState={{checked: isEn}}
      onPress={() => onToggle(isEn ? 'vi' : 'en')}
      style={({pressed}) => [
        styles.wrap,
        isEn ? styles.on : styles.off,
        pressed && {opacity: 0.9},
        style,
      ]}>
      <Text style={[styles.text, isEn ? styles.textOn : styles.textOff]}>
        {label}
      </Text>
    </Pressable>
  );
}

const PURPLE = '#7C6AF2';

const styles = StyleSheet.create({
  wrap: {
    minWidth: 54,
    height: 28,
    paddingHorizontal: 10,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  on: {backgroundColor: PURPLE, borderColor: '#6A59E6'},
  off: {backgroundColor: '#EEE9FF', borderColor: '#E3DEFF'},
  text: {fontSize: 12, fontWeight: '800', letterSpacing: 0.5},
  textOn: {color: '#FFFFFF'},
  textOff: {color: PURPLE},
});

