const API_BASE = process.env.REACT_APP_API_URL || "/api";

export function getMailConfigHeader() {
  try {
    const settings = JSON.parse(localStorage.getItem("dopamind-settings") || "{}");
    if (!settings.imap?.host) return {};
    const config = { ...settings.imap, smtp: settings.smtp };
    return { "X-Mail-Config": btoa(JSON.stringify(config)) };
  } catch {
    return {};
  }
}

export async function apiFetch(path, options = {}) {
  const mailHeaders = path.startsWith("/mail") ? getMailConfigHeader() : {};
  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...mailHeaders,
      ...options.headers,
    },
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error || `HTTP ${res.status}`);
  }
  return res.json();
}
