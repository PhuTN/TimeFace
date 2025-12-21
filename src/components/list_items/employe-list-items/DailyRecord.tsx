import React from 'react';
import {View, Text, StyleSheet} from 'react-native';
import {useUIFactory} from '../../../ui/factory/useUIFactory';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

type DayType =
  | 'work'
  | 'off'
  | 'holiday'
  | 'paid_leave'
  | 'unpaid_leave'
  | 'absent';

interface DailyRecordProps {
  date: string | Date; // "2025-11-20"
  type?: DayType; // ✅ NEW
  check_in?: string | null; // "08:05"
  check_out?: string | null; // "17:00"
  late_minutes?: number; // 0
  early_minutes?: number; // 0
  ot_minutes?: number; // 120
  isonlyot?: boolean; // false
}

const DailyRecord: React.FC<DailyRecordProps> = ({
  date,
  type = 'work',
  check_in,
  check_out,
  late_minutes,
  early_minutes,
  ot_minutes,
  isonlyot,
}) => {
  const {loading, theme, lang} = useUIFactory();
  if (loading || !theme || !lang) return null;

  const formatDate = (dateInput: Date | string): string => {
    const d = typeof dateInput === 'string' ? new Date(dateInput) : dateInput;
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();
    return `${day}/${month}/${year}`;
  };

  const safeNum = (n?: number) => (typeof n === 'number' ? n : 0);
  const toHHMM = (t?: string | null) => (t && t.trim().length ? t : '--:--');

  const formattedDate = formatDate(date);
  const ci = toHHMM(check_in);
  const co = toHHMM(check_out);

  const late = safeNum(late_minutes);
  const early = safeNum(early_minutes);
  const ot = safeNum(ot_minutes);
  const onlyOT = !!isonlyot;

  const totalPenalty = late + early;

  // ✅ nếu khác work và ko có OT => show đơn giản
  const isSimpleDay = type !== 'work' && ot <= 0;

  const getTypeLabel = (t: DayType) => {
    if (lang.code === 'vi') {
      switch (t) {
        case 'off':
          return 'Nghỉ';
        case 'holiday':
          return 'Ngày lễ';
        case 'paid_leave':
          return 'Nghỉ phép (có lương)';
        case 'unpaid_leave':
          return 'Nghỉ phép (không lương)';
        case 'absent':
          return 'Vắng';
        default:
          return 'Đi làm';
      }
    }
    switch (t) {
      case 'off':
        return 'Off';
      case 'holiday':
        return 'Holiday';
      case 'paid_leave':
        return 'Paid leave';
      case 'unpaid_leave':
        return 'Unpaid leave';
      case 'absent':
        return 'Absent';
      default:
        return 'Work';
    }
  };

  const getTypeIcon = (t: DayType) => {
    switch (t) {
      case 'holiday':
        return 'gift-outline';
      case 'paid_leave':
      case 'unpaid_leave':
        return 'beach';
      case 'off':
        return 'home-outline';
      case 'absent':
        return 'close-circle-outline';
      default:
        return 'calendar';
    }
  };

  const getTypeColor = (t: DayType) => {
    switch (t) {
      case 'holiday':
        return '#10B981'; // xanh
      case 'paid_leave':
        return '#3B82F6'; // xanh dương
      case 'unpaid_leave':
        return '#F97316'; // cam
      case 'off':
        return '#64748B'; // xám
      case 'absent':
        return '#EF4444'; // đỏ
      default:
        return '#8B5CF6'; // tím
    }
  };

  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: theme.colors.background,
          borderColor: theme.colors.borderLight,
          shadowColor: theme.colors.text,
        },
      ]}>
      {/* Header */}
      <View style={styles.header}>
        <MaterialCommunityIcons
          name={onlyOT ? 'clock-outline' : (getTypeIcon(type) as any)}
          size={22}
          color={onlyOT ? '#F59E0B' : getTypeColor(type)}
        />

        <View style={{flex: 1}}>
          <Text style={[styles.dateText, {color: theme.colors.text}]}>
            {formattedDate}
          </Text>

          {/* ✅ status line */}
          <Text style={[styles.subText, {color: theme.colors.mutedText}]}>
            {onlyOT
              ? lang.code === 'vi'
                ? 'Chỉ OT (không có check-in/out)'
                : 'Only OT (no check-in/out)'
              : getTypeLabel(type)}
          </Text>
        </View>

        {/* ✅ OT badge nếu có */}
        {ot > 0 && (
          <View style={[styles.badge, {borderColor: theme.colors.borderLight}]}>
            <Text style={[styles.badgeText, {color: theme.colors.primary}]}>
              OT {ot}m
            </Text>
          </View>
        )}
      </View>

      {/* ✅ SIMPLE VIEW: khác work & ko có OT */}
      {isSimpleDay ? (
        <View
          style={[
            styles.simpleBox,
            {
              backgroundColor: theme.colors.lightGrayBackground,
              borderColor: theme.colors.borderLight,
            },
          ]}>
          <Text style={[styles.simpleText, {color: theme.colors.text}]}>
            {lang.code === 'vi' ? 'Trạng thái:' : 'Status:'}{' '}
            <Text style={{fontWeight: '800'}}>{getTypeLabel(type)}</Text>
          </Text>
        </View>
      ) : (
        // ✅ FULL VIEW: work hoặc có OT
        <View
          style={[
            styles.dataWrapper,
            {
              backgroundColor: theme.colors.lightGrayBackground,
              borderColor: theme.colors.borderLight,
            },
          ]}>
          {/* Row 1: Check in/out */}
          <View style={styles.row}>
            <DataItem
              icon="login"
              label={lang.code === 'vi' ? 'Check-in' : 'Check-in'}
              value={ci}
              theme={theme}
            />
            <DataItem
              icon="logout"
              label={lang.code === 'vi' ? 'Check-out' : 'Check-out'}
              value={co}
              theme={theme}
            />
          </View>

          <View style={styles.divider} />

          {/* Row 2: late/early/penalty/ot */}
          <View style={styles.row}>
            <DataItem
              icon="clock-alert-outline"
              label={lang.code === 'vi' ? 'Đi trễ (phút)' : 'Late (min)'}
              value={`${late}`}
              theme={theme}
              highlight={late > 0}
            />
            <DataItem
              icon="clock-fast"
              label={lang.code === 'vi' ? 'Về sớm (phút)' : 'Early (min)'}
              value={`${early}`}
              theme={theme}
              highlight={early > 0}
            />
            <DataItem
              icon="alert-circle-outline"
              label={lang.code === 'vi' ? 'Phạt (phút)' : 'Penalty (min)'}
              value={`${totalPenalty}`}
              theme={theme}
              highlight={totalPenalty > 0}
            />
            <DataItem
              icon="timer-outline"
              label={lang.code === 'vi' ? 'OT (phút)' : 'OT (min)'}
              value={`${ot}`}
              theme={theme}
              highlight={ot > 0}
            />
          </View>
        </View>
      )}
    </View>
  );
};

const DataItem = ({
  icon,
  label,
  value,
  theme,
  highlight = false,
}: {
  icon: string;
  label: string;
  value: string;
  theme: any;
  highlight?: boolean;
}) => (
  <View style={styles.item}>
    <MaterialCommunityIcons
      name={icon as any}
      size={16}
      color={highlight ? theme.colors.primary : theme.colors.mutedText}
    />
    <Text
      style={[styles.label, {color: theme.colors.mutedText}]}
      numberOfLines={2}>
      {label}
    </Text>
    <Text
      style={[
        styles.value,
        {color: highlight ? theme.colors.primary : theme.colors.text},
      ]}
      numberOfLines={1}>
      {value}
    </Text>
  </View>
);

const styles = StyleSheet.create({
  card: {
    borderRadius: 14,
    borderWidth: 1,
    padding: 14,
    marginBottom: 10,
    shadowOffset: {width: 0, height: 3},
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    gap: 8,
  },
  dateText: {
    fontSize: 15,
    fontWeight: '700',
  },
  subText: {
    marginTop: 2,
    fontSize: 11,
    fontWeight: '500',
  },
  badge: {
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '800',
  },
  simpleBox: {
    borderRadius: 10,
    borderWidth: 1,
    paddingVertical: 12,
    paddingHorizontal: 12,
  },
  simpleText: {
    fontSize: 12,
    lineHeight: 18,
  },
  dataWrapper: {
    borderRadius: 10,
    borderWidth: 1,
    paddingVertical: 10,
    paddingHorizontal: 8,
    gap: 10,
  },
  row: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 8,
  },
  item: {
    width: '23%', // 4 item / hàng
    alignItems: 'center',
    gap: 4,
  },
  label: {
    fontSize: 10.5,
    lineHeight: 13,
    textAlign: 'center',
  },
  value: {
    fontSize: 12,
    fontWeight: '800',
    textAlign: 'center',
  },
  divider: {
    height: 1,
    opacity: 0.35,
    backgroundColor: '#999',
  },
});

export default DailyRecord;
