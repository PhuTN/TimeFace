import {useEffect, useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Dimensions,
} from 'react-native';
import HeaderBar from '../components/common/HeaderBar';
import {apiHandle} from '../api/apihandle';
import {CompanyEP} from '../api/endpoint/Company';
import {LineChart} from 'react-native-chart-kit';

const screenWidth = Dimensions.get('window').width;

const CompanyDashboardScreen = () => {
  const [loading, setLoading] = useState(true);

  const [summary, setSummary] = useState<any>({});
  const [revenueByMonth, setRevenueByMonth] = useState<any[]>([]);
  const [planStats, setPlanStats] = useState<any[]>([]);

  const loadData = async () => {
    try {
      setLoading(true);
      const year = new Date().getFullYear();

      const [summaryRes, revenueRes, planRes] = await Promise.all([
        apiHandle.callApi(CompanyEP.GetDashboard).asPromise(),
        apiHandle
          .callApi(CompanyEP.GetRevenueByMonth, {year})
          .asPromise(),
        apiHandle.callApi(CompanyEP.GetPlanStats).asPromise(),
      ]);

      if (!summaryRes.status.isError)
        setSummary(summaryRes.res || {});
      if (!revenueRes.status.isError)
        setRevenueByMonth(revenueRes.res || []);
      if (!planRes.status.isError)
        setPlanStats(planRes.res || []);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#2563EB" />
      </View>
    );
  }

  /* ================= CALC ================= */
  const totalRevenue = planStats.reduce(
    (sum, i) => sum + (i.total_revenue || 0),
    0,
  );

  const activeRate =
    summary.total_companies > 0
      ? Math.round(
          (summary.active_companies / summary.total_companies) * 100,
        )
      : 0;

  const arpu =
    summary.active_companies > 0
      ? Math.round(totalRevenue / summary.active_companies)
      : 0;

  const chartData = {
    labels: revenueByMonth.map(i => `T${i.month}`),
    datasets: [
      {
        data:
          revenueByMonth.length > 0
            ? revenueByMonth.map(i => i.revenue)
            : [0],
        strokeWidth: 3,
      },
    ],
  };

  return (
    <View style={styles.container}>
      <HeaderBar title="📊 SYS ADMIN DASHBOARD" />

      <ScrollView contentContainerStyle={styles.content}>
        {/* ===== STAT ===== */}
        <View style={styles.row}>
          <StatCard
            title="Tổng công ty"
            value={summary.total_companies ?? 0}
            accent="#2563EB"
            icon="🏢"
            sub="Toàn hệ thống"
          />
          <StatCard
            title="Hoạt động"
            value={`${activeRate}%`}
            accent="#16A34A"
            icon="⚡"
            sub={`${summary.active_companies} công ty`}
          />
        </View>

        <View style={styles.row}>
          <StatCard
            title="Tổng doanh thu"
            value={`$${totalRevenue}`}
            accent="#F59E0B"
            icon="💰"
            sub="Tất cả gói"
          />
          <StatCard
            title="ARPU"
            value={`$${arpu}`}
            accent="#0EA5E9"
            icon="📊"
            sub="Doanh thu / công ty"
          />
        </View>

        {/* ===== REVENUE ===== */}
        <Section title="📈 Doanh thu theo tháng">
          {revenueByMonth.length === 0 ? (
            <Empty />
          ) : (
            <>
              <LineChart
                data={chartData}
                width={screenWidth - 48}
                height={220}
                bezier
                withDots
                withInnerLines={false}
                withOuterLines={false}
                chartConfig={{
                  backgroundGradientFrom: '#fff',
                  backgroundGradientTo: '#fff',
                  decimalPlaces: 0,
                  color: () => '#2563EB',
                  labelColor: () => '#6B7280',
                  propsForDots: {
                    r: '5',
                    strokeWidth: '2',
                    stroke: '#2563EB',
                  },
                }}
                style={styles.chart}
              />

              {revenueByMonth.map((i, idx) => (
                <View key={idx} style={styles.listRow}>
                  <Text style={styles.listLabel}>
                    Tháng {i.month}/{i.year}
                  </Text>
                  <View style={{alignItems: 'flex-end'}}>
                    <Text style={styles.money}>${i.revenue}</Text>
                    <Text style={styles.subText}>
                      {i.orders} đơn
                    </Text>
                  </View>
                </View>
              ))}
            </>
          )}
        </Section>

        {/* ===== PLAN STATS ===== */}
        <Section title="📦 Thống kê gói đăng ký">
          {planStats.length === 0 ? (
            <Empty />
          ) : (
            planStats.map((i, idx) => {
              const percent =
                totalRevenue > 0
                  ? Math.round(
                      (i.total_revenue / totalRevenue) * 100,
                    )
                  : 0;

              return (
                <View key={idx} style={styles.planCard}>
                  <View style={styles.planHeader}>
                    <Text style={styles.planName}>
                      {i.plan_name}
                    </Text>
                    <Text style={styles.planPercent}>
                      {percent}%
                    </Text>
                  </View>

                  <View style={styles.planMeta}>
                    <Text style={styles.planText}>
                      🏢 {i.total_companies} công ty
                    </Text>
                    <Text style={styles.planMoney}>
                      ${i.total_revenue}
                    </Text>
                  </View>

                  <View style={styles.progressBg}>
                    <View
                      style={[
                        styles.progressFill,
                        {width: `${percent}%`},
                      ]}
                    />
                  </View>
                </View>
              );
            })
          )}
        </Section>
      </ScrollView>
    </View>
  );
};

export default CompanyDashboardScreen;

/* ================= COMPONENT ================= */

const StatCard = ({title, value, accent, icon, sub}: any) => (
  <View style={[styles.statCard, {borderTopColor: accent}]}>
    <View style={styles.statHeader}>
      <Text style={styles.icon}>{icon}</Text>
      <View style={[styles.dot, {backgroundColor: accent}]} />
    </View>

    <Text style={styles.statTitle}>{title}</Text>
    <Text style={[styles.statValue, {color: accent}]}>
      {value}
    </Text>

    {!!sub && <Text style={styles.statSub}>{sub}</Text>}
  </View>
);

const Section = ({title, children}: any) => (
  <View style={styles.section}>
    <Text style={styles.sectionTitle}>{title}</Text>
    {children}
  </View>
);

const Empty = () => (
  <Text style={styles.empty}>Không có dữ liệu</Text>
);

/* ================= STYLE ================= */

const styles = StyleSheet.create({
  container: {flex: 1, backgroundColor: '#F5F6FA'},

  content: {padding: 16, paddingBottom: 32},

  center: {flex: 1, justifyContent: 'center', alignItems: 'center'},

  row: {flexDirection: 'row', gap: 12, marginBottom: 12},

  statCard: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 18,
    borderTopWidth: 6,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 12,
    shadowOffset: {width: 0, height: 6},
    elevation: 4,
  },

  statHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  dot: {width: 8, height: 8, borderRadius: 999},

  icon: {fontSize: 22},

  statTitle: {
    fontSize: 13,
    color: '#6B7280',
    fontWeight: '600',
    marginTop: 6,
  },

  statValue: {
    fontSize: 26,
    fontWeight: '900',
    marginTop: 4,
  },

  statSub: {
    marginTop: 4,
    fontSize: 12,
    color: '#6B7280',
    fontWeight: '600',
  },

  section: {
    marginTop: 20,
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 16,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 10,
    shadowOffset: {width: 0, height: 4},
    elevation: 3,
  },

  sectionTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#111827',
    marginBottom: 12,
  },

  chart: {borderRadius: 16, marginBottom: 16},

  listRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },

  listLabel: {fontSize: 14, fontWeight: '600', color: '#374151'},
  money: {fontSize: 15, fontWeight: '900', color: '#2563EB'},
  subText: {fontSize: 12, color: '#6B7280'},

  /* PLAN */
  planCard: {marginBottom: 18},

  planHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },

  planName: {
    fontSize: 15,
    fontWeight: '800',
    color: '#111827',
  },

  planPercent: {
    fontSize: 13,
    fontWeight: '700',
    color: '#2563EB',
  },

  planMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },

  planText: {fontSize: 13, fontWeight: '600', color: '#374151'},

  planMoney: {fontSize: 14, fontWeight: '900', color: '#16A34A'},

  progressBg: {
    height: 8,
    backgroundColor: '#E5E7EB',
    borderRadius: 999,
    overflow: 'hidden',
  },

  progressFill: {
    height: 8,
    backgroundColor: '#2563EB',
    borderRadius: 999,
  },

  empty: {
    textAlign: 'center',
    color: '#9CA3AF',
    paddingVertical: 12,
  },
});
