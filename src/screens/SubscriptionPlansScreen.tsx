import React, { useEffect, useState, useCallback } from 'react';
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Linking,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Toast from 'react-native-toast-message';
import { useNavigation } from '@react-navigation/native';

import { apiHandle } from '../api/apihandle';
import { SubscriptionPlans } from '../api/endpoint/SubscriptionPlans';
import { Stripe } from '../api/endpoint/Stripe';
import { authStorage } from '../services/authStorage';

type SubscriptionPlan = {
  _id: string;
  code: string;
  name: string;
  max_employees: number | null;
  price_per_month: number;
  description?: string;
};

export default function SubscriptionPlansScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();

  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [processingPlanId, setProcessingPlanId] = useState<string | null>(null);

  // 🔥 LOGOUT
  const handleLogout = async () => {
    await authStorage.clear();
    navigation.reset({
      index: 0,
      routes: [{ name: 'Login' }],
    });
  };

  const loadPlans = useCallback(async () => {
    try {
      if (!refreshing) setLoading(true);

      const { status, res } = await apiHandle
        .callApi(SubscriptionPlans.GetAll)
        .asPromise();

      if (status.isError || !res?.success) {
        throw new Error(res?.error || res?.message || 'Không thể tải danh sách');
      }

      setPlans(res.data || []);
    } catch (e: any) {
      Toast.show({
        type: 'error',
        text1: 'Lỗi tải gói dịch vụ',
        text2: e?.message || 'Vui lòng thử lại.',
      });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [refreshing]);

  useEffect(() => {
    loadPlans();
  }, [loadPlans]);

  const onRefresh = () => {
    setRefreshing(true);
    loadPlans();
  };

  const formatPrice = (price: number) => {
    return `$${price}/tháng`;
  };

  const handleChoosePlan = async (plan: SubscriptionPlan) => {
    try {
      setProcessingPlanId(plan._id);

      const payload = {
        planCode: plan.code,
        successUrl: 'timeface://stripe-success',
        cancelUrl: 'timeface://stripe-cancel',
      };

      const { status, res } = await apiHandle
        .callApi(Stripe.CreateCheckoutSession, payload)
        .asPromise();

      if (status.isError || !res?.success) {
        throw new Error(
          res?.error || res?.message || 'Không tạo được phiên thanh toán',
        );
      }

      const checkoutUrl = res.data?.checkoutUrl;
      if (!checkoutUrl) throw new Error('Không nhận được checkoutUrl từ server');

      await Linking.openURL(checkoutUrl);
    } catch (e: any) {
      Toast.show({
        type: 'error',
        text1: 'Lỗi khi tạo thanh toán',
        text2: e?.message || 'Vui lòng thử lại.',
      });
    } finally {
      setProcessingPlanId(null);
    }
  };

  const renderItem = ({ item }: { item: SubscriptionPlan }) => {
    const maxText =
      item.max_employees == null
        ? 'Không giới hạn số lượng nhân viên'
        : `Tối đa ${item.max_employees} nhân viên`;

    const isEnterprise = item.max_employees == null;
    const isProcessing = processingPlanId === item._id;

    return (
      <View style={styles.cardWrapper}>
        <View style={styles.cardShadow}>
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <View style={{ flex: 1 }}>
                <Text style={styles.planName}>{item.name}</Text>
                <Text style={styles.planCode}>Mã gói: {item.code}</Text>
              </View>

              <View style={styles.priceBadge}>
                <Text style={styles.priceText}>
                  {formatPrice(item.price_per_month)}
                </Text>
              </View>
            </View>

            <View style={styles.infoRow}>
              <View style={styles.dot} />
              <Text style={styles.maxEmployees}>{maxText}</Text>
            </View>

            {!!item.description && (
              <Text style={styles.description}>{item.description}</Text>
            )}

            {isEnterprise && (
              <View style={styles.tagRow}>
                <View style={styles.tagPremium}>
                  <Text style={styles.tagPremiumText}>Gói cao cấp — Enterprise</Text>
                </View>
              </View>
            )}

            <TouchableOpacity
              style={[styles.chooseBtn, isProcessing && { opacity: 0.7 }]}
              onPress={() => handleChoosePlan(item)}
              disabled={isProcessing}
            >
              <Text style={styles.chooseBtnText}>
                {isProcessing ? 'Đang chuyển tới Stripe...' : 'Chọn gói này'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  };

  // 👇 Nút logout ở dưới danh sách
  const renderFooter = () => (
    <View style={{ marginTop: 24, marginBottom: 40 }}>
      <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
        <Text style={styles.logoutText}>Đăng xuất</Text>
      </TouchableOpacity>
    </View>
  );

  if (loading && !refreshing && plans.length === 0) {
    return (
      <SafeAreaView style={styles.safe}>
        <StatusBar barStyle="dark-content" />
        <View style={styles.center}>
          <ActivityIndicator size="large" />
          <Text style={{ marginTop: 8, color: '#4B5563' }}>
            Đang tải danh sách gói...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="dark-content" />

      <View
        style={[
          styles.container,
          { paddingTop: insets.top + 28 },
        ]}
      >
        <Text style={styles.title}>Danh sách gói dịch vụ</Text>
        <Text style={styles.subtitle}>Chọn gói phù hợp cho công ty của bạn.</Text>

        <FlatList
          data={plans}
          keyExtractor={item => item._id}
          renderItem={renderItem}
          contentContainerStyle={{ paddingTop: 24 }}
          ItemSeparatorComponent={() => <View style={{ height: 14 }} />}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          ListFooterComponent={renderFooter}  // 👈 Nút logout nằm dưới cùng
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: '#F3F4F6',
  },
  container: {
    flex: 1,
    paddingHorizontal: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    color: '#111827',
    marginTop: 8,
  },
  subtitle: {
    fontSize: 13,
    color: '#6B7280',
    marginTop: 4,
  },
  cardWrapper: {
    borderRadius: 18,
  },
  cardShadow: {
    borderRadius: 18,
    backgroundColor: '#00000005',
  },
  card: {
    borderRadius: 18,
    backgroundColor: '#FFFFFF',
    padding: 14,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  planName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
  },
  planCode: {
    fontSize: 11,
    color: '#9CA3AF',
    marginTop: 2,
  },
  priceBadge: {
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#EFF6FF',
  },
  priceText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#1D4ED8',
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
    marginBottom: 4,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#10B981',
    marginRight: 6,
  },
  maxEmployees: {
    fontSize: 13,
    fontWeight: '600',
    color: '#4B5563',
  },
  description: {
    fontSize: 13,
    color: '#6B7280',
    marginTop: 6,
  },
  tagRow: {
    flexDirection: 'row',
    marginTop: 10,
  },
  tagPremium: {
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 4,
    backgroundColor: '#FEF3C7',
  },
  tagPremiumText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#92400E',
  },
  chooseBtn: {
    marginTop: 12,
    borderRadius: 999,
    backgroundColor: '#111827',
    paddingVertical: 10,
    alignItems: 'center',
  },
  chooseBtnText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 13,
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // 👉 Logout ở dưới cùng FlatList
  logoutBtn: {
    backgroundColor: '#EF4444',
    paddingVertical: 14,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoutText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
});
