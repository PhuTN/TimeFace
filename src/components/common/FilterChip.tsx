import React from 'react';
import { View, Text, TouchableOpacity, Image } from 'react-native';
import type { Theme } from '../../ui/theme/theme';

interface FilterChipProps {
  mainText: string;
  subText: string;
  onRemove: () => void;
  theme: Theme;
}

const MAX_WIDTH = 220;
const MIN_WIDTH = 230;

const FilterChip: React.FC<FilterChipProps> = ({
  mainText,
  subText,
  onRemove,
  theme,
}) => {
  return (
    <View
      style={{
        minWidth: MIN_WIDTH,
        maxWidth: MAX_WIDTH,

        paddingHorizontal: 14,
        paddingVertical: 10,
        borderRadius: 14,

        flexDirection: 'row',
        alignItems: 'flex-start',
        gap: 10,
        backgroundColor: theme.colors.filterChipBackground,

        minHeight: 90,    // 👈 FIX CHIỀU CAO 3 DÒNG

        shadowColor: '#000',
        shadowOpacity: 0.06,
        shadowOffset: { width: 0, height: 2 },
        shadowRadius: 4,
        elevation: 2,
      }}
    >
      <View style={{ flex: 1 }}>
        <Text
          style={{
            fontSize: 13,
            fontWeight: '600',
            color: theme.colors.text,
            marginBottom: 4,
            lineHeight: 18,
          }}
          numberOfLines={3} // 👈 đảm bảo 3 dòng max
        >
          {mainText}
        </Text>

        <Text
          style={{
            fontSize: 12,
            color: theme.colors.filterChipText,
            opacity: 0.8,
            lineHeight: 16,
          }}
          numberOfLines={3} // 👈 3 dòng luôn
        >
          {subText}
        </Text>
      </View>

      <TouchableOpacity
        onPress={onRemove}
        style={{
          padding: 6,
          justifyContent: 'center',
        }}
      >
        <Image
          source={require('../../assets/images/delete.png')}
          style={{
            width: 18,
            height: 18,
            tintColor: theme.colors.filterChipText,
          }}
        />
      </TouchableOpacity>
    </View>
  );
};

export default FilterChip;
