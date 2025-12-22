import React, {useEffect, useState} from 'react';
import {
  Dimensions,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import {LineChart} from 'react-native-chart-kit';
import {apiHandle} from '../../api/apihandle';
import {CompanyEP} from '../../api/endpoint/Company';

type MetricKey =
  | 'onTime'
  | 'late'
  | 'leaveEarly'
  | 'absent'
  | 'withPermit'
  | 'withoutPermit';

type Mode = 'year' | 'month' | 'week';

const METRIC_OPTIONS = [
  {key: 'onTime', label: 'Đúng giờ'},
  {key: 'late', label: 'Đi trễ'},
  {key: 'leaveEarly', label: 'Về sớm'},
  {key: 'absent', label: 'Vắng'},
  {key: 'withPermit', label: 'Có phép'},
  {key: 'withoutPermit', label: 'Không phép'},
] as const;

const MODE_OPTIONS = [
  {key: 'year', label: 'Năm'},
  {key: 'month', label: 'Tháng'},
  {key: 'week', label: 'Tuần'},
] as const;

const YEARS = Array.from({length: 6}, (_, i) => new Date().getFullYear() - i);
const MONTHS = Array.from({length: 12}, (_, i) => i + 1);
const WEEKS = [1, 2, 3, 4];

export default function AttendanceAreaChart() {
  const now = new Date();

  const [metric, setMetric] = useState<MetricKey>('onTime');
  const [mode, setMode] = useState<Mode>('month');

  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [week, setWeek] = useState(1);

  const [labels, setLabels] = useState<string[]>([]);
  const [data, setData] = useState<number[]>([]);
  const [loading, setLoading] = useState(false);

  const [openMetric, setOpenMetric] = useState(false);
  const [openMode, setOpenMode] = useState(false);
  const [openYear, setOpenYear] = useState(false);
  const [openMonth, setOpenMonth] = useState(false);
  const [openWeek, setOpenWeek] = useState(false);

  const [chartW, setChartW] = useState(
    Dimensions.get('window').width - 32,
  );

  const closeAll = () => {
    setOpenMetric(false);
    setOpenMode(false);
    setOpenYear(false);
    setOpenMonth(false);
    setOpenWeek(false);
  };

  const itemRow = (active: boolean) => [
    styles.itemRow,
    active && styles.itemRowActive,
  ];

  // ===== API =====
  const loadChart = async () => {
    try {
      setLoading(true);

      const {res} = await apiHandle
        .callApi(CompanyEP.GetAttendanceChart, {
          metric,
          mode,
          year,
          month,
          week,
        })
        .asPromise();

      const safeLabels = Array.isArray(res?.labels) ? res.labels : [];
      const safeData = Array.isArray(res?.data)
        ? res.data.map((v: any) => Number(v) || 0)
        : [];

      if (safeLabels.length === safeData.length) {
        setLabels(safeLabels);
        setData(safeData);
      } else {
        setLabels([]);
        setData([]);
      }
    } catch (e) {
      setLabels([]);
      setData([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadChart();
  }, [metric, mode, year, month, week]);

  return (
    <View onLayout={e => setChartW(e.nativeEvent.layout.width)}>
      {/* ===== ROW 1 ===== */}
      <View style={styles.controls}>
        <TouchableOpacity
          style={styles.chip}
          onPress={() => {
            closeAll();
            setOpenMetric(v => !v);
          }}>
          <Text style={styles.chipText}>
            {METRIC_OPTIONS.find(m => m.key === metric)?.label} ▾
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.chip}
          onPress={() => {
            closeAll();
            setOpenMode(v => !v);
          }}>
          <Text style={styles.chipText}>
            {MODE_OPTIONS.find(m => m.key === mode)?.label} ▾
          </Text>
        </TouchableOpacity>
      </View>

      {/* ===== ROW 2 ===== */}
      <View style={styles.controls}>
        <TouchableOpacity
          style={styles.chip}
          onPress={() => {
            closeAll();
            setOpenYear(v => !v);
          }}>
          <Text style={styles.chipText}>Năm {year} ▾</Text>
        </TouchableOpacity>

        {mode !== 'year' && (
          <TouchableOpacity
            style={styles.chip}
            onPress={() => {
              closeAll();
              setOpenMonth(v => !v);
            }}>
            <Text style={styles.chipText}>Tháng {month} ▾</Text>
          </TouchableOpacity>
        )}

        {mode === 'week' && (
          <TouchableOpacity
            style={styles.chip}
            onPress={() => {
              closeAll();
              setOpenWeek(v => !v);
            }}>
            <Text style={styles.chipText}>Tuần {week} ▾</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* ===== DROPDOWNS (ALL SCROLLABLE) ===== */}
      {openMetric && (
        <View style={styles.dropdownBox}>
          <ScrollView nestedScrollEnabled style={styles.dropdownScroll}>
            {METRIC_OPTIONS.map(m => (
              <TouchableOpacity
                key={m.key}
                style={itemRow(m.key === metric)}
                onPress={() => {
                  setMetric(m.key);
                  closeAll();
                }}>
                <Text style={styles.itemText}>{m.label}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      )}

      {openMode && (
        <View style={styles.dropdownBox}>
          <ScrollView nestedScrollEnabled style={styles.dropdownScroll}>
            {MODE_OPTIONS.map(m => (
              <TouchableOpacity
                key={m.key}
                style={itemRow(m.key === mode)}
                onPress={() => {
                  setMode(m.key);
                  setWeek(1);
                  closeAll();
                }}>
                <Text style={styles.itemText}>{m.label}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      )}

      {openYear && (
        <View style={styles.dropdownBox}>
          <ScrollView nestedScrollEnabled style={styles.dropdownScroll}>
            {YEARS.map(y => (
              <TouchableOpacity
                key={y}
                style={itemRow(y === year)}
                onPress={() => {
                  setYear(y);
                  closeAll();
                }}>
                <Text style={styles.itemText}>{y}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      )}

      {openMonth && (
        <View style={styles.dropdownBox}>
          <ScrollView nestedScrollEnabled style={styles.dropdownScroll}>
            {MONTHS.map(m => (
              <TouchableOpacity
                key={m}
                style={itemRow(m === month)}
                onPress={() => {
                  setMonth(m);
                  setWeek(1);
                  closeAll();
                }}>
                <Text style={styles.itemText}>Tháng {m}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      )}

      {openWeek && (
        <View style={styles.dropdownBox}>
          <ScrollView nestedScrollEnabled style={styles.dropdownScroll}>
            {WEEKS.map(w => (
              <TouchableOpacity
                key={w}
                style={itemRow(w === week)}
                onPress={() => {
                  setWeek(w);
                  closeAll();
                }}>
                <Text style={styles.itemText}>Tuần {w}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      )}

      {/* ===== CHART ===== */}
      {labels.length > 0 && data.length > 0 && (
        <LineChart
          data={{labels, datasets: [{data, strokeWidth: 3}]}}
          width={chartW}
          height={220}
          chartConfig={{
            backgroundGradientFromOpacity: 0,
            backgroundGradientToOpacity: 0,
            decimalPlaces: 0,
            propsForDots: {r: '0'},
            color: o => `rgba(0,212,255,${o})`,
          }}
          withDots={false}
          withInnerLines
          withOuterLines={false}
          fromZero
          bezier
          style={{borderRadius: 12, marginTop: 8, opacity: loading ? 0.5 : 1}}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  controls: {
    flexDirection: 'row',
    gap: 8,
    justifyContent: 'flex-end',
    marginBottom: 6,
    flexWrap: 'wrap',
  },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
    backgroundColor: '#F5F7FA',
  },
  chipText: {fontSize: 12, fontWeight: '600', color: '#1A1A1A'},

  dropdownBox: {
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: 8,
    elevation: 5,
    overflow: 'hidden',
  },
  dropdownScroll: {
    maxHeight: 220,
  },

  itemRow: {paddingVertical: 12, paddingHorizontal: 12},
  itemRowActive: {backgroundColor: '#EEF2FF'},
  itemText: {fontSize: 14, color: '#1A1A1A'},
});
