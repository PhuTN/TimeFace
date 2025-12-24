import {useEffect, useMemo, useState} from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Alert,
  TextInput,
} from 'react-native';
import {apiHandle} from '../api/apihandle';
import {CompanyEP} from '../api/endpoint/Company';
import HeaderBar from '../components/common/HeaderBar';
import Footer from '../components/common/Footer';

/* ================= TYPES ================= */
type FilterType = 'all' | 'active' | 'locked' | 'sub_active' | 'sub_unactive';

const CompanyAdminScreen = ({navigation}: any) => {
  const [list, setList] = useState<any[]>([]);
  const [filter, setFilter] = useState<FilterType>('all');
  const [keyword, setKeyword] = useState('');

  /* ================= LOAD ================= */
  const load = async () => {
    const rs = await apiHandle.callApi(CompanyEP.GetAll).asPromise();
    if (!rs.status.isError) setList(rs.res || []);
  };

  useEffect(() => {
    load();
  }, []);

  /* ================= FILTER + SEARCH ================= */
  const filteredList = useMemo(() => {
    const k = keyword.trim().toLowerCase();

    return list.filter(c => {
      // filter trạng thái
      const passFilter = (() => {
        switch (filter) {
          case 'active':
            return c.record_status === 1;
          case 'locked':
            return c.record_status === 0;
          case 'sub_active':
            return c.subscription_status === 'active';
          case 'sub_unactive':
            return c.subscription_status !== 'active' && c.subscription_status !== 'canceled' ;
          default:
            return true;
        }
      })();

      if (!passFilter) return false;

      // search name + code
      if (!k) return true;

      return (
        c.name?.toLowerCase().includes(k) || c.code?.toLowerCase().includes(k)
      );
    });
  }, [list, filter, keyword]);

  /* ================= LOCK / UNLOCK ================= */
  const toggleLock = (c: any) => {
    Alert.alert(
      c.record_status === 1 ? 'Khoá công ty' : 'Mở khoá công ty',
      `Công ty: ${c.name}`,
      [
        {text: 'Huỷ', style: 'cancel'},
        {
          text: 'Xác nhận',
          style: 'destructive',
          onPress: async () => {
            const ep =
              c.record_status === 1
                ? CompanyEP.LockCompany(c._id)
                : CompanyEP.UnlockCompany(c._id);

            await apiHandle.callApi(ep).asPromise();
            load();
          },
        },
      ],
    );
  };

  /* ================= ITEM ================= */
  const renderItem = ({item}: any) => {
    const active = item.record_status === 1;

    return (
      <TouchableOpacity
        activeOpacity={0.88}
        style={styles.card}
        onPress={() =>
          navigation.navigate('CompanyDetailAdmin', {company: item})
        }>
        {/* HEADER */}
        <View style={styles.header}>
          <Text style={styles.name} numberOfLines={1}>
            {item.name}
          </Text>

          <View
            style={[
              styles.statusBadge,
              {backgroundColor: active ? '#22c55e' : '#9ca3af'},
            ]}>
            <Text style={styles.statusText}>
              {active ? 'ACTIVE' : 'LOCKED'}
            </Text>
          </View>
        </View>

        {/* META */}
        <Text style={styles.meta}>Code: {item.code}</Text>

        <View style={styles.subRow}>
          <Text style={styles.meta}>
            Subscription: {item.subscription_status ?? 'unactive'}
          </Text>

          {item.subscription_status === 'active' && (
            <View style={styles.subBadge}>
              <Text style={styles.subText}>PAID</Text>
            </View>
          )}
        </View>

        <Text style={styles.meta}>
          Ngày tạo:{' '}
          {item.created_at
            ? new Date(item.created_at).toLocaleDateString()
            : '--'}
        </Text>

        {/* ACTION */}
        <TouchableOpacity
          style={[
            styles.lockBtn,
            {backgroundColor: active ? '#ef4444' : '#22c55e'},
          ]}
          onPress={() => toggleLock(item)}>
          <Text style={styles.lockText}>
            {active ? '🔒 Khoá công ty' : '🔓 Mở khoá'}
          </Text>
        </TouchableOpacity>
      </TouchableOpacity>
    );
  };

  /* ================= UI ================= */
  return (
    <View style={styles.container}>
      <HeaderBar title="Quản lý công ty " />

      {/* SEARCH */}
      <View style={styles.searchBox}>
        <TextInput
          placeholder="🔍 Tìm theo tên hoặc mã công ty..."
          value={keyword}
          onChangeText={setKeyword}
          style={styles.searchInput}
          placeholderTextColor="#9CA3AF"
        />
      </View>

      {/* FILTER BAR */}
      <View style={styles.filterBar}>
        {[
          {key: 'all', label: 'Tất cả'},
          {key: 'active', label: 'Hoạt động'},
          {key: 'locked', label: 'Đã khoá'},
          {key: 'sub_active', label: 'Sub Active'},
          {key: 'sub_unactive', label: 'Sub Unactive'},
        ].map(i => (
          <TouchableOpacity
            key={i.key}
            style={[
              styles.filterBtn,
              filter === i.key && styles.filterBtnActive,
            ]}
            onPress={() => setFilter(i.key as FilterType)}>
            <Text
              style={[
                styles.filterText,
                filter === i.key && styles.filterTextActive,
              ]}>
              {i.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <FlatList
        data={filteredList}
        keyExtractor={i => i._id}
        contentContainerStyle={{padding: 16, paddingBottom: 40}}
        renderItem={renderItem}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <Text style={styles.emptyText}>Không tìm thấy công ty</Text>
        }
      />
      <Footer
        activeIndex={1} // CompanyAdmin
        onPress={() => {}}
      />
    </View>
  );
};

export default CompanyAdminScreen;

/* ================= STYLE ================= */
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F6FA',
  },

  /* SEARCH */
  searchBox: {
    paddingHorizontal: 16,
    paddingTop: 12,
  },

  searchInput: {
    backgroundColor: '#fff',
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 14,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },

  /* FILTER */
  filterBar: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    paddingHorizontal: 16,
    paddingTop: 10,
  },

  filterBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: '#E5E7EB',
  },

  filterBtnActive: {
    backgroundColor: '#2563EB',
  },

  filterText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#374151',
  },

  filterTextActive: {
    color: '#fff',
  },

  /* CARD */
  card: {
    backgroundColor: '#fff',
    borderRadius: 18,
    padding: 16,
    marginBottom: 14,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 10,
    shadowOffset: {width: 0, height: 4},
    elevation: 3,
  },

  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  name: {
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
    fontWeight: '700',
  },

  meta: {
    marginTop: 6,
    fontSize: 13,
    color: '#4b5563',
  },

  subRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
    gap: 8,
  },

  subBadge: {
    backgroundColor: '#DCFCE7',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 999,
  },

  subText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#166534',
  },

  lockBtn: {
    marginTop: 14,
    paddingVertical: 10,
    borderRadius: 12,
    alignItems: 'center',
  },

  lockText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 14,
  },

  emptyText: {
    textAlign: 'center',
    marginTop: 60,
    color: '#9CA3AF',
    fontSize: 14,
  },
});
