import React, {useEffect, useState} from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  SafeAreaView,
} from 'react-native';
import HeaderBar from '../components/common/HeaderBar';
import {apiHandle} from '../api/apihandle';
import {CompanyEP} from '../api/endpoint/Company';

export default function CompanyRulesScreen({navigation}: any) {
  const [config, setConfig] = useState<any>(null);

  useEffect(() => {
    const load = async () => {
      const {status, res} = await apiHandle
        .callApi(CompanyEP.GetAttendanceConfig)
        .asPromise();

      if (!status.isError) setConfig(res);
    };

    load();
  }, []);

  if (!config) {
    return (
      <SafeAreaView style={styles.center}>
        <Text style={styles.loading}>⏳ Đang tải quy định công ty…</Text>
      </SafeAreaView>
    );
  }

  const {
    working_hours,
    late_rule,
    early_leave_rule,
    overtime_policy,
    leave_policy,
    salary_policy,
  } = config;

  return (
    <SafeAreaView style={{flex: 1, backgroundColor: '#F6F8FC'}}>
      <HeaderBar
        title="Quy định công ty"
        onBack={() => navigation.goBack()}
      />

      <ScrollView contentContainerStyle={styles.container}>
        {/* ===== GIỜ LÀM VIỆC ===== */}
        <Card title="⏰ Giờ làm việc">
          <Row label="Bắt đầu" value={working_hours.start_time} />
          <Row label="Kết thúc" value={working_hours.end_time} />
          <Row
            label="Nghỉ trưa"
            value={`${working_hours.break_start} – ${working_hours.break_end}`}
          />
        </Card>

        {/* ===== ĐI TRỄ ===== */}
        <Card title="🚨 Quy định đi trễ">
          <Row
            label="Cho phép trễ"
            value={`${late_rule.allow_minutes} phút`}
          />
          <Row
            label="Tính vắng nếu trễ quá"
            value={`${late_rule.max_late_as_absent_minutes} phút`}
          />
          <Row
            label="Cách tính"
            value={
              late_rule.deduct_per_minute
                ? 'Trừ theo từng phút'
                : `Làm tròn mỗi ${late_rule.unit_minutes} phút`
            }
          />
        </Card>

        {/* ===== VỀ SỚM ===== */}
        <Card title="🕔 Quy định về sớm">
          <Row
            label="Tính vắng nếu về sớm quá"
            value={`${early_leave_rule.max_early_as_absent_minutes} phút`}
          />
          <Row
            label="Cách tính"
            value={
              early_leave_rule.deduct_per_minute
                ? 'Trừ theo từng phút'
                : `Làm tròn mỗi ${early_leave_rule.unit_minutes} phút`
            }
          />
        </Card>

        {/* ===== OT ===== */}
        <Card title="⏱️ Chính sách tăng ca (OT)">
          <Row
            label="OT tối thiểu"
            value={`${overtime_policy.min_ot_minutes} phút`}
          />
          <Row
            label="Làm tròn OT"
            value={`${overtime_policy.round_to_minutes} phút`}
          />
          <Divider />
          <Row
            label="Ngày thường"
            value={`x${overtime_policy.weekday_rate}`}
          />
          <Row
            label="Cuối tuần"
            value={`x${overtime_policy.weekend_rate}`}
          />
          <Row
            label="Ngày lễ"
            value={`x${overtime_policy.holiday_rate}`}
          />
        </Card>

        {/* ===== LEAVE ===== */}
        <Card title="🌴 Chính sách nghỉ phép">
          <Row
            label="Ngày phép năm"
            value={`${leave_policy.annual_leave_days} ngày`}
          />
          <Row
            label="Nghỉ nửa ngày"
            value={leave_policy.allow_half_day ? 'Có' : 'Không'}
          />
          <Row
            label="Loại nghỉ có lương"
            value={
              leave_policy.paid_leave_types.length > 0
                ? leave_policy.paid_leave_types
                    .map((x: any) => x.name)
                    .join(', ')
                : 'Không có'
            }
          />
        </Card>

        {/* ===== SALARY ===== */}
        <Card title="💰 Quy định lương">
          <Row
            label="Ngày công / tháng"
            value={`${salary_policy.workdays_per_month} ngày`}
          />
          <Row
            label="Giờ làm / ngày"
            value={`${salary_policy.hours_per_day} giờ`}
          />
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

const Row = ({label, value}: any) => (
  <View style={styles.row}>
    <Text style={styles.label}>{label}</Text>
    <Text style={styles.value}>{value}</Text>
  </View>
);

const Divider = () => <View style={styles.divider} />;

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
  loading: {
    fontSize: 14,
    color: '#6B7280',
  },

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

  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  label: {
    fontSize: 14,
    color: '#6B7280',
    maxWidth: '65%',
  },
  value: {
    fontSize: 14,
    fontWeight: '700',
    color: '#111827',
    textAlign: 'right',
  },

  divider: {
    height: 1,
    backgroundColor: '#E5E7EB',
    marginVertical: 8,
  },
});
