# Cloud 更新与部署记录

本次更新在 GitHub PR #27 合并，正式域名为 https://kalani-course-compass.vercel.app，管理员入口为 /admin。

主要修复包括：同一种外语累计两学分、统一年级/容量/重复课程检查、移除错误的同学科年度限制、历史课程快照、本地损坏数据备份恢复、公告夏威夷时间、空内容处理、保存错误反馈、严格 CSV 校验，以及独立的毕业学分编辑。

六个课程模板已改为明确的参考方案，并按当前 139 门课程检查年级、先修顺序及毕业学分类别。外部课程项目仍只支持普通自定义记录。Course Match 原有维护开关保持开启；学校服务器备用版未改动。

管理员后台现在使用一个用户名和密码，无需邮箱注册、认证或 Supabase 管理员名单。Vercel 后端验证登录和编辑，Supabase 保存原有业务数据；浏览器角色只有读取权限。

验证记录：

- 32 项自动测试通过，生产构建通过，依赖检查未报告漏洞。
- GitHub 自动测试/构建和 Vercel 部署检查通过。
- 浏览器验证课程添加/移除、管理员登录、公告编辑、独立毕业学分保存和重新读取。
- 正式域名验证登录、会话、退出、全部五类管理数据读取和课程保存后重新读取。线上保存检查使用原值，没有修改课程内容。
- Supabase 验证匿名与已登录浏览器角色仅有 SELECT，登录限流前十次允许、第十一次拒绝；性能检查没有剩余提醒。

安全检查仍提示旧 Supabase Auth 未启用泄露密码检查，但新后台不使用该认证服务，旧账号没有管理权限。两项“启用 RLS 但无策略”的信息来自明确禁止浏览器访问的旧管理员表及私有登录限流表。这是预期的拒绝访问设置。[Supabase RLS 检查说明](https://supabase.com/docs/guides/database/database-linter?lint=0008_rls_enabled_no_policy)、[旧 Auth 密码检查说明](https://supabase.com/docs/guides/auth/password-security#password-strength-and-leaked-password-protection)。

账号密码单独保存在项目所有者本地的 .admin-credentials.txt，不包含在 GitHub 或部署上传文件中。后续账号和发布维护请阅读 [security-setup.md](security-setup.md)。
