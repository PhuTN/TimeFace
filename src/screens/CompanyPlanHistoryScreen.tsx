import {useEffect, useState} from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
} from 'react-native';
import HeaderBar from '../components/common/HeaderBar';
import {apiHandle} from '../api/apihandle';
import {CompanyEP} from '../api/endpoint/Company';

/* ================= HELPERS ================= */
const formatDate = (d?: string) =>
  d ? new Date(d).toLocaleDateString() : '--';

const formatUSD = (v?: number) =>
  typeof v === 'number' ? `$${v}` : '--';

const CompanyPlanHistoryScreen = ({route, navigation}: any) => {
  const {companyId} = route.params;
  const [list, setList] = useState<any[]>([]);

  /* ================= LOAD ================= */
  useEffect(() => {
    apiHandle
      .callApi(CompanyEP.GetPlanHistory(companyId))
      .asPromise()
      .then(r => {
        if (!r.status.isError) setList(r.res || []);
      });
  }, [companyId]);

  /* ================= ITEM ================= */
  const renderItem = ({item, index}: any) => {
    const isActive = !item.end_date;

    return (
      <View style={styles.card}>
        {/* HEADER */}
        <View style={styles.header}>
          <Text style={styles.planName}>
            {item.plan?.name || 'Không rõ gói'}
          </Text>

          <View
            style={[
              styles.statusBadge,
              {backgroundColor: isActive ? '#16a34a' : '#9ca3af'},
            ]}>
            <Text style={styles.statusText}>
              {isActive ? 'ĐANG DÙNG' : 'ĐÃ KẾT THÚC'}
            </Text>
          </View>
        </View>

        {/* PRICE */}
        <Text style={styles.price}>{formatUSD(item.price)} / tháng</Text>

        {/* DATES */}
        <View style={styles.dateRow}>
          <View style={styles.dateBox}>
            <Text style={styles.dateLabel}>Bắt đầu</Text>
            <Text style={styles.dateValue}>
              {formatDate(item.start_date)}
            </Text>
          </View>

          <View style={styles.dateBox}>
            <Text style={styles.dateLabel}>Kết thúc</Text>
            <Text style={styles.dateValue}>
              {item.end_date ? formatDate(item.end_date) : '—'}
            </Text>
          </View>
        </View>

        {/* FOOTER */}
        <Text style={styles.created}>
          Ghi nhận: {formatDate(item.created_at)}
        </Text>
      </View>
    );
  };

  /* ================= UI ================= */
  return (
    <View style={styles.container}>
      <HeaderBar title="📜 Lịch sử gói đăng ký" onBack={() => navigation.goBack()} />

      <FlatList
        data={list}
        keyExtractor={(_, i) => i.toString()}
        contentContainerStyle={styles.list}
        renderItem={renderItem}
        ListEmptyComponent={
          <Text style={styles.emptyText}>
            Chưa có lịch sử đăng ký gói
          </Text>
        }
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
};

export default CompanyPlanHistoryScreen;

/* ================= STYLE ================= */
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F6FA',
  },

  list: {
    padding: 16,
    paddingBottom: 40,
  },

  card: {
    backgroundColor: '#fff',
    borderRadius: 18,
    padding: 16,
    marginBottom: 14,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 12,
    shadowOffset: {width: 0, height: 5},
    elevation: 3,
  },

  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  planName: {
    fontSize: 16,
    fontWeight: '800',
    color: '#111827',
    flex: 1,
    marginRight: 8,
  },

  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
  },

  statusText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '800',
  },

  price: {
    marginTop: 8,
    fontSize: 18,
    fontWeight: '900',
    color: '#2563EB',
  },

  dateRow: {
    marginTop: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },

  dateBox: {
    flex: 1,
  },

  dateLabel: {
    fontSize: 12,
    color: '#6B7280',
    fontWeight: '600',
  },

  dateValue: {
    marginTop: 2,
    fontSize: 14,
    fontWeight: '700',
    color: '#111827',
  },

  created: {
    marginTop: 10,
    fontSize: 12,
    color: '#9CA3AF',
    fontStyle: 'italic',
  },

  emptyText: {
    textAlign: 'center',
    marginTop: 60,
    fontSize: 14,
    color: '#9CA3AF',
  },
});
