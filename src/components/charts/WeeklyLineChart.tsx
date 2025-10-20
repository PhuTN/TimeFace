import {Dimensions, StyleSheet, Text, View} from 'react-native';
import {LineChart} from 'react-native-chart-kit';

const screenWidth = Dimensions.get('window').width;

type Props = {
  data?: {
    labels: string[];
    datasets: {data: number[]; strokeWidth?: number; color?: any}[];
  };
  widthOffset?: number; // tổng padding horizontal của card
};

export default function WeeklyLineChart({data, widthOffset = 32 + 40}: Props) {
  const CHART_W = screenWidth - widthOffset;

  const lineData = data ?? {
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
      {/* Marker mẫu */}
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
  );
}

const styles = StyleSheet.create({
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
