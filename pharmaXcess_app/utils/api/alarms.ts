import config from '../../config';

type ApiResult<T = any> = {
  ok: boolean;
  data?: T;
  status?: number;
  error?: string;
};

async function requestJson<T = any>(url: string, opts: RequestInit = {}): Promise<ApiResult<T>> {
  try {
    const res = await fetch(url, { credentials: 'include', ...opts });
    const json = await res.json().catch(() => ({}));
    if (res.ok) return { ok: true, data: json, status: res.status };
    return { ok: false, error: json?.error || json?.message || 'Request failed', status: res.status };
  } catch (error: any) {
    return { ok: false, error: error?.message || String(error) };
  }
}

const base = config.backendUrl.replace(/\/$/, '');

export async function getAlarms(userId: string | number) {
  const url = `${base}/alarms/${userId}`;
  return requestJson(url, { method: 'GET' });
}

export async function createAlarm(payload: any) {
  const url = `${base}/alarms`;
  return requestJson(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
}

export async function updateAlarm(alarmId: string | number, payload: any) {
  const url = `${base}/alarms/${alarmId}`;
  return requestJson(url, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
}

export async function deleteAlarm(alarmId: string | number) {
  const url = `${base}/alarms/${alarmId}`;
  return requestJson(url, { method: 'DELETE' });
}

export async function toggleAlarm(alarmId: string | number) {
  const url = `${base}/alarms/${alarmId}/toggle`;
  return requestJson(url, { method: 'PUT' });
}

export default { getAlarms, createAlarm, updateAlarm, deleteAlarm, toggleAlarm };
