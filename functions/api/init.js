import { corsHeaders, handleOptions, makeHash, json, error } from "./_utils.js";

// 仅在数据库无用户时可用，用于初始化管理员
export async function onRequest(context) {
  if (context.request.method === "OPTIONS") return handleOptions();

  try {
    const db = context.env.DB;
    const count = await db.prepare("SELECT COUNT(*) as cnt FROM users").first();
    if (count.cnt > 0) return error("已初始化过，此接口不可再用", 403);

    const { email, password } = await context.request.json();
    if (!email || !password) return error("请提供邮箱和密码");

    const hash = await makeHash(password);
    await db.prepare("INSERT INTO users (email, password, role, status, created_at) VALUES (?, ?, ?, ?, ?)")
      .bind(email.toLowerCase(), hash, "admin", "approved", Date.now())
      .run();

    return json({ ok: true, message: "管理员账户创建成功" });
  } catch (e) {
    return error("初始化失败: " + e.message, 500);
  }
}
