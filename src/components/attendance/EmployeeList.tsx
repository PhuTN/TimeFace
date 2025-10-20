import {
  Image,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import Feather from 'react-native-vector-icons/Feather';

export type Employee =
  | {
      id: number | string;
      name: string;
      role: string;
      avatar: {uri: string} | number;
      lateCount: number;
      latePercent: number;
      notePrefix: string;
    }
  | {
      id: number | string;
      name: string;
      role: string;
      avatar: {uri: string} | number;
      status: string;
    };

type Props = {employees: Employee[]};

export default function EmployeeList({employees}: Props) {
  return (
    <View style={styles.wrapper}>
      {/* Header pill */}
      <View style={styles.headerPill}>
        <Text style={styles.title}>DANH SÁCH NHÂN VIÊN ĐÚNG GIỜ</Text>

        {/* Nút mắt bên phải */}
        <TouchableOpacity activeOpacity={0.7} style={styles.titleIcon}>
          {/* dùng eye hoặc eye-off tùy trạng thái */}
          <Feather name="eye" size={16} color="#6B7EFF" />
        </TouchableOpacity>
      </View>

      {/* Search box */}
      <View style={styles.searchRow}>
        <TextInput
          placeholder="Search"
          placeholderTextColor="#7E8A9A"
          style={styles.searchInput}
        />
        <TouchableOpacity style={styles.closeBtn}>
          <Feather name="x" size={14} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      {/* List */}
      {employees.map((emp: any) => (
        <View key={emp.id} style={styles.card}>
          {/* ---- TOP AREA ---- */}
          <View style={styles.topArea}>
            <Image source={emp.avatar} style={styles.avatar} />
            <View style={{flex: 1}}>
              <Text style={styles.name}>{emp.name}</Text>
              <Text style={styles.role}>{emp.role}</Text>
            </View>

            <View style={styles.actions}>
              {['phone', 'message-square', 'mail'].map((ic, i) => (
                <TouchableOpacity key={i} style={styles.actionBtn}>
                  <Feather name={ic as any} size={16} color="#1A1A1A" />
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* gạch xám chia đôi */}
          <View style={styles.midDivider} />

          {/* ---- BOTTOM NOTE ---- */}
          <View style={styles.bottomArea}>
            {'lateCount' in emp ? (
              <Text style={styles.stats}>
                Số phút đi trễ: <Text style={styles.hl}>{emp.lateCount}</Text>.
                Chiếm <Text style={styles.hl}>{emp.latePercent}%</Text> thời
                gian ca làm việc
              </Text>
            ) : (
              <Text style={styles.leave}>
                Xin nghỉ lý do: <Text style={styles.hl}>Bị cảm{'\n'}sốt</Text>
              </Text>
            )}
          </View>
        </View>
      ))}
    </View>
  );
}

/* ====== styles ====== */
const BORDER = '#D7E2EA';
const BG_WRAPPER = '#EAF3FF';

const styles = StyleSheet.create({
  wrapper: {
    backgroundColor: BG_WRAPPER,
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderRadius: 16,
  },

  headerPill: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: BORDER,
    marginBottom: 8,
  },
  title: {
    fontSize: 12,
    fontWeight: '700',
    color: '#1A1A1A',
    letterSpacing: 0.3,
  },

  // style cho nút mắt
  titleIcon: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#EEF2FF',
    alignItems: 'center',
    justifyContent: 'center',
  },

  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#DDEBFA',
    borderRadius: 10,
    paddingLeft: 12,
    paddingRight: 6,
    height: 40,
    borderWidth: 1,
    borderColor: '#CFE0F5',
    marginBottom: 10,
  },
  searchInput: {flex: 1, fontSize: 13, color: '#1A1A1A'},
  closeBtn: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#1A1A1A',
    alignItems: 'center',
    justifyContent: 'center',
  },

  card: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: BORDER,
    borderRadius: 18,
    overflow: 'hidden',
    marginBottom: 12,
  },

  topArea: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingTop: 10,
    paddingBottom: 12,
  },
  avatar: {width: 56, height: 56, borderRadius: 28, marginRight: 12},
  name: {fontSize: 18, fontWeight: '700', color: '#1A1A1A'},
  role: {fontSize: 14, color: '#6B7280', marginTop: 2},

  actions: {flexDirection: 'row', gap: 10, marginLeft: 10},
  actionBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: BORDER,
    alignItems: 'center',
    justifyContent: 'center',
  },

  midDivider: {height: 1, backgroundColor: '#E5E7EB'},

  bottomArea: {paddingHorizontal: 12, paddingVertical: 10},
  stats: {fontSize: 14, color: '#6B7280', lineHeight: 20},
  leave: {fontSize: 16, color: '#6B7280', lineHeight: 22, fontWeight: '600'},
  hl: {color: '#E11D48', fontWeight: '700'},
});
