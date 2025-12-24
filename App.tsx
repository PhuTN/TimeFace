// App.tsx
import React, {useEffect, useState} from 'react';
import {ActivityIndicator, View, Linking, LogBox} from 'react-native';

import {SafeAreaProvider} from 'react-native-safe-area-context';
import Toast from 'react-native-toast-message';

import {apiHandle} from './src/api/apihandle';
import {User} from './src/api/endpoint/User';
import {rehydrateAuth} from './src/bootstrap/rehydrateAuth';
import AppNavigator from './src/navigation/AppNavigator';

import {authStorage} from './src/services/authStorage';

import {AppReloadProvider, useAppReload} from './src/context/AppReloadContext';

import AppConfig from './src/appconfig/AppConfig';
import {socketService} from './services/socketService';

import {navigationRef} from './src/navigation/NavigationService';

LogBox.ignoreAllLogs(true);
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
    let mounted = true;

    (async () => {
      const session = await rehydrateAuth();
      let user = session?.user ?? null;

      // set token vào AppConfig trước khi call API
      if (session?.token) {
        AppConfig.getInstance().setAuthToken(session.token, {
          rebuildAxios: true,
        });
        try {
          const {status, res} = await apiHandle.callApi(User.GetMe).asPromise();
          if (!status.isError && res?.success && res.data?.user) {
            user = res.data.user;
            await authStorage.save({token: session.token, user});
          }
        } catch {}
      }

      // ✅ socket connect nếu có user
      if (user?._id) {
        await socketService.connect(); // tự lấy apiUrl & _id từ storage
      } else {
        socketService.disconnect();
      }

      if (mounted) setReady(true);
    })();

    return () => {
      mounted = false;
      // unmount root -> đảm bảo ngắt socket nếu không còn dùng
      socketService.disconnect();
    };
  }, [reloadKey]); // 🔥 reload toàn app khi reloadKey đổi

  // Deep link stripe
  useEffect(() => {
    const handleStripeDeepLink = async (url: string) => {
      try {
        if (url.startsWith('timeface://stripe-success')) {
          const {res} = await apiHandle.callApi(User.GetMe).asPromise();
          if (res?.success && res.data?.user) {
            const stored = await authStorage.load();
            await authStorage.save({
              token: stored?.token || '',
              user: res.data.user,
            });
          }

          Toast.show({
            type: 'success',
            text1: 'Thanh toán thành công',
            text2: 'Gói dịch vụ đã được kích hoạt.',
          });

          // sau khi cập nhật user -> đảm bảo socket còn sống
          await socketService.connect();

          // ✅ Navigate to Home after successful payment
          setTimeout(() => {
            if (navigationRef.isReady()) {
              navigationRef.navigate('HomeAdmin');
            }
          }, 500);
        }

        if (url.startsWith('timeface://stripe-cancel')) {
          Toast.show({
            type: 'info',
            text1: 'Thanh toán bị hủy',
            text2: 'Bạn có thể thử lại sau.',
          });

          // ✅ User stays on SubscriptionPlans screen (no navigation needed)
        }
      } catch {}
    };

    const sub = Linking.addEventListener('url', e =>
      handleStripeDeepLink(e.url),
    );
    return () => sub.remove();
  }, []);

  if (!ready) {
    return (
      <View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return <AppNavigator initialRouteName={initialRoute} />;
}

// ======================= APP MAIN =======================
function AppContent() {
  const [initialRoute, setInitialRoute] =
    useState<keyof import('./src/navigation/AppNavigator').RootStackParamList>(
      'Login',
    );

  const [checking, setChecking] = useState(true);

  const {reloadKey} = useAppReload(); // 🔥 CHỈ DÙNG reloadKey

  useEffect(() => {
    (async () => {
      const session = await rehydrateAuth();
      let user = session?.user ?? null;

      if (session?.token) {
        // đảm bảo axios có token trước khi GetMe
        AppConfig.getInstance().setAuthToken(session.token, {
          rebuildAxios: true,
        });
        try {
          const {res} = await apiHandle.callApi(User.GetMe).asPromise();
          if (res?.success && res.data?.user) {
            user = res.data.user;
            await authStorage.save({token: session.token, user});
          }
        } catch {}
      }

      if (session?.token && user) {
        const role = user.role;
        const subscriptionStatus = user.subscription_status || 'unactive';

        if (role === 'admin') {
          setInitialRoute(
            subscriptionStatus !== 'active' && subscriptionStatus !== 'canceled' ? 'SubscriptionPlans' : 'HomeAdmin',
          );
        } else if (role === 'user') {
          setInitialRoute(
            subscriptionStatus !== 'active' && subscriptionStatus !== 'canceled' ? 'SubscriptionBlocked' : 'Home',
          );
        } else {
          setInitialRoute('CompanyDashboard');
        }
      } else {
        setInitialRoute('Login');
      }

      setChecking(false);
    })();
  }, []);

  if (checking) {
    return (
      <View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  // ❗ Không có ScrollView nữa → RootApp sẽ remount đúng khi reloadKey đổi
  return <RootApp initialRoute={initialRoute} reloadKey={reloadKey} />;
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
