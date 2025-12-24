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

type Role = 'user' | 'admin' | 'sys_admin' | string;

export default function Footer({activeIndex, onPress}: Props) {
  const insets = useSafeAreaInsets();

  /** ================= STATE ================= */
  const [role, setRole] = useState<Role | null>(null);
  const [unread, setUnread] = useState(0);

  /** ================= LOAD ROLE (1 LẦN) ================= */
  useEffect(() => {
    let mounted = true;

    (async () => {
      const u = await authStorage.getUser();
      if (!mounted) return;
      setRole((u?.role as Role) ?? 'user');
    })();

    return () => {
      mounted = false;
    };
  }, []);

  /** ================= SCALE (CỐ ĐỊNH 5) ================= */
  const scales = useRef(
    Array.from({length: 5}, () => new Animated.Value(1)),
  ).current;

  useEffect(() => {
    scales.forEach((val, index) => {
      Animated.spring(val, {
        toValue: index === activeIndex ? 1.08 : 1,
        friction: 5,
        useNativeDriver: true,
      }).start();
    });
  }, [activeIndex, scales]);

  /** ================= NOTIFICATION ================= */
  const fetchNotifications = async () => {
    try {
      const res = await apiHandle.callApi(User.GetMyNotifications).asPromise();
      setUnread(res?.res?.unread_count ?? 0);
    } catch {}
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  useEffect(() => {
    const unsub = messaging().onMessage(async msg => {
      Toast.show({
        type: 'info',
        text1: msg.notification?.title || 'Thông báo',
        position: 'top',
      });
      await fetchNotifications();
    });
    return () => unsub();
  }, []);

  /** ================= NAV ================= */
  const handlePress = async (index: number) => {
    onPress(index);
    if (!navigationRef.isReady()) return;

    const u = await authStorage.getUser();
    const r: Role = (u?.role as Role) ?? 'user';

    // ✅ SYS ADMIN FLOW
    if (r === 'sys_admin') {
      switch (index) {
        case 0:
          navigationRef.navigate('CompanyDashboard');
          return;
        case 1:
          navigationRef.navigate('CompanyAdmin');
          return;
        case 2:
          navigationRef.navigate('SubscriptionPlanList');
          return;
        case 3:
          navigationRef.navigate('Settings');
          return;
        default:
          navigationRef.navigate('Notification');
          return;
      }
    }

    // ✅ ADMIN / USER FLOW (giữ như cũ)
    switch (index) {
      case 0:
        navigationRef.navigate(r === 'admin' ? 'HomeAdmin' : 'Home');
        break;
      case 1:
        navigationRef.navigate(r === 'admin' ? 'Management' : 'Features');
        break;
      case 2:
        navigationRef.navigate('EmployeeAttendance');
        break;
      case 3:
        navigationRef.navigate('Settings');
        break;
      default:
        navigationRef.navigate('Notification');
        break;
    }
  };

  /** ================= GUARD ================= */
  if (role === null) {
    return <View style={{height: BAR_HEIGHT}} />;
  }

  /** ================= RENDER SYS ADMIN ================= */
  const renderSysAdmin = () => (
    <View style={[styles.tabsRow, {justifyContent: 'space-between'}]}>
      {[0, 1, 2, 3, 4].map(i => (
        <Animated.View key={i} style={{transform: [{scale: scales[i]}]}}>
          <TouchableOpacity style={styles.tab} onPress={() => handlePress(i)}>
            <Ionicons
              name={
                i === 0
                  ? 'stats-chart-outline'
                  : i === 1
                  ? 'business-outline'
                  : i === 2
                  ? 'card-outline'
                  : i === 3
                  ? 'settings-outline'
                  : 'notifications-outline'
              }
              size={30}
              color={activeIndex === i ? ACTIVE : INACTIVE}
            />

            {i === 4 && unread > 0 && (
              <View style={styles.badge}>
                <Animated.Text style={styles.badgeText}>
                  {unread > 99 ? '99+' : unread}
                </Animated.Text>
              </View>
            )}
          </TouchableOpacity>
        </Animated.View>
      ))}
    </View>
  );

  /** ================= RENDER ADMIN ================= */
  const renderAdmin = () => (
    <View style={[styles.tabsRow, {justifyContent: 'space-around'}]}>
      {[0, 1, 3, 4].map(i => (
        <Animated.View key={i} style={{transform: [{scale: scales[i]}]}}>
          <TouchableOpacity style={styles.tab} onPress={() => handlePress(i)}>
            <Ionicons
              name={
                i === 0
                  ? 'home-outline'
                  : i === 1
                  ? 'clipboard-outline'
                  : i === 3
                  ? 'settings-outline'
                  : 'notifications-outline'
              }
              size={32}
              color={activeIndex === i ? ACTIVE : INACTIVE}
            />
            {i === 4 && unread > 0 && (
              <View style={styles.badge}>
                <Animated.Text style={styles.badgeText}>
                  {unread > 99 ? '99+' : unread}
                </Animated.Text>
              </View>
            )}
          </TouchableOpacity>
        </Animated.View>
      ))}
    </View>
  );

  /** ================= RENDER USER ================= */
  const renderUser = () => (
    <>
      <View pointerEvents="none" style={styles.centerBorder} />
      <Animated.View style={[styles.centerButton, {transform: [{scale: scales[2]}]}]}>
        <TouchableOpacity onPress={() => handlePress(2)}>
          <Image
            source={activeIndex === 2 ? CENTER_ICON_ACTIVE : CENTER_ICON_INACTIVE}
            style={styles.centerImage}
          />
        </TouchableOpacity>
      </Animated.View>

      <View style={styles.tabsRow}>
        {[0, 1].map(i => (
          <Animated.View key={i} style={{transform: [{scale: scales[i]}]}}>
            <TouchableOpacity style={styles.tab} onPress={() => handlePress(i)}>
              <Ionicons
                name={i === 0 ? 'home-outline' : 'checkbox-outline'}
                size={32}
                color={activeIndex === i ? ACTIVE : INACTIVE}
              />
            </TouchableOpacity>
          </Animated.View>
        ))}

        <View style={styles.tabSpacer} />

        {[3, 4].map(i => (
          <Animated.View key={i} style={{transform: [{scale: scales[i]}]}}>
            <TouchableOpacity style={styles.tab} onPress={() => handlePress(i)}>
              <Ionicons
                name={i === 3 ? 'settings-outline' : 'notifications-outline'}
                size={32}
                color={activeIndex === i ? ACTIVE : INACTIVE}
              />
              {i === 4 && unread > 0 && (
                <View style={styles.badge}>
                  <Animated.Text style={styles.badgeText}>
                    {unread > 99 ? '99+' : unread}
                  </Animated.Text>
                </View>
              )}
            </TouchableOpacity>
          </Animated.View>
        ))}
      </View>
    </>
  );

  /** ================= UI ================= */
  return (
    <View style={styles.root}>
      <View style={[styles.bar, {paddingBottom: 16 + insets.bottom}]}>
        {role === 'sys_admin' ? renderSysAdmin() : role === 'admin' ? renderAdmin() : renderUser()}
      </View>
    </View>
  );
}

/** ================= STYLE ================= */
const styles = StyleSheet.create({
  root: {
    width: '100%',
    backgroundColor: SCREEN_BG,
    alignItems: 'center',
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
    borderBottomWidth: 2,
    borderColor: ACTIVE,
    borderBottomLeftRadius: CENTER_RADIUS,
    borderBottomRightRadius: CENTER_RADIUS,
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
  },
  badgeText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '700',
  },
});
