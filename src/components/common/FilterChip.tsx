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
        paddingLeft: 16,
        paddingRight: 8,
        paddingVertical: 8,
        borderRadius: 100,
        minWidth: 100,
      }}>
      <View style={{flex: 1, gap: 2, alignItems: 'flex-start', flexDirection: "column"}}>
        <Text
          style={{
            fontSize: 14,
            fontWeight: '500',
            color: theme.colors.text,
            textAlign: 'center',
          }}>
          {mainText}
        </Text>
        <Text
          style={{
            fontSize: 12,
            color: theme.colors.filterChipText,
            textAlign: 'center',
          }}>
          {subText}
        </Text>
      </View>
      <TouchableOpacity onPress={onRemove} style={{marginLeft: 12}}>
        <Image
          source={require('../../assets/images/delete.png')}
          style={{
            width: 20,
            height: 20,
          }}
        />
      </TouchableOpacity>
    </View>
  );
};

export default FilterChip;
