import React, { useMemo, useRef, useState } from 'react';
import {
    SafeAreaView,
    ScrollView,
    StyleSheet,
    View,
    Text,
    Image,
    TouchableOpacity,
    Alert,
    Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { State, City } from 'country-state-city';
import HeaderBar from '../components/common/HeaderBar';
import LabeledTextInput from '../components/common/LabeledTextInput';
import LabeledDate from '../components/common/LabeledDate';
import LabeledSelectCountry from '../components/common/LabeledSelectCountry';
import LabeledSelectState from '../components/common/LabeledSelectState';
import LabeledSelectCity from '../components/common/LabeledSelectCity';
import { useUIFactory } from '../ui/factory/useUIFactory';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import ReupImageIcon from '../assets/icons/reup_image_icon.svg';
import GradientButton from '../components/common/GradientButton';
import {
    launchCamera,
    launchImageLibrary,
    Asset,
    ImageLibraryOptions,
    CameraOptions,
} from 'react-native-image-picker';

type Props = NativeStackScreenProps<RootStackParamList, 'PersonalInformation'>;

const USER_DEFAULT = {
    firstname: 'Tonald',
    lastname: 'Drump',
    dateOfBirth: new Date(1997, 11, 10),
    countryCode: 'ID',
    stateCode: 'DKI Jakarta',
    cityName: 'Jakarta Selatan',
    fullAddress: 'Jl Mampang Prapatan XIV No 7A, Jakarta Selatan 12790',
    avatar: 'https://i.pravatar.cc/200?img=64',
    image_left: 'https://i.pravatar.cc/200?img=66',
    image_front: 'https://i.pravatar.cc/200?img=67',
    image_right: 'https://i.pravatar.cc/200?img=68',
};

const PersonalInformationScreen = ({ route, navigation }: Props) => {
    const [avatarUri, setAvatarUri] = useState(USER_DEFAULT.avatar);
    const [faces, setFaces] = useState({
        left: USER_DEFAULT.image_left,
        front: USER_DEFAULT.image_front,
        right: USER_DEFAULT.image_right,
    });
    const [firstName, setFirstName] = useState(USER_DEFAULT.firstname);
    const [lastName, setLastName] = useState(USER_DEFAULT.lastname);
    const [dateOfBirth, setDateOfBirth] = useState(USER_DEFAULT.dateOfBirth);
    const [countryCode, setCountryCode] = useState(USER_DEFAULT.countryCode);
    const [stateCode, setStateCode] = useState(USER_DEFAULT.stateCode);
    const [cityName, setCityName] = useState(USER_DEFAULT.cityName);
    const [fullAddress, setFullAddress] = useState(USER_DEFAULT.fullAddress);

    const insets = useSafeAreaInsets();
    const { loading, theme, lang } = useUIFactory();

    const prevCountry = useRef(countryCode);
    const prevState = useRef(stateCode);

    React.useEffect(() => {
        if (prevCountry.current !== countryCode) {
            prevCountry.current = countryCode;
            setStateCode('');
            setCityName('');
        }
    }, [countryCode]);

    React.useEffect(() => {
        if (prevState.current !== stateCode) {
            prevState.current = stateCode;
            setCityName('');
        }
    }, [stateCode]);

    // Khi quay lại từ màn hình chụp khuôn mặt, cập nhật lại 3 ảnh
    React.useEffect(() => {
        if (route.params?.faces) {
            setFaces(prev => ({
                left: route.params?.faces.image_left ?? prev.left,
                front: route.params?.faces.image_front ?? prev.front,
                right: route.params?.faces.image_right ?? prev.right,
            }));
        }
    }, [route.params?.faces]);

    if (loading || !theme || !lang) {
        return null;
    }

    const S = makeStyles(theme);

    // ====== HANDLERS ======

    // 1) Mở thư viện hoặc camera để chọn/chụp avatar, sau đó hiển thị ngay lên UI
    const handleUploadAvatar = async () => {
        try {
            // Cho người dùng chọn: mở thư viện hay chụp ảnh
            Alert.alert(
                lang.t('profile_select_avatar_title'),
                lang.t('profile_select_avatar_text'),
                [
                    {
                        text: lang.t('profile_photo_library'),
                        onPress: async () => {
                            const libOptions: ImageLibraryOptions = {
                                mediaType: 'photo',
                                selectionLimit: 1,
                                quality: 0.9,
                            };
                            const res = await launchImageLibrary(libOptions);
                            if (res.didCancel) return;
                            const asset = res.assets?.[0];
                            if (asset?.uri) setAvatarUri(asset.uri);
                        },
                    },
                    {
                        text: lang.t('profile_take_a_photo'),
                        onPress: async () => {
                            const camOptions: CameraOptions = {
                                mediaType: 'photo',
                                saveToPhotos: false,
                                quality: 0.9,
                                cameraType: 'front',
                            };
                            const res = await launchCamera(camOptions);
                            if (res.didCancel) return;
                            const asset = res.assets?.[0];
                            if (asset?.uri) setAvatarUri(asset.uri);
                        },
                    },
                    { text: lang.t('profile_cancel'), style: 'cancel' },
                ],
                { cancelable: true },
            );
        } catch (e) {
            console.warn('handleUploadAvatar error', e);
            Alert.alert('Không thể chọn ảnh', 'Vui lòng thử lại.');
        }
    };

    // 2) Điều hướng sang màn hình chụp khuôn mặt (bạn sẽ làm auto-capture sau)
    const handleUploadFaceImage = () => {
        navigation.navigate('PersonalInformationFaceDetection');
    };

    // 3) Hiện “Cập nhật thành công” (chưa gọi BE)
    const handleUpdate = () => {
        // sau này bạn thay bằng gọi API + loading + try/catch
        Alert.alert('Cập nhật thành công');
    };

    return (
        <SafeAreaView style={S.safeArea}>
            <HeaderBar
                title={lang?.t('profile_information')}
                onBack={() => navigation?.goBack?.()}
                topInset={insets.top}
            />

            <ScrollView
                style={S.scroll}
                contentContainerStyle={[
                    S.content,
                    { paddingBottom: insets.bottom + theme.spacing(3) },
                ]}
                showsVerticalScrollIndicator={false}
            >
                {/* AVATAR */}
                <View style={S.photoWrapper}>
                    <View style={S.photoCard}>
                        <Image
                            source={
                                avatarUri
                                    ? { uri: avatarUri }
                                    : require('../assets/images/meow.jpg') // Đảm bảo bạn có ảnh này
                            }
                            style={S.photo}
                            resizeMode="cover"
                        />
                        <TouchableOpacity style={S.photoAction} onPress={handleUploadAvatar}>
                            <ReupImageIcon height={34} width={34} />
                        </TouchableOpacity>
                    </View>
                    <Text style={S.uploadTitle}>{lang.t('profile_upload_title')}</Text>
                    <Text style={S.uploadHint}>{lang.t('profile_upload_hint')}</Text>
                </View>

                {/* FORM */}
                <LabeledTextInput
                    label={lang.t('profile_first_name')}
                    value={firstName}
                    onChangeText={setFirstName}
                    placeholder="Enter first name"
                    theme={theme}
                    containerStyle={S.fullWidthField}
                />
                <View style={S.fieldSpacing} />

                <LabeledTextInput
                    label={lang.t('profile_last_name')}
                    value={lastName}
                    onChangeText={setLastName}
                    placeholder="Enter last name"
                    theme={theme}
                    containerStyle={S.fullWidthField}
                />
                <View style={S.fieldSpacing} />

                <LabeledDate
                    label={lang?.t('profile_date_of_birth')}
                    date={dateOfBirth}
                    onChange={setDateOfBirth}
                    theme={theme}
                />
                <View style={S.sectionSpacing} />

                <View style={S.sectionHeader}>
                    <Text style={S.sectionTitle}>{lang.t('profile_address')}</Text>
                    <Text style={S.sectionSubtitle}>{lang.t('profile_address_hint')}</Text>
                </View>
                <View style={S.fieldSpacing} />

                <LabeledSelectCountry
                    label={lang.t('profile_country')}
                    value={countryCode}
                    onChange={option => setCountryCode(option.value)}
                    theme={theme}
                />
                <View style={S.fieldSpacing} />

                <LabeledSelectState
                    label={lang.t('profile_state')}
                    countryCode={countryCode}
                    value={stateCode}
                    onChange={option => setStateCode(option.value)}
                    theme={theme}
                />
                <View style={S.fieldSpacing} />

                <LabeledSelectCity
                    label={lang.t('profile_city')}
                    countryCode={countryCode}
                    stateCode={stateCode}
                    value={cityName}
                    onChange={option => setCityName(option.value)}
                    theme={theme}
                />
                <View style={S.fieldSpacing} />

                <LabeledTextInput
                    label={lang.t('profile_full_address')}
                    value={fullAddress}
                    onChangeText={setFullAddress}
                    placeholder="Enter full address"
                    theme={theme}
                    multiline
                    numberOfLines={4}
                    containerStyle={S.fullWidthField}
                />

                <View style={S.sectionSpacing} />

                {/* FACES */}
                <View style={S.faceHeader}>
                    <View>
                        <Text style={S.sectionTitle}>{lang.t('profile_faces')}</Text>
                        <Text style={S.sectionSubtitle}>{lang.t('profile_faces_hint')}</Text>
                    </View>
                    <TouchableOpacity style={S.refreshButton} onPress={handleUploadFaceImage}>
                        <ReupImageIcon height={34} width={34} />
                    </TouchableOpacity>
                </View>

                <View style={S.faceGrid}>
                    <View style={S.faceItem}>
                        <Image source={{ uri: faces.left }} style={S.faceImage} />
                        <Text style={S.faceLabel}>{lang.t('profile_left_side_photo')}</Text>
                    </View>
                    <View style={S.faceItem}>
                        <Image source={{ uri: faces.front }} style={S.faceImage} />
                        <Text style={S.faceLabel}>{lang.t('profile_front_side_photo')}</Text>
                    </View>
                    <View style={S.faceItem}>
                        <Image source={{ uri: faces.right }} style={S.faceImage} />
                        <Text style={S.faceLabel}>{lang.t('profile_right_side_photo')}</Text>
                    </View>
                </View>
            </ScrollView>

            <View style={{ paddingHorizontal: 20, paddingBottom: 20 }}>
                <GradientButton text={lang.t('profile_button_update')} onPress={handleUpdate} />
            </View>
        </SafeAreaView>
    );
};

const makeStyles = (theme: any) =>
    StyleSheet.create({
        safeArea: {
            flex: 1,
            backgroundColor: theme.colors.background,
        },
        scroll: {
            flex: 1,
        },
        content: {
            paddingHorizontal: 20,
            paddingTop: theme.spacing(2),
        },
        photoWrapper: {
            alignItems: 'center',
            marginBottom: theme.spacing(3),
        },
        photoCard: {
            width: 160,
            height: 160,
            alignItems: 'center',
            justifyContent: 'center',
        },
        photo: {
            width: 140,
            height: 140,
            borderRadius: 20,
            backgroundColor: '#EFEFEF',
        },
        photoAction: {
            position: 'absolute',
            top: -2,
            right: -2,
            width: 34,
            height: 34,
            borderRadius: 17,
            backgroundColor: '#5F6AF4',
            alignItems: 'center',
            justifyContent: 'center',
        },
        uploadTitle: {
            marginTop: theme.spacing(2),
            fontSize: 15,
            fontWeight: '600',
            color: '#333333',
        },
        uploadHint: {
            marginTop: 4,
            fontSize: 12,
            color: '#6B6B6B',
            textAlign: 'center',
            maxWidth: 220,
        },
        fullWidthField: {
            flexBasis: '100%',
            minWidth: '100%',
        },
        fieldSpacing: {
            height: 16,
        },
        sectionSpacing: {
            height: 28,
        },
        sectionHeader: {
            gap: 4,
        },
        sectionTitle: {
            fontSize: 16,
            fontWeight: '700',
            color: '#333333',
        },
        sectionSubtitle: {
            fontSize: 12,
            color: '#8A8A8A',
        },
        faceHeader: {
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
        },
        refreshButton: {
            width: 34,
            height: 34,
            alignItems: 'center',
            justifyContent: 'center',
        },
        faceGrid: {
            flexDirection: 'row',
            flexWrap: 'wrap',
            gap: 16,
            marginTop: theme.spacing(2),
        },
        faceItem: {
            width: '30%',
            minWidth: 96,
            alignItems: 'center',
            gap: 8,
        },
        faceImage: {
            width: 96,
            height: 96,
            borderRadius: 16,
            backgroundColor: '#F1D7F7',
        },
        faceLabel: {
            fontSize: 12,
            color: '#6B6B6B',
        },
    });

export default PersonalInformationScreen;
