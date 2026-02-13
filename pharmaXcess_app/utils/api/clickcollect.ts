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

async function getJson<T = any>(url: string): Promise<ApiResult<T>> {
  try {
    const res = await fetch(url, { method: 'GET', credentials: 'include' });
    const json = await res.json().catch(() => ({}));
    if (res.ok) return { ok: true, data: json, status: res.status };
    return { ok: false, error: json?.error || json?.message || 'Request failed', status: res.status };
  } catch (error: any) {
    return { ok: false, error: error?.message || String(error) };
  }
}

export async function getPendingRequests(userId?: string | number) {
  const base = `${config.backendUrl.replace(/\/$/, '')}/clickcollect/requests`;
  const url = userId ? `${base}?user_id=${encodeURIComponent(String(userId))}` : base;
  return getJson(url);
}

export async function sendOrder(userId: string | number, ordonnanceId: string | number) {
  const url = `${config.backendUrl.replace(/\/$/, '')}/clickcollect/send`;
  return postJson(url, { user_id: userId, ordonnance_id: ordonnanceId });
}

export async function getUserCommands(userId: string | number) {
  const url = `${config.backendUrl.replace(/\/$/, '')}/clickcollect/commands?user_id=${encodeURIComponent(String(userId))}`;
  return getJson(url);
}

export async function validateOrder(orderId: string | number) {
  const url = `${config.backendUrl.replace(/\/$/, '')}/clickcollect/validate`;
  return postJson(url, { order_id: orderId });
}

export async function refuseOrder(orderId: string | number, reason?: string) {
  const url = `${config.backendUrl.replace(/\/$/, '')}/clickcollect/refuse`;
  return postJson(url, { order_id: orderId, reason });
}

export async function getOrderStatus(orderId: string | number) {
  const url = `${config.backendUrl.replace(/\/$/, '')}/clickcollect/status?order_id=${encodeURIComponent(String(orderId))}`;
  return getJson(url);
}

export default { getPendingRequests, sendOrder, getUserCommands, validateOrder, refuseOrder, getOrderStatus };
