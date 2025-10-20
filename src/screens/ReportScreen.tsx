import DateTimePicker from '@react-native-community/datetimepicker';
import {useState} from 'react';
import {
  Platform,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import Feather from 'react-native-vector-icons/Feather';

import EmployeeList, {Employee} from '../components/attendance/EmployeeList';
import StatsCards from '../components/attendance/StatsCards';
import AttendanceAreaChart from '../components/charts/AttendanceAreaChart';
import PieWithLabels, {Slice} from '../components/charts/PieWithLabels';
import WeeklyLineChart from '../components/charts/WeeklyLineChart';
import Footer from '../components/common/Footer';
import HeaderBar from '../components/common/HeaderBar';

function fmt(d: Date) {
  const dd = String(d.getDate()).padStart(2, '0');
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const yyyy = d.getFullYear();
  return `${dd}/${mm}/${yyyy}`;
}

// const COLORS = {
//   ontime: '#00CFE8', // cyan
//   withPermit: '#B28DFF', // tím
//   noPermit: '#F04BA0', // hồng
//   late: '#FFA51F', // cam
//   leaveEarly: '#FF4D61', // đỏ (nếu cần thêm)
// };

export default function ReportScreen() {
  const insets = useSafeAreaInsets();
  const [activeTab, setActiveTab] = useState<number>(2);
  const [selectedStat, setSelectedStat] = useState<
    'onTime' | 'late' | 'leaveEarly' | 'withPermit' | 'withoutPermit'
  >('onTime');

  // date state + picker
  const [date, setDate] = useState<Date>(new Date(2025, 8, 20)); // 20/09/2025
  const [showPicker, setShowPicker] = useState(false);
  const onChangeDate = (_: any, selected?: Date) => {
    if (Platform.OS === 'android') setShowPicker(false);
    if (selected) setDate(selected);
  };

  const pie: Slice[] = [
    {name: 'Đúng giờ', value: 67, color: '#00D4FF'},
    {name: 'Đi trễ', value: 27, color: '#FF9500'},
    {name: 'Không phép', value: 21, color: '#EC4899'},
    {name: 'Có phép', value: 11, color: '#A78BFA'},
  ];

  const employees: Employee[] = [
    {
      id: 1,
      name: 'Keneth Conroy',
      role: 'UI UX Designer',
      avatar: {uri: 'https://i.pravatar.cc/100?img=12'},
      lateCount: 120,
      latePercent: 25,
      notePrefix: 'Số phút đi trễ:',
    },
    {
      id: 2,
      name: 'Bill Gaston',
      role: 'Full Stack Engineer',
      avatar: {uri: 'https://i.pravatar.cc/100?img=65'},
      lateCount: 120,
      latePercent: 25,
      notePrefix: 'Số phút về sớm:',
    },
    {
      id: 3,
      name: 'Ruslan Kosinov',
      role: 'Digital Marketing',
      avatar: {uri: 'https://i.pravatar.cc/100?img=33'},
      status: 'Xin nghỉ lý do: Bị cảm sốt',
    },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#F5F7FA" />

      <HeaderBar title="BÁO CÁO THỐNG KÊ" topInset={insets.top} />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}>
        {/* ---------- Thống kê ngày + lịch ---------- */}
        <View style={styles.dateRow}>
          <Text style={styles.dateLabel}>Thống kê ngày</Text>

          <View style={styles.dateChip}>
            <Text style={styles.dateChipText}>{fmt(date)}</Text>
          </View>

          <TouchableOpacity
            style={styles.calendarBtn}
            onPress={() => setShowPicker(true)}>
            <Feather name="calendar" size={16} color="#6B7EFF" />
          </TouchableOpacity>
        </View>
        <Text style={styles.groupNote}>Nhóm GS - 10 thành viên</Text>

        {showPicker && (
          <DateTimePicker
            value={date}
            mode="date"
            display={Platform.OS === 'ios' ? 'inline' : 'default'}
            onChange={onChangeDate}
          />
        )}

        <StatsCards
          selectedKey={selectedStat}
          onSelect={setSelectedStat}
          worked={1}
          absent={5}
          onTime={5}
          late={2}
          leaveEarly={2}
          withPermit={2}
          withoutPermit={1}
        />

        <View style={[styles.chartCard, styles.cardShadow]}>
          <View style={{alignItems: 'center', marginBottom: 8}}>
            <PieWithLabels data={pie} />
          </View>

          <View style={styles.legend}>
            <View style={styles.legendRow}>
              {[
                {label: 'Đúng giờ', color: '#00D4FF'},
                {label: 'Có phép', color: '#A78BFA'},
                {label: 'Không phép', color: '#EC4899'},
                {label: 'Đi trễ', color: '#FF9500'},
                {label: 'Về sớm', color: '#FF3B30'},
              ].map((it, idx) => (
                <View key={idx} style={styles.legendItem}>
                  <View style={[styles.legendRing, {borderColor: it.color}]} />
                  <Text style={styles.legendText}>{it.label}</Text>
                </View>
              ))}
            </View>
          </View>
        </View>

        <EmployeeList employees={employees} />

        <View style={[styles.bottomChartSection, styles.cardShadow]}>
          <View style={styles.bottomHeader}>
            <Text style={styles.chartTitle}>Biểu đồ thống kê</Text>
            <View style={styles.chip}>
              <Text style={styles.chipText}>Weekly ▾</Text>
            </View>
          </View>
          <WeeklyLineChart />
        </View>
        <View style={[styles.bottomChartSection, styles.cardShadow]}>
          <View style={styles.bottomHeader}>
            <Text style={styles.chartTitle}>Biểu đồ thống kê</Text>
          </View>

          <AttendanceAreaChart />
        </View>
      </ScrollView>

      <Footer
        activeIndex={activeTab}
        onPress={(i: number) => setActiveTab(i)}
      />
    </SafeAreaView>
  );
}

/* -------------------- styles -------------------- */
const styles = StyleSheet.create({
  container: {flex: 1, backgroundColor: '#F5F7FA'},
  scrollView: {flex: 1},
  scrollContent: {paddingHorizontal: 16, paddingBottom: 24},

  // date header like hình 2
  dateRow: {flexDirection: 'row', alignItems: 'center', marginTop: 8},
  dateLabel: {
    fontSize: 14,
    color: '#1A1A1A',
    fontWeight: '700',
    marginRight: 8,
  },
  dateChip: {
    backgroundColor: '#ECEFF3',
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  dateChipText: {fontSize: 13, fontWeight: '700', color: '#1A1A1A'},
  calendarBtn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    marginLeft: 8,
    backgroundColor: '#EEF2FF',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 4,
    shadowOffset: {width: 0, height: 2},
    elevation: 2,
  },
  groupNote: {fontSize: 12, color: '#7B8794', marginTop: 4, marginBottom: 12},

  chartCard: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 20,
    paddingVertical: 20,
    borderRadius: 16,
    marginBottom: 16,
  },
  legend: {marginTop: 8},
  legendRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 18,
    justifyContent: 'center',
  },
  legendItem: {flexDirection: 'row', alignItems: 'center', gap: 6},
  legendRing: {
    width: 14,
    height: 14,
    borderRadius: 7,
    borderWidth: 2,
    backgroundColor: '#FFFFFF',
  },
  legendText: {fontSize: 13, color: '#666'},

  bottomChartSection: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 20,
    paddingVertical: 20,
    borderRadius: 16,
  },
  bottomHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  chartTitle: {fontSize: 16, fontWeight: '700', color: '#1A1A1A'},
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
    backgroundColor: '#F5F7FA',
  },
  chipText: {fontSize: 12, fontWeight: '600', color: '#1A1A1A'},

  cardShadow: {
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },
});
