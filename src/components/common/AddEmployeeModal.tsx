import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Platform,
  ActivityIndicator,
  Switch,
} from 'react-native';

import BottomSheetModal from './BottomSheetModal';
import LabeledTextInput from './LabeledTextInput';
import LabeledSelect from './LabeledSelect';
import { useUIFactory } from '../../ui/factory/useUIFactory';
import type { Option } from '../../types/common';

import { apiHandle } from '../../api/apihandle';
import { DepartmentEP } from '../../api/endpoint/Department';

import Toast from 'react-native-toast-message';

export type AddEmployeePayload = {
  name: string;
  position: string;
  departmentId: string;
  email: string;
  employee_code: string;
  isAdmin: boolean;
};

type Props = {
  visible: boolean;
  onClose: () => void;
  onSubmit: (payload: AddEmployeePayload) => Promise<void> | void;
  initial?: Partial<AddEmployeePayload>;
};

export default function AddEmployeeModal({
  visible,
  onClose,
  onSubmit,
  initial,
}: Props) {
  const { loading, theme, lang } = useUIFactory();

  const [name, setName] = React.useState(initial?.name ?? '');
  const [position, setPosition] = React.useState(initial?.position ?? '');
  const [departmentId, setDepartmentId] = React.useState(
    initial?.departmentId ?? '',
  );
  const [email, setEmail] = React.useState(initial?.email ?? '');
  const [employeeCode, setEmployeeCode] = React.useState(
    initial?.employee_code ?? '',
  );
  const [isAdmin, setIsAdmin] = React.useState(false);
  const [loadingCreate, setLoadingCreate] = React.useState(false);

  // ⭐ REAL DEPARTMENT OPTIONS
  const [departmentOptions, setDepartmentOptions] = React.useState<Option[]>([
    { value: '', label: '—' },
  ]);

  React.useEffect(() => {
    const loadDepartments = async () => {
      try {
        const { status, res } = await apiHandle
          .callApi(DepartmentEP.GetAll)
          .asPromise();

        if (!status.isError && Array.isArray(res?.data)) {
          const list = res.data.map((d: any) => ({
            value: d._id,
            label: d.name,
          }));

          setDepartmentOptions([{ value: '', label: '—' }, ...list]);
        }
      } catch (err) {
        console.log('Load departments failed:', err);
      }
    };

    loadDepartments();
  }, []);

  React.useEffect(() => {
    if (visible) {
      setName(initial?.name ?? '');
      setPosition(initial?.position ?? '');
      setDepartmentId(initial?.departmentId ?? '');
      setEmail(initial?.email ?? '');
      setEmployeeCode(initial?.employee_code ?? '');
      setIsAdmin(false);
      setLoadingCreate(false);
    }
  }, [visible]);

  const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  const canSubmit = name.trim() && emailOk && employeeCode.trim();

  if (loading || !theme || !lang) return null;

  const S = makeStyles(theme);
  const t = lang.t;

  const handleSubmit = async () => {
    if (!canSubmit || loadingCreate) return;

    if (!isAdmin && position.trim().toLowerCase() === 'admin') {
      Toast.show({
        type: 'error',
        text1: 'Lỗi',
        text2: 'Không thể đặt chức vụ là Admin nếu không bật quyền Admin',
      });
      return;
    }

    try {
      setLoadingCreate(true);

      await onSubmit({
        name: name.trim(),
        position: isAdmin ? 'admin' : position.trim(),
        departmentId,
        email: email.trim(),
        employee_code: employeeCode.trim(),
        isAdmin,
      });
    } finally {
      setLoadingCreate(false);
    }
  };

  return (
    <BottomSheetModal visible={visible} onClose={onClose} maxHeightRatio={0.9}>
      <ScrollView
        contentContainerStyle={S.sheetContent}
        keyboardShouldPersistTaps="handled"
      >
        {/* TÊN NHÂN VIÊN */}
        <LabeledTextInput
          label={t('employee_name_label')}
          placeholder={t('employee_placeholder')}
          value={name}
          onChangeText={setName}
          theme={theme}
        />
        <View style={{ height: 14 }} />

        {/* MÃ NHÂN VIÊN */}
        <LabeledTextInput
          label="Mã nhân viên"
          placeholder="EMP001"
          value={employeeCode}
          onChangeText={setEmployeeCode}
          theme={theme}
        />
        <View style={{ height: 14 }} />

        {/* ADMIN SWITCH */}
        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 10 }}>
          <Switch
            value={isAdmin}
            onValueChange={(val) => {
              setIsAdmin(val);
              if (val) setPosition('admin');
              else setPosition('');
            }}
          />
          <Text style={{ marginLeft: 10, fontSize: 16, fontWeight: '600' }}>
            Tài khoản Admin
          </Text>
        </View>

        {/* CHỨC VỤ */}
        <LabeledTextInput
          label={t('position_name_label')}
          placeholder={t('position_placeholder')}
          value={isAdmin ? 'admin' : position}
          onChangeText={setPosition}
          editable={!isAdmin}
          theme={theme}
        />
        <View style={{ height: 14 }} />

        {/* PHÒNG BAN – ẨN KHI ADMIN */}
        {!isAdmin && (
          <>
            <Text style={S.label}>{t('department_label')}</Text>
            <LabeledSelect
              label=""
              selected={
                departmentOptions.find((o) => o.value === departmentId) ??
                departmentOptions[0]
              }
              options={departmentOptions}
              onSelect={(o) => setDepartmentId(o.value)}
              theme={theme}
            />
            <View style={{ height: 14 }} />
          </>
        )}

        {/* EMAIL */}
        <LabeledTextInput
          label="Gmail"
          placeholder="name@example.com"
          value={email}
          onChangeText={setEmail}
          theme={theme}
        />

        {/* BUTTONS */}
        <View style={S.rowButtons}>
          <TouchableOpacity style={S.btnCancel} onPress={onClose}>
            <Text style={S.btnCancelText}>{t('cancel')}</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[S.btnCreate, (!canSubmit || loadingCreate) && { opacity: 0.5 }]}
            onPress={handleSubmit}
            disabled={!canSubmit || loadingCreate}
          >
            {loadingCreate ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={S.btnCreateText}>{t('add_employee')}</Text>
            )}
          </TouchableOpacity>
        </View>

        <View style={{ height: 8 }} />
        <View style={S.grabber} />
      </ScrollView>
    </BottomSheetModal>
  );
}

const makeStyles = (theme: any) =>
  StyleSheet.create({
    sheetContent: {
      paddingTop: 16,
      paddingBottom: Platform.select({ ios: 28, android: 20 }),
      paddingHorizontal: 16,
      backgroundColor: theme.colors.card,
      borderTopLeftRadius: 15,
      borderTopRightRadius: 15,
    },
    label: {
      fontSize: 13,
      color: theme.colors.mutedText,
      marginBottom: 6,
    },
    rowButtons: {
      flexDirection: 'row',
      gap: 12,
      marginTop: 16,
    },
    btnCancel: {
      flex: 1,
      height: 48,
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: 10,
      backgroundColor: '#FFE9E7',
    },
    btnCancelText: { fontSize: 16, fontWeight: '600', color: '#F04848' },
    btnCreate: {
      flex: 1,
      height: 48,
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: 10,
      backgroundColor: '#6E8BFF',
    },
    btnCreateText: { fontSize: 16, fontWeight: '700', color: '#fff' },
    grabber: {
      alignSelf: 'center',
      width: 44,
      height: 5,
      borderRadius: 999,
      backgroundColor: '#D3D3D3',
      marginTop: 16,
    },
  });
