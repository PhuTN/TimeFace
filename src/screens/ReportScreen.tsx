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

import DatePicker from 'react-native-date-picker';   // ⭐ NEW

import EmployeeList, {Employee} from '../components/attendance/EmployeeList';
import StatsCards from '../components/attendance/StatsCards';
import AttendanceAreaChart from '../components/charts/AttendanceAreaChart';
import PieWithLabels, {Slice} from '../components/charts/PieWithLabels';
import Footer from '../components/common/Footer';
import HeaderBar from '../components/common/HeaderBar';

function fmt(d: Date) {
  const dd = String(d.getDate()).padStart(2, '0');
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const yyyy = d.getFullYear();
  return `${dd}/${mm}/${yyyy}`;
}

export default function ReportScreen() {
  const insets = useSafeAreaInsets();
  const [activeTab, setActiveTab] = useState<number>(2);
  const [selectedStat, setSelectedStat] = useState<
    'onTime' | 'late' | 'leaveEarly' | 'withPermit' | 'withoutPermit'
  >('onTime');

  // 📅 Date state
  const [date, setDate] = useState<Date>(new Date(2025, 8, 20));
  const [openPicker, setOpenPicker] = useState(false);

  // Pie data
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

  const employeesBy = {
    onTime: [
      { id: 'ot1', name: 'Keneth Conroy', role: 'UI UX Designer', avatar: {uri: 'https://i.pravatar.cc/100?img=12'}, lateCount: 0, latePercent: 0, notePrefix: 'Số phút đi trễ:' },
      { id: 'ot2', name: 'Bill Gaston', role: 'Full Stack Engineer', avatar: {uri: 'https://i.pravatar.cc/100?img=65'}, lateCount: 0, latePercent: 0, notePrefix: 'Số phút đi trễ:' },
      { id: 'ot3', name: 'Luna Bright', role: 'Product Manager', avatar: {uri: 'https://i.pravatar.cc/100?img=47'}, lateCount: 0, latePercent: 0, notePrefix: 'Số phút đi trễ:' },
    ],
    late: [
      { id: 'lt1', name: 'Keneth Conroy', role: 'UI UX Designer', avatar: {uri: 'https://i.pravatar.cc/100?img=12'}, lateCount: 120, latePercent: 25, notePrefix: 'Số phút đi trễ:' },
      { id: 'lt2', name: 'Bill Gaston', role: 'Full Stack Engineer', avatar: {uri: 'https://i.pravatar.cc/100?img=65'}, lateCount: 75, latePercent: 15, notePrefix: 'Số phút đi trễ:' },
    ],
    leaveEarly: [
      { id: 'le1', name: 'Zack Oliver', role: 'QA Engineer', avatar: {uri: 'https://i.pravatar.cc/100?img=19'}, lateCount: 40, latePercent: 10, notePrefix: 'Số phút về sớm:' },
      { id: 'le2', name: 'Emma Watson', role: 'iOS Developer', avatar: {uri: 'https://i.pravatar.cc/100?img=32'}, lateCount: 22, latePercent: 6, notePrefix: 'Số phút về sớm:' },
    ],
    withPermit: [
      { id: 'wp1', name: 'Ruslan Kosinov', role: 'Digital Marketing', avatar: {uri: 'https://i.pravatar.cc/100?img=33'}, status: 'Xin nghỉ lý do: Bị cảm sốt' },
      { id: 'wp2', name: 'Amy Star', role: 'HR Executive', avatar: {uri: 'https://i.pravatar.cc/100?img=66'}, status: 'Xin nghỉ lý do: Về quê có việc' },
    ],
    withoutPermit: [
      { id: 'wop1', name: 'John Doe', role: 'Intern', avatar: {uri: 'https://i.pravatar.cc/100?img=11'}, status: 'Vắng không phép' },
    ],
  };

  const listTitleBy = {
    onTime: 'Danh sách nhân viên đúng giờ',
    late: 'Danh sách nhân viên đi trễ',
    leaveEarly: 'Danh sách nhân viên về sớm',
    withPermit: 'Danh sách nhân viên có phép',
    withoutPermit: 'Danh sách nhân viên không phép',
  } as const;

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#F5F7FA" />

      <HeaderBar title="BÁO CÁO THỐNG KÊ" topInset={insets.top} />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}>
        
        {/* ---------- Date Row ---------- */}
        <View style={styles.dateRow}>
          <Text style={styles.dateLabel}>Thống kê ngày</Text>

          <View style={styles.dateChip}>
            <Text style={styles.dateChipText}>{fmt(date)}</Text>
          </View>

          <TouchableOpacity
            style={styles.calendarBtn}
            onPress={() => setOpenPicker(true)}>
            <Feather name="calendar" size={16} color="#6B7EFF" />
          </TouchableOpacity>
        </View>

        <Text style={styles.groupNote}>Nhóm GS - 10 thành viên</Text>

        {/* ❤️ NEW DATE PICKER */}
        <DatePicker
          modal
          mode="date"
          open={openPicker}
          date={date}
          onConfirm={(d) => {
            setOpenPicker(false);
            setDate(d);
          }}
          onCancel={() => setOpenPicker(false)}
        />

        {/* -------- Stats Cards -------- */}
        <StatsCards
          selectedKey={selectedStat}
          onSelect={setSelectedStat}
          worked={employeesBy.onTime.length + employeesBy.late.length + employeesBy.leaveEarly.length}
          absent={employeesBy.withoutPermit.length + employeesBy.withPermit.length}
          onTime={employeesBy.onTime.length}
          late={employeesBy.late.length}
          leaveEarly={employeesBy.leaveEarly.length}
          withPermit={employeesBy.withPermit.length}
          withoutPermit={employeesBy.withoutPermit.length}
        />

        {/* -------- Pie Chart -------- */}
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

        {/* -------- Employees List -------- */}
        <EmployeeList
          title={listTitleBy[selectedStat]}
          employees={employeesBy[selectedStat]}
        />

        {/* -------- Bottom Chart -------- */}
        <View style={[styles.bottomChartSection, styles.cardShadow]}>
          <View style={styles.bottomHeader}>
            <Text style={styles.chartTitle}>Biểu đồ thống kê</Text>
          </View>

          <AttendanceAreaChart />
        </View>
      </ScrollView>

      <Footer activeIndex={activeTab} onPress={(i: number) => setActiveTab(i)} />
    </SafeAreaView>
  );
}

/* -------------------- styles -------------------- */
const styles = StyleSheet.create({
  container: {flex: 1, backgroundColor: '#F5F7FA'},
  scrollView: {flex: 1},
  scrollContent: {paddingHorizontal: 16, paddingBottom: 24},

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

  cardShadow: {
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },
});
