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

export interface LeaveRequestDetail {
  avatarSource: any;
  name: string;
  position: string;
  department: string;
  status: RequestStatus;
  requestCode: string;

  type: 'annual' | 'sick' | 'unpaid';

  startDate: string;
  endDate: string;
  numberOfDays: number;
  reason: string;
  createdAt: string;

  evidenceImages?: string[];

  approver?: Approver;

  user_id?: string;
  leave_id?: string;
}

interface LeaveRequestDetailModalProps {
  visible: boolean;
  onClose: () => void;
  request: LeaveRequestDetail | null;
  theme: Theme;
  lang: LanguageResolved;
  isAdmin?: boolean;
  onApprove?: () => void;
  onReject?: () => void;
}

const LeaveRequestDetailModal: React.FC<LeaveRequestDetailModalProps> = ({
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

  /* ================= PREVIEW STATE ================= */
  const [previewVisible, setPreviewVisible] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  const openPreview = (url: string) => {
    setPreviewImage(url);
    setPreviewVisible(true);
  };

  const handleDownload = async () => {
    if (!previewImage) return;

    try {
      const fileName = `leave_image_${Date.now()}.jpg`;
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
        throw new Error();
      }
    } catch {
      Toast.show({
        type: 'error',
        text1: 'Lỗi',
        text2: 'Không thể tải ảnh',
      });
    }
  };

  const showActionButtons = isAdmin && request.status === 'pending';

  const images = Array.isArray(request.evidenceImages)
    ? request.evidenceImages.filter(Boolean)
    : [];

  const LEAVE_TYPE_CONFIG = {
    annual: {label: lang.t('annualLeave'), color: '#3B82F6'},
    sick: {label: lang.t('sickLeave'), color: '#10B981'},
    unpaid: {label: lang.t('unpaidLeave'), color: '#6B7280'},
  };

  const typeConfig = LEAVE_TYPE_CONFIG[request.type];

  return (
    <>
      {/* ================= MAIN MODAL ================= */}
      <CenterModal
        visible={visible}
        onClose={onClose}
        title={lang.t('leaveRequestDetails')}
        theme={theme}>
        <ScrollView style={{maxHeight: 520}}>
          {/* EMPLOYEE INFO */}
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

          {/* REQUEST META */}
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
                <Text style={{fontWeight: '600'}}>
                  {request.requestCode}
                </Text>
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

            <View style={{marginTop: 12}}>
              <View
                style={{
                  alignSelf: 'flex-start',
                  paddingHorizontal: 10,
                  paddingVertical: 4,
                  borderRadius: 999,
                  backgroundColor: typeConfig.color + '22',
                }}>
                <Text
                  style={{
                    color: typeConfig.color,
                    fontWeight: '600',
                    fontSize: 12,
                  }}>
                  {typeConfig.label}
                </Text>
              </View>
            </View>
          </View>

          {/* LEAVE DURATION */}
          <View
            style={{
              backgroundColor: theme.colors.lightGrayBackground,
              padding: 12,
              borderRadius: 8,
              marginBottom: 16,
            }}>
            <Text style={{fontWeight: '600', marginBottom: 8}}>
              {lang.t('leaveDuration')}
            </Text>

            <View style={{flexDirection: 'row'}}>
              <View style={{flex: 1}}>
                <Text style={{color: theme.colors.mutedText}}>
                  {lang.t('startDate')}
                </Text>
                <Text style={{fontWeight: '600'}}>
                  {request.startDate}
                </Text>
              </View>
              <View style={{flex: 1}}>
                <Text style={{color: theme.colors.mutedText}}>
                  {lang.t('endDate')}
                </Text>
                <Text style={{fontWeight: '600'}}>
                  {request.endDate}
                </Text>
              </View>
            </View>

            <Text style={{color: theme.colors.primary, marginTop: 6}}>
              {request.numberOfDays} {lang.t('days')}
            </Text>
          </View>

          {/* REASON */}
          <View
            style={{
              backgroundColor: theme.colors.lightGrayBackground,
              padding: 12,
              borderRadius: 8,
              marginBottom: 16,
            }}>
            <Text style={{fontWeight: '600', marginBottom: 8}}>
              {lang.t('leaveReasonLabel')}
            </Text>
            <Text>{request.reason}</Text>
          </View>

          {/* EVIDENCE IMAGES */}
          {images.length > 0 && (
            <View
              style={{
                backgroundColor: theme.colors.lightGrayBackground,
                padding: 12,
                borderRadius: 8,
                marginBottom: 16,
              }}>
              <Text style={{fontWeight: '600', marginBottom: 8}}>
                {lang.t('evidenceImages')}
              </Text>

              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                {images.map((url, index) => (
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
        </ScrollView>

        {/* ACTIONS */}
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
              onPress={onReject}
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
              onPress={onApprove}
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

      {/* IMAGE PREVIEW */}
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

export default LeaveRequestDetailModal;
