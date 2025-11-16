import React, {useMemo, useState} from 'react';
import {View, Text, TouchableOpacity, StyleSheet, Platform} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';

type Props = {
  label: string;
  date?: Date | null;
  onChange: (d: Date) => void;
  theme: any;
  placeholder?: string;
};

const LabeledDate: React.FC<Props> = ({label, date, onChange, theme, placeholder}) => {
  const [show, setShow] = useState(false);
  const S = themedStyles(theme);

  const format = useMemo(() => {
    return (d: Date) =>
      `${String(d.getDate()).padStart(2, '0')}/${String(
        d.getMonth() + 1,
      ).padStart(2, '0')}/${d.getFullYear()}`;
  }, []);

  const displayValue = date ? format(date) : placeholder ?? 'Select date';

  return (
    <View style={S.field}>
      <Text style={S.label}>{label}</Text>
      <TouchableOpacity
        style={[S.inputBox, S.selectBox]}
        onPress={() => setShow(true)}
        activeOpacity={0.7}>
        <Text
          style={[
            S.input,
            {
              color: date ? theme.colors.text : theme.colors.mutedText ?? '#8E94A4',
            },
          ]}>
          {displayValue}
        </Text>
        <Text style={S.calendarIcon}>📅</Text>
      </TouchableOpacity>

      {show && (
        <DateTimePicker
          value={date ?? new Date()}
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          mode="date"
          onChange={(_, d) => {
            setShow(Platform.OS === 'ios');
            if (d) {onChange(d);}
          }}
        />
      )}
    </View>
  );
};

const themedStyles = (theme: any) =>
  StyleSheet.create({
    field: {flexGrow: 1, flexBasis: '48%', minWidth: '48%'},
    label: {fontSize: 13, color: theme.colors.text, marginBottom: 6},
    inputBox: {
      borderWidth: 2,
      borderColor: theme.colors.border,
      backgroundColor: theme.colors.background,
      borderRadius: 10,
      paddingHorizontal: 14,
      paddingVertical: 14,
      minHeight: 48,
      justifyContent: 'center',
    },
    input: {fontSize: 16, color: theme.colors.text},
    selectBox: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    calendarIcon: {fontSize: 16},
  });

export default React.memo(LabeledDate);
