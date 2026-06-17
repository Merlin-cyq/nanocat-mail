// =============================================
// 共享工具：JWT / 密码 / CORS
// =============================================

const JWT_SECRET = "REPLACE_WITH_YOUR_SECRET_KEY"; // 部署前请更换为一个长的随机字符串

// ---------- CORS ----------
export function corsHeaders() {
  return {
    "Access-Control-Allow-Origin": "https://nanocat.xin",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
    "Access-Control-Max-Age": "86400",
  };
}

export function handleOptions() {
  return new Response(null, { status: 204, headers: corsHeaders() });
}

// ---------- Password ----------
async function hashPassword(password, salt) {
  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw", encoder.encode(password), "PBKDF2", false, ["deriveBits"]
  );
  const bits = await crypto.subtle.deriveBits(
    { name: "PBKDF2", salt: encoder.encode(salt), iterations: 100000, hash: "SHA-256" },
    key, 256
  );
  return btoa(String.fromCharCode(...new Uint8Array(bits)));
}

export async function makeHash(password) {
  const salt = crypto.randomUUID();
  const hash = await hashPassword(password, salt);
  return `${salt}:${hash}`;
}

export async function verifyPassword(password, stored) {
  const [salt, hash] = stored.split(":");
  const attempt = await hashPassword(password, salt);
  return attempt === hash;
}

// ---------- JWT ----------
function base64url(str) {
  return btoa(str).replace(/\+/g, "-").replace(/\//g, "_").replace(/=/g, "");
}

export async function signJWT(payload) {
  const header = { alg: "HS256", typ: "JWT" };
  const now = Math.floor(Date.now() / 1000);
  const full = { ...payload, iat: now, exp: now + 86400 * 7 }; // 7 天有效
  const input = base64url(JSON.stringify(header)) + "." + base64url(JSON.stringify(full));
  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw", encoder.encode(JWT_SECRET),
    { name: "HMAC", hash: "SHA-256" }, false, ["sign"]
  );
  const sig = await crypto.subtle.sign("HMAC", key, encoder.encode(input));
  const sigStr = base64url(String.fromCharCode(...new Uint8Array(sig)));
  return input + "." + sigStr;
}

export async function verifyJWT(token) {
  try {
    const parts = token.split(".");
    if (parts.length !== 3) return null;
    const [headerB64, payloadB64, sigB64] = parts;
    const input = headerB64 + "." + payloadB64;
    const encoder = new TextEncoder();
    const key = await crypto.subtle.importKey(
      "raw", encoder.encode(JWT_SECRET),
      { name: "HMAC", hash: "SHA-256" }, false, ["verify"]
    );
    const sig = Uint8Array.from(atob(sigB64.replace(/-/g, "+").replace(/_/g, "/")), c => c.charCodeAt(0));
    const valid = await crypto.subtle.verify("HMAC", key, sig, encoder.encode(input));
    if (!valid) return null;
    const payload = JSON.parse(atob(payloadB64.replace(/-/g, "+").replace(/_/g, "/")));
    if (payload.exp < Math.floor(Date.now() / 1000)) return null;
    return payload;
  } catch {
    return null;
  }
}

// ---------- Auth helper ----------
export async function requireAuth(request) {
  const auth = request.headers.get("Authorization");
  if (!auth || !auth.startsWith("Bearer ")) return null;
  return await verifyJWT(auth.slice(7));
}

// ---------- JSON helpers ----------
export function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json", ...corsHeaders() },
  });
}

export function error(msg, status = 400) {
  return json({ error: msg }, status);
}
