import React from 'react';
import {View, Text, Image, TouchableOpacity} from 'react-native';
//import type {Theme} from '../../ui/theme/theme';
import {useUIFactory} from '../../ui/factory/useUIFactory';

interface EmployeeListItemProps {
  avatarSource: any;
  name: string;
  position: string;
  isSelected: boolean;
  onToggleSelect: () => void;
}

const EmployeeListItem: React.FC<EmployeeListItemProps> = ({
  avatarSource,
  name,
  position,
  isSelected,
  onToggleSelect,
}) => {
  const {loading, theme} = useUIFactory();
  if (loading || !theme) {
    return null;
  }

  return (
    <View
      style={{
        borderColor: theme.colors.borderLight,
        borderWidth: 1,
        borderRadius: 12,
        backgroundColor: theme.colors.background,
        paddingHorizontal: 12,
        paddingVertical: 12,
      }}>
      {/* First row */}
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
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
        <TouchableOpacity
          onPress={onToggleSelect}
          style={{
            width: 36,
            height: 36,
            borderRadius: 6,
            borderWidth: 2,
            marginRight: 10,
            borderColor: theme.colors.primary,
            backgroundColor: isSelected ? theme.colors.primary : 'transparent',
            justifyContent: 'center',
            alignItems: 'center',
          }}>
          {isSelected && <Text style={{color: 'white', fontSize: 16}}>✔</Text>}
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default EmployeeListItem;
