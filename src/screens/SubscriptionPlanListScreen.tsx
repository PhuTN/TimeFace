import {useCallback, useState} from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  StyleSheet,
} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {useFocusEffect} from '@react-navigation/native';

import HeaderBar from '../components/common/HeaderBar';
import GradientButton from '../components/common/GradientButton';
import Toast from 'react-native-toast-message';

import {apiHandle} from '../api/apihandle';
import {SubscriptionPlans} from '../api/endpoint/SubscriptionPlans';

// ================= HELPERS =================
const formatUSD = (v: number) => `$${v}`;
const renderMaxEmployees = (v: number | null) =>
  v === null ? 'Không giới hạn nhân viên' : `Tối đa ${v} nhân viên`;

const SubscriptionPlanListScreen = ({navigation}: any) => {
  const insets = useSafeAreaInsets();

  const [loading, setLoading] = useState(false);
  const [list, setList] = useState<any[]>([]);

  // ================= LOAD LIST =================
  const loadPlans = async () => {
    try {
      setLoading(true);

      const rs = await apiHandle
        .callApi(SubscriptionPlans.GetAll)
        .asPromise();

      if (rs.status.isError) {
        throw new Error(rs.status.errorMessage);
      }

      setList(rs.res?.data || rs.res || []);
    } catch (e: any) {
      Toast.show({
        type: 'error',
        text1: 'Lỗi',
        text2: e.message || 'Không tải được danh sách gói subscription',
      });
    } finally {
      setLoading(false);
    }
  };

  // ================= AUTO RELOAD WHEN FOCUS =================
  useFocusEffect(
    useCallback(() => {
      loadPlans();
    }, []),
  );

  // ================= DELETE =================
  const handleDelete = (item: any) => {
    Alert.alert(
      'Xác nhận',
      `Bạn có chắc muốn xoá gói "${item.name}" không?`,
      [
        {text: 'Huỷ', style: 'cancel'},
        {
          text: 'Xoá',
          style: 'destructive',
          onPress: async () => {
            try {
              const rs = await apiHandle
                .callApi(SubscriptionPlans.Delete(item._id))
                .asPromise();

              if (rs.status.isError) {
                throw new Error(rs.status.errorMessage);
              }

              Toast.show({
                type: 'success',
                text1: 'Thành công',
                text2: 'Đã xoá gói subscription',
              });

              loadPlans();
            } catch (e: any) {
              Toast.show({
                type: 'error',
                text1: 'Lỗi',
                text2: e.message || 'Không thể xoá gói',
              });
            }
          },
        },
      ],
    );
  };

  // ================= UI =================
  return (
    <View style={styles.container}>
      <HeaderBar
        title="Quản lý gói tháng"
        onBack={() => navigation.goBack()}
        topInset={insets.top}
      />

      {loading && list.length === 0 ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" />
        </View>
      ) : (
        <FlatList
          data={list}
          keyExtractor={item => item._id}
          refreshing={loading}
          onRefresh={loadPlans}
          contentContainerStyle={{padding: 20}}
          ListEmptyComponent={
            <Text style={styles.emptyText}>
              Chưa có gói subscription nào
            </Text>
          }
          renderItem={({item}) => (
            <TouchableOpacity
              style={styles.card}
              activeOpacity={0.8}
              onPress={() =>
                navigation.navigate('SubscriptionPlanForm', {plan: item})
              }
              onLongPress={() => handleDelete(item)}>

              <Text style={styles.name}>{item.name}</Text>

              <Text style={styles.price}>
                {formatUSD(item.price_per_month)} / 30 ngày
              </Text>

              <Text style={styles.meta}>
                {renderMaxEmployees(item.max_employees)}
              </Text>

              {!!item.description && (
                <Text style={styles.desc}>{item.description}</Text>
              )}
            </TouchableOpacity>
          )}
        />
      )}

      <View style={styles.footer}>
        <GradientButton
          text="➕ Tạo gói mới"
          onPress={() => navigation.navigate('SubscriptionPlanForm')}
        />
      </View>
    </View>
  );
};

export default SubscriptionPlanListScreen;

// ================= STYLE =================
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F6FA',
  },

  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },

  card: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 14,
    marginBottom: 12,
    elevation: 2,
  },

  name: {
    fontSize: 16,
    fontWeight: '700',
    color: '#2C3E50',
  },

  price: {
    marginTop: 4,
    fontSize: 14,
    fontWeight: '600',
    color: '#3498DB',
  },

  meta: {
    marginTop: 4,
    fontSize: 13,
    color: '#34495E',
  },

  desc: {
    marginTop: 6,
    fontSize: 12,
    color: '#7F8C8D',
  },

  emptyText: {
    textAlign: 'center',
    marginTop: 40,
    fontSize: 14,
    color: '#95A5A6',
  },

  footer: {
    padding: 20,
  },
});
