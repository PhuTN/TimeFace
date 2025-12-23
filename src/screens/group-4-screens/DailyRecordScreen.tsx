import React, {useEffect, useMemo, useState} from 'react';
import {
  ActivityIndicator,
  Alert,
  Platform,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import ReactNativeBlobUtil from 'react-native-blob-util';
import FilterBar from '../../components/common/FilterBar';
import Header2 from '../../components/common/Header2';
import DailyRecord from '../../components/list_items/employe-list-items/DailyRecord';
import DateFilterModal, {
  DateFilters,
} from '../../components/modals/filter-modals/DateFilterModal';
import {FilterChipData, useFilterSystem} from '../../hooks/useFilterSystem';
import {useUIFactory} from '../../ui/factory/useUIFactory';
// ✅ API
import {apiHandle} from '../../api/apihandle';
import {User} from '../../api/endpoint/User';

// ✅ EXPORT EXCEL

import RNFS from 'react-native-fs';
import Share from 'react-native-share';
import XLSX from 'xlsx-js-style';
type DayType =
  | 'work'
  | 'off'
  | 'holiday'
  | 'paid_leave'
  | 'unpaid_leave'
  | 'absent';

type ApiDayItem = {
  date: string; // "YYYY-MM-DD"
  check_in?: string | null;
  check_out?: string | null;
  late_minutes?: number;
  early_minutes?: number;
  ot_minutes?: number;
  isonlyot?: boolean;
  type?: DayType;
};

type ApiSummary = {
  year: number;
  month: number;
  workingDays: number;
  unpaidDays: number;
  lateMinutes: number;
  earlyMinutes: number;
  penaltyMinutes: number;
  otWeekdayMinutes: number;
  otWeekendMinutes: number;
  otHolidayMinutes: number;
  netSalary: number;
};

type ApiMonthDetailRes = {
  summary?: ApiSummary;
  days?: ApiDayItem[];
};

const pad2 = (n: number) => String(n).padStart(2, '0');

const formatMoney = (amount?: number | null) => {
  const n = typeof amount === 'number' ? amount : 0;
  return n.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
};

const safeText = (s: any) =>
  typeof s === 'string' ? s : s == null ? '' : String(s);

const sanitizeFileName = (name: string) =>
  name
    .replace(/[\\/:*?"<>|]/g, '_')
    .replace(/\s+/g, '_')
    .trim();

const formatISOToDDMMYYYY = (iso: string) => {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const year = d.getFullYear();
  return `${day}/${month}/${year}`;
};

const typeLabel = (t: DayType, langCode: string) => {
  const vi: Record<DayType, string> = {
    work: 'Đi làm',
    off: 'Nghỉ',
    holiday: 'Lễ',
    paid_leave: 'Nghỉ phép (lương)',
    unpaid_leave: 'Nghỉ phép (không lương)',
    absent: 'Vắng',
  };
  const en: Record<DayType, string> = {
    work: 'Work',
    off: 'Off',
    holiday: 'Holiday',
    paid_leave: 'Paid leave',
    unpaid_leave: 'Unpaid leave',
    absent: 'Absent',
  };
  return (langCode === 'vi' ? vi : en)[t] ?? t;
};

const DailyRecordScreen: React.FC<any> = ({route}: any) => {
  const {loading, theme, lang} = useUIFactory();

  // ✅ params từ navigate
  const employeeId: string = route?.params?.employeeId ?? 'me';
  const employeeName: string =
    route?.params?.employeeName ??
    (employeeId === 'me' ? 'Bản thân tôi' : 'Nhân viên');

  const isMe = employeeId === 'me';

  const now = new Date();
  const year = Number(route?.params?.year ?? now.getFullYear());
  const month = Number(route?.params?.month ?? now.getMonth() + 1);

  const {
    activeFilters,
    isModalVisible,
    openModal,
    closeModal,
    applyFilters,
    removeFilter,
  } = useFilterSystem<DateFilters>();

  const [days, setDays] = useState<ApiDayItem[]>([]);
  const [summary, setSummary] = useState<ApiSummary | null>(null);

  const [fetching, setFetching] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // ✅ filter local theo startDate/endDate
  const filteredDays = useMemo(() => {
    const start = activeFilters?.find(c => c.id === 'startDate')?.value;
    const end = activeFilters?.find(c => c.id === 'endDate')?.value;

    const startDate = start ? new Date(start) : null;
    const endDate = end ? new Date(end) : null;

    const startKey = startDate
      ? `${startDate.getFullYear()}-${pad2(startDate.getMonth() + 1)}-${pad2(
          startDate.getDate(),
        )}`
      : null;

    const endKey = endDate
      ? `${endDate.getFullYear()}-${pad2(endDate.getMonth() + 1)}-${pad2(
          endDate.getDate(),
        )}`
      : null;

    const sorted = [...days].sort((a, b) => (a.date < b.date ? 1 : -1));

    return sorted.filter(d => {
      if (startKey && d.date < startKey) return false;
      if (endKey && d.date > endKey) return false;
      return true;
    });
  }, [days, activeFilters]);

  // ✅ CALL API month-detail
  useEffect(() => {
    if (loading || !theme || !lang) return;

    let mounted = true;

    const run = async () => {
      setFetching(true);
      setErrorMsg(null);

      const endpoint = isMe
        ? User.GetMyMonthTimesheetDetail
        : User.GetUserMonthTimesheetDetail(employeeId);

      // GET + query params
      const payload = {year, month};

      const {status, res} = await apiHandle
        .callApi(endpoint, payload)
        .asPromise();

      if (!mounted) return;

      if (status.isError) {
        setErrorMsg(status.errorMessage ?? 'Không lấy được dữ liệu chấm công');
        setDays([]);
        setSummary(null);
      } else {
        const data = (res ?? {}) as ApiMonthDetailRes;
        setDays(Array.isArray(data.days) ? data.days : []);
        setSummary(data.summary ?? null);
      }

      setFetching(false);
    };

    run();

    return () => {
      mounted = false;
    };
  }, [employeeId, isMe, year, month, loading, theme, lang]);

  if (loading || !theme || !lang) return null;

  // ✅ Header: "MM/YYYY - Name"
  const headerTitle = `${pad2(month)}/${year} - ${employeeName}`;

  const getFilterRangeText = () => {
    const start = activeFilters?.find(c => c.id === 'startDate')?.value;
    const end = activeFilters?.find(c => c.id === 'endDate')?.value;
    const s = start ? formatISOToDDMMYYYY(start) : '';
    const e = end ? formatISOToDDMMYYYY(end) : '';
    if (!s && !e) return '';
    if (s && e) return `${s} → ${e}`;
    return s ? `${s} →` : `→ ${e}`;
  };

  const exportExcel = async () => {
    if (exporting) return;

    if (!summary) {
      Alert.alert(
        lang.code === 'vi' ? 'Chưa có dữ liệu' : 'No data',
        lang.code === 'vi'
          ? 'Bạn cần có summary trước khi export.'
          : 'Summary is required before export.',
      );
      return;
    }

    if (!filteredDays || filteredDays.length === 0) {
      Alert.alert(
        lang.code === 'vi' ? 'Không có dữ liệu ngày' : 'No daily records',
        lang.code === 'vi'
          ? 'Danh sách ngày đang trống (hoặc bị filter hết).'
          : 'Daily list is empty (or filtered out).',
      );
      return;
    }

    try {
      setExporting(true);

      const rangeText = getFilterRangeText();

      // ===== helpers =====
      const removeDiacritics = (s: string) =>
        (s ?? '')
          .normalize('NFD')
          .replace(/[\u0300-\u036f]/g, '')
          .replace(/đ/g, 'd')
          .replace(/Đ/g, 'D');

      const safeEmployee = removeDiacritics(employeeName || 'employee');

      const BORDER = {
        top: {style: 'thin', color: {rgb: 'D1D5DB'}},
        bottom: {style: 'thin', color: {rgb: 'D1D5DB'}},
        left: {style: 'thin', color: {rgb: 'D1D5DB'}},
        right: {style: 'thin', color: {rgb: 'D1D5DB'}},
      };

      const sTitle = {
        font: {bold: true, sz: 18, color: {rgb: 'FFFFFF'}},
        fill: {fgColor: {rgb: '2563EB'}},
        alignment: {horizontal: 'center', vertical: 'center'},
      };

      const sSubTitle = {
        font: {bold: true, sz: 12, color: {rgb: '111827'}},
        alignment: {horizontal: 'center', vertical: 'center'},
      };

      const sSection = {
        font: {bold: true, sz: 12, color: {rgb: '111827'}},
        fill: {fgColor: {rgb: 'E5E7EB'}},
        alignment: {horizontal: 'left', vertical: 'center'},
      };

      const sHeader = {
        font: {bold: true, sz: 11, color: {rgb: 'FFFFFF'}},
        fill: {fgColor: {rgb: '111827'}},
        alignment: {horizontal: 'center', vertical: 'center', wrapText: true},
        border: BORDER,
      };

      const sCellBase = {
        font: {sz: 10, color: {rgb: '111827'}},
        alignment: {horizontal: 'center', vertical: 'center', wrapText: true},
        border: BORDER,
      };

      const sCellLeft = {
        ...sCellBase,
        alignment: {horizontal: 'left', vertical: 'center', wrapText: true},
      };

      const zebra = (i: number) => ({
        fill: {fgColor: {rgb: i % 2 === 0 ? 'FFFFFF' : 'F9FAFB'}},
      });

      const typeColor = (t: DayType) => {
        switch (t) {
          case 'work':
            return 'DCFCE7';
          case 'off':
            return 'E5E7EB';
          case 'holiday':
            return 'FEF3C7';
          case 'paid_leave':
            return 'DBEAFE';
          case 'unpaid_leave':
            return 'FFEDD5';
          case 'absent':
            return 'FEE2E2';
          default:
            return 'FFFFFF';
        }
      };

      const setStyle = (ws: any, addr: string, style: any) => {
        if (!ws[addr]) return;
        ws[addr].s = {...(ws[addr].s || {}), ...style};
      };

      // ===== AOA rows =====
      const rows: any[][] = [];

      rows.push([lang.code === 'vi' ? 'BẢNG CÔNG THÁNG' : 'MONTHLY TIMESHEET']);
      rows.push([`${pad2(month)}/${year} - ${employeeName}`]);

      if (rangeText)
        rows.push([lang.code === 'vi' ? 'Lọc:' : 'Filter:', rangeText]);
      else rows.push([]);

      rows.push([]);

      rows.push([lang.code === 'vi' ? 'TỔNG KẾT' : 'SUMMARY']);
      rows.push([
        lang.code === 'vi' ? 'Ngày công' : 'Working days',
        summary.workingDays,
        lang.code === 'vi' ? 'Nghỉ K lương' : 'Unpaid days',
        summary.unpaidDays,
        '',
        '',
        lang.code === 'vi' ? 'Lương thực' : 'Net salary',
        summary.netSalary,
      ]);
      rows.push([
        lang.code === 'vi' ? 'Trễ (phút)' : 'Late (min)',
        summary.lateMinutes,
        lang.code === 'vi' ? 'Sớm (phút)' : 'Early (min)',
        summary.earlyMinutes,
        lang.code === 'vi' ? 'Phạt (phút)' : 'Penalty (min)',
        summary.penaltyMinutes,
        '',
        '',
      ]);
      rows.push([
        lang.code === 'vi' ? 'OT thường (phút)' : 'OT weekday (min)',
        summary.otWeekdayMinutes,
        lang.code === 'vi' ? 'OT cuối tuần (phút)' : 'OT weekend (min)',
        summary.otWeekendMinutes,
        lang.code === 'vi' ? 'OT ngày lễ (phút)' : 'OT holiday (min)',
        summary.otHolidayMinutes,
        '',
        '',
      ]);
      rows.push([]);

      rows.push([
        lang.code === 'vi' ? 'Ngày' : 'Date',
        lang.code === 'vi' ? 'Trạng thái' : 'Type',
        'Check-in',
        'Check-out',
        lang.code === 'vi' ? 'Trễ (phút)' : 'Late (min)',
        lang.code === 'vi' ? 'Sớm (phút)' : 'Early (min)',
        'OT (min)',
        lang.code === 'vi' ? 'Chỉ OT' : 'Only OT',
      ]);

      filteredDays.forEach(d => {
        const t = (d.type ?? 'work') as DayType;
        rows.push([
          formatISOToDDMMYYYY(d.date),
          typeLabel(t, lang.code),
          safeText(d.check_in ?? ''),
          safeText(d.check_out ?? ''),
          d.late_minutes ?? 0,
          d.early_minutes ?? 0,
          d.ot_minutes ?? 0,
          d.isonlyot ? 'YES' : 'NO',
        ]);
      });

      // ===== Sheet =====
      const ws = XLSX.utils.aoa_to_sheet(rows);

      ws['!cols'] = [
        {wch: 12},
        {wch: 18},
        {wch: 10},
        {wch: 10},
        {wch: 11},
        {wch: 11},
        {wch: 10},
        {wch: 9},
      ];

      ws['!merges'] = [
        {s: {r: 0, c: 0}, e: {r: 0, c: 7}},
        {s: {r: 1, c: 0}, e: {r: 1, c: 7}},
      ];

      setStyle(ws, 'A1', sTitle);
      setStyle(ws, 'A2', sSubTitle);

      if (rangeText) {
        setStyle(ws, 'A3', {...sCellLeft, font: {bold: true, sz: 10}});
        setStyle(ws, 'B3', {...sCellLeft});
        ws['!merges'].push({s: {r: 2, c: 1}, e: {r: 2, c: 7}});
      }

      setStyle(ws, 'A5', sSection);
      ws['!merges'].push({s: {r: 4, c: 0}, e: {r: 4, c: 7}});

      // header row index = 9 (0-based)
      for (let c = 0; c <= 7; c++) {
        setStyle(ws, XLSX.utils.encode_cell({r: 9, c}), sHeader);
      }

      const dataStartR = 10;
      const dataEndR = 10 + filteredDays.length - 1;

      for (let r = dataStartR; r <= dataEndR; r++) {
        const idx = r - dataStartR;
        const d = filteredDays[idx];
        const t = (d.type ?? 'work') as DayType;

        for (let c = 0; c <= 7; c++) {
          const addr = XLSX.utils.encode_cell({r, c});
          const base = {...sCellBase, ...zebra(idx)};
          setStyle(ws, addr, base);
          if (c === 0 || c === 1)
            setStyle(ws, addr, {...sCellLeft, ...zebra(idx)});
        }

        // status cell color
        const statusAddr = XLSX.utils.encode_cell({r, c: 1});
        setStyle(ws, statusAddr, {
          fill: {fgColor: {rgb: typeColor(t)}},
          font: {bold: true, sz: 10, color: {rgb: '111827'}},
        });

        // OT highlight
        if ((d.ot_minutes ?? 0) > 0) {
          const otAddr = XLSX.utils.encode_cell({r, c: 6});
          setStyle(ws, otAddr, {
            fill: {fgColor: {rgb: 'DBEAFE'}},
            font: {bold: true, sz: 10, color: {rgb: '1D4ED8'}},
          });
        }
      }

      ws['!autofilter'] = {ref: `A10:H${10 + filteredDays.length}`};

      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Timesheet');

      const fileName = sanitizeFileName(
        `timesheet_${pad2(month)}-${year}_${safeEmployee}.xlsx`,
      );

      // (1) Tạo file trong cache trước (an toàn 100%)
      const cachePath = `${RNFS.CachesDirectoryPath}/${fileName}`;
      const wbout = XLSX.write(wb, {type: 'base64', bookType: 'xlsx'});
      await RNFS.writeFile(cachePath, wbout, 'base64');

      const exists = await RNFS.exists(cachePath);
      if (!exists) throw new Error('Không tạo được file excel');

      // (2) ✅ Android: copy vào Downloads bằng MediaStore (đỡ permission + không EACCES)
      if (Platform.OS === 'android') {
        const mime =
          'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';

        const uri = await ReactNativeBlobUtil.MediaCollection.copyToMediaStore(
          {
            name: fileName,
            parentFolder: 'Download',
            mimeType: mime,
          },
          'Download',
          cachePath,
        );

        Alert.alert(
          lang.code === 'vi' ? 'Đã tải về' : 'Downloaded',
          lang.code === 'vi'
            ? 'File đã được lưu vào thư mục Download.'
            : 'File saved to Downloads.',
          [
            {
              text: lang.code === 'vi' ? 'Mở file' : 'Open',
              onPress: () => {
                try {
                  ReactNativeBlobUtil.android.actionViewIntent(uri, mime);
                } catch {}
              },
            },
            {text: 'OK'},
          ],
        );

        return; // ✅ bấm là tải về luôn -> stop here
      }

      // (3) iOS: không có “Download folder” kiểu Android => dùng Share để lưu Files
      const url = `file://${cachePath}`;
      await Share.open({
        url,
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        filename: fileName,
        failOnCancel: false,
      });
    } catch (e: any) {
      Alert.alert(
        lang.code === 'vi' ? 'Export thất bại' : 'Export failed',
        e?.message ?? String(e),
      );
    } finally {
      setExporting(false);
    }
  };
  return (
    <SafeAreaView style={{flex: 1, backgroundColor: theme.colors.background}}>
      <Header2 title={headerTitle} theme={theme} />

      <ScrollView
        contentContainerStyle={{padding: 16, gap: 12}}
        showsVerticalScrollIndicator={false}>
        {/* ✅ ACTIONS */}
        <View style={styles.actionRow}>
          <TouchableOpacity
            onPress={exportExcel}
            disabled={fetching || exporting || !summary}
            style={[
              styles.exportBtn,
              {
                backgroundColor: theme.colors.primary,
                opacity: fetching || exporting || !summary ? 0.6 : 1,
              },
            ]}>
            <Text style={styles.exportText}>
              {exporting
                ? lang.code === 'vi'
                  ? 'Đang export...'
                  : 'Exporting...'
                : lang.code === 'vi'
                ? 'Export Excel'
                : 'Export Excel'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* ✅ SUMMARY CARD */}
        {!fetching && !errorMsg && summary && (
          <View
            style={[
              styles.summaryCard,
              {
                backgroundColor: theme.colors.background,
                borderColor: theme.colors.borderLight,
                shadowColor: theme.colors.text,
              },
            ]}>
            <Text style={[styles.summaryTitle, {color: theme.colors.text}]}>
              {lang.code === 'vi' ? 'Tổng kết tháng' : 'Monthly Summary'}
            </Text>

            <View
              style={[
                styles.summaryBox,
                {
                  backgroundColor: theme.colors.lightGrayBackground,
                  borderColor: theme.colors.borderLight,
                },
              ]}>
              {/* Row 1 */}
              <View style={styles.summaryRow}>
                <SummaryItem
                  label={lang.code === 'vi' ? 'Ngày công' : 'Working days'}
                  value={`${summary.workingDays}`}
                  theme={theme}
                />
                <SummaryItem
                  label={lang.code === 'vi' ? 'Nghỉ K Lương' : 'Unpaid days'}
                  value={`${summary.unpaidDays}`}
                  theme={theme}
                />
                <SummaryItem
                  label={lang.code === 'vi' ? 'Lương thực' : 'Net salary'}
                  value={`${formatMoney(summary.netSalary)} đ`}
                  theme={theme}
                  highlight
                />
              </View>

              <View style={styles.summaryDivider} />

              {/* Row 2 */}
              <View style={styles.summaryRow}>
                <SummaryItem
                  label={lang.code === 'vi' ? 'Trễ (phút)' : 'Late (min)'}
                  value={`${summary.lateMinutes}`}
                  theme={theme}
                  highlight={summary.lateMinutes > 0}
                />
                <SummaryItem
                  label={lang.code === 'vi' ? 'Sớm (phút)' : 'Early (min)'}
                  value={`${summary.earlyMinutes}`}
                  theme={theme}
                  highlight={summary.earlyMinutes > 0}
                />
                <SummaryItem
                  label={lang.code === 'vi' ? 'Phạt (phút)' : 'Penalty (min)'}
                  value={`${summary.penaltyMinutes}`}
                  theme={theme}
                  highlight={summary.penaltyMinutes > 0}
                />
              </View>

              <View style={styles.summaryDivider} />

              {/* Row 3 */}
              <View style={styles.summaryRow}>
                <SummaryItem
                  label={
                    lang.code === 'vi' ? 'OT thường (phút)' : 'OT weekday (min)'
                  }
                  value={`${summary.otWeekdayMinutes}`}
                  theme={theme}
                  highlight={summary.otWeekdayMinutes > 0}
                />
                <SummaryItem
                  label={lang.code === 'vi' ? 'OT cuối tuần' : 'OT weekend'}
                  value={`${summary.otWeekendMinutes}`}
                  theme={theme}
                  highlight={summary.otWeekendMinutes > 0}
                />
                <SummaryItem
                  label={lang.code === 'vi' ? 'OT ngày lễ' : 'OT holiday'}
                  value={`${summary.otHolidayMinutes}`}
                  theme={theme}
                  highlight={summary.otHolidayMinutes > 0}
                />
              </View>
            </View>
          </View>
        )}

        <FilterBar
          title={lang.t('filterByDate')}
          onFilterPress={openModal}
          activeFilters={activeFilters}
          onRemoveFilter={removeFilter}
          theme={theme}
        />

        {fetching && (
          <View style={{paddingVertical: 16, alignItems: 'center', gap: 8}}>
            <ActivityIndicator />
            <Text style={{color: theme.colors.mutedText}}>
              {lang.code === 'vi' ? 'Đang tải dữ liệu...' : 'Loading...'}
            </Text>
          </View>
        )}

        {!fetching && !!errorMsg && (
          <View
            style={{
              padding: 12,
              borderRadius: 12,
              borderWidth: 1,
              borderColor: theme.colors.borderLight,
            }}>
            <Text style={{color: theme.colors.text}}>{errorMsg}</Text>
          </View>
        )}

        {!fetching && !errorMsg && filteredDays.length === 0 && (
          <View
            style={{
              padding: 12,
              borderRadius: 12,
              borderWidth: 1,
              borderColor: theme.colors.borderLight,
            }}>
            <Text style={{color: theme.colors.mutedText}}>
              {lang.code === 'vi'
                ? 'Chưa có dữ liệu chấm công tháng này.'
                : 'No daily records for this month.'}
            </Text>
          </View>
        )}

        {/* ✅ List days */}
        {!fetching &&
          !errorMsg &&
          filteredDays.map((d, idx) => (
            <DailyRecord
              key={`${d.date}-${idx}`}
              type={(d.type ?? 'work') as DayType}
              date={d.date}
              check_in={d.check_in ?? null}
              check_out={d.check_out ?? null}
              late_minutes={d.late_minutes ?? 0}
              early_minutes={d.early_minutes ?? 0}
              ot_minutes={d.ot_minutes ?? 0}
              isonlyot={d.isonlyot ?? false}
            />
          ))}
      </ScrollView>

      <DateFilterModal
        visible={isModalVisible}
        onClose={closeModal}
        onApplyFilters={(filters: DateFilters) => {
          const chips: FilterChipData[] = [];

          const formatDate = (date: Date) => {
            const day = String(date.getDate()).padStart(2, '0');
            const m = String(date.getMonth() + 1).padStart(2, '0');
            const y = date.getFullYear();
            return `${day}/${m}/${y}`;
          };

          if (filters.startDate) {
            chips.push({
              id: 'startDate',
              label: 'Ngày bắt đầu',
              subLabel: formatDate(filters.startDate),
              value: filters.startDate.toISOString(),
            });
          }

          if (filters.endDate) {
            chips.push({
              id: 'endDate',
              label: 'Ngày kết thúc',
              subLabel: formatDate(filters.endDate),
              value: filters.endDate.toISOString(),
            });
          }

          applyFilters(filters, chips);
        }}
      />
    </SafeAreaView>
  );
};

const SummaryItem = ({
  label,
  value,
  theme,
  highlight = false,
}: {
  label: string;
  value: string;
  theme: any;
  highlight?: boolean;
}) => (
  <View style={styles.summaryItem}>
    <Text
      style={[styles.summaryLabel, {color: theme.colors.mutedText}]}
      numberOfLines={2}>
      {label}
    </Text>
    <Text
      style={[
        styles.summaryValue,
        {color: highlight ? theme.colors.primary : theme.colors.text},
      ]}
      numberOfLines={1}>
      {value}
    </Text>
  </View>
);

const styles = StyleSheet.create({
  actionRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  exportBtn: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 12,
  },
  exportText: {
    color: '#fff',
    fontWeight: '800',
    fontSize: 13,
  },

  summaryCard: {
    borderRadius: 14,
    borderWidth: 1,
    padding: 14,
    shadowOffset: {width: 0, height: 3},
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },
  summaryTitle: {
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 10,
  },
  summaryBox: {
    borderRadius: 10,
    borderWidth: 1,
    paddingVertical: 10,
    paddingHorizontal: 8,
    gap: 10,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
  },
  summaryItem: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: 4,
    gap: 4,
  },
  summaryLabel: {
    fontSize: 10.5,
    lineHeight: 13,
    textAlign: 'center',
  },
  summaryValue: {
    fontSize: 12,
    fontWeight: '800',
    textAlign: 'center',
  },
  summaryDivider: {
    height: 1,
    opacity: 0.35,
    backgroundColor: '#999',
  },
});

export default DailyRecordScreen;
