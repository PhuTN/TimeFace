import React from 'react';
import {View, ScrollView, SafeAreaView, Text, Switch} from 'react-native';
import {useUIFactory} from '../../ui/factory/useUIFactory';
import {setUIState} from '../../ui/factory/selector';
import {useFilterSystem} from '../../hooks/useFilterSystem';
import FilterBar from '../../components/common/FilterBar';
import EmployeeFilterModal, {
  EmployeeFilters,
} from '../../components/modals/filter-modals/TimesheetFilterModal';
import Timesheet from '../../components/list_items/Timesheet';
import Header2 from '../../components/common/Header2';

export default function TimesheetsScreen() {
  const {loading, theme, lang} = useUIFactory();
  const {
    activeFilters,
    isModalVisible,
    openModal,
    closeModal,
    applyFilters,
    removeFilter,
  } = useFilterSystem<EmployeeFilters>();

  console.log('TimesheetsScreen - isModalVisible:', isModalVisible);

  if (loading || !theme || !lang) {
    return null;
  }

  // Mock data - replace with actual data
  const mockTimesheets = [
    {
      id: '1',
      avatarSource: require('../../assets/images/examples/avatar1.png'),
      name: 'Nguyễn Văn A',
      position: 'Developer',
    },
    {
      id: '2',
      avatarSource: require('../../assets/images/examples/avatar2.png'),
      name: 'Trần Thị B',
      position: 'Designer',
    },
    {
      id: '3',
      avatarSource: require('../../assets/images/examples/avatar3.png'),
      name: 'Lê Văn C',
      position: 'Manager',
    },
  ];

  const handleApplyFilters = (filters: EmployeeFilters) => {
    // Format filters into FilterChipData
    const formattedFilters = [];

    if (filters.employeeName) {
      formattedFilters.push({
        id: 'employeeName',
        label: lang.t('employee_name_label'),
        subLabel: filters.employeeName,
        value: 'employeeName',
      });
    }

    if (filters.department && filters.department.value !== 'all') {
      formattedFilters.push({
        id: 'department',
        label: lang.t('department_label'),
        subLabel: filters.department.label,
        value: 'department',
      });
    }

    if (filters.positionName) {
      formattedFilters.push({
        id: 'positionName',
        label: lang.t('position_name_label'),
        subLabel: filters.positionName,
        value: 'positionName',
      });
    }

    if (filters.sortBy && filters.sortBy.value !== 'default') {
      formattedFilters.push({
        id: 'sortBy',
        label: lang.t('sort_by_label'),
        subLabel: filters.sortBy.label,
        value: 'sortBy',
      });
    }

    applyFilters(filters, formattedFilters);
  };

  const isDark = theme.name === 'dark';
  const isEnglish = lang.code === 'en';

  const handleToggleTheme = () => {
    setUIState({theme: isDark ? 'light' : 'dark'});
  };

  const handleToggleLanguage = () => {
    setUIState({lang: isEnglish ? 'vi' : 'en'});
  };

  return (
    <SafeAreaView
      style={{flex: 1, backgroundColor: theme.colors.background}}>
      <Header2 title={lang.t('timesheetTitle')} theme={theme} />

      {/* Theme and Language Toggle Buttons */}
      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'space-around',
          paddingHorizontal: 16,
          paddingVertical: 12,
          backgroundColor: theme.colors.background,
          borderBottomWidth: 1,
          borderBottomColor: theme.colors.borderLight,
        }}>
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            gap: 8,
          }}>
          <Text style={{color: theme.colors.text, fontSize: 14}}>
            {isDark ? `🌙 ${lang.t('darkMode')}` : `☀️ ${lang.t('lightMode')}`}
          </Text>
          <Switch
            value={isDark}
            onValueChange={handleToggleTheme}
            trackColor={{false: '#767577', true: theme.colors.primary}}
            thumbColor={isDark ? theme.colors.primary : '#f4f3f4'}
          />
        </View>
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            gap: 8,
          }}>
          <Text style={{color: theme.colors.text, fontSize: 14}}>
            {isEnglish ? '🇺🇸 EN' : '🇻🇳 VI'}
          </Text>
          <Switch
            value={isEnglish}
            onValueChange={handleToggleLanguage}
            trackColor={{false: '#767577', true: theme.colors.primary}}
            thumbColor={isEnglish ? theme.colors.primary : '#f4f3f4'}
          />
        </View>
      </View>

      <ScrollView
        contentContainerStyle={{
          padding: 16,
          gap: 12,
        }}
        showsVerticalScrollIndicator={false}>
        <FilterBar
          title={lang.t('employeeName')}
          onFilterPress={openModal}
          theme={theme}
          activeFilters={activeFilters}
          onRemoveFilter={removeFilter}
        />

        {/* Timesheet List */}
        <View style={{gap: 12, marginTop: 8}}>
          {mockTimesheets.map(timesheet => (
            <Timesheet
              key={timesheet.id}
              avatarSource={timesheet.avatarSource}
              name={timesheet.name}
              position={timesheet.position}
            />
          ))}
        </View>
      </ScrollView>

      <EmployeeFilterModal
        visible={isModalVisible}
        onClose={closeModal}
        onApplyFilters={handleApplyFilters}
      />
    </SafeAreaView>
  );
}
