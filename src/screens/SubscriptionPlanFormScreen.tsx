import {useState} from 'react';
import {
  View,
  Text,
  Alert,
  StyleSheet,
  ScrollView,
  TextInput,
} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';

import HeaderBar from '../components/common/HeaderBar';
import GradientButton from '../components/common/GradientButton';
import Toast from 'react-native-toast-message';

import {SubscriptionPlans} from '../api/endpoint/SubscriptionPlans';
import {apiHandle} from '../api/apihandle';

// ================= HELPERS =================
const parseNumberOnly = (val: string) => (val || '').replace(/[^\d]/g, '');
const formatDate = (d?: string) =>
  d ? new Date(d).toLocaleString() : '';
const formatUSD = (v?: number) =>
  typeof v === 'number' ? `$${v} / 30 ngày` : '';

const SubscriptionPlanFormScreen = ({navigation, route}: any) => {
  const insets = useSafeAreaInsets();

  const plan = route?.params?.plan;
  const isView = !!plan; // có plan => xem | không có => thêm

  // ================= STATE =================
  const [code, setCode] = useState(plan?.code || '');
  const [name, setName] = useState(plan?.name || '');
  const [pricePerMonth, setPricePerMonth] = useState(
    plan?.price_per_month !== undefined
      ? String(plan.price_per_month)
      : '',
  );
  const [stripePriceId, setStripePriceId] = useState(
    plan?.stripe_price_id || '',
  );
  const [maxEmployees, setMaxEmployees] = useState(
    plan?.max_employees === null || plan?.max_employees === undefined
      ? ''
      : String(plan.max_employees),
  );
  const [description, setDescription] = useState(plan?.description || '');

  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  // ================= ADD =================
  const handleAdd = async () => {
    if (isView) return;

    if (!code.trim() || !name.trim() || !pricePerMonth || !stripePriceId.trim()) {
      Toast.show({
        type: 'error',
        text1: 'Thiếu thông tin',
        text2: 'Mã gói, tên gói, giá và Stripe Price ID là bắt buộc',
      });
      return;
    }

    const priceNumber = Number(parseNumberOnly(pricePerMonth));
    const maxEmpValue =
      maxEmployees === '' ? null : Number(parseNumberOnly(maxEmployees));

    if (isNaN(priceNumber) || priceNumber <= 0) {
      Toast.show({
        type: 'error',
        text1: 'Giá không hợp lệ',
        text2: 'Giá phải là số dương (USD)',
      });
      return;
    }

    if (maxEmpValue !== null && (isNaN(maxEmpValue) || maxEmpValue <= 0)) {
      Toast.show({
        type: 'error',
        text1: 'Số nhân viên không hợp lệ',
        text2: 'Để trống nếu không giới hạn',
      });
      return;
    }

    Alert.alert('Xác nhận', 'Tạo gói subscription mới?', [
      {text: 'Huỷ', style: 'cancel'},
      {
        text: 'Đồng ý',
        onPress: async () => {
          try {
            setSaving(true);

            const payload = {
              code: code.trim(),
              name: name.trim(),
              price_per_month: priceNumber,
              stripe_price_id: stripePriceId.trim(),
              max_employees: maxEmpValue,
              description: description.trim(),
            };

            const rs = await apiHandle
              .callApi(SubscriptionPlans.Create, payload)
              .asPromise();

            if (rs.status.isError) {
              throw new Error(rs.status.errorMessage);
            }

            Toast.show({
              type: 'success',
              text1: 'Thành công',
              text2: 'Đã tạo gói subscription mới',
            });

            navigation.goBack();
          } catch (e: any) {
            Toast.show({
              type: 'error',
              text1: 'Lỗi',
              text2: e.message || 'Không thể tạo gói subscription',
            });
          } finally {
            setSaving(false);
          }
        },
      },
    ]);
  };

  // ================= DELETE =================
  const handleDelete = () => {
    if (!plan?._id) return;

    Alert.alert(
      'Xoá gói subscription',
      `Bạn có chắc muốn xoá gói "${plan.name}" không?\n\nHành động này sẽ ẩn gói khỏi hệ thống.`,
      [
        {text: 'Huỷ', style: 'cancel'},
        {
          text: 'Xoá',
          style: 'destructive',
          onPress: async () => {
            try {
              setDeleting(true);

              const rs = await apiHandle
                .callApi(SubscriptionPlans.Delete(plan._id))
                .asPromise();

              if (rs.status.isError) {
                throw new Error(rs.status.errorMessage);
              }

              Toast.show({
                type: 'success',
                text1: 'Đã xoá',
                text2: 'Gói subscription đã được xoá',
              });

              navigation.goBack();
            } catch (e: any) {
              Toast.show({
                type: 'error',
                text1: 'Lỗi',
                text2: e.message || 'Không thể xoá gói subscription',
              });
            } finally {
              setDeleting(false);
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
        title={isView ? 'Xem gói tháng' : 'Thêm gói tháng'}
        onBack={() => navigation.goBack()}
        topInset={insets.top}
      />

      <ScrollView contentContainerStyle={styles.content}>
        {/* ===== VIEW INFO ===== */}
        {isView && (
          <>
            <View style={styles.highlightBox}>
              <Text style={styles.highlightTitle}>Giá</Text>
              <Text style={styles.highlightValue}>
                {formatUSD(plan?.price_per_month)}
              </Text>
            </View>

            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Stripe Price ID</Text>
              <Text style={styles.infoValue}>
                {plan?.stripe_price_id}
              </Text>
            </View>

            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Ngày tạo</Text>
              <Text style={styles.infoValue}>
                {formatDate(plan?.created_at)}
              </Text>
            </View>

            <View style={styles.divider} />
          </>
        )}

        {/* ===== FORM ===== */}
        <Text style={styles.label}>Mã gói</Text>
        <TextInput
          style={[styles.input, isView && styles.inputDisabled]}
          value={code}
          onChangeText={setCode}
          editable={!isView}
        />

        <Text style={styles.label}>Tên gói</Text>
        <TextInput
          style={[styles.input, isView && styles.inputDisabled]}
          value={name}
          onChangeText={setName}
          editable={!isView}
        />

        {!isView && (
          <>
            <Text style={styles.label}>Giá (USD / 30 ngày)</Text>
            <TextInput
              style={styles.input}
              value={pricePerMonth}
              onChangeText={t => setPricePerMonth(parseNumberOnly(t))}
              keyboardType="numeric"
            />

            <Text style={styles.label}>Stripe Price ID</Text>
            <TextInput
              style={styles.input}
              value={stripePriceId}
              onChangeText={setStripePriceId}
              autoCapitalize="none"
            />
          </>
        )}

        <Text style={styles.label}>
          Số nhân viên tối đa (để trống nếu không giới hạn)
        </Text>
        <TextInput
          style={[styles.input, isView && styles.inputDisabled]}
          value={maxEmployees}
          onChangeText={t => setMaxEmployees(parseNumberOnly(t))}
          keyboardType="numeric"
          editable={!isView}
        />

        <Text style={styles.label}>Mô tả</Text>
        <TextInput
          style={[
            styles.input,
            styles.multiline,
            isView && styles.inputDisabled,
          ]}
          value={description}
          onChangeText={setDescription}
          multiline
          editable={!isView}
        />
      </ScrollView>

      {/* ===== FOOTER ===== */}
      <View style={styles.footer}>
        {!isView ? (
          <GradientButton
            text={saving ? 'Đang tạo...' : 'Tạo gói mới'}
            onPress={handleAdd}
          />
        ) : (
          <GradientButton
            text={deleting ? 'Đang xoá...' : '🗑️ Xoá gói này'}
            onPress={handleDelete}
            variant="danger"
          />
        )}
      </View>
    </View>
  );
};

export default SubscriptionPlanFormScreen;

// ================= STYLE =================
const styles = StyleSheet.create({
  container: {flex: 1, backgroundColor: '#F5F6FA'},
  content: {padding: 20, paddingBottom: 40},

  label: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 6,
    color: '#2C3E50',
  },

  input: {
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    marginBottom: 16,
    color: '#111827',
  },

  inputDisabled: {
    backgroundColor: '#E5E7EB',
    color: '#6B7280',
  },

  multiline: {
    minHeight: 90,
    textAlignVertical: 'top',
  },

  divider: {
    height: 1,
    backgroundColor: '#E5E7EB',
    marginBottom: 16,
  },

  infoRow: {
    marginBottom: 12,
  },

  infoLabel: {
    fontSize: 13,
    color: '#6B7280',
    fontWeight: '600',
  },

  infoValue: {
    fontSize: 14,
    color: '#111827',
    fontWeight: '700',
  },

  highlightBox: {
    backgroundColor: '#ECFDF5',
    borderColor: '#6EE7B7',
    borderWidth: 1,
    borderRadius: 14,
    padding: 16,
    marginBottom: 16,
  },

  highlightTitle: {
    fontSize: 13,
    color: '#065F46',
    fontWeight: '700',
  },

  highlightValue: {
    fontSize: 18,
    fontWeight: '900',
    color: '#047857',
    marginTop: 4,
  },

  footer: {
    padding: 20,
  },
});
