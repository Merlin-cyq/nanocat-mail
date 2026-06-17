import { corsHeaders, handleOptions, requireAuth, json, error } from "./_utils.js";

export async function onRequest(context) {
  if (context.request.method === "OPTIONS") return handleOptions();

  const payload = await requireAuth(context.request);
  if (!payload) return error("未登录", 401);

  const db = context.env.DB;
  const user = await db.prepare("SELECT email, role, status FROM users WHERE id = ?").bind(payload.sub).first();
  if (!user) return error("用户不存在", 404);

  return json({
    email: user.email,
    role: user.role,
    status: user.status,
    displayName: user.email.split("@")[0],
  });
}
