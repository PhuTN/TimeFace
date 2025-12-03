import React, { useEffect, useState } from 'react';
import {
  SafeAreaView,
  ScrollView,
  StyleSheet,
  View,
  Text,
  Image,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
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

import { useUIFactory } from '../ui/factory/useUIFactory';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/AppNavigator';

import { apiHandle } from '../api/apihandle';
import { User } from '../api/endpoint/User';

import {
  launchCamera,
  launchImageLibrary,
  ImageLibraryOptions,
  CameraOptions,
} from 'react-native-image-picker';

type Props = NativeStackScreenProps<RootStackParamList, 'PersonalInformation'>;

const placeholder = "https://via.placeholder.com/150";

const PersonalInformationScreen = ({ navigation }: Props) => {
  const { theme, lang } = useUIFactory();
  const insets = useSafeAreaInsets();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // ================== FORM ==================
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

  // ================== LOAD GET ME ==================
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

    } catch (err: any) {
      Alert.alert("Error", err.message || "Failed to load user");
    } finally {
      setLoading(false);
    }
  };

  // ================== UPDATE SELF ==================
  const handleUpdate = async () => {
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

      const result = await apiHandle.callApi(User.UpdateMyProfile, payload).asPromise();

      if (result.status.isError) throw new Error(result.status.errorMessage);

      Alert.alert("Success", "Profile updated");
    } catch (err: any) {
      Alert.alert("Error", err.message || "Update failed");
    } finally {
      setSaving(false);
    }
  };

  if (!lang || loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  // ================== TEXTS ==================
  const L = lang.code === 'en'
    ? {
        info: 'Personal information',
        uploadTitle: 'Upload your photo',
        uploadHint: 'Make sure your photo looks clear',
        firstName: 'Full name',
        phone: 'Phone number',
        dob: 'Date of birth',
        gender: 'Gender',
        male: 'Male',
        female: 'Female',
        address: 'Address',
        addressHint: 'Country, state, city...',
        country: 'Country',
        state: 'State',
        city: 'City',
        fullAddress: 'Full address',
        faces: 'Face Photos',
        facesHint: 'Left • Front • Right',
        left: 'Left side',
        front: 'Front',
        right: 'Right side',
        update: 'Update',
      }
    : {
        info: 'Thông tin cá nhân',
        uploadTitle: 'Tải ảnh đại diện',
        uploadHint: 'Ảnh rõ nét và đủ sáng',
        firstName: 'Họ và tên',
        phone: 'Số điện thoại',
        dob: 'Ngày sinh',
        gender: 'Giới tính',
        male: 'Nam',
        female: 'Nữ',
        address: 'Địa chỉ',
        addressHint: 'Quốc gia, Tỉnh/TP, Thành phố...',
        country: 'Quốc gia',
        state: 'Tỉnh / Bang',
        city: 'Thành phố',
        fullAddress: 'Địa chỉ đầy đủ',
        faces: 'Ảnh khuôn mặt',
        facesHint: 'Bên trái • Chính diện • Bên phải',
        left: 'Bên trái',
        front: 'Chính diện',
        right: 'Bên phải',
        update: 'Cập nhật',
      };

  const S = makeStyles(theme);

  const handleUploadAvatar = async () => {
    Alert.alert(
      L.uploadTitle,
      L.uploadHint,
      [
        {
          text: lang.t('profile_photo_library'),
          onPress: async () => {
            const opt: ImageLibraryOptions = { mediaType: 'photo' };
            const res = await launchImageLibrary(opt);
            const asset = res.assets?.[0];
            if (asset?.uri) setAvatarUri(asset.uri);
          },
        },
        {
          text: lang.t('profile_take_a_photo'),
          onPress: async () => {
            const opt: CameraOptions = { mediaType: 'photo', cameraType: 'front' };
            const res = await launchCamera(opt);
            const asset = res.assets?.[0];
            if (asset?.uri) setAvatarUri(asset.uri);
          },
        },
        { text: lang.t('profile_cancel'), style: 'cancel' },
      ],
    );
  };

  return (
    <SafeAreaView style={S.safeArea}>
      <HeaderBar
        title={L.info}
        onBack={() => navigation.goBack()}
        topInset={insets.top}
      />

      <ScrollView
        style={S.scroll}
        contentContainerStyle={[S.content, { paddingBottom: 120 }]}>

        {/* Avatar */}
        <View style={S.photoWrapper}>
          <View style={S.photoCard}>
            <Image
              source={{ uri: avatarUri || placeholder }}
              style={S.photo}
            />
            <TouchableOpacity style={S.photoAction} onPress={handleUploadAvatar}>
              <ReupImageIcon width={34} height={34} />
            </TouchableOpacity>
          </View>
          <Text style={S.uploadTitle}>{L.uploadTitle}</Text>
          <Text style={S.uploadHint}>{L.uploadHint}</Text>
        </View>

        <LabeledTextInput
          label={L.firstName}
          value={firstName}
          onChangeText={setFirstName}
          theme={theme}
        />

        <View style={S.fieldSpacing} />

        <LabeledTextInput
          label={L.phone}
          value={phone}
          onChangeText={setPhone}
          keyboardType="phone-pad"
          theme={theme}
        />

        <View style={S.fieldSpacing} />

        {/* Gender */}
        <Text style={S.sectionTitle}>{L.gender}</Text>
        <View style={S.genderRow}>
          <TouchableOpacity
            style={[S.genderOption, gender === 'male' && S.genderSelected]}
            onPress={() => setGender('male')}>
            <Text style={S.genderText}>{L.male}</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[S.genderOption, gender === 'female' && S.genderSelected]}
            onPress={() => setGender('female')}>
            <Text style={S.genderText}>{L.female}</Text>
          </TouchableOpacity>
        </View>

        <View style={S.fieldSpacing} />

        <LabeledDate
          label={L.dob}
          date={dateOfBirth}
          onChange={setDateOfBirth}
          theme={theme}
        />

        <View style={S.sectionSpacing} />

        {/* Address */}
        <Text style={S.sectionTitle}>{L.address}</Text>
        <Text style={S.sectionSubtitle}>{L.addressHint}</Text>

        <View style={S.fieldSpacing} />

        <LabeledSelectCountry
          label={L.country}
          value={countryCode}
          onChange={opt => setCountryCode(opt.value)}
          theme={theme}
        />

        <View style={S.fieldSpacing} />

        <LabeledSelectState
          label={L.state}
          countryCode={countryCode}
          value={stateCode}
          onChange={opt => setStateCode(opt.value)}
          theme={theme}
        />

        <View style={S.fieldSpacing} />

        <LabeledSelectCity
          label={L.city}
          countryCode={countryCode}
          stateCode={stateCode}
          value={cityName}
          onChange={opt => setCityName(opt.value)}
          theme={theme}
        />

        <View style={S.fieldSpacing} />

        <LabeledTextInput
          label={L.fullAddress}
          value={fullAddress}
          onChangeText={setFullAddress}
          theme={theme}
          multiline
        />

        <View style={S.sectionSpacing} />

        {/* Faces */}
        <Text style={S.sectionTitle}>{L.faces}</Text>
        <Text style={S.sectionSubtitle}>{L.facesHint}</Text>

        <View style={S.faceGrid}>
          <View style={S.faceItem}>
            <Image source={{ uri: faces.left || placeholder }} style={S.faceImage} />
            <Text style={S.faceLabel}>{L.left}</Text>
          </View>

          <View style={S.faceItem}>
            <Image source={{ uri: faces.front || placeholder }} style={S.faceImage} />
            <Text style={S.faceLabel}>{L.front}</Text>
          </View>

          <View style={S.faceItem}>
            <Image source={{ uri: faces.right || placeholder }} style={S.faceImage} />
            <Text style={S.faceLabel}>{L.right}</Text>
          </View>
        </View>

      </ScrollView>

      <View style={{ padding: 20 }}>
        <GradientButton
          text={saving ? '...' : L.update}
          onPress={handleUpdate}
        />
      </View>
    </SafeAreaView>
  );
};

const makeStyles = theme =>
  StyleSheet.create({
    safeArea: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    scroll: { flex: 1 },
    content: { paddingHorizontal: 20, paddingTop: 20 },

    photoWrapper: { alignItems: 'center', marginBottom: 20 },
    photoCard: { width: 160, height: 160 },
    photo: { width: 140, height: 140, borderRadius: 20 },

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
    uploadHint: {
      fontSize: 12,
      color: theme.colors.muted,
      textAlign: 'center',
    },

    fieldSpacing: { height: 16 },
    sectionSpacing: { height: 28 },

    sectionTitle: { fontSize: 16, fontWeight: '700', color: theme.colors.text },
    sectionSubtitle: { fontSize: 12, color: theme.colors.muted },

    genderRow: {
      flexDirection: 'row',
      gap: 12,
      marginTop: 8,
    },
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
    genderText: {
      color: theme.colors.text,
      fontWeight: '500',
    },

    faceGrid: { flexDirection: 'row', gap: 16, marginTop: 16 },
    faceItem: { width: '30%', alignItems: 'center' },
    faceImage: { width: 96, height: 96, borderRadius: 16, backgroundColor: '#EEE' },
    faceLabel: { fontSize: 12, color: theme.colors.muted },
  });

export default PersonalInformationScreen;