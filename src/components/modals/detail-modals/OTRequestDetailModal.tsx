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

type RequestStatus = 'approved' | 'rejected' | 'pending';

interface Approver {
  name: string;
  date: string;
}

export interface OTRequestDetail {
  avatarSource: any;
  name: string;
  position: string;
  department: string;
  status: RequestStatus;
  code: string;
  date: string;
  time: string;
  hours: number;
  reason: string;
  createdAt: string;
  images?: string[];
  approver?: Approver;
}

interface OTRequestDetailModalProps {
  visible: boolean;
  onClose: () => void;
  request: OTRequestDetail | null;
  theme: Theme;
  lang: LanguageResolved;
  isAdmin?: boolean;
  onApprove?: () => void;
  onReject?: () => void;
}

const OTRequestDetailModal: React.FC<OTRequestDetailModalProps> = ({
  visible,
  onClose,
  request,
  theme,
  lang,
  isAdmin = false,
  onApprove,
  onReject,
}) => {
  if (!request) return null;

  // ===== FIX AN TOÀN =====
  const safeImages = Array.isArray(request.images)
    ? request.images.filter(Boolean)
    : [];

  // ===== PREVIEW STATE (THÊM MỚI) =====
  const [previewVisible, setPreviewVisible] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  const openPreview = (url: string) => {
    setPreviewImage(url);
    setPreviewVisible(true);
  };

  const handleDownload = async () => {
    if (!previewImage) return;

    try {
      const fileName = `ot_image_${Date.now()}.jpg`;
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
          text1: 'Thành công',
          text2: 'Ảnh đã được lưu',
        });
      } else {
        throw new Error('Download failed');
      }
    } catch (e) {
      Toast.show({
        type: 'error',
        text1: 'Lỗi',
        text2: 'Không thể tải ảnh',
      });
    }
  };

  const handleApprove = () => {
    onApprove?.();
    onClose();
  };

  const handleReject = () => {
    onReject?.();
    onClose();
  };

  const showActionButtons = isAdmin && request.status === 'pending';

  return (
    <>
      {/* ================= MAIN MODAL (GIỮ NGUYÊN UI) ================= */}
      <CenterModal
        visible={visible}
        onClose={onClose}
        title={lang.t('otRequestDetails')}
        theme={theme}>
        <ScrollView style={{maxHeight: 450}}>
          {/* ================= EMPLOYEE INFO ================= */}
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

          {/* ================= REQUEST INFO ================= */}
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
                  {lang.t('requestCode')}
                </Text>
                <Text style={{fontWeight: '600'}}>{request.code}</Text>
              </View>
              <View style={{flex: 1}}>
                <Text style={{color: theme.colors.mutedText}}>
                  {lang.t('createdAt')}
                </Text>
                <Text style={{fontWeight: '600'}}>
                  {request.createdAt}
                </Text>
              </View>
            </View>
          </View>

          {/* ================= OT DETAILS ================= */}
          <View
            style={{
              backgroundColor: theme.colors.lightGrayBackground,
              padding: 12,
              borderRadius: 8,
              marginBottom: 16,
            }}>
            <Text style={{fontWeight: '600', marginBottom: 8}}>
              {lang.t('otDetails')}
            </Text>

            <View style={{flexDirection: 'row'}}>
              <View style={{flex: 1}}>
                <Text style={{color: theme.colors.mutedText}}>
                  {lang.t('date')}
                </Text>
                <Text style={{fontWeight: '600'}}>{request.date}</Text>
              </View>
              <View style={{flex: 1}}>
                <Text style={{color: theme.colors.mutedText}}>
                  {lang.t('time')}
                </Text>
                <Text style={{fontWeight: '600'}}>{request.time}</Text>
              </View>
            </View>

            <Text style={{color: theme.colors.primary, marginTop: 6}}>
              {request.hours} {lang.t('hours')}
            </Text>
          </View>

          {/* ================= REASON ================= */}
          <View
            style={{
              backgroundColor: theme.colors.lightGrayBackground,
              padding: 12,
              borderRadius: 8,
              marginBottom: 16,
            }}>
            <Text style={{fontWeight: '600', marginBottom: 8}}>
              {lang.t('otReason')}
            </Text>
            <Text>{request.reason}</Text>
          </View>

          {/* ================= EVIDENCE IMAGES ================= */}
          {safeImages.length > 0 && (
            <View
              style={{
                backgroundColor: theme.colors.lightGrayBackground,
                padding: 12,
                borderRadius: 8,
                marginBottom: 16,
              }}>
              <Text style={{fontWeight: '600', marginBottom: 8}}>
                {lang.t('evidenceImages') || 'Ảnh minh chứng'}
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

          {/* ================= APPROVER ================= */}
          {request.status === 'approved' && request.approver && (
            <View
              style={{
                backgroundColor: theme.colors.lightGrayBackground,
                padding: 12,
                borderRadius: 8,
              }}>
              <Text style={{fontWeight: '600', marginBottom: 8}}>
                {lang.t('approvedBy')}
              </Text>
              <Text>{request.approver.name}</Text>
              <Text style={{color: theme.colors.mutedText}}>
                {request.approver.date}
              </Text>
            </View>
          )}
        </ScrollView>

        {/* ================= ACTION BUTTONS ================= */}
        {showActionButtons && (
          <View
            style={{
              flexDirection: 'row',
              gap: 12,
              marginTop: 16,
              paddingTop: 16,
              borderTopWidth: 1,
              borderTopColor: theme.colors.borderLight,
            }}>
            <TouchableOpacity
              onPress={handleReject}
              style={{
                flex: 1,
                paddingVertical: 12,
                borderRadius: 8,
                borderWidth: 2,
                borderColor: theme.colors.primary,
                alignItems: 'center',
              }}>
              <Text style={{color: theme.colors.primary}}>
                {lang.t('reject')}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={handleApprove}
              style={{
                flex: 1,
                paddingVertical: 12,
                borderRadius: 8,
                backgroundColor: theme.colors.primary,
                alignItems: 'center',
              }}>
              <Text style={{color: '#fff'}}>
                {lang.t('approve')}
              </Text>
            </TouchableOpacity>
          </View>
        )}
      </CenterModal>

      {/* ================= IMAGE PREVIEW (THÊM MỚI) ================= */}
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
              <Text style={{color: '#fff'}}>⬇️ Download</Text>
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

export default OTRequestDetailModal;