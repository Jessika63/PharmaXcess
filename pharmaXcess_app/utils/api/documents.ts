import config from '../../config';

type ApiResult<T = any> = {
  ok: boolean;
  data?: T;
  status?: number;
  error?: string;
};

export async function getDocuments(userId: string | number): Promise<ApiResult<any[]>> {
  const url = `${config.backendUrl.replace(/\/$/, '')}/documents/${userId}`;
  try {
    const res = await fetch(url, { method: 'GET', credentials: 'include' });
    const json = await res.json().catch(() => ({}));
    if (res.ok) return { ok: true, data: json, status: res.status };
    return { ok: false, error: json?.error || json?.message || 'Request failed', status: res.status };
  } catch (error: any) {
    return { ok: false, error: error?.message || String(error) };
  }
}

// Upload a file using multipart/form-data. fileObj should contain { uri, name, type }
export async function uploadDocument(userId: string | number, fileObj: { uri: string; name?: string; type?: string }, title?: string): Promise<ApiResult<any>> {
  const url = `${config.backendUrl.replace(/\/$/, '')}/documents/${userId}`;
  try {
    const formData: any = new FormData();
    const name = fileObj.name || fileObj.uri.split('/').pop() || 'file';
    const type = fileObj.type || 'application/octet-stream';
    // For React Native fetch, file field is an object with uri, name and type
    formData.append('file', { uri: fileObj.uri, name, type } as any);
    if (title) formData.append('title', title);

    const res = await fetch(url, {
      method: 'POST',
      credentials: 'include',
      body: formData,
      // Do NOT set Content-Type header; let fetch set the multipart boundary
    });

    const json = await res.json().catch(() => ({}));
    if (res.ok) return { ok: true, data: json, status: res.status };
    return { ok: false, error: json?.error || json?.message || 'Upload failed', status: res.status };
  } catch (error: any) {
    return { ok: false, error: error?.message || String(error) };
  }
}

export default { getDocuments, uploadDocument };
