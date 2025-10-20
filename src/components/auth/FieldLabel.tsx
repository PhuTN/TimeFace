import React from 'react';
import {StyleSheet, Text, TextStyle} from 'react-native';

export default function FieldLabel({
  children,
  style,
}: {
  children: React.ReactNode;
  style?: TextStyle;
}) {
  return <Text style={[styles.label, style]}>{children}</Text>;
}
const styles = StyleSheet.create({
  label: {fontSize: 12.5, color: '#8B95A4', marginBottom: 6, marginLeft: 2},
});
