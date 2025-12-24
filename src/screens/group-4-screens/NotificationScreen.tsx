import React, {useEffect, useState} from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  Platform,
  TouchableOpacity,
} from 'react-native';
import HeaderBar from '../../components/common/HeaderBar';
import Footer from '../../components/common/Footer';
import {apiHandle} from '../../api/apihandle';
import {User} from '../../api/endpoint/User';
import messaging from '@react-native-firebase/messaging';
import {navigationRef} from '../../navigation/NavigationService';

export default function NotificationScreen() {
  const [loading, setLoading] = useState(true);
  const [list, setList] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState(4); // 🔔 tab notifications

  // ========================
  // 📥 LOAD NOTIFICATIONS
  // ========================
  const loadNotifications = async () => {
    try {
      console.log('📥 [NOTI_SCREEN] load notifications');
      setLoading(true);

      const res = await apiHandle
        .callApi(User.GetMyNotifications)
        .asPromise();

      setList(res?.res?.data ?? []);
    } catch (e) {
      console.log('❌ [NOTI_SCREEN] loadNotifications error', e);
    } finally {
      setLoading(false);
    }
  };

  // ========================
  // 👁️ SEEN ALL
  // ========================
  const seenAll = async () => {
    try {
      console.log('👁️ [NOTI_SCREEN] seen all');
      await apiHandle.callApi(User.SeenAllNotifications).asPromise();
    } catch (e) {
      console.log('❌ [NOTI_SCREEN] seenAll error', e);
    }
  };

  // ========================
  // 👉 VÀO MÀN: LOAD + SEEN
  // ========================
  useEffect(() => {
    loadNotifications();
    seenAll();
  }, []);

  // ========================
  // 🔔 FIREBASE FOREGROUND
  // ========================
  useEffect(() => {
    const unsubscribe = messaging().onMessage(async remoteMessage => {
      console.log('📩 [NOTI_SCREEN] firebase message', remoteMessage);
      await loadNotifications();
    });

    return () => unsubscribe();
  }, []);

  // ========================
  // 👉 HANDLE CLICK NOTI
  // ========================
  const handlePressNotification = (item: any) => {
    try {
      const screenName = item?.type;

      console.log('➡️ [NOTI_SCREEN] navigate to:', screenName);

      if (!screenName) return;

      if (!navigationRef.isReady()) return;

      navigationRef.navigate(screenName as never);
    } catch (err) {
      console.log('❌ [NOTI_SCREEN] navigate error', err);
    }
  };

  // ========================
  // 🎨 RENDER ITEM
  // ========================
  const renderItem = ({item}: any) => {
    return (
      <TouchableOpacity
        activeOpacity={0.85}
        onPress={() => handlePressNotification(item)}>
        <View style={[styles.card, !item.is_read && styles.unread]}>
          <Text style={styles.title}>{item.title}</Text>
          <Text style={styles.body}>{item.body}</Text>
          <Text style={styles.time}>
            {new Date(item.created_at).toLocaleString()}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  // ========================
  // 🧱 UI
  // ========================
  return (
    <View style={styles.root}>
      <HeaderBar title="Thông báo" isShowBackButton ={false}/>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator />
        </View>
      ) : (
        <FlatList
          data={list}
          keyExtractor={item => item._id}
          renderItem={renderItem}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <Text style={styles.empty}>Không có thông báo</Text>
          }
        />
      )}

      {/* ⭐ FOOTER */}
      <Footer
        activeIndex={activeTab}
        onPress={index => setActiveTab(index)}
      />
    </View>
  );
}

// ========================
// 🎨 STYLES
// ========================
const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#F5F6FA',
  },

  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },

  list: {
    padding: 16,
    paddingBottom: 110,
  },

  empty: {
    textAlign: 'center',
    color: '#9CA3AF',
    marginTop: 40,
    fontWeight: '700',
  },

  card: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 16,
    marginBottom: 14,

    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOpacity: 0.08,
        shadowRadius: 10,
        shadowOffset: {width: 0, height: 6},
      },
      android: {
        elevation: 3,
      },
    }),
  },

  unread: {
    borderLeftWidth: 4,
    borderLeftColor: '#3C9CDC',
    backgroundColor: '#EEF6FF',
  },

  title: {
    fontSize: 15,
    fontWeight: '900',
    color: '#111827',
  },

  body: {
    marginTop: 6,
    fontSize: 13,
    color: '#374151',
    lineHeight: 18,
  },

  time: {
    marginTop: 10,
    fontSize: 11,
    color: '#9CA3AF',
    fontWeight: '600',
  },
});
