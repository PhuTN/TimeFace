import React, {useEffect, useMemo, useState} from 'react';
import {
  ActivityIndicator,
  SafeAreaView,
  ScrollView,
  Text,
  View,
} from 'react-native';
import {useUIFactory} from '../../ui/factory/useUIFactory';
import HeaderBar from '../../components/common/HeaderBar';
import FilterBar from '../../components/common/FilterBar';
import Header2 from '../../components/common/Header2';
import MonthTimesheet from '../../components/list_items/employe-list-items/MonthTimesheet';
import MonthFilterModal, {
  MonthFilters,
} from '../../components/modals/filter-modals/MonthFilterModal';
import {FilterChipData, useFilterSystem} from '../../hooks/useFilterSystem';

// ✅ API
import {User} from '../../api/endpoint/user';
import {apiHandle} from '../../api/apihandle';

type MonthTimesheetItem = {
  id?: string;
  month: number;
  year: number;
  workingDays: number;
  unpaidLeaveDays?: number; // FE dùng field này
  unpaidDays?: number; // BE có thể trả field này
  monthlySalary?: number; // FE dùng field này
  netSalary?: number; // BE có thể trả field này
};

const MonthTimesheetScreen: React.FC<any> = ({route, navigation}: any) => {
  const {loading, theme, lang} = useUIFactory();

  // ✅ nhận employeeId từ navigate
  const employeeId: string = route?.params?.employeeId ?? 'me';
  const employeeName: string =
    route?.params?.employeeName ??
    (employeeId === 'me' ? 'Bản thân tôi' : 'Nhân viên');
  const isMe = employeeId === 'me';

  const {
    activeFilters,
    isModalVisible,
    openModal,
    closeModal,
    applyFilters,
    removeFilter,
  } = useFilterSystem<MonthFilters>();

  const [months, setMonths] = useState<MonthTimesheetItem[]>([]);
  const [fetching, setFetching] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // ✅ Hook MUST chạy trước mọi return
  const filteredMonths = useMemo(() => {
    const now = new Date();
    const currentIdx = now.getFullYear() * 12 + now.getMonth(); // 0-based month

    const start = activeFilters?.find(c => c.id === 'startMonth')?.value;
    const end = activeFilters?.find(c => c.id === 'endMonth')?.value;

    const startDate = start ? new Date(start) : null;
    const endDate = end ? new Date(end) : null;

    const toIdx = (y: number, m: number) => y * 12 + (m - 1);
    const startIdx = startDate
      ? toIdx(startDate.getFullYear(), startDate.getMonth() + 1)
      : null;
    const endIdx = endDate
      ? toIdx(endDate.getFullYear(), endDate.getMonth() + 1)
      : null;

    const sorted = [...months].sort((a, b) => {
      if (a.year !== b.year) return b.year - a.year;
      return b.month - a.month;
    });

    return sorted.filter(it => {
      const idx = toIdx(it.year, it.month);
      // Chỉ hiển thị khi tháng đã kết thúc (nhỏ hơn tháng hiện tại)
      if (idx >= currentIdx) return false;

      if (startIdx !== null && idx < startIdx) return false;
      if (endIdx !== null && idx > endIdx) return false;
      return true;
    });
  }, [months, activeFilters]);

  // ✅ CALL API HERE
  useEffect(() => {
    if (loading || !theme || !lang) return;

    let mounted = true;

    const run = async () => {
      setFetching(true);
      setErrorMsg(null);

      const endpoint = isMe
        ? User.GetMyTimesheetMonths
        : User.GetUserTimesheetMonths(employeeId);

      const {status, res} = await apiHandle.callApi(endpoint).asPromise();

      if (!mounted) return;

      if (status.isError) {
        setErrorMsg(status.errorMessage ?? 'Không lấy được dữ liệu bảng công');
        setMonths([]);
      } else {
        setMonths(Array.isArray(res) ? res : []);
      }

      setFetching(false);
    };

    run();

    return () => {
      mounted = false;
    };
  }, [employeeId, isMe, loading, theme, lang]);

  // ✅ return sau khi tất cả hooks đã chạy
  if (loading || !theme || !lang) {
    return null;
  }

  const headerTitle = employeeName
    ? `${lang.t('monthTimesheetTitle')} - ${employeeName}`
    : lang.t('monthTimesheetTitle');

  return (
    <SafeAreaView style={{flex: 1, backgroundColor: theme.colors.background}}>
      <HeaderBar title={lang.t('monthTimesheetTitle')} isShowBackButton />

      <ScrollView
        contentContainerStyle={{
          padding: 16,
          gap: 12,
        }}
        showsVerticalScrollIndicator={false}>
        <FilterBar
          title={lang.t('filterByMonth')}
          onFilterPress={openModal}
          activeFilters={activeFilters}
          onRemoveFilter={removeFilter}
          theme={theme}
        />

        {/* ✅ Loading */}
        {fetching && (
          <View style={{paddingVertical: 16, alignItems: 'center', gap: 8}}>
            <ActivityIndicator />
            <Text style={{color: theme.colors.mutedText}}>
              {lang.code === 'vi' ? 'Đang tải dữ liệu...' : 'Loading...'}
            </Text>
          </View>
        )}

        {/* ✅ Error */}
        {!fetching && !!errorMsg && (
          <View
            style={{
              padding: 12,
              borderRadius: 12,
              borderWidth: 1,
              borderColor: theme.colors.borderLight,
            }}>
            <Text style={{color: theme.colors.text}}>{errorMsg}</Text>
          </View>
        )}

        {/* ✅ Empty */}
        {!fetching && !errorMsg && filteredMonths.length === 0 && (
          <View
            style={{
              padding: 12,
              borderRadius: 12,
              borderWidth: 1,
              borderColor: theme.colors.borderLight,
            }}>
            <Text style={{color: theme.colors.mutedText}}>
              {lang.code === 'vi'
                ? 'Chưa có dữ liệu bảng công.'
                : 'No timesheet data.'}
            </Text>
          </View>
        )}

        {/* ✅ Month Timesheets List */}
        {!fetching &&
          !errorMsg &&
          filteredMonths.map((item, index) => (
            <MonthTimesheet
              key={item.id ?? `${item.year}-${item.month}-${index}`}
              month={item.month}
              year={item.year}
              workingDays={item.workingDays}
              unpaidLeaveDays={item.unpaidLeaveDays ?? item.unpaidDays ?? 0}
              monthlySalary={item.monthlySalary ?? item.netSalary ?? 0}
              onPress={() => {
                navigation.navigate('DailyRecord', {
                  employeeId,
                  year: item.year,
                  month: item.month,
                  employeeName,
                });
              }}
            />
          ))}
      </ScrollView>

      {/* Filter Modal */}
      <MonthFilterModal
        visible={isModalVisible}
        onClose={closeModal}
        onApplyFilters={(filters: MonthFilters) => {
          const chips: FilterChipData[] = [];

          const formatDate = (date: Date) => {
            const m = String(date.getMonth() + 1).padStart(2, '0');
            const y = date.getFullYear();
            return `${m}/${y}`;
          };

          if (filters.startMonth) {
            chips.push({
              id: 'startMonth',
              label: 'Tháng bắt đầu',
              subLabel: formatDate(filters.startMonth),
              value: filters.startMonth.toISOString(),
            });
          }

          if (filters.endMonth) {
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
