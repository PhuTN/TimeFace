import React from 'react';
import {View, Text, TouchableOpacity, Image} from 'react-native';
import type {Theme} from '../../ui/theme/theme';

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

        paddingHorizontal: 18,
        paddingVertical: 10,
        borderRadius: 36, // Increased from 14

        flexDirection: 'row',
        alignItems: 'flex-start',
        gap: 10,
        backgroundColor: theme.colors.filterChipBackground,

        minHeight: 84,
      }}>
      <View style={{flex: 1}}>
        <Text
          style={{
            fontSize: 14, // Increased from 13
            fontWeight: '600',
            color: theme.colors.text,
            marginBottom: 4,
            lineHeight: 20, // Increased from 18
          }}
          numberOfLines={2} // Reduced from 3 to 2 for better layout
          ellipsizeMode="tail" // Better overflow handling
        >
          {mainText}
        </Text>

        <Text
          style={{
            fontSize: 13, // Increased from 12
            color: theme.colors.filterChipText,
            opacity: 0.8,
            lineHeight: 18, // Increased from 16
          }}
          numberOfLines={2} // Reduced from 3 to 2
          ellipsizeMode="tail" // Better overflow handling
        >
          {subText}
        </Text>
      </View>

      <TouchableOpacity
        onPress={onRemove}
        style={{
          justifyContent: 'center',
          alignSelf: 'flex-start', // Keep close button at top
        }}>
        <Image
          source={require('../../assets/images/delete.png')}
          style={{
            width: 20,
            height: 20,
            tintColor: theme.colors.filterChipText,
          }}
        />
      </TouchableOpacity>
    </View>
  );
};

export default FilterChip;
