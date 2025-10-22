import React from 'react';
import {View, Text, StyleSheet} from 'react-native';
import {useUIFactory} from '../../../ui/factory/useUIFactory';

interface MonthTimesheetProps {
  month: number; // 1-12
  year: number;
  workingDays: number;
  unpaidLeaveDays: number;
  monthlySalary: number;
}

const MonthTimesheet: React.FC<MonthTimesheetProps> = ({
  month,
  year,
  workingDays,
  unpaidLeaveDays,
  monthlySalary,
}) => {
  const {loading, theme, lang} = useUIFactory();

  if (loading || !theme || !lang) {
    return null;
  }

  // Format month name based on language
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
  };

  const monthName = monthNames[lang.code][month - 1];
  const headerText =
    lang.code === 'vi' ? `${monthName} ${lang.t('year')} ${year}` : `${monthName} ${year}`;

  // Format salary with thousands separator
  const formatSalary = (amount: number) => {
    return amount.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  };

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
      {/* Header */}
      <Text style={[styles.header, {color: theme.colors.text}]}>
        {headerText}
      </Text>

      {/* Content Section - Three columns wrapped in bordered container */}
      <View
        style={[
          styles.dataWrapper,
          {
            backgroundColor: theme.colors.lightGrayBackground,
            borderColor: theme.colors.borderLight,
          },
        ]}>
        <View style={styles.contentContainer}>
          {/* Working Days */}
          <View style={styles.dataColumn}>
            <Text style={[styles.label, {color: theme.colors.mutedText}]}>
              {lang.t('workingDays')}
            </Text>
            <Text style={[styles.value, {color: theme.colors.text}]}>
              {workingDays}
            </Text>
          </View>

          {/* Unpaid Leave Days */}
          <View style={styles.dataColumn}>
            <Text style={[styles.label, {color: theme.colors.mutedText}]}>
              {lang.t('unpaidLeaveDays')}
            </Text>
            <Text style={[styles.value, {color: theme.colors.text}]}>
              {unpaidLeaveDays}
            </Text>
          </View>

          {/* Monthly Salary */}
          <View style={styles.dataColumn}>
            <Text style={[styles.label, {color: theme.colors.mutedText}]}>
              {lang.t('monthlySalary')}
            </Text>
            <Text style={[styles.value, {color: theme.colors.text}]}>
              {formatSalary(monthlySalary)}đ
            </Text>
          </View>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 12,
    borderWidth: 1,
    padding: 12,
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  header: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 16,
  },
  dataWrapper: {
    borderRadius: 8,
    borderWidth: 1,
    padding: 12,
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
});

export default MonthTimesheet;
