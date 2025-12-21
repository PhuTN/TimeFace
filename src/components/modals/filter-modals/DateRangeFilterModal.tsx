import React, {useState} from 'react';
import {View, Text, StyleSheet, ScrollView} from 'react-native';
import {useUIFactory} from '../../../ui/factory/useUIFactory';
import BottomSheetModal from '../../common/BottomSheetModal';
import LabeledDate from '../../common/LabeledDate';
import ButtonFilter from '../../common/ButtonFilter';

interface DateRangeFilterModalProps {
  visible: boolean;
  onClose: () => void;
  onApplyFilters: (filters: DateRangeFilters) => void;
}

export interface DateRangeFilters {
  startDate: Date | null;
  endDate: Date | null;
}

const DateRangeFilterModal: React.FC<DateRangeFilterModalProps> = ({
  visible,
  onClose,
  onApplyFilters,
}) => {
  const {loading, theme, lang} = useUIFactory();

  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);

  if (loading || !theme || !lang) {
    return null;
  }

  const handleClearFilters = () => {
    setStartDate(null);
    setEndDate(null);
  };

  const handleApplyFilters = () => {
    onApplyFilters({
      startDate,
      endDate,
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
            <Text style={S.title}>
              {lang.t('filterByDate') || 'Lọc theo ngày'}
            </Text>

            <Row>
              <LabeledDate
                label={lang.t('startDate') || 'Ngày bắt đầu'}
                date={startDate}
                onChange={setStartDate}
                theme={theme}
              />

              <LabeledDate
                label={lang.t('endDate') || 'Ngày kết thúc'}
                date={endDate}
                onChange={setEndDate}
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

export default DateRangeFilterModal;
