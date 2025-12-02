import {useNavigation} from '@react-navigation/native';
import React from 'react';
import {
  Image,
  ImageBackground,
  StatusBar,
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

const HEADER_HEIGHT = 100;
const SIDE_WIDTH = 100;
const BACK_SIZE = 24;

const Header: React.FC<Props> = ({
  title = 'ĐƠN XIN OT',
  showBack = true,
  onBackPress,
  onAvatarPress,
  avatarSrc = require('../../assets/Footer/FaceIcon.png'),
  pageBgColor = 'transparent',
}) => {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<any>();

  const handleBack = () => {
    if (onBackPress) {return onBackPress();}
    if (navigation?.canGoBack?.()) {navigation.goBack();}
  };

  return (
    <View style={{backgroundColor: pageBgColor}}>
      {/* If you use a translucent status bar elsewhere, keep this for consistency */}
      <StatusBar
        translucent
        backgroundColor="transparent"
        barStyle="light-content"
      />

      <View style={styles.container}>
        {/* Full background but clipped by rounded container */}
        <ImageBackground
          source={require('../../assets/Header/Header.png')}
          style={StyleSheet.absoluteFill}
          imageStyle={styles.imageClip}
          resizeMode="cover"
          //pointerEvents="none"
        />

        {/* Single top row overlay */}
        <View
          style={[
            styles.topBar,
            {paddingTop: Math.max(12, insets.top + 6)}, // push below punch-hole
          ]}>
          <View style={styles.sideSlot}>
            {showBack && (
              <TouchableOpacity
                onPress={handleBack}
                activeOpacity={0.7}
                style={styles.iconBtn}
                hitSlop={{top: 6, bottom: 6, left: 6, right: 6}}>
                <Image
                  source={require('../../assets/Header/BackIcon.png')}
                  style={styles.backIcon}
                  resizeMode="contain"
                />
              </TouchableOpacity>
            )}
          </View>

          {/* Centered title stays truly centered because left and right sides have equal width */}
          <View style={styles.centerSlot}>
            <Text numberOfLines={1} style={styles.title}>
              {title}
            </Text>
          </View>

          <View style={styles.sideSlot}>
            <TouchableOpacity
              onPress={onAvatarPress}
              activeOpacity={0.8}
              style={styles.iconBtn}>
              <Image source={avatarSrc} style={styles.avatar} />
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    height: HEADER_HEIGHT,
    // borderBottomLeftRadius: 22,
    // borderBottomRightRadius: 22,
    overflow: 'hidden', // clips background to rounded corners
  },
  imageClip: {
    borderBottomLeftRadius: 22,
    borderBottomRightRadius: 22,
  },
  topBar: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
  },
  sideSlot: {width: SIDE_WIDTH, alignItems: 'center', justifyContent: 'center'},
  centerSlot: {flex: 1, alignItems: 'center', justifyContent: 'center'},
  iconBtn: {
    width: 52,
    height: 52,
    borderRadius: 26,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backIcon: {width: BACK_SIZE, height: BACK_SIZE},
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
