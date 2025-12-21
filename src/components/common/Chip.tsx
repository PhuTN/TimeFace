import React from 'react';
import {View, Text} from 'react-native';
import {useUIFactory} from '../../ui/factory/useUIFactory';

type RequestStatus =
  | 'approved'
  | 'rejected'
  | 'pending'
  | 'active'
  | 'inactive'
  | 'password_changed'
  | 'waiting_for_password_change'
  | 'do_not_change_password'
  | 'approvedProfile'
  | 'pendingProfile';

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
      case 'active':
        return theme.colors.approved;
      case 'inactive':
        return theme.colors.rejected;
      case 'password_changed':
        return theme.colors.approved;
      case 'waiting_for_password_change':
        return theme.colors.pending;
      case 'do_not_change_password':
        return theme.colors.rejected;
      case 'approvedProfile':
        return theme.colors.approved;

      case 'pendingProfile':
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
        maxWidth: 180,
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
