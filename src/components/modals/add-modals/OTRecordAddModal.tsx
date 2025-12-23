import React, {useState} from 'react';
import RNFS from 'react-native-fs';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Platform,
  ScrollView,
  Image,
  Modal,
  Linking,
  ActivityIndicator,
  PermissionsAndroid,
} from 'react-native';

import DatePicker from 'react-native-date-picker';
import * as ImagePicker from 'react-native-image-picker';

import BottomSheetModal from '../../common/BottomSheetModal';
import LabeledDate from '../../common/LabeledDate';
import LabeledTextInput from '../../common/LabeledTextInput';
import {useUIFactory} from '../../../ui/factory/useUIFactory';
import {uploadSingle} from '../../../api/uploadApi';
import Toast from 'react-native-toast-message';

type Props = {
  visible: boolean;
  onClose: () => void;
  onAdd: (data: {
    date: Date;
    startTime: Date;
    hours: string;
    reason: string;
    images: string[]; // ✅ URL từ BE
  }) => void;
};

const OTRecordAddModal: React.FC<Props> = ({visible, onClose, onAdd}) => {
  const {theme, lang} = useUIFactory();

  const [date, setDate] = useState(new Date());
  const [startTime, setStartTime] = useState(new Date());
  const [hours, setHours] = useState('');
  const [reason, setReason] = useState('');

  const [openTimePicker, setOpenTimePicker] = useState(false);

  // images = URL từ BE
  const [images, setImages] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);

  // preview
  const [previewVisible, setPreviewVisible] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);

   if (!theme || !lang) {
    return (
      <BottomSheetModal visible={visible} onClose={onClose}>
        <View />
      </BottomSheetModal>
    );
  }


  const formatTime = (time: Date) => {
    const h = String(time.getHours()).padStart(2, '0');
    const m = String(time.getMinutes()).padStart(2, '0');
    return `${h}:${m}`;
  };

  // ⭐ PICK + UPLOAD NGAY
  const pickImages = () => {
    ImagePicker.launchImageLibrary(
      {
        mediaType: 'photo',
        selectionLimit: 5,
      },
      async res => {
        if (res.didCancel || !res.assets) return;

        try {
          setUploading(true);

          for (const asset of res.assets) {
            if (!asset.uri) continue;

            const result = await uploadSingle(asset.uri, 'ot-evidence');
            if (result?.url) {
              setImages(prev => [...prev, result.url]);
            }
          }
        } catch (e) {
          console.log('[UPLOAD IMAGE ERROR]', e);
        } finally {
          setUploading(false);
        }
      },
    );
  };

  const handleAdd = () => {
    onAdd({
      date,
      startTime,
      hours,
      reason,
      images, // ✅ URL đã upload
    });

    setDate(new Date());
    setStartTime(new Date());
    setHours('');
    setReason('');
    setImages([]);
    onClose();
  };

  const openPreview = (url: string) => {
    setPreviewImage(url);
    setPreviewVisible(true);
  };

  const handleDownload = async () => {
    console.log('[DOWNLOAD] start');

    if (!previewImage) {
      console.log('[DOWNLOAD] previewImage empty');
      return;
    }

    try {
      const fileName = `ot_image_${Date.now()}.jpg`;

      const savePath =
        Platform.OS === 'android'
          ? `${RNFS.DownloadDirectoryPath}/${fileName}`
          : `${RNFS.DocumentDirectoryPath}/${fileName}`;

      console.log('[DOWNLOAD] savePath:', savePath);

      const result = await RNFS.downloadFile({
        fromUrl: previewImage,
        toFile: savePath,
      }).promise;

      console.log('[DOWNLOAD] result:', result);

      if (result.statusCode === 200) {
        Toast.show({
          type: 'success',
          text1: 'Thành công',
          text2: 'Ảnh đã được lưu vào Download',
        });
      } else {
        throw new Error(`statusCode=${result.statusCode}`);
      }
    } catch (err) {
      console.log('[DOWNLOAD ERROR]', err);
      Toast.show({
        type: 'error',
        text1: 'Lỗi',
        text2: 'Không thể tải ảnh',
      });
    } finally {
      console.log('[DOWNLOAD] end');
    }
  };

  return (
    <>
      <BottomSheetModal
        visible={visible}
        onClose={onClose}
        maxHeightRatio={0.85}
        backdropOpacity={0.4}>
        <View
          style={[
            styles.container,
            {backgroundColor: theme.colors.background},
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
            <LabeledDate
              label={lang.t('otDate')}
              date={date}
              onChange={setDate}
              theme={theme}
            />

            {/* Time */}
            <View style={styles.field}>
              <Text style={[styles.label, {color: theme.colors.text}]}>
                {lang.t('startAt')}
              </Text>

              <TouchableOpacity
                style={[styles.inputBox, {borderColor: theme.colors.border}]}
                onPress={() => setOpenTimePicker(true)}>
                <Text style={[styles.input, {color: theme.colors.text}]}>
                  {formatTime(startTime)}
                </Text>
                <Text>🕐</Text>
              </TouchableOpacity>

              <DatePicker
                modal
                open={openTimePicker}
                date={startTime}
                mode="time"
                onConfirm={t => {
                  setOpenTimePicker(false);
                  setStartTime(t);
                }}
                onCancel={() => setOpenTimePicker(false)}
              />
            </View>

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
                  {borderColor: theme.colors.border},
                ]}>
                <TextInput
                  value={reason}
                  onChangeText={setReason}
                  placeholder={lang.t('otReasonPlaceholder')}
                  placeholderTextColor={theme.colors.placeholder}
                  style={[styles.textArea, {color: theme.colors.text}]}
                  multiline
                />
              </View>
            </View>

            {/* Images */}
            <View style={styles.field}>
              <Text style={[styles.label, {color: theme.colors.text}]}>
                Ảnh minh chứng
              </Text>

              <View style={styles.imageGrid}>
                {images.map((url, index) => (
                  <TouchableOpacity
                    key={index}
                    onPress={() => openPreview(url)}>
                    <Image source={{uri: url}} style={styles.image} />
                  </TouchableOpacity>
                ))}

                <TouchableOpacity
                  style={styles.addImage}
                  onPress={pickImages}
                  disabled={uploading}>
                  {uploading ? (
                    <ActivityIndicator />
                  ) : (
                    <Text style={{fontSize: 24}}>＋</Text>
                  )}
                </TouchableOpacity>
              </View>
            </View>
          </ScrollView>

          {/* Footer */}
          <View style={styles.buttonRow}>
            <TouchableOpacity
              style={[styles.button, styles.cancelButton]}
              onPress={onClose}>
              <Text style={{color: theme.colors.text}}>{lang.t('exit')}</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.button, {backgroundColor: theme.colors.primary}]}
              onPress={handleAdd}>
              <Text style={{color: '#fff', fontWeight: '600'}}>
                {lang.t('add')}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </BottomSheetModal>

      {/* IMAGE PREVIEW */}
      <Modal visible={previewVisible} transparent animationType="fade">
        <View style={styles.previewContainer}>
          <Image
            source={{uri: previewImage || ''}}
            style={styles.previewImage}
            resizeMode="contain"
          />

          <View style={styles.previewActions}>
            <TouchableOpacity
              style={styles.previewButton}
              onPress={handleDownload}>
              <Text style={{color: '#fff'}}>⬇️ Download</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.previewButton}
              onPress={() => setPreviewVisible(false)}>
              <Text style={{color: '#fff'}}>✕ Đóng</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingBottom: Platform.select({ios: 24, android: 16}),
  },
  header: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  title: {fontSize: 18, fontWeight: '700', textAlign: 'center'},
  scrollView: {maxHeight: 450},
  scrollContent: {padding: 20, gap: 16},
  field: {width: '100%'},
  label: {fontSize: 13, marginBottom: 6},
  inputBox: {
    borderWidth: 2,
    borderRadius: 14,
    paddingHorizontal: 14,
    height: 48,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  input: {fontSize: 16},
  textAreaBox: {
    borderWidth: 2,
    borderRadius: 14,
    padding: 12,
    minHeight: 100,
  },
  textArea: {fontSize: 16},
  imageGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  image: {
    width: 80,
    height: 80,
    borderRadius: 12,
  },
  addImage: {
    width: 80,
    height: 80,
    borderRadius: 12,
    borderWidth: 2,
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 12,
    paddingHorizontal: 20,
  },
  button: {
    flex: 1,
    height: 48,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelButton: {borderWidth: 2},
  previewContainer: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.95)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  previewImage: {
    width: '100%',
    height: '80%',
  },
  previewActions: {
    flexDirection: 'row',
    gap: 16,
    marginTop: 20,
  },
  previewButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    backgroundColor: 'rgba(0,0,0,0.6)',
    borderRadius: 20,
  },
});

export default OTRecordAddModal;
