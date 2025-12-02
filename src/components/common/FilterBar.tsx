import React from 'react';
import {View, Text, TouchableOpacity, ScrollView} from 'react-native';
import {SvgXml} from 'react-native-svg';
import type {Theme} from '../../ui/theme/theme';
import FilterChip from './FilterChip';

export type FilterChipData = {
  id: string;
  label: string;
  subLabel?: string;
  value: string;
};

interface FilterBarProps {
  title: string;
  onFilterPress: () => void;
  theme: Theme;
  activeFilters?: FilterChipData[];
  onRemoveFilter?: (filterId: string) => void;
  children?: React.ReactNode;
}

const FilterBar: React.FC<FilterBarProps> = ({
  title,
  onFilterPress,
  theme,
  activeFilters = [],
  onRemoveFilter,
  children,
}) => {
  const filterIconXml = `<svg width="23" height="23" viewBox="0 0 23 23" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M12.65 3.76367H3.24072" stroke="${theme.colors.text}" stroke-width="1.41139" stroke-linecap="round" stroke-linejoin="round"/>
<path d="M10.7681 17.8774H3.24072" stroke="${theme.colors.text}" stroke-width="1.41139" stroke-linecap="round" stroke-linejoin="round"/>
<path d="M20.1775 17.8774H16.4138" stroke="${theme.colors.text}" stroke-width="1.41139" stroke-linecap="round" stroke-linejoin="round"/>
<path d="M20.1775 10.8203H10.7683" stroke="${theme.colors.text}" stroke-width="1.41139" stroke-linecap="round" stroke-linejoin="round"/>
<path d="M20.1773 3.76367H18.2954" stroke="${theme.colors.text}" stroke-width="1.41139" stroke-linecap="round" stroke-linejoin="round"/>
<path d="M5.12257 10.8203H3.24072" stroke="${theme.colors.text}" stroke-width="1.41139" stroke-linecap="round" stroke-linejoin="round"/>
<path d="M14.0613 1.88184C14.4997 1.88184 14.7189 1.88184 14.8918 1.95346C15.1224 2.04895 15.3056 2.23213 15.4011 2.46269C15.4727 2.6356 15.4727 2.85481 15.4727 3.29322V4.23414C15.4727 4.67256 15.4727 4.89176 15.4011 5.06468C15.3056 5.29523 15.1224 5.47841 14.8918 5.57391C14.7189 5.64553 14.4997 5.64553 14.0613 5.64553C13.6229 5.64553 13.4037 5.64553 13.2307 5.57391C13.0002 5.47841 12.817 5.29523 12.7215 5.06468C12.6499 4.89176 12.6499 4.67256 12.6499 4.23414V3.29322C12.6499 2.85481 12.6499 2.6356 12.7215 2.46269C12.817 2.23213 13.0002 2.04895 13.2307 1.95346C13.4037 1.88184 13.6229 1.88184 14.0613 1.88184Z" stroke="${theme.colors.text}" stroke-width="1.41139" stroke-linecap="round" stroke-linejoin="round"/>
<path d="M12.1797 15.9956C12.6181 15.9956 12.8373 15.9956 13.0102 16.0672C13.2408 16.1627 13.424 16.3459 13.5195 16.5764C13.5911 16.7494 13.5911 16.9686 13.5911 17.407V18.3479C13.5911 18.7863 13.5911 19.0055 13.5195 19.1785C13.424 19.409 13.2408 19.5922 13.0102 19.6877C12.8373 19.7593 12.6181 19.7593 12.1797 19.7593C11.7413 19.7593 11.5221 19.7593 11.3491 19.6877C11.1186 19.5922 10.9354 19.409 10.8399 19.1785C10.7683 19.0055 10.7683 18.7863 10.7683 18.3479V17.407C10.7683 16.9686 10.7683 16.7494 10.8399 16.5764C10.9354 16.3459 11.1186 16.1627 11.3491 16.0672C11.5221 15.9956 11.7413 15.9956 12.1797 15.9956Z" stroke="${theme.colors.text}" stroke-width="1.41139" stroke-linecap="round" stroke-linejoin="round"/>
<path d="M9.35694 8.93896C9.79536 8.93896 10.0146 8.93897 10.1875 9.01059C10.418 9.10608 10.6012 9.28926 10.6967 9.5198C10.7683 9.69274 10.7683 9.91197 10.7683 10.3503V11.2913C10.7683 11.7296 10.7683 11.9489 10.6967 12.1218C10.6012 12.3524 10.418 12.5355 10.1875 12.6311C10.0146 12.7027 9.79536 12.7027 9.35694 12.7027C8.91853 12.7027 8.69932 12.7027 8.52641 12.6311C8.29585 12.5355 8.11267 12.3524 8.01718 12.1218C7.94556 11.9489 7.94556 11.7296 7.94556 11.2913V10.3503C7.94556 9.91197 7.94556 9.69274 8.01718 9.5198C8.11267 9.28926 8.29585 9.10608 8.52641 9.01059C8.69932 8.93897 8.91853 8.93896 9.35694 8.93896Z" stroke="${theme.colors.text}" stroke-width="1.41139" stroke-linecap="round" stroke-linejoin="round"/>
</svg>`;

  return (
    <View style={{gap: 12}}>
      {/* First Row: Title and Filter Button */}
      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}>
        <Text
          style={{
            fontSize: 20,
            fontWeight: '600',
            color: theme.colors.text,
          }}>
          {title}
        </Text>
        <TouchableOpacity
          onPress={onFilterPress}
          style={{
            width: 40,
            height: 40,
            borderRadius: 20,
            backgroundColor: theme.colors.background,
            justifyContent: 'center',
            alignItems: 'center',
          }}
          activeOpacity={0.7}>
          <SvgXml xml={filterIconXml} width={23} height={23} />
        </TouchableOpacity>
      </View>

      {/* Second Row: Active Filter Chips */}
      {activeFilters.length > 0 && (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{
            gap: 8,
            paddingVertical: 4,
          }}>
          {activeFilters.map(filter => (
            <FilterChip
              key={filter.id}
              mainText={filter.label}
              subText={filter.subLabel || ''}
              onRemove={() => onRemoveFilter?.(filter.id)}
              theme={theme}
            />
          ))}
        </ScrollView>
      )}

      {/* Third Row: Custom Children (Optional) */}
      {children && (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{
            gap: 8,
            paddingVertical: 4,
          }}>
          {children}
        </ScrollView>
      )}
    </View>
  );
};

export default FilterBar;
