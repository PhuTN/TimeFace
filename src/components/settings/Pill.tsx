import {Pressable, StyleSheet, Text, ViewStyle} from 'react-native';

type Props = {
  text: string;
  active?: boolean;
  onPress?: () => void;
  style?: ViewStyle;
};

export default function Pill({text, active, onPress, style}: Props) {
  return (
    <Pressable
      onPress={onPress}
      style={({pressed}) => [
        styles.wrap,
        active ? styles.active : styles.inactive,
        pressed && {opacity: 0.85},
        style,
      ]}>
      <Text style={[styles.text, active ? styles.textActive : styles.textInactive]}>
        {text}
      </Text>
    </Pressable>
  );
}

const PURPLE = '#7C6AF2';

const styles = StyleSheet.create({
  wrap: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
  },
  active: {backgroundColor: '#7C6AF2'},
  inactive: {backgroundColor: '#EEE9FF'},
  text: {fontWeight: '700', fontSize: 12},
  textActive: {color: '#FFFFFF'},
  textInactive: {color: PURPLE},
});
