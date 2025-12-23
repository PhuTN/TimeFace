import React, {useEffect, useState} from 'react';
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
  ActivityIndicator,
} from 'react-native';
import RNFS from 'react-native-fs';
import * as ImagePicker from 'react-native-image-picker';

import {useUIFactory} from '../../../ui/factory/useUIFactory';
import {uploadSingle} from '../../../api/uploadApi';
import Toast from 'react-native-toast-message';

type Props = {
  visible: boolean;
  type: 'check_in' | 'check_out';
  onClose: () => void;
  onSubmit: (data: {
    date: Date;
    type: 'check_in' | 'check_out';
    actual_time: string;
    reason: string;
    evidence_images: string[];
  }) => void;
};

const CheckinComplaintAddModal: React.FC<Props> = ({
  visible,
  type,
  onClose,
  onSubmit,
}) => {
  const {theme} = useUIFactory();

  // ⭐ thời điểm mở modal = ngày + giờ thực tế
  const [createdAt, setCreatedAt] = useState(new Date());

  const [reason, setReason] = useState('');
  const [images, setImages] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);

  const [previewVisible, setPreviewVisible] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  useEffect(() => {
    if (visible) {
      setCreatedAt(new Date()); // reset lại khi mở modal
    }
  }, [visible]);

  if (!theme) return null;

  const formatTime = (d: Date) =>
    `${String(d.getHours()).padStart(2, '0')}:${String(
      d.getMinutes(),
    ).padStart(2, '0')}`;

  const formatDate = (d: Date) =>
    `${String(d.getDate()).padStart(2, '0')}/${String(
      d.getMonth() + 1,
    ).padStart(2, '0')}/${d.getFullYear()}`;

  /* ================= PICK + UPLOAD ================= */
  const pickImages = () => {
    ImagePicker.launchImageLibrary(
      {mediaType: 'photo', selectionLimit: 5},
      async res => {
        if (res.didCancel || !res.assets) return;

        try {
          setUploading(true);
          for (const asset of res.assets) {
            if (!asset.uri) continue;
            const result = await uploadSingle(asset.uri, 'checkin-complaint');
            if (result?.url) {
              setImages(prev => [...prev, result.url]);
            }
          }
        } catch {
          Toast.show({
            type: 'error',
            text1: 'Upload ảnh thất bại',
          });
        } finally {
          setUploading(false);
        }
      },
    );
  };

  /* ================= SUBMIT ================= */
  const handleSubmit = () => {
    if (!reason.trim()) {
      Toast.show({
        type: 'error',
        text1: 'Thiếu lý do',
        text2: 'Vui lòng nhập lý do khiếu nại',
      });
      return;
    }

    onSubmit({
      date: createdAt,
      type,
      actual_time: formatTime(createdAt),
      reason,
      evidence_images: images,
    });

    // reset
    setReason('');
    setImages([]);
    onClose();
  };

  /* ================= DOWNLOAD ================= */
  const handleDownload = async () => {
    if (!previewImage) return;

    try {
      const fileName = `complaint_${Date.now()}.jpg`;
      const path =
        Platform.OS === 'android'
          ? `${RNFS.DownloadDirectoryPath}/${fileName}`
          : `${RNFS.DocumentDirectoryPath}/${fileName}`;

      const res = await RNFS.downloadFile({
        fromUrl: previewImage,
        toFile: path,
      }).promise;

      if (res.statusCode === 200) {
        Toast.show({type: 'success', text1: 'Đã lưu ảnh'});
      }
    } catch {
      Toast.show({type: 'error', text1: 'Không thể tải ảnh'});
    }
  };

  return (
    <>
      {/* ===== CENTER MODAL ===== */}
      <Modal visible={visible} transparent animationType="fade">
        <View style={styles.overlay}>
          <View
            style={[
              styles.modal,
              {backgroundColor: theme.colors.background},
            ]}>
            <Text style={styles.title}>
              {type === 'check_in'
                ? 'Khiếu nại check-in'
                : 'Khiếu nại check-out'}
            </Text>

            <ScrollView contentContainerStyle={styles.content}>
              {/* DATE + TIME (READ ONLY) */}
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Ngày chấm công</Text>
                <Text style={styles.infoValue}>{formatDate(createdAt)}</Text>
              </View>

              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Giờ thực tế</Text>
                <Text style={styles.infoValue}>{formatTime(createdAt)}</Text>
              </View>

              {/* REASON */}
              <Text style={styles.label}>Lý do khiếu nại</Text>
              <TextInput
                multiline
                value={reason}
                onChangeText={setReason}
                style={styles.textArea}
                placeholder="Nhập lý do khiếu nại"
              />

              {/* IMAGES */}
              <Text style={styles.label}>Ảnh minh chứng</Text>
              <View style={styles.imageGrid}>
                {images.map((url, index) => (
                  <TouchableOpacity
                    key={index}
                    onPress={() => {
                      setPreviewImage(url);
                      setPreviewVisible(true);
                    }}>
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
            </ScrollView>

            {/* ACTIONS */}
            <View style={styles.footer}>
              <TouchableOpacity style={styles.btnCancel} onPress={onClose}>
                <Text>Hủy</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.btnSubmit,
                  {backgroundColor: theme.colors.primary},
                ]}
                onPress={handleSubmit}>
                <Text style={{color: '#fff', fontWeight: '600'}}>
                  Gửi khiếu nại
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* IMAGE PREVIEW */}
      <Modal visible={previewVisible} transparent>
        <View style={styles.preview}>
          <Image
            source={{uri: previewImage || ''}}
            style={styles.previewImg}
            resizeMode="contain"
          />
          <View style={{flexDirection: 'row', gap: 16, marginTop: 20}}>
            <TouchableOpacity onPress={handleDownload}>
              <Text style={{color: '#fff'}}>⬇️ Tải ảnh</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setPreviewVisible(false)}>
              <Text style={{color: '#fff'}}>✕ Đóng</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </>
  );
};

/* ===================== STYLES ===================== */
const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modal: {
    width: '90%',
    borderRadius: 16,
    paddingBottom: 16,
    maxHeight: '85%',
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    textAlign: 'center',
    padding: 16,
  },
  content: {
    paddingHorizontal: 20,
    gap: 16,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  infoLabel: {
    fontSize: 13,
    color: '#6B7280',
  },
  infoValue: {
    fontSize: 14,
    fontWeight: '600',
  },
  label: {
    fontSize: 13,
    marginBottom: 6,
  },
  textArea: {
    borderWidth: 1.5,
    borderRadius: 12,
    padding: 12,
    minHeight: 90,
    textAlignVertical: 'top',
  },
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
  footer: {
    flexDirection: 'row',
    gap: 12,
    paddingHorizontal: 20,
    marginTop: 12,
  },
  btnCancel: {
    flex: 1,
    height: 46,
    borderRadius: 12,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnSubmit: {
    flex: 1,
    height: 46,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  preview: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.95)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  previewImg: {
    width: '100%',
    height: '80%',
  },
});

export default CheckinComplaintAddModal;