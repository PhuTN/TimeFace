import React from 'react';
import {View, Text, StyleSheet} from 'react-native';
import {SvgXml} from 'react-native-svg';
import {useUIFactory} from '../../ui/factory/useUIFactory';

type FeatureItemProps = {
  text: string;
  color?: string;
};

const FeatureItem: React.FC<FeatureItemProps> = ({text, color}) => {
  const {loading, theme} = useUIFactory();
  if (loading || !theme) {
    return null;
  }

  return (
    <View
      style={{
        backgroundColor: theme.colors.cardBackground || theme.colors.background,
        borderRadius: 12,
        paddingVertical: 8,
        paddingHorizontal: 12,
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: theme.colors.shadow || '#000',
        shadowOpacity: 0.1,
        shadowRadius: 4,
        shadowOffset: {width: 0, height: 1},
        elevation: 2,
        width: 100,
        height: 100,
      }}>
      <View
        style={{
          backgroundColor: color ? `${color}26` : theme.colors.primary + '26',
          borderRadius: 8,
          padding: 8,
          marginBottom: 6,
        }}>
        <SvgXml
          xml={`<svg xmlns="http://www.w3.org/2000/svg" width="256" height="256" viewBox="0 0 24 24" fill="none" stroke="${
            color || theme.colors.primary
          }" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-table2-icon lucide-table-2"><path d="M9 3H5a2 2 0 0 0-2 2v4m6-6h10a2 2 0 0 1 2 2v4M9 3v18m0 0h10a2 2 0 0 0 2-2V9M9 21H5a2 2 0 0 1-2-2V9m0 0h18"/></svg>`}
          width={24}
          height={24}
        />
      </View>
      <Text
        style={{
          fontSize: 14,
          color: theme.colors.mutedText,
          fontWeight: '500',
          textAlign: 'center',
        }}>
        {text}
      </Text>
    </View>
  );
};

export default FeatureItem;
