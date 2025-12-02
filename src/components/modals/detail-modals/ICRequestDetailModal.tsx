import React from 'react';
import {View, Text, Image, StyleSheet, ScrollView, TouchableOpacity} from 'react-native';
import CenterModal from '../../common/CenterModal';
import Chip from '../../common/Chip';
import type {Theme} from '../../../ui/theme/theme';
import type {LanguageResolved} from '../../../ui/factory/abstract';

type RequestStatus = 'approved' | 'rejected' | 'pending';

export type ICRequestDetail = {
  id: string;
  avatarSource: any;
  name: string;
  position: string;
  status: RequestStatus;
  date: string;
  department?: string;
  requestCode?: string;
  changedFields?: {
    label: string;
    oldValue: string;
    newValue: string;
  }[];
  approver?: {
    name: string;
    date: string;
  };
};

type Props = {
  visible: boolean;
  onClose: () => void;
  request: ICRequestDetail | null;
  theme: Theme;
  lang: LanguageResolved;
  onApprove?: (requestId: string) => void;
  onReject?: (requestId: string) => void;
  isAdmin?: boolean;
};

const ICRequestDetailModal: React.FC<Props> = ({
  visible,
  onClose,
  request,
  theme,
  lang,
  onApprove,
  onReject,
  isAdmin = false,
}) => {
  if (!request) return null;

  const handleApprove = () => {
    onApprove?.(request.id);
    onClose();
  };

  const handleReject = () => {
    onReject?.(request.id);
    onClose();
  };

  return (
    <CenterModal
      visible={visible}
      onClose={onClose}
      title={lang.t('icRequestTitle')}
      theme={theme}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        style={styles.scrollView}>
        {/* Employee Info Section */}
        <View style={styles.section}>
          <View style={styles.employeeHeader}>
            <Image
              source={request.avatarSource}
              style={styles.avatar}
            />
            <View style={styles.employeeInfo}>
              <Text style={[styles.employeeName, {color: theme.colors.text}]}>
                {request.name}
              </Text>
              <Text style={[styles.employeePosition, {color: theme.colors.mutedText}]}>
                {request.position}
              </Text>
              {request.department && (
                <Text style={[styles.employeeDepartment, {color: theme.colors.mutedText}]}>
                  {request.department}
                </Text>
              )}
            </View>
            <Chip status={request.status} />
          </View>
        </View>

        {/* Request Info Section */}
        <View style={[styles.section, styles.infoSection]}>
          <View style={styles.infoRow}>
            <Text style={[styles.infoLabel, {color: theme.colors.mutedText}]}>
              {lang.t('requestCode')}
            </Text>
            <Text style={[styles.infoValue, {color: theme.colors.text}]}>
              {request.requestCode || 'IC-001'}
            </Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={[styles.infoLabel, {color: theme.colors.mutedText}]}>
              {lang.t('changeDate')}
            </Text>
            <Text style={[styles.infoValue, {color: theme.colors.text}]}>
              {request.date}
            </Text>
          </View>
        </View>

        {/* Changed Fields Section */}
        {request.changedFields && request.changedFields.length > 0 && (
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, {color: theme.colors.text}]}>
              Thông tin thay đổi
            </Text>
            {request.changedFields.map((field, index) => (
              <View
                key={index}
                style={[
                  styles.changedField,
                  {
                    backgroundColor: theme.colors.lightGrayBackground,
                    borderColor: theme.colors.borderLight,
                  },
                ]}>
                <Text style={[styles.fieldLabel, {color: theme.colors.text}]}>
                  {field.label}
                </Text>
                <View style={styles.valueChange}>
                  <Text style={[styles.oldValue, {color: theme.colors.mutedText}]}>
                    {field.oldValue}
                  </Text>
                  <Text style={[styles.arrow, {color: theme.colors.primary}]}>
                    →
                  </Text>
                  <Text style={[styles.newValue, {color: theme.colors.primary}]}>
                    {field.newValue}
                  </Text>
                </View>
              </View>
            ))}
          </View>
        )}

        {/* Approver Section */}
        {request.approver && request.status === 'approved' && (
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, {color: theme.colors.text}]}>
              {lang.t('approvedBy')}
            </Text>
            <Text style={[styles.approverText, {color: theme.colors.mutedText}]}>
              {request.approver.name} - {request.approver.date}
            </Text>
          </View>
        )}
      </ScrollView>

      {/* Admin Action Buttons - Outside ScrollView */}
      {isAdmin && request.status === 'pending' && (
        <View style={styles.actionButtons}>
          <TouchableOpacity
            style={[styles.actionButton, styles.rejectButton, {borderColor: theme.colors.border}]}
            onPress={handleReject}
            activeOpacity={0.7}>
            <Text style={[styles.actionButtonText, {color: theme.colors.text}]}>
              {lang.t('rejected')}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.actionButton, styles.approveButton, {backgroundColor: theme.colors.primary}]}
            onPress={handleApprove}
            activeOpacity={0.7}>
            <Text style={[styles.actionButtonText, styles.approveButtonText]}>
              {lang.t('approved')}
            </Text>
          </TouchableOpacity>
        </View>
      )}
    </CenterModal>
  );
};

const styles = StyleSheet.create({
  scrollView: {
    maxHeight: 500,
  },
  section: {
    marginBottom: 20,
  },
  employeeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
  },
  employeeInfo: {
    flex: 1,
  },
  employeeName: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 4,
  },
  employeePosition: {
    fontSize: 14,
    marginBottom: 2,
  },
  employeeDepartment: {
    fontSize: 14,
  },
  infoSection: {
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  infoLabel: {
    fontSize: 16,
  },
  infoValue: {
    fontSize: 16,
    fontWeight: '600',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 12,
  },
  changedField: {
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    marginBottom: 8,
  },
  fieldLabel: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 6,
  },
  valueChange: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  oldValue: {
    fontSize: 16,
    textDecorationLine: 'line-through',
  },
  arrow: {
    fontSize: 16,
    fontWeight: '700',
  },
  newValue: {
    fontSize: 16,
    fontWeight: '600',
  },
  approverText: {
    fontSize: 16,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 12,
    paddingTop: 12,
  },
  actionButton: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rejectButton: {
    borderWidth: 2,
  },
  approveButton: {
    // backgroundColor set via theme.colors.primary
  },
  actionButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  approveButtonText: {
    color: '#FFFFFF',
  },
});

export default ICRequestDetailModal;
