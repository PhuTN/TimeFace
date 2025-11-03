import React, {useEffect, useState} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  FlatList,
  StyleSheet,
  Dimensions,
} from 'react-native';
import Feather from 'react-native-vector-icons/Feather';
import type {Option} from '../../types/common';

type Props = {
  label?: string;
  selected: Option;
  options: Option[];
  onSelect: (o: Option) => void;
  theme: any;
  disabled?: boolean;
};

const LabeledSelect: React.FC<Props> = ({
  label,
  selected,
  options,
  onSelect,
  theme,
  disabled = false,
}) => {
  const [open, setOpen] = useState(false);
  const S = themedStyles(theme);

  useEffect(() => {
    if (disabled && open) {
      setOpen(false);
    }
  }, [disabled, open]);

  return (
    <View style={S.field}>
      {label ? <Text style={S.label}>{label}</Text> : null}
      <TouchableOpacity
        style={[S.inputBox, S.selectBox, disabled ? S.disabled : null]}
        onPress={() => setOpen(true)}
        activeOpacity={disabled ? 1 : 0.7}
        disabled={disabled}>
        <Text style={[S.input, {color: theme.colors.text}]} numberOfLines={1}>
          {selected.label}
        </Text>
        <Feather
          name="chevron-down"
          size={18}
          color={theme.colors.contrastBackground}
        />
      </TouchableOpacity>

      <Modal transparent visible={open} animationType="fade">
        <View style={S.modalBackdrop}>
          <TouchableOpacity
            style={StyleSheet.absoluteFill}
            activeOpacity={1}
            onPress={() => setOpen(false)}
          />
          <View style={S.modalContainer}>
            <View style={S.modalSheet}>
              <Text style={S.modalTitle}>{label}</Text>
              <FlatList
                data={options}
                keyExtractor={item => item.value}
                renderItem={({item}) => (
                  <TouchableOpacity
                    style={S.optionRow}
                    onPress={() => {
                      onSelect(item);
                      setOpen(false);
                    }}>
                    <Text style={S.optionText}>{item.label}</Text>
                    {item.value === selected.value ? (
                      <Feather
                        name="check"
                        size={18}
                        color={theme.colors.contrastBackground}
                      />
                    ) : null}
                  </TouchableOpacity>
                )}
                ItemSeparatorComponent={() => <View style={S.separator} />}
              />
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const {width, height} = Dimensions.get('window');

const themedStyles = (theme: any) =>
  StyleSheet.create({
    field: {flexGrow: 1, flexBasis: '48%', minWidth: '48%'},
    label: {fontSize: 13, color: theme.colors.text, marginBottom: 6},
    inputBox: {
      borderWidth: 2,
      borderColor: theme.colors.border,
      backgroundColor: theme.colors.background,
      borderRadius: 10,
      paddingHorizontal: 14,
      paddingVertical: 14,
      minHeight: 48,
      justifyContent: 'center',
    },
    disabled: {
      opacity: 0.5,
    },
    input: {fontSize: 16, color: theme.colors.text},
    selectBox: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    modalBackdrop: {
      flex: 1,
      backgroundColor: 'rgba(0,0,0,0.3)',
      justifyContent: 'center',
      alignItems: 'center',
    },
    modalContainer: {
      width: '100%',
      alignItems: 'center',
      justifyContent: 'center',
    },
    modalSheet: {
      width: width * 0.9,
      maxHeight: height * 0.6,
      backgroundColor: theme.colors.background,
      borderWidth: 0.8,
      borderColor: theme.colors.contrastBackground,
      borderRadius: 20,
      padding: 16,
    },
    modalTitle: {
      fontSize: 16,
      fontWeight: '600',
      marginBottom: 8,
      color: theme.colors.text,
    },
    optionRow: {
      paddingVertical: 14,
      paddingHorizontal: 4,
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    optionText: {fontSize: 16, color: theme.colors.text},
    separator: {height: 1, backgroundColor: theme.colors.contrastBackground},
  });

export default React.memo(LabeledSelect);
