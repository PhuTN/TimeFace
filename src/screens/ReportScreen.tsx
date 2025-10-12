import * as d3 from 'd3-shape';
import {
  Dimensions,
  Image,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import {LineChart} from 'react-native-chart-kit';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import Svg, {G, Path, Text as SvgText} from 'react-native-svg';
import Feather from 'react-native-vector-icons/Feather';

const screenWidth = Dimensions.get('window').width;

/** ---------- Custom Pie with inner % labels ---------- */
type Slice = {name: string; value: number; color: string};
function PieWithLabels({data, size = 240}: {data: Slice[]; size?: number}) {
  const r = size / 2;
  const total = data.reduce((s, d) => s + d.value, 0);
  const arcs = d3
    .pie<Slice>()
    .value(d => d.value)
    .sort(null)
    .padAngle(0.008)(data);
  const arc = d3.arc<d3.PieArcDatum<Slice>>().outerRadius(r).innerRadius(0);

  return (
    <Svg width={size} height={size}>
      <G x={r} y={r}>
        {arcs.map((a, i) => {
          const path = arc(a) as string;
          const [cx, cy] = d3
            .arc()
            .outerRadius(r * 0.65)
            .innerRadius(r * 0.65)
            .centroid(a);
          const pct = Math.round((a.data.value / total) * 100);
          return (
            <G key={i}>
              <Path d={path} fill={a.data.color} />
              <SvgText
                x={cx}
                y={cy}
                fontSize={pct >= 15 ? 16 : 13}
                fontWeight="700"
                fill="#FFFFFF"
                textAnchor="middle">
                {`${pct}%`}
              </SvgText>
            </G>
          );
        })}
      </G>
    </Svg>
  );
}

export default function ReportScreen() {
  const insets = useSafeAreaInsets();

  // Pie data
  const pie = [
    {name: 'Đúng giờ', value: 67, color: '#00D4FF'},
    {name: 'Đi trễ', value: 27, color: '#FF9500'},
    {name: 'Không phép', value: 21, color: '#EC4899'},
    {name: 'Có phép', value: 11, color: '#A78BFA'},
  ];

  // Employees
  const employees = [
    {
      id: 1,
      name: 'Keneth Conroy',
      role: 'UI UX Designer',
      avatar: {uri: 'https://i.pravatar.cc/100?img=12'},
      lateCount: 120,
      latePercent: 25,
      notePrefix: 'Số phút đi trễ:',
    },
    {
      id: 2,
      name: 'Bill Gaston',
      role: 'Full Stack Engineer',
      avatar: {uri: 'https://i.pravatar.cc/100?img=65'},
      lateCount: 120,
      latePercent: 25,
      notePrefix: 'Số phút về sớm:',
    },
    {
      id: 3,
      name: 'Ruslan Kosinov',
      role: 'Digital Marketing',
      avatar: {uri: 'https://i.pravatar.cc/100?img=33'},
      status: 'Xin nghỉ lý do: Bị cảm sốt',
    },
  ];

  // Line chart
  const CHART_W = screenWidth - 32 - 40;
  const lineData = {
    labels: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
    datasets: [
      {
        data: [80, 150, 120, 300, 510, 180, 160],
        strokeWidth: 3,
        color: (o = 1) => `rgba(0,212,255,${o})`,
      },
      {
        data: [60, 70, 65, 100, 160, 120, 110],
        strokeWidth: 2,
        color: (o = 1) => `rgba(0,0,0,${0.15 * o})`,
      },
    ],
  };
  const chartConfig = {
    color: (o = 1) => `rgba(26,26,26,${o})`,
    backgroundGradientFromOpacity: 0,
    backgroundGradientToOpacity: 0,
    fillShadowGradient: '#00D4FF',
    fillShadowGradientOpacity: 0.2,
    decimalPlaces: 0,
    propsForBackgroundLines: {strokeDasharray: '0', stroke: '#EDF2F7'},
    propsForDots: {r: '0'},
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar
        barStyle="dark-content"
        backgroundColor="#F5F7FA"
        translucent={false}
      />

      {/* ---------- Custom header ---------- */}
      <View style={[styles.headerBar, {paddingTop: insets.top + 6}]}>
        <TouchableOpacity style={styles.headerBtn}>
          <Feather name="chevron-left" size={26} color="#5F6AF4" />
        </TouchableOpacity>

        <Text style={styles.headerTitle}>BÁO CÁO THỐNG KÊ</Text>

        <Image
          source={{uri: 'https://i.pravatar.cc/100?img=7'}}
          style={styles.headerAvatar}
        />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}>
        {/* Date block */}
        <View style={styles.dateHeader}>
          <Text style={styles.datePrefix}>Thống kê ngày</Text>
          <View style={styles.dateChip}>
            <Text style={styles.dateChipText}>20/09/2025</Text>
          </View>
          <Feather
            name="calendar"
            size={18}
            color="#5F6AF4"
            style={{marginLeft: 6}}
          />
        </View>
        <Text style={styles.dateSubtitle}>Nhóm GS - 10 thành viên</Text>

        {/* ---------- Stats container ---------- */}
        <View style={styles.statsContainer}>
          <View style={styles.statsRow}>
            <View style={[styles.statCardLarge, styles.cardShadow]}>
              <View style={styles.statHeader}>
                <View style={[styles.dot, {backgroundColor: '#27C2A0'}]} />
                <Text style={styles.statLabel}>Đã đi làm</Text>
              </View>
              <Text style={styles.statValueLarge}>1</Text>
            </View>

            <View style={styles.statsColumn}>
              <View
                style={[
                  styles.statCardSmall,
                  styles.cardShadow,
                  {backgroundColor: '#C8F4F4'},
                ]}>
                <View style={styles.statHeaderSmall}>
                  <View style={[styles.dotSm, {backgroundColor: '#00D4FF'}]} />
                  <Text style={styles.statLabelSmall}>Đúng giờ</Text>
                </View>
                <Text style={styles.statValueSmall}>5</Text>
              </View>
              <View style={[styles.statCardSmall, styles.cardShadow]}>
                <View style={styles.statHeaderSmall}>
                  <View style={[styles.dotSm, {backgroundColor: '#FF9500'}]} />
                  <Text style={styles.statLabelSmall}>Đi trễ</Text>
                </View>
                <Text style={styles.statValueSmall}>2</Text>
              </View>
              <View style={[styles.statCardSmall, styles.cardShadow]}>
                <View style={styles.statHeaderSmall}>
                  <View style={[styles.dotSm, {backgroundColor: '#FF3B30'}]} />
                  <Text style={styles.statLabelSmall}>Về sớm</Text>
                </View>
                <Text style={styles.statValueSmall}>2</Text>
              </View>
            </View>
          </View>

          <View style={styles.divider} />

          <View style={styles.statsRow}>
            <View style={[styles.statCardLarge, styles.cardShadow]}>
              <View style={styles.statHeader}>
                <View style={[styles.dot, {backgroundColor: '#FF3B30'}]} />
                <Text style={styles.statLabel}>Vắng</Text>
              </View>
              <Text style={styles.statValueLarge}>5</Text>
            </View>

            <View style={styles.statsColumn}>
              <View style={[styles.statCardSmall, styles.cardShadow]}>
                <View style={styles.statHeaderSmall}>
                  <View style={[styles.dotSm, {backgroundColor: '#A78BFA'}]} />
                  <Text style={styles.statLabelSmall}>Có phép</Text>
                </View>
                <Text style={styles.statValueSmall}>2</Text>
              </View>
              <View style={[styles.statCardSmall, styles.cardShadow]}>
                <View style={styles.statHeaderSmall}>
                  <View style={[styles.dotSm, {backgroundColor: '#EC4899'}]} />
                  <Text style={styles.statLabelSmall}>Không phép</Text>
                </View>
                <Text style={styles.statValueSmall}>1</Text>
              </View>
            </View>
          </View>
        </View>

        {/* ---------- Pie chart ---------- */}
        <View style={[styles.chartContainer, styles.cardShadow]}>
          <View style={{alignItems: 'center', marginBottom: 8}}>
            <PieWithLabels data={pie} />
          </View>

          {/* Legend with rings and correct order */}
          <View style={styles.legend}>
            <View style={styles.legendRow}>
              {[
                {label: 'Đúng giờ', color: '#00D4FF'},
                {label: 'Có phép', color: '#A78BFA'},
                {label: 'Không phép', color: '#EC4899'},
                {label: 'Đi trễ', color: '#FF9500'},
                {label: 'Về sớm', color: '#FF3B30'},
              ].map((it, idx) => (
                <View key={idx} style={styles.legendItem}>
                  <View style={[styles.legendRing, {borderColor: it.color}]} />
                  <Text style={styles.legendText}>{it.label}</Text>
                </View>
              ))}
            </View>
          </View>
        </View>

        {/* ---------- Employee section wrapper #ACEDFB ---------- */}
        <View style={styles.employeeWrapper}>
          <View style={styles.headerPill}>
            <Text style={styles.employeeSectionTitle}>
              DANH SÁCH NHÂN VIÊN ĐÚNG GIỜ
            </Text>
            <Feather name="eye" size={18} color="#6B7EFF" />
          </View>

          <View
            style={[
              styles.searchWrapper,
              {borderWidth: 1, borderColor: '#E6EDF6'},
            ]}>
            <TextInput
              placeholder="Search"
              placeholderTextColor="#99A1AE"
              style={styles.searchInput}
            />
            <TouchableOpacity style={styles.searchClose}>
              <Feather name="x" size={18} color="#1A1A1A" />
            </TouchableOpacity>
          </View>

          {employees.map(emp => (
            <View key={emp.id} style={styles.employeeCard}>
              <Image source={emp.avatar} style={styles.employeeAvatar} />
              <View style={styles.employeeInfo}>
                <Text style={styles.employeeName}>{emp.name}</Text>
                <Text style={styles.employeeRole}>{emp.role}</Text>
                {emp.lateCount ? (
                  <Text style={styles.employeeStats}>
                    {emp.notePrefix}{' '}
                    <Text style={styles.statHighlight}>{emp.lateCount}</Text>.
                    Chiếm{' '}
                    <Text style={styles.statHighlight}>{emp.latePercent}%</Text>{' '}
                    thời gian ca làm việc
                  </Text>
                ) : (
                  <Text style={styles.employeeLeave}>{emp.status}</Text>
                )}
              </View>
              <View style={styles.employeeActions}>
                {['phone', 'message-square', 'mail'].map((ic, i) => (
                  <TouchableOpacity key={i} style={styles.actionButton}>
                    <Feather name={ic as any} size={16} color="#1A1A1A" />
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          ))}
        </View>

        {/* ---------- Line chart block ---------- */}
        <View style={[styles.bottomChartSection, styles.cardShadow]}>
          <View style={styles.bottomHeader}>
            <Text style={styles.chartTitle}>Biểu đồ thống kê</Text>
            <TouchableOpacity style={styles.chip}>
              <Text style={styles.chipText}>Weekly ▾</Text>
            </TouchableOpacity>
          </View>

          <View style={{width: CHART_W, alignSelf: 'center'}}>
            <LineChart
              data={lineData}
              width={CHART_W}
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
              style={[styles.markerWrap, {left: (CHART_W / 7) * 4 + 8}]}>
              <View style={styles.markerLine} />
              <View style={styles.markerDot} />
              <View style={styles.bubble}>
                <Text style={styles.bubbleText}>$510</Text>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

/* -------------------- styles -------------------- */
const styles = StyleSheet.create({
  container: {flex: 1, backgroundColor: '#F5F7FA'},

  // custom header
  headerBar: {
    paddingHorizontal: 16,
    paddingBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F5F7FA',
  },
  headerBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '900',
    color: '#2A87FF',
    letterSpacing: 0.3,
  },
  headerAvatar: {
    width: 34,
    height: 34,
    borderRadius: 17,
    borderWidth: 2,
    borderColor: '#5F6AF4',
  },

  scrollView: {flex: 1},
  scrollContent: {paddingHorizontal: 16, paddingBottom: 24},

  // date
  dateHeader: {flexDirection: 'row', alignItems: 'center', marginTop: 8},
  datePrefix: {
    fontSize: 14,
    color: '#1A1A1A',
    fontWeight: '600',
    marginRight: 6,
  },
  dateChip: {
    backgroundColor: '#ECEFF3',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
  },
  dateChipText: {fontSize: 13, fontWeight: '700', color: '#1A1A1A'},
  dateSubtitle: {fontSize: 12, color: '#778', marginTop: 4, marginBottom: 12},

  // stats
  statsContainer: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingVertical: 16,
    marginBottom: 16,
    borderRadius: 16,
  },
  statsRow: {flexDirection: 'row', gap: 12},
  divider: {height: 3, backgroundColor: '#E3EEFD', marginVertical: 16},
  statsColumn: {flex: 1, gap: 12},

  statCardLarge: {
    flex: 1,
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    padding: 14,
  },
  statHeader: {flexDirection: 'row', alignItems: 'center', gap: 8},
  statLabel: {fontSize: 13, fontWeight: '600', color: '#666'},
  statValueLarge: {
    fontSize: 44,
    fontWeight: '700',
    color: '#1A1A1A',
    marginTop: 6,
  },

  statCardSmall: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  statHeaderSmall: {flexDirection: 'row', alignItems: 'center', gap: 6},
  statLabelSmall: {fontSize: 12, fontWeight: '600', color: '#666'},

  dot: {width: 18, height: 18, borderRadius: 9},
  dotSm: {width: 14, height: 14, borderRadius: 7},

  cardShadow: {
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },

  // pie
  chartContainer: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 20,
    paddingVertical: 20,
    marginBottom: 16,
    borderRadius: 16,
  },
  legend: {marginTop: 8},
  legendRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 18,
    justifyContent: 'center',
  },
  legendItem: {flexDirection: 'row', alignItems: 'center', gap: 6},
  legendRing: {
    width: 14,
    height: 14,
    borderRadius: 7,
    borderWidth: 2,
    backgroundColor: '#FFFFFF',
  },
  legendText: {fontSize: 13, color: '#666'},

  // employee wrapper
  employeeWrapper: {
    backgroundColor: '#ACEDFB',
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderRadius: 16,
    marginBottom: 16,
  },
  headerPill: {
    alignSelf: 'stretch',
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 12,
    marginBottom: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E6EDF6',
  },
  employeeSectionTitle: {fontSize: 13, fontWeight: '700', color: '#1A1A1A'},

  searchWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EAF3FF',
    borderRadius: 12,
    paddingLeft: 14,
    paddingRight: 6,
    marginBottom: 12,
  },
  searchInput: {flex: 1, height: 42, fontSize: 14, color: '#333'},
  searchClose: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#DDE9F8',
    alignItems: 'center',
    justifyContent: 'center',
  },

  employeeCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    marginBottom: 12,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E6EDF6',
  },
  employeeAvatar: {width: 48, height: 48, borderRadius: 24, marginRight: 12},
  employeeInfo: {flex: 1},
  employeeName: {fontSize: 15, fontWeight: '700', color: '#1A1A1A'},
  employeeRole: {fontSize: 13, color: '#6B7280', marginTop: 2, marginBottom: 8},
  employeeStats: {fontSize: 12, color: '#6B7280', lineHeight: 18},
  statHighlight: {color: '#E11D48', fontWeight: '700'},
  employeeLeave: {fontSize: 12, color: '#E11D48'},

  employeeActions: {flexDirection: 'row', gap: 8, marginLeft: 8},
  actionButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#D9E3F0',
    alignItems: 'center',
    justifyContent: 'center',
  },

  // line chart
  bottomChartSection: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 20,
    paddingVertical: 20,
    borderRadius: 16,
  },
  bottomHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  chartTitle: {fontSize: 16, fontWeight: '700', color: '#1A1A1A'},
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
    backgroundColor: '#F5F7FA',
  },
  chipText: {fontSize: 12, fontWeight: '600', color: '#1A1A1A'},

  markerWrap: {position: 'absolute', top: 0, bottom: 0, alignItems: 'center'},
  markerLine: {
    width: 2,
    backgroundColor: '#F3C9A5',
    flex: 1,
    marginTop: 16,
    borderRadius: 1,
  },
  markerDot: {
    position: 'absolute',
    top: 86,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#fff',
    borderWidth: 2,
    borderColor: '#FFB35C',
  },
  bubble: {
    position: 'absolute',
    top: 46,
    paddingHorizontal: 10,
    paddingVertical: 6,
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#EEF1F6',
  },
  bubbleText: {fontSize: 12, fontWeight: '700', color: '#1A1A1A'},
});
