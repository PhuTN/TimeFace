import React, {useState} from 'react';
import {
  View,
  Text,
  Image,
  ScrollView,
  TouchableOpacity,
  Modal,
  Platform,
} from 'react-native';
import RNFS from 'react-native-fs';
import Toast from 'react-native-toast-message';

import type {Theme} from '../../../ui/theme/theme';
import type {LanguageResolved} from '../../../ui/factory/abstract';
import CenterModal from '../../common/CenterModal';
import Chip from '../../common/Chip';

type ComplaintStatus = 'approved' | 'rejected' | 'pending';

export interface CheckinComplaintDetail {
  avatarSource: any;
  name: string;
  position: string;
  department: string;

  type: 'check_in' | 'check_out';
  date: string;
  actual_time: string;
  reason: string;

  status: ComplaintStatus;
  createdAt: string;

  images?: string[];

  approver?: {
    name: string;
    date: string;
  };

  admin_note?: string;
}

interface Props {
  visible: boolean;
  onClose: () => void;
  request: CheckinComplaintDetail | null;
  theme: Theme;
  lang: LanguageResolved;
}

const CheckinComplaintDetailModal: React.FC<Props> = ({
  visible,
  onClose,
  request,
  theme,
  lang,
}) => {
  if (!request) return null;

  const safeImages = Array.isArray(request.images)
    ? request.images.filter(Boolean)
    : [];

  const [previewVisible, setPreviewVisible] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  const openPreview = (url: string) => {
    setPreviewImage(url);
    setPreviewVisible(true);
  };

  const handleDownload = async () => {
    if (!previewImage) return;

    try {
      const fileName = `complaint_${Date.now()}.jpg`;
      const savePath =
        Platform.OS === 'android'
          ? `${RNFS.DownloadDirectoryPath}/${fileName}`
          : `${RNFS.DocumentDirectoryPath}/${fileName}`;

      const result = await RNFS.downloadFile({
        fromUrl: previewImage,
        toFile: savePath,
      }).promise;

      if (result.statusCode === 200) {
        Toast.show({
          type: 'success',
          text1: 'Đã lưu ảnh',
        });
      }
    } catch {
      Toast.show({
        type: 'error',
        text1: 'Không thể tải ảnh',
      });
    }
  };

  return (
    <>
      {/* ================= MAIN MODAL ================= */}
      <CenterModal
        visible={visible}
        onClose={onClose}
        title={
          request.type === 'check_in'
            ? 'Chi tiết khiếu nại check-in'
            : 'Chi tiết khiếu nại check-out'
        }
        theme={theme}>
        <ScrollView style={{maxHeight: 450}}>
          {/* ===== USER INFO ===== */}
          <View style={{marginBottom: 16}}>
            <View style={{flexDirection: 'row', alignItems: 'center'}}>
              <Image
                source={request.avatarSource}
                style={{
                  width: 56,
                  height: 56,
                  borderRadius: 28,
                  marginRight: 12,
                }}
              />
              <View style={{flex: 1}}>
                <Text style={{fontSize: 18, fontWeight: '700'}}>
                  {request.name}
                </Text>
                <Text style={{color: theme.colors.mutedText}}>
                  {request.position}
                </Text>
                <Text style={{color: theme.colors.mutedText}}>
                  {request.department}
                </Text>
              </View>
              <Chip status={request.status} />
            </View>
          </View>

          {/* ===== META ===== */}
          <View
            style={{
              backgroundColor: theme.colors.lightGrayBackground,
              padding: 12,
              borderRadius: 8,
              marginBottom: 16,
            }}>
            <View style={{flexDirection: 'row'}}>
              <View style={{flex: 1}}>
                <Text style={{color: theme.colors.mutedText}}>
                  {lang.t('createdAt') || 'Thời điểm gửi'}
                </Text>
                <Text style={{fontWeight: '600'}}>
                  {request.createdAt}
                </Text>
              </View>
              <View style={{flex: 1}}>
                <Text style={{color: theme.colors.mutedText}}>
                  Trạng thái
                </Text>
                <Text style={{fontWeight: '600'}}>
                  {request.status}
                </Text>
              </View>
            </View>
          </View>

          {/* ===== COMPLAINT INFO ===== */}
          <View
            style={{
              backgroundColor: theme.colors.lightGrayBackground,
              padding: 12,
              borderRadius: 8,
              marginBottom: 16,
            }}>
            <Text style={{fontWeight: '600', marginBottom: 8}}>
              Thông tin chấm công
            </Text>

            <View style={{flexDirection: 'row'}}>
              <View style={{flex: 1}}>
                <Text style={{color: theme.colors.mutedText}}>Ngày</Text>
                <Text style={{fontWeight: '600'}}>{request.date}</Text>
              </View>
              <View style={{flex: 1}}>
                <Text style={{color: theme.colors.mutedText}}>
                  Giờ thực tế
                </Text>
                <Text style={{fontWeight: '600'}}>
                  {request.actual_time}
                </Text>
              </View>
            </View>
          </View>

          {/* ===== REASON ===== */}
          <View
            style={{
              backgroundColor: theme.colors.lightGrayBackground,
              padding: 12,
              borderRadius: 8,
              marginBottom: 16,
            }}>
            <Text style={{fontWeight: '600', marginBottom: 8}}>
              Lý do khiếu nại
            </Text>
            <Text>{request.reason}</Text>
          </View>

          {/* ===== IMAGES ===== */}
          {safeImages.length > 0 && (
            <View
              style={{
                backgroundColor: theme.colors.lightGrayBackground,
                padding: 12,
                borderRadius: 8,
                marginBottom: 16,
              }}>
              <Text style={{fontWeight: '600', marginBottom: 8}}>
                Ảnh minh chứng
              </Text>

              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                {safeImages.map((url, index) => (
                  <TouchableOpacity
                    key={index}
                    onPress={() => openPreview(url)}>
                    <Image
                      source={{uri: url}}
                      style={{
                        width: 120,
                        height: 120,
                        borderRadius: 8,
                        marginRight: 8,
                        backgroundColor: '#eee',
                      }}
                    />
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          )}

          {/* ===== ADMIN RESPONSE ===== */}
          {(request.approver || request.admin_note) && (
            <View
              style={{
                backgroundColor: theme.colors.lightGrayBackground,
                padding: 12,
                borderRadius: 8,
              }}>
              <Text style={{fontWeight: '600', marginBottom: 8}}>
                Phản hồi quản lý
              </Text>

              {request.approver && (
                <>
                  <Text>{request.approver.name}</Text>
                  <Text style={{color: theme.colors.mutedText}}>
                    {request.approver.date}
                  </Text>
                </>
              )}

              {!!request.admin_note && (
                <Text style={{marginTop: 6}}>
                  {request.admin_note}
                </Text>
              )}
            </View>
          )}
        </ScrollView>
      </CenterModal>

      {/* ===== IMAGE PREVIEW ===== */}
      <Modal visible={previewVisible} transparent animationType="fade">
        <View
          style={{
            flex: 1,
            backgroundColor: 'rgba(0,0,0,0.95)',
            justifyContent: 'center',
            alignItems: 'center',
          }}>
          <Image
            source={{uri: previewImage || ''}}
            style={{width: '100%', height: '80%'}}
            resizeMode="contain"
          />

          <View style={{flexDirection: 'row', gap: 16, marginTop: 20}}>
            <TouchableOpacity
              onPress={handleDownload}
              style={{
                paddingVertical: 10,
                paddingHorizontal: 20,
                backgroundColor: 'rgba(0,0,0,0.6)',
                borderRadius: 20,
              }}>
              <Text style={{color: '#fff'}}>⬇️ Tải ảnh</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => setPreviewVisible(false)}
              style={{
                paddingVertical: 10,
                paddingHorizontal: 20,
                backgroundColor: 'rgba(0,0,0,0.6)',
                borderRadius: 20,
              }}>
              <Text style={{color: '#fff'}}>✕ Đóng</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </>
  );
};

export default CheckinComplaintDetailModal;
