import React, {useState} from 'react';
import {
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

import Footer from '../components/common/Footer';
import HeaderBar from '../components/common/HeaderBar';
import {useSafeAreaInsets} from 'react-native-safe-area-context';

export default function ManagementScreen({navigation}: any) {
  const insets = useSafeAreaInsets();

  const [activeTab, setActiveTab] = useState<number>(1);
  const [searchText, setSearchText] = useState('');

  const menuItems = [
    {
      icon: require('../assets/QuanLy/report.png'),
      title: 'Báo cáo tổng hợp',
      subtitle: 'Tổng hợp số liệu thống kê',
        route: 'Report',
      
    },
    {
      icon: require('../assets/QuanLy/shift.png'),
      title: 'Quản lý bảng công',
      subtitle: 'Theo dõi công theo nhân viên',
    },
    {
      icon: require('../assets/QuanLy/day-off.png'),
      title: 'Duyệt đơn nghỉ',
      subtitle: 'Xử lý đơn xin nghỉ',
      route: 'LeaveRequests', // 👈 route màn duyệt đơn nghỉ
    },

    {
      icon: require('../assets/QuanLy/overtime.png'),
      title: 'Duyệt đơn xin OT',
      subtitle: 'Xử lý đơn xin OT',
      route: 'OTRequest',
    },
    {
      icon: require('../assets/QuanLy/working.png'),
      title: 'Duyệt khiếu nại chấm công',
      subtitle: 'Xử lý khiếu nại check-in / check-out',
      route: 'ComplaintRequests',
    },

    // ⭐⭐ Cái này cần điều hướng sang EmployeeManagement
    {
      icon: require('../assets/QuanLy/personal-information.png'),
      title: 'Quản lý nhân viên',
      subtitle: 'Danh sách nhân viên',
      route: 'EmployeeManagement',
    },

    {
      icon: require('../assets/QuanLy/organization-structure.png'),
      title: 'Quản lý phòng ban',
      subtitle: 'Cấu trúc tổ chức',
      route: 'DepartmentManagement', // ⭐ THÊM ROUTE
    },

    {
      icon: require('../assets/QuanLy/team.png'),
      title: 'Chính sách ca làm việc và ngày nghỉ',
      subtitle: 'Thiết lập ca làm, ngày nghỉ',
      route: 'AttendanceConfig', // ⭐ ĐÃ THÊM ROUTE
    },

    {
      icon: require('../assets/QuanLy/ip.png'),
      title: 'Cấu hình tọa độ công ty',
      subtitle: 'Thiết lập vị trí & bán kính check-in',
      route: 'CompanyLocationConfig', // ⭐ MÀN HÌNH CẬU ĐÃ CODE
    },
  ];

  const filteredItems = menuItems.filter(
    item =>
      item.title.toLowerCase().includes(searchText.toLowerCase()) ||
      item.subtitle.toLowerCase().includes(searchText.toLowerCase()),
  );

  return (
    <View style={styles.container}>
      {/* HEADER */}
      <HeaderBar
        title="Quản lý"
        onBack={() => navigation.goBack()}
        topInset={insets.top}
        isShowAvatar={true}
        isShowBackButton={false}
      />

      {/* SEARCH */}
      <View style={styles.searchContainer}>
        <View style={styles.searchWrapper}>
          <TextInput
            placeholder="Tìm kiếm"
            placeholderTextColor="#999"
            style={styles.searchInput}
            value={searchText}
            onChangeText={setSearchText}
          />

          {searchText.length > 0 && (
            <TouchableOpacity
              style={styles.searchButton}
              onPress={() => setSearchText('')}>
              <Text style={styles.closeIcon}>✕</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* LIST */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}>
        {filteredItems.map((item, index) => (
          <TouchableOpacity
            key={index}
            style={styles.menuItem}
            activeOpacity={0.7}
            onPress={() => {
              // ⭐ Nếu item có route → điều hướng
              if (item.route) navigation.navigate(item.route);
            }}>
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

        {filteredItems.length === 0 && (
          <Text style={{textAlign: 'center', marginTop: 20, color: '#666'}}>
            Không tìm thấy kết quả
          </Text>
        )}
      </ScrollView>

      {/* FOOTER */}
      <Footer
        activeIndex={1}
        onPress={i => {
          setActiveTab(i);
          if (i === 0) navigation.navigate('Home');
          else if (i === 1) navigation.navigate('Management');
          else if (i === 3) navigation.navigate('Settings');
          // else navigation.navigate('NotificationSender');
        }}
      />
    </View>
  );
}

// STYLE giữ nguyên
const styles = StyleSheet.create({
  container: {flex: 1, backgroundColor: '#F5F7FA'},
  searchContainer: {
    paddingHorizontal: 16,
    paddingTop: 25,
    paddingBottom: 10,
    zIndex: 10,
  },
  searchWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    borderRadius: 25,
    paddingLeft: 16,
    paddingRight: 8,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  searchInput: {flex: 1, height: 50, fontSize: 15, color: '#333'},
  searchButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#EBF5FD',
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeIcon: {fontSize: 18, fontWeight: '600', color: '#1A1A1A'},
  scrollView: {flex: 1},
  scrollContent: {paddingHorizontal: 16, paddingTop: 8, paddingBottom: 120},
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    borderRadius: 20,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 3,
  },
  textContainer: {flex: 1, paddingRight: 16},
  menuTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#1A1A1A',
    marginBottom: 6,
  },
  menuSubtitle: {fontSize: 14, color: '#666'},
  iconContainer: {
    width: 70,
    height: 70,
    borderRadius: 16,
    backgroundColor: '#F8F9FA',
    alignItems: 'center',
    justifyContent: 'center',
  },
  menuIcon: {width: 70, height: 70},
});
