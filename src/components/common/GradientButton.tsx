import React from 'react';
import { StyleSheet, Text, TouchableOpacity } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';

type GradientButtonProps = {
  text: string;
  onPress: () => void;
  /** Mảng màu gradient, ví dụ: ['#FF8C00', '#FF0080'] */
  colors?: string[];
  /** Cho phép chỉnh chiều gradient (tùy chọn) */
  start?: { x: number; y: number };
  end?: { x: number; y: number };
  /** Style tuỳ chỉnh thêm (tùy chọn) */
  style?: any;
  /** Bo góc của nút (tùy chọn, mặc định = 25) */
  borderRadius?: number;
  /** Màu chữ của nút (tùy chọn, mặc định = '#fff') */
  textColor?: string;
};

export default function GradientButton({
  text,
  onPress,
  colors = ['#2E7CF6', '#1D5EEA'],
  start = { x: 0, y: 0 },
  end = { x: 1, y: 0 },
  style,
  borderRadius = 25,
  textColor = '#fff', // 👈 mặc định màu trắng
}: GradientButtonProps) {
  return (
    <TouchableOpacity
      activeOpacity={0.9}
      onPress={onPress}
      style={[{ marginTop: 18 }, style]}>
      <LinearGradient
        colors={colors}
        start={start}
        end={end}
        style={[styles.btn, { borderRadius }]}
      >
        <Text style={[styles.btnText, { color: textColor }]}>{text}</Text>
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
