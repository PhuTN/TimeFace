import React from 'react';
import {
  Image,
  StyleSheet,
  TouchableOpacity,
  View,
  Platform,       // <- thêm Platform
} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import Ionicons from 'react-native-vector-icons/Ionicons';

type Props = {
  activeIndex: number;
  onPress: (index: number) => void;
};

const ACTIVE = '#3C9CDC';
const INACTIVE = '#B8BDC7';
const BG = '#FFFFFF';
const SCREEN_BG = '#F5F6FA';
const BORDER_BLUE = '#2A93D9';

const BAR_HEIGHT = 65;

// import sẵn 2 icon
const CENTER_ICON_ACTIVE = require('../../assets/Footer/Icon.png');
const CENTER_ICON_INACTIVE = require('../../assets/Footer/Icon2.png');

const CENTER_SIZE = 68;
const CENTER_RADIUS = CENTER_SIZE / 2;

const Footer: React.FC<Props> = ({activeIndex, onPress}) => {
  const insets = useSafeAreaInsets();

  return (
    <View style={styles.root}>
      <View
        style={[
          styles.bar,
          {
            paddingBottom: 16 + insets.bottom,
          },
        ]}>
        {/* Viền nửa dưới bao quanh icon giữa */}
        <View pointerEvents="none" style={styles.centerBorder} />

        {/* Icon giữa – đổi theo activeIndex === 2 */}
        <TouchableOpacity
          style={styles.centerButton}
          activeOpacity={0.9}
          onPress={() => onPress(2)}>
          <Image
            source={
              activeIndex === 2
                ? CENTER_ICON_ACTIVE
                : CENTER_ICON_INACTIVE
            }
            style={styles.centerImage}
            resizeMode="contain"
          />
        </TouchableOpacity>

        {/* Hàng icon bên dưới */}
        <View style={styles.tabsRow}>
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

          <View style={styles.tabSpacer} />

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
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  root: {
    width: '100%',
    backgroundColor: SCREEN_BG,
    alignItems: 'center',
    overflow: 'visible',
  },

  bar: {
    width: '100%',
    height: BAR_HEIGHT,
    backgroundColor: BG,
  
    borderTopWidth: 2,
    borderColor: BORDER_BLUE,
    alignItems: 'center',
    justifyContent: 'flex-end',
    paddingHorizontal: 32,
    paddingTop: 10,
    // shadow cạnh trên
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOpacity: 0.18,
        shadowRadius: 18,
        shadowOffset: {width: 0, height: -6}, // hắt lên trên
      },
      android: {
        elevation: 10, // Android không chỉnh hướng, nhưng vì dính đáy nên bóng sẽ thấy ở trên là chính
      },
    }),
  },

  tabsRow: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  tab: {
    width: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },

  tabSpacer: {
    width: 44,
  },

  centerButton: {
    position: 'absolute',
    top: -25,
    alignSelf: 'center',
    width: CENTER_SIZE,
    height: CENTER_SIZE,
    alignItems: 'center',
    justifyContent: 'center',
  },

  centerImage: {
    width: CENTER_SIZE,
    height: CENTER_SIZE,
  },

  centerBorder: {
    position: 'absolute',
    alignSelf: 'center',
    width: CENTER_SIZE,
    height: CENTER_RADIUS,
    top: -28 + CENTER_RADIUS,
    borderBottomLeftRadius: CENTER_RADIUS,
    borderBottomRightRadius: CENTER_RADIUS,
    borderBottomWidth: 2,
    borderTopWidth: 0,
    borderColor: ACTIVE,
    backgroundColor: 'transparent',
  },
});

export default Footer;
