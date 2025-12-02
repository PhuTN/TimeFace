import {useNavigation} from '@react-navigation/native';
import React from 'react';
import {
  Image,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import type {Theme} from '../../ui/theme/theme';

type Props = {
  title?: string;
  showBack?: boolean;
  onBackPress?: () => void;
  onAvatarPress?: () => void;
  avatarSrc?: number;
  theme?: Theme;
};

const SIDE_WIDTH = 60;
const BACK_SIZE = 24;

const Header2: React.FC<Props> = ({
  title = 'ĐƠN XIN OT',
  showBack = true,
  onBackPress,
  onAvatarPress,
  avatarSrc = require('../../assets/images/examples/avatar1.png'),
  theme,
}) => {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<any>();

  const handleBack = () => {
    if (onBackPress) return onBackPress();
    if (navigation?.canGoBack?.()) navigation.goBack();
  };

  const primaryColor = theme?.colors.primary || '#1976d2';
  const barStyle = theme?.name === 'dark' ? 'light-content' : 'dark-content';

  return (
    <View>
      <StatusBar
        translucent
        backgroundColor="transparent"
        barStyle={barStyle}
      />

      <View
        style={[
          styles.topBar,
          {paddingTop: Math.max(12, insets.top + 6)},
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
                style={[styles.backIcon, {tintColor: primaryColor}]}
                resizeMode="contain"
              />
            </TouchableOpacity>
          )}
        </View>

        <View style={styles.centerSlot}>
          <Text numberOfLines={1} style={[styles.title, {color: primaryColor}]}>
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
  );
};

const styles = StyleSheet.create({
  topBar: {
    paddingHorizontal: 0, // Less horizontal padding
    paddingBottom: 12,
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
    letterSpacing: 0.6,
  },
  avatar: {
    width: 46,
    height: 46,
    borderRadius: 23,
    borderWidth: 2,
    borderColor: '#CCCCCC',
  },
});

export default Header2;
