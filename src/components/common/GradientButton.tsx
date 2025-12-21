import React from 'react';
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  ViewStyle,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';

type GradientButtonProps = {
  text?: string;
  onPress: () => void;
  colors?: string[];
  disabledColors?: string[]; // 👈 màu khi disabled
  start?: { x: number; y: number };
  end?: { x: number; y: number };
  style?: ViewStyle | ViewStyle[];
  borderRadius?: number;
  textColor?: string;
  disabled?: boolean;        // 👈 THÊM
  children?: React.ReactNode;
};

export default function GradientButton({
  text,
  onPress,
  colors = ['#2E7CF6', '#1D5EEA'],
  disabledColors = ['#D1D5DB', '#D1D5DB'], // 👈 xám hoá
  start = { x: 0, y: 0 },
  end = { x: 1, y: 0 },
  style,
  borderRadius = 25,
  textColor = '#fff',
  disabled = false,
  children,
}: GradientButtonProps) {
  return (
    <TouchableOpacity
      activeOpacity={0.9}
      disabled={disabled}
      onPress={disabled ? undefined : onPress}
      style={[
        { marginTop: 18, opacity: disabled ? 0.6 : 1 },
        style,
      ]}
    >
      <LinearGradient
        colors={disabled ? disabledColors : colors}
        start={start}
        end={end}
        style={[styles.btn, { borderRadius }]}
      >
        {children ? (
          children
        ) : (
          <Text
            style={[
              styles.btnText,
              { color: disabled ? '#6B7280' : textColor },
            ]}
          >
            {text}
          </Text>
        )}
      </LinearGradient>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  btn: {
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnText: {
    fontSize: 16.5,
    fontWeight: '800',
  },
});
