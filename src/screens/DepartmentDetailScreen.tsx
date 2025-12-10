import React, {memo, useMemo, useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  FlatList,
  ListRenderItem,
  Image,
  Pressable,
  Alert,
  ScrollView,
  RefreshControl,
} from 'react-native';
import {useUIFactory} from '../ui/factory/useUIFactory';
import Header from '../components/common/Header';
import LabeledTextInput from '../components/common/LabeledTextInput';
import LabeledSelect from '../components/common/LabeledSelect';
import type {Option} from '../types/common';
import {
  Department,
  Employee,
  DEPARTMENTS,
} from '../fake_data/Dien/fake_data.tsx';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {RootStackParamList} from '../navigation/AppNavigator';
import FilterIcon from '../assets/icons/filter_icon.svg';
import EmployeeFilterInDepartment, {
  EmployeeFilterInDeptValues,
} from '../components/common/EmployeeFilterInDepartment';
import HeaderBar from '../components/common/HeaderBar.tsx';
import FilterChip from '../components/common/FilterChip.tsx';

// ⭐ ADDED
import {apiHandle} from '../api/apihandle';
import {DepartmentEP} from '../api/endpoint/Department';
import {User} from '../api/endpoint/User.ts';
import Toast from 'react-native-toast-message';

type Props = NativeStackScreenProps<RootStackParamList, 'DepartmentDetail'>;

const UNASSIGNED_DEPT_ID = 'unassigned';

export default function DepartmentDetailScreen({route, navigation}: Props) {
  const {loading, theme, lang} = useUIFactory();
  const [departmentDetail, setDepartmentDetail] = useState(
    route.params?.departmentDetail ?? null,
  );
  const [showFilter, setShowFilter] = useState(false);
  const [loadingSave, setLoadingSave] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  // FULL EMPLOYEES SOURCE
  const [employees, setEmployees] = useState<Employee[]>([]);

  // ⭐ ADDED — Replace fake employees with API users

  const loadUsers = async () => {
    try {
      const {status, res} = await apiHandle
        .callApi(User.GetByCompany)
        .asPromise();

      if (!res.success || !res?.data?.users) return;

      const filtered = res.data.users.filter((u: any) => u.role === 'user');

      const users = filtered.map((u: any) => ({
        id: u._id,
        name: u.full_name,
        position: u.job_title ?? '',
        employee_code: u.employee_code ?? '',
        avatar: u.avatar
          ? {uri: u.avatar}
          : {uri: 'https://cdn-icons-png.flaticon.com/512/149/149071.png'},
        departmentId: u.department_id ?? UNASSIGNED_DEPT_ID,
        createdAt: u.createdAt ?? new Date().toISOString(),
      }));

      setEmployees(users);
    } catch (err) {
      console.log('Load users error:', err);
    }
  };

  const loadDetail = async () => {
    if (!departmentDetail?.id) return;

    try {
      const {status, res} = await apiHandle
        .callApi(DepartmentEP.ById(departmentDetail.id))
        .asPromise();

      if (!res.success || !res?.data) return;

      const d = res.data;

      setDepartmentDetail(prev => ({
        ...prev,
        name: d.name,
        head: d.manager_id?.full_name ?? '',
        manager_id: d.manager_id?._id ?? null,
        active: true,
      }));

      setManagerId(d.manager_id?._id ?? null);
    } catch (err) {
      console.log('Load department detail error:', err);
    }
  };

  React.useEffect(() => {
    loadUsers();
    loadDetail();
  }, []);
  const onRefresh = async () => {
    setRefreshing(true);
    await Promise.all([loadUsers(), loadDetail()]);
    setRefreshing(false);
  };
  // FILTER CRITERIA
  const [criteria, setCriteria] = useState<EmployeeFilterInDeptValues>({
    employeeName: '',
    position: '',
    sortBy: 'created_desc',
    inDeptOnly: false,
  });

  const [activeFilters, setActiveFilters] = useState<
    {key: string; mainText: string; subText: string}[]
  >([]);

  const [visibleEmployees, setVisibleEmployees] = useState<Employee[]>([]);

  const [deptName, setDeptName] = useState<string>(
    departmentDetail?.name ?? '',
  );
  const [deptHead, setDeptHead] = useState<string>(
    departmentDetail?.head ?? '',
  );
  const [deptActive, setDeptActive] = useState<boolean>(
    !!departmentDetail?.active,
  );

  const dept = departmentDetail;
  const [managerId, setManagerId] = useState<string | null>(null);

  // ⭐ Danh sách nhân viên trong phòng để làm trưởng phòng
  const headOptions: Option[] = React.useMemo(() => {
    if (!departmentDetail?.id) return [];

    return employees
      .filter(e => e.departmentId?._id === departmentDetail.id) // chỉ người trong phòng
      .map(e => ({
        value: e.id,
        label: `${e.name} (${e.employee_code})`,
      }));
  }, [employees, departmentDetail?.id]);

  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  React.useEffect(() => {
    if (!departmentDetail?.id) return;
    const initSelected = new Set(
      employees
        .filter(e => e.departmentId?._id === departmentDetail.id)
        .map(e => e.id),
    );
    console.log('EMP', employees, departmentDetail);
    setSelectedIds(initSelected);
  }, [departmentDetail?.id, employees]);

  const applyCriteria = React.useCallback(
    (source: Employee[], deptId: string, c: EmployeeFilterInDeptValues) => {
      const q = c.employeeName.trim().toLowerCase();
      const p = c.position.trim().toLowerCase();

      let out = source.filter(e => {
        const matchesDept = c.inDeptOnly
          ? e.departmentId?._id === deptId
          : true;

        const matchesName = !q || e.name.toLowerCase().includes(q);
        const matchesPos = !p || e.position.toLowerCase().includes(p);
        return matchesDept && matchesName && matchesPos;
      });

      out = out.sort((a, b) => {
        switch (c.sortBy) {
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

      return out;
    },
    [],
  );

  React.useEffect(() => {
    if (departmentDetail?.id) {
      setVisibleEmployees(
        applyCriteria(employees, departmentDetail.id, criteria),
      );
    } else {
      setVisibleEmployees([]);
    }
  }, [employees, departmentDetail?.id, criteria, applyCriteria]);

  React.useEffect(() => {
    if (departmentDetail) {
      setDeptName(departmentDetail.name ?? '');
      setDeptHead(departmentDetail.head ?? '');
      setDeptActive(!!departmentDetail.active);
    }
  }, [departmentDetail]);

  const statusOptions: Option[] = [
    {value: 'active', label: lang?.t('department_active') ?? 'Hoạt động'},
    {
      value: 'inactive',
      label: lang?.t('department_inactive') ?? 'Ngừng hoạt động',
    },
  ];
  const selectedStatus = deptActive ? statusOptions[0] : statusOptions[1];

  if (loading || !theme || !lang) return null;
  const S = makeStyles(theme);
  const t = lang.t;

  const toggleSelect = (id: string) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const saveChanges = async () => {
    if (!departmentDetail?.id) {
      Toast.show({type: 'error', text1: 'Thiếu ID phòng ban'});
      return;
    }

    try {
      setLoadingSave(true);

      const payload = {
        name: deptName,
        manager_id: managerId, // ⭐ gửi trưởng phòng
        users: Array.from(selectedIds),
      };

      const {status, res} = await apiHandle
        .callApi(DepartmentEP.Update(departmentDetail.id), payload)
        .asPromise();

      if (!res.success) {
        Toast.show({
          type: 'error',
          text1: 'Cập nhật thất bại',
          text2: res?.message ?? 'Vui lòng thử lại',
        });
        return;
      }

      Toast.show({
        type: 'success',
        text1: 'Đã cập nhật phòng ban!',
        text2: 'Đang tải lại dữ liệu...',
      });

      // ⭐⭐ RELOAD TOÀN BỘ API USERS + DEPARTMENT DETAIL ⭐⭐
      await Promise.all([loadUsers(), loadDetail()]);
    } catch (err: any) {
      Toast.show({
        type: 'error',
        text1: 'Lỗi xảy ra',
        text2: err?.message ?? 'Không thể cập nhật',
      });
    } finally {
      setLoadingSave(false);
    }
  };

  const data = visibleEmployees;

  const EmployeeRow = memo(({item}: {item: Employee}) => {
    const checked = selectedIds.has(item.id);
    return (
      <Pressable
        onPress={() => toggleSelect(item.id)}
        style={({pressed}) => [S.card, pressed && {opacity: 0.92}]}>
        <View style={S.row}>
          <Image source={item.avatar} style={S.avatar} />
          <View style={{flex: 1}}>
            <Text style={S.name} numberOfLines={1}>
              {item.name}
            </Text>

            <Text style={S.role} numberOfLines={1}>
              {item.position}
            </Text>

            {/* ⭐ THÊM DÒNG MỚI */}
            <Text style={S.code} numberOfLines={1}>
              Mã NV: {item.employee_code}
            </Text>
          </View>

          <View style={[S.checkWrap, checked ? S.checkWrapOn : S.checkWrapOff]}>
            {checked ? <Text style={S.checkIcon}>✓</Text> : null}
          </View>
        </View>
      </Pressable>
    );
  });

  const renderItem: ListRenderItem<Employee> = ({item}) => (
    <EmployeeRow item={item} />
  );
  const buildActiveFilterChips = (values: EmployeeFilterInDeptValues) => {
    const chips: {key: string; mainText: string; subText: string}[] = [];

    if (values.employeeName.trim()) {
      chips.push({
        key: 'employeeName',
        mainText: t('employee_name_label'),
        subText: values.employeeName.trim(),
      });
    }

    if (values.position.trim()) {
      chips.push({
        key: 'position',
        mainText: t('position_name_label'),
        subText: values.position.trim(),
      });
    }

    if (values.inDeptOnly) {
      chips.push({
        key: 'inDeptOnly',
        mainText: lang.code === 'en' ? 'Scope' : 'Phạm vi',
        subText: t('employees_in_this_dept'),
      });
    }

    chips.push({
      key: 'sortBy',
      mainText: t('sort_by_label'),
      subText: (() => {
        switch (values.sortBy) {
          case 'created_asc':
            return t('sort_created_asc');
          case 'name_asc':
            return t('sort_name_asc');
          case 'name_desc':
            return t('sort_name_desc');
          default:
            return t('sort_created_desc');
        }
      })(),
    });

    return chips;
  };
  const handleRemoveFilter = (key: string) => {
    const next = {...criteria};

    switch (key) {
      case 'employeeName':
        next.employeeName = '';
        break;

      case 'position':
        next.position = '';
        break;

      case 'inDeptOnly':
        next.inDeptOnly = false;
        break;

      case 'sortBy':
        next.sortBy = 'created_desc'; // default sort
        break;

      default:
        return;
    }

    setCriteria(next);

    // Cập nhật lại visibleEmployees
    if (departmentDetail?.id) {
      const updated = applyCriteria(employees, departmentDetail.id, next);
      setVisibleEmployees(updated);
    } else {
      setVisibleEmployees([]);
    }

    // Xóa chip đã remove
    setActiveFilters(prev => prev.filter(f => f.key !== key));
  };

  return (
    <SafeAreaView style={{flex: 1, backgroundColor: theme.colors.background}}>
      <HeaderBar
        title={lang.t('department_detail')}
        onBack={() => navigation?.goBack?.()}
      />

      <View style={{height: theme.spacing(2)}} />

      <View style={S.footerBar}>
        {/* Nút xóa phòng ban */}
        <TouchableOpacity
          style={[S.deleteBtn]}
          onPress={() => {
            Alert.alert(
              'Xóa phòng ban',
              'Bạn có chắc muốn xóa phòng ban này?',
              [
                {text: 'Hủy', style: 'cancel'},
                {
                  text: 'Xóa',
                  style: 'destructive',
                  onPress: async () => {
                    try {
                      const {status,res} = await apiHandle
                        .callApi(DepartmentEP.Delete(departmentDetail.id))
                        .asPromise();

                      if (res.success) {
                        Toast.show({
                          type: 'success',
                          text1: 'Đã xóa phòng ban',
                        });

                        // ⬅️ QUAY LẠI MÀN MANAGE DEPARTMENT
                        navigation.navigate('DepartmentManagement');
                      }
                    } catch (err) {
                      console.log('Delete dept error', err);
                      Toast.show({type: 'error', text1: 'Xóa thất bại'});
                    }
                  },
                },
              ],
            );
          }}>
          <Text style={S.deleteText}>Xóa</Text>
        </TouchableOpacity>

        {/* Nút lưu thay đổi */}
        <TouchableOpacity
          style={[S.saveBtn, loadingSave && {opacity: 0.5}]}
          onPress={loadingSave ? undefined : saveChanges}
          activeOpacity={0.7}
          disabled={loadingSave}>
          <Text style={S.saveText}>
            {loadingSave ? 'Đang lưu...' : t('save') ?? 'Lưu thay đổi'}
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        style={{flex: 1}}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#6E8BFF"
            colors={['#6E8BFF']}
          />
        }
        contentContainerStyle={{
          paddingHorizontal: 14,
          paddingTop: 14,
          paddingBottom: 96,
        }}
        keyboardShouldPersistTaps="handled">
        <LabeledTextInput
          label={t('department_name_title')}
          placeholder={dept.name}
          value={deptName}
          onChangeText={setDeptName}
          theme={theme}
        />
        <View style={{height: 12}} />

        <LabeledSelect
          label={t('head_of_dept')}
          selected={
            headOptions.find(o => o.value === managerId) ?? {
              value: '',
              label: 'Chọn trưởng phòng',
            }
          }
          options={headOptions}
          onSelect={(opt: Option) => setManagerId(opt.value)}
          theme={theme}
        />

        <View style={{height: 12}} />

        <View style={{height: 18}} />

        <View style={S.pill}>
          <Text style={S.pillText}>{t('list_of_dp_employees')}</Text>
        </View>

        <View style={S.rowHeader}>
          <Text style={[S.sectionTitle, {color: theme.colors.text}]}>
            {lang.t('list_employee')}
          </Text>

          <TouchableOpacity
            style={S.filterBtn}
            onPress={() => setShowFilter(true)}>
            <FilterIcon width={22} height={22} />
          </TouchableOpacity>
        </View>

        {activeFilters.length > 0 && (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={{marginBottom: 8}}
            contentContainerStyle={{paddingHorizontal: 4, gap: 8}}>
            {activeFilters.map(f => (
              <FilterChip
                key={f.key}
                mainText={f.mainText}
                subText={f.subText}
                theme={theme}
                onRemove={() => handleRemoveFilter(f.key)}
              />
            ))}
          </ScrollView>
        )}

        <FlatList
          scrollEnabled={false}
          data={data}
          keyExtractor={it => it.id}
          renderItem={renderItem}
          ItemSeparatorComponent={() => <View style={{height: 10}} />}
          contentContainerStyle={{marginTop: 8}}
        />

        <EmployeeFilterInDepartment
          visible={showFilter}
          current={criteria}
          onClose={() => setShowFilter(false)}
          onApply={values => {
            setCriteria(values);
            if (departmentDetail?.id) {
              const next = applyCriteria(
                employees,
                departmentDetail.id,
                values,
              );
              setVisibleEmployees(next);
            } else {
              setVisibleEmployees([]);
            }
            setActiveFilters(buildActiveFilterChips(values));
          }}
        />
      </ScrollView>
    </SafeAreaView>
  );
}

const makeStyles = (theme: any) =>
  StyleSheet.create({
    code: {fontSize: 12, color: '#999'},
    deleteBtn: {
      backgroundColor: '#FF4D4D',
      paddingHorizontal: 20,
      paddingVertical: 12,
      borderRadius: 10,
      marginRight: 10,
    },
    deleteText: {
      color: '#fff',
      fontWeight: '700',
    },

    label: {
      fontSize: 13,
      color: theme.colors.mutedText ?? '#737373',
      marginBottom: 6,
    },
    pill: {
      alignSelf: 'center',
      paddingHorizontal: 14,
      paddingVertical: 8,
      backgroundColor: theme.colors.card,
      borderRadius: 8,
      borderWidth: 1,
      borderColor: theme.colors.contrastBackground,
      marginTop: 10,
    },
    pillText: {fontWeight: '700', color: theme.colors.text, fontSize: 12},
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
    card: {
      backgroundColor: theme.colors.background,
      borderRadius: 10,
      borderWidth: 1.5,
      borderColor: theme.colors.cardBoder,
      padding: 13,
    },
    row: {flexDirection: 'row', alignItems: 'center', gap: 12},
    avatar: {width: 44, height: 44, borderRadius: 999},
    name: {fontSize: 16, fontWeight: '700', color: theme.colors.text},
    role: {fontSize: 13, color: '#666', marginTop: 2},

    checkWrap: {
      width: 36,
      height: 36,
      borderRadius: 7,
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: 2,
    },
    checkWrapOn: {backgroundColor: '#5F8CFF', borderColor: '#5F8CFF'},
    checkWrapOff: {backgroundColor: 'transparent', borderColor: '#000'},
    checkIcon: {color: '#fff', fontSize: 20, fontWeight: '800'},

    footerBar: {
      marginTop: 20,
      marginBottom: 10,
      justifyContent: 'center',
      paddingHorizontal: 14,
      flexDirection: 'row',
      alignItems: 'center',
    },

    saveBtn: {
      alignSelf: 'center',
      backgroundColor: '#6E8BFF',
      paddingHorizontal: 24,
      paddingVertical: 12,
      borderRadius: 10,
      minWidth: 180,
      alignItems: 'center',
    },
    saveText: {color: '#fff', fontWeight: '700'},
  });
