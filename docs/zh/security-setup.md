# Cloud 管理员和后端配置

更新：2026 年 9 月 5 日。

Cloud 版使用 React/Vite 前端、Vercel Node.js 后端接口和原有 Supabase PostgreSQL 数据库。学生无需登录，课表保存在自己的浏览器中。管理员在 /admin 输入一个用户名和密码即可维护网站，无需注册、邮箱认证或手动添加 Supabase 管理员名单。

## 日常使用

使用单独交付给项目所有者的账号密码。课程、公告、免责声明、站点设置和维护开关全部在 /admin 管理。公告日期统一按夏威夷时间 UTC−10 输入和显示。

## 首次配置与密码重置

使用 Node.js 24 和 npm ci 安装。新工作目录可从 .env.example 建立 .env.local，填写 Supabase 公开地址、公开 key 和仅供后端使用的 service role key。运行 npm run admin:setup 会生成随机密码，将登录资料保存至 .admin-credentials.txt，将用户名、密码哈希和会话密钥保存至 .env.local。这两个文件均被 Git 和 Vercel 上传规则排除。

Vercel 环境变量：

| 可用于浏览器 | 仅供后端 |
| --- | --- |
| VITE_SUPABASE_URL | SUPABASE_URL |
| VITE_SUPABASE_ANON_KEY | SUPABASE_SERVICE_ROLE_KEY |
| | ADMIN_USERNAME |
| | ADMIN_PASSWORD_HASH |
| | ADMIN_SESSION_SECRET |

管理员密码、哈希、会话密钥和 service role key 都不能使用 VITE_ 前缀，也不能提交 GitHub。npm run dev 同时提供前端和本地管理员接口；npm run preview 只预览静态页面。

需要更换密码时，先将原 .admin-credentials.txt 转存到安全位置，再运行 npm run admin:setup，更新 Vercel 的三个 ADMIN_ 变量并重新部署。无需邮箱找回或 Supabase 注册。

## 数据库更新顺序

本仓库的迁移针对现有项目数据库。迁移文件不是完整初始化备份；建立全新环境时应先恢复课程与原始数据库结构备份。

1. cloud_integrity_and_admin_api：增加学分、年级、时间等约束，以及后端专用登录限流。不会覆盖现有内容。
2. 配置 Vercel 环境变量，部署并验证新登录、课程保存和重新读取。
3. server_only_admin_writes：浏览器角色改为只读，全部修改都必须通过 Vercel 后端。原 Auth 记录保留，但不再具有网站管理权限。

旧 supabase/admin-security.sql 已停用，不再执行注册、权限重建或默认内容覆盖。

## 安全与维护

- 密码在后端通过 scrypt 验证，浏览器只能收到登录结果。
- 登录使用 HttpOnly Cookie，HTTPS 下使用 Secure，SameSite=Strict，八小时过期。
- 后端检查会话、同源请求、可操作表和字段、课程引用及数据格式；不接收任意 SQL。
- 每个 IP 分组每 15 分钟最多 10 次登录请求，全站最多 100 次。数据库仅保存不可直接还原的 HMAC 分组，超过一天的分组会被清理。限流服务故障时拒绝登录。
- Supabase 浏览器角色只有受 RLS 限制的读取权限。归档课程、隐藏公告和隐藏免责声明不会公开读取。
- 退出会清除浏览器 Cookie。若怀疑 Cookie 泄露，更换密码哈希或会话密钥并部署可使所有旧会话失效。
- 数据库权限切换后，旧 Supabase Auth 前端不能直接作为回滚版本；应回滚到仍包含新接口的版本，或从备份明确恢复旧权限。

发布前运行 npm test、npm run build，并验证浏览器和真实后端流程。服务器部署版仍是学校自托管的备用方案，本次更新只针对 Cloud 版。
