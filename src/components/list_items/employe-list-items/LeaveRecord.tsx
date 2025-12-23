import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
} from 'react-native';
import {useUIFactory} from '../../../ui/factory/useUIFactory';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

interface LeaveRecordProps {
  date: Date | string;
  leaveDates: string;
  numberOfDays: string;
  leaveType: 'annual' | 'sick' | 'unpaid';
  status: 'approved' | 'pending' | 'rejected';
  approvalDate?: string;
  approverName?: string;
  approverAvatar?: string;
  onPress?: () => void; // ✅ THÊM
}

const LeaveRecord: React.FC<LeaveRecordProps> = ({
  date,
  leaveDates,
  numberOfDays,
  leaveType,
  status,
  approvalDate,
  approverName,
  approverAvatar,
  onPress,
}) => {
  const {loading, theme, lang} = useUIFactory();

  if (loading || !theme || !lang) {
    return null;
  }

  /* ===================== FORMAT DATE ===================== */
  const formatDate = (dateInput: Date | string): string => {
    const dateObj =
      typeof dateInput === 'string' ? new Date(dateInput) : dateInput;
    const day = String(dateObj.getDate()).padStart(2, '0');
    const month = String(dateObj.getMonth() + 1).padStart(2, '0');
    const year = dateObj.getFullYear();
    return `${day}/${month}/${year}`;
  };

  const formattedDate = formatDate(date);

  /* ===================== LEAVE TYPE CONFIG ===================== */
  const LEAVE_TYPE_CONFIG = {
    annual: {
      label: lang.t('annualLeave') ?? 'Phép năm',
      color: '#3B82F6',
    },
    sick: {
      label: lang.t('sickLeave') ?? 'Nghỉ ốm',
      color: '#10B981',
    },
    unpaid: {
      label: lang.t('unpaidLeave') ?? 'Không lương',
      color: '#6B7280',
    },
  };

  /* ===================== STATUS CONFIG ===================== */
  const statusConfig = {
    approved: {
      iconName: 'check-circle',
      iconColor: '#10B981',
      text: approvalDate
        ? `${lang.t('approvedOn')} ${approvalDate}`
        : lang.t('approvedOn'),
    },
    pending: {
      iconName: 'clock-outline',
      iconColor: '#F59E0B',
      text: `${lang.t('pendingApproval')} …`,
    },
    rejected: {
      iconName: 'close-circle',
      iconColor: '#EF4444',
      text: approvalDate
        ? `${lang.t('rejectedOn')} ${approvalDate}`
        : lang.t('rejectedOn'),
    },
  };

  const config = statusConfig[status];
  const leaveTypeConfig = LEAVE_TYPE_CONFIG[leaveType];

  return (
    <TouchableOpacity
      activeOpacity={0.85}
      onPress={onPress}
      disabled={!onPress} // ✅ không truyền thì không bấm được
    >
      <View
        style={[
          styles.container,
          {
            backgroundColor: theme.colors.background,
            borderColor: theme.colors.borderLight,
            shadowColor: theme.colors.text,
          },
        ]}>
        {/* ================= HEADER ================= */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <MaterialCommunityIcons name="clock" size={22} color="#3B82F6" />
            <Text style={[styles.dateText, {color: theme.colors.text}]}>
              {formattedDate}
            </Text>
          </View>

          <View
            style={[
              styles.leaveTypeBadge,
              {backgroundColor: leaveTypeConfig.color + '22'},
            ]}>
            <Text
              style={[
                styles.leaveTypeText,
                {color: leaveTypeConfig.color},
              ]}>
              {leaveTypeConfig.label}
            </Text>
          </View>
        </View>

        {/* ================= CONTENT ================= */}
        <View
          style={[
            styles.dataWrapper,
            {
              backgroundColor: theme.colors.lightGrayBackground,
              borderColor: theme.colors.borderLight,
            },
          ]}>
          <View style={styles.contentContainer}>
            <View style={styles.dataColumn}>
              <Text style={[styles.label, {color: theme.colors.mutedText}]}>
                {lang.t('leaveDates')}
              </Text>
              <Text style={[styles.value, {color: theme.colors.text}]}>
                {leaveDates}
              </Text>
            </View>

            <View style={styles.dataColumn}>
              <Text style={[styles.label, {color: theme.colors.mutedText}]}>
                {lang.t('numberOfDays')}
              </Text>
              <Text style={[styles.value, {color: theme.colors.text}]}>
                {numberOfDays} {lang.t('days')}
              </Text>
            </View>
          </View>
        </View>

        {/* ================= STATUS ================= */}
        <View style={styles.statusRow}>
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

          {approverName && status !== 'pending' && (
            <View style={styles.approverContainer}>
              <Text
                style={[
                  styles.approverText,
                  {color: theme.colors.mutedText},
                ]}>
                {lang.t('by')}{' '}
                <Text
                  style={{
                    color: theme.colors.primary,
                    fontWeight: '600',
                  }}>
                  {approverName}
                </Text>
              </Text>

              {approverAvatar && (
                <Image
                  source={{uri: approverAvatar}}
                  style={styles.avatar}
                />
              )}
            </View>
          )}
        </View>
      </View>
    </TouchableOpacity>
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
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  dateText: {
    fontSize: 16,
    fontWeight: '700',
  },
  leaveTypeBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
  },
  leaveTypeText: {
    fontSize: 12,
    fontWeight: '600',
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
    gap: 6,
  },
  label: {
    fontSize: 12,
  },
  value: {
    fontSize: 16,
    fontWeight: '500',
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
  },

  approverContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  approverText: {
    fontSize: 14,
  },
  avatar: {
    width: 24,
    height: 24,
    borderRadius: 12,
  },
});

export default LeaveRecord;
