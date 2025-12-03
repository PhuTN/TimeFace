// src/screens/.../OTRecordAddModal.tsx
import React, {useState} from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Platform,
  ScrollView,
} from 'react-native';

import DatePicker from 'react-native-date-picker';   // ⭐ NEW
import BottomSheetModal from '../../common/BottomSheetModal';
import LabeledDate from '../../common/LabeledDate';
import LabeledTextInput from '../../common/LabeledTextInput';
import {useUIFactory} from '../../../ui/factory/useUIFactory';

type Props = {
  visible: boolean;
  onClose: () => void;
  onAdd: (data: {
    date: Date;
    startTime: Date;
    hours: string;
    reason: string;
  }) => void;
};

const OTRecordAddModal: React.FC<Props> = ({visible, onClose, onAdd}) => {
  const {theme, lang} = useUIFactory();
  const [date, setDate] = useState(new Date());
  const [startTime, setStartTime] = useState(new Date());
  const [hours, setHours] = useState('');
  const [reason, setReason] = useState('');

  // mở/đóng time picker
  const [openTimePicker, setOpenTimePicker] = useState(false);

  if (!theme || !lang) return null;

  const handleAdd = () => {
    onAdd({date, startTime, hours, reason});

    // Reset
    setDate(new Date());
    setStartTime(new Date());
    setHours('');
    setReason('');
    onClose();
  };

  const formatTime = (time: Date) => {
    const h = String(time.getHours()).padStart(2, '0');
    const m = String(time.getMinutes()).padStart(2, '0');
    return `${h}:${m}`;
  };

  return (
    <BottomSheetModal
      visible={visible}
      onClose={onClose}
      maxHeightRatio={0.85}
      backdropOpacity={0.4}>
      <View
        style={[
          styles.container,
          {
            backgroundColor: theme.colors.background,
            borderTopColor: theme.colors.contrastBackground,
            borderTopWidth: 1,
            borderLeftColor: theme.colors.contrastBackground,
            borderLeftWidth: 1,
            borderRightColor: theme.colors.contrastBackground,
            borderRightWidth: 1,
          },
        ]}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={[styles.title, {color: theme.colors.text}]}>
            {lang.t('createOvertimeRequest')}
          </Text>
        </View>

        {/* Content */}
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}>
          {/* Date Picker */}
          <LabeledDate
            label={lang.t('otDate')}
            date={date}
            onChange={setDate}
            theme={theme}
          />

          {/* Time Picker */}
          <View style={styles.field}>
            <Text style={[styles.label, {color: theme.colors.text}]}>
              {lang.t('startAt')}
            </Text>

            <TouchableOpacity
              style={[
                styles.inputBox,
                {
                  borderColor: theme.colors.border,
                  backgroundColor: theme.colors.background,
                },
              ]}
              onPress={() => setOpenTimePicker(true)}
              activeOpacity={0.7}>
              <Text style={[styles.input, {color: theme.colors.text}]}>
                {formatTime(startTime)}
              </Text>
              <Text style={styles.clockIcon}>🕐</Text>
            </TouchableOpacity>

            {/* Modal Time Picker */}
            <DatePicker
              modal
              open={openTimePicker}
              date={startTime}
              mode="time"
              onConfirm={time => {
                setOpenTimePicker(false);
                setStartTime(time);
              }}
              onCancel={() => setOpenTimePicker(false)}
            />
          </View>

          {/* Hours Input */}
          <LabeledTextInput
            label={lang.t('otHours')}
            value={hours}
            onChangeText={setHours}
            placeholder="8"
            theme={theme}
          />

          {/* Reason */}
          <View style={styles.field}>
            <Text style={[styles.label, {color: theme.colors.text}]}>
              {lang.t('otReason')}
            </Text>

            <View
              style={[
                styles.textAreaBox,
                {
                  borderColor: theme.colors.border,
                  backgroundColor: theme.colors.background,
                },
              ]}>
              <TextInput
                value={reason}
                onChangeText={setReason}
                placeholder={lang.t('otReasonPlaceholder')}
                placeholderTextColor={theme.colors.placeholder}
                style={[styles.textArea, {color: theme.colors.text}]}
                multiline
                numberOfLines={4}
                textAlignVertical="top"
              />
            </View>
          </View>
        </ScrollView>

        {/* Footer Buttons */}
        <View style={styles.buttonRow}>
          <TouchableOpacity
            style={[
              styles.button,
              styles.cancelButton,
              {borderColor: theme.colors.border},
            ]}
            onPress={onClose}>
            <Text style={[styles.buttonText, {color: theme.colors.text}]}>
              {lang.t('exit')}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.button,
              styles.addButton,
              {backgroundColor: theme.colors.primary},
            ]}
            onPress={handleAdd}>
            <Text style={[styles.buttonText, styles.addButtonText]}>
              {lang.t('add')}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </BottomSheetModal>
  );
};

const styles = StyleSheet.create({
  container: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingBottom: Platform.select({ios: 24, android: 16}),
  },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    textAlign: 'center',
  },
  scrollView: {maxHeight: 450},
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 12,
    gap: 16,
  },
  field: {width: '100%'},
  label: {fontSize: 13, marginBottom: 6},
  inputBox: {
    borderWidth: 2,
    borderRadius: 14,
    paddingHorizontal: 14,
    minHeight: 48,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  input: {fontSize: 16},
  clockIcon: {fontSize: 16},
  textAreaBox: {
    borderWidth: 2,
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 12,
    minHeight: 100,
  },
  textArea: {fontSize: 16, minHeight: 76},
  buttonRow: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingTop: 16,
    gap: 12,
  },
  button: {
    flex: 1,
    height: 48,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelButton: {borderWidth: 2},
  addButton: {},
  buttonText: {fontSize: 16, fontWeight: '600'},
  addButtonText: {color: '#FFFFFF'},
});

export default OTRecordAddModal;
