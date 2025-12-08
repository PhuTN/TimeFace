// src/api/uploadApi.ts
import AppConfig from '../appconfig/AppConfig';
import { authStorage } from '../services/authStorage';

/**
 * Upload 1 file lên BE (/api/upload)
 * @returns JSON trả về từ BE (url, public_id,...)
 */
export async function uploadSingle(fileUri: string, folder: string = 'uploads') {
  try {
    const cfg = AppConfig.getInstance().getConfig();
    const baseURL = cfg.apiUrl.replace(/\/+$/, ''); // bỏ dấu "/" cuối

    // Lấy token giống axios interceptor
    let token = cfg.authToken;
    if (!token) {
      try {
        token = await authStorage.getToken();
      } catch {
        token = null;
      }
    }

    // Chuẩn hóa file từ Image Picker
    const fileName = fileUri.split('/').pop() || `file_${Date.now()}.jpg`;
    const ext = fileName.split('.').pop();
    const mime = ext === 'png' ? 'image/png' : 'image/jpeg';

    const form = new FormData();

    form.append('file', {
      uri: fileUri,
      type: mime,
      name: fileName,
    } as any);

    form.append('folder', folder);

    console.log('[UPLOAD] → sending FormData');

    // ⚠️ phải dùng fetch, KHÔNG dùng axios instance
    const res = await fetch(`${baseURL}/upload`, {
      method: 'POST',
      body: form,
      headers: {
        Accept: 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        // ❌ KHÔNG SET Content-Type → fetch tự set boundary
      },
    });

    const json = await res.json();

    if (!res.ok) {
      throw new Error(json?.message || 'Upload failed');
    }

    console.log('[UPLOAD SUCCESS] ←', json);
    return json; // { success, url, public_id, ... }
  } catch (err) {
    console.log('[UPLOAD ERROR]:', err);
    throw err;
  }
}
