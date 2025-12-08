import React, {memo, useState, useEffect} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Platform,
  FlatList,
  ListRenderItem,
  Pressable,
  Image,
} from 'react-native';

import BottomSheetModal from './BottomSheetModal2';
import LabeledTextInput from './LabeledTextInput';
import LabeledSelect from './LabeledSelect';
import {useUIFactory} from '../../ui/factory/useUIFactory';
import AddEmployeeIntoDepartmentFilter, {
  EmployeeFilterInDeptValues,
} from './AddEmployeeIntoDepartmentFilter';
import FilterIcon from '../../assets/icons/filter_icon.svg';
import FilterChip from './FilterChip.tsx';

import {apiHandle} from '../../api/apihandle';
import {User} from '../../api/endpoint/User';
import Toast from 'react-native-toast-message';

export type AddDepartmentModal = {
  name: string;
  code: string;
  head: string;
  headId: string;
  users: string[];
};

type Props = {
  visible: boolean;
  onClose: () => void;
  onSubmit: (payload: AddDepartmentModal) => void;
  initial?: Partial<AddDepartmentModal>;
};

export default function AddDepartmentModal({
  visible,
  onClose,
  onSubmit,
  initial,
}: Props) {
  const {loading, theme, lang} = useUIFactory();

  // FORM FIELD
  const [name, setName] = useState(initial?.name ?? '');
  const [code, setCode] = useState(initial?.code ?? '');
  const [head, setHead] = useState(initial?.head ?? '');
  const [headId, setHeadId] = useState(initial?.headId ?? '');
  const [submitting, setSubmitting] = useState(false);
  // USERS & OPTIONS
  const [employees, setEmployees] = useState<any[]>([]);
  const [headOptions, setHeadOptions] = useState([]);

  // FILTER
  const [showFilter, setShowFilter] = useState(false);
  const [criteria, setCriteria] = useState<EmployeeFilterInDeptValues>({
    employeeName: '',
    position: '',
    sortBy: 'created_desc',
  });

  const [activeFilters, setActiveFilters] = useState([]);
  const [selectedIds, setSelectedIds] = useState(new Set<string>());

  // LOAD USERS WHEN MODAL OPEN
  useEffect(() => {
    if (visible) {
      setName(initial?.name ?? '');
      setCode(initial?.code ?? '');
      setHead(initial?.head ?? '');
      setHeadId(initial?.headId ?? '');

      loadUsers();
    }
  }, [visible]);

  // API GET USERS
  const loadUsers = async () => {
    try {
      const {status, res} = await apiHandle
        .callApi(User.GetByCompany)
        .asPromise();

      if (!res?.success || !res?.data?.users) return;

      const list = res.data.users;

      // ⭐ Chỉ lấy user chưa thuộc phòng ban
      const users = list.filter(
        (u: any) =>
          u.role === 'user' && (!u.department_id || u.department_id === ''),
      );

      setEmployees(users);

      setHeadOptions(
        users.map((u: any) => ({
          value: u._id,
          label: `${u.full_name}${
            u.employee_code ? ` (${u.employee_code})` : ''
          }`,
        })),
      );
    } catch (err) {
      console.log('Load users error:', err);
    }
  };

  // BUILD FILTER CHIPS
  const buildFilterChips = (c: EmployeeFilterInDeptValues) => {
    const chips: any[] = [];

    if (c.employeeName.trim()) {
      chips.push({
        key: 'employeeName',
        mainText: 'Tên nhân viên',
        subText: c.employeeName.trim(),
      });
    }

    if (c.position.trim()) {
      chips.push({
        key: 'position',
        mainText: 'Chức vụ',
        subText: c.position.trim(),
      });
    }

    chips.push({
      key: 'sortBy',
      mainText: 'Sắp xếp',
      subText:
        c.sortBy === 'created_desc'
          ? 'Mới nhất'
          : c.sortBy === 'created_asc'
          ? 'Cũ nhất'
          : c.sortBy === 'name_asc'
          ? 'Tên A-Z'
          : 'Tên Z-A',
    });

    return chips;
  };

  // APPLY FILTER
  const applyCriteria = React.useCallback((source, c) => {
    const q = c.employeeName.trim().toLowerCase();
    const p = c.position.trim().toLowerCase();

    let out = source.filter(e => {
      const matchName = !q || e.full_name.toLowerCase().includes(q);
      const matchPos = !p || e.job_title?.toLowerCase().includes(p);
      return matchName && matchPos;
    });

    // SORT
    return out.sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt));
  }, []);

  const data = React.useMemo(
    () => applyCriteria(employees, criteria),
    [employees, criteria],
  );

  if (loading || !theme || !lang) return null;

  const S = makeStyles(theme);
  const t = lang.t;

  // HANDLE CLOSE
  const handleClose = () => {
    setSelectedIds(new Set());
    setCriteria({
      employeeName: '',
      position: '',
      sortBy: 'created_desc',
    });
    setActiveFilters([]);
    setShowFilter(false);
    onClose();
  };

  const handleSubmit = async () => {
    if (submitting) return;

    try {
      setSubmitting(true);

      // Gửi lên cha (DepartmentManagementScreen)
      const result = await onSubmit({
        name: name.trim(),
        code: code.trim(),
        head: head.trim(),
        headId: headId.trim(),
        users: Array.from(selectedIds),
      });

      if (result?.success) {
        Toast.show({
          type: 'success',
          text1: 'Tạo phòng ban thành công!',
        });

        handleClose(); // đóng modal
      }
    } catch (e) {
      Toast.show({
        type: 'error',
        text1: 'Tạo thất bại',
      });
    } finally {
      setSubmitting(false);
    }
  };

  // EMPLOYEE ROW
  const EmployeeRow = memo(({item}: {item: any}) => {
    const checked = selectedIds.has(item._id);

    return (
      <Pressable
        onPress={() =>
          setSelectedIds(prev => {
            const next = new Set(prev);
            next.has(item._id) ? next.delete(item._id) : next.add(item._id);
            return next;
          })
        }
        style={({pressed}) => [S.card, pressed && {opacity: 0.92}]}>
        <View style={S.row}>
          <Image
            source={{
              uri:
                item.avatar && item.avatar.trim() !== ''
                  ? item.avatar
                  : 'https://cdn-icons-png.flaticon.com/512/3541/3541871.png',
            }}
            style={S.avatar}
          />

          <View style={{flex: 1}}>
            <Text style={S.name}>{item.full_name}</Text>
            <Text style={S.role}>{item.job_title}</Text>
          </View>

          <View style={[S.checkWrap, checked ? S.checkWrapOn : S.checkWrapOff]}>
            {checked && <Text style={S.checkIcon}>✓</Text>}
          </View>
        </View>
      </Pressable>
    );
  });

  const renderItem: ListRenderItem<any> = ({item}) => (
    <EmployeeRow item={item} />
  );

  return (
    <BottomSheetModal
      visible={visible}
      onClose={handleClose}
      maxHeightRatio={0.9}>
      <ScrollView contentContainerStyle={S.sheetContent}>
        {/* DEPARTMENT NAME */}
        <LabeledTextInput
          label="Tên phòng ban"
          placeholder="Nhập tên phòng ban..."
          value={name}
          onChangeText={setName}
          theme={theme}
        />

        <View style={{height: 14}} />

        {/* DEPARTMENT CODE */}
        <LabeledTextInput
          label="Mã phòng ban"
          placeholder="VD: DPT001"
          value={code}
          onChangeText={setCode}
          theme={theme}
        />

        <View style={{height: 14}} />

        {/* HEAD SELECT */}
        <LabeledSelect
          label="Trưởng phòng"
          selected={
            headOptions.find(o => o.value === headId) ?? {
              value: '',
              label: 'Chọn trưởng phòng',
            }
          }
          options={headOptions}
          searchable
          searchPlaceholder="Tìm nhân viên..."
          theme={theme}
          onSelect={o => {
            setHeadId(o.value);
            setHead(o.label);
          }}
        />

        <View style={{height: 14}} />

        {/* HEADER + FILTER */}
        <View style={S.rowHeader}>
          <Text style={[S.sectionTitle, {color: theme.colors.text}]}>
            Danh sách nhân viên
          </Text>

          <TouchableOpacity
            style={S.filterBtn}
            onPress={() => setShowFilter(true)}>
            <FilterIcon width={22} height={22} />
          </TouchableOpacity>
        </View>

        {/* FILTER CHIPS */}
        {activeFilters.length > 0 && (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{
              flexDirection: 'row',
              alignItems: 'center',
              gap: 8,
              paddingVertical: 4,
              paddingRight: 8,
              marginBottom: 8,
            }}>
            {activeFilters.map(chip => (
              <FilterChip
                key={chip.key}
                mainText={chip.mainText}
                subText={chip.subText}
                theme={theme}
                onRemove={() => {
                  const next = {...criteria, [chip.key]: ''};
                  setCriteria(next);
                  setActiveFilters(buildFilterChips(next));
                }}
              />
            ))}
          </ScrollView>
        )}

        <FlatList
          scrollEnabled={false}
          data={data}
          keyExtractor={it => it._id}
          renderItem={renderItem}
          ItemSeparatorComponent={() => <View style={{height: 10}} />}
        />

        <AddEmployeeIntoDepartmentFilter
          visible={showFilter}
          current={criteria}
          onClose={() => setShowFilter(false)}
          onApply={values => {
            setCriteria(values);
            setActiveFilters(buildFilterChips(values));
          }}
        />
      </ScrollView>

      {/* ACTION BUTTONS */}
      <View style={S.rowButtons}>
        <TouchableOpacity style={S.btnCancel} onPress={handleClose}>
          <Text style={S.btnCancelText}>Hủy</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={S.btnCreate}
          onPress={handleSubmit}
          disabled={submitting}>
          <Text style={S.btnCreateText}>
            {submitting ? 'Đang tạo...' : 'Tạo phòng ban'}
          </Text>
        </TouchableOpacity>
      </View>

      <View style={S.grabber} />
    </BottomSheetModal>
  );
}

const makeStyles = (theme: any) =>
  StyleSheet.create({
    sheetContent: {
      paddingTop: 70,
      paddingBottom: Platform.select({ios: 28, android: 20}),
      paddingHorizontal: 16,
      backgroundColor: theme.colors.card,
    },
    rowButtons: {
      flexDirection: 'row',
      gap: 12,
      marginTop: 16,
      paddingHorizontal: 14,
    },
    btnCancel: {
      flex: 1,
      height: 48,
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: 10,
      backgroundColor: '#FFE9E7',
    },
    btnCancelText: {fontSize: 16, fontWeight: '600', color: '#F04848'},
    btnCreate: {
      flex: 1,
      height: 48,
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: 10,
      backgroundColor: '#6E8BFF',
    },
    btnCreateText: {fontSize: 16, fontWeight: '700', color: '#fff'},
    grabber: {
      alignSelf: 'center',
      width: 44,
      height: 5,
      borderRadius: 999,
      backgroundColor: '#D3D3D3',
      marginVertical: 16,
    },
    rowHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginTop: 8,
      marginBottom: 8,
    },
    sectionTitle: {fontSize: 16, fontWeight: '600'},

    card: {
      backgroundColor: '#fff',
      borderRadius: 14,
      borderWidth: 1,
      borderColor: '#eee',
      padding: 12,
    },
    row: {flexDirection: 'row', alignItems: 'center', gap: 12},
    avatar: {width: 44, height: 44, borderRadius: 999},
    name: {fontSize: 16, fontWeight: '700'},
    role: {fontSize: 13, color: '#666'},
    checkWrap: {
      width: 36,
      height: 36,
      borderRadius: 10,
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: 2,
    },
    checkWrapOn: {backgroundColor: '#5F8CFF', borderColor: '#5F8CFF'},
    checkWrapOff: {backgroundColor: 'transparent', borderColor: '#000'},
    checkIcon: {color: '#fff', fontSize: 20, fontWeight: '800'},
  });
