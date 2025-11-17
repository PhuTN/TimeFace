import React from 'react';
import {SafeAreaView, ScrollView, View} from 'react-native';
import {useUIFactory} from '../../ui/factory/useUIFactory';
import Header2 from '../../components/common/Header2';
import Notification from '../../components/list_items/employe-list-items/Notification';

// Fake data for demonstration
const fakeNotifications = [
  {
    id: '1',
    title: 'Đơn xin nghỉ đã được duyệt!',
    status: 'approved' as const,
    value: 'Đơn xin nghỉ từ ngày 25/10/2025 đến 27/10/2025',
    approverName: 'Nguyễn Văn A',
    time: '10:00 AM',
  },
  {
    id: '2',
    title: 'Đơn xin nghỉ đã bị từ chối!',
    status: 'rejected' as const,
    value: 'Đơn xin nghỉ từ ngày 28/10/2025 đến 30/10/2025',
    approverName: 'Trần Thị B',
    time: '2:30 PM',
  },
  {
    id: '3',
    title: 'Đơn xin OT đã được duyệt!',
    status: 'approved' as const,
    value: 'Đơn xin OT ngày 29/10/2025 từ 18:00 đến 20:00',
    approverName: 'Lê Văn C',
    time: '9:15 AM',
  },
  {
    id: '4',
    title: 'Đơn xin nghỉ đã bị từ chối!',
    status: 'rejected' as const,
    value: 'Đơn xin nghỉ ngày 30/10/2025',
    approverName: 'Phạm Thị D',
    time: 'Yesterday',
  },
  {
    id: '5',
    title: 'Đơn đổi ca làm việc đã được duyệt!',
    status: 'approved' as const,
    value: 'Đơn đổi ca làm việc từ ca sáng sang ca chiều',
    approverName: 'Hoàng Văn E',
    time: '8:00 AM',
  },
];

const NotificationScreen: React.FC = () => {
  const {loading, theme, lang} = useUIFactory();

  if (loading || !theme || !lang) {
    return null;
  }

  return (
    <SafeAreaView
      style={{flex: 1, backgroundColor: theme.colors.lightGrayBackground}}>
      <Header2 title={lang.t('notificationTitle')} theme={theme} />

      <ScrollView
        contentContainerStyle={{paddingVertical: 16}}
        showsVerticalScrollIndicator={false}>
        {/* Notifications List */}
        {fakeNotifications.map(notification => (
          <Notification
            key={notification.id}
            title={notification.title}
            status={notification.status}
            value={notification.value}
            approverName={notification.approverName}
            time={notification.time}
          />
        ))}
      </ScrollView>
    </SafeAreaView>
  );
};

export default NotificationScreen;
