import React, { useState } from 'react';
import {
    SafeAreaView,
    ScrollView,
    StyleSheet,
    View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import HeaderBar from '../components/common/HeaderBar';
import LabeledTextInput from '../components/common/LabeledTextInput';
import LabeledDate from '../components/common/LabeledDate';
import { useUIFactory } from '../ui/factory/useUIFactory';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/AppNavigator';

type Props = NativeStackScreenProps<RootStackParamList, 'JobInformation'>;

const createDefaultDate = () => new Date(1997, 11, 10);

const JobInformationScreen = ({ route, navigation }: Props) => {
    const insets = useSafeAreaInsets();
    const { loading, theme } = useUIFactory();

    const [jobTitle, setJobTitle] = useState('Tonald');
    const [salary, setSalary] = useState('20.000.000');
    const [otRate, setOtRate] = useState('200.000');
    const [annualLeaveDays, setAnnualLeaveDays] = useState('15');
    const [contractStart, setContractStart] = useState<Date>(createDefaultDate);
    const [contractEnd, setContractEnd] = useState<Date>(createDefaultDate);

    if (loading || !theme) {
        return null;
    }

    const S = makeStyles(theme);

    return (
        <SafeAreaView style={S.safeArea}>
            <HeaderBar
                title={"Thông tin công việc"}
                onBack={() => navigation?.goBack?.()}
            />

            <ScrollView
                style={S.scroll}
                contentContainerStyle={[
                    S.content,
                    { paddingBottom: insets.bottom + theme.spacing(3) },
                ]}
                showsVerticalScrollIndicator={false}>
                <View style={S.formCard}>
                    <LabeledTextInput
                        label="Tên công việc"
                        value={jobTitle}
                        onChangeText={setJobTitle}
                        placeholder="Nhập tên công việc"
                        theme={theme}
                    />
                    <View style={S.fieldSpacing} />

                    <LabeledTextInput
                        label="Mức lương"
                        value={salary}
                        onChangeText={setSalary}
                        placeholder="VD: 20.000.000"
                        theme={theme}
                    />
                    <View style={S.fieldSpacing} />

                    <LabeledTextInput
                        label="Lương OT/Giờ"
                        value={otRate}
                        onChangeText={setOtRate}
                        placeholder="VD: 200.000"
                        theme={theme}
                    />
                    <View style={S.fieldSpacing} />

                    <LabeledTextInput
                        label="Số ngày phép trong năm"
                        value={annualLeaveDays}
                        onChangeText={setAnnualLeaveDays}
                        placeholder="VD: 15"
                        theme={theme}
                    />
                    <View style={S.fieldSpacing} />

                    <LabeledDate
                        label="Ngày bắt đầu hợp đồng"
                        date={contractStart}
                        onChange={setContractStart}
                        theme={theme}
                    />
                    <View style={S.fieldSpacing} />

                    <LabeledDate
                        label="Ngày kết thúc hợp đồng"
                        date={contractEnd}
                        onChange={setContractEnd}
                        theme={theme}
                    />
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}

const makeStyles = (theme: any) =>
    StyleSheet.create({
        safeArea: {
            flex: 1,
            backgroundColor: '#FFFFFF',
        },
        scroll: {
            flex: 1,
        },
        content: {
            paddingHorizontal: 20,
        },
        formCard: {
            backgroundColor: theme.colors.background,
            paddingVertical: 20,
            paddingHorizontal: 10,
            marginTop: theme.spacing(2),
        },
        fieldSpacing: {
            height: 16,
        },
    });

export default JobInformationScreen;