import React from 'react';
import {View, Text, TouchableOpacity, Image} from 'react-native';
import type {Theme} from '../../ui/theme/theme';

interface FilterChipProps {
  mainText: string;
  subText: string;
  onRemove: () => void;
  theme: Theme;
}

const FilterChip: React.FC<FilterChipProps> = ({
  mainText,
  subText,
  onRemove,
  theme,
}) => {
  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: theme.colors.filterChipBackground,
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderRadius: 100,
        width: 180,
      }}>
      <View style={{flex: 1, gap: 2}}>
        <Text
          style={{
            fontSize: 16,
            fontWeight: 500,
            color: theme.colors.text,
          }}>
          {mainText}
        </Text>
        <Text
          style={{
            fontSize: 14,
            color: theme.colors.filterChipText,
          }}>
          {subText}
        </Text>
      </View>
      <TouchableOpacity onPress={onRemove} style={{marginLeft: 8}}>
        <Image
          source={require('../../assets/images/delete.png')}
          style={{
            width: 24,
            height: 24,
          }}
        />
      </TouchableOpacity>
    </View>
  );
};

export default FilterChip;
