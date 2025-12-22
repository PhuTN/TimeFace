import {useEffect, useState} from 'react';
import {
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
import DatePicker from 'react-native-date-picker';

import EmployeeList from '../components/attendance/EmployeeList';
import StatsCards from '../components/attendance/StatsCards';
import AttendanceAreaChart from '../components/charts/AttendanceAreaChart';
import PieWithLabels, {Slice} from '../components/charts/PieWithLabels';
import Footer from '../components/common/Footer';
import HeaderBar from '../components/common/HeaderBar';
import { apiHandle } from '../api/apihandle';
import { CompanyEP } from '../api/endpoint/Company';



function fmt(d: Date) {
  const dd = String(d.getDate()).padStart(2, '0');
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const yyyy = d.getFullYear();
  return `${dd}/${mm}/${yyyy}`;
}

function fmtApi(d: Date) {
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${d.getFullYear()}-${mm}-${dd}`;
}

export default function ReportScreen() {
  const insets = useSafeAreaInsets();
  const [activeTab, setActiveTab] = useState(2);
  const [selectedStat, setSelectedStat] = useState<
    'onTime' | 'late' | 'leaveEarly' | 'withPermit' | 'withoutPermit'
  >('onTime');

  // 📅 date
  const [date, setDate] = useState(new Date());
  const [openPicker, setOpenPicker] = useState(false);

  // 📊 report data
  const [stats, setStats] = useState({
    worked: 0,
    absent: 0,
    onTime: 0,
    late: 0,
    leaveEarly: 0,
    withPermit: 0,
    withoutPermit: 0,
  });

  const [employeesBy, setEmployeesBy] = useState<any>({
    onTime: [],
    late: [],
    leaveEarly: [],
    withPermit: [],
    withoutPermit: [],
  });

  // ===============================
  // 🔥 LOAD REPORT
  // ===============================
  const loadReport = (d: Date) => {
    apiHandle
      .callApi(CompanyEP.GetAttendanceReportByDate, {
        date: fmtApi(d),
      })
      .response((st, res) => {
        if (st.isError) return;

        setStats(res.stats);
        setEmployeesBy(res.lists);
      });
  };

  useEffect(() => {
    loadReport(date);
  }, [date]);

  // Pie build từ stats
  const pie: Slice[] = [
    {name: 'Đúng giờ', value: stats.onTime, color: '#00D4FF'},
    {name: 'Đi trễ', value: stats.late, color: '#FF9500'},
    {name: 'Không phép', value: stats.withoutPermit, color: '#EC4899'},
    {name: 'Có phép', value: stats.withPermit, color: '#A78BFA'},
  ];

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

        <Text style={styles.groupNote}>Nhóm GS</Text>

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
          worked={stats.worked}
          absent={stats.absent}
          onTime={stats.onTime}
          late={stats.late}
          leaveEarly={stats.leaveEarly}
          withPermit={stats.withPermit}
          withoutPermit={stats.withoutPermit}
        />

        {/* -------- Pie Chart -------- */}
        <View style={[styles.chartCard, styles.cardShadow]}>
          <View style={{alignItems: 'center', marginBottom: 8}}>
            <PieWithLabels data={pie} />
          </View>
        </View>

        {/* -------- Employees List -------- */}
        <EmployeeList
          title={listTitleBy[selectedStat]}
          employees={employeesBy[selectedStat] || []}
        />

        {/* -------- Bottom Chart -------- */}
        <View style={[styles.bottomChartSection, styles.cardShadow]}>
          <Text style={styles.chartTitle}>Biểu đồ thống kê</Text>
          <AttendanceAreaChart />
        </View>
      </ScrollView>

     
    </SafeAreaView>
  );
}

/* -------------------- styles -------------------- */
const styles = StyleSheet.create({
  container: {flex: 1, backgroundColor: '#F5F7FA'},
  scrollView: {flex: 1 , marginTop:15},
  scrollContent: {paddingHorizontal: 16, paddingBottom: 24},

  dateRow: {flexDirection: 'row', alignItems: 'center', marginTop: 8},
  dateLabel: {fontSize: 14, fontWeight: '700', marginRight: 8},
  dateChip: {
    backgroundColor: '#ECEFF3',
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  dateChipText: {fontSize: 13, fontWeight: '700'},
  calendarBtn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    marginLeft: 8,
    backgroundColor: '#EEF2FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  groupNote: {fontSize: 12, color: '#7B8794', marginVertical: 12},

  chartCard: {
    backgroundColor: '#FFF',
    padding: 20,
    borderRadius: 16,
    marginBottom: 16,
  },

  bottomChartSection: {
    backgroundColor: '#FFF',
    padding: 20,
    borderRadius: 16,
  },

  chartTitle: {fontSize: 16, fontWeight: '700', marginBottom: 8},

  cardShadow: {
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },
});
