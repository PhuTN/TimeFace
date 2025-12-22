// ⭐ GIỮ NGUYÊN IMPORT
import {useEffect, useMemo, useState} from 'react';
import {
  FlatList,
  ListRenderItem,
  PermissionsAndroid,
  Platform,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import {NativeStackScreenProps} from '@react-navigation/native-stack';
import Footer from '../components/common/Footer';
import GradientButton from '../components/common/GradientButton';
import HeaderBar from '../components/common/HeaderBar.tsx';
import {useUIFactory} from '../ui/factory/useUIFactory';

import EmployeeAttendanceFilterModal, {
  AttendanceFilterValues,
} from '../components/common/EmployeeAttendanceFilterModal';
import FilterChip from '../components/common/FilterChip.tsx';

import CalendarIcon from '../assets/icons/calendar_icon.svg';
import ClockIcon from '../assets/icons/clock_icon.svg';
import FilterIcon from '../assets/icons/filter_icon.svg';

import Geolocation from '@react-native-community/geolocation';
import Toast from 'react-native-toast-message';
import {apiHandle} from '../api/apihandle.ts';
import {CompanyEP} from '../api/endpoint/Company.ts';
import {User} from '../api/endpoint/user.ts';
import CheckinComplaintAddModal from '../components/modals/add-modals/CheckinComplaintAddModal.tsx';
import {RootStackParamList} from '../navigation/AppNavigator';

type Props = NativeStackScreenProps<RootStackParamList, 'EmployeeAttendance'>;

const EmployeeAttendanceScreen = ({navigation}: Props) => {
  const {loading, theme, lang} = useUIFactory();

  // ⭐ STATE
  const [activeTab, setActiveTab] = useState(2);
  const [showFilter, setShowFilter] = useState(false);
  const [filters, setFilters] = useState<AttendanceFilterValues>({
    startDate: '',
    endDate: '',
  });
  // report modal
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportType, setReportType] = useState<'check_in' | 'check_out' | null>(
    null,
  );

  // trạng thái đã report hôm nay
  const [reportedToday, setReportedToday] = useState<{
    check_in: boolean;
    check_out: boolean;
  }>({
    check_in: false,
    check_out: false,
  });
  const [isOutsideArea, setIsOutsideArea] = useState(false);

  // ⭐ DATA FROM API
  const [companyInfo, setCompanyInfo] = useState<any>(null);
  const [userInfo, setUserInfo] = useState<any>(null);
  const [history, setHistory] = useState<any[]>([]);
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth(); // 0–11

  // =====================================
  // ⭐ FETCH GET CHECKIN-INFO
  // =====================================
  useEffect(() => {
    const fetchCheckinInfo = async () => {
      const {status, res} = await apiHandle
        .callApi(CompanyEP.GetCheckinInfo)
        .asPromise();

      if (status.isError) {
        console.log('❌ error getCheckinInfo', status.errorMessage);
        return;
      }

      console.log('📌 DATA GETCHECKIN:', res);

      setCompanyInfo(res?.company ?? null);
      setUserInfo(res?.user ?? null);

      // ⭐ SET LỊCH SỬ CHẤM CÔNG
      setHistory(res?.user?.attendance_logs ?? []);

      const todayStr = new Date().toISOString().slice(0, 10);

      const todayComplaints =
        res?.user?.checkin_complaints?.filter(
          (c: any) => c.date === todayStr && c.status !== 'rejected',
        ) ?? [];

      setReportedToday({
        check_in: todayComplaints.some(c => c.action === 'check_in'),
        check_out: todayComplaints.some(c => c.action === 'check_out'),
      });
    };

    fetchCheckinInfo();
  }, []);

  // useEffect(() => {
  //   const fetchComplaints = async () => {
  //     const {status, res} = await apiHandle
  //       .callApi(User.GetMyCheckinComplaints)
  //       .asPromise();

  //     if (status.isError) return;

  //     const todayStr = new Date().toISOString().slice(0, 10);

  //     const todayComplaints = res?.complaints?.filter(c => c.date === todayStr);

  //     setReportedToday({
  //       check_in: todayComplaints?.some(c => c.type === 'check_in') ?? false,
  //       check_out: todayComplaints?.some(c => c.type === 'check_out') ?? false,
  //     });
  //   };

  //   fetchComplaints();
  // }, []);

  // =====================================
  // ⭐ TÍNH GIỜ HÔM NAY
  // =====================================
  const today = new Date().toISOString().slice(0, 10); // "2025-12-11"
  const todayLog = history.find(h => h.date === today);
  const todayHours = todayLog?.total_hours ?? 0;

  const isCheckedIn = !!todayLog?.check_in_time;
  const isCheckedOut = !!todayLog?.check_out_time;

  // ============================
  // ⭐ TÍNH TRẠNG THÁI HÔM NAY
  // ============================

  const attendanceCfg = companyInfo?.attendance_config?.working_hours;
  const isFakeTime = false; // 👈 bật/tắt fake
  const fakeNow = new Date('2025-12-16T08:30:00'); // 👈 chỉnh giờ bạn muốn test
  const todayDate = isFakeTime ? fakeNow : new Date();
  const todayStr = todayDate.toISOString().slice(0, 10);

  // map JS day → mon/tue/...
  const dayMap = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'];
  const todayKey = dayMap[todayDate.getDay()];

  // 1️⃣ Không phải ngày làm
  const isWorkingDay = attendanceCfg?.working_days?.includes(todayKey);

  // 2️⃣ Ngày nghỉ lễ
  const isHoliday = attendanceCfg?.company_holidays?.includes(todayStr);

  // 3️⃣ Deadline check-in
  const startTime = attendanceCfg?.start_time; // "09:00"
  const allowMinutes = Number(
    companyInfo?.attendance_config?.late_rule?.allow_minutes ?? 0,
  );

  const checkInDeadline = (() => {
    if (!startTime) return null;
    const [h, m] = startTime.split(':').map(Number);
    const d = new Date(todayStr);
    d.setHours(h, m + allowMinutes, 0, 0);
    return d;
  })();

  const nowTime = isFakeTime ? fakeNow : new Date();
  const maxLateAbsentMinutes = Number(
    companyInfo?.attendance_config?.late_rule?.max_late_as_absent_minutes ?? 0,
  );
  const absentDeadline = (() => {
    if (!startTime) return null;
    const [h, m] = startTime.split(':').map(Number);
    const d = new Date(todayStr);
    d.setHours(h, m + maxLateAbsentMinutes, 0, 0);
    return d;
  })();
  // 4️⃣ Trạng thái hôm nay
  let todayStatus: 'OFF' | 'HOLIDAY' | 'ABSENT' | 'CHECKED_OUT' | null;

  // ✅ coi như đã check-in / check-out nếu đã khiếu nại
  const isCheckedInEffective =
    !!todayLog?.check_in_time || reportedToday.check_in;

  const isCheckedOutEffective =
    !!todayLog?.check_out_time || reportedToday.check_out;
  const isProfileApproved = userInfo?.profile_approved === true;
  // ============================
  // ⭐ XÁC ĐỊNH TRẠNG THÁI HÔM NAY
  // ============================

  if (!isWorkingDay) {
    todayStatus = 'OFF';
  } else if (isHoliday) {
    todayStatus = 'HOLIDAY';
  } else if (
    !isCheckedInEffective &&
    absentDeadline && // deadline = start_time + max_late_as_absent_minutes
    nowTime > absentDeadline
  ) {
    // ❗ quá giới hạn → coi như vắng
    todayStatus = 'ABSENT';
  } else if (isCheckedOutEffective) {
    todayStatus = 'CHECKED_OUT';
  } else {
    // ⭐ còn lại:
    // - chưa checkin
    // - hoặc đã checkin nhưng chưa checkout
    // => cho thao tác bình thường
    todayStatus = null;
  }

  // ============================
  // ⭐ BUTTON CONFIG
  // ============================

  const noop = () => {
    console.log('NEEEEEE');
  };

  const buttonConfig = useMemo(() => {
    // ❌ CHƯA DUYỆT HỒ SƠ → KHÓA TOÀN BỘ
    if (!isProfileApproved) {
      return {
        text: 'Hồ sơ chưa được duyệt',
        disabled: true,
        onPress: noop,
      };
    }

    switch (todayStatus) {
      case 'OFF':
        return {
          text: 'Hôm nay không làm việc',
          disabled: true,
          onPress: noop,
        };

      case 'HOLIDAY':
        return {
          text: 'Hôm nay là ngày nghỉ lễ',
          disabled: true,
          onPress: noop,
        };

      case 'ABSENT':
        return {
          text: 'Hôm nay vắng mặt',
          disabled: true,
          onPress: noop,
        };

      case 'CHECKED_OUT':
        return {
          text: 'Đã hoàn thành hôm nay',
          disabled: true,
          onPress: noop,
        };

      default:
        if (isCheckedInEffective) {
          return {
            text: 'Check-out',
            disabled: false,
            onPress: handleCheckOut,
          };
        }

        return {
          text: 'Check-in',
          disabled: false,
          onPress: handleCheckIn,
        };
    }
  }, [isProfileApproved, todayStatus, isCheckedInEffective, isOutsideArea]);

  // =====================================
  // ⭐ FILTER (GIỮ NGUYÊN)
  // =====================================
  const activeChips = useMemo(() => {
    const arr: any[] = [];
    if (filters.startDate.trim()) {
      arr.push({
        key: 'startDate',
        mainText: lang?.t('filter_start_date') ?? 'Ngày bắt đầu',
        subText: filters.startDate.trim(),
      });
    }
    if (filters.endDate.trim()) {
      arr.push({
        key: 'endDate',
        mainText: lang?.t('filter_end_date') ?? 'Ngày kết thúc',
        subText: filters.endDate.trim(),
      });
    }
    return arr;
  }, [filters]);

  const renderItem: ListRenderItem<any> = ({item}) => {
    // đổi date → dd/MM/yyyy
    const d = new Date(item.date);
    const formatted = `${String(d.getDate()).padStart(2, '0')}/${String(
      d.getMonth() + 1,
    ).padStart(2, '0')}/${d.getFullYear()}`;

    return (
      <View
        style={[
          styles.historyCard,
          {backgroundColor: theme.colors.background},
        ]}>
        <View style={{flexDirection: 'row', alignItems: 'center', gap: 8}}>
          <View style={styles.historyIconBox}>
            <CalendarIcon width={20} height={20} />
          </View>
          <Text style={[styles.historyDate, {color: theme.colors.text}]}>
            {formatted}
          </Text>
        </View>

        <View style={styles.historyRow}>
          <View style={{flex: 1}}>
            <Text style={styles.historyLabel}>
              {lang?.t('attendance_total_hours')}
            </Text>
            <Text style={[styles.historyValue, {color: theme.colors.text}]}>
              {item.total_hours ?? 0} Giờ
            </Text>
          </View>

          <View style={{flex: 1}}>
            <Text style={styles.historyLabel}>
              {lang?.t('attendance_check_in_out')}
            </Text>
            <Text style={[styles.historyValue, {color: theme.colors.text}]}>
              {(item.check_in_time ?? '--:--') +
                ' — ' +
                (item.check_out_time ?? '--:--')}
            </Text>
          </View>
        </View>
      </View>
    );
  };

  // =====================================
  // ⭐ CHECK-IN (GIỮ NGUYÊN LOGIC)
  // =====================================
  const requestLocationPermission = async () => {
    if (Platform.OS === 'android') {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
      );
      return granted === PermissionsAndroid.RESULTS.GRANTED;
    }
    return true;
  };

  const getCurrentLocation = async (ok, fail) => {
    try {
      // ⚠️ Android cần xin cả FINE + COARSE
      if (Platform.OS === 'android') {
        const fine = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
        );

        const coarse = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.ACCESS_COARSE_LOCATION,
        );

        if (
          fine !== PermissionsAndroid.RESULTS.GRANTED &&
          coarse !== PermissionsAndroid.RESULTS.GRANTED
        ) {
          console.log('❌ Location permission denied');
          fail({message: 'Permission denied'});
          return;
        }
      }

      Geolocation.getCurrentPosition(
        pos => {
          console.log('📍 GPS OK:', pos.coords);
          ok(pos.coords);
        },
        err => {
          console.log('❌ GPS ERROR:', err);
          fail(err);
        },
        {
          enableHighAccuracy: false, // 🔥 QUAN TRỌNG NHẤT
          timeout: 30000, // 🔥 tăng timeout
          maximumAge: 10000,
        },
      );
    } catch (e) {
      console.log('❌ GPS EXCEPTION:', e);
      fail(e);
    }
  };

  // ============================
  // ⭐ CHECK-IN
  // ============================
  const handleCheckIn = async () => {
    try {
      // 1️⃣ Xin quyền GPS
      const hasPermission = await requestLocationPermission();
      if (!hasPermission) {
        Toast.show({type: 'error', text1: 'Bật GPS để check-in'});
        return;
      }

      // 2️⃣ Lấy tọa độ thật
      getCurrentLocation(
        async coords => {
          const {latitude, longitude} = coords;

          // 3️⃣ Check vị trí với BE
          const {status, res} = await apiHandle
            .callApi(User.LocationCheck, {
              lat: latitude,
              lng: longitude,
            })
            .asPromise();

          if (status.isError) {
            Toast.show({type: 'error', text1: 'Lỗi kiểm tra khu vực'});
            return;
          }

          if (!res?.data?.allowed) {
            setIsOutsideArea(true);
            Toast.show({
              type: 'error',
              text1: 'Ngoài khu vực công ty',
            });
            return;
          }

          // 4️⃣ OK → vào Face Detection (CHECK-IN)
          setIsOutsideArea(false);

          navigation.navigate('EmployeeFaceDetection', {
            type: 'check_in', // ⭐ BẮT BUỘC
            locationToken: res.data.token,
            expiresAt: res.data.expires_at,
          });
        },
        () => {
          Toast.show({type: 'error', text1: 'Không thể lấy GPS'});
        },
      );
    } catch (e) {
      Toast.show({type: 'error', text1: 'Lỗi hệ thống'});
    }
  };

  // ============================
  // ⭐ CHECK-OUT
  // ============================

  const monthLogs = history.filter(log => {
    if (!log.check_out_time) return false; // chưa checkout thì bỏ
    const d = new Date(log.date);
    return d.getFullYear() === currentYear && d.getMonth() === currentMonth;
  });
  const monthHours = monthLogs.reduce(
    (sum, log) => sum + (log.total_hours ?? 0),
    0,
  );

  // Format giờ 2 chữ số thập phân (ví dụ 0 -> 0.00)
  const formatHours = (val: number) => Number(val || 0).toFixed(2);

  const handleCheckOut = async () => {
    try {
      // 1️⃣ Xin quyền GPS
      const hasPermission = await requestLocationPermission();
      if (!hasPermission) {
        Toast.show({type: 'error', text1: 'Bật GPS để check-out'});
        return;
      }

      // 2️⃣ Lấy tọa độ
      getCurrentLocation(
        async coords => {
          const {latitude, longitude} = coords;

          // 3️⃣ Check vị trí
          const {status, res} = await apiHandle
            .callApi(User.LocationCheck, {
              lat: latitude,
              lng: longitude,
            })
            .asPromise();

          if (status.isError || !res?.data?.allowed) {
            setIsOutsideArea(true);
            Toast.show({
              type: 'error',
              text1: 'Ngoài khu vực công ty',
            });
            return;
          }

          // 4️⃣ OK → vào Face Detection (CHECK-OUT)
          setIsOutsideArea(false);

          navigation.navigate('EmployeeFaceDetection', {
            type: 'check_out', // ⭐ BẮT BUỘC
            locationToken: res.data.token,
            expiresAt: res.data.expires_at,
          });
        },
        () => {
          Toast.show({type: 'error', text1: 'Không thể lấy GPS'});
        },
      );
    } catch (e) {
      Toast.show({type: 'error', text1: 'Lỗi hệ thống'});
    }
  };

  // =====================================
  // ⭐ RENDER MÀN HÌNH
  // =====================================

  const parseDDMMYYYY = (value?: string) => {
    if (!value) return null;
    const [day, month, year] = value.split(/[/-]/).map(Number);
    if (!day || !month || !year) return null;
    const d = new Date(year, month - 1, day);
    return Number.isNaN(d.getTime()) ? null : d;
  };
  const filteredHistory = useMemo(() => {
    const start = parseDDMMYYYY(filters.startDate);
    const end = parseDDMMYYYY(filters.endDate);

    const endInclusive = end
      ? new Date(
          end.getFullYear(),
          end.getMonth(),
          end.getDate(),
          23,
          59,
          59,
          999,
        )
      : null;

    const filtered = history.filter(item => {
      const d = new Date(item.date); // item.date = yyyy-MM-dd
      if (start && d < start) return false;
      if (endInclusive && d > endInclusive) return false;
      return true;
    });

    // Sắp xếp ngày mới nhất ở trên
    return filtered.sort(
      (a, b) => +new Date(b.date) - +new Date(a.date),
    );
  }, [history, filters]);

  if (loading || !theme || !lang) return null;
  const styles = makeStyles(theme);

  return (
    <SafeAreaView style={{flex: 1, backgroundColor: theme.colors.background}}>
      <HeaderBar title={lang.t('attendance_title')} isShowBackButton={false} />

      <ScrollView>
        <View style={styles.screen}>
          {/* ⭐ SUMMARY BOX — KHÔNG ĐỔI UI */}
          <View style={styles.summaryBox}>
            <Text
              style={[styles.summaryLabel, {color: theme.colors.mutedText}]}>
              {lang.t('attendance_summary_title')}
            </Text>

            <View style={styles.summaryStatsRow}>
              <View style={styles.summaryStat}>
                <View style={{flexDirection: 'row'}}>
                  <ClockIcon width={18} height={18} />
                  <Text style={[styles.summaryStatLabel, {marginLeft: 5}]}>
                    {lang.t('attendance_today')}
                  </Text>
                </View>

                <Text
                  style={[styles.summaryStatValue, {color: theme.colors.text}]}>
                  {formatHours(todayHours)}{' '}
                  <Text style={styles.gradientText}>Giờ</Text>
                </Text>
              </View>

              <View style={{width: 10}} />

              <View style={styles.summaryStat}>
                <View style={{flexDirection: 'row'}}>
                  <ClockIcon width={18} height={18} />
                  <Text style={[styles.summaryStatLabel, {marginLeft: 5}]}>
                    {lang.t('attendance_this_month')}
                  </Text>
                </View>
                <Text
                  style={[styles.summaryStatValue, {color: theme.colors.text}]}>
                  {formatHours(monthHours)}{' '}
                  <Text style={{fontSize: 13}}>Giờ</Text>
                </Text>
              </View>
            </View>

            {/* ⭐ GIỮ GIAO DIỆN — CHỈ ĐỔI LOGIC */}
            <View style={{gap: 10}}>
              <GradientButton
                text={buttonConfig.text}
                colors={['#002AFF', '#002AFF']}
                borderRadius={16}
                disabled={buttonConfig.disabled}
                onPress={() => {
                  // ❌ disable thì khỏi làm gì
                  if (buttonConfig.disabled) {
                    console.log('⛔ Button disabled');
                    return;
                  }

                  // ❌ ngoài khu vực
                  // if (isOutsideArea) {
                  //   console.log('⛔ Outside area');
                  //   return;
                  // }

                  // ❌ trạng thái khoá
                  if (
                    todayStatus === 'OFF' ||
                    todayStatus === 'HOLIDAY' ||
                    todayStatus === 'ABSENT' ||
                    todayStatus === 'CHECKED_OUT'
                  ) {
                    console.log('⛔ Blocked by status:', todayStatus);
                    return;
                  }

                  // ✅ đã check-in → check-out
                  if (isCheckedInEffective) {
                    console.log('➡️ CHECK-OUT');
                    handleCheckOut();
                    return;
                  }

                  // ✅ chưa check-in → check-in
                  console.log('➡️ CHECK-IN');
                  handleCheckIn();
                }}
                style={styles.mainAction}
              />

              {/* ===== REPORT BUTTON ===== */}
              {(() => {
                if (!isProfileApproved) {
                  return (
                    <View style={styles.reportedBox}>
                      <Text style={styles.reportedText}>
                        Liên hệ admin duyệt hồ sơ của bạn
                      </Text>
                    </View>
                  );
                }
                // ❌ VẮNG MẶT → KHÔNG BÁO LỖI GÌ HẾT
                if (todayStatus === 'ABSENT') {
                  return null;
                }

                // ===== REPORT CHECK-IN =====
                if (!isCheckedInEffective && !reportedToday.check_in) {
                  return (
                    <TouchableOpacity
                      style={styles.reportButton}
                      onPress={() => {
                        setReportType('check_in');
                        setShowReportModal(true);
                      }}>
                      <Text style={styles.reportText}>Báo lỗi check-in</Text>
                    </TouchableOpacity>
                  );
                }

                if (reportedToday.check_in && !isCheckedInEffective) {
                  return (
                    <View style={styles.reportedBox}>
                      <Text style={styles.reportedText}>
                        Đã gửi khiếu nại check-in
                      </Text>
                    </View>
                  );
                }

                // ===== REPORT CHECK-OUT =====
                if (
                  isCheckedInEffective &&
                  !isCheckedOutEffective &&
                  !reportedToday.check_out
                ) {
                  return (
                    <TouchableOpacity
                      style={styles.reportButton}
                      onPress={() => {
                        setReportType('check_out');
                        setShowReportModal(true);
                      }}>
                      <Text style={styles.reportText}>Báo lỗi check-out</Text>
                    </TouchableOpacity>
                  );
                }

                if (reportedToday.check_out && !isCheckedOutEffective) {
                  return (
                    <View style={styles.reportedBox}>
                      <Text style={styles.reportedText}>
                        Đã gửi khiếu nại check-out
                      </Text>
                    </View>
                  );
                }

                return null;
              })()}
            </View>
          </View>

          {/* ⭐ FILTER + LIST Y CHANG UI CŨ */}
          <View style={styles.filterHeader}>
            <Text style={[styles.sectionTitle, {color: theme.colors.text}]}>
              {lang.t('attendance_list')}
            </Text>
            <TouchableOpacity
              style={styles.filterIconButton}
              onPress={() => setShowFilter(true)}>
              <FilterIcon width={22} height={22} />
            </TouchableOpacity>
          </View>
          {/* ⭐ HIỂN THỊ KHOẢNG NGÀY ĐANG LỌC */}
          {activeChips.length > 0 && (
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={{marginTop: 12}}>
              <View style={{flexDirection: 'row', paddingHorizontal: 2}}>
                {activeChips.map(chip => (
                  <View key={chip.key} style={{marginRight: 8}}>
                    <FilterChip
                      theme={theme}
                      mainText={chip.mainText}
                      subText={chip.subText}
                      onRemove={() =>
                        setFilters(prev => ({
                          ...prev,
                          [chip.key]: '',
                        }))
                      }
                    />
                  </View>
                ))}
              </View>
            </ScrollView>
          )}

          <FlatList
            data={filteredHistory}
            keyExtractor={item => item.date}
            renderItem={renderItem}
            ItemSeparatorComponent={() => <View style={{height: 12}} />}
            style={{marginTop: 12}}
            scrollEnabled={false}
          />
        </View>
      </ScrollView>

      <EmployeeAttendanceFilterModal
        visible={showFilter}
        current={filters}
        onClose={() => setShowFilter(false)}
        onApply={values => setFilters(values)}
      />

      <Footer activeIndex={activeTab} onPress={setActiveTab} />

      {showReportModal && reportType && (
        <CheckinComplaintAddModal
          visible={showReportModal}
          type={reportType}
          onClose={() => setShowReportModal(false)}
          onSubmit={async data => {
            await apiHandle
              .callApi(User.CreateCheckinComplaint, {
                date: data.date.toISOString().slice(0, 10),
                type: data.type, // ✅ BẮT BUỘC
                actual_time: data.actual_time, // ✅
                expected_time: null, // hoặc bỏ luôn
                reason: data.reason,
                evidence_images: data.evidence_images,
              })

              .asPromise();

            Toast.show({
              type: 'success',
              text1: 'Đã gửi khiếu nại',
            });

            setReportedToday(prev => ({
              ...prev,
              [data.type]: true,
            }));

            setShowReportModal(false);
          }}
        />
      )}
    </SafeAreaView>
  );
};

// ⭐ GIỮ NGUYÊN STYLE Y CHANG
const makeStyles = (theme: any) =>
  StyleSheet.create({
    screen: {
      flex: 1,
      paddingHorizontal: 20,
      paddingTop: 20,
      paddingBottom: 100,
    },
    summaryBox: {
      borderRadius: 16,
      borderWidth: 1,
      borderColor: theme.colors.contrastBackground,
      backgroundColor: theme.colors.background,
      padding: 16,
      gap: 14,
    },
    summaryLabel: {
      fontSize: 13,
      lineHeight: 18,
    },
    summaryStatsRow: {flexDirection: 'row'},
    summaryStat: {
      flex: 1,
      padding: 12,
      borderRadius: 12,
      backgroundColor: theme.colors.background,
      borderWidth: 1,
      borderColor: '#E5ECFF',
      gap: 6,
    },
    summaryStatLabel: {fontSize: 13, fontWeight: '700'},
    summaryStatValue: {fontSize: 18, fontWeight: '700'},
    gradientText: {fontSize: 13, fontWeight: '600'},

    filterHeader: {
      marginTop: 26,
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    sectionTitle: {fontSize: 16, fontWeight: '700'},
    filterIconButton: {
      width: 34,
      height: 34,
      alignItems: 'center',
      justifyContent: 'center',
    },

    historyCard: {
      padding: 16,
      borderRadius: 16,
      borderWidth: 1,
      borderColor: theme.colors.contrastBackground,
      gap: 12,
    },
    historyIconBox: {
      width: 30,
      height: 30,
      justifyContent: 'center',
      alignItems: 'center',
    },
    historyDate: {fontSize: 15, fontWeight: '700'},
    historyRow: {flexDirection: 'row', gap: 12},
    historyLabel: {fontSize: 12.5, color: '#6B7AA1', marginBottom: 4},
    historyValue: {fontSize: 14.5, fontWeight: '600'},
    reportButton: {
      marginTop: 4,
      paddingVertical: 12,
      borderRadius: 14,
      borderWidth: 1,
      borderColor: '#FF9800',
      alignItems: 'center',
    },
    reportText: {
      color: '#FF9800',
      fontWeight: '600',
    },
    reportedBox: {
      marginTop: 4,
      paddingVertical: 12,
      borderRadius: 14,
      backgroundColor: '#E5E7EB',
      alignItems: 'center',
    },
    reportedText: {
      color: '#6B7280',
      fontWeight: '600',
    },
  });

export default EmployeeAttendanceScreen;
