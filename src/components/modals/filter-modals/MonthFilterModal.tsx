import React, {useState, useEffect} from 'react';
import {View, Text, StyleSheet, ScrollView} from 'react-native';
import {useUIFactory} from '../../../ui/factory/useUIFactory';
import BottomSheetModal from '../../common/BottomSheetModal';
import LabeledDate from '../../common/LabeledDate';
import ButtonFilter from '../../common/ButtonFilter';

interface MonthFilterModalProps {
  visible: boolean;
  onClose: () => void;
  onApplyFilters: (filters: MonthFilters) => void;
}

export interface MonthFilters {
  startMonth: Date;
  endMonth: Date;
}

const MonthFilterModal: React.FC<MonthFilterModalProps> = ({
  visible,
  onClose,
  onApplyFilters,
}) => {
  const {loading, theme, lang} = useUIFactory();

  const [startMonth, setStartMonth] = useState<Date>(new Date());
  const [endMonth, setEndMonth] = useState<Date>(new Date());

  if (loading || !theme || !lang) {
    return null;
  }

  const handleClearFilters = () => {
    setStartMonth(new Date());
    setEndMonth(new Date());
  };

  const handleApplyFilters = () => {
    onApplyFilters({
      startMonth,
      endMonth,
    });
    onClose();
  };

  const S = themedStyles(theme);

  return (
    <BottomSheetModal visible={visible} onClose={onClose} maxHeightRatio={0.9}>
      <View
        style={[
          S.container,
          {
            backgroundColor: theme.colors.background,
            borderTopColor: theme.colors.contrastBackground,
            borderTopWidth: 1,
            borderLeftColor: theme.colors.contrastBackground,
            borderLeftWidth: 1,
            borderRightColor: theme.colors.contrastBackground,
            borderRightWidth: 1,
          },
        ]}>
        <ScrollView
          contentContainerStyle={{
            padding: theme.spacing(2),
            paddingBottom: theme.spacing(3),
          }}
          showsVerticalScrollIndicator={false}>
          <View style={S.card}>
            <Text style={S.title}>Lọc theo tháng</Text>

            <Row>
              <LabeledDate
                label="Tháng bắt đầu"
                date={startMonth}
                onChange={setStartMonth}
                theme={theme}
              />

              <LabeledDate
                label="Tháng kết thúc"
                date={endMonth}
                onChange={setEndMonth}
                theme={theme}
              />
            </Row>

            {/* Actions */}
            <View style={S.actions}>
              <ButtonFilter
                text={lang.t('clear_filters')}
                textColor="#000000"
                backgroundColor="#E3F4FF"
                onPress={handleClearFilters}
              />
              <ButtonFilter
                text={lang.t('apply_filters')}
                textColor="#FFFFFF"
                backgroundColor="#6A96EE"
                onPress={handleApplyFilters}
              />
            </View>
          </View>
        </ScrollView>
      </View>
    </BottomSheetModal>
  );
};

function Row({children}: {children: React.ReactNode}) {
  return (
    <View
      style={{
        gap: 12,
        flexDirection: 'row',
        flexWrap: 'wrap',
        marginBottom: 8,
      }}>
      {children}
    </View>
  );
}

const themedStyles = (theme: any) =>
  StyleSheet.create({
    container: {
      borderTopLeftRadius: 20,
      borderTopRightRadius: 20,
      overflow: 'hidden',
    },
    card: {
      backgroundColor: theme.colors.background,
    },
    title: {
      fontSize: 20,
      fontWeight: '700',
      marginBottom: 20,
      textAlign: 'center',
      color: theme.colors.text,
    },
    actions: {
      marginTop: 16,
      flexDirection: 'row',
      justifyContent: 'space-between',
      gap: 12,
    },
  });

export default MonthFilterModal;
