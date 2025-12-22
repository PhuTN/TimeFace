import {useFocusEffect} from '@react-navigation/native';
import {useCallback, useMemo, useState} from 'react';
import {SafeAreaView, ScrollView, View} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';

import Footer from '../components/common/Footer';
import HeaderBar from '../components/common/HeaderBar';
import FeatureItem from '../components/list_items/FeatureItem';

import {socketService} from '../../services/socketService';
import {apiHandle} from '../api/apihandle';
import {User} from '../api/endpoint/user';
import {useUIFactory} from '../ui/factory/useUIFactory';

export default function FeaturesScreen({navigation}: any) {
  /* =======================
     HOOKS (PHẢI LUÔN GỌI)
  ======================= */
  const {theme} = useUIFactory();
  const insets = useSafeAreaInsets();

  const [unreadTotal, setUnreadTotal] = useState(0);

  /* =======================
     LOAD UNREAD CHAT
  ======================= */
  const loadUnreadChat = useCallback(async () => {
    try {
      const {status, res} = await apiHandle
        .callApi(User.GetChatList)
        .asPromise();

      if (!status.isError && res?.success) {
        const total = (res.data || []).reduce(
          (sum: number, c: any) => sum + (c.unread_count || 0),
          0,
        );
        setUnreadTotal(total);
      } else {
        setUnreadTotal(0);
      }
    } catch {
      setUnreadTotal(0);
    }
  }, []);

  /* =======================
     REALTIME SOCKET
  ======================= */
  useFocusEffect(
    useCallback(() => {
      loadUnreadChat();

      const socket = socketService.getSocket();
      if (!socket) return;

      const onPing = () => loadUnreadChat();
      socket.on('pinguser', onPing);

      return () => {
        socket.off('pinguser', onPing);
      };
    }, [loadUnreadChat]),
  );

  /* =======================
     FEATURES LIST
  ======================= */

  const features = useMemo(
    () => [
      {
        text: 'Bảng công cá nhân',
        icon: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 3H5a2 2 0 0 0-2 2v4m6-6h10a2 2 0 0 1 2 2v4M9 3v18m0 0h10a2 2 0 0 0 2-2V9M9 21H5a2 2 0 0 1-2-2V9m0 0h18"/></svg>`,
        color: '#3629B7',
        onPress: () =>
          navigation.navigate('MonthTimesheet', {
            employeeId: 'me', // hoặc userId thật sau này
            employeeName: 'Bản thân tôi',
          }),
      },
      {
        text: 'Tăng ca',
        icon: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-clock-arrow-up-icon lucide-clock-arrow-up"><path d="M12 6v6l1.56.78"/><path d="M13.227 21.925a10 10 0 1 1 8.767-9.588"/><path d="m14 18 4-4 4 4"/><path d="M18 22v-8"/></svg>`,
        color: '#FFAF2A',
        onPress: () => navigation.navigate('OTRecord'),
      },
      {
        text: 'Xin nghỉ phép',
        icon: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M13 4h3a2 2 0 0 1 2 2v14"/><path d="M2 20h3"/><path d="M13 20h9"/><path d="M10 12v.01"/><path d="M13 4.562v16.157a1 1 0 0 1-1.242.97L5 20V5.562a2 2 0 0 1 1.515-1.94l4.243-1.33A2 2 0 0 1 13 4.562Z"/></svg>`,
        color: '#0890FE',
        onPress: () => navigation.navigate('LeaveRecord'),
      },

      {
        text: 'Khiếu nại chấm công',
        icon: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m7 11 2-2-2-2"/><path d="M11 13h4"/><path d="M7 17h4"/><path d="M14 19h1a3 3 0 0 0 3-3V5a2 2 0 0 0-2-2h-4.6a2 2 0 0 0-1.6.8l-2.8 3.2a2 2 0 0 0-.5 1.3V16a3 3 0 0 0 3 3h1"/></svg>`,
        color: '#FF6B6B',
        onPress: () =>
          navigation.navigate('ComplaintRequests', {mode: 'user'}),
      },

      {
        text: 'Lịch làm việc',
        icon: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="18" height="18" x="3" y="4" rx="2" ry="2"/><line x1="16" x2="16" y1="2" y2="6"/><line x1="8" x2="8" y1="2" y2="6"/><line x1="3" x2="21" y1="10" y2="10"/></svg>`,
        color: '#E91B1B',
        onPress: () => navigation.navigate('EmployeeWorkSchedule'),
      },
      {
        text: 'Quy định công ty',
        icon: `<svg viewBox="0 0 24 24" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" fill="#000000"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <g stroke="none" stroke-width="1" fill="none" fill-rule="evenodd"> <path d="M16.1843472,12.4178657 L20.125,14.2055265 L20.125,16.8870177 C20.125,17.9506758 19.8141263,18.9830499 19.2843274,19.8590037 L19.2843274,19.8590037 L18.0145615,18.5629496 C18.5750099,17.6959342 18.4830613,16.516078 17.7343373,15.7518531 C16.8805292,14.8803684 15.4925437,14.8803684 14.6387356,15.7518531 C13.7849275,16.6233377 13.7849275,18.0400589 14.6387356,18.9115435 C15.3874596,19.6757685 16.5433844,19.7740898 17.392814,19.1975692 L17.392814,19.1975692 L18.758907,20.5919446 C18.080239,21.4008611 17.1914029,21.9997275 16.1843472,22.25 C13.9250396,21.6868869 12.2436944,19.367397 12.2436944,16.8870177 L12.2436944,16.8870177 L12.2436944,14.2055265 L16.1843472,12.4178657 Z M16.2206149,2.25 L16.3602738,2.25605034 C17.1400163,2.32391093 17.7609452,2.95457947 17.8312976,3.74109011 L17.837941,3.89028777 L17.843,12.452 L16.22,11.714 L16.2206149,3.89028777 L5.76237127,3.89028777 L5.76237127,17.0125899 L11.677,17.012 L11.6789235,17.0719751 C11.7003003,17.6117712 11.7902952,18.1429057 11.9401529,18.6526991 L5.75418441,18.6528777 C4.9010278,18.6528777 4.20217416,17.9904014 4.13097393,17.1535892 L4.125,17.0125899 L4.13318686,3.89028777 C4.13318686,3.03561151 4.78713752,2.32815222 5.6216884,2.25605034 L5.76237127,2.25 L16.2206149,2.25 Z M11.6739614,13.7128297 L11.6739614,15.3435252 L7.35348665,15.3435252 L7.35348665,13.7128297 L11.6739614,13.7128297 Z M14.4751484,10.4514388 L14.4751484,12.0821343 L7.35348665,12.0821343 L7.35348665,10.4514388 L14.4751484,10.4514388 Z M13.5730712,7.19004796 L13.5730712,8.77278177 L7.35348665,8.77278177 L7.35348665,7.19004796 L13.5730712,7.19004796 Z M16.1843472,18.6746784 C16.9098013,18.6746784 17.4978981,18.0744062 17.4978981,17.3339329 C17.4978981,16.5934595 16.9098013,15.9931873 16.1843472,15.9931873 C15.458893,15.9931873 14.8707962,16.5934595 14.8707962,17.3339329 C14.8707962,18.0744062 15.458893,18.6746784 16.1843472,18.6746784 Z" fill="#009900" fill-rule="nonzero"> </path> </g> </g></svg>`,
        color: '#66FF33', // 🔵 xanh sky – hợp kiểu quy định
        onPress: () => navigation.navigate('CompanyRules'),
      },
      {
        text: 'Chat / Nhắn tin',
        icon: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" 
    viewBox="0 0 24 24" fill="none" stroke="currentColor" 
    stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
    <path d="M21 11.5a8.38 8.38 0 0 1-9 8.48 8.5 8.5 0 0 1-7.5-8.48C4.5 7.36 7.86 4 12 4s7.5 3.36 7.5 7.5z"/>
    <polyline points="12 12 12 12.01 12 12"/>
  </svg>`,
        color: '#0A7AFF',
        badgeCount: unreadTotal,
        onPress: () => navigation.navigate('ChatList'),
      },
    ],
    [navigation, unreadTotal],
  );

  /* =======================
     RENDER
  ======================= */
  if (!theme) return null;

  return (
    <SafeAreaView style={{flex: 1, backgroundColor: theme.colors.background}}>
      <HeaderBar
        title="Tính năng"
        topInset={insets.top}
        isShowBackButton={false}
      />

      <ScrollView
        contentContainerStyle={{
          paddingTop: 20,
          paddingHorizontal: 20,
          paddingBottom: 120,
        }}
        showsVerticalScrollIndicator={false}>
        <View
          style={{
            flexDirection: 'row',
            flexWrap: 'wrap',
            justifyContent: 'space-between',
          }}>
          {features.map((item, index) => (
            <FeatureItem
              key={index}
              text={item.text}
              icon={item.icon}
              color={item.color}
              badgeCount={item.badgeCount}
              onPress={item.onPress}
            />
          ))}
        </View>
      </ScrollView>

      <Footer
        activeIndex={1}
        onPress={(i: number) => {
          if (i === 0) navigation.navigate('Home');
          else if (i === 1) navigation.navigate('Features');
          else if (i === 3) navigation.navigate('Settings');
        }}
      />
    </SafeAreaView>
  );
}
