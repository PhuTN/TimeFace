// App.tsx
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  View,
  Linking,
} from 'react-native';

import Toast from 'react-native-toast-message';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import AppNavigator from './src/navigation/AppNavigator';
import { rehydrateAuth } from './src/bootstrap/rehydrateAuth';
import { apiHandle } from './src/api/apihandle';
import { User } from './src/api/endpoint/User';
import { authStorage } from './src/services/authStorage';

import {
  AppReloadProvider,
  useAppReload,
} from './src/context/AppReloadContext';

// ======================= ROOT APP =======================
function RootApp({
  initialRoute,
  reloadKey,
}: {
  initialRoute: string;
  reloadKey: number;
}) {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    (async () => {
      const session = await rehydrateAuth();
      let user = session?.user ?? null;

      if (session?.token) {
        try {
          const { status, res } = await apiHandle.callApi(User.GetMe).asPromise();
          if (!status.isError && res?.success && res.data?.user) {
            user = res.data.user;
            await authStorage.save({ token: session.token, user });
          }
        } catch {}
      }

      setReady(true);
    })();
  }, [reloadKey]); // 🔥 reload toàn app khi reloadKey đổi

  // Deep link stripe
  useEffect(() => {
    const handleStripeDeepLink = async (url: string) => {
      try {
        if (url.startsWith('timeface://stripe-success')) {
          const { res } = await apiHandle.callApi(User.GetMe).asPromise();
          if (res?.success && res.data?.user) {
            const stored = await authStorage.load();
            await authStorage.save({
              token: stored?.token || null,
              user: res.data.user,
            });
          }

          Toast.show({
            type: 'success',
            text1: 'Thanh toán thành công',
            text2: 'Gói dịch vụ đã được kích hoạt.',
          });
        }

        if (url.startsWith('timeface://stripe-cancel')) {
          Toast.show({
            type: 'info',
            text1: 'Thanh toán bị hủy',
            text2: 'Bạn có thể thử lại sau.',
          });
        }
      } catch {}
    };

    const sub = Linking.addEventListener('url', e => handleStripeDeepLink(e.url));
    return () => sub.remove();
  }, []);

  if (!ready) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return <AppNavigator initialRouteName={initialRoute} />;
}



// ======================= APP MAIN =======================
function AppContent() {
  const [initialRoute, setInitialRoute] =
    useState<keyof import('./src/navigation/AppNavigator').RootStackParamList>('Login');

  const [checking, setChecking] = useState(true);

  const { reloadKey } = useAppReload(); // 🔥 CHỈ DÙNG reloadKey

  useEffect(() => {
    (async () => {
      const session = await rehydrateAuth();
      let user = session?.user ?? null;

      if (session?.token) {
        try {
          const { res } = await apiHandle.callApi(User.GetMe).asPromise();
          if (res?.success && res.data?.user) {
            user = res.data.user;
            await authStorage.save({ token: session.token, user });
          }
        } catch {}
      }

      if (session?.token && user) {
        const role = user.role;
        const subscriptionStatus = user.subscription_status || 'unactive';

        if (role === 'admin') {
          setInitialRoute(
            subscriptionStatus !== 'active'
              ? 'SubscriptionPlans'
              : 'Home'
          );
        } else if (role === 'user') {
          setInitialRoute(
            subscriptionStatus !== 'active'
              ? 'SubscriptionBlocked'
              : 'Home'
          );
        } else {
          setInitialRoute('Home');
        }
      } else {
        setInitialRoute('Login');
      }

      setChecking(false);
    })();
  }, []);

  if (checking) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  // ❗ Không có ScrollView nữa → RootApp sẽ remount đúng khi reloadKey đổi
  return (
    <RootApp initialRoute={initialRoute} reloadKey={reloadKey} />
  );
}



// ======================= WRAPPER =======================
export default function App() {
  return (
    <>
      <SafeAreaProvider>
        <AppReloadProvider>
          <AppContent />
        </AppReloadProvider>
      </SafeAreaProvider>

      <Toast topOffset={40} />
    </>
  );
}
