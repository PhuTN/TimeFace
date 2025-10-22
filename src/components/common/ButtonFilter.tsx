import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ViewStyle,
  TextStyle,
} from 'react-native';

type Props = {
  text: string;
  textColor?: string;
  backgroundColor?: string;
  onPress: () => void;
  style?: ViewStyle;
  textStyle?: TextStyle;
};

const ButtonFilter: React.FC<Props> = ({
  text,
  textColor = '#000',
  backgroundColor = '#E3F4FF',
  onPress,
  style,
  textStyle,
}) => {
  return (
    <TouchableOpacity
      style={[styles.btn, {backgroundColor}, style]}
      activeOpacity={0.85}
      onPress={onPress}>
      <Text style={[styles.btnText, {color: textColor}, textStyle]}>
        {text}
      </Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  btn: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
  },
  btnText: {
    fontSize: 16,
    fontWeight: '600',
  },
});

export default React.memo(ButtonFilter);
