import React, {memo, useState} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ListRenderItem,
  Pressable,
  FlatList,
  ScrollView,
  RefreshControl,
} from 'react-native';
import {useUIFactory} from '../ui/factory/useUIFactory';
import FilterIcon from '../assets/icons/filter_icon.svg';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {RootStackParamList} from '../navigation/AppNavigator';
import {Department} from '../fake_data/Dien/fake_data.tsx'; // ⭐ chỉ import type
import DepartmentFilter, {
  DepartmentFilterValues,
} from '../components/common/DepartmentFilter';
import AddButton from '../components/common/AddButton';
import AddDepartmentModal from '../components/common/AddDepartmentModal';
import Chip from '../components/common/Chip.tsx';
import HeaderBar from '../components/common/HeaderBar.tsx';
import FilterChip from '../components/common/FilterChip.tsx';
import {apiHandle} from '../api/apihandle.ts';
import {DepartmentEP} from '../api/endpoint/Department.ts';
import Toast from 'react-native-toast-message';

type Props = NativeStackScreenProps<RootStackParamList, 'DepartmentManagement'>;

const DepartmentManagementScreen = ({navigation}: Props) => {
  const {loading, theme, lang} = useUIFactory();

  const [showFilter, setShowFilter] = useState(false);
  const [showAdd, setShowAdd] = useState(false);

  // ⭐ Lưu raw BE
  const [departmentsRaw, setDepartmentsRaw] = useState<any[]>([]);

  // ⭐ Data FE để hiển thị
  const [displayed, setDisplayed] = useState<Department[]>([]);

  const [refreshing, setRefreshing] = useState(false);

  // ⭐ Hàm convert raw BE → FE type
  const convert = (list: any[]): Department[] =>
    list.map((d: any) => ({
      id: d._id,
      name: d.name,
      head: d.manager_id?.full_name ?? '—',
      createdAt: d.createdAt ?? new Date().toISOString(),
      active: d.record_status,
    }));

  // ⭐ Load API thật
  const reloadDepartments = async () => {
    try {
      setRefreshing(true);

      const {status, res} = await apiHandle
        .callApi(DepartmentEP.GetAll)
        .asPromise();

      if (!status.isError && res?.data) {
        setDepartmentsRaw(res.data);

        const mapped = convert(res.data);

        const sorted = mapped.sort(
          (a, b) => +new Date(b.createdAt) - +new Date(a.createdAt),
        );

        setDisplayed(sorted);
      }
    } catch (e) {
      console.log('Reload dept failed', e);
    } finally {
      setRefreshing(false);
    }
  };

  React.useEffect(() => {
    reloadDepartments();
  }, []);

  // 🔥 Tự reload mỗi khi màn hình được focus (kể cả back quay lại)
  React.useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      console.log('🔄 Screen focus → reload');
      reloadDepartments();
    });

    return unsubscribe;
  }, [navigation]);

  const [criteria, setCriteria] = useState<DepartmentFilterValues>({
    departmentName: '',
    headName: '',
    sortBy: 'created_desc',
  });

  const [activeFilters, setActiveFilters] = useState<
    {key: string; mainText: string; subText: string}[]
  >([]);

  const DepartmentCard = memo(
    ({item, onPress}: {item: Department; onPress?: () => void}) => {
      return (
        <Pressable
          onPress={onPress}
          style={({pressed}) => [styles.card, pressed && {opacity: 0.9}]}>
          <View style={styles.cardHeader}>
            <Text
              numberOfLines={1}
              style={{
                fontSize: 12,
                fontWeight: '700',
                color: '#1A1A1A',
                textTransform: 'uppercase',
                flex: 1,
              }}>
              {item.name}
            </Text>

            <Chip status={item.active ? 'active' : 'inactive'} />
          </View>

          <Text
            numberOfLines={2}
            style={{
              fontSize: 12,
              color: '#6B7280',
              marginTop: 4,
              lineHeight: 16,
            }}>
            {lang?.t('head_of_dept') + ': ' + item.head}
          </Text>
        </Pressable>
      );
    },
  );

  const renderItem: ListRenderItem<Department> = ({item}) => {
    return (
      <DepartmentCard
        item={item}
        onPress={() =>
          navigation.navigate('DepartmentDetail', {
            departmentDetail: item,
          })
        }
      />
    );
  };

  if (loading || !theme || !lang) return null;

  const styles = makeStyles(theme);

  return (
    <SafeAreaView style={{flex: 1, backgroundColor: theme.colors.background}}>
      <HeaderBar
        title={lang.t('department_management')}
        onBack={() => navigation.goBack()}
      />

      <View
        style={[styles.container, {backgroundColor: theme.colors.background}]}>
        {/* Add Button */}
        <View style={styles.addEmployee}>
          <AddButton
            title={lang.t('add_department')}
            icon={require('../assets/icons/department_icon.png')}
            onPress={() => setShowAdd(true)}
          />
        </View>

        {/* Header */}
        <View style={styles.rowHeader}>
          <Text style={[styles.sectionTitle, {color: theme.colors.text}]}>
            {lang.t('list_department')}
          </Text>

          <TouchableOpacity
            style={styles.filterBtn}
            onPress={() => setShowFilter(true)}>
            <FilterIcon width={22} height={22} />
          </TouchableOpacity>
        </View>

        {/* Active filter chips */}
        {activeFilters.length > 0 && (
          <View style={{marginBottom: 10}}>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{
                flexDirection: 'row',
                gap: 10,
                paddingHorizontal: 2,
              }}>
              {activeFilters.map(f => (
                <FilterChip
                  key={f.key}
                  mainText={f.mainText}
                  subText={f.subText}
                  theme={theme}
                  onRemove={() => {
                    const newValues = {...criteria};
                    if (f.key === 'headName') newValues.headName = '';
                    if (f.key === 'departmentName')
                      newValues.departmentName = '';
                    if (f.key === 'sortBy') newValues.sortBy = 'created_desc';

                    setCriteria(newValues);

                    const dname = newValues.departmentName.trim().toLowerCase();
                    const hname = newValues.headName.trim().toLowerCase();

                    let next = convert(departmentsRaw).filter(
                      d =>
                        (!dname || d.name.toLowerCase().includes(dname)) &&
                        (!hname || d.head.toLowerCase().includes(hname)),
                    );

                    next = sortBy(next, newValues.sortBy);

                    setDisplayed(next);

                    setActiveFilters(prev => prev.filter(c => c.key !== f.key));
                  }}
                />
              ))}
            </ScrollView>
          </View>
        )}

        {/* List */}
        <FlatList
          data={displayed}
          keyExtractor={d => d.id}
          renderItem={renderItem}
          contentContainerStyle={styles.listContent}
          ItemSeparatorComponent={() => <View style={{height: 12}} />}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={reloadDepartments}
            />
          }
        />

        {/* Filter Modal */}
        <DepartmentFilter
          visible={showFilter}
          current={criteria}
          onClose={() => setShowFilter(false)}
          onApply={values => {
            setCriteria(values);

            const dname = values.departmentName.trim().toLowerCase();
            const hname = values.headName.trim().toLowerCase();

            let next = convert(departmentsRaw).filter(
              d =>
                (!dname || d.name.toLowerCase().includes(dname)) &&
                (!hname || d.head.toLowerCase().includes(hname)),
            );

            next = sortBy(next, values.sortBy);

            setDisplayed(next);

            const chips: any[] = [];
            if (values.headName.trim())
              chips.push({
                key: 'headName',
                mainText: 'Tên trưởng phòng',
                subText: values.headName,
              });
            if (values.departmentName.trim())
              chips.push({
                key: 'departmentName',
                mainText: 'Tên phòng ban',
                subText: values.departmentName,
              });

            chips.push({
              key: 'sortBy',
              mainText: lang.t('sort_by'),
              subText: getSortLabel(values.sortBy, lang),
            });

            setActiveFilters(chips);
          }}
        />

        {/* Add Modal */}
        <AddDepartmentModal
          visible={showAdd}
          onClose={() => setShowAdd(false)}
          onSubmit={async p => {
            try {
              const {status, res} = await apiHandle
                .callApi(DepartmentEP.Create, {
                  name: p.name,
                  department_code: p.code,
                  manager_id: p.headId,
                  users: p.users,
                })
                .asPromise();

              if (res.success) {
                await reloadDepartments();
                return {success: true};
              }
              setShowAdd(false)
              // ❗ Nếu 400 hoặc BE trả false → toast luôn tại đây
              Toast.show({
                type: 'error',
                text1: 'Tạo phòng ban thất bại',
                text2: res?.message || 'Dữ liệu không hợp lệ',
              });

              return {success: false};
            } catch (err: any) {
              console.log('Error create dept:', err);

              // ⭐ Lấy message BE quăng ra
              const message =
                err?.message ||
                err?.response?.data?.message ||
                'Đã xảy ra lỗi không xác định';

              Toast.show({
                type: 'error',
                text1: 'Tạo phòng ban thất bại',
                text2: message,
              });

              return {success: false};
            }
          }}
        />
      </View>
    </SafeAreaView>
  );
};

// ⭐ SORT helper
function sortBy(list: Department[], type: string) {
  return list.sort((a, b) => {
    switch (type) {
      case 'created_asc':
        return +new Date(a.createdAt) - +new Date(b.createdAt);
      case 'name_asc':
        return a.name.localeCompare(b.name);
      case 'name_desc':
        return b.name.localeCompare(a.name);
      case 'created_desc':
      default:
        return +new Date(b.createdAt) - +new Date(a.createdAt);
    }
  });
}

function getSortLabel(type: string, lang: any) {
  switch (type) {
    case 'created_desc':
      return lang.t('sort_created_desc');
    case 'created_asc':
      return lang.t('sort_created_asc');
    case 'name_asc':
      return lang.t('sort_name_asc');
    case 'name_desc':
      return lang.t('sort_name_desc');
    default:
      return '';
  }
}

const makeStyles = (theme: any) =>
  StyleSheet.create({
    addEmployee: {
      alignSelf: 'flex-end',
      paddingBottom: 8,
      marginTop: 10,
    },
    rowHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginTop: theme.spacing(2),
      marginBottom: theme.spacing(1),
      paddingHorizontal: 12,
    },
    sectionTitle: {
      fontSize: 16,
      fontWeight: '600',
    },
    filterBtn: {
      borderRadius: 10,
      alignItems: 'center',
      justifyContent: 'center',
    },
    container: {
      flex: 1,
      paddingHorizontal: 12,
      paddingTop: 12,
    },
    listContent: {
      paddingBottom: 24,
    },
    card: {
      backgroundColor: theme.colors.background,
      borderRadius: 10,
      borderColor: theme.colors.cardBoder,
      borderWidth: 1.5,
      padding: 13,
      shadowColor: '#000',
      shadowOffset: {width: 0, height: 1},
      shadowOpacity: 0.2,
      shadowRadius: 2,
      elevation: 2,
    },
    cardHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginBottom: 6,
    },
    badgeText: {
      fontSize: 14,
      fontWeight: '700',
      color: '#0B3B2E',
    },
  });

export default DepartmentManagementScreen;
