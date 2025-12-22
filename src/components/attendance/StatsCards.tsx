import {Image, StyleSheet, Text, TouchableOpacity, View} from 'react-native';

type SmallKey =
  | 'onTime'
  | 'late'
  | 'leaveEarly'
  | 'withPermit'
  | 'withoutPermit';

type Props = {
  selectedKey?: SmallKey;
  onSelect?: (k: SmallKey) => void;
  worked?: number;
  absent?: number;
  onTime?: number;
  late?: number;
  leaveEarly?: number;
  withPermit?: number;
  withoutPermit?: number;
};

const ICONS = {
  worked: require('../../assets/Report/Dadilam.png'),
  absent: require('../../assets/Report/Vang.png'),
  onTime: require('../../assets/Report/Dunggio.png'),
  late: require('../../assets/Report/Ditre.png'),
  leaveEarly: require('../../assets/Report/Vesom.png'),
  withPermit: require('../../assets/Report/Cophep.png'),
  withoutPermit: require('../../assets/Report/Khongphep.png'),
} as const;

export default function StatsCards({
  selectedKey,
  onSelect,
  worked = 1,
  absent = 5,
  onTime = 5,
  late = 2,
  leaveEarly = 2,
  withPermit = 2,
  withoutPermit = 1,
}: Props) {
  const smallItems1 = [
    {
      key: 'onTime' as const,
      label: 'Đúng giờ',
      value: onTime,
      icon: ICONS.onTime,
    },
    {key: 'late' as const, label: 'Đi trễ', value: late, icon: ICONS.late},
    {
      key: 'leaveEarly' as const,
      label: 'Về sớm',
      value: leaveEarly,
      icon: ICONS.leaveEarly,
    },
  ];
  const smallItems2 = [
    {
      key: 'withPermit' as const,
      label: 'Có phép',
      value: withPermit,
      icon: ICONS.withPermit,
    },
    {
      key: 'withoutPermit' as const,
      label: 'Không phép',
      value: withoutPermit,
      icon: ICONS.withoutPermit,
    },
  ];

  return (
    <View style={styles.wrap}>
      {/* Hàng 1 */}
      <View style={styles.row}>
        <View style={[styles.bigCard, styles.shadow]}>
          <View style={styles.bigHeader}>
            <Image source={ICONS.worked} style={styles.iconBig} />
            <Text style={styles.bigTitle}>Đã đi làm</Text>
          </View>
          <Text style={styles.bigValue}>{worked}</Text>
        </View>

        <View style={styles.col}>
          {smallItems1.map((it, idx) => {
            const active = selectedKey === it.key;
            return (
              <TouchableOpacity
                key={it.key}
                activeOpacity={0.85}
                onPress={() => onSelect?.(it.key)}
                style={[
                  styles.smallCard,
                  styles.shadow,
                  active &&
                    (idx === 0
                      ? styles.smallCardActivePrimary
                      : styles.smallCardActive),
                ]}>
                <View style={styles.smallLeft}>
                  <Image source={it.icon} style={styles.iconSmall} />
                  <Text
                    style={[
                      styles.smallLabel,
                      active && styles.smallLabelActive,
                    ]}>
                    {it.label}
                  </Text>
                </View>

                {/* SỐ TRẦN, KHÔNG BO TRÒN */}
                <Text style={[styles.count, active && styles.countActive]}>
                  {it.value}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      <View style={styles.separator} />

      {/* Hàng 2 */}
      <View style={styles.row}>
        <View style={[styles.bigCard, styles.shadow]}>
          <View style={styles.bigHeader}>
            <Image source={ICONS.absent} style={styles.iconBig} />
            <Text style={styles.bigTitle}>Vắng</Text>
          </View>
          <Text style={styles.bigValue}>{absent}</Text>
        </View>

        <View style={styles.col}>
          {smallItems2.map(it => {
            const active = selectedKey === it.key;
            return (
              <TouchableOpacity
                key={it.key}
                activeOpacity={0.85}
                onPress={() => onSelect?.(it.key)}
                style={[
                  styles.smallCard,
                  styles.shadow,
                  active && styles.smallCardActive,
                ]}>
                <View style={styles.smallLeft}>
                  <Image source={it.icon} style={styles.iconSmall} />
                  <Text
                    style={[
                      styles.smallLabel,
                      active && styles.smallLabelActive,
                    ]}>
                    {it.label}
                  </Text>
                </View>

                {/* SỐ TRẦN, KHÔNG BO TRÒN */}
                <Text style={[styles.count, active && styles.countActive]}>
                  {it.value}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>
    </View>
  );
}

const BORDER = '#E7EEF8';

const styles = StyleSheet.create({
  wrap: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 8,
    paddingVertical: 8,
    marginBottom: 10,
    borderRadius: 12,
  },

  row: {flexDirection: 'row', gap: 8, alignItems: 'stretch'},
  col: {flex: 1, gap: 6},

  separator: {
    height: 4,
    backgroundColor: '#E6EDFA',
    marginVertical: 8,
    borderRadius: 2,
  },

  bigCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: BORDER,
    padding: 8,
  },
  bigHeader: {flexDirection: 'row', alignItems: 'center', gap: 6},
  bigTitle: {fontSize: 14, fontWeight: '600', color: '#3E4B59'},
  bigValue: {
    fontSize: 28,
    fontWeight: '800',
    color: '#0F172A',
    marginTop: 2,
  },

  smallCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: BORDER,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  smallCardActive: {
    backgroundColor: '#E9FBFF',
    borderColor: '#B9EEF4',
  },
  smallCardActivePrimary: {
    backgroundColor: '#CFF7F5',
    borderColor: '#A6ECE6',
  },

  smallLeft: {flexDirection: 'row', alignItems: 'center', gap: 6},
  smallLabel: {fontSize: 13, color: '#334155', fontWeight: '600'},
  smallLabelActive: {color: '#0E7490'},

  count: {fontSize: 18, fontWeight: '800', color: '#0F172A'},
  countActive: {color: '#075985'},

  iconSmall: {width: 18, height: 18, resizeMode: 'contain'},
  iconBig: {width: 18, height: 18, resizeMode: 'contain'},

  shadow: {
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.04,
    shadowRadius: 3,
    elevation: 1,
  },
});