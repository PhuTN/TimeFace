import React from 'react';
import {View, Text, Image, TouchableOpacity} from 'react-native';
import Chip from '../common/Chip';

export default function ComplaintRequest({
  avatarSource,
  name,
  department,
  action,
  date,
  time,
  status,
  onPress,
  showAvatar = true,
  showTime = false,
  approverName,
}: any) {
  const actionLabel = action === 'check_in' ? 'Check-in' : 'Check-out';
  const dateLabel = showTime && time ? `${date} • ${time}` : date;
  const hasName = Boolean(name && String(name).trim().length > 0);
  const showApprover = status === 'approved' && approverName;

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.8}
      style={{
        padding: showAvatar ? 14 : 12,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: '#E5E7EB',
        backgroundColor: '#FFFFFF',
        shadowColor: '#000',
        shadowOpacity: 0.05,
        shadowRadius: 6,
        elevation: 1,
      }}>
      <View style={{flexDirection: 'row', alignItems: 'center'}}>
        {showAvatar && (
          <Image
            source={avatarSource}
            style={{
              width: 46,
              height: 46,
              borderRadius: 23,
              marginRight: 12,
              backgroundColor: '#F2F4F7',
            }}
          />
        )}

        {/* Info */}
        <View style={{flex: 1, gap: 2}}>
          {hasName && (
            <Text
              style={{
                fontSize: showAvatar ? 15 : 16,
                fontWeight: '700',
                color: '#111827',
              }}>
              {name}
            </Text>
          )}

          <Text
            style={{
              fontSize: showAvatar ? 13 : 14,
              color: '#6B7280',
              lineHeight: 18,
            }}>
            {[department, actionLabel].filter(Boolean).join(' • ')}
          </Text>

          <Text
            style={{
              fontSize: 12,
              color: '#9CA3AF',
            }}>
            {dateLabel}
          </Text>

          {showApprover && (
            <Text
              style={{
                fontSize: 12,
                color: '#6B7280',
                marginTop: 2,
              }}>
              Người duyệt: {approverName}
            </Text>
          )}
        </View>

        {/* Status tag */}
        <View
          style={{
            alignSelf: 'flex-start', // 🔥 quan trọng: không bị kéo cao
            marginTop: 2,
          }}>
          <Chip status={status} size="sm" />
        </View>
      </View>
    </TouchableOpacity>
  );
}
