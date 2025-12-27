import config from '../../config';

type ApiResult<T = any> = {
  ok: boolean;
  data?: T;
  status?: number;
  error?: string;
};

async function postJson<T = any>(url: string, body: any): Promise<ApiResult<T>> {
  try {
    const res = await fetch(url, {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    const json = await res.json().catch(() => ({}));
    if (res.ok) return { ok: true, data: json, status: res.status };
    return { ok: false, error: json?.error || json?.message || 'Request failed', status: res.status };
  } catch (error: any) {
    return { ok: false, error: error?.message || String(error) };
  }
}

export async function generateProfileQr(utilisateur_id: string | number) {
  const url = `${config.backendUrl.replace(/\/$/, '')}/generate_profile_qr`;
  return postJson(url, { utilisateur_id });
}
export async function readProfileQrContent(content: string, scan_role: 'distributeur' | 'medecin' | 'pharmacien') {
  const url = `${config.backendUrl.replace(/\/$/, '')}/read_profile_qr_content`;
  return postJson(url, { content, scan_role });
}

// Default export containing helpers for backward compatibility with imports like `import qrApi from '../utils/api/qr'`.
const qrApi = {
  generateProfileQr,
  readProfileQrContent,
};

export default qrApi;
