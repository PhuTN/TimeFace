import React from 'react';
import {View, Text, Image, TouchableOpacity} from 'react-native';
import Chip from '../common/Chip';

export default function ComplaintRequest({
  avatarSource,
  name,
  department,
  action,
  date,
  status,
  onPress,
}: any) {
  const actionLabel = action === 'check_in' ? 'Check-in' : 'Check-out';

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.8}
      style={{
        padding: 12,
        borderRadius: 14,
        borderWidth: 1,
        borderColor: '#E5E7EB',
        backgroundColor: '#FFFFFF',
      }}>
      <View style={{flexDirection: 'row', alignItems: 'center'}}>
        {/* Avatar */}
        <Image
          source={avatarSource}
          style={{
            width: 42,
            height: 42,
            borderRadius: 21,
            marginRight: 12,
          }}
        />

        {/* Info */}
        <View style={{flex: 1}}>
          <Text style={{fontSize: 15, fontWeight: '600', color: '#111827'}}>
            {name}
          </Text>

          <Text
            style={{
              fontSize: 13,
              color: '#6B7280',
              marginTop: 2,
            }}>
            {department} • {actionLabel}
          </Text>

          <Text
            style={{
              fontSize: 12,
              color: '#9CA3AF',
              marginTop: 2,
            }}>
            {date}
          </Text>
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
