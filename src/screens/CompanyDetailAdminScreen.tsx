import {useEffect, useState} from 'react';
import {View, Text, StyleSheet} from 'react-native';
import HeaderBar from '../components/common/HeaderBar';
import GradientButton from '../components/auth/GradientButton';
import {apiHandle} from '../api/apihandle';
import {CompanyEP} from '../api/endpoint/Company';

const CompanyDetailAdminScreen = ({route, navigation}: any) => {
  const {company} = route.params;

  const subActive = company.subscription_status === 'active';

  const [stats, setStats] = useState<{
    total_users: number;
    active_users: number;
    inactive_users: number;
  } | null>(null);

  /* ================= LOAD USER STATS ================= */
  useEffect(() => {
    apiHandle
      .callApi(CompanyEP.GetUserStats(company._id))
      .asPromise()
      .then(r => {
        if (!r.status.isError) setStats(r.res);
      });
  }, [company._id]);

  return (
    <View style={styles.container}>
      <HeaderBar title={company.name} onBack={() => navigation.goBack()} />

      {/* ================= COMPANY INFO ================= */}
      <View style={styles.card}>
        <View style={styles.headerRow}>
          <Text style={styles.companyName}>{company.name}</Text>

          <View
            style={[
              styles.statusBadge,
              {backgroundColor: subActive ? '#22c55e' : '#9ca3af'},
            ]}>
            <Text style={styles.statusText}>
              {subActive ? 'ACTIVE' : 'UNACTIVE'}
            </Text>
          </View>
        </View>

        <InfoRow label="🏷 Code" value={company.code} />
        <InfoRow label="📧 Email" value={company.contact_email || '-'} />
        <InfoRow label="📞 Phone" value={company.contact_phone || '-'} />

        <InfoRow
          label="💳 Subscription"
          value={company.subscription_status || 'unactive'}
          valueStyle={{color: subActive ? '#16a34a' : '#6b7280'}}
        />

        <InfoRow
          label="📅 Ngày tạo"
          value={
            company.created_at
              ? new Date(company.created_at).toLocaleDateString()
              : '--'
          }
        />
      </View>

      {/* ================= USER STATS ================= */}
      <View style={styles.card}>
        <Text style={styles.sectionTitle}>👥 Thống kê nhân sự</Text>

        {stats ? (
          <View style={styles.statsRow}>
            <StatBox
              label="Tổng"
              value={stats.total_users}
              color="#2563EB"
            />
            <StatBox
              label="Đang hoạt động"
              value={stats.active_users}
              color="#16a34a"
            />
            <StatBox
              label="Ngưng hoạt động"
              value={stats.inactive_users}
              color="#ef4444"
            />
          </View>
        ) : (
          <Text style={styles.loadingText}>Đang tải thống kê...</Text>
        )}
      </View>

      {/* ================= ACTION ================= */}
      <View style={styles.actionBox}>
        <GradientButton
          text="📜 Lịch sử gói đăng ký"
          onPress={() =>
            navigation.navigate('CompanyPlanHistory', {
              companyId: company._id,
            })
          }
        />
      </View>
    </View>
  );
};

export default CompanyDetailAdminScreen;

/* ================= SMALL COMPONENTS ================= */
const InfoRow = ({
  label,
  value,
  valueStyle,
}: {
  label: string;
  value: string;
  valueStyle?: any;
}) => (
  <View style={styles.row}>
    <Text style={styles.label}>{label}</Text>
    <Text style={[styles.value, valueStyle]}>{value}</Text>
  </View>
);

const StatBox = ({
  label,
  value,
  color,
}: {
  label: string;
  value: number;
  color: string;
}) => (
  <View style={[styles.statBox, {borderColor: color}]}>
    <Text style={[styles.statValue, {color}]}>{value}</Text>
    <Text style={styles.statLabel}>{label}</Text>
  </View>
);

/* ================= STYLE ================= */
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F6FA',
    paddingHorizontal: 16,
  },

  card: {
    backgroundColor: '#fff',
    borderRadius: 18,
    padding: 18,
    marginTop: 16,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 12,
    shadowOffset: {width: 0, height: 6},
    elevation: 4,
  },

  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },

  companyName: {
    fontSize: 18,
    fontWeight: '800',
    color: '#111827',
    flex: 1,
    marginRight: 10,
  },

  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 999,
  },

  statusText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '800',
  },

  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },

  label: {
    fontSize: 14,
    color: '#6b7280',
    fontWeight: '600',
  },

  value: {
    fontSize: 14,
    color: '#111827',
    fontWeight: '700',
  },

  sectionTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#111827',
    marginBottom: 12,
  },

  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },

  statBox: {
    flex: 1,
    borderWidth: 1.5,
    borderRadius: 14,
    paddingVertical: 16,
    marginHorizontal: 4,
    alignItems: 'center',
  },

  statValue: {
    fontSize: 20,
    fontWeight: '900',
  },

  statLabel: {
    marginTop: 4,
    fontSize: 12,
    color: '#6b7280',
    fontWeight: '600',
  },

  loadingText: {
    fontSize: 13,
    color: '#9ca3af',
    fontStyle: 'italic',
  },

  actionBox: {
    marginTop: 24,
  },
});
