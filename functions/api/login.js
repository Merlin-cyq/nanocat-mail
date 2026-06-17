import { corsHeaders, handleOptions, verifyPassword, signJWT, json, error } from "./_utils.js";

export async function onRequest(context) {
  if (context.request.method === "OPTIONS") return handleOptions();

  try {
    const { email, password } = await context.request.json();
    if (!email || !password) return error("邮箱和密码不能为空");

    const db = context.env.DB;
    const user = await db.prepare("SELECT * FROM users WHERE email = ?").bind(email.toLowerCase()).first();
    if (!user) return error("邮箱或密码错误", 401);

    if (user.status === "pending") return error("账户正在审核中，请耐心等待", 403);
    if (user.status === "rejected") return error("账户申请已被拒绝", 403);

    const valid = await verifyPassword(password, user.password);
    if (!valid) return error("邮箱或密码错误", 401);

    const token = await signJWT({ sub: user.id, email: user.email, role: user.role });

    return json({
      ok: true,
      token,
      user: {
        email: user.email,
        role: user.role,
        displayName: user.email.split("@")[0],
      },
    });
  } catch (e) {
    return error("登录失败: " + e.message, 500);
  }
}
