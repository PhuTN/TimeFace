import React from 'react';
import {View, ScrollView, SafeAreaView, Text, Switch} from 'react-native';
import {useUIFactory} from '../../ui/factory/useUIFactory';
import {setUIState} from '../../ui/factory/selector';
import {useFilterSystem} from '../../hooks/useFilterSystem';
import FilterBar from '../../components/common/FilterBar';
import OTRequestFilterModal, {
  OTRequestFilters,
} from '../../components/modals/filter-modals/OTRequestFilterModal';
import OTRequest from '../../components/list_items/OTRequest';
import Header2 from '../../components/common/Header2';

export default function OTRequestsScreen() {
  const {loading, theme, lang} = useUIFactory();
  const {
    activeFilters,
    isModalVisible,
    openModal,
    closeModal,
    applyFilters,
    removeFilter,
  } = useFilterSystem<OTRequestFilters>();

  console.log('OTRequestsScreen - isModalVisible:', isModalVisible);

  if (loading || !theme || !lang) {
    return null;
  }

  // Mock data - replace with actual data
  const mockRequests = [
    {
      id: '1',
      avatarSource: require('../../assets/images/examples/avatar1.png'),
      name: 'Nguyễn Văn A',
      position: 'Developer',
      status: 'approved' as const,
      code: 'OT-001',
      date: '12/10/2024',
      time: '18:00 - 20:00',
      createdAt: '10/10/2024',
    },
    {
      id: '2',
      avatarSource: require('../../assets/images/examples/avatar2.png'),
      name: 'Trần Thị B',
      position: 'Designer',
      status: 'pending' as const,
      code: 'OT-002',
      date: '15/10/2024',
      time: '19:00 - 21:00',
      createdAt: '13/10/2024',
    },
    {
      id: '3',
      avatarSource: require('../../assets/images/examples/avatar3.png'),
      name: 'Lê Văn C',
      position: 'Manager',
      status: 'rejected' as const,
      code: 'OT-003',
      date: '18/10/2024',
      time: '17:00 - 19:00',
      createdAt: '16/10/2024',
    },
  ];

  const handleApplyFilters = (filters: OTRequestFilters) => {
    // Format filters into FilterChipData
    const formattedFilters = [];

    if (filters.ticketCode) {
      formattedFilters.push({
        id: 'ticketCode',
        label: lang.t('id_form_label'),
        subLabel: filters.ticketCode,
        value: 'ticketCode',
      });
    }

    if (filters.employeeName) {
      formattedFilters.push({
        id: 'employeeName',
        label: lang.t('employee_name_label'),
        subLabel: filters.employeeName,
        value: 'employeeName',
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

    if (filters.department && filters.department.value !== 'all') {
      formattedFilters.push({
        id: 'department',
        label: lang.t('department_label'),
        subLabel: filters.department.label,
        value: 'department',
      });
    }

    if (filters.approvalStatus && filters.approvalStatus.value !== 'all') {
      formattedFilters.push({
        id: 'approvalStatus',
        label: lang.t('approval_status_label'),
        subLabel: filters.approvalStatus.label,
        value: 'approvalStatus',
      });
    }

    if (filters.createdDate) {
      const dateStr = filters.createdDate.toLocaleDateString('vi-VN');
      formattedFilters.push({
        id: 'createdDate',
        label: lang.t('created_date_label'),
        subLabel: dateStr,
        value: 'createdDate',
      });
    }

    if (filters.otDate) {
      const dateStr = filters.otDate.toLocaleDateString('vi-VN');
      formattedFilters.push({
        id: 'otDate',
        label: lang.t('otDate'),
        subLabel: dateStr,
        value: 'otDate',
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
      <Header2 title={lang.t('otRequestTitle')} theme={theme} />

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
          title={lang.t('recentOTDate')}
          onFilterPress={openModal}
          theme={theme}
          activeFilters={activeFilters}
          onRemoveFilter={removeFilter}
        />

        {/* Request List */}
        <View style={{gap: 12, marginTop: 8}}>
          {mockRequests.map(request => (
            <OTRequest
              key={request.id}
              avatarSource={request.avatarSource}
              name={request.name}
              position={request.position}
              status={request.status}
              code={request.code}
              date={request.date}
              time={request.time}
              createdAt={request.createdAt}
            />
          ))}
        </View>
      </ScrollView>

      <OTRequestFilterModal
        visible={isModalVisible}
        onClose={closeModal}
        onApplyFilters={handleApplyFilters}
      />
    </SafeAreaView>
  );
}
