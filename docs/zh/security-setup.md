# Kalani Compass 安全配置

更新日期：2026-05-23

## 本地开发

在项目根目录创建 `.env.local`。该文件已被 git 忽略。

```env
VITE_SUPABASE_URL=https://your-project-ref.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-public-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

React 前端只会读取 `VITE_SUPABASE_URL` 和 `VITE_SUPABASE_ANON_KEY`。`SUPABASE_SERVICE_ROLE_KEY` 只能用于服务端或本地管理工具。不要给 service role key 添加 `VITE_` 前缀，因为 Vite 会把所有 `VITE_` 变量暴露到浏览器。

## Vercel

在 Vercel Project Settings 中配置：

```env
VITE_SUPABASE_URL
VITE_SUPABASE_ANON_KEY
```

不要添加 `VITE_SUPABASE_SERVICE_ROLE_KEY`。如果未来服务端函数确实需要 service role key，应命名为 `SUPABASE_SERVICE_ROLE_KEY`，并确保只在服务端读取。

## 后台权限

后台使用 Supabase Auth。登录用户只有在 `public.admin_users` 表中存在对应记录时，才可以管理数据。

创建 Supabase Auth 管理员用户后，在 Supabase SQL Editor 运行 `supabase/admin-security.sql`。运行前把 `YOUR_ADMIN_EMAIL@example.com` 替换成真实管理员邮箱。

真正的安全边界在数据库层：

- 学生只能读取 active courses 和 visible announcements。
- 只有通过 Auth 且属于管理员名单的用户可以新增、更新或删除后台内容。
- 前端不能再存储硬编码后台密码。

## 文档维护

如果修改 Auth、RLS、环境变量或后台权限行为，需要同步更新本文档和对应英文文件 `docs/en/security-setup.md`。
