import config from '../../config';

type ApiResult<T = any> = {
  ok: boolean;
  data?: T;
  status?: number;
  error?: string;
};

async function getJson<T = any>(url: string): Promise<ApiResult<T>> {
  try {
    const res = await fetch(url, {
      method: 'GET',
      credentials: 'include',
    });
    const json = await res.json().catch(() => ({}));
    if (res.ok) return { ok: true, data: json, status: res.status };
    return { ok: false, error: json?.error || json?.message || 'Request failed', status: res.status };
  } catch (error: any) {
    return { ok: false, error: error?.message || String(error) };
  }
}

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

export async function getAccessibleProfiles() {
  const url = `${config.backendUrl.replace(/\/$/, '')}/accessible_profiles`;
  return getJson(url);
}

export async function switchProfile(newProfileId: string | number) {
  const url = `${config.backendUrl.replace(/\/$/, '')}/switch_profile`;
  return postJson(url, { new_profile_id: newProfileId });
}

export async function registerSubprofile(nom: string, prenom: string, profile_type: string, main_profile_id: string | number, email?: string) {
  const url = `${config.backendUrl.replace(/\/$/, '')}/register/subprofile`;
  const body: any = { nom, prenom, profile_type, main_profile_id };
  if (email) body.email = email;
  return postJson(url, body);
}

const api = { getAccessibleProfiles, switchProfile, registerSubprofile };
export default api;
