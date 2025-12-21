import React, {useEffect, useState} from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  ActivityIndicator,
  Image,
  Modal,
} from 'react-native';
import LabeledDate from '../../common/LabeledDate';
import {useUIFactory} from '../../../ui/factory/useUIFactory';
import * as ImagePicker from 'react-native-image-picker';
import {uploadSingle} from '../../../api/uploadApi';

/* ===================== TYPES ===================== */
type LeaveType = 'annual' | 'sick' | 'unpaid';
type DayType = 'full' | 'half_morning' | 'half_afternoon';

type Props = {
  visible: boolean;
  allowHalfDay: boolean; // từ company config
  onClose: () => void;
  onAdd: (data: {
    type: LeaveType;
    startDate: Date;
    endDate: Date;
    dayType: DayType;
    reason: string;
    images: string[];
  }) => void;
};

/* ===================== TEXT ===================== */
const LEAVE_TYPE_TEXT: Record<LeaveType, string> = {
  annual: 'Phép năm',
  sick: 'Nghỉ ốm',
  unpaid: 'Nghỉ không lương',
};

const DAY_TYPE_TEXT: Record<DayType, string> = {
  full: 'Cả ngày',
  half_morning: 'Nửa ngày (sáng)',
  half_afternoon: 'Nửa ngày (chiều)',
};

/* ===================== COMPONENT ===================== */
const LeaveRequestAddModal: React.FC<Props> = ({
  visible,
  allowHalfDay,
  onClose,
  onAdd,
}) => {
  const {theme} = useUIFactory();

  /* ===== STATE ===== */
  const [type, setType] = useState<LeaveType>('annual');
  const [dayType, setDayType] = useState<DayType>('full');
  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(new Date());
  const [reason, setReason] = useState('');
  const [images, setImages] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);

  /* ===== AUTO FIX DAY TYPE ===== */
  useEffect(() => {
    if (!allowHalfDay && dayType !== 'full') {
      setDayType('full');
    }
  }, [allowHalfDay, dayType]);

  /* ===== PICK IMAGE ===== */
  const pickImages = () => {
    ImagePicker.launchImageLibrary(
      {mediaType: 'photo', selectionLimit: 5},
      async res => {
        if (res.didCancel || !res.assets) return;

        try {
          setUploading(true);
          for (const asset of res.assets) {
            if (!asset.uri) continue;
            const uploaded = await uploadSingle(
              asset.uri,
              'leave-evidence',
            );
            if (uploaded?.url) {
              setImages(prev => [...prev, uploaded.url]);
            }
          }
        } finally {
          setUploading(false);
        }
      },
    );
  };

  /* ===== SUBMIT ===== */
  const handleAdd = () => {
    if (!reason.trim()) {
      Alert.alert('Lỗi', 'Vui lòng nhập lý do nghỉ');
      return;
    }

    if (endDate < startDate) {
      Alert.alert('Lỗi', 'Ngày kết thúc phải sau ngày bắt đầu');
      return;
    }

    onAdd({
      type,
      startDate,
      endDate,
      dayType,
      reason,
      images,
    });

    // reset
    setType('annual');
    setDayType('full');
    setStartDate(new Date());
    setEndDate(new Date());
    setReason('');
    setImages([]);

    onClose();
  };

  /* ===== RENDER ===== */
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View
          style={[
            styles.card,
            {backgroundColor: theme?.colors.background ?? '#fff'},
          ]}>
          <Text
            style={[
              styles.title,
              {color: theme?.colors.text ?? '#000'},
            ]}>
            Tạo đơn xin nghỉ phép
          </Text>

          <ScrollView contentContainerStyle={styles.content}>
            {/* ===== LOẠI NGHỈ ===== */}
            <Text style={[styles.label, {color: theme?.colors.text}]}>
              Loại nghỉ
            </Text>
            <View style={styles.row}>
              {(Object.keys(LEAVE_TYPE_TEXT) as LeaveType[]).map(t => (
                <TouchableOpacity
                  key={t}
                  onPress={() => setType(t)}
                  style={[
                    styles.chip,
                    {
                      backgroundColor:
                        type === t
                          ? theme?.colors.primary
                          : theme?.colors.borderLight,
                    },
                  ]}>
                  <Text
                    style={{
                      color:
                        type === t ? '#fff' : theme?.colors.text,
                    }}>
                    {LEAVE_TYPE_TEXT[t]}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* ===== HÌNH THỨC NGHỈ ===== */}
            <Text style={[styles.label, {color: theme?.colors.text}]}>
              Hình thức nghỉ
            </Text>
            <View style={styles.row}>
              <TouchableOpacity
                onPress={() => setDayType('full')}
                style={[
                  styles.chip,
                  {
                    backgroundColor:
                      dayType === 'full'
                        ? theme?.colors.primary
                        : theme?.colors.borderLight,
                  },
                ]}>
                <Text
                  style={{
                    color:
                      dayType === 'full'
                        ? '#fff'
                        : theme?.colors.text,
                  }}>
                  Cả ngày
                </Text>
              </TouchableOpacity>

              {allowHalfDay &&
                (['half_morning', 'half_afternoon'] as DayType[]).map(
                  d => (
                    <TouchableOpacity
                      key={d}
                      onPress={() => setDayType(d)}
                      style={[
                        styles.chip,
                        {
                          backgroundColor:
                            dayType === d
                              ? theme?.colors.primary
                              : theme?.colors.borderLight,
                        },
                      ]}>
                      <Text
                        style={{
                          color:
                            dayType === d
                              ? '#fff'
                              : theme?.colors.text,
                        }}>
                        {DAY_TYPE_TEXT[d]}
                      </Text>
                    </TouchableOpacity>
                  ),
                )}
            </View>

            {/* ===== NGÀY ===== */}
            <LabeledDate
              label="Ngày bắt đầu"
              date={startDate}
              onChange={setStartDate}
              theme={theme}
            />
            <LabeledDate
              label="Ngày kết thúc"
              date={endDate}
              onChange={setEndDate}
              theme={theme}
            />

            {/* ===== LÝ DO ===== */}
            <Text style={[styles.label, {color: theme?.colors.text}]}>
              Lý do nghỉ
            </Text>
            <View
              style={[
                styles.textAreaBox,
                {borderColor: theme?.colors.border},
              ]}>
              <TextInput
                value={reason}
                onChangeText={setReason}
                placeholder="Nhập lý do xin nghỉ"
                placeholderTextColor={theme?.colors.placeholder}
                style={[styles.textArea, {color: theme?.colors.text}]}
                multiline
              />
            </View>

            {/* ===== ẢNH ===== */}
            <Text style={[styles.label, {color: theme?.colors.text}]}>
              Ảnh minh chứng
            </Text>
            <View style={styles.imageRow}>
              {images.map((url, i) => (
                <Image key={i} source={{uri: url}} style={styles.image} />
              ))}
              <TouchableOpacity
                style={styles.addImage}
                onPress={pickImages}
                disabled={uploading}>
                {uploading ? (
                  <ActivityIndicator />
                ) : (
                  <Text style={{fontSize: 26}}>＋</Text>
                )}
              </TouchableOpacity>
            </View>
          </ScrollView>

          {/* ===== ACTION ===== */}
          <View style={styles.buttonRow}>
            <TouchableOpacity
              style={[styles.button, styles.cancel]}
              onPress={onClose}>
              <Text style={{color: theme?.colors.text}}>Hủy</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.button,
                {backgroundColor: theme?.colors.primary},
              ]}
              onPress={handleAdd}>
              <Text style={{color: '#fff', fontWeight: '600'}}>
                Gửi đơn
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

/* ===================== STYLES ===================== */
const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
  },
  card: {
    width: '100%',
    maxHeight: '90%',
    borderRadius: 20,
    padding: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 12,
  },
  content: {
    gap: 14,
  },
  row: {
    flexDirection: 'row',
    gap: 8,
    flexWrap: 'wrap',
  },
  chip: {
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 20,
  },
  label: {
    fontSize: 13,
    marginBottom: 4,
  },
  textAreaBox: {
    borderWidth: 2,
    borderRadius: 14,
    padding: 12,
    minHeight: 90,
  },
  textArea: {
    fontSize: 16,
  },
  imageRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  image: {
    width: 70,
    height: 70,
    borderRadius: 10,
  },
  addImage: {
    width: 70,
    height: 70,
    borderRadius: 10,
    borderWidth: 2,
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 12,
  },
  button: {
    flex: 1,
    height: 46,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancel: {
    borderWidth: 2,
  },
});

export default LeaveRequestAddModal;
