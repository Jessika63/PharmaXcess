import config from '../../config';

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

export default { uploadTempImage, uploadTempFile, getLastTempImage, getTempImageById, createOrdonnance, getOrdonnances, deleteOrdonnance };
