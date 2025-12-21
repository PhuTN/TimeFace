import React, {useEffect, useMemo, useState} from 'react';
import {
  Image,
  SafeAreaView,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import {launchImageLibrary} from 'react-native-image-picker';
import Toast from 'react-native-toast-message';

import {useUIFactory} from '../ui/factory/useUIFactory';
import HeaderBar from '../components/common/HeaderBar';
import {CompanyEP} from '../api/endpoint/Company';
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
  const isReady = useMemo(() => !loading && !!theme, [loading, theme]);

  useEffect(() => {
    const run = async () => {
      try {
        const {status, res} = await apiHandle
          .callApi(CompanyEP.GetMyCompany)
          .asPromise();
        console.log('[CompanyScreen] GetMyCompany status', status, res);
        const c = res?.company || {};
        const imageList: string[] = Array.isArray(c.images)
          ? c.images
              .map(normalizeImage)
              .filter(Boolean)
          : [];
        setCompany({
          id: c.id || c._id,
          name: c.name || '',
          code: c.code || '',
          address: c.address || '',
          contact_email: c.contact_email || '',
          contact_phone: c.contact_phone || '',
          images: imageList,
        });
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
        Toast.show({
          type: 'success',
          text1: 'Tải ảnh thành công',
          text2: 'Logo/ảnh công ty đã được cập nhật.',
        });
      }
    } catch (e) {
      console.log('[CompanyScreen] upload error', e);
      Toast.show({
        type: 'error',
        text1: 'Tải ảnh thất bại',
        text2: e?.message || 'Vui lòng thử lại.',
      });
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      if (company.id) {
        const payload = {
          name: company.name,
          code: company.code,
          address: company.address,
          contact_email: company.contact_email,
          contact_phone: company.contact_phone,
          images: (company.images || []).map(normalizeImage).filter(Boolean),
        };
        const {status, res} = await apiHandle
          .callApi(CompanyEP.Update(company.id), payload)
          .asPromise();
        console.log('[CompanyScreen] Update company', status, res);
        if (!status.isError) {
          Toast.show({
            type: 'success',
            text1: 'Đã lưu',
            text2: 'Thông tin công ty đã được cập nhật.',
          });
        } else {
          Toast.show({
            type: 'error',
            text1: 'Lưu thất bại',
            text2: status.errorMessage || 'Không thể lưu thông tin.',
          });
        }
        // reload để sync ảnh hiện tại
        try {
          const {res: refreshed} = await apiHandle
            .callApi(CompanyEP.GetMyCompany)
            .asPromise();
          const c = refreshed?.company || {};
          const imageList: string[] = Array.isArray(c.images)
            ? c.images
                .map((img: any) => (typeof img === 'string' ? img : img?.url))
                .filter(Boolean)
            : [];
          setCompany(prev => ({
            ...prev,
            id: c.id || c._id || prev.id,
            name: c.name || prev.name,
            code: c.code || prev.code,
            address: c.address || prev.address,
            contact_email: c.contact_email || prev.contact_email,
            contact_phone: c.contact_phone || prev.contact_phone,
            images: imageList.length ? imageList : prev.images,
          }));
        } catch (err) {
          console.log('[CompanyScreen] refresh after save error', err);
        }
      } else {
        Toast.show({
          type: 'error',
          text1: 'Lưu thất bại',
          text2: 'Không tìm thấy công ty để lưu.',
        });
      }
    } catch (e) {
      console.log('[CompanyScreen] Update company error', e);
      Toast.show({
        type: 'error',
        text1: 'Lưu thất bại',
        text2: e?.message || 'Không thể lưu thông tin.',
      });
    } finally {
      setSaving(false);
    }
  };

  if (!isReady) return null;

  return (
    <SafeAreaView style={{flex: 1, backgroundColor: '#F6F7FB'}}>
      <HeaderBar title="Thông tin công ty" />
      <ScrollView
        style={{flex: 1}}
        contentContainerStyle={{padding: 16, paddingBottom: 40, gap: 12}}>
        {/* Images first */}
        <View
          style={{
            backgroundColor: '#FFF',
            borderRadius: 16,
            padding: 16,
            borderWidth: 1,
            borderColor: '#E5E7EB',
            gap: 12,
            alignItems: 'flex-start',
          }}>
          <Text style={{fontSize: 15, fontWeight: '700', color: '#111827'}}>
            Logo / Ảnh công ty
          </Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{width: '100%'}}>
            <View style={{flexDirection: 'row', gap: 10}}>
              {(company.images || []).map((url, idx) => (
                <Image
                  key={idx}
                  source={{uri: url}}
                  style={{
                    width: 120,
                    height: 120,
                    borderRadius: 16,
                    backgroundColor: '#F3F4F6',
                    borderWidth: 1,
                    borderColor: '#E5E7EB',
                  }}
                  resizeMode="cover"
                />
              ))}
              {(!company.images || company.images.length === 0) && (
                <View
                  style={{
                    width: 120,
                    height: 120,
                    borderRadius: 16,
                    backgroundColor: '#F3F4F6',
                    alignItems: 'center',
                    justifyContent: 'center',
                    borderWidth: 1,
                    borderColor: '#E5E7EB',
                  }}>
                  <Text style={{color: '#9CA3AF', fontSize: 12}}>Chưa có ảnh</Text>
                </View>
              )}
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

        {/* Basic info */}
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
              placeholder="Tên công ty"
              value={company.name}
              onChangeText={v => updateField('name', v)}
            />
          </Row>

          <Row label="Mã công ty">
            <TextInput
              style={inputStyle}
              placeholder="Code"
              value={company.code}
              onChangeText={v => updateField('code', v)}
            />
          </Row>

          <Row label="Địa chỉ">
            <TextInput
              style={inputStyle}
              placeholder="Địa chỉ"
              value={company.address}
              onChangeText={v => updateField('address', v)}
            />
          </Row>

          <Row label="Email liên hệ">
            <TextInput
              style={inputStyle}
              placeholder="contact@email.com"
              value={company.contact_email}
              onChangeText={v => updateField('contact_email', v)}
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </Row>

          <Row label="Số điện thoại">
            <TextInput
              style={inputStyle}
              placeholder="0123456789"
              value={company.contact_phone}
              onChangeText={v => updateField('contact_phone', v)}
              keyboardType="phone-pad"
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
          <Text style={{color: '#FFF', fontWeight: '800', fontSize: 15}}>
            {saving ? 'Đang lưu...' : 'Lưu thay đổi'}
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

export default CompanyScreen;
