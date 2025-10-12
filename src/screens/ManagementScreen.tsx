import {
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import Header from '../components/common/Header';

export default function ManagementScreen() {
  const menuItems = [
    {
      icon: require('../assets/QuanLy/report.png'),
      title: 'Báo cáo tổng hợp',
      subtitle: 'Tổng hợp số liệu thống kê',
    },
    {
      icon: require('../assets/QuanLy/shift.png'),
      title: 'Quản lý bằng công',
      subtitle: 'Theo dõi công theo nhân viên',
    },
    {
      icon: require('../assets/QuanLy/day-off.png'),
      title: 'Duyệt đơn nghỉ',
      subtitle: 'Xử lý đơn xin nghỉ',
    },
    {
      icon: require('../assets/QuanLy/overtime.png'),
      title: 'Duyệt đơn xin OT',
      subtitle: 'Xử lý đơn xin OT',
    },
    {
      icon: require('../assets/QuanLy/working.png'),
      title: 'Duyệt tăng ca nhân viên',
      subtitle: 'Xác nhận đơn xin tăng ca',
    },
    {
      icon: require('../assets/QuanLy/personal-information.png'),
      title: 'Quản lý nhân viên',
      subtitle: 'Danh sách nhân viên',
    },
    {
      icon: require('../assets/QuanLy/organization-structure.png'),
      title: 'Quản lý phòng ban',
      subtitle: 'Cấu trúc tổ chức',
    },
    {
      icon: require('../assets/QuanLy/team.png'),
      title: 'Chính sách ca làm việc và ngày nghỉ',
      subtitle: 'Thiết lập ca làm, ngày nghỉ',
    },
    {
      icon: require('../assets/QuanLy/ip.png'),
      title: 'Cấu hình địa chỉ IP công ty',
      subtitle: 'Quản lý IP chấm công',
    },
  ];

  return (
    <View style={styles.container}>
      <Header title="QUẢN LÝ" showBack={true} pageBgColor="#F5F7FA" />

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <View style={styles.searchWrapper}>
          <TextInput
            placeholder="Search"
            placeholderTextColor="#999"
            style={styles.searchInput}
          />
          <TouchableOpacity style={styles.searchButton}>
            <Text style={styles.closeIcon}>✕</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Scrollable Menu Items */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}>
        {menuItems.map((item, index) => (
          <TouchableOpacity
            key={index}
            style={styles.menuItem}
            activeOpacity={0.7}>
            <View style={styles.textContainer}>
              <Text style={styles.menuTitle}>{item.title}</Text>
              <Text style={styles.menuSubtitle}>{item.subtitle}</Text>
            </View>
            <View style={styles.iconContainer}>
              <Image
                source={item.icon}
                style={styles.menuIcon}
                resizeMode="contain"
              />
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F7FA',
  },
  searchContainer: {
    paddingHorizontal: 16,
    paddingTop: -40,
    paddingBottom: 16,
    backgroundColor: 'transparent',
    marginTop: -50,
    zIndex: 10,
  },
  searchWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 25,
    paddingLeft: 16,
    paddingRight: 4,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  searchInput: {
    flex: 1,
    height: 50,
    fontSize: 15,
    color: '#333',
  },
  searchButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#EBF5FD',
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeIcon: {
    fontSize: 20,
    color: '#1A1A1A',
    fontWeight: '600',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 24,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 3,
    minHeight: 90,
  },
  textContainer: {
    flex: 1,
    paddingRight: 16,
  },
  menuTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#1A1A1A',
    marginBottom: 6,
  },
  menuSubtitle: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  iconContainer: {
    width: 70,
    height: 70,
    borderRadius: 16,
    backgroundColor: '#F8F9FA',
    alignItems: 'center',
    justifyContent: 'center',
  },
  menuIcon: {
    width: 70,
    height: 70,
  },
});
