import React, {useEffect, useMemo, useState} from 'react';
import {
  ActivityIndicator,
  SafeAreaView,
  ScrollView,
  View,
  Text,
  StyleSheet,
  Platform,
  Image,
} from 'react-native';
import HeaderBar from '../components/common/HeaderBar';
import Footer from '../components/common/Footer';
import {useUIFactory} from '../ui/factory/useUIFactory';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {RootStackParamList} from '../navigation/AppNavigator';

// ✅ API
import {apiHandle} from '../api/apihandle';
import {CompanyEP} from '../api/endpoint/Company';
import {User} from '../api/endpoint/user';

type Props = NativeStackScreenProps<RootStackParamList, 'Home'>;

// --- helpers ---
const pad2 = (n: number) => String(n).padStart(2, '0');
const fmtDDMMYYYY = (d: Date) =>
  `${pad2(d.getDate())}/${pad2(d.getMonth() + 1)}/${d.getFullYear()}`;
const fmtISO = (d: Date) =>
  `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;

const timeToMin = (hhmm?: string | null) => {
  if (!hhmm) return null;
  const [h, m] = hhmm.split(':').map(x => Number(x));
  if (Number.isNaN(h) || Number.isNaN(m)) return null;
  return h * 60 + m;
};

const clamp = (n: number, min: number, max: number) =>
  Math.max(min, Math.min(max, n));

const jsDayToCode = (jsDay: number) => {
  switch (jsDay) {
    case 0:
      return 'sun';
    case 1:
      return 'mon';
    case 2:
      return 'tue';
    case 3:
      return 'wed';
    case 4:
      return 'thu';
    case 5:
      return 'fri';
    case 6:
      return 'sat';
    default:
      return 'mon';
  }
};

const HomeScreen = ({navigation}: Props) => {
  const {loading, theme, lang} = useUIFactory();
  const [activeTab, setActiveTab] = useState(0);

  const [fetching, setFetching] = useState(false);
  const [errMsg, setErrMsg] = useState<string | null>(null);

  const [me, setMe] = useState<any>(null);
  const [companyPack, setCompanyPack] = useState<any>(null);

  const [avatarError, setAvatarError] = useState(false);

  useEffect(() => {
    if (loading || !theme || !lang) return;

    let mounted = true;

    const run = async () => {
      try {
        setFetching(true);
        setErrMsg(null);

        const [rMe, rCompany] = await Promise.all([
          apiHandle.callApi(User.GetMe).asPromise(),
          apiHandle.callApi(CompanyEP.GetMyCompany).asPromise(),
        ]);

        if (!mounted) return;

        if (rMe.status.isError) {
          setErrMsg(
            rMe.status.errorMessage ?? 'Không lấy được thông tin người dùng',
          );
        } else {
          const u = rMe?.res?.data?.user ?? rMe?.res?.user ?? rMe?.res;
          setMe(u);
          setAvatarError(false);
        }

        if (rCompany.status.isError) {
          setErrMsg(
            prev =>
              prev ??
              rCompany.status.errorMessage ??
              'Không lấy được thông tin công ty',
          );
        } else {
          setCompanyPack(rCompany?.res?.data ?? rCompany?.res ?? null);
        }
      } catch (e: any) {
        if (!mounted) return;
        setErrMsg(e?.message ?? String(e));
      } finally {
        if (!mounted) return;
        setFetching(false);
      }
    };

    run();

    return () => {
      mounted = false;
    };
  }, [loading, theme, lang]);

  const derived = useMemo(() => {
    const today = new Date();
    const todayISO = fmtISO(today);

    const companyFromCompanyEP =
      companyPack?.company ?? companyPack?.data?.company ?? null;
    const companyFromMe =
      me?.company_id && typeof me.company_id === 'object'
        ? me.company_id
        : null;
    const company = companyFromCompanyEP ?? companyFromMe;

    const cfg = company?.attendance_config?.working_hours;
    const start = cfg?.start_time ?? '08:00';
    const end = cfg?.end_time ?? '17:00';
    const breakStart = cfg?.break_start ?? '12:00';
    const breakEnd = cfg?.break_end ?? '13:00';

    const workingDays: string[] = Array.isArray(cfg?.working_days)
      ? cfg.working_days
      : [];
    const holidays: string[] = Array.isArray(cfg?.company_holidays)
      ? cfg.company_holidays
      : [];

    const todayCode = jsDayToCode(today.getDay());
    const isHoliday = holidays.includes(todayISO);
    const isWorkday = workingDays.includes(todayCode) && !isHoliday;

    const allowMin =
      Number(company?.attendance_config?.late_rule?.allow_minutes ?? 0) || 0;

    const logs = Array.isArray(me?.attendance_logs) ? me.attendance_logs : [];
    const todayLog = logs.find((x: any) => x?.date === todayISO);

    const checkIn = todayLog?.check_in_time ?? null;
    const checkOut = todayLog?.check_out_time ?? null;

    const nowMin = today.getHours() * 60 + today.getMinutes();
    const startMin = timeToMin(start) ?? 8 * 60;
    const endMin = timeToMin(end) ?? 17 * 60;

    const lateThreshold = startMin + allowMin;

    let canhBaoTre: {text: string; minutes: number} | null = null;

    if (isWorkday) {
      if (!checkIn) {
        if (nowMin > lateThreshold) {
          const m = nowMin - lateThreshold;
          canhBaoTre = {
            minutes: m,
            text: `Bạn đang trễ ${m} phút (chưa check-in)`,
          };
        }
      } else {
        const ciMin = timeToMin(checkIn);
        if (ciMin != null && ciMin > lateThreshold) {
          const m = ciMin - lateThreshold;
          canhBaoTre = {
            minutes: m,
            text: `Check-in trễ ${m} phút (lúc ${checkIn})`,
          };
        }
      }
    }

    const trangThaiHomNay = isHoliday
      ? 'Ngày lễ'
      : isWorkday
      ? 'Ngày làm'
      : 'Ngày nghỉ';

    const progress =
      isWorkday && endMin > startMin
        ? clamp((nowMin - startMin) / (endMin - startMin), 0, 1)
        : 0;

    const badge = isHoliday
      ? {bg: '#FEF3C7', text: '#92400E', dot: '#F59E0B'}
      : isWorkday
      ? {bg: '#DCFCE7', text: '#166534', dot: '#22C55E'}
      : {bg: '#E5E7EB', text: '#374151', dot: '#6B7280'};

    const avatarUrl: string | null = me?.avatar ?? null;
    const fullName: string = me?.full_name ?? '---';
    const initial = (fullName || 'U').trim().charAt(0).toUpperCase();

    // ✅ viền avatar theo trạng thái
    const avatarRing = isHoliday
      ? '#F59E0B'
      : isWorkday
      ? '#22C55E'
      : '#9CA3AF';

    return {
      today,
      todayISO,
      trangThaiHomNay,
      isWorkday,
      start,
      end,
      breakStart,
      breakEnd,
      allowMin,
      checkIn,
      checkOut,
      company,
      canhBaoTre,
      progress,
      badge,
      avatarUrl,
      fullName,
      initial,
      avatarRing,
    };
  }, [me, companyPack]);

  if (loading || !theme || !lang) {
    return (
      <View style={{flex: 1, alignItems: 'center', justifyContent: 'center'}}>
        <ActivityIndicator />
      </View>
    );
  }

  return (
    <SafeAreaView style={{flex: 1, backgroundColor: theme.colors.background}}>
      <HeaderBar
        title="Trang Chủ"
        isShowBackButton={false}
        isShowAvatar={false}
      />

      <ScrollView
        style={{flex: 1}}
        contentContainerStyle={{
          padding: theme.spacing(2),
          paddingTop: 86,
          paddingBottom: 100,
          flexGrow: 1,
          gap: 12,
        }}
        showsVerticalScrollIndicator={false}>
        {fetching && (
          <View
            style={{
              alignItems: 'center',
              justifyContent: 'center',
              gap: 10,
              paddingTop: 6,
            }}>
            <ActivityIndicator />
            <Text style={{color: theme.colors.mutedText}}>
              Đang tải dữ liệu...
            </Text>
          </View>
        )}

        {!fetching && !!errMsg && (
          <View
            style={[
              styles.card,
              styles.shadow,
              {
                borderColor: theme.colors.borderLight,
                backgroundColor: theme.colors.background,
              },
            ]}>
            <Text style={{color: theme.colors.text, fontWeight: '800'}}>
              Có lỗi xảy ra
            </Text>
            <Text style={{color: theme.colors.mutedText, marginTop: 6}}>
              {errMsg}
            </Text>
          </View>
        )}

        {!fetching && !errMsg && (
          <>
            {/* ✅ AVATAR - nằm 1 mình ở trên (khớp header) */}
            <View style={styles.avatarTopWrap}>
              <View
                style={[styles.avatarRing, {borderColor: derived.avatarRing}]}>
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

              <Text style={[styles.nameCenter, {color: theme.colors.text}]}>
                {derived.fullName}
              </Text>
              <Text style={{color: theme.colors.mutedText, marginTop: 2}}>
                {derived.company?.name ?? '---'} • {me?.employee_code ?? '---'}
              </Text>
            </View>

            {/* HERO CARD */}
            <View
              style={[
                styles.hero,
                styles.shadow,
                {
                  backgroundColor: theme.colors.background,
                  borderColor: theme.colors.borderLight,
                },
              ]}>
              {/* ✅ heroTop giờ chỉ còn title + badge */}
              <View style={styles.heroTop}>
                <Text style={[styles.h1, {color: theme.colors.text}]}>
                  Hôm nay • {fmtDDMMYYYY(derived.today)}
                </Text>

                <View
                  style={[styles.badge, {backgroundColor: derived.badge.bg}]}>
                  <View
                    style={[styles.dot, {backgroundColor: derived.badge.dot}]}
                  />
                  <Text style={[styles.badgeText, {color: derived.badge.text}]}>
                    {derived.trangThaiHomNay}
                  </Text>
                </View>
              </View>

              {/* ✅ Giờ làm 1 dòng, Nghỉ xuống dòng */}
              <Text style={{color: theme.colors.mutedText, marginTop: 8}}>
                Giờ làm:{' '}
                <Text style={{fontWeight: '800', color: theme.colors.text}}>
                  {derived.start}
                </Text>{' '}
                -{' '}
                <Text style={{fontWeight: '800', color: theme.colors.text}}>
                  {derived.end}
                </Text>
              </Text>

              <Text style={{color: theme.colors.mutedText, marginTop: 4}}>
                Nghỉ: {derived.breakStart}-{derived.breakEnd}
              </Text>

              {/* PROGRESS */}
              {derived.isWorkday && (
                <View style={{marginTop: 12}}>
                  <View style={styles.progressTrack}>
                    <View
                      style={[
                        styles.progressFill,
                        {width: `${Math.round(derived.progress * 100)}%`},
                      ]}
                    />
                  </View>
                  <Text
                    style={{
                      color: theme.colors.mutedText,
                      marginTop: 6,
                      fontSize: 12,
                    }}>
                    Tiến độ ca làm: {Math.round(derived.progress * 100)}%
                  </Text>
                </View>
              )}
            </View>

            {/* CHECKIN / CHECKOUT PILLS */}
            <View style={{flexDirection: 'row', gap: 10}}>
              <View
                style={[
                  styles.pillCard,
                  styles.shadow,
                  {
                    backgroundColor: theme.colors.background,
                    borderColor: theme.colors.borderLight,
                  },
                ]}>
                <Text
                  style={[styles.pillLabel, {color: theme.colors.mutedText}]}>
                  Check-in
                </Text>
                <Text style={[styles.pillValue, {color: theme.colors.text}]}>
                  {derived.checkIn ? derived.checkIn : '--:--'}
                </Text>
              </View>

              <View
                style={[
                  styles.pillCard,
                  styles.shadow,
                  {
                    backgroundColor: theme.colors.background,
                    borderColor: theme.colors.borderLight,
                  },
                ]}>
                <Text
                  style={[styles.pillLabel, {color: theme.colors.mutedText}]}>
                  Check-out
                </Text>
                <Text style={[styles.pillValue, {color: theme.colors.text}]}>
                  {derived.checkOut ? derived.checkOut : '--:--'}
                </Text>
              </View>
            </View>

            {/* RULE CARD */}
            <View
              style={[
                styles.card,
                styles.shadow,
                {
                  borderColor: theme.colors.borderLight,
                  backgroundColor: theme.colors.background,
                },
              ]}>
              <Text style={{color: theme.colors.text, fontWeight: '900'}}>
                Quy định hôm nay
              </Text>

              <View style={{height: 10}} />

              <View style={styles.row}>
                <Text
                  style={[styles.rowLabel, {color: theme.colors.mutedText}]}>
                  Cho phép trễ
                </Text>
                <Text style={[styles.rowValue, {color: theme.colors.text}]}>
                  {derived.allowMin} phút
                </Text>
              </View>

              <View style={styles.divider} />

              <View style={styles.row}>
                <Text
                  style={[styles.rowLabel, {color: theme.colors.mutedText}]}>
                  Vai trò
                </Text>
                <Text style={[styles.rowValue, {color: theme.colors.text}]}>
                  {me?.role ?? '---'}
                </Text>
              </View>
            </View>

            {/* LATE WARNING */}
            {derived.canhBaoTre && (
              <View style={[styles.alert, styles.shadow]}>
                <Text style={styles.alertTitle}>⚠️ Cảnh báo trễ giờ</Text>
                <Text style={styles.alertText}>{derived.canhBaoTre.text}</Text>
                <Text style={styles.alertHint}>
                  Tip: vào “Chấm công” và check-in ngay để tránh bị tính phạt
                  nha.
                </Text>
              </View>
            )}
          </>
        )}
      </ScrollView>

      <Footer
        activeIndex={activeTab}
        onPress={i => {
          setActiveTab(i);
        }}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 14,
  },
  hero: {
    borderRadius: 18,
    borderWidth: 1,
    padding: 16,
  },
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

  // ✅ avatar top section
  avatarTopWrap: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: -20,
    marginBottom: 8,
  },
  avatarRing: {
    width: 86,
    height: 86,
    borderRadius: 999,
    borderWidth: 3,
    padding: 3,
    backgroundColor: '#fff',
  },
  avatarBig: {
    width: '100%',
    height: '100%',
    borderRadius: 999,
  },
  avatarFallbackBig: {
    width: '100%',
    height: '100%',
    borderRadius: 999,
    backgroundColor: '#DBEAFE',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarTextBig: {
    color: '#1D4ED8',
    fontWeight: '900',
    fontSize: 28,
  },
  nameCenter: {
    marginTop: 10,
    fontSize: 18,
    fontWeight: '900',
  },

  h1: {
    fontSize: 16,
    fontWeight: '900',
  },

  heroTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10,
  },

  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: 999,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '900',
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 99,
  },

  pillCard: {
    flex: 1,
    borderRadius: 16,
    borderWidth: 1,
    padding: 14,
  },
  pillLabel: {
    fontSize: 12,
    fontWeight: '800',
  },
  pillValue: {
    marginTop: 8,
    fontSize: 18,
    fontWeight: '900',
    letterSpacing: 0.4,
  },

  progressTrack: {
    width: '100%',
    height: 10,
    borderRadius: 99,
    backgroundColor: '#E5E7EB',
    overflow: 'hidden',
    marginTop: 10,
  },
  progressFill: {
    height: 10,
    borderRadius: 99,
    backgroundColor: '#2563EB',
  },

  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  rowLabel: {
    fontSize: 13,
    fontWeight: '700',
  },
  rowValue: {
    fontSize: 13,
    fontWeight: '900',
  },
  divider: {
    height: 1,
    backgroundColor: '#E5E7EB',
    marginVertical: 10,
    opacity: 0.7,
  },

  alert: {
    borderRadius: 18,
    padding: 16,
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FECACA',
  },
  alertTitle: {
    color: '#991B1B',
    fontSize: 14,
    fontWeight: '900',
  },
  alertText: {
    color: '#7F1D1D',
    marginTop: 8,
    fontSize: 13,
    fontWeight: '700',
  },
  alertHint: {
    color: '#9F1239',
    marginTop: 8,
    fontSize: 12,
    fontWeight: '700',
    opacity: 0.9,
  },
});

export default HomeScreen;
