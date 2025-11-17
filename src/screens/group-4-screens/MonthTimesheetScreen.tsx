import React from 'react';
import {View, SafeAreaView, ScrollView} from 'react-native';
import {useUIFactory} from '../../ui/factory/useUIFactory';
import Header2 from '../../components/common/Header2';
import FilterBar from '../../components/common/FilterBar';
import MonthTimesheet from '../../components/list_items/employe-list-items/MonthTimesheet';
import MonthFilterModal, {
  MonthFilters,
} from '../../components/modals/filter-modals/MonthFilterModal';
import {useFilterSystem, FilterChipData} from '../../hooks/useFilterSystem';

// Fake data for demonstration
const fakeMonthTimesheets = [
  {
    id: '1',
    month: 10,
    year: 2025,
    workingDays: 22,
    unpaidLeaveDays: 0,
    monthlySalary: 15000000,
  },
  {
    id: '2',
    month: 9,
    year: 2025,
    workingDays: 21,
    unpaidLeaveDays: 1,
    monthlySalary: 14500000,
  },
  {
    id: '3',
    month: 8,
    year: 2025,
    workingDays: 23,
    unpaidLeaveDays: 0,
    monthlySalary: 15500000,
  },
];

const MonthTimesheetScreen: React.FC = () => {
  const {loading, theme, lang} = useUIFactory();

  const {
    activeFilters,
    isModalVisible,
    openModal,
    closeModal,
    applyFilters,
    removeFilter,
  } = useFilterSystem<MonthFilters>();

  if (loading || !theme || !lang) {
    return null;
  }

  const isDark = theme.name === 'dark';
  const isEnglish = lang.code === 'en';

  return (
    <SafeAreaView
      style={{flex: 1, backgroundColor: theme.colors.lightGrayBackground}}>
      <Header2 title={lang.t('monthTimesheetTitle')} theme={theme} />

      <ScrollView
        contentContainerStyle={{
          padding: 16,
          paddingBottom: 24,
          gap: 16,
        }}
        showsVerticalScrollIndicator={false}>
        <FilterBar
          title={lang.t('filterByMonth')}
          onFilterPress={openModal}
          activeFilters={activeFilters}
          onRemoveFilter={removeFilter}
          theme={theme}
        />

        {/* Month Timesheets List */}
        <View style={{gap: 12}}>
          {fakeMonthTimesheets.map(item => (
            <MonthTimesheet
              key={item.id}
              month={item.month}
              year={item.year}
              workingDays={item.workingDays}
              unpaidLeaveDays={item.unpaidLeaveDays}
              monthlySalary={item.monthlySalary}
            />
          ))}
        </View>
      </ScrollView>

      {/* Filter Modal */}
      <MonthFilterModal
        visible={isModalVisible}
        onClose={closeModal}
        onApplyFilters={(filters: MonthFilters) => {
          const chips: FilterChipData[] = [];

          if (filters.startMonth) {
            const formatDate = (date: Date) => {
              const month = String(date.getMonth() + 1).padStart(2, '0');
              const year = date.getFullYear();
              return `${month}/${year}`;
            };
            chips.push({
              id: 'startMonth',
              label: 'Tháng bắt đầu',
              subLabel: formatDate(filters.startMonth),
              value: filters.startMonth.toISOString(),
            });
          }

          if (filters.endMonth) {
            const formatDate = (date: Date) => {
              const month = String(date.getMonth() + 1).padStart(2, '0');
              const year = date.getFullYear();
              return `${month}/${year}`;
            };
            chips.push({
              id: 'endMonth',
              label: 'Tháng kết thúc',
              subLabel: formatDate(filters.endMonth),
              value: filters.endMonth.toISOString(),
            });
          }

          applyFilters(filters, chips);
        }}
      />
    </SafeAreaView>
  );
};

export default MonthTimesheetScreen;
