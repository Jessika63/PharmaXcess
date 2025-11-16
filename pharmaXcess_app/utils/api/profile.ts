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

export async function registerSubprofile(name: string, profile_type: string, main_profile_id: string | number, email?: string) {
  const url = `${config.backendUrl.replace(/\/$/, '')}/register/subprofile`;
  const body: any = { name, profile_type, main_profile_id };
  if (email) body.email = email;
  return postJson(url, body);
}

// We'll export default at the end after all helpers are declared

export async function getInfos(userId: string | number) {
  const url = `${config.backendUrl.replace(/\/$/, '')}/infos/${userId}`;
  return getJson(url);
}

export async function getDiseases() {
  const url = `${config.backendUrl.replace(/\/$/, '')}/diseases`;
  return getJson(url);
}

export async function getAllergies() {
  const url = `${config.backendUrl.replace(/\/$/, '')}/allergy`;
  return getJson(url);
}

export async function createDisease(body: any) {
  const url = `${config.backendUrl.replace(/\/$/, '')}/diseases`;
  return postJson(url, body);
}

export async function deleteDisease(diseaseId: string | number) {
  const url = `${config.backendUrl.replace(/\/$/, '')}/disease/entry/${diseaseId}`;
  try {
    const res = await fetch(url, {
      method: 'DELETE',
      credentials: 'include',
    });
    const json = await res.json().catch(() => ({}));
    if (res.ok) return { ok: true, data: json, status: res.status };
    return { ok: false, error: json?.error || json?.message || 'Request failed', status: res.status };
  } catch (error: any) {
    return { ok: false, error: error?.message || String(error) };
  }
}

export async function updateDisease(diseaseId: string | number, body: any) {
  const url = `${config.backendUrl.replace(/\/$/, '')}/disease/entry/${diseaseId}`;
  try {
    const res = await fetch(url, {
      method: 'PUT',
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

export async function updateInfos(userId: string | number, body: any) {
  const url = `${config.backendUrl.replace(/\/$/, '')}/infos/${userId}`;
  try {
    const res = await fetch(url, {
      method: 'PUT',
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

// Export a default object containing all helpers
const api = { getAccessibleProfiles, switchProfile, registerSubprofile, getInfos, getDiseases, getAllergies, updateInfos, createDisease, deleteDisease, updateDisease };
export default api;
