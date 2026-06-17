import { corsHeaders, handleOptions, makeHash, json, error } from "./_utils.js";

export async function onRequest(context) {
  if (context.request.method === "OPTIONS") return handleOptions();

  try {
    const { email, password } = await context.request.json();
    if (!email || !password) return error("邮箱和密码不能为空");

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) return error("邮箱格式不正确");

    if (password.length < 6) return error("密码至少 6 位");

    const db = context.env.DB;

    // 检查是否已注册
    const existing = await db.prepare("SELECT id FROM users WHERE email = ?").bind(email.toLowerCase()).first();
    if (existing) return error("该邮箱已注册");

    const hash = await makeHash(password);
    await db.prepare("INSERT INTO users (email, password, role, status, created_at) VALUES (?, ?, ?, ?, ?)")
      .bind(email.toLowerCase(), hash, "user", "pending", Date.now())
      .run();

    return json({ ok: true, message: "注册成功，请等待管理员审核" });
  } catch (e) {
    return error("注册失败: " + e.message, 500);
  }
}
