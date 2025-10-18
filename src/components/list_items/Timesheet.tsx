import React from 'react';
import {View, Text, Image} from 'react-native';
import {useUIFactory} from '../../ui/factory/useUIFactory';

interface TimesheetProps {
  avatarSource: any;
  name: string;
  position: string;
}

const Timesheet: React.FC<TimesheetProps> = ({
  avatarSource,
  name,
  position,
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
      </View>
    </View>
  );
};

export default Timesheet;
