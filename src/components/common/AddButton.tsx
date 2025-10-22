import React from 'react';
import {
  Image,
  ImageSourcePropType,
  ImageStyle,
  StyleSheet,
  Text,
  TextStyle,
  TouchableOpacity,
  View,
  ViewStyle,
} from 'react-native';

type Props = {
  title?: string; // text to show
  icon?: ImageSourcePropType; // local require(...) or { uri: ... }
  onPress?: () => void;
  style?: ViewStyle; // container override
  textStyle?: TextStyle; // text override
  iconStyle?: ImageStyle; // icon override
  iconLeft?: boolean; // put icon before text
  gap?: number; // space between text and icon
  disabled?: boolean;
};

const AddButton: React.FC<Props> = ({
  title = 'Thêm nhân viên',
  icon = require('../../assets/AddIcon.png'),
  onPress,
  style,
  textStyle,
  iconStyle,
  iconLeft = false,
  gap = 8,
  disabled = false,
}) => {
  return (
    <TouchableOpacity
      activeOpacity={0.85}
      onPress={onPress}
      disabled={disabled}
      style={[styles.button, style, disabled && {opacity: 0.6}]}>
      <View style={[styles.row, {columnGap: gap}]}>
        {iconLeft && icon && (
          <Image
            source={icon}
            style={[styles.icon, iconStyle]}
            resizeMode="contain"
          />
        )}
        <Text style={[styles.text, textStyle]}>{title}</Text>
        {!iconLeft && icon && (
          <Image
            source={icon}
            style={[styles.icon, iconStyle]}
            resizeMode="contain"
          />
        )}
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    backgroundColor: '#D8F6FF',
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 14,
    alignSelf: 'center',
    elevation: 3,
    shadowColor: '#000',
    shadowOpacity: 0.12,
    shadowRadius: 6,
    shadowOffset: {width: 0, height: 3},
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  text: {
    fontSize: 16,
    fontWeight: '600',
    color: '#0A0A0A',
  },
  icon: {
    width: 30,
    height: 30,
  },
});

export default AddButton;
