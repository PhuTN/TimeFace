import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Platform,
} from 'react-native';
import BottomSheetModal from '../common/BottomSheetModal';
import LabeledTextInput from '../common/LabeledTextInput';
import LabeledSelect from '../common/LabeledSelect';
import {useUIFactory} from '../../ui/factory/useUIFactory';
import type {Option} from '../../types/common';
import {apiHandle} from '../../api/apihandle';
import {DepartmentEP} from '../../api/endpoint/Department';

export type EmpSortValue =
  | 'created_desc'
  | 'created_asc'
  | 'name_asc'
  | 'name_desc';

export type EmployeeFilterValues = {
  employeeName: string;
  passwordChangeStatus?:
    | 'changed'
    | 'waiting_for_changed'
    | 'do_not_change'
    | '';
  profile_approved?: 'approved' | 'pending' | ''; // ✅ THÊM
  departmentId?: string;
  position: string;
  sortBy: EmpSortValue;
};

type Props = {
  visible: boolean;
  onClose: () => void;
  onApply: (values: EmployeeFilterValues) => void;
  current?: Partial<EmployeeFilterValues>;
};

function useSortingOptions<T extends (...a: any[]) => string>(t: T): Option[] {
  return React.useMemo<Option[]>(
    () => [
      {value: 'created_desc', label: t('sort_created_desc' as any)},
      {value: 'created_asc', label: t('sort_created_asc' as any)},
      {value: 'name_asc', label: t('sort_name_asc' as any)},
      {value: 'name_desc', label: t('sort_name_desc' as any)},
    ],
    [t],
  );
}

export default function EmployeeFilter({
  visible,
  onClose,
  onApply,
  current,
}: Props) {
  const {loading, theme, lang} = useUIFactory();

  // ---- STATES
  const [employeeName, setEmployeeName] = React.useState<string>(
    current?.employeeName ?? '',
  );
  const [passwordChangeStatus, setPasswordChangeStatus] = React.useState<
    'changed' | 'waiting_for_changed' | 'do_not_change' | ''
  >((current?.passwordChangeStatus as any) ?? '');

  const [departmentId, setDepartmentId] = React.useState<string>(
    current?.departmentId ?? '',
  );
  const [position, setPosition] = React.useState<string>(
    current?.position ?? '',
  );
  const [sortBy, setSortBy] = React.useState<EmpSortValue>(
    current?.sortBy ?? 'created_desc',
  );
  const [profile_approved, setprofile_approved] = React.useState<
    'approved' | 'pending' | ''
  >((current?.profile_approved as any) ?? '');
  // ---- LOAD DEPARTMENTS REAL
  const [departmentOptions, setDepartmentOptions] = React.useState<Option[]>([
    {value: '', label: '—'},
  ]);
  const profile_approvedOptions = React.useMemo<Option[]>(
    () => [
      {value: '', label: '—'},
      {value: 'approved', label: 'Đã duyệt hồ sơ'},
      {value: 'pending', label: 'Chờ duyệt hồ sơ'},
    ],
    [],
  );
  React.useEffect(() => {
    const loadDepartments = async () => {
      try {
        const {status, res} = await apiHandle
          .callApi(DepartmentEP.GetAll)
          .asPromise();

        if (!status.isError && res?.data) {
          const list = res.data.map((d: any) => ({
            value: d._id,
            label: d.name,
          }));
          setDepartmentOptions([{value: '', label: '—'}, ...list]);
        }
      } catch (err) {
        console.log('Load departments failed:', err);
      }
    };

    loadDepartments();
  }, []);

  // SORT OPTIONS
  const t = React.useCallback(
    (k: any) => (lang?.t ? lang.t(k) : String(k)),
    [lang],
  );
  const sortingOptions = useSortingOptions(t);

  const passwordOptions = React.useMemo<Option[]>(
    () => [
      {value: '', label: '—'},
      {
        value: 'changed',
        label: lang?.t('password_changed') ?? 'Đã đổi mật khẩu',
      },
      {
        value: 'waiting_for_changed',
        label: lang?.t('waiting_for_password_change') ?? 'Chờ đổi mật khẩu',
      },
    ],
    [lang],
  );

  // Resync form when modal opens
  React.useEffect(() => {
    if (visible) {
      setEmployeeName(current?.employeeName ?? '');
      setPasswordChangeStatus((current?.passwordChangeStatus as any) ?? '');
      setDepartmentId(current?.departmentId ?? '');
      setPosition(current?.position ?? '');
      setSortBy((current?.sortBy as EmpSortValue) ?? 'created_desc');
    }
  }, [visible, current]);

  if (loading || !theme || !lang) return null;

  const S = makeStyles(theme);

  const applyAndClose = () => {
    onApply({
      employeeName,
      passwordChangeStatus,
      profile_approved, // ✅
      departmentId,
      position,
      sortBy,
    });

    onClose();
  };

  const clearAndClose = () => {
    onApply({
      employeeName: '',
      passwordChangeStatus: '',
      profile_approved: '', // ✅
      departmentId: '',
      position: '',
      sortBy: 'created_desc',
    });

    onClose();
  };

  return (
    <BottomSheetModal visible={visible} onClose={onClose} maxHeightRatio={0.92}>
      <ScrollView
        contentContainerStyle={S.sheetContent}
        keyboardShouldPersistTaps="handled">
        {/* Row 1 */}
        <View style={S.row}>
          <View style={S.col}>
            <LabeledTextInput
              label={lang.t('employee_name_label')}
              placeholder={lang.t('employee_placeholder')}
              value={employeeName}
              onChangeText={setEmployeeName}
              theme={theme}
            />
          </View>
        </View>

        {/* Row 2 */}
        <View style={S.row}>
          <View style={S.col}>
            <Text style={S.label}>{lang.t('password_change_label')}</Text>
            <LabeledSelect
              label=""
              selected={
                passwordOptions.find(o => o.value === passwordChangeStatus) ??
                passwordOptions[0]
              }
              options={passwordOptions}
              onSelect={(o: Option) => setPasswordChangeStatus(o.value as any)}
              theme={theme}
            />
          </View>
        </View>

        {/* Row 3 */}
        <View style={S.row}>
          <View style={S.col}>
            <Text style={S.label}>{lang.t('department_label')}</Text>
            <LabeledSelect
              label=""
              selected={
                departmentOptions.find(o => o.value === departmentId) ??
                departmentOptions[0]
              }
              options={departmentOptions}
              onSelect={(o: Option) => setDepartmentId(o.value)}
              theme={theme}
            />
          </View>

          <View style={S.col}>
            <LabeledTextInput
              label={lang.t('position_name_label')}
              placeholder={lang.t('position_placeholder')}
              value={position}
              onChangeText={setPosition}
              theme={theme}
            />
          </View>
        </View>
        <View style={S.col}>
          <Text style={S.label}>Trạng thái hồ sơ</Text>
          <LabeledSelect
            label=""
            selected={
              profile_approvedOptions.find(o => o.value === profile_approved) ??
              profile_approvedOptions[0]
            }
            options={profile_approvedOptions}
            onSelect={(o: Option) => setprofile_approved(o.value as any)}
            theme={theme}
          />
        </View>

        {/* Sort */}
        <View>
          <Text style={S.label}>{lang.t('sort_by_label')}</Text>
          <LabeledSelect
            label=""
            selected={sortingOptions.find(o => o.value === sortBy)!}
            options={sortingOptions}
            onSelect={(o: Option) => setSortBy(o.value as EmpSortValue)}
            theme={theme}
          />
        </View>

        {/* Buttons */}
        <View style={S.rowButtons}>
          <TouchableOpacity style={S.btnClear} onPress={clearAndClose}>
            <Text style={S.btnClearText}>{lang.t('clear_filters')}</Text>
          </TouchableOpacity>

          <TouchableOpacity style={S.btnApply} onPress={applyAndClose}>
            <Text style={S.btnApplyText}>{lang.t('apply_filters')}</Text>
          </TouchableOpacity>
        </View>

        <View style={{height: 8}} />
        <View style={S.grabber} />
      </ScrollView>
    </BottomSheetModal>
  );
}

const makeStyles = (theme: any) =>
  StyleSheet.create({
    sheetContent: {
      paddingTop: 16,
      paddingBottom: Platform.select({ios: 28, android: 20}),
      paddingHorizontal: 16,
      backgroundColor: theme.colors.background,
      borderWidth: 1,
      borderColor: theme.colors.contrastBackground,
      borderTopLeftRadius: 15,
      borderTopRightRadius: 15,
    },
    row: {
      flexDirection: 'row',
      gap: 12,
      marginBottom: 12,
    },
    col: {flex: 1, minWidth: 0},
    label: {
      fontSize: 13,
      color: theme.colors.mutedText ?? '#707070',
      marginBottom: 6,
    },
    rowButtons: {flexDirection: 'row', gap: 12, marginTop: 15},
    btnClear: {
      flex: 1,
      height: 48,
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: 10,
      backgroundColor: '#E8F1FF',
    },
    btnClearText: {fontSize: 16, fontWeight: '600', color: '#0B59F8'},
    btnApply: {
      flex: 1,
      height: 48,
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: 10,
      backgroundColor: '#6E8BFF',
    },
    btnApplyText: {fontSize: 16, fontWeight: '700', color: '#fff'},
    grabber: {
      alignSelf: 'center',
      width: 44,
      height: 5,
      borderRadius: 999,
      backgroundColor: '#D3D3D3',
      marginTop: 16,
    },
  });
