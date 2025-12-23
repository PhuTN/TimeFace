import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  GestureResponderEvent,
} from 'react-native';
import {useUIFactory} from '../../../ui/factory/useUIFactory';

interface MonthTimesheetProps {
  month: number;
  year: number;

  workingDays: number;

  // BE
  unpaidDays?: number;
  lateMinutes?: number;
  earlyMinutes?: number;
  penaltyMinutes?: number;
  otWeekdayMinutes?: number;
  otWeekendMinutes?: number;
  otHolidayMinutes?: number;
  netSalary?: number;

  // FE legacy
  unpaidLeaveDays?: number;
  monthlySalary?: number;

  onPress?: (e: GestureResponderEvent) => void;
}

const MonthTimesheet: React.FC<MonthTimesheetProps> = props => {
  const {loading, theme, lang} = useUIFactory();
  if (loading || !theme || !lang) return null;

  const {
    month,
    year,
    workingDays,
    unpaidLeaveDays,
    unpaidDays,
    lateMinutes,
    earlyMinutes,
    penaltyMinutes,
    otWeekdayMinutes,
    otWeekendMinutes,
    otHolidayMinutes,
    monthlySalary,
    netSalary,
    onPress,
  } = props;

  const monthNames = {
    vi: [
      'Tháng 1',
      'Tháng 2',
      'Tháng 3',
      'Tháng 4',
      'Tháng 5',
      'Tháng 6',
      'Tháng 7',
      'Tháng 8',
      'Tháng 9',
      'Tháng 10',
      'Tháng 11',
      'Tháng 12',
    ],
    en: [
      'January',
      'February',
      'March',
      'April',
      'May',
      'June',
      'July',
      'August',
      'September',
      'October',
      'November',
      'December',
    ],
  } as const;

  const monthName = monthNames[lang.code as 'vi' | 'en']?.[month - 1] ?? `${month}`;
  const headerText =
    lang.code === 'vi'
      ? `${monthName} ${lang.t('year')} ${year}`
      : `${monthName} ${year}`;

  const formatMoney = (amount: number) =>
    Math.round(amount)
      .toString()
      .replace(/\B(?=(\d{3})+(?!\d))/g, '.');

  const unpaid = unpaidLeaveDays ?? unpaidDays ?? 0;
  const salary = monthlySalary ?? netSalary ?? 0;

  const safe = (n?: number) => (typeof n === 'number' ? n : 0);

  const Row1 = [
    {label: lang.t('workingDays'), value: `${workingDays}`},
    {label: lang.t('unpaidLeaveDays'), value: `${unpaid}`},
    {label: lang.code === 'vi' ? 'Đi trễ (phút)' : 'Late (min)', value: `${safe(lateMinutes)}`},
    {label: lang.code === 'vi' ? 'Về sớm (phút)' : 'Early (min)', value: `${safe(earlyMinutes)}`},
  ];

  const Row2 = [
    {label: lang.code === 'vi' ? 'Phạt (phút)' : 'Penalty (min)', value: `${safe(penaltyMinutes)}`},
    {label: lang.code === 'vi' ? 'OT thường (phút)' : 'OT weekday (min)', value: `${safe(otWeekdayMinutes)}`},
    {label: lang.code === 'vi' ? 'OT cuối tuần (phút)' : 'OT weekend (min)', value: `${safe(otWeekendMinutes)}`},
    {label: lang.code === 'vi' ? 'OT lễ (phút)' : 'OT holiday (min)', value: `${safe(otHolidayMinutes)}`},
  ];

  return (
    <Pressable
      onPress={onPress}
      disabled={!onPress}
      style={({pressed}) => [
        styles.card,
        {
          backgroundColor: theme.colors.background,
          borderColor: theme.colors.borderLight,
          shadowColor: theme.colors.text,
          opacity: pressed ? 0.92 : 1,
        },
      ]}>
      {/* Header */}
      <Text style={[styles.header, {color: theme.colors.text}]} numberOfLines={2}>
        {headerText}
      </Text>

      {/* Data */}
      <View
        style={[
          styles.dataWrapper,
          {
            backgroundColor: theme.colors.lightGrayBackground,
            borderColor: theme.colors.borderLight,
          },
        ]}>
        <View style={styles.gridRow}>
          {Row1.map((it, idx) => (
            <DataItem key={`r1-${idx}`} label={it.label} value={it.value} theme={theme} />
          ))}
        </View>

        <View style={styles.divider} />

        <View style={styles.gridRow}>
          {Row2.map((it, idx) => (
            <DataItem key={`r2-${idx}`} label={it.label} value={it.value} theme={theme} />
          ))}
        </View>

        <View style={styles.divider} />

        {/* Salary */}
        <View style={styles.salaryRow}>
          <Text style={[styles.salaryLabel, {color: theme.colors.mutedText}]}>
            {lang.t('monthlySalary')}
          </Text>
          <Text style={[styles.salaryValue, {color: theme.colors.primary}]}>
            {formatMoney(salary)} đ
          </Text>
        </View>
      </View>
    </Pressable>
  );
};

const DataItem = ({
  label,
  value,
  theme,
}: {
  label: string;
  value: string;
  theme: any;
}) => (
  <View style={styles.item}>
    <Text style={[styles.label, {color: theme.colors.mutedText}]} numberOfLines={2}>
      {label}
    </Text>
    <Text style={[styles.value, {color: theme.colors.text}]} numberOfLines={1}>
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
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 10,
  },
  dataWrapper: {
    borderRadius: 10,
    borderWidth: 1,
    paddingVertical: 10,
    paddingHorizontal: 8,
    gap: 10,
  },

  gridRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 8,
  },
  item: {
    width: '23%', // 4 ô / hàng
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
    fontWeight: '700',
    textAlign: 'center',
  },

  divider: {
    height: 1,
    opacity: 0.35,
    backgroundColor: '#999',
  },

  salaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 4,
  },
  salaryLabel: {
    fontSize: 11,
    fontWeight: '600',
  },
  salaryValue: {
    fontSize: 13,
    fontWeight: '800',
  },
});

export default MonthTimesheet;
