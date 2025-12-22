import {useEffect, useState} from 'react';
import {
  ActivityIndicator,
  Image,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import {useSafeAreaInsets} from 'react-native-safe-area-context';
import HeaderBar from '../components/common/HeaderBar';
import LabeledTextInput from '../components/common/LabeledTextInput';

import Toast from 'react-native-toast-message';

import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {RootStackParamList} from '../navigation/AppNavigator';
import {useUIFactory} from '../ui/factory/useUIFactory';

import {apiHandle} from '../api/apihandle';
import {User} from '../api/endpoint/user';

import {Country, State} from 'country-state-city';

type Props = NativeStackScreenProps<
  RootStackParamList,
  'PersonalInformationView'
>;

const AVATAR_DEFAULT = 'https://cdn-icons-png.freepik.com/512/6858/6858504.png';

/* ================= UTIL ================= */

function getCountryLabel(code?: string) {
  if (!code) return '—';
  const c = Country.getAllCountries().find(it => it.isoCode === code);
  return c?.name || code;
}

function getStateLabel(country?: string, state?: string) {
  if (!country || !state) return '—';
  const s = State.getStatesOfCountry(country).find(it => it.isoCode === state);
  return s?.name || state;
}

/* ================= MAIN SCREEN ================= */

export default function PersonalInformationViewScreen({
  route,
  navigation,
}: Props) {
  const {theme} = useUIFactory();
  const insets = useSafeAreaInsets();

  const userId = route.params?.userId; // ⭐ lấy id được truyền khi click list
  const [loading, setLoading] = useState(true);
  const [userData, setUserData] = useState<any>(null);

  const [editJob, setEditJob] = useState('');
  const [editSalary, setEditSalary] = useState('');

  const SimpleButton = ({
    text,
    color,
    onPress,
  }: {
    text: string;
    color: string;
    onPress: () => void;
  }) => (
    <TouchableOpacity
      onPress={onPress}
      style={[styles.simpleBtn, {backgroundColor: color}]}>
      <Text style={styles.simpleBtnText}>{text}</Text>
    </TouchableOpacity>
  );

  useEffect(() => {
    loadDetail();
  }, []);

  const loadDetail = async () => {
    try {
      const result = await apiHandle
        .callApi(User.GetDetailByCompany(userId))
        .asPromise();

      if (result.status.isError) throw new Error(result.status.errorMessage);

      const u = result.res.data.user;

      setUserData(u);
      setEditJob(u?.job_title || '');
      setEditSalary(u?.salary ? String(u?.salary) : '');
    } catch (err: any) {
      Toast.show({type: 'error', text1: 'Lỗi', text2: err.message});
    } finally {
      setLoading(false);
    }
  };

  /* ======================== ACTIONS ========================= */

  const toggleActive = async () => {
    try {
      const payload = {is_active: !userData.is_active};

      const result = await apiHandle
        .callApi(User.UpdateStatus(userId), payload)
        .asPromise();

      if (result.status.isError) throw new Error(result.status.errorMessage);

      Toast.show({
        type: 'success',
        text1: 'Thành công',
        text2: 'Cập nhật trạng thái user',
      });
      loadDetail();
    } catch (err: any) {
      Toast.show({type: 'error', text1: 'Lỗi', text2: err.message});
    }
  };

  const approveProfile = async () => {
    try {
      const payload = {status: 'approved'};

      const result = await apiHandle
        .callApi(User.ApproveProfile(userId), payload)
        .asPromise();

      if (result.status.isError) throw new Error(result.status.errorMessage);

      Toast.show({
        type: 'success',
        text1: 'Thành công',
        text2: 'Đã duyệt hồ sơ',
      });

      loadDetail();
    } catch (err: any) {
      Toast.show({type: 'error', text1: 'Lỗi', text2: err.message});
    }
  };

  const saveJobSalary = async () => {
    try {
      const payload = {
        job_title: editJob,
        salary: Number(editSalary) || 0,
      };

      const result = await apiHandle
        .callApi(User.UpdateByCompany(userId), payload)
        .asPromise();

      if (result.status.isError) throw new Error(result.status.errorMessage);

      Toast.show({
        type: 'success',
        text1: 'Thành công',
        text2: 'Đã cập nhật chức vụ và lương',
      });

      loadDetail();
    } catch (err: any) {
      Toast.show({type: 'error', text1: 'Lỗi', text2: err.message});
    }
  };

  /* ======================== UI ========================= */

  if (loading || !userData) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  const {
    full_name,
    phone_number,
    avatar,
    job_title,
    salary,
    gender,
    date_of_birth,
    face_image,
    face_image2,
    face_image3,
    country_code,
    state_code,
    city_name,
    full_address,
    is_active,
    profile_approved,
    old_password,
    createdAt,
  } = userData;

  const activeText = is_active ? 'Đang hoạt động' : 'Ngưng hoạt động';
  const approvedText = profile_approved ? 'Đã duyệt hồ sơ' : 'Chưa duyệt';
  const passwordChangedText = old_password
    ? 'Đã đổi mật khẩu'
    : 'Chưa đổi mật khẩu';

  const dobText = date_of_birth
    ? new Date(date_of_birth).toLocaleDateString('vi-VN')
    : '—';

  const createdText = createdAt
    ? new Date(createdAt).toLocaleDateString('vi-VN')
    : '—';

  return (
    <SafeAreaView style={{flex: 1, backgroundColor: theme.colors.background}}>
      <HeaderBar
        title={full_name}
        onBack={() => navigation.goBack()}
        topInset={insets.top}
        isShowAvatar={false}
      />

      <ScrollView style={{padding: 20}}>
        {/* ================= ADMIN CONTROL ================= */}
        <Text style={styles.section}>Admin điều chỉnh</Text>

        <View style={styles.card}>
          {/* ACTIVE BUTTON */}
          <SimpleButton
            text={is_active ? 'Chặn tài khoản' : 'Mở chặn tài khoản'}
            color={is_active ? '#EF4444' : '#10B981'}
            onPress={toggleActive}
          />

          {/* APPROVE BUTTON */}
          {!profile_approved && (
            <SimpleButton
              text="Duyệt hồ sơ"
              color="#3B82F6"
              onPress={approveProfile}
            />
          )}

          <View style={styles.line} />

          {/* EDIT JOB TITLE */}
          <LabeledTextInput
            label="Chức vụ"
            value={editJob}
            onChangeText={setEditJob}
            editable
            theme={theme}
          />

          <View style={styles.gap} />

          {/* EDIT SALARY */}
          <LabeledTextInput
            label="Lương"
            value={editSalary}
            onChangeText={setEditSalary}
            editable
            theme={theme}
            type="money"
          />

          <View style={styles.gap} />

          <SimpleButton
            text="Lưu thay đổi"
            color="#0EA5E9"
            onPress={saveJobSalary}
          />
        </View>

        {/* ================= USER INFO ================= */}
        <View style={styles.sectionGap} />
        <Text style={styles.sectionSmall}>Thông tin nhân viên</Text>

        <View style={styles.card}>
          <View style={{alignItems: 'center', marginBottom: 20}}>
            <Image
              source={{uri: avatar || AVATAR_DEFAULT}}
              style={{width: 140, height: 140, borderRadius: 20}}
            />
          </View>

          <LabeledTextInput
            label="Họ và tên"
            value={full_name}
            editable={false}
            theme={theme}
          />
          <View style={styles.gap} />
          <LabeledTextInput
            label="Email"
            value={userData?.email || '—'}
            editable={false}
            theme={theme}
          />

          <View style={styles.gap} />
          <LabeledTextInput
            label="Mã nhân viên"
            value={userData?.employee_code || '—'}
            editable={false}
            theme={theme}
          />
          <View style={styles.gap} />
          <LabeledTextInput
            label="Số điện thoại"
            value={phone_number}
            editable={false}
            theme={theme}
          />
          <View style={styles.gap} />

          <LabeledTextInput
            label="Giới tính"
            value={gender === 'male' ? 'Nam' : 'Nữ'}
            editable={false}
            theme={theme}
          />
          <View style={styles.gap} />

          <LabeledTextInput
            label="Ngày sinh"
            value={dobText}
            editable={false}
            theme={theme}
          />
          {/* ADDRESS */}
          <View style={styles.sectionGapSmall} />
          <Text style={styles.sectionSmall}>Địa chỉ nhân viên</Text>

          <LabeledTextInput
            label="Quốc gia"
            value={getCountryLabel(country_code)}
            editable={false}
            theme={theme}
          />
          <View style={styles.gap} />

          <LabeledTextInput
            label="Tỉnh / Bang"
            value={getStateLabel(country_code, state_code)}
            editable={false}
            theme={theme}
          />
          <View style={styles.gap} />

          <LabeledTextInput
            label="Thành phố"
            value={city_name || '—'}
            editable={false}
            theme={theme}
          />
          <View style={styles.gap} />

          <LabeledTextInput
            label="Địa chỉ đầy đủ"
            value={full_address || '—'}
            editable={false}
            theme={theme}
            multiline
          />
        </View>

        {/* ================= ACCOUNT INFO ================= */}
        <View style={styles.sectionGap} />
        <Text style={styles.sectionSmall}>Thông tin tài khoản</Text>

        <View style={styles.card}>
          <LabeledTextInput
            label="Ngày tạo tài khoản"
            value={createdText}
            editable={false}
            theme={theme}
          />
          <View style={styles.gap} />

          <LabeledTextInput
            label="Tình trạng đổi mật khẩu"
            value={passwordChangedText}
            editable={false}
            theme={theme}
          />

          <View style={styles.gap} />
          <LabeledTextInput
            label="Trạng thái hoạt động"
            value={activeText}
            editable={false}
            theme={theme}
          />

          <View style={styles.gap} />
          <LabeledTextInput
            label="Trạng thái duyệt"
            value={approvedText}
            editable={false}
            theme={theme}
          />
        </View>

        {/* ================= FACE IMAGES ================= */}
        <View style={styles.sectionGap} />
        <Text style={styles.sectionSmall}>Ảnh check-in</Text>

        <View style={styles.card}>
          <View style={styles.faceRow}>
            <Image source={{uri: face_image2}} style={styles.faceImg} />
            <Image source={{uri: face_image}} style={styles.faceImg} />
            <Image source={{uri: face_image3}} style={styles.faceImg} />
          </View>
        </View>

        <View style={{height: 60}} />
      </ScrollView>
    </SafeAreaView>
  );
}

/* ================= STYLES ================= */

const styles = StyleSheet.create({
  center: {flex: 1, justifyContent: 'center', alignItems: 'center'},

  section: {fontSize: 18, fontWeight: '700', marginBottom: 10},
  sectionSmall: {fontSize: 15, fontWeight: '600', marginBottom: 10},

  label: {fontSize: 13, color: '#999', marginBottom: 6},
  gap: {height: 16},
  sectionGap: {height: 32},
  sectionGapSmall: {height: 20},

  card: {
    backgroundColor: '#F1F5F9',
    padding: 16,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },

  line: {height: 1, backgroundColor: '#ddd', marginVertical: 20},

  simpleBtn: {
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 14,
  },
  simpleBtnText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 15,
  },

  faceRow: {flexDirection: 'row', justifyContent: 'space-between'},
  faceImg: {width: 95, height: 95, borderRadius: 20, backgroundColor: '#222'},
});
