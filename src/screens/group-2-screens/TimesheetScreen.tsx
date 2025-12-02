import {View, ScrollView, SafeAreaView, Text, Switch} from 'react-native';
import {useState} from 'react';
import {useUIFactory} from '../../ui/factory/useUIFactory';
import {useFilterSystem} from '../../hooks/useFilterSystem';
import FilterBar from '../../components/common/FilterBar';
import EmployeeFilterModal, {
  EmployeeFilters,
} from '../../components/modals/filter-modals/TimesheetFilterModal';
import Timesheet from '../../components/list_items/Timesheet';
import Header2 from '../../components/common/Header2';
import TimesheetDetailModal, {
  TimesheetDetail,
} from '../../components/modals/detail-modals/TimesheetDetailModal';

export default function TimesheetScreen() {
  const {loading, theme, lang} = useUIFactory();
  const {
    activeFilters,
    isModalVisible,
    openModal,
    closeModal,
    applyFilters,
    removeFilter,
  } = useFilterSystem<EmployeeFilters>();

  const [selectedTimesheet, setSelectedTimesheet] =
    useState<TimesheetDetail | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);

  console.log('TimesheetScreen - isModalVisible:', isModalVisible);

  if (loading || !theme || !lang) {
    return null;
  }

  // Enhanced mock data with full details
  const mockTimesheets: TimesheetDetail[] = [
    {
      avatarSource: require('../../assets/images/examples/avatar1.png'),
      name: 'Nguyễn Văn A',
      position: 'Developer',
      department: 'Phòng IT',
      month: 'Tháng 10',
      year: 2024,
      totalWorkingDays: 22,
      actualWorkingDays: 20,
      lateCount: 2,
      absentCount: 1,
      overtimeHours: 8,
      leaveCount: 1,
    },
    {
      avatarSource: require('../../assets/images/examples/avatar2.png'),
      name: 'Trần Thị B',
      position: 'Designer',
      department: 'Phòng Thiết Kế',
      month: 'Tháng 10',
      year: 2024,
      totalWorkingDays: 22,
      actualWorkingDays: 21,
      lateCount: 1,
      absentCount: 0,
      overtimeHours: 6,
      leaveCount: 0,
    },
    {
      avatarSource: require('../../assets/images/examples/avatar3.png'),
      name: 'Lê Văn C',
      position: 'Manager',
      department: 'Phòng Quản Lý',
      month: 'Tháng 10',
      year: 2024,
      totalWorkingDays: 22,
      actualWorkingDays: 22,
      lateCount: 0,
      absentCount: 0,
      overtimeHours: 12,
      leaveCount: 0,
    },
  ];

  const handleTimesheetPress = (timesheet: TimesheetDetail) => {
    setSelectedTimesheet(timesheet);
    setShowDetailModal(true);
  };

  const handleCloseDetailModal = () => {
    setShowDetailModal(false);
    setSelectedTimesheet(null);
  };

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

  return (
    <SafeAreaView style={{flex: 1, backgroundColor: theme.colors.background}}>
      <Header2 title={lang.t('timesheetTitle')} theme={theme} />

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
          {mockTimesheets.map((timesheet, index) => (
            <Timesheet
              key={index}
              avatarSource={timesheet.avatarSource}
              name={timesheet.name}
              position={timesheet.position}
              onPress={() => handleTimesheetPress(timesheet)}
            />
          ))}
        </View>
      </ScrollView>

      <EmployeeFilterModal
        visible={isModalVisible}
        onClose={closeModal}
        onApplyFilters={handleApplyFilters}
      />

      <TimesheetDetailModal
        visible={showDetailModal}
        onClose={handleCloseDetailModal}
        timesheet={selectedTimesheet}
        theme={theme}
        lang={lang}
      />
    </SafeAreaView>
  );
}
