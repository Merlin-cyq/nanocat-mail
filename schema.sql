-- 用户表
CREATE TABLE IF NOT EXISTS users (
  id         INTEGER PRIMARY KEY AUTOINCREMENT,
  email      TEXT NOT NULL UNIQUE,
  password   TEXT NOT NULL,
  role       TEXT NOT NULL DEFAULT 'user',   -- 'admin' | 'user'
  status     TEXT NOT NULL DEFAULT 'pending', -- 'pending' | 'approved' | 'rejected'
  created_at INTEGER NOT NULL
);

-- 预置管理员（密码为 nanocat2026，部署前请修改）
-- 执行方式：wrangler d1 execute nanocat-db --file=schema.sql
