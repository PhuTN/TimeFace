import React from 'react';
import {View, Text, TouchableOpacity} from 'react-native';
import {SvgXml} from 'react-native-svg';
import {useUIFactory} from '../../ui/factory/useUIFactory';

type FeatureItemProps = {
  text: string;
  color?: string;
  icon?: string;
  onPress?: () => void;

  // ⭐ NEW
  badgeCount?: number; // số thông báo
};

const FeatureItem: React.FC<FeatureItemProps> = ({
  text,
  color,
  icon,
  onPress,
  badgeCount = 0,
}) => {
  const {loading, theme} = useUIFactory();
  if (loading || !theme) return null;

  const showBadge = badgeCount > 0;
  const badgeText = badgeCount > 9 ? '9+' : badgeCount.toString();

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.7}
      style={{marginVertical: 10}}>
      <View
        style={{
          backgroundColor:
            theme.colors.cardBackground || theme.colors.background,
          borderRadius: 12,
          paddingVertical: 12,
          paddingHorizontal: 12,
          alignItems: 'center',
          justifyContent: 'flex-start',
          shadowColor: theme.colors.shadow || '#000',
          shadowOpacity: 0.1,
          shadowRadius: 4,
          shadowOffset: {width: 0, height: 1},
          elevation: 2,
          width: 110,
          height: 120,
        }}>
        {/* ICON + BADGE */}
        <View style={{position: 'relative'}}>
          <View
            style={{
              backgroundColor: color
                ? `${color}26`
                : theme.colors.primary + '26',
              borderRadius: 8,
              padding: 8,
              marginBottom: 6,
            }}>
            {icon ? (
              <SvgXml
                xml={icon}
                width={24}
                height={24}
                color={color || theme.colors.primary}
              />
            ) : (
              <SvgXml
                xml={`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 3H5a2 2 0 0 0-2 2v4m6-6h10a2 2 0 0 1 2 2v4M9 3v18m0 0h10a2 2 0 0 0 2-2V9M9 21H5a2 2 0 0 1-2-2V9m0 0h18"/></svg>`}
                width={24}
                height={24}
                color={color || theme.colors.primary}
              />
            )}
          </View>

          {/* 🔴 BADGE */}
          {showBadge && (
            <View
              style={{
                position: 'absolute',
                top: -6,
                right: -6,
                minWidth: 18,
                height: 18,
                borderRadius: 9,
                backgroundColor: '#FF3B30',
                alignItems: 'center',
                justifyContent: 'center',
                paddingHorizontal: 4,
              }}>
              <Text
                style={{
                  color: '#fff',
                  fontSize: 10,
                  fontWeight: '700',
                }}>
                {badgeText}
              </Text>
            </View>
          )}
        </View>

        {/* TEXT */}
        <View
          style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
          <Text
            style={{
              fontSize: 13,
              color: theme.colors.mutedText,
              fontWeight: '500',
              textAlign: 'center',
            }}>
            {text}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};

export default FeatureItem;
