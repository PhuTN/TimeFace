import React from 'react';
import {
  Dimensions,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import {LineChart} from 'react-native-chart-kit';

type MetricKey =
  | 'onTime'
  | 'late'
  | 'leaveEarly'
  | 'absent'
  | 'withPermit'
  | 'withoutPermit';
type WeekItem = {type: 'week'; label: string; start: Date; end: Date};
type MonthItem = {type: 'month'; label: string; month: number; year: number};
type PeriodItem = WeekItem | MonthItem;

const METRIC_OPTIONS: {key: MetricKey; label: string}[] = [
  {key: 'onTime', label: 'Đúng giờ'},
  {key: 'late', label: 'Đi trễ'},
  {key: 'leaveEarly', label: 'Về sớm'},
  {key: 'absent', label: 'Vắng'},
  {key: 'withPermit', label: 'Có phép'},
  {key: 'withoutPermit', label: 'Không phép'},
];

function startOfWeekSun(d: Date) {
  const x = new Date(d);
  const day = x.getDay();
  x.setDate(x.getDate() - day);
  x.setHours(0, 0, 0, 0);
  return x;
}
function addDays(d: Date, n: number) {
  const x = new Date(d);
  x.setDate(x.getDate() + n);
  return x;
}
function fmt(d: Date) {
  const dd = String(d.getDate()).padStart(2, '0');
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  return `${dd}/${mm}`;
}
function genRecentWeeks(n = 8): WeekItem[] {
  const res: WeekItem[] = [];
  const now = new Date();
  let end = startOfWeekSun(now);
  for (let i = 0; i < n; i++) {
    const start = addDays(end, 0);
    const finish = addDays(end, 6);
    const label = `${fmt(start)}–${fmt(finish)}`;
    res.unshift({type: 'week', label, start, end: finish});
    end = addDays(start, -7);
  }
  return res;
}
function genMonths(): MonthItem[] {
  const y = new Date().getFullYear();
  return Array.from({length: 12}, (_, i) => ({
    type: 'month',
    label: `${i + 1}`,
    month: i + 1,
    year: y,
  }));
}
function daysInMonth(m: number, y: number) {
  return new Date(y, m, 0).getDate();
}
function seeded(seed: number) {
  let x = seed || 1;
  return () => {
    x = (x * 48271) % 2147483647;
    return x / 2147483647;
  };
}
const metricSeed: Record<MetricKey, number> = {
  onTime: 11,
  late: 23,
  leaveEarly: 37,
  absent: 41,
  withPermit: 53,
  withoutPermit: 61,
};
function genSeries(metric: MetricKey, period: PeriodItem) {
  const rnd = seeded(metricSeed[metric] + (period.type === 'week' ? 1 : 2));
  if (period.type === 'week') {
    const labels = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const main = labels.map(
      (_, i) =>
        Math.round((rnd() * (metric === 'onTime' ? 520 : 360) + i * 12) / 10) *
        10,
    );
    const base = labels.map(() => Math.round((rnd() * 220 + 40) / 10) * 10);
    return {labels, main, base};
  }
  const n = daysInMonth(period.month, period.year);
  const labels = Array.from({length: n}, (_, i) => String(i + 1));
  const amp = metric === 'onTime' ? 480 : metric === 'absent' ? 280 : 360;
  const main = labels.map(
    (_, i) => Math.round((rnd() * amp + Math.sin(i / 3) * 50 + 40) / 10) * 10,
  );
  const base = labels.map(() => Math.round((rnd() * 200 + 30) / 10) * 10);
  return {labels, main, base};
}

export default function AttendanceAreaChart() {
  const [metric, setMetric] = React.useState<MetricKey>('onTime');
  const [period, setPeriod] = React.useState<PeriodItem>(genRecentWeeks(8)[7]);
  const [openMetric, setOpenMetric] = React.useState(false);
  const [openPeriod, setOpenPeriod] = React.useState(false);

  const weeks = React.useMemo(() => genRecentWeeks(10), []);
  const months = React.useMemo(() => genMonths(), []);

  const [chartW, setChartW] = React.useState<number>(
    Math.round(Dimensions.get('window').width - 32),
  );
  const onLayout = (e: any) =>
    setChartW(Math.round(e.nativeEvent.layout.width));

  const {labels, main, base} = genSeries(metric, period);
  const isWeek = period.type === 'week';

  const chartConfig = {
    color: (o = 1) => `rgba(26,26,26,${o})`,
    backgroundGradientFromOpacity: 0,
    backgroundGradientToOpacity: 0,
    fillShadowGradient: '#00D4FF',
    fillShadowGradientOpacity: 0.2,
    decimalPlaces: 0,
    propsForBackgroundLines: {strokeDasharray: '0', stroke: '#E9EEF6'},
    propsForDots: {r: '0'},
  };

  const chipPeriod =
    period.type === 'week'
      ? `Tuần ${period.label}`
      : `Tháng ${String(period.month).padStart(2, '0')}/${period.year}`;

  return (
    <View onLayout={onLayout} style={{alignSelf: 'stretch'}}>
      {/* combobox */}
      <View style={styles.controls}>
        <TouchableOpacity
          style={styles.chip}
          onPress={() => {
            setOpenPeriod(false);
            setOpenMetric(v => !v);
          }}>
          <Text style={styles.chipText}>
            {METRIC_OPTIONS.find(m => m.key === metric)?.label} ▾
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.chip}
          onPress={() => {
            setOpenMetric(false);
            setOpenPeriod(v => !v);
          }}>
          <Text style={styles.chipText}>{chipPeriod} ▾</Text>
        </TouchableOpacity>
      </View>

      {/* dropdown full width dưới combobox — KHÔNG FlatList */}
      {openMetric && (
        <View style={styles.dropdownBox}>
          <ScrollView
            style={{maxHeight: 260}}
            showsVerticalScrollIndicator={false}>
            {METRIC_OPTIONS.map(item => (
              <TouchableOpacity
                key={item.key}
                style={styles.itemRow}
                onPress={() => {
                  setMetric(item.key);
                  setOpenMetric(false);
                }}>
                <Text style={styles.itemText}>{item.label}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
          <Pressable
            style={styles.closePad}
            onPress={() => setOpenMetric(false)}
          />
        </View>
      )}

      {openPeriod && (
        <View style={styles.dropdownBox}>
          <Text style={styles.section}>Tuần</Text>
          <ScrollView
            style={{maxHeight: 300}}
            showsVerticalScrollIndicator={false}>
            {weeks.map((w, i) => (
              <TouchableOpacity
                key={`w-${i}`}
                style={styles.itemRow}
                onPress={() => {
                  setPeriod(w);
                  setOpenPeriod(false);
                }}>
                <Text style={styles.itemText}>{w.label}</Text>
              </TouchableOpacity>
            ))}
            <View style={[styles.sep, {marginVertical: 8}]} />
            <Text style={styles.section}>Tháng</Text>
            {months.map((m, i) => (
              <TouchableOpacity
                key={`m-${i}`}
                style={styles.itemRow}
                onPress={() => {
                  setPeriod(m);
                  setOpenPeriod(false);
                }}>
                <Text style={styles.itemText}>Tháng {m.label}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
          <Pressable
            style={styles.closePad}
            onPress={() => setOpenPeriod(false)}
          />
        </View>
      )}

      {/* chart full width */}
      <View style={{marginTop: 8}}>
        <LineChart
          data={{
            labels,
            datasets: [
              {
                data: main,
                strokeWidth: 3,
                color: (o = 1) => `rgba(0,212,255,${o})`,
              },
              {
                data: base,
                strokeWidth: 2,
                color: (o = 1) => `rgba(0,0,0,${0.15 * o})`,
              },
            ],
          }}
          width={chartW}
          height={220}
          chartConfig={chartConfig}
          bezier
          withDots={false}
          withShadow
          withInnerLines
          withOuterLines={false}
          fromZero
          style={{borderRadius: 12}}
          segments={6}
        />
        <View
          pointerEvents="none"
          style={[
            styles.markerWrap,
            {left: isWeek ? (chartW / 7) * 3.9 : chartW / 2 - 1},
          ]}>
          <View style={styles.markerLine} />
          <View style={styles.markerHandle} />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  controls: {
    flexDirection: 'row',
    gap: 8,
    justifyContent: 'flex-end',
    marginBottom: 8,
  },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
    backgroundColor: '#F5F7FA',
  },
  chipText: {fontSize: 12, fontWeight: '600', color: '#1A1A1A'},

  dropdownBox: {
    width: '100%',
    backgroundColor: '#fff',
    borderRadius: 12,
    paddingVertical: 6,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOpacity: 0.12,
    shadowRadius: 12,
    shadowOffset: {width: 0, height: 6},
    elevation: 5,
  },
  itemRow: {paddingVertical: 12, paddingHorizontal: 12},
  itemText: {fontSize: 14, color: '#1A1A1A'},
  sep: {height: 1, backgroundColor: '#EDF1F6'},
  section: {
    fontSize: 12,
    color: '#6B7280',
    fontWeight: '700',
    paddingHorizontal: 12,
    paddingTop: 6,
    paddingBottom: 4,
  },
  closePad: {height: 2},

  markerWrap: {position: 'absolute', top: 0, bottom: 0, alignItems: 'center'},
  markerLine: {
    width: 2,
    backgroundColor: '#F4B38A',
    flex: 1,
    marginTop: 16,
    borderRadius: 1,
  },
  markerHandle: {
    position: 'absolute',
    top: 68,
    width: 34,
    height: 62,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#EEF1F6',
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 6,
    shadowOffset: {width: 0, height: 2},
    elevation: 2,
  },
});
