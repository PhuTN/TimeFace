import {useEffect, useState} from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import {useSafeAreaInsets} from 'react-native-safe-area-context';
import ReupImageIcon from '../assets/icons/reup_image_icon.svg';
import GradientButton from '../components/common/GradientButton';
import HeaderBar from '../components/common/HeaderBar';
import LabeledDate from '../components/common/LabeledDate';
import LabeledSelectCity from '../components/common/LabeledSelectCity';
import LabeledSelectCountry from '../components/common/LabeledSelectCountry';
import LabeledSelectState from '../components/common/LabeledSelectState';
import LabeledTextInput from '../components/common/LabeledTextInput';

import Toast from 'react-native-toast-message';

import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {RootStackParamList} from '../navigation/AppNavigator';
import {useUIFactory} from '../ui/factory/useUIFactory';

import {apiHandle} from '../api/apihandle';
import {User} from '../api/endpoint/User';

import {launchImageLibrary} from 'react-native-image-picker';
import {uploadSingle} from '../api/uploadApi';
import {useAppReload} from '../context/AppReloadContext';

type Props = NativeStackScreenProps<RootStackParamList, 'PersonalInformation'>;

const AVATAR_DEFAULT = 'https://cdn-icons-png.freepik.com/512/6858/6858504.png';

const PersonalInformationScreen = ({navigation, route}: Props) => {
  const {theme} = useUIFactory();
  const insets = useSafeAreaInsets();

  const [loading, setLoading] = useState(true);
  const [email, setEmail] = useState('');
  const [saving, setSaving] = useState(false);
  const [avatarUploading, setAvatarUploading] = useState(false);
  const [jobTitle, setJobTitle] = useState('');
  const [salary, setSalary] = useState('');
  const [avatarUri, setAvatarUri] = useState('');
  const [gender, setGender] = useState<'male' | 'female'>('male');
  const [userData, setUserData] = useState<any>(null);
  // ⭐ 2 STATE: API vs PARAM
  const [faceFrontApi, setFaceFrontApi] = useState('');
  const [faceLeftApi, setFaceLeftApi] = useState('');
  const [faceRightApi, setFaceRightApi] = useState('');

  const [faceFrontParam, setFaceFrontParam] = useState('');
  const [faceLeftParam, setFaceLeftParam] = useState('');
  const [faceRightParam, setFaceRightParam] = useState('');

  const [firstName, setFirstName] = useState('');
  const [phone, setPhone] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState(new Date());

  const [countryCode, setCountryCode] = useState('');
  const [stateCode, setStateCode] = useState('');
  const [cityName, setCityName] = useState('');
  const [fullAddress, setFullAddress] = useState('');

  const [approvalStatus, setApprovalStatus] = useState<
    'approved' | 'pending' | 'rejected'
  >('pending');

  // ================= LOAD USER =================
  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    try {
      const result = await apiHandle.callApi(User.GetMe).asPromise();
      if (result.status.isError) throw new Error(result.status.errorMessage);

      const u = result.res.data.user;
      setUserData(u);
      setAvatarUri(u.avatar || '');
      setFirstName(u.full_name || '');
      setPhone(u.phone_number || '');
      setGender(u.gender || 'male');
      setDateOfBirth(u.date_of_birth ? new Date(u.date_of_birth) : null);
      setJobTitle(u.job_title || '');
      setSalary(u.salary ? u.salary.toString() : '');
      setCountryCode(u.country_code || null);
      setStateCode(u.state_code || '');
      setCityName(u.city_name || '');
      setFullAddress(u.full_address || '');
      setEmail(u.email || '');
      // ⭐ Không đụng vào faceImageParam
      setFaceFrontApi(u.face_image || '');
      setFaceLeftApi(u.face_image2 || '');
      setFaceRightApi(u.face_image3 || '');

      setApprovalStatus(u.profile_approved ? 'approved' : 'pending');
    } catch (err: any) {
      Toast.show({type: 'error', text1: 'Lỗi', text2: err.message});
    } finally {
      setLoading(false);
    }
  };
  const [faceIdFront, setFaceIdFront] = useState<Float32Array | null>(null);
  // ⭐ NHẬN ẢNH TỪ FACE DETECTION (ƯU TIÊN)
  useEffect(() => {
    const faces = route?.params?.faces;
    console.log('FACES', faces);
    if (!faces) return;

    if (faces.image_front) {
      console.log('🔥 Face front received:', faces.image_front);
      setFaceFrontParam(faces.image_front);
    }
    if (faces.image_left) {
      console.log('🔥 Face left received:', faces.image_left);
      setFaceLeftParam(faces.image_left);
    }
    if (faces.image_right) {
      console.log('🔥 Face right received:', faces.image_right);
      setFaceRightParam(faces.image_right);
    }

    if (faces.faceid_front) {
      console.log('🔥 FaceID front vector length:', faces.faceid_front.length);
      setFaceIdFront(faces.faceid_front); // ✅ thêm state mới ở Bước 2
    }

    // clear params tránh set lại khi re-render
    navigation.setParams({faces: undefined});
  }, [route?.params?.faces, navigation]);

  const {reloadApp} = useAppReload();

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

        // ⭐ Ảnh khuôn mặt
        face_image: faceFrontParam || faceFrontApi, // chính diện
        face_image2: faceLeftParam || faceLeftApi, // trái
        face_image3: faceRightParam || faceRightApi, // phải

        // ⭐ Face ID vector (convert sang JSON)
        face_id: faceIdFront
          ? JSON.stringify(Array.from(faceIdFront))
          : undefined,
      };

      const result = await apiHandle
        .callApi(User.UpdateMe, payload)
        .asPromise();
      if (result.status.isError) throw new Error(result.status.errorMessage);

      await loadUser();

      Toast.show({
        type: 'success',
        text1: 'Thành công',
        text2: 'Thông tin đã được cập nhật',
      });

      reloadApp();
    } catch (err: any) {
      Toast.show({type: 'error', text1: 'Lỗi', text2: err.message});
    } finally {
      setSaving(false);
    }
  };

  const handleUpdate = () => {
    Alert.alert('Xác nhận', 'Bạn có chắc muốn lưu các thay đổi này?', [
      {text: 'Hủy', style: 'cancel'},
      {text: 'Đồng ý', onPress: doUpdateProfile},
    ]);
  };

  if (loading) {
    return (
      <View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  const S = makeStyles(theme);

  // ================= UPLOAD AVATAR =================
  const handleUploadAvatar = async () => {
    const pick = await launchImageLibrary({mediaType: 'photo'});
    const asset = pick.assets?.[0];
    if (!asset?.uri) return;

    try {
      setAvatarUploading(true);

      const uploaded = await uploadSingle(asset.uri, 'avatars');
      setAvatarUri(uploaded.url);

      Toast.show({type: 'success', text1: 'Tải lên thành công'});
    } catch (err: any) {
      Toast.show({type: 'error', text1: 'Lỗi tải ảnh', text2: err.message});
    } finally {
      setAvatarUploading(false);
    }
  };

  const statusColor =
    approvalStatus === 'approved'
      ? '#2ECC71' // xanh
      : approvalStatus === 'pending'
      ? '#F1C40F' // vàng
      : '#E74C3C'; // đỏ

  const statusText =
    approvalStatus === 'approved'
      ? 'ĐÃ DUYỆT'
      : approvalStatus === 'pending'
      ? 'ĐANG CHỜ DUYỆT'
      : 'BỊ TỪ CHỐI';

  // ================= UI =================
  return (
    <SafeAreaView style={S.safeArea}>
      <HeaderBar
        title="Thông tin cá nhân"
        onBack={() => navigation.goBack()}
        topInset={insets.top}
        isShowAvatar={false}
      />

      <ScrollView
        style={S.scroll}
        contentContainerStyle={[S.content, {paddingBottom: 120}]}>
        {/* Avatar */}
        <View style={S.photoWrapper}>
          <View style={S.photoCard}>
            <Image
              source={{uri: avatarUri || AVATAR_DEFAULT}}
              style={S.photo}
            />

            {avatarUploading && (
              <View style={S.avatarOverlay}>
                <ActivityIndicator size="large" color="#fff" />
              </View>
            )}

            <TouchableOpacity
              style={S.photoAction}
              onPress={handleUploadAvatar}>
              <ReupImageIcon width={34} height={34} />
            </TouchableOpacity>
          </View>

          <Text style={S.uploadTitle}>Ảnh đại diện</Text>
          <Text style={S.uploadHint}>Ảnh rõ nét và đủ sáng</Text>

          {/* ⭐ Chỉ hiện nếu user là role user */}
          {userData?.role === 'user' && (
            <View style={[S.statusBadge, {backgroundColor: statusColor}]}>
              <Text style={S.statusText}>{statusText}</Text>
            </View>
          )}
        </View>

        <LabeledTextInput
          label="Họ và tên"
          value={firstName}
          onChangeText={setFirstName}
          theme={theme}
        />
        <View style={S.fieldSpacing} />

        {userData?.employee_code ? (
          <>
            <LabeledTextInput
              label="Mã nhân viên"
              value={userData.employee_code}
              editable={false}
              theme={theme}
            />
            <View style={S.fieldSpacing} />
          </>
        ) : null}
        <View style={S.fieldSpacing} />
        <LabeledTextInput
          label="Số điện thoại"
          value={phone}
          onChangeText={setPhone}
          type="number"
          theme={theme}
        />
        <View style={S.fieldSpacing} />

        <LabeledTextInput
          label="Chức vụ"
          value={jobTitle}
          editable={false}
          theme={theme}
        />
        <View style={S.fieldSpacing} />
        <LabeledTextInput
          label="Email"
          value={email}
          editable={false}
          theme={theme}
        />

        <View style={S.fieldSpacing} />
        {jobTitle?.toLowerCase() !== 'admin' && (
          <LabeledTextInput
            label="Lương"
            value={salary}
            editable={false}
            theme={theme}
            type="money"
          />
        )}

        <View style={S.fieldSpacing} />

        <Text style={S.sectionTitle}>Giới tính</Text>
        <View style={S.genderRow}>
          <TouchableOpacity
            style={[S.genderOption, gender === 'male' && S.genderSelected]}
            onPress={() => setGender('male')}>
            <Text style={S.genderText}>Nam</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[S.genderOption, gender === 'female' && S.genderSelected]}
            onPress={() => setGender('female')}>
            <Text style={S.genderText}>Nữ</Text>
          </TouchableOpacity>
        </View>

        <View style={S.fieldSpacing} />

        <LabeledDate
          label="Ngày sinh"
          date={dateOfBirth}
          onChange={setDateOfBirth}
          theme={theme}
        />
        <View style={S.sectionSpacing} />

        <Text style={S.sectionTitle}>Địa chỉ</Text>
        <Text style={S.sectionSubtitle}>Quốc gia, Tỉnh/TP, Thành phố...</Text>

        <LabeledSelectCountry
          label="Quốc gia"
          value={countryCode}
          onChange={opt => setCountryCode(opt.value)}
          theme={theme}
        />
        <View style={S.fieldSpacing} />

        <LabeledSelectState
          label="Tỉnh / Bang"
          countryCode={countryCode}
          value={stateCode}
          onChange={opt => setStateCode(opt.value)}
          theme={theme}
        />
        <View style={S.fieldSpacing} />

        <LabeledSelectCity
          label="Thành phố"
          countryCode={countryCode}
          stateCode={stateCode}
          value={cityName}
          onChange={opt => setCityName(opt.value)}
          theme={theme}
        />
        <View style={S.fieldSpacing} />

        <LabeledTextInput
          label="Địa chỉ đầy đủ"
          value={fullAddress}
          onChangeText={setFullAddress}
          theme={theme}
          multiline
        />

        <View style={S.sectionSpacing} />

        {/* ⭐ FACE IMAGES */}
        <Text style={S.sectionTitle}>Ảnh khuôn mặt</Text>
        <Text style={S.sectionSubtitle}>Chính diện / Trái / Phải</Text>

        <View style={S.faceRow}>
          {/* LEFT */}
          <View style={S.faceItem}>
            <Image
              source={{uri: faceLeftParam || faceLeftApi || AVATAR_DEFAULT}}
              style={S.facePreview}
            />
            <Text style={S.faceLabel}>Trái</Text>
          </View>

          {/* FRONT */}
          <View style={S.faceItem}>
            <Image
              source={{uri: faceFrontParam || faceFrontApi || AVATAR_DEFAULT}}
              style={S.facePreview}
            />
            <Text style={S.faceLabel}>Chính diện</Text>
          </View>

          {/* RIGHT */}
          <View style={S.faceItem}>
            <Image
              source={{uri: faceRightParam || faceRightApi || AVATAR_DEFAULT}}
              style={S.facePreview}
            />
            <Text style={S.faceLabel}>Phải</Text>
          </View>
        </View>

        <View style={{alignItems: 'center', marginTop: 12}}>
          <TouchableOpacity
            onPress={() =>
              navigation.replace('PersonalInformationFaceDetection')
            }>
            <ReupImageIcon width={34} height={34} />
          </TouchableOpacity>
        </View>
      </ScrollView>

      <View style={{padding: 20}}>
        <GradientButton
          text={saving ? '...' : 'Cập nhật'}
          onPress={handleUpdate}
        />
      </View>
    </SafeAreaView>
  );
};

const makeStyles = (theme: any) =>
  StyleSheet.create({
    safeArea: {flex: 1, backgroundColor: theme.colors.background},
    scroll: {flex: 1},
    content: {paddingHorizontal: 20, paddingTop: 20},

    photoWrapper: {alignItems: 'center', marginBottom: 20},
    photoCard: {width: 160, height: 160},
    photo: {width: 140, height: 140, borderRadius: 20},

    avatarOverlay: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
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

    uploadTitle: {
      marginTop: 10,
      fontSize: 15,
      fontWeight: '600',
      color: theme.colors.text,
    },
    uploadHint: {fontSize: 12, color: theme.colors.muted, textAlign: 'center'},

    statusBadge: {
      marginTop: 12,
      paddingVertical: 6,
      paddingHorizontal: 14,
      borderRadius: 16,
    },
    statusText: {color: '#fff', fontWeight: '700', fontSize: 13},

    fieldSpacing: {height: 16},
    sectionSpacing: {height: 28},

    sectionTitle: {fontSize: 16, fontWeight: '700', color: theme.colors.text},
    sectionSubtitle: {fontSize: 12, color: theme.colors.muted},

    genderRow: {flexDirection: 'row', gap: 12, marginTop: 8},
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
    genderText: {color: theme.colors.text, fontWeight: '500'},

    faceLabel: {
      marginTop: 6,
      fontSize: 12,
      color: theme.colors.muted,
    },
    faceImage: {
      backgroundColor: '#221c1c',
    },
    faceRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginTop: 16,
      gap: 12,
    },
    faceItem: {
      alignItems: 'center',
      flex: 1,
    },
    facePreview: {
      width: 95,
      height: 95,
      borderRadius: 16,
      backgroundColor: '#221c1c',
    },
  });

export default PersonalInformationScreen;
