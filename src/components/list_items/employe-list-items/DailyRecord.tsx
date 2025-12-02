import React from 'react';
import {View, Text, StyleSheet} from 'react-native';
import {useUIFactory} from '../../../ui/factory/useUIFactory';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

interface DailyRecordProps {
  date: Date | string; // Date object or date string
  totalHours: string; // e.g., "08:00"
  checkIn: string; // e.g., "09:00 AM"
  checkOut: string; // e.g., "5:00 PM"
}

const DailyRecord: React.FC<DailyRecordProps> = ({
  date,
  totalHours,
  checkIn,
  checkOut,
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
  const checkInOutValue = `${checkIn} - ${checkOut}`;

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
      {/* Header with Calendar Icon and Date */}
      <View style={styles.header}>
        <MaterialCommunityIcons name="calendar" size={24} color="#8B5CF6" />
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
          {/* Total Hours */}
          <View style={styles.dataColumn}>
            <Text style={[styles.label, {color: theme.colors.mutedText}]}>
              {lang.t('totalHours')}
            </Text>
            <Text style={[styles.value, {color: theme.colors.text}]}>
              {totalHours} {lang.t('hours')}
            </Text>
          </View>

          {/* Check-in and Check-out */}
          <View style={styles.dataColumn}>
            <Text style={[styles.label, {color: theme.colors.mutedText}]}>
              {lang.t('checkInOut')}
            </Text>
            <Text style={[styles.value, {color: theme.colors.text}]}>
              {checkInOutValue}
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

export default DailyRecord;
