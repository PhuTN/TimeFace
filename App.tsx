// App.tsx
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Linking, View } from 'react-native';
import Toast from 'react-native-toast-message';

import AppNavigator from './src/navigation/AppNavigator';
import { rehydrateAuth } from './src/bootstrap/rehydrateAuth';
import { navigationRef } from './src/navigation/NavigationService';
import { apiHandle } from './src/api/apihandle';
import { User } from './src/api/endpoint/User';
import { authStorage } from './src/services/authStorage';

export default function App() {
  const [ready, setReady] = useState(false);
  const [initialRoute, setInitialRoute] =
    useState<keyof import('./src/navigation/AppNavigator').RootStackParamList>(
      'Login',
    );

  // ===== 1. Rehydrate token + luôn GET /users/me mỗi lần mở app =====
  useEffect(() => {
    (async () => {
      const session = await rehydrateAuth(); // gắn token vào axios nếu còn hạn

      let userFromSession = session?.user ?? null;

      if (session?.token) {
        try {
          // 👉 gọi luôn /users/me để sync user mới nhất từ backend
          const { status, res } = await apiHandle
            .callApi(User.GetMe)
            .asPromise();
          console.log("USERRUSERR",res)
          if (!status.isError && res?.success && res.data?.user) {
            userFromSession = res.data.user;

            // lưu lại vào authStorage để những nơi khác dùng cũng có user mới
            await authStorage.save({
              token: session.token,
              user: userFromSession,
            });
          }
        } catch (e) {
          console.log('GetMe on app start error:', e);
        }
      }

      if (session?.token && userFromSession) {
        const user = userFromSession;
        const role = user.role;
        const subscriptionStatus = user.subscription_status || 'unactive';

        console.log('Session after getMe:', { token: session.token, user });

        // ===== Điều hướng theo role + subscription_status =====
        if (role === 'admin') {
          if (subscriptionStatus !== 'active') {
            setInitialRoute('SubscriptionPlans');
          } else {
            setInitialRoute('Home');
          }
        } else if (role === 'user') {
          if (subscriptionStatus !== 'active') {
            setInitialRoute('SubscriptionBlocked');
          } else {
            setInitialRoute('Home');
          }
        } else {
          // sys_admin hoặc role khác
          setInitialRoute('Home');
        }
      } else {
        // Không có token / user → Login
        setInitialRoute('Login');
      }

      setReady(true);
    })();
  }, []);

  // ===== 2. Handle deep link Stripe: timeface://stripe-success, timeface://stripe-cancel =====
  useEffect(() => {
    const handleStripeDeepLink = async (url: string) => {
      try {
        if (url.startsWith('timeface://stripe-success')) {
          // Sau khi thanh toán xong, GET /users/me để lấy subscription_status mới
          try {
            const { status, res } = await apiHandle
              .callApi(User.GetMe)
              .asPromise();

            if (!status.isError && res?.success && res.data?.user) {
              const user = res.data.user;
              console.log('🎉 Subscription updated, user:', user);

              // update lại storage
              const stored = await authStorage.load();
              await authStorage.save({
                token: stored?.token || null,
                user,
              });
            }
          } catch (e) {
            console.log('GetMe after stripe error:', e);
          }

          // reset về Home
          if (navigationRef.isReady()) {
            navigationRef.reset({
              index: 0,
              routes: [{ name: 'Home' as never }],
            });
          }

          Toast.show({
            type: 'success',
            text1: 'Thanh toán thành công',
            text2: 'Gói dịch vụ của bạn đã được kích hoạt.',
          });
        }

        if (url.startsWith('timeface://stripe-cancel')) {
          Toast.show({
            type: 'info',
            text1: 'Thanh toán bị hủy',
            text2: 'Bạn có thể chọn gói khác hoặc thử lại sau.',
          });
        }
      } catch (e) {
        console.log('Deep link handle error:', e);
      }
    };

    const onUrl = (event: { url: string }) => {
      handleStripeDeepLink(event.url);
    };

    // app đang mở mà nhận được link
    const sub = Linking.addEventListener('url', onUrl);

    // app được mở từ trạng thái tắt hẳn bằng link
    (async () => {
      const initUrl = await Linking.getInitialURL();
      if (initUrl) {
        handleStripeDeepLink(initUrl);
      }
    })();

    return () => {
      sub.remove();
    };
  }, []);

  // ===== 3. Loading state =====
  if (!ready) {
    return (
      <View
        style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}
      >
        <ActivityIndicator size="large" />
      </View>
    );
  }

  // ===== 4. App =====
  return (
    <>
      <AppNavigator initialRouteName={initialRoute} />
      <Toast />
    </>
  );
}
