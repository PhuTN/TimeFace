import {useNavigation} from '@react-navigation/native';
import React from 'react';
import {
  Image,
  ImageBackground,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';

type Props = {
  title?: string;
  showBack?: boolean;
  onBackPress?: () => void;
  onAvatarPress?: () => void;
  avatarSrc?: number;
  pageBgColor?: string;
};

const Header: React.FC<Props> = ({
  title = 'ĐƠN XIN OT',
  showBack = true,
  onBackPress,
  onAvatarPress,
  avatarSrc = require('../../assets/Footer/FaceIcon.png'),
  pageBgColor = '#FFFFFF',
}) => {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<any>();

  const handleBack = () => {
    if (onBackPress) return onBackPress();
    if (navigation?.canGoBack?.()) navigation.goBack();
  };

  return (
    <View style={{backgroundColor: pageBgColor}}>
      <ImageBackground
        source={require('../../assets/Header/Header.png')}
        style={[styles.container, {paddingTop: Math.max(10, insets.top)}]}
        imageStyle={styles.bgImage}
        resizeMode="cover">
        <View style={styles.row}>
          {/* Trái: Back (ảnh PNG) */}
          <View style={styles.sideSlot}>
            {showBack && (
              <TouchableOpacity
                onPress={handleBack}
                activeOpacity={0.7}
                style={styles.iconBtn}
                hitSlop={{top: 6, bottom: 6, left: 6, right: 6}}>
                <Image
                  source={require('../../assets/Header/BackIcon.png')}
                  style={styles.backIcon} // KHÔNG tintColor
                  resizeMode="contain"
                />
              </TouchableOpacity>
            )}
          </View>

          {/* Giữa: Title */}
          <View style={styles.centerSlot}>
            <Text numberOfLines={1} style={styles.title}>
              {title}
            </Text>
          </View>

          {/* Phải: Avatar */}
          <View style={styles.sideSlot}>
            <TouchableOpacity
              onPress={onAvatarPress}
              activeOpacity={0.8}
              style={styles.iconBtn}>
              <Image source={avatarSrc} style={styles.avatar} />
            </TouchableOpacity>
          </View>
        </View>
      </ImageBackground>
    </View>
  );
};

const SIDE_WIDTH = 72;
const BACK_SIZE = 24; // kích thước gốc của icon Back (xuất file theo size này)

const styles = StyleSheet.create({
  container: {
    width: '100%',
    height: 130,
    borderBottomLeftRadius: 22,
    borderBottomRightRadius: 22,
    overflow: 'hidden',
  },
  bgImage: {
    borderBottomLeftRadius: 22,
    borderBottomRightRadius: 22,
  },
  row: {flex: 1, flexDirection: 'row', alignItems: 'center'},
  sideSlot: {width: SIDE_WIDTH, alignItems: 'center', justifyContent: 'center'},
  centerSlot: {flex: 1, alignItems: 'center', justifyContent: 'center'},
  iconBtn: {
    width: 52,
    height: 52,
    borderRadius: 26,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backIcon: {
    width: BACK_SIZE,
    height: BACK_SIZE,
    // không tintColor để giữ pixel gốc của PNG
  },
  title: {
    fontSize: 20,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 0.6,
  },
  avatar: {
    width: 46,
    height: 46,
    borderRadius: 23,
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
});

export default Header;
