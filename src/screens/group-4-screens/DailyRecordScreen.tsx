import React from 'react';
import {View, SafeAreaView, ScrollView} from 'react-native';
import {useUIFactory} from '../../ui/factory/useUIFactory';
import Header2 from '../../components/common/Header2';
import FilterBar from '../../components/common/FilterBar';
import DailyRecord from '../../components/list_items/employe-list-items/DailyRecord';
import DateFilterModal, {
  DateFilters,
} from '../../components/modals/filter-modals/DateFilterModal';
import {useFilterSystem, FilterChipData} from '../../hooks/useFilterSystem';

// Fake data for demonstration
const fakeDailyRecords = [
  {
    id: '1',
    date: '2025-10-22',
    totalHours: '08:00',
    checkIn: '09:00 AM',
    checkOut: '5:00 PM',
  },
  {
    id: '2',
    date: '2025-10-21',
    totalHours: '08:30',
    checkIn: '08:30 AM',
    checkOut: '5:00 PM',
  },
  {
    id: '3',
    date: '2025-10-20',
    totalHours: '07:45',
    checkIn: '09:15 AM',
    checkOut: '5:00 PM',
  },
];

const DailyRecordScreen: React.FC = () => {
  const {loading, theme, lang} = useUIFactory();

  const {
    activeFilters,
    isModalVisible,
    openModal,
    closeModal,
    applyFilters,
    removeFilter,
  } = useFilterSystem<DateFilters>();

  if (loading || !theme || !lang) {
    return null;
  }

  // Get current month and year for title
  const currentDate = new Date();
  const currentMonth = String(currentDate.getMonth() + 1).padStart(2, '0');
  const currentYear = currentDate.getFullYear();
  const title = `${lang.t(
    'dailyRecordTitleWithMonth',
  )} ${currentMonth}/${currentYear}`;

  return (
    <SafeAreaView style={{flex: 1, backgroundColor: theme.colors.background}}>
      <Header2 title={title} theme={theme} />

      <ScrollView
        contentContainerStyle={{
          padding: 16,
          gap: 12,
        }}
        showsVerticalScrollIndicator={false}>
        <FilterBar
          title={lang.t('filterByDate')}
          onFilterPress={openModal}
          activeFilters={activeFilters}
          onRemoveFilter={removeFilter}
          theme={theme}
        />

        {/* Daily Records List */}
        {fakeDailyRecords.map(item => (
          <DailyRecord
            key={item.id}
            date={item.date}
            totalHours={item.totalHours}
            checkIn={item.checkIn}
            checkOut={item.checkOut}
          />
        ))}
      </ScrollView>

      {/* Filter Modal */}
      <DateFilterModal
        visible={isModalVisible}
        onClose={closeModal}
        onApplyFilters={(filters: DateFilters) => {
          const chips: FilterChipData[] = [];

          if (filters.startDate) {
            const formatDate = (date: Date) => {
              const day = String(date.getDate()).padStart(2, '0');
              const month = String(date.getMonth() + 1).padStart(2, '0');
              const year = date.getFullYear();
              return `${day}/${month}/${year}`;
            };
            chips.push({
              id: 'startDate',
              label: 'Ngày bắt đầu',
              subLabel: formatDate(filters.startDate),
              value: filters.startDate.toISOString(),
            });
          }

          if (filters.endDate) {
            const formatDate = (date: Date) => {
              const day = String(date.getDate()).padStart(2, '0');
              const month = String(date.getMonth() + 1).padStart(2, '0');
              const year = date.getFullYear();
              return `${day}/${month}/${year}`;
            };
            chips.push({
              id: 'endDate',
              label: 'Ngày kết thúc',
              subLabel: formatDate(filters.endDate),
              value: filters.endDate.toISOString(),
            });
          }

          applyFilters(filters, chips);
        }}
      />
    </SafeAreaView>
  );
};

export default DailyRecordScreen;
