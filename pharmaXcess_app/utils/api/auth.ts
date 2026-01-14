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
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    // Try to parse JSON response; if parsing fails, fallback to raw text
    let json: any = {};
    let textBody: string | null = null;
    try {
      json = await res.json();
    } catch (e) {
      try {
        textBody = await res.text();
      } catch (e2) {
        textBody = null;
      }
    }

    if (res.ok) {
      return { ok: true, data: json || (textBody as any) || undefined, status: res.status };
    }

    const backendError = json?.error || json?.message || textBody || res.statusText || 'Request failed';
    return { ok: false, error: backendError, status: res.status };
  } catch (error: any) {
    return { ok: false, error: error?.message || String(error) };
  }
}

export async function login(email: string, password: string) {
  const url = `${config.backendUrl.replace(/\/$/, '')}/login`;
  return postJson(url, { email, password });
}

export async function register(nom: string, prenom: string, email: string, password: string) {
  const url = `${config.backendUrl.replace(/\/$/, '')}/register`;
  return postJson(url, { nom, prenom, email, password });
}

export async function forgotPassword(email: string) {
  const url = `${config.backendUrl.replace(/\/$/, '')}/forgot_password`;
  return postJson(url, { email });
}

export async function resetPassword(token: string, newPassword: string) {
  const url = `${config.backendUrl.replace(/\/$/, '')}/reset_password`;
  return postJson(url, { token, new_password: newPassword });
}

export async function logout() {
  const url = `${config.backendUrl.replace(/\/$/, '')}/logout`;
  try {
    const res = await fetch(url, { method: 'POST', credentials: 'include' });
    if (res.ok) return { ok: true };
    const json = await res.json().catch(() => ({}));
    return { ok: false, error: json?.error || 'Logout failed' };
  } catch (error: any) {
    return { ok: false, error: error?.message || String(error) };
  }
}

export default { login, register, forgotPassword, resetPassword, logout };
