import React from 'react';
import {View, Text, Image, ScrollView, TouchableOpacity} from 'react-native';
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
    <CenterModal
      visible={visible}
      onClose={onClose}
      title={lang.t('otRequestDetails')}
      theme={theme}>
      <ScrollView style={{maxHeight: 500}}>
        {/* Employee Info Section */}
        <View style={{marginBottom: 16}}>
          <View style={{flexDirection: 'row', alignItems: 'center', marginBottom: 12}}>
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
              <Text
                style={{
                  fontSize: 18,
                  fontWeight: '700',
                  color: theme.colors.text,
                  marginBottom: 4,
                }}>
                {request.name}
              </Text>
              <Text
                style={{
                  fontSize: 14,
                  color: theme.colors.mutedText,
                  marginBottom: 2,
                }}>
                {request.position}
              </Text>
              <Text
                style={{
                  fontSize: 14,
                  color: theme.colors.mutedText,
                }}>
                {request.department}
              </Text>
            </View>
            <Chip status={request.status} />
          </View>
        </View>

        {/* Request Info Section */}
        <View
          style={{
            backgroundColor: theme.colors.lightGrayBackground,
            padding: 12,
            borderRadius: 8,
            marginBottom: 16,
          }}>
          <View style={{flexDirection: 'row', marginBottom: 12}}>
            <View style={{flex: 1}}>
              <Text
                style={{
                  fontSize: 16,
                  color: theme.colors.mutedText,
                  marginBottom: 4,
                }}>
                {lang.t('requestCode')}
              </Text>
              <Text
                style={{
                  fontSize: 16,
                  fontWeight: '600',
                  color: theme.colors.text,
                }}>
                {request.code}
              </Text>
            </View>
            <View style={{flex: 1}}>
              <Text
                style={{
                  fontSize: 16,
                  color: theme.colors.mutedText,
                  marginBottom: 4,
                }}>
                {lang.t('createdAt')}
              </Text>
              <Text
                style={{
                  fontSize: 16,
                  fontWeight: '600',
                  color: theme.colors.text,
                }}>
                {request.createdAt}
              </Text>
            </View>
          </View>
        </View>

        {/* OT Details Section */}
        <View
          style={{
            backgroundColor: theme.colors.lightGrayBackground,
            padding: 12,
            borderRadius: 8,
            marginBottom: 16,
          }}>
          <Text
            style={{
              fontSize: 16,
              fontWeight: '600',
              color: theme.colors.text,
              marginBottom: 8,
            }}>
            {lang.t('otDetails')}
          </Text>
          <View style={{flexDirection: 'row', marginBottom: 8}}>
            <View style={{flex: 1}}>
              <Text
                style={{
                  fontSize: 16,
                  color: theme.colors.mutedText,
                  marginBottom: 4,
                }}>
                {lang.t('date')}
              </Text>
              <Text
                style={{
                  fontSize: 16,
                  fontWeight: '600',
                  color: theme.colors.text,
                }}>
                {request.date}
              </Text>
            </View>
            <View style={{flex: 1}}>
              <Text
                style={{
                  fontSize: 16,
                  color: theme.colors.mutedText,
                  marginBottom: 4,
                }}>
                {lang.t('time')}
              </Text>
              <Text
                style={{
                  fontSize: 16,
                  fontWeight: '600',
                  color: theme.colors.text,
                }}>
                {request.time}
              </Text>
            </View>
          </View>
          <View>
            <Text
              style={{
                fontSize: 16,
                color: theme.colors.mutedText,
                marginBottom: 4,
              }}>
              {lang.t('hours')}
            </Text>
            <Text
              style={{
                fontSize: 16,
                fontWeight: '600',
                color: theme.colors.primary,
              }}>
              {request.hours} {lang.t('hours')}
            </Text>
          </View>
        </View>

        {/* Reason Section */}
        <View
          style={{
            backgroundColor: theme.colors.lightGrayBackground,
            padding: 12,
            borderRadius: 8,
            marginBottom: 16,
          }}>
          <Text
            style={{
              fontSize: 16,
              fontWeight: '600',
              color: theme.colors.text,
              marginBottom: 8,
            }}>
            {lang.t('otReason')}
          </Text>
          <Text
            style={{
              fontSize: 16,
              color: theme.colors.text,
              lineHeight: 22,
            }}>
            {request.reason}
          </Text>
        </View>

        {/* Approver Section */}
        {request.status === 'approved' && request.approver && (
          <View
            style={{
              backgroundColor: theme.colors.lightGrayBackground,
              padding: 12,
              borderRadius: 8,
            }}>
            <Text
              style={{
                fontSize: 16,
                fontWeight: '600',
                color: theme.colors.text,
                marginBottom: 8,
              }}>
              {lang.t('approvedBy')}
            </Text>
            <Text
              style={{
                fontSize: 16,
                color: theme.colors.text,
                marginBottom: 4,
              }}>
              {request.approver.name}
            </Text>
            <Text
              style={{
                fontSize: 14,
                color: theme.colors.mutedText,
              }}>
              {request.approver.date}
            </Text>
          </View>
        )}
      </ScrollView>

      {/* Action Buttons */}
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
              justifyContent: 'center',
            }}>
            <Text
              style={{
                fontSize: 16,
                fontWeight: '600',
                color: theme.colors.primary,
              }}>
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
              justifyContent: 'center',
            }}>
            <Text
              style={{
                fontSize: 16,
                fontWeight: '600',
                color: '#FFFFFF',
              }}>
              {lang.t('approve')}
            </Text>
          </TouchableOpacity>
        </View>
      )}
    </CenterModal>
  );
};

export default OTRequestDetailModal;
