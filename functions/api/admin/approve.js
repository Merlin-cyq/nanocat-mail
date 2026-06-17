import { corsHeaders, handleOptions, requireAuth, json, error } from "../_utils.js";

export async function onRequest(context) {
  if (context.request.method === "OPTIONS") return handleOptions();

  const payload = await requireAuth(context.request);
  if (!payload || payload.role !== "admin") return error("无权访问", 403);

  try {
    const { userId, action } = await context.request.json(); // action: "approved" | "rejected"
    if (!userId || !["approved", "rejected"].includes(action)) {
      return error("参数错误：需要 userId 和 action (approved/rejected)");
    }

    const db = context.env.DB;
    const user = await db.prepare("SELECT id FROM users WHERE id = ?").bind(userId).first();
    if (!user) return error("用户不存在", 404);

    await db.prepare("UPDATE users SET status = ? WHERE id = ?").bind(action, userId).run();

    return json({ ok: true, action });
  } catch (e) {
    return error("操作失败: " + e.message, 500);
  }
}
