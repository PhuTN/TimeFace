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

type Props = NativeStackScreenProps<RootStackParamList, 'PersonalInformation'>;

const DEFAULT_COUNTRY_CODE = 'ID';
const DEFAULT_STATE_NAME = 'DKI Jakarta';
const DEFAULT_CITY_NAME = 'Jakarta Selatan';

const profileImage = 'https://i.pravatar.cc/200?img=64';

type FaceTriplet = { left: string; front: string; right: string };

const DEFAULT_FACES: FaceTriplet = {
    left: 'https://i.pravatar.cc/200?img=66',
    front: 'https://i.pravatar.cc/200?img=67',
    right: 'https://i.pravatar.cc/200?img=68',
};

const resolveDefaultLocation = () => {
    const countryCode = DEFAULT_COUNTRY_CODE;
    const states = State.getStatesOfCountry(countryCode);
    const pickedState =
        states.find(item => item.name === DEFAULT_STATE_NAME) ?? states[0] ?? null;
    const cities =
        pickedState
            ? City.getCitiesOfState(countryCode, pickedState.isoCode) ?? []
            : City.getCitiesOfCountry(countryCode) ?? [];
    const pickedCity =
        cities.find(item => item.name === DEFAULT_CITY_NAME) ?? cities[0] ?? null;

    return {
        countryCode,
        stateCode: pickedState?.isoCode ?? '',
        cityName: pickedCity?.name ?? '',
    };
};

const defaultLocation = resolveDefaultLocation();

const PersonalInformationScreen = ({ route, navigation }: Props) => {
    const insets = useSafeAreaInsets();
    const { loading, theme } = useUIFactory();

    const [firstName, setFirstName] = useState('Tonald');
    const [lastName, setLastName] = useState('Drump');
    const [dateOfBirth, setDateOfBirth] = useState(
        () => new Date(1997, 11, 10),
    );
    const [countryCode, setCountryCode] = useState(
        defaultLocation.countryCode,
    );
    const [stateCode, setStateCode] = useState(defaultLocation.stateCode);
    const [cityName, setCityName] = useState(defaultLocation.cityName);
    const [fullAddress, setFullAddress] = useState(
        'Jl Mampang Prapatan XIV No 7A, Jakarta Selatan 12790',
    );

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

    const [faces, setFaces] = useState<FaceTriplet>(DEFAULT_FACES);

    if (loading || !theme) {
        return null;
    }

    const S = makeStyles(theme);

    return (
        <SafeAreaView style={S.safeArea}>
            <HeaderBar
                title="Thong Tin Ca Nhan"
                onBack={() => navigation?.goBack?.()}
                topInset={insets.top}
            />

            <ScrollView
                style={S.scroll}
                contentContainerStyle={[
                    S.content,
                    { paddingBottom: insets.bottom + theme.spacing(3) },
                ]}
                showsVerticalScrollIndicator={false}>
                <View style={S.photoWrapper}>
                    <View style={S.photoCard}>
                        <Image source={{ uri: profileImage }} style={S.photo} />
                        <TouchableOpacity style={S.photoAction} onPress={() => { }}>
                            <ReupImageIcon height={34} width={34} />
                        </TouchableOpacity>
                    </View>
                    <Text style={S.uploadTitle}>Upload Photo</Text>
                    <Text style={S.uploadHint}>
                        Format should be in .jpeg .png at least 800x800px and less than 5MB
                    </Text>
                </View>

                <LabeledTextInput
                    label="First Name"
                    value={firstName}
                    onChangeText={setFirstName}
                    placeholder="Enter first name"
                    theme={theme}
                    containerStyle={S.fullWidthField}
                />
                <View style={S.fieldSpacing} />

                <LabeledTextInput
                    label="Last Name"
                    value={lastName}
                    onChangeText={setLastName}
                    placeholder="Enter last name"
                    theme={theme}
                    containerStyle={S.fullWidthField}
                />
                <View style={S.fieldSpacing} />

                <LabeledDate
                    label="Date of Birth"
                    date={dateOfBirth}
                    onChange={setDateOfBirth}
                    theme={theme}
                />
                <View style={S.sectionSpacing} />

                <View style={S.sectionHeader}>
                    <Text style={S.sectionTitle}>Address</Text>
                    <Text style={S.sectionSubtitle}>Your current domicile</Text>
                </View>
                <View style={S.fieldSpacing} />

                <LabeledSelectCountry
                    label="Country"
                    value={countryCode}
                    onChange={option => setCountryCode(option.value)}
                    theme={theme}
                />
                <View style={S.fieldSpacing} />

                <LabeledSelectState
                    label="State"
                    countryCode={countryCode}
                    value={stateCode}
                    onChange={option => setStateCode(option.value)}
                    theme={theme}
                />
                <View style={S.fieldSpacing} />

                <LabeledSelectCity
                    label="City"
                    countryCode={countryCode}
                    stateCode={stateCode}
                    value={cityName}
                    onChange={option => setCityName(option.value)}
                    theme={theme}
                />
                <View style={S.fieldSpacing} />

                <LabeledTextInput
                    label="Full Address"
                    value={fullAddress}
                    onChangeText={setFullAddress}
                    placeholder="Enter full address"
                    theme={theme}
                    multiline
                    numberOfLines={4}
                    containerStyle={S.fullWidthField}
                />

                <View style={S.sectionSpacing} />
                <View style={S.faceHeader}>
                    <View>
                        <Text style={S.sectionTitle}>Khuon mat</Text>
                        <Text style={S.sectionSubtitle}>Your current domicile</Text>
                    </View>
                    <TouchableOpacity style={S.refreshButton} onPress={() => { }}>
                        <ReupImageIcon height={34} width={34} />
                    </TouchableOpacity>
                </View>
                <View style={S.faceGrid}>
                    <View style={S.faceItem}>
                        <Image source={{ uri: faces.left }} style={S.faceImage} />
                        <Text style={S.faceLabel}>Ảnh mặt trái</Text>
                    </View>
                    <View style={S.faceItem}>
                        <Image source={{ uri: faces.front }} style={S.faceImage} />
                        <Text style={S.faceLabel}>Ảnh mặt thẳng</Text>
                    </View>
                    <View style={S.faceItem}>
                        <Image source={{ uri: faces.right }} style={S.faceImage} />
                        <Text style={S.faceLabel}>Ảnh mặt phải</Text>
                    </View>
                </View>
            </ScrollView>

            <View style={{ paddingHorizontal: 20, paddingBottom: 20 }}>
                <GradientButton
                    text="Cập nhật"
                    onPress={() => Alert.alert(`Cập nhật thành công`)}
                />
            </View>
        </SafeAreaView>
    );
}

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
            justifyContent: 'center'
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