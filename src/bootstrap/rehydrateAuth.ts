// src/bootstrap/rehydrateAuth.ts
import { AppConfig } from "../appconfig";
import { authStorage } from "../services/authStorage";
import { jwtDecode } from "jwt-decode";

type JwtPayload = {
  exp?: number;
  iat?: number;
  [key: string]: any;
};

/**
 * Gọi ở App.tsx trước khi render UI.
 * Trả về:
 *   - { token, user } nếu token còn hạn
 *   - null nếu không có token / token hết hạn (đã clear giúp luôn)
 */
export async function rehydrateAuth() {
  try {
    const saved = await authStorage.load();

    if (saved?.token) {
      let decoded: JwtPayload | null = null;
      try {
        decoded = jwtDecode<JwtPayload>(saved.token);
        console.log(decoded)
      } catch {
        console.warn("⚠️ Token decode failed");
      }

      const nowSec = Math.floor(Date.now() / 1000);
      const isExpired = decoded?.exp && decoded.exp <= nowSec;

      if (isExpired) {
        console.log("🔐 Token expired — clearing session...");
        await authStorage.clear();
        AppConfig.getInstance().setAuthToken(null, { rebuildAxios: true });
        return null;
      }

      // Token còn hạn -> attach lại vào axios
      AppConfig.getInstance().setAuthToken(saved.token, { rebuildAxios: true });
      return saved;
    }

    // Không có session => rebuild lại axios (xóa Authorization)
    AppConfig.getInstance().rebuildAxios();
    return null;
  } catch (err) {
    console.error("rehydrateAuth error:", err);
    AppConfig.getInstance().rebuildAxios();
    return null;
  }
}
