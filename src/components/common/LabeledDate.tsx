import React, {useMemo, useState} from 'react';
import {View, Text, TouchableOpacity, StyleSheet} from 'react-native';
import DatePicker from 'react-native-date-picker';

type Props = {
  label: string;
  date?: Date | null;
  onChange: (d: Date) => void;
  theme: any;
  placeholder?: string;
  editable?: boolean; // ⭐ Thêm editable giống các component khác
};

const LabeledDate: React.FC<Props> = ({
  label,
  date,
  onChange,
  theme,
  placeholder = 'Chọn ngày',
  editable = true, // default: cho phép chọn
}) => {
  const [open, setOpen] = useState(false);
  const S = themedStyles(theme);

  const format = useMemo(() => {
    return (d: Date) =>
      `${String(d.getDate()).padStart(2, '0')}/${String(
        d.getMonth() + 1,
      ).padStart(2, '0')}/${d.getFullYear()}`;
  }, []);

  // ===== DISPLAY VALUE =====
  const displayValue = date ? format(date) : placeholder;

  return (
    <View style={S.field}>
      <Text style={S.label}>{label}</Text>

      <TouchableOpacity
        style={[
          S.inputBox,
          S.selectBox,
          !editable && S.disabledBox,
        ]}
        onPress={() => editable && setOpen(true)} // ❗ chỉ mở nếu editable
        activeOpacity={editable ? 0.7 : 1}>
        <Text
          style={[
            S.input,
            {
              color: date
                ? theme.colors.text
                : theme.colors.mutedText ?? '#8E94A4',
            },
          ]}>
          {displayValue}
        </Text>

        <Text
          style={[
            S.calendarIcon,
            !editable && {opacity: 0.4},
          ]}>
          📅
        </Text>
      </TouchableOpacity>

      <DatePicker
        modal
        mode="date"
        open={open}
        date={date ?? new Date()}
        onConfirm={d => {
          setOpen(false);
          onChange(d);
        }}
        onCancel={() => setOpen(false)}
      />
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
      minHeight: 48,
      justifyContent: 'center',
    },
    disabledBox: {
      backgroundColor: '#E5E7EB',
      borderColor: '#D1D5DB',
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
