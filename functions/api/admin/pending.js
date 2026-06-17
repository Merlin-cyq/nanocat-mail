import { corsHeaders, handleOptions, requireAuth, json, error } from "../_utils.js";

export async function onRequest(context) {
  if (context.request.method === "OPTIONS") return handleOptions();

  const payload = await requireAuth(context.request);
  if (!payload || payload.role !== "admin") return error("无权访问", 403);

  const db = context.env.DB;
  const users = await db.prepare("SELECT id, email, status, created_at FROM users WHERE status = 'pending' ORDER BY created_at DESC").all();

  return json({ users: users.results });
}
