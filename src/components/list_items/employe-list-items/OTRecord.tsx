import React from 'react';
import {View, Text, StyleSheet, Image} from 'react-native';
import {useUIFactory} from '../../../ui/factory/useUIFactory';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

interface OTRecordProps {
  date: Date | string; // Date object or date string
  startTime: string; // e.g., "08:00 PM"
  otHours: string; // e.g., "02:00"
  status: 'approved' | 'pending' | 'rejected';
  approvalDate?: string; // e.g., "01-01-2000" (for approved/rejected)
  approverName?: string; // Name of the approver
  approverAvatar?: string; // URL or require() for approver's profile picture
}

const OTRecord: React.FC<OTRecordProps> = ({
  date,
  startTime,
  otHours,
  status,
  approvalDate,
  approverName,
  approverAvatar,
}) => {
  const {loading, theme, lang} = useUIFactory();

  if (loading || !theme || !lang) {
    return null;
  }

  // Format date as DD/MM/YYYY
  const formatDate = (dateInput: Date | string): string => {
    const dateObj =
      typeof dateInput === 'string' ? new Date(dateInput) : dateInput;
    const day = String(dateObj.getDate()).padStart(2, '0');
    const month = String(dateObj.getMonth() + 1).padStart(2, '0');
    const year = dateObj.getFullYear();
    return `${day}/${month}/${year}`;
  };

  const formattedDate = formatDate(date);

  // Status configuration
  const statusConfig = {
    approved: {
      iconName: 'check-circle',
      iconColor: '#10B981', // Green
      text: approvalDate
        ? `${lang.t('approvedOn')} ${approvalDate}`
        : lang.t('approvedOn'),
    },
    pending: {
      iconName: 'clock-outline',
      iconColor: '#F59E0B', // Yellow/Orange
      text: `${lang.t('pendingApproval')} …`,
    },
    rejected: {
      iconName: 'close-circle',
      iconColor: '#EF4444', // Red
      text: approvalDate
        ? `${lang.t('rejectedOn')} ${approvalDate}`
        : lang.t('rejectedOn'),
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
      {/* Header with Clock Icon and Date */}
      <View style={styles.header}>
        <MaterialCommunityIcons name="clock" size={24} color="#3B82F6" />
        <Text style={[styles.dateText, {color: theme.colors.text}]}>
          {formattedDate}
        </Text>
      </View>

      {/* Content Section - Two columns */}
      <View
        style={[
          styles.dataWrapper,
          {
            backgroundColor: theme.colors.lightGrayBackground,
            borderColor: theme.colors.borderLight,
          },
        ]}>
        <View style={styles.contentContainer}>
          {/* Start Time */}
          <View style={styles.dataColumn}>
            <Text style={[styles.label, {color: theme.colors.mutedText}]}>
              {lang.t('startAt')}
            </Text>
            <Text style={[styles.value, {color: theme.colors.text}]}>
              {startTime}
            </Text>
          </View>

          {/* OT Hours */}
          <View style={styles.dataColumn}>
            <Text style={[styles.label, {color: theme.colors.mutedText}]}>
              {lang.t('otHours')}
            </Text>
            <Text style={[styles.value, {color: theme.colors.text}]}>
              {otHours} {lang.t('hours')}
            </Text>
          </View>
        </View>
      </View>

      {/* Status Row - outside the container */}
      <View style={styles.statusRow}>
        {/* Status text with icon on left */}
        <View style={styles.statusTextContainer}>
          <MaterialCommunityIcons
            name={config.iconName as any}
            size={20}
            color={config.iconColor}
          />
          <Text style={[styles.statusText, {color: config.iconColor}]}>
            {config.text}
          </Text>
        </View>

        {/* Approver with profile picture on right */}
        {approverName && status !== 'pending' && (
          <View style={styles.approverContainer}>
            <Text style={[styles.approverText, {color: theme.colors.mutedText}]}>
              {lang.t('by')}{' '}
              <Text style={{color: theme.colors.primary, fontWeight: '600'}}>
                {approverName}
              </Text>
            </Text>
            {approverAvatar && (
              <Image
                source={
                  typeof approverAvatar === 'string'
                    ? {uri: approverAvatar}
                    : approverAvatar
                }
                style={styles.avatar}
              />
            )}
          </View>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 12,
    borderWidth: 1,
    padding: 16,
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 8,
  },
  dateText: {
    fontSize: 16,
    fontWeight: '700',
  },
  dataWrapper: {
    borderRadius: 8,
    borderWidth: 1,
    padding: 12,
    marginBottom: 8,
  },
  contentContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
  },
  dataColumn: {
    alignItems: 'flex-start',
    gap: 6,
  },
  label: {
    fontSize: 12,
    textAlign: 'center',
    lineHeight: 16,
  },
  value: {
    fontSize: 16,
    fontWeight: '500',
    textAlign: 'center',
  },
  statusRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 8,
  },
  statusTextContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flex: 1,
  },
  statusText: {
    fontSize: 14,
    fontWeight: '400',
  },
  approverContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  approverText: {
    fontSize: 14,
    fontWeight: '400',
  },
  avatar: {
    width: 24,
    height: 24,
    borderRadius: 12,
  },
});

export default OTRecord;
