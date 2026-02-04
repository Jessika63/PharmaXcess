import config from '../../config';
import * as FileSystem from 'expo-file-system/legacy';

type ApiResult<T = any> = {
  ok: boolean;
  data?: T;
  status?: number;
  error?: string;
};

export async function uploadTempImage(userId: string | number, imageBase64: string, filename?: string, mime_type?: string): Promise<ApiResult<any>> {
  const url = `${config.backendUrl.replace(/\/$/, '')}/clickcollect/upload_temp_image`;
  try {
    const body = { user_id: userId, filename, image_base64: imageBase64, mime_type };
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(body)
    });
    const json = await res.json().catch(() => ({}));
    if (res.ok) return { ok: true, data: json, status: res.status };
    return { ok: false, error: json?.error || json?.message || 'Upload failed', status: res.status };
  } catch (error: any) {
    return { ok: false, error: error?.message || String(error) };
  }
}

export async function uploadTempFile(userId: string | number, fileUri: string, filename?: string, mime_type?: string): Promise<ApiResult<any>> {
  const url = `${config.backendUrl.replace(/\/$/, '')}/clickcollect/upload_temp_image`;
  try {
    const form = new FormData();
    form.append('user_id', String(userId));
    if (filename) form.append('filename', filename);
    if (mime_type) form.append('mime_type', mime_type);
    // @ts-ignore - React Native FormData file object
    form.append('file', { uri: fileUri, name: filename || 'photo.jpg', type: mime_type || 'image/jpeg' });

    const res = await fetch(url, {
      method: 'POST',
      body: form,
      credentials: 'include',
      headers: {
        Accept: 'application/json',
      },
    });
    const json = await res.json().catch(() => ({}));
    if (res.ok) return { ok: true, data: json, status: res.status };
    return { ok: false, error: json?.error || json?.message || 'Upload failed', status: res.status };
  } catch (error: any) {
    return { ok: false, error: error?.message || String(error) };
  }
}

export async function getLastTempImage(userId: string | number): Promise<ApiResult<any>> {
  const url = `${config.backendUrl.replace(/\/$/, '')}/clickcollect/temp_image?user_id=${encodeURIComponent(String(userId))}`;
  try {
    const res = await fetch(url, { method: 'GET', credentials: 'include' });
    const json = await res.json().catch(() => ({}));
    if (res.ok) return { ok: true, data: json, status: res.status };
    return { ok: false, error: json?.error || json?.message || 'Request failed', status: res.status };
  } catch (error: any) {
    return { ok: false, error: error?.message || String(error) };
  }
}

export async function getTempImageById(imageId: string | number): Promise<ApiResult<any>> {
  const url = `${config.backendUrl.replace(/\/$/, '')}/clickcollect/temp_image?image_id=${encodeURIComponent(String(imageId))}`;
  try {
    const res = await fetch(url, { method: 'GET', credentials: 'include' });
    const json = await res.json().catch(() => ({}));
    if (res.ok) return { ok: true, data: json, status: res.status };
    return { ok: false, error: json?.error || json?.message || 'Request failed', status: res.status };
  } catch (error: any) {
    return { ok: false, error: error?.message || String(error) };
  }
}

export async function createOrdonnance(payload: any): Promise<ApiResult<any>> {
  const url = `${config.backendUrl.replace(/\/$/, '')}/ordonnances/create`;
  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(payload)
    });
    const json = await res.json().catch(() => ({}));
    if (res.ok) return { ok: true, data: json, status: res.status };
    return { ok: false, error: json?.error || json?.message || 'Create failed', status: res.status };
  } catch (error: any) {
    return { ok: false, error: error?.message || String(error) };
  }
}

export async function createOrdonnanceByImage(userId: string | number, tempImageId?: string | number, fileUri?: string, imageBase64?: string): Promise<ApiResult<any>> {
  const url = `${config.backendUrl.replace(/\/$/, '')}/ordonnances/create_by_image`;
  try {
    // Si on a un fileUri, on le convertit en base64 avec expo-file-system
    if (fileUri && !imageBase64) {
      try {
        imageBase64 = await FileSystem.readAsStringAsync(fileUri, { 
          encoding: FileSystem.EncodingType.Base64 
        });
        // Ajouter le préfixe data:image/jpeg;base64,
        imageBase64 = `data:image/jpeg;base64,${imageBase64}`;
      } catch (fsError: any) {
        console.error('FileSystem read error:', fsError);
        return { ok: false, error: `Failed to read image file: ${fsError.message}` };
      }
    }

    // Envoi en JSON (plus fiable avec Flask/CORS)
    const body: any = { user_id: userId };
    if (tempImageId) body.temp_image_id = tempImageId;
    if (imageBase64) body.image_base64 = imageBase64;

    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(body)
    });
    const json = await res.json().catch(() => ({}));
    if (res.ok) return { ok: true, data: json, status: res.status };
    // Include detail if available for debugging OCR errors
    const errorMsg = json?.error || json?.message || 'Create by image failed';
    const detail = json?.detail ? `\n\nDétail: ${JSON.stringify(json.detail, null, 2)}` : '';
    return { ok: false, error: errorMsg + detail, status: res.status };
  } catch (error: any) {
    return { ok: false, error: error?.message || String(error) };
  }
}

export async function getOrdonnances(userId: string | number): Promise<ApiResult<any[]>> {
  const url = `${config.backendUrl.replace(/\/$/, '')}/ordonnances?user_id=${encodeURIComponent(String(userId))}`;
  try {
    const res = await fetch(url, { method: 'GET', credentials: 'include' });
    const json = await res.json().catch(() => ({}));
    if (res.ok) return { ok: true, data: json?.ordonnances || json, status: res.status };
    return { ok: false, error: json?.error || json?.message || 'Request failed', status: res.status };
  } catch (error: any) {
    return { ok: false, error: error?.message || String(error) };
  }
}

export async function deleteOrdonnance(userId: string | number, ordonnanceId: string | number): Promise<ApiResult<any>> {
  const url = `${config.backendUrl.replace(/\/$/, '')}/ordonnances/delete`;
  try {
    const res = await fetch(url, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ user_id: userId, ordonnance_id: ordonnanceId })
    });
    const json = await res.json().catch(() => ({}));
    if (res.ok) return { ok: true, data: json, status: res.status };
    return { ok: false, error: json?.error || json?.message || 'Delete failed', status: res.status };
  } catch (error: any) {
    return { ok: false, error: error?.message || String(error) };
  }
}

export default { uploadTempImage, uploadTempFile, getLastTempImage, getTempImageById, createOrdonnance, createOrdonnanceByImage, getOrdonnances, deleteOrdonnance };
