import React, { useEffect, useState } from 'react';
import {
  SafeAreaView,
  ScrollView,
  StyleSheet,
  View,
  Text,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';

import { useSafeAreaInsets } from 'react-native-safe-area-context';
import HeaderBar from '../components/common/HeaderBar';
import LabeledTextInput from '../components/common/LabeledTextInput';
import LabeledDate from '../components/common/LabeledDate';
import LabeledSelectCountry from '../components/common/LabeledSelectCountry';
import LabeledSelectState from '../components/common/LabeledSelectState';
import LabeledSelectCity from '../components/common/LabeledSelectCity';
import GradientButton from '../components/common/GradientButton';
import ReupImageIcon from '../assets/icons/reup_image_icon.svg';

import Toast from 'react-native-toast-message';

import { useUIFactory } from '../ui/factory/useUIFactory';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/AppNavigator';

import { apiHandle } from '../api/apihandle';
import { User } from '../api/endpoint/User';

import { launchImageLibrary } from 'react-native-image-picker';
import { uploadSingle } from '../api/uploadApi';
import { useAppReload } from '../context/AppReloadContext';

type Props = NativeStackScreenProps<RootStackParamList, 'PersonalInformation'>;

const AVATAR_DEFAULT =
  'https://cdn-icons-png.freepik.com/512/6858/6858504.png';

const PersonalInformationScreen = ({ navigation }: Props) => {
  const { theme, lang } = useUIFactory();
  const insets = useSafeAreaInsets();

  // ⭐ Reload key
  const [reloadKey, setReloadKey] = useState(0);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [avatarUploading, setAvatarUploading] = useState(false);

  const [avatarUri, setAvatarUri] = useState('');
  const [gender, setGender] = useState<'male' | 'female'>('male');

  const [faces, setFaces] = useState({
    left: '',
    front: '',
    right: '',
  });

  const [firstName, setFirstName] = useState('');
  const [phone, setPhone] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState(new Date());

  const [countryCode, setCountryCode] = useState('');
  const [stateCode, setStateCode] = useState('');
  const [cityName, setCityName] = useState('');
  const [fullAddress, setFullAddress] = useState('');

  const [approvalStatus, setApprovalStatus] =
    useState<'approved' | 'pending' | 'rejected'>('pending');

  // ================= LOAD USER =================
  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    try {
      const result = await apiHandle.callApi(User.GetMe).asPromise();
      if (result.status.isError) throw new Error(result.status.errorMessage);

      const u = result.res.data.user;

      setAvatarUri(u.avatar || '');
      setFirstName(u.full_name || '');
      setPhone(u.phone_number || '');
      setGender(u.gender || 'male');
      setDateOfBirth(u.date_of_birth ? new Date(u.date_of_birth) : new Date());

      setCountryCode(u.country_code || '');
      setStateCode(u.state_code || '');
      setCityName(u.city_name || '');
      setFullAddress(u.full_address || '');

      setFaces({
        left: u.face_left || '',
        front: u.face_image || '',
        right: u.face_right || '',
      });

      setApprovalStatus(u.info_status || 'pending');
    } catch (err: any) {
      Toast.show({
        type: 'error',
        text1: 'Lỗi',
        text2: err.message || 'Không thể tải dữ liệu',
      });
    } finally {
      setLoading(false);
    }
  };
const { reloadApp } = useAppReload();

  // ================= UPDATE PROFILE =================
  const doUpdateProfile = async () => {
    try {
      setSaving(true);

      const payload = {
        full_name: firstName,
        phone_number: phone,
        gender,
        date_of_birth: dateOfBirth,
        country_code: countryCode,
        state_code: stateCode,
        city_name: cityName,
        full_address: fullAddress,
        avatar: avatarUri,
        face_image: faces.front,
      };

      const result = await apiHandle.callApi(User.UpdateMe, payload).asPromise();
      if (result.status.isError) throw new Error(result.status.errorMessage);

      // ⭐ Reload dữ liệu như kéo refresh
      await loadUser();
      setReloadKey(k => k + 1);

      Toast.show({
        type: 'success',
        text1: 'Thành công',
        text2: 'Thông tin đã được cập nhật',
      });
 reloadApp(); 
    } catch (err: any) {
      Toast.show({
        type: 'error',
        text1: 'Lỗi',
        text2: err.message || 'Cập nhật thất bại',
      });
    } finally {
      setSaving(false);
    }
  };

  const handleUpdate = () => {
    Alert.alert('Xác nhận', 'Bạn có chắc muốn lưu các thay đổi này?', [
      { text: 'Hủy', style: 'cancel' },
      { text: 'Đồng ý', onPress: doUpdateProfile },
    ]);
  };

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  const S = makeStyles(theme);

  // ================= UPLOAD AVATAR =================
  const handleUploadAvatar = async () => {
    const pick = await launchImageLibrary({ mediaType: 'photo' });
    const asset = pick.assets?.[0];
    if (!asset?.uri) return;

    try {
      setAvatarUploading(true);

      const uploaded = await uploadSingle(asset.uri, 'avatars');
      setAvatarUri(uploaded.url);

      Toast.show({
        type: 'success',
        text1: 'Tải lên thành công',
        text2: 'Ảnh đại diện đã được tải lên',
      });
    } catch (err: any) {
      Toast.show({
        type: 'error',
        text1: 'Lỗi tải ảnh',
        text2: err.message,
      });
    } finally {
      setAvatarUploading(false);
    }
  };

  const statusColor =
    approvalStatus === 'approved'
      ? '#2ECC71'
      : approvalStatus === 'pending'
      ? '#F1C40F'
      : '#E74C3C';

  const statusText =
    approvalStatus === 'approved'
      ? 'ĐÃ DUYỆT'
      : approvalStatus === 'pending'
      ? 'ĐANG CHỜ DUYỆT'
      : 'BỊ TỪ CHỐI';

  // ================= UI =================
  return (
    <SafeAreaView key={reloadKey} style={S.safeArea}>
   <HeaderBar
  title="Thông tin cá nhân"
  onBack={() => navigation.goBack()}
  topInset={insets.top}
  isShowAvatar={false}   // 🔥 ẩn avatar
/>


      <ScrollView style={S.scroll} contentContainerStyle={[S.content, { paddingBottom: 120 }]}>

        {/* Avatar */}
        <View style={S.photoWrapper}>
          <View style={S.photoCard}>
            <Image source={{ uri: avatarUri || AVATAR_DEFAULT }} style={S.photo} />

            {avatarUploading && (
              <View style={S.avatarOverlay}>
                <ActivityIndicator size="large" color="#fff" />
              </View>
            )}

            <TouchableOpacity style={S.photoAction} onPress={handleUploadAvatar}>
              <ReupImageIcon width={34} height={34} />
            </TouchableOpacity>
          </View>

          <Text style={S.uploadTitle}>Ảnh đại diện</Text>
          <Text style={S.uploadHint}>Ảnh rõ nét và đủ sáng</Text>

          <View style={[S.statusBadge, { backgroundColor: statusColor }]}>
            <Text style={S.statusText}>{statusText}</Text>
          </View>
        </View>

        <LabeledTextInput label="Họ và tên" value={firstName} onChangeText={setFirstName} theme={theme} />
        <View style={S.fieldSpacing} />

        <LabeledTextInput label="Số điện thoại" value={phone} onChangeText={setPhone} keyboardType="phone-pad" theme={theme} />
        <View style={S.fieldSpacing} />

        <Text style={S.sectionTitle}>Giới tính</Text>
        <View style={S.genderRow}>
          <TouchableOpacity
            style={[S.genderOption, gender === 'male' && S.genderSelected]}
            onPress={() => setGender('male')}
          >
            <Text style={S.genderText}>Nam</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[S.genderOption, gender === 'female' && S.genderSelected]}
            onPress={() => setGender('female')}
          >
            <Text style={S.genderText}>Nữ</Text>
          </TouchableOpacity>
        </View>

        <View style={S.fieldSpacing} />

        <LabeledDate label="Ngày sinh" date={dateOfBirth} onChange={setDateOfBirth} theme={theme} />
        <View style={S.sectionSpacing} />

        <Text style={S.sectionTitle}>Địa chỉ</Text>
        <Text style={S.sectionSubtitle}>Quốc gia, Tỉnh/TP, Thành phố...</Text>

        <LabeledSelectCountry label="Quốc gia" value={countryCode} onChange={opt => setCountryCode(opt.value)} theme={theme} />
        <View style={S.fieldSpacing} />

        <LabeledSelectState label="Tỉnh / Bang" countryCode={countryCode} value={stateCode} onChange={opt => setStateCode(opt.value)} theme={theme} />
        <View style={S.fieldSpacing} />

        <LabeledSelectCity label="Thành phố" countryCode={countryCode} stateCode={stateCode} value={cityName} onChange={opt => setCityName(opt.value)} theme={theme} />
        <View style={S.fieldSpacing} />

        <LabeledTextInput label="Địa chỉ đầy đủ" value={fullAddress} onChangeText={setFullAddress} theme={theme} multiline />
        <View style={S.sectionSpacing} />

        <Text style={S.sectionTitle}>Ảnh khuôn mặt</Text>
        <Text style={S.sectionSubtitle}>Trái • Chính diện • Phải</Text>

        <View style={S.faceGrid}>
          <View style={S.faceItem}>
            <Image source={{ uri: faces.left || AVATAR_DEFAULT }} style={S.faceImage} />
            <Text style={S.faceLabel}>Trái</Text>
          </View>

          <View style={S.faceItem}>
            <Image source={{ uri: faces.front || AVATAR_DEFAULT }} style={S.faceImage} />
            <Text style={S.faceLabel}>Chính diện</Text>
          </View>

          <View style={S.faceItem}>
            <Image source={{ uri: faces.right || AVATAR_DEFAULT }} style={S.faceImage} />
            <Text style={S.faceLabel}>Phải</Text>
          </View>
        </View>
      </ScrollView>

      <View style={{ padding: 20 }}>
        <GradientButton text={saving ? '...' : 'Cập nhật'} onPress={handleUpdate} />
      </View>
    </SafeAreaView>
  );
};

const makeStyles = (theme: any) =>
  StyleSheet.create({
    safeArea: { flex: 1, backgroundColor: theme.colors.background },
    scroll: { flex: 1 },
    content: { paddingHorizontal: 20, paddingTop: 20 },

    photoWrapper: { alignItems: 'center', marginBottom: 20 },
    photoCard: { width: 160, height: 160 },
    photo: { width: 140, height: 140, borderRadius: 20 },

    avatarOverlay: {
      position: 'absolute',
      top: 0, left: 0, right: 0, bottom: 0,
      backgroundColor: 'rgba(0,0,0,0.45)',
      borderRadius: 20,
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 10,
    },

    photoAction: {
      position: 'absolute',
      top: -2,
      right: -2,
      width: 34,
      height: 34,
      borderRadius: 17,
      backgroundColor: theme.colors.primary,
      alignItems: 'center',
      justifyContent: 'center',
    },

    uploadTitle: { marginTop: 10, fontSize: 15, fontWeight: '600', color: theme.colors.text },
    uploadHint: { fontSize: 12, color: theme.colors.muted, textAlign: 'center' },

    statusBadge: {
      marginTop: 12,
      paddingVertical: 6,
      paddingHorizontal: 14,
      borderRadius: 16,
    },
    statusText: { color: '#fff', fontWeight: '700', fontSize: 13 },

    fieldSpacing: { height: 16 },
    sectionSpacing: { height: 28 },

    sectionTitle: { fontSize: 16, fontWeight: '700', color: theme.colors.text },
    sectionSubtitle: { fontSize: 12, color: theme.colors.muted },

    genderRow: { flexDirection: 'row', gap: 12, marginTop: 8 },
    genderOption: {
      paddingVertical: 10,
      paddingHorizontal: 20,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: '#ccc',
    },
    genderSelected: {
      backgroundColor: theme.colors.primary,
      borderColor: theme.colors.primary,
    },
    genderText: { color: theme.colors.text, fontWeight: '500' },

    faceGrid: { flexDirection: 'row', gap: 16, marginTop: 16 },
    faceItem: { width: '30%', alignItems: 'center' },
    faceImage: { width: 96, height: 96, borderRadius: 16, backgroundColor: '#221c1c' },
    faceLabel: { fontSize: 12, color: theme.colors.muted },
  });

export default PersonalInformationScreen;