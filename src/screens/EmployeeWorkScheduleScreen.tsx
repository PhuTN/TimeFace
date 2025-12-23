import React, {useEffect, useState} from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  SafeAreaView,
} from 'react-native';
import dayjs from 'dayjs';
import HeaderBar from '../components/common/HeaderBar';
import {apiHandle} from '../api/apihandle';
import {CompanyEP} from '../api/endpoint/Company';

const DAY_LABEL: Record<string, string> = {
  mon: 'Thứ 2',
  tue: 'Thứ 3',
  wed: 'Thứ 4',
  thu: 'Thứ 5',
  fri: 'Thứ 6',
  sat: 'Thứ 7',
  sun: 'Chủ nhật',
};

export default function EmployeeWorkScheduleScreen({navigation}: any) {
  const [config, setConfig] = useState<any>(null);

  useEffect(() => {
    const load = async () => {
      const {status, res} = await apiHandle
        .callApi(CompanyEP.GetAttendanceConfig)
        .asPromise();

      if (!status.isError) {
        setConfig(res);
      }
    };

    load();
  }, []);

  if (!config) {
    return (
      <SafeAreaView style={styles.center}>
        <Text style={styles.loadingText}>⏳ Đang tải lịch làm việc…</Text>
      </SafeAreaView>
    );
  }

  const {working_hours} = config;

  return (
    <SafeAreaView style={{flex: 1, backgroundColor: '#F6F8FC'}}>
      <HeaderBar title="Lịch làm việc" onBack={() => navigation.goBack()} />

      <ScrollView contentContainerStyle={styles.container}>
        {/* ===== GIỜ LÀM VIỆC ===== */}
        <Card title="⏰ Giờ làm việc">
          <TimeRow label="Bắt đầu" value={working_hours.start_time} />
          <TimeRow label="Kết thúc" value={working_hours.end_time} />
          <TimeRow
            label="Nghỉ trưa"
            value={`${working_hours.break_start} – ${working_hours.break_end}`}
          />
        </Card>

        {/* ===== NGÀY LÀM TRONG TUẦN ===== */}
        <Card title="📅 Ngày làm việc">
          <View style={styles.tagWrap}>
            {working_hours.working_days.map((d: string) => (
              <View key={d} style={styles.dayTag}>
                <Text style={styles.dayTagText}>{DAY_LABEL[d]}</Text>
              </View>
            ))}
          </View>
        </Card>

        {/* ===== NGÀY NGHỈ ===== */}
        <Card title="🎉 Ngày nghỉ công ty">
          {working_hours.company_holidays.length === 0 ? (
            <Text style={styles.muted}>Không có ngày nghỉ 🎯</Text>
          ) : (
            working_hours.company_holidays.map((d: string) => (
              <View key={d} style={styles.holidayItem}>
                <Text style={styles.holidayDot}>•</Text>
                <Text style={styles.holidayText}>
                  {dayjs(d).format('DD/MM/YYYY')}
                </Text>
              </View>
            ))
          )}
        </Card>
      </ScrollView>
    </SafeAreaView>
  );
}

/* ================= COMPONENTS ================= */

const Card = ({title, children}: any) => (
  <View style={styles.card}>
    <Text style={styles.cardTitle}>{title}</Text>
    {children}
  </View>
);

const TimeRow = ({label, value}: any) => (
  <View style={styles.timeRow}>
    <Text style={styles.timeLabel}>{label}</Text>
    <View style={styles.timePill}>
      <Text style={styles.timeValue}>{value}</Text>
    </View>
  </View>
);

/* ================= STYLES ================= */

const styles = StyleSheet.create({
  container: {
    padding: 16,
    paddingBottom: 40,
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F6F8FC',
  },
  loadingText: {
    fontSize: 14,
    color: '#6B7280',
  },

  /* CARD */
  card: {
    backgroundColor: '#fff',
    borderRadius: 18,
    padding: 16,
    marginBottom: 18,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 10,
    shadowOffset: {width: 0, height: 4},
    elevation: 3,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '800',
    marginBottom: 14,
    color: '#111827',
  },

  /* TIME */
  timeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  timeLabel: {
    fontSize: 14,
    color: '#6B7280',
  },
  timePill: {
    backgroundColor: '#EEF2FF',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 999,
  },
  timeValue: {
    fontSize: 14,
    fontWeight: '700',
    color: '#3730A3',
  },

  /* DAYS */
  tagWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  dayTag: {
    backgroundColor: '#DBEAFE',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 14,
  },
  dayTagText: {
    fontWeight: '700',
    color: '#1D4ED8',
    fontSize: 13,
  },

  /* HOLIDAY */
  muted: {
    color: '#9CA3AF',
    fontSize: 14,
  },
  holidayItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  holidayDot: {
    fontSize: 20,
    marginRight: 6,
    color: '#EF4444',
  },
  holidayText: {
    fontSize: 14,
    fontWeight: '600',
  },
});