import React, {useState} from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Platform,
  ScrollView,
  Alert,
} from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import BottomSheetModal from '../../common/BottomSheetModal';
import LabeledDate from '../../common/LabeledDate';
import {useUIFactory} from '../../../ui/factory/useUIFactory';

type Props = {
  visible: boolean;
  onClose: () => void;
  onAdd: (data: {
    startDate: Date;
    endDate: Date;
    reason: string;
    attachedFile?: string;
  }) => void;
};

const LeaveRequestAddModal: React.FC<Props> = ({visible, onClose, onAdd}) => {
  const {theme, lang} = useUIFactory();
  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(new Date());
  const [reason, setReason] = useState('');
  const [attachedFile, setAttachedFile] = useState<string | undefined>(undefined);

  if (!theme || !lang) return null;

  const handleAdd = () => {
    // Validate dates
    if (endDate < startDate) {
      Alert.alert('Error', 'End date must be after start date');
      return;
    }

    onAdd({startDate, endDate, reason, attachedFile});
    // Reset form
    setStartDate(new Date());
    setEndDate(new Date());
    setReason('');
    setAttachedFile(undefined);
    onClose();
  };

  const handleAttachFile = () => {
    // TODO: Implement file picker
    // For now, just simulate file attachment
    Alert.alert(
      lang.t('attachFile'),
      'File picker will be implemented here',
      [
        {text: 'Cancel', style: 'cancel'},
        {
          text: 'OK',
          onPress: () => setAttachedFile('document.pdf'),
        },
      ],
    );
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
            {lang.t('createLeaveRequest')}
          </Text>
        </View>

        {/* Content */}
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}>
          {/* Start Date Picker */}
          <LabeledDate
            label={lang.t('startDate')}
            date={startDate}
            onChange={setStartDate}
            theme={theme}
          />

          {/* End Date Picker */}
          <LabeledDate
            label={lang.t('endDate')}
            date={endDate}
            onChange={setEndDate}
            theme={theme}
          />

          {/* Reason Text Area */}
          <View style={styles.field}>
            <Text style={[styles.label, {color: theme.colors.text}]}>
              {lang.t('leaveReasonLabel')}
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
                placeholder={lang.t('leaveReasonPlaceholder')}
                placeholderTextColor={theme.colors.placeholder}
                style={[styles.textArea, {color: theme.colors.text}]}
                multiline
                numberOfLines={4}
                textAlignVertical="top"
              />
            </View>
          </View>

          {/* Attach File Button */}
          <View style={styles.field}>
              <TouchableOpacity
                style={[
                  styles.attachButton,
                  {backgroundColor: theme.colors.borderLight},
                ]}
                onPress={handleAttachFile}
                activeOpacity={0.7}>
                <MaterialCommunityIcons
                  name="paperclip"
                  size={18}
                  color={theme.colors.text}
                />
                <Text style={[styles.attachButtonText, { color: theme.colors.text }]}>
                  {lang.t('attachFile')}
                </Text>
              </TouchableOpacity>
            {attachedFile && (
              <View style={styles.fileInfoRow}>
                <MaterialCommunityIcons
                  name="file-document-outline"
                  size={16}
                  color={theme.colors.primary}
                />
                <Text
                  style={[
                    styles.fileInfoText,
                    {color: theme.colors.text},
                  ]}>
                  {attachedFile}
                </Text>
              </View>
            )}
          </View>
        </ScrollView>

        {/* Action Buttons */}
        <View style={styles.buttonRow}>
          <TouchableOpacity
            style={[
              styles.button,
              styles.cancelButton,
              {borderColor: theme.colors.border},
            ]}
            onPress={onClose}
            activeOpacity={0.7}>
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
            onPress={handleAdd}
            activeOpacity={0.7}>
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
  scrollView: {
    maxHeight: 450,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 12,
    gap: 16,
  },
  field: {
    width: '100%',
  },
  label: {
    fontSize: 13,
    marginBottom: 6,
  },
  textAreaBox: {
    borderWidth: 2,
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 12,
    minHeight: 100,
  },
  textArea: {
    fontSize: 16,
    minHeight: 76,
  },
  attachButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    width: 140,
    alignSelf: "flex-end",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
  },
  attachButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  fileInfoRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 8,
    marginTop: 8,
    paddingHorizontal: 4,
  },
  fileInfoText: {
    fontSize: 13,
    flex: 1,
  },
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
  cancelButton: {
    borderWidth: 2,
  },
  addButton: {
    // backgroundColor set via theme.colors.primary
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  addButtonText: {
    color: '#FFFFFF',
  },
});

export default LeaveRequestAddModal;
