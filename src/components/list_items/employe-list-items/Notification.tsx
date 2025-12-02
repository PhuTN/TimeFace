import React from 'react';
import {View, Text, StyleSheet} from 'react-native';
import {useUIFactory} from '../../../ui/factory/useUIFactory';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

interface NotificationProps {
  title: string; // The notification title (e.g., "Đơn xin nghỉ đã được duyệt!")
  status: 'approved' | 'rejected';
  value: string; // The main content/value
  approverName: string; // Name of the person who approved/rejected
  time: string; // Time of the notification (e.g., "10:00 AM")
}

const Notification: React.FC<NotificationProps> = ({
  title,
  status,
  value,
  approverName,
  time,
}) => {
  const {loading, theme, lang} = useUIFactory();

  if (loading || !theme || !lang) {
    return null;
  }

  const isApproved = status === 'approved';

  // Status-specific configuration
  const statusConfig = {
    approved: {
      iconName: 'check-circle',
      iconColor: '#10B981', // Green
      titleColor: '#10B981', // Green title
    },
    rejected: {
      iconName: 'close-circle',
      iconColor: '#EF4444', // Red
      titleColor: '#EF4444', // Red title
    },
  };

  const config = statusConfig[status];

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: theme.colors.background,
          borderColor: theme.colors.borderLight,
          shadowColor: theme.colors.text,
        },
      ]}>
      {/* Left Icon */}
      <View
        style={[
          styles.iconContainer,
          {backgroundColor: theme.colors.background},
        ]}>
        <MaterialCommunityIcons
          name={config.iconName as any}
          size={40}
          color={config.iconColor}
        />
      </View>

      {/* Content */}
      <View style={styles.content}>
        {/* Title and Time Row */}
        <View style={styles.titleRow}>
          <Text
            style={[
              styles.title,
              {color: config.titleColor},
            ]}
            numberOfLines={1}>
            {title}
          </Text>
          <Text style={[styles.time, {color: theme.colors.mutedText}]}>
            {time}
          </Text>
        </View>

        {/* Value */}
        <Text
          style={[styles.value, {color: theme.colors.text}]}
          numberOfLines={2}>
          {value}
        </Text>

        {/* Approver */}
        <Text style={[styles.approver, {color: theme.colors.mutedText}]}>
          {isApproved ? 'Duyệt bởi' : 'Từ chối bởi'}{' '}
          <Text style={{color: theme.colors.primary, fontWeight: '600'}}>
            {approverName}
          </Text>
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    padding: 16,
    gap: 12,
  },
  iconContainer: {
    width: 64,
    height: 64,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    flex: 1,
    gap: 6,
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 8,
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    flex: 1,
  },
  time: {
    fontSize: 12,
    fontWeight: '400',
  },
  value: {
    fontSize: 14,
    fontWeight: '400',
    lineHeight: 20,
  },
  approverRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  approver: {
    alignSelf: "flex-end",
    paddingTop: 4,
    fontSize: 12,
    fontWeight: '400',
  },
});

export default Notification;
