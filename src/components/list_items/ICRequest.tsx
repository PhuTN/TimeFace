import React from 'react';
import {View, Text, Image, TouchableOpacity} from 'react-native';
import {useUIFactory} from '../../ui/factory/useUIFactory';
import Chip from '../common/Chip';

type RequestStatus = 'approved' | 'rejected' | 'pending';
type LeaveType = 'annual' | 'sick' | 'unpaid';

interface ICRequestProps {
  avatarSource: any;
  name: string;
  position: string;
  status: RequestStatus;
  leaveType: LeaveType;
  leaveDates: string; // vd: 15/12/2025 → 18/12/2025
  onPress?: () => void;
}

const ICRequest: React.FC<ICRequestProps> = ({
  avatarSource,
  name,
  position,
  status,
  leaveType,
  leaveDates,
  onPress,
}) => {
  const {loading, theme, lang} = useUIFactory();
  if (loading || !theme || !lang) return null;

  const leaveTypeLabel =
    leaveType === 'annual'
      ? lang.t('annualLeave')
      : leaveType === 'sick'
      ? lang.t('sickLeave')
      : lang.t('unpaidLeave');

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.7}
      style={{
        borderColor: theme.colors.borderLight,
        borderWidth: 1,
        borderRadius: 12,
        backgroundColor: theme.colors.background,
        paddingHorizontal: 12,
      }}>
      {/* ===== ROW 1: USER INFO ===== */}
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          paddingVertical: 10,
        }}>
        <Image
          source={avatarSource}
          style={{
            width: 40,
            height: 40,
            borderRadius: 20,
            marginRight: 12,
          }}
        />
        <View style={{flex: 1}}>
          <Text
            style={{
              fontSize: 16,
              fontWeight: '600',
              color: theme.colors.text,
            }}>
            {name}
          </Text>
          <Text style={{fontSize: 14, color: theme.colors.filterChipText}}>
            {position}
          </Text>
        </View>

        <Chip status={status} />
      </View>

      {/* ===== DIVIDER ===== */}
      <View
        style={{
          height: 1,
          backgroundColor: theme.colors.borderLight,
          marginHorizontal: -12,
        }}
      />

      {/* ===== ROW 2: LEAVE INFO ===== */}
      <View style={{paddingVertical: 10}}>
        <Text
          style={{
            fontSize: 14,
            fontWeight: '500',
            color: theme.colors.text,
            marginBottom: 4,
          }}>
          {leaveTypeLabel}
        </Text>

        <Text
          style={{
            fontSize: 13,
            color: theme.colors.filterChipText,
          }}>
          {lang.t('leaveDates')}: {leaveDates}
        </Text>
      </View>
    </TouchableOpacity>
  );
};

export default ICRequest;
