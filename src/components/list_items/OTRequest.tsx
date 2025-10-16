import React from 'react';
import {View, Text, Image} from 'react-native';
//import type {Theme} from '../../ui/theme/theme';
import {useUIFactory} from '../../ui/factory/useUIFactory';
import Chip from '../common/Chip';

type RequestStatus = 'approved' | 'rejected' | 'pending';

interface OTRequestProps {
  avatarSource: any;
  name: string;
  position: string;
  status: RequestStatus;
  code: string;
  date: string;
  time: string;
  createdAt: string;
}

const OTRequest: React.FC<OTRequestProps> = ({
  avatarSource,
  name,
  position,
  status,
  code,
  date,
  time,
  createdAt,
}) => {
  const {loading, theme, lang} = useUIFactory();
  if (loading || !theme || !lang) {
    return;
  }

  return (
    <View
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
        <View style={{flexDirection: 'column', gap: 4, alignItems: 'flex-end'}}>
          <Chip status={status} />
          <Chip text={lang!.t('requestCode') + ': ' + code} />
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
          gap: 2,
        }}>
        <View>
          <Text style={{fontSize: 14, color: theme.colors.filterChipText}}>
            {lang!.t('createdAt')}: {createdAt}
          </Text>
        </View>

        {/* Time row */}
        <View>
          <Text style={{fontSize: 14, color: theme.colors.filterChipText}}>
            {lang!.t('time')}: {time} {lang!.t('date')} {date}
          </Text>
        </View>
      </View>
    </View>
  );
};

export default OTRequest;
