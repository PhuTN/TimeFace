import React from 'react';
import {
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ViewStyle,
} from 'react-native';

type Props = {
  title?: string;
  onPress?: () => void;
  style?: ViewStyle;
};

const AddButton: React.FC<Props> = ({
  title = 'Thêm nhân viên',
  onPress,
  style,
}) => {
  return (
    <TouchableOpacity
      activeOpacity={0.85}
      onPress={onPress}
      style={[styles.button, style]}>
      <View style={styles.row}>
        <Text style={styles.text}>{title}</Text>
        <Image
          source={require('../../assets/AddIcon.png')}
          style={styles.icon}
          resizeMode="contain"
        />
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    backgroundColor: '#D8F6FF', // xanh nhạt như hình
    borderRadius: 12, // bo 4 góc
    paddingVertical: 10,
    paddingHorizontal: 14,
    alignSelf: 'center',
    // bóng nhẹ
    elevation: 3,
    shadowColor: '#000',
    shadowOpacity: 0.12,
    shadowRadius: 6,
    shadowOffset: {width: 0, height: 3},
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
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
