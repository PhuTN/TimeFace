import React from 'react';
import {
  Image,
  Platform,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import Ionicons from 'react-native-vector-icons/Ionicons';

type Props = {
  activeIndex: number;
  onPress: (index: number) => void;
};

const ACTIVE = '#007AFF';
const INACTIVE = '#B8BDC7';
const BG = '#FFFFFF';

const BAR_HEIGHT = 74;

const Footer: React.FC<Props> = ({activeIndex, onPress}) => {
  const insets = useSafeAreaInsets();

  return (
    <View
      style={[styles.container, {paddingBottom: Math.max(8, insets.bottom)}]}>
      <TouchableOpacity
        style={styles.tab}
        activeOpacity={0.9}
        onPress={() => onPress(0)}>
        <Ionicons
          name="home-outline"
          size={32}
          color={activeIndex === 0 ? ACTIVE : INACTIVE}
        />
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.tab}
        activeOpacity={0.9}
        onPress={() => onPress(1)}>
        <Ionicons
          name="checkbox-outline"
          size={32}
          color={activeIndex === 1 ? ACTIVE : INACTIVE}
        />
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.centerTab}
        activeOpacity={0.9}
        onPress={() => onPress(2)}>
        <Image
          source={require('../../assets/Footer/FaceIcon.png')}
          style={styles.centerImage}
          resizeMode="contain"
        />
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.tab}
        activeOpacity={0.9}
        onPress={() => onPress(3)}>
        <Ionicons
          name="settings-outline"
          size={32}
          color={activeIndex === 3 ? ACTIVE : INACTIVE}
        />
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.tab}
        activeOpacity={0.9}
        onPress={() => onPress(4)}>
        <Ionicons
          name="notifications-outline"
          size={32}
          color={activeIndex === 4 ? ACTIVE : INACTIVE}
        />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  // Không dùng absolute. Chỉ cần đặt Footer là phần tử cuối cùng trong màn hình.
  container: {
    width: '100%',
    height: BAR_HEIGHT,
    backgroundColor: BG,
    borderTopLeftRadius: 18,
    borderTopRightRadius: 18,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingHorizontal: 8,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOpacity: 0.1,
        shadowRadius: 16,
        shadowOffset: {width: 0, height: -2},
      },
      android: {elevation: 10},
    }),
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 10,
  },
  centerTab: {
    width: 92,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 25,
  },
  centerImage: {
    width: 65,
    height: 65,
  },
});

export default Footer;
