// src/navigation/NavigationService.ts
import { createNavigationContainerRef, CommonActions } from "@react-navigation/native";
import type { RootStackParamList } from "./AppNavigator";

export const navigationRef = createNavigationContainerRef<RootStackParamList>();

export function resetToLogin() {
  if (!navigationRef.isReady()) {
    console.warn("Navigation not ready yet.");
    return;
  }

  navigationRef.dispatch(
    CommonActions.reset({
      index: 0,
      routes: [{ name: "Login" }],
    })
  );
}

export function resetToHome() {
  if (!navigationRef.isReady()) {
    console.warn("Navigation not ready yet.");
    return;
  }

  navigationRef.dispatch(
    CommonActions.reset({
      index: 0,
      routes: [{ name: "Home" }],
    })
  );
}
