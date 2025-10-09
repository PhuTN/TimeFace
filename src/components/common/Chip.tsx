import React from 'react';
import {View, Text} from 'react-native';
import {useUIFactory} from '../../ui/factory/useUIFactory';

type RequestStatus = 'approved' | 'rejected' | 'pending';

interface ChipProps {
  status?: RequestStatus;
  text?: string;
}

const Chip: React.FC<ChipProps> = ({status, text}) => {
  const {loading, theme, lang} = useUIFactory();
  if (loading || !theme || !lang) {
    return;
  }

  const getStatusColor = (status: RequestStatus): string => {
    switch (status) {
      case 'approved':
        return theme.colors.approved;
      case 'rejected':
        return theme.colors.rejected;
      case 'pending':
        return theme.colors.pending;
      default:
        return theme.colors.border;
    }
  };

  const displayText = status ? lang.t(status) : text || '';
  const bgColor = status ? getStatusColor(status) : theme.colors.border;

  return (
    <View
      style={{
        backgroundColor: bgColor,
        paddingHorizontal: 12,
        paddingVertical: 4,
        borderRadius: 5,
        marginRight: 8,
        shadowColor: '#000',
        shadowOffset: {width: 0, height: 1},
        shadowOpacity: 0.2,
        shadowRadius: 2,
        elevation: 2,
        maxWidth: 160,
      }}>
      <Text
        style={{
          fontSize: 12,
          fontWeight: 600,
          color: theme.colors.text,
        }}>
        {displayText}
      </Text>
    </View>
  );
};

export default Chip;
