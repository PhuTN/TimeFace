import React from 'react';
import {View, Text, Image, TouchableOpacity} from 'react-native';
import type {Theme} from '../../ui/theme/theme';
import {useUIFactory} from '../../ui/factory/useUIFactory';
import Chip from '../common/Chip';

type RequestStatus = 'approved' | 'rejected' | 'pending';

interface ICRequestProps {
  avatarSource: any;
  name: string;
  position: string;
  status: RequestStatus;
  date: string;
  onPress?: () => void;
}

const ChangeInfoRequest: React.FC<ICRequestProps> = ({
  avatarSource,
  name,
  position,
  status,
  date,
  onPress,
}) => {
  const {loading, theme, lang} = useUIFactory();
  if (loading || !theme || !lang) {
    return null;
  }

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
      {/* First row */}
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          paddingVertical: 8,
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
              fontSize: 18,
              fontWeight: 500,
              color: theme.colors.text,
            }}>
            {name}
          </Text>
          <Text style={{fontSize: 14, color: theme.colors.filterChipText}}>
            {position}
          </Text>
        </View>
        <View style={{alignItems: 'flex-end'}}>
          <Chip status={status} />
        </View>
      </View>

      {/* Divider */}
      <View
        style={{
          height: 1,
          backgroundColor: theme.colors.borderLight,
          marginHorizontal: -12,
        }}
      />

      {/* Date row */}
      <View
        style={{
          marginVertical: 10,
          paddingHorizontal: 4,
        }}>
        <Text style={{fontSize: 14, color: theme.colors.filterChipText}}>
          {lang.t('changeDate')} {date}
        </Text>
      </View>
    </TouchableOpacity>
  );
};

export default ChangeInfoRequest;
