import React, {useEffect, useMemo, useState} from 'react';
import {
  Image,
  SafeAreaView,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  Switch,
} from 'react-native';
import {launchImageLibrary} from 'react-native-image-picker';
import Toast from 'react-native-toast-message';

import {useUIFactory} from '../ui/factory/useUIFactory';
import HeaderBar from '../components/common/HeaderBar';
import {CompanyEP} from '../api/endpoint/Company';
import {Stripe} from '../api/endpoint/Stripe';
import {apiHandle} from '../api/apihandle';
import {uploadSingle} from '../api/uploadApi';

type CompanyData = {
  id?: string;
  name?: string;
  code?: string;
  address?: string;
  contact_email?: string;
  contact_phone?: string;
  images?: string[];
  subscription_status?: string;
};

const normalizeImage = (img: any): string =>
  typeof img === 'string' ? img : img?.url || img?.uri || '';

const Row = ({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) => (
  <View style={{marginBottom: 14}}>
    <Text style={{fontSize: 13, fontWeight: '600', color: '#374151'}}>
      {label}
    </Text>
    <View style={{marginTop: 6}}>{children}</View>
  </View>
);

const inputStyle = {
  height: 44,
  borderRadius: 10,
  borderWidth: 1,
  borderColor: '#E5E7EB',
  paddingHorizontal: 12,
  backgroundColor: '#FFF',
  fontSize: 14,
  color: '#111827',
};

const CompanyScreen: React.FC = () => {
  const {loading, theme} = useUIFactory();
  const [company, setCompany] = useState<CompanyData>({});
  const [saving, setSaving] = useState(false);
  const [subEnabled, setSubEnabled] = useState(false);

  const isReady = useMemo(() => !loading && !!theme, [loading, theme]);

  useEffect(() => {
    const run = async () => {
      try {
        const {res} = await apiHandle
          .callApi(CompanyEP.GetMyCompany)
          .asPromise();

        const c = res?.company || {};
        const imageList: string[] = Array.isArray(c.images)
          ? c.images.map(normalizeImage).filter(Boolean)
          : [];

        setCompany({
          id: c.id || c._id,
          name: c.name || '',
          code: c.code || '',
          address: c.address || '',
          contact_email: c.contact_email || '',
          contact_phone: c.contact_phone || '',
          images: imageList,
          subscription_status: c.subscription_status,
        });

        setSubEnabled(c.subscription_status === 'active');
      } catch (e) {
        console.log('[CompanyScreen] GetMyCompany error', e);
      }
    };
    run();
  }, []);

  const updateField = (key: keyof CompanyData, value: any) => {
    setCompany(prev => ({...prev, [key]: value}));
  };

  const pickLogo = async () => {
    try {
      const res = await launchImageLibrary({mediaType: 'photo'});
      const uri = res.assets?.[0]?.uri;
      if (!uri) return;

      const uploaded = await uploadSingle(uri, 'company');
      const url = normalizeImage(uploaded?.url ? uploaded : uploaded?.data);

      if (url) {
        setCompany(prev => ({
          ...prev,
          images: [...(prev.images || []), url],
        }));
        Toast.show({type: 'success', text1: 'Tải ảnh thành công'});
      }
    } catch {
      Toast.show({type: 'error', text1: 'Tải ảnh thất bại'});
    }
  };

  /** 🔥 XÓA ẢNH (FE) */
  const removeImage = (index: number) => {
    setCompany(prev => ({
      ...prev,
      images: (prev.images || []).filter((_, i) => i !== index),
    }));
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      if (!company.id) return;

      const payload = {
        name: company.name,
        code: company.code,
        address: company.address,
        contact_email: company.contact_email,
        contact_phone: company.contact_phone,
        images: (company.images || []).map(normalizeImage).filter(Boolean),
      };

      const {status} = await apiHandle
        .callApi(CompanyEP.Update(company.id), payload)
        .asPromise();

      if (!status.isError) {
        Toast.show({
          type: 'success',
          text1: 'Đã lưu',
          text2: 'Thông tin công ty đã được cập nhật.',
        });
      }
    } finally {
      setSaving(false);
    }
  };

  const toggleSubscription = async (value: boolean) => {
    setSubEnabled(value);

    const endpoint = value
      ? Stripe.RenewSubscriptionDB
      : Stripe.CancelSubscriptionDB;

    const {status} = await apiHandle.callApi(endpoint).asPromise();

    if (!status.isError) {
      Toast.show({
        type: 'success',
        text1: value
          ? 'Đã kích hoạt subscription'
          : 'Đã hủy subscription',
      });
    }
  };

  if (!isReady) return null;

  return (
    <SafeAreaView style={{flex: 1, backgroundColor: '#F6F7FB'}}>
      <HeaderBar title="Thông tin công ty" />
      <ScrollView
        style={{flex: 1}}
        contentContainerStyle={{padding: 16, paddingBottom: 40, gap: 12}}>

        {/* ===== IMAGES ===== */}
        <View
          style={{
            backgroundColor: '#FFF',
            borderRadius: 16,
            padding: 16,
            borderWidth: 1,
            borderColor: '#E5E7EB',
            gap: 12,
          }}>
          <Text style={{fontSize: 15, fontWeight: '700'}}>
            Logo / Ảnh công ty
          </Text>

          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={{flexDirection: 'row', gap: 10}}>
              {(company.images || []).map((url, idx) => (
                <View key={idx} style={{position: 'relative'}}>
                  <Image
                    source={{uri: url}}
                    style={{
                      width: 120,
                      height: 120,
                      borderRadius: 16,
                      borderWidth: 1,
                      borderColor: '#E5E7EB',
                    }}
                  />

                  {/* ❌ NÚT XÓA */}
                  <TouchableOpacity
                    onPress={() => removeImage(idx)}
                    style={{
                      position: 'absolute',
                      top: 6,
                      right: 6,
                      width: 26,
                      height: 26,
                      borderRadius: 13,
                      backgroundColor: 'rgba(0,0,0,0.6)',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}>
                    <Text style={{color: '#FFF', fontWeight: '800'}}>✕</Text>
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          </ScrollView>

          <TouchableOpacity
            onPress={pickLogo}
            style={{
              paddingVertical: 10,
              paddingHorizontal: 14,
              borderRadius: 10,
              backgroundColor: '#2563EB',
            }}>
            <Text style={{color: '#FFF', fontWeight: '700'}}>Chọn ảnh</Text>
          </TouchableOpacity>
        </View>

        {/* ===== INFO ===== */}
        <View
          style={{
            backgroundColor: '#FFF',
            borderRadius: 16,
            padding: 16,
            borderWidth: 1,
            borderColor: '#E5E7EB',
          }}>
          <Row label="Tên công ty">
            <TextInput
              style={inputStyle}
              value={company.name}
              onChangeText={v => updateField('name', v)}
            />
          </Row>

          <Row label="Mã công ty">
            <TextInput
              style={inputStyle}
              value={company.code}
              onChangeText={v => updateField('code', v)}
            />
          </Row>

          <Row label="Địa chỉ">
            <TextInput
              style={inputStyle}
              value={company.address}
              onChangeText={v => updateField('address', v)}
            />
          </Row>

          <Row label="Email liên hệ">
            <TextInput
              style={inputStyle}
              value={company.contact_email}
              onChangeText={v => updateField('contact_email', v)}
            />
          </Row>

          <Row label="Số điện thoại">
            <TextInput
              style={inputStyle}
              value={company.contact_phone}
              onChangeText={v => updateField('contact_phone', v)}
            />
          </Row>
        </View>

        <TouchableOpacity
          onPress={handleSave}
          disabled={saving}
          style={{
            marginTop: 8,
            backgroundColor: saving ? '#9CA3AF' : '#2563EB',
            paddingVertical: 14,
            borderRadius: 12,
            alignItems: 'center',
          }}>
          <Text style={{color: '#FFF', fontWeight: '800'}}>
            {saving ? 'Đang lưu...' : 'Lưu thay đổi'}
          </Text>
        </TouchableOpacity>

        {/* ===== SUBSCRIPTION TOGGLE ===== */}
        <View
          style={{
            marginTop: 10,
            padding: 14,
            backgroundColor: '#FFF',
            borderRadius: 12,
            borderWidth: 1,
            borderColor: '#E5E7EB',
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}>
          <Text style={{fontSize: 14, fontWeight: '600'}}>
            Subscription
          </Text>
          <Switch
            value={subEnabled}
            onValueChange={toggleSubscription}
            trackColor={{false: '#E5E7EB', true: '#93C5FD'}}
            thumbColor={subEnabled ? '#2563EB' : '#9CA3AF'}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default CompanyScreen;
