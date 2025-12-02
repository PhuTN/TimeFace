import React from 'react';
import {View, Text, TouchableOpacity, StyleSheet} from 'react-native';
import {useUIFactory} from '../../ui/factory/useUIFactory';

export type StatusType = 'pending' | 'approved' | 'rejected';

interface StatusToggleButtonsProps {
  selectedStatus: StatusType;
  onStatusChange: (status: StatusType) => void;
}

const StatusToggleButtons: React.FC<StatusToggleButtonsProps> = ({
  selectedStatus,
  onStatusChange,
}) => {
  const {loading, theme, lang} = useUIFactory();

  if (loading || !theme || !lang) {
    return null;
  }

  const statuses: StatusType[] = ['pending', 'approved', 'rejected'];

  const getStatusLabel = (status: StatusType): string => {
    switch (status) {
      case 'pending':
        return lang.t('statusPending');
      case 'approved':
        return lang.t('statusApproved');
      case 'rejected':
        return lang.t('statusRejected');
      default:
        return '';
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background, borderColor: theme.colors.borderLight }]}>
        {statuses.map((status, index) => {
        const isSelected = selectedStatus === status;

        return (
          <TouchableOpacity
            key={status}
            style={[
              styles.button,
              {
                backgroundColor: isSelected ? theme.colors.primary : theme.colors.background,
                borderRadius: 100,
                paddingVertical: 8,
              },
            ]}
            onPress={() => onStatusChange(status)}
            activeOpacity={0.7}>
            <Text
              style={{
                color: isSelected ? theme.colors.background : theme.colors.text,
                fontWeight: isSelected ? '700' : '400',
                fontSize: 14,
              }}>
              {getStatusLabel(status)}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    borderRadius: 100,
    padding: 2,
    borderWidth: 1,
    overflow: 'hidden',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  button: {
    flex: 1,
    borderColor: 'transparent',
    paddingVertical: 10,
    paddingHorizontal: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default StatusToggleButtons;
