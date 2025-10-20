import React from 'react';
import {StyleSheet, TextInput, TextInputProps, View} from 'react-native';

export default function Input({
  rightIcon,
  style,
  ...props
}: TextInputProps & {rightIcon?: React.ReactNode}) {
  return (
    <View style={[styles.inputWrap, style]}>
      <TextInput
        {...props}
        style={styles.input}
        placeholderTextColor="#9AA2B1"
      />
      {rightIcon ? <View style={styles.rightIcon}>{rightIcon}</View> : null}
    </View>
  );
}
const styles = StyleSheet.create({
  inputWrap: {
    height: 48,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E6E9EF',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 12,
    justifyContent: 'center',
    marginBottom: 8,
  },
  input: {fontSize: 16, color: '#1B2333', paddingRight: 32},
  rightIcon: {
    position: 'absolute',
    right: 10,
    height: 48,
    justifyContent: 'center',
  },
});
