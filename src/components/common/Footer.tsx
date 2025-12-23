import React, {useEffect, useRef, useState} from 'react';
import {
  Image,
  StyleSheet,
  TouchableOpacity,
  View,
  Platform,
  Animated,
} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import Ionicons from 'react-native-vector-icons/Ionicons';
import {navigationRef} from '../../navigation/NavigationService';
import {authStorage} from '../../services/authStorage';
import Toast from 'react-native-toast-message';
import {apiHandle} from '../../api/apihandle';
import {User} from '../../api/endpoint/User';
import messaging from '@react-native-firebase/messaging';
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

const CENTER_ICON_ACTIVE = require('../../assets/Footer/Icon.png');
const CENTER_ICON_INACTIVE = require('../../assets/Footer/Icon2.png');

const CENTER_SIZE = 68;
const CENTER_RADIUS = CENTER_SIZE / 2;

export default function Footer({activeIndex, onPress}: Props) {
  const insets = useSafeAreaInsets();
  const [unread, setUnread] = useState(0);
  const scales = useRef([
    new Animated.Value(1),
    new Animated.Value(1),
    new Animated.Value(1),
    new Animated.Value(1),
    new Animated.Value(1),
  ]).current;

  useEffect(() => {
    scales.forEach((val, index) => {
      Animated.spring(val, {
        toValue: index === activeIndex ? 1.08 : 1,

        friction: 5,
        useNativeDriver: true,
      }).start();
    });
  }, [activeIndex]);

  const fetchNotifications = async (source: string) => {
    try {
      console.log(`📥 [NOTI] Fetch notifications (${source})`);

      const res = await apiHandle.callApi(User.GetMyNotifications).asPromise();

      const unreadCount = res?.res?.unread_count ?? 0;

      console.log(
        `📦 [NOTI] Notifications (${source})`,
        'unread =',
        unreadCount,
        res?.res?.data,
      );

      setUnread(unreadCount);
    } catch (err) {
      console.log(`❌ [NOTI] Fetch failed (${source}):`, err);
    }
  };

  useEffect(() => {
    fetchNotifications('app_start');
  }, []);

  useEffect(() => {
    console.log('🔔 [NOTI] Listen Firebase foreground');

    const unsubscribe = messaging().onMessage(async remoteMessage => {
      console.log('📩 [NOTI] Firebase message:', remoteMessage);

      const title = remoteMessage.notification?.title || 'Thông báo';
      const body = '';

      // 👉 1️⃣ Toast
      Toast.show({
        type: 'info',
        text1: title,
        text2: body,
        position: 'top',
      });

      // 👉 2️⃣ Reload notifications
      await fetchNotifications('firebase_push');
    });

    return () => unsubscribe();
  }, []);
  const handlePress = async (index: number) => {
    onPress(index);

    if (!navigationRef.isReady()) return;

    // ⭐ Load user từ authStorage
    const user = await authStorage.getUser();
    const role = user?.role || 'user';

    switch (index) {
      case 0:
        navigationRef.navigate('Home');
        break;

      case 1:
        // ⭐ Nếu admin → Management
        if (role === 'admin') {
          navigationRef.navigate('Management');
        } else {
          navigationRef.navigate('Features');
        }
        break;

      case 3:
        navigationRef.navigate('Settings');
        break;

      case 2:
        navigationRef.navigate('EmployeeAttendance');
        break;

      default:
        navigationRef.navigate('Notification');
        break;
    }
  };

  return (
    <View style={styles.root}>
      <View
        style={[
          styles.bar,
          {
            paddingBottom: 16 + insets.bottom,
          },
        ]}>
        <View pointerEvents="none" style={styles.centerBorder} />

        {/* ⭐ CENTER BUTTON */}
        <Animated.View
          style={[styles.centerButton, {transform: [{scale: scales[2]}]}]}>
          <TouchableOpacity activeOpacity={0.9} onPress={() => handlePress(2)}>
            <Image
              source={
                activeIndex === 2 ? CENTER_ICON_ACTIVE : CENTER_ICON_INACTIVE
              }
              style={styles.centerImage}
              resizeMode="contain"
            />
          </TouchableOpacity>
        </Animated.View>

        <View style={styles.tabsRow}>
          {/* TAB 0 */}
          <Animated.View style={{transform: [{scale: scales[0]}]}}>
            <TouchableOpacity
              style={styles.tab}
              onPress={() => handlePress(0)}
              activeOpacity={0.8}>
              <Ionicons
                name="home-outline"
                size={32}
                color={activeIndex === 0 ? ACTIVE : INACTIVE}
              />
            </TouchableOpacity>
          </Animated.View>

          {/* ⭐ TAB 1 — chuyển sang màn FEATURES */}
          <Animated.View style={{transform: [{scale: scales[1]}]}}>
            <TouchableOpacity
              style={styles.tab}
              onPress={() => handlePress(1)}
              activeOpacity={0.8}>
              <Ionicons
                name="checkbox-outline"
                size={32}
                color={activeIndex === 1 ? ACTIVE : INACTIVE}
              />
            </TouchableOpacity>
          </Animated.View>

          <View style={styles.tabSpacer} />

          {/* TAB 3 */}
          <Animated.View style={{transform: [{scale: scales[3]}]}}>
            <TouchableOpacity
              style={styles.tab}
              onPress={() => handlePress(3)}
              activeOpacity={0.8}>
              <Ionicons
                name="settings-outline"
                size={32}
                color={activeIndex === 3 ? ACTIVE : INACTIVE}
              />
            </TouchableOpacity>
          </Animated.View>

          {/*  — NOTIFICATION */}
          <Animated.View style={{transform: [{scale: scales[4]}]}}>
            <TouchableOpacity
              style={styles.tab}
              onPress={() => handlePress(4)}
              activeOpacity={0.8}>
              <View style={{position: 'relative'}}>
                <Ionicons
                  name="notifications-outline"
                  size={32}
                  color={activeIndex === 4 ? ACTIVE : INACTIVE}
                />

                {unread > 0 && (
                  <View style={styles.badge}>
                    <Animated.Text style={styles.badgeText}>
                      {unread > 99 ? '99+' : unread}
                    </Animated.Text>
                  </View>
                )}
              </View>
            </TouchableOpacity>
          </Animated.View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    width: '100%',
    backgroundColor: SCREEN_BG,
    alignItems: 'center',
    overflow: 'visible',
  },
  badge: {
    position: 'absolute',
    top: -6,
    right: -8,
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: '#FF3B30',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
    zIndex: 10,
  },

  badgeText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '700',
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

    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOpacity: 0.18,
        shadowRadius: 18,
        shadowOffset: {width: 0, height: -6},
      },
      android: {
        elevation: 0,
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

  tabSpacer: {width: 44},

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
    borderColor: ACTIVE,
  },
});
