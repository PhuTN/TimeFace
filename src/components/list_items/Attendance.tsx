import React from 'react';
import {View, Text, Image, TouchableOpacity} from 'react-native';
import {SvgXml} from 'react-native-svg';
//import type {Theme} from '../../ui/theme/theme';
import {useUIFactory} from '../../ui/factory/useUIFactory';

interface AttendanceProps {
  avatarSource: any;
  name: string;
  position: string;
  isLate: boolean;
  lateMinutes?: number;
  latePercentage?: number;
  leaveReason?: string;
  onCall?: () => void;
  onMessage?: () => void;
  onMail?: () => void;
}

const Attendance: React.FC<AttendanceProps> = ({
  avatarSource,
  name,
  position,
  isLate,
  lateMinutes,
  latePercentage,
  leaveReason,
  onCall,
  onMessage,
  onMail,
}) => {
  const {loading, theme, lang} = useUIFactory();
  if (loading || !theme || !lang) {
    return null;
  }

  const renderContent = () => {
    if (isLate && lateMinutes !== undefined && latePercentage !== undefined) {
      return (
        <Text style={{fontSize: 14, color: theme.colors.filterChipText}}>
          {lang!.t('lateMinutes')}:{' '}
          <Text style={{fontWeight: 'bold', color: 'red'}}>{lateMinutes}</Text>.{' '}
          {lang!.t('occupies')}{' '}
          <Text style={{fontWeight: 'bold', color: 'red'}}>
            {latePercentage}%
          </Text>{' '}
          {lang!.t('shiftTime')}
        </Text>
      );
    } else if (!isLate && leaveReason) {
      return (
        <Text style={{fontSize: 14, color: theme.colors.filterChipText}}>
          {lang!.t('leaveReason')}:{' '}
          <Text style={{fontWeight: 'bold', color: 'red'}}>{leaveReason}</Text>
        </Text>
      );
    }
    return null;
  };

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
              fontWeight: '500',
              color: theme.colors.text,
            }}>
            {name}
          </Text>
          <Text style={{fontSize: 14, color: theme.colors.filterChipText}}>
            {position}
          </Text>
        </View>
        <View style={{flexDirection: 'row', gap: 6}}>
          <TouchableOpacity
            onPress={onCall}
            style={{
              width: 32,
              height: 32,
              borderRadius: 16,
              borderWidth: 1,
              borderColor: theme.colors.borderLight,
              justifyContent: 'center',
              alignItems: 'center',
              backgroundColor: 'transparent',
            }}>
            <SvgXml
              xml={`<svg width="13" height="12" viewBox="0 0 13 12" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M2.65396 5.22198C3.61018 6.95143 5.15076 8.36309 7.03001 9.2492L8.4909 7.90476C8.67019 7.73976 8.93581 7.68476 9.16823 7.75809C9.91195 7.9842 10.7154 8.10643 11.5389 8.10643C11.9041 8.10643 12.2029 8.38143 12.2029 8.71754V10.8503C12.2029 11.1864 11.9041 11.4614 11.5389 11.4614C5.30349 11.4614 0.250122 6.81087 0.250122 1.07254C0.250122 0.736426 0.548942 0.461426 0.914165 0.461426H3.23832C3.60354 0.461426 3.90236 0.736426 3.90236 1.07254C3.90236 1.83643 4.03517 2.56976 4.28087 3.2542C4.35391 3.46809 4.30079 3.70643 4.11485 3.87754L2.65396 5.22198Z" fill="${theme.colors.text}"/>
</svg>`}
              width={16}
              height={16}
            />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={onMessage}
            style={{
              width: 32,
              height: 32,
              borderRadius: 16,
              borderWidth: 1,
              borderColor: theme.colors.borderLight,
              justifyContent: 'center',
              alignItems: 'center',
              backgroundColor: 'transparent',
            }}>
            <SvgXml
              xml={`<svg width="13" height="12" viewBox="0 0 13 12" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M11.2687 0.461426H1.70651C1.04911 0.461426 0.517207 0.956426 0.517207 1.56143L0.51123 11.4614L2.90179 9.26143H11.2687C11.9261 9.26143 12.464 8.76643 12.464 8.16143V1.56143C12.464 0.956426 11.9261 0.461426 11.2687 0.461426ZM10.0735 7.06143H2.90179V5.96143H10.0735V7.06143ZM10.0735 5.41143H2.90179V4.31143H10.0735V5.41143ZM10.0735 3.76143H2.90179V2.66143H10.0735V3.76143Z" fill="${theme.colors.text}"/>
</svg>`}
              width={16}
              height={16}
            />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={onMail}
            style={{
              width: 32,
              height: 32,
              borderRadius: 16,
              borderWidth: 1,
              borderColor: theme.colors.borderLight,
              justifyContent: 'center',
              alignItems: 'center',
              backgroundColor: 'transparent',
            }}>
            <SvgXml
              xml={`<svg width="13" height="12" viewBox="0 0 13 12" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M11.5298 0.461426H1.96762C1.31021 0.461426 0.778315 1.08018 0.778315 1.83643L0.772339 10.0864C0.772339 10.8427 1.31021 11.4614 1.96762 11.4614H11.5298C12.1872 11.4614 12.7251 10.8427 12.7251 10.0864V1.83643C12.7251 1.08018 12.1872 0.461426 11.5298 0.461426ZM11.5298 3.21143L6.74873 6.64893L1.96762 3.21143V1.83643L6.74873 5.27393L11.5298 1.83643V3.21143Z" fill="${theme.colors.text}"/>
</svg>`}
              width={16}
              height={16}
            />
          </TouchableOpacity>
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

      {/* Content row */}
      <View
        style={{
          marginVertical: 10,
          paddingHorizontal: 4,
        }}>
        {renderContent()}
      </View>
    </View>
  );
};

export default Attendance;
