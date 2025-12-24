import {useEffect, useMemo, useState} from 'react';
import {
  ActivityIndicator,
  Image,
  Platform,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import HeaderBar from '../components/common/HeaderBar';
import Footer from '../components/common/Footer';

import {apiHandle} from '../api/apihandle';
import {CompanyEP} from '../api/endpoint/Company';
import {User} from '../api/endpoint/User';

/* ---------- helpers ---------- */
const pad2 = (n: number) => String(n).padStart(2, '0');
const fmtDDMMYYYY = (d: Date) =>
  `${pad2(d.getDate())}/${pad2(d.getMonth() + 1)}/${d.getFullYear()}`;

const HomeAdminScreen = () => {
  const [loading, setLoading] = useState(true);
  const [errMsg, setErrMsg] = useState<string | null>(null);

  const [me, setMe] = useState<any>(null);
  const [companyPack, setCompanyPack] = useState<any>(null);
  const [stats, setStats] = useState<any>(null);

  const [avatarError, setAvatarError] = useState(false);

  // ======================= LOAD MAIN DATA =======================
  useEffect(() => {
    let mounted = true;

    const run = async () => {
      try {
        setLoading(true);
        setErrMsg(null);

        const [rMe, rCompany] = await Promise.all([
          apiHandle.callApi(User.GetMe).asPromise(),
          apiHandle.callApi(CompanyEP.GetMyCompany).asPromise(),
        ]);

        if (!mounted) return;

        if (!rMe.status.isError) {
          const u = rMe?.res?.data?.user ?? rMe?.res?.user ?? rMe?.res;
          setMe(u);
          setAvatarError(false);
        } else {
          setErrMsg(rMe.status.errorMessage ?? 'Không lấy được user');
        }

        if (!rCompany.status.isError) {
          setCompanyPack(rCompany?.res?.data ?? rCompany?.res ?? null);
        } else {
          setErrMsg(prev => prev ?? 'Không lấy được công ty');
        }
      } catch (e: any) {
        if (!mounted) return;
        setErrMsg(e?.message ?? String(e));
      } finally {
        if (!mounted) return;
        setLoading(false);
      }
    };

    run();
    return () => {
      mounted = false;
    };
  }, []);

  // ======================= DERIVED DATA =======================
  const derived = useMemo(() => {
    const today = new Date();
    const fullName = me?.full_name ?? '---';
    const initial = fullName.charAt(0).toUpperCase();

    const companyFromCompanyEP =
      companyPack?.company ?? companyPack?.data?.company ?? null;
    const companyFromMe =
      me?.company_id && typeof me.company_id === 'object'
        ? me.company_id
        : null;

    const company = companyFromCompanyEP ?? companyFromMe;

    return {
      today,
      avatarUrl: me?.avatar ?? null,
      fullName,
      initial,
      employeeCode: me?.employee_code ?? '---',

      companyName: company?.name ?? '---',
      companyCode: company?.code ?? '---',
      companyEmail: company?.email ?? '---',
      companyPhone: company?.phone ?? '---',
      companyAddress: company?.address ?? '---',
      companyStatus: company?.active ? 'Hoạt động' : 'Ngưng hoạt động',
      companyCreatedAt: company?.created_at
        ? fmtDDMMYYYY(new Date(company.created_at))
        : '---',
      companyId: company?._id ?? null,
    };
  }, [me, companyPack]);

  // ======================= LOAD STATS =======================
  useEffect(() => {
    if (!derived.companyId) return;

    let mounted = true;

    (async () => {
      try {
        const r = await apiHandle
          .callApi(CompanyEP.GetUserStats(derived.companyId))
          .asPromise();
        if (mounted) setStats(r?.res ?? null);
      } catch (e) {
        console.log('❌ load stats error', e);
      }
    })();

    return () => {
      mounted = false;
    };
  }, [derived.companyId]);

  // ======================= LOADING =======================
  if (loading) {
    return (
      <View style={{flex: 1, justifyContent: 'center'}}>
        <ActivityIndicator />
      </View>
    );
  }

  // ======================= ERROR =======================
  if (errMsg) {
    return (
      <SafeAreaView style={{flex: 1, backgroundColor: '#F5F6FA'}}>
        <HeaderBar
          title="Trang chủ quản trị"
          isShowBackButton={false}
          isShowAvatar={false}
        />
        <View style={{padding: 16, paddingTop: 86}}>
          <View style={[styles.card, styles.shadow]}>
            <Text style={{fontWeight: '900'}}>Có lỗi xảy ra</Text>
            <Text style={{marginTop: 6, color: '#6b7280'}}>{errMsg}</Text>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  // ======================= UI =======================
  return (
    <SafeAreaView style={{flex: 1, backgroundColor: '#F5F6FA'}}>
      <HeaderBar
        title="Trang chủ quản trị"
        isShowBackButton={false}
        isShowAvatar={false}
      />

      <ScrollView
        contentContainerStyle={{
          padding: 16,
          paddingTop: 86,
          paddingBottom: 100,
          gap: 12,
        }}>
        {/* AVATAR */}
        <View style={styles.avatarTopWrap}>
          <View style={styles.avatarRing}>
            {!!derived.avatarUrl && !avatarError ? (
              <Image
                source={{uri: derived.avatarUrl}}
                style={styles.avatarBig}
                onError={() => setAvatarError(true)}
              />
            ) : (
              <View style={styles.avatarFallbackBig}>
                <Text style={styles.avatarTextBig}>{derived.initial}</Text>
              </View>
            )}
          </View>

          <Text style={styles.nameCenter}>{derived.fullName}</Text>
          <Text style={styles.subText}>
            {derived.companyName} • {derived.employeeCode}
          </Text>
        </View>

        {/* HERO */}
        <View style={[styles.hero, styles.shadow]}>
          <Text style={styles.h1}>
            Hôm nay • {fmtDDMMYYYY(derived.today)}
          </Text>
          <Text style={styles.muted}>Dashboard quản trị</Text>
        </View>

        {/* COMPANY INFO */}
        <View style={[styles.card, styles.shadow]}>
          <Text style={styles.sectionTitle}>🏢 Thông tin công ty</Text>

          <InfoRow label="Tên công ty" value={derived.companyName} />
          <InfoRow label="Mã công ty" value={derived.companyCode} />
          <InfoRow label="Email" value={derived.companyEmail} />
          <InfoRow label="Số điện thoại" value={derived.companyPhone} />
          <InfoRow label="Địa chỉ" value={derived.companyAddress} />
          <InfoRow label="Trạng thái" value={derived.companyStatus} />
          <InfoRow label="Ngày tạo" value={derived.companyCreatedAt} />
        </View>

        {/* STATS */}
        <View style={[styles.card, styles.shadow]}>
          <Text style={styles.sectionTitle}>👥 Thống kê nhân sự</Text>

          {stats ? (
            <View style={styles.statsRow}>
              <StatBox label="Tổng" value={stats.total_users} color="#2563EB" />
              <StatBox
                label="Hoạt động"
                value={stats.active_users}
                color="#16a34a"
              />
              <StatBox
                label="Ngưng"
                value={stats.inactive_users}
                color="#ef4444"
              />
            </View>
          ) : (
            <Text style={styles.muted}>Đang tải thống kê...</Text>
          )}
        </View>
      </ScrollView>

      <Footer activeIndex={0} onPress={() => {}} />
    </SafeAreaView>
  );
};

export default HomeAdminScreen;

/* ---------- components ---------- */
const StatBox = ({label, value, color}: any) => (
  <View style={[styles.statBox, {borderColor: color}]}>
    <Text style={[styles.statValue, {color}]}>{value}</Text>
    <Text style={styles.statLabel}>{label}</Text>
  </View>
);

const InfoRow = ({label, value}: {label: string; value: string}) => (
  <View style={styles.infoRow}>
    <Text style={styles.infoLabel}>{label}</Text>
    <Text style={styles.infoValue}>{value}</Text>
  </View>
);

/* ---------- styles ---------- */
const styles = StyleSheet.create({
  hero: {backgroundColor: '#fff', borderRadius: 18, padding: 16},
  card: {backgroundColor: '#fff', borderRadius: 18, padding: 16},
  shadow: {
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOpacity: 0.08,
        shadowRadius: 12,
        shadowOffset: {width: 0, height: 6},
      },
      android: {elevation: 3},
    }),
  },

  avatarTopWrap: {alignItems: 'center', marginTop: -20, marginBottom: 8},
  avatarRing: {
    width: 86,
    height: 86,
    borderRadius: 999,
    borderWidth: 3,
    borderColor: '#2563EB',
    padding: 3,
  },
  avatarBig: {width: '100%', height: '100%', borderRadius: 999},
  avatarFallbackBig: {
    flex: 1,
    borderRadius: 999,
    backgroundColor: '#DBEAFE',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarTextBig: {fontSize: 28, fontWeight: '900', color: '#1D4ED8'},

  nameCenter: {marginTop: 10, fontSize: 18, fontWeight: '900'},
  subText: {color: '#6b7280', marginTop: 2},

  h1: {fontSize: 16, fontWeight: '900'},
  muted: {marginTop: 4, color: '#6b7280'},

  sectionTitle: {fontSize: 16, fontWeight: '900', marginBottom: 12},
  statsRow: {flexDirection: 'row', justifyContent: 'space-between'},

  statBox: {
    flex: 1,
    borderWidth: 1.5,
    borderRadius: 14,
    paddingVertical: 16,
    marginHorizontal: 4,
    alignItems: 'center',
  },
  statValue: {fontSize: 20, fontWeight: '900'},
  statLabel: {
    fontSize: 12,
    color: '#6b7280',
    fontWeight: '600',
    marginTop: 4,
  },

  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 0.5,
    borderBottomColor: '#E5E7EB',
  },
  infoLabel: {color: '#6b7280', fontSize: 13, fontWeight: '600'},
  infoValue: {
    color: '#111827',
    fontSize: 13,
    fontWeight: '700',
    maxWidth: '60%',
    textAlign: 'right',
  },
});
