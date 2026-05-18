# Kalani Course Compass 项目文档总览

更新日期：2026-05-18  
参考来源：当前代码仓库、V1-V5 历史报告、Vercel 项目状态、Supabase 项目/Advisor 检查。

## 1. 项目定位

Kalani Course Compass 是一个面向 Kalani High School 学生的非官方四年选课规划工具。核心目标是帮助学生：

- 浏览 2026-2027 课程目录；
- 理解先修课、并修课、年级限制和教师签名要求；
- 规划 9-12 年级课程；
- 实时追踪毕业要求、Honors Recognition 进度和选课冲突；
- 通过管理员后台维护课程、公告、免责声明和维护开关。

项目目前是 React + Vite 单页应用，部署在 Vercel，数据主要来自 Supabase PostgreSQL，并保留本地静态课程数据作为 fallback。学生的个人四年规划只保存在浏览器 `localStorage`，不会上传到服务器。

## 2. 版本演进摘要

### V1

- 完成纯前端原型。
- 支持 Home、Course Catalog、4-Year Planner。
- 课程数据硬编码在前端。
- 主要解决“新生/转学生不知道怎么选课”的基础痛点。

### V2

- 课程库扩展到 139 门课程。
- 增加 `localStorage` 持久化、先修课警告、移动端适配、Honors 追踪、Off Campus 卡片、年级课程上限。
- 修复 elective overflow、课程分类、Miscellaneous 审计等规则问题。

### V3

- 基于 2026-2027 官方 Course Catalog 完整刷新课程数据。
- 增加 `concurrentOk`、`gradeReqs`、子分类筛选、首页搜索补全。
- 首次接入 Supabase，用于公告与课程评分。
- 明确后续学校接入路线：iframe 先行，subdomain/学校服务器为长期目标。

### V4

- 将 139 门课程迁移到 Supabase `courses` 表。
- 增加 `/admin` 后台：Announcements、Courses、Ratings。
- 修复 Supabase 数据排序、course adapter、CSV import。
- 当时 Admin 仍是硬编码登录，后续计划迁移到 Supabase Auth。

### V5 / 当前阶段

- 评分公开展示已按学校顾问建议移除，当前数据库也不再保留 `ratings` 表作为活跃模块。
- Admin 登录已迁移到 Supabase Auth + `public.admin_users` + RLS。
- 新增 `disclaimer_items` 与 `page_maintenance` 管理。
- 解决 ALG1 middle school prior credit 相关问题，加入自定义课程、Course Match、维护开关、免责声明弹窗。
- 当前代码比 V5 报告时更大：`App.jsx` 已约 2151 行，`utils.jsx` 约 888 行，`CoursePanel.jsx` 约 926 行，进入需要继续模块化整理的阶段。

## 3. 当前架构

### 前端

- 框架：React 18 + Vite 5。
- 入口：`src/main.jsx`。
- 学生端：`src/App.jsx`。
- 管理端：`src/admin/AdminApp.jsx`，通过 URL `/admin` lazy-load。
- 动画：Framer Motion。
- 样式：主要是 JSX 内联样式和局部 `<style>` 字符串。

### 数据层

- Supabase client：`src/supabase.js`。
- 浏览器安全环境变量：
  - `VITE_SUPABASE_URL`
  - `VITE_SUPABASE_ANON_KEY`
- 服务端专用变量：
  - `SUPABASE_SERVICE_ROLE_KEY`
- 当前没有自建 Node/Express API，也没有 Supabase Edge Functions。

### 部署层

- Vercel 项目：`kalani-course-compass`。
- Framework：Vite。
- 生产域名：`kalani-course-compass.vercel.app`。
- `vercel.json` 只做 SPA rewrite：所有路由回到 `index.html`。

### 数据流

1. 页面加载时，`src/supabase.js` 判断环境变量是否齐全。
2. `useCourseData()` 从 Supabase `courses` 表读取非归档课程。
3. 如果 Supabase 不可用，学生端继续使用 `src/lib/data.js` 内的静态 `COURSES`。
4. App 级别把 Supabase 课程与学生自定义课程合并为 `allCourses`。
5. 规划、先修课、Honors、毕业要求等计算都在浏览器端完成。
6. Admin 端所有写入都依赖 Supabase Auth session 和数据库 RLS。

## 4. 当前文件结构评估

### 合理的部分

- `src/admin/` 已经把后台与学生端分开，这是正确方向。
- `src/supabase.js` 单独隔离 Supabase client，便于 fallback。
- `src/lib/data.js` 保留静态 fallback，对学校演示和 Supabase 临时不可用很友好。
- `supabase/admin-security.sql` 把 RLS、表、默认数据集中管理，便于新项目重建。
- `vercel.json` 简洁，适合 Vite SPA 的 `/admin` 路由。

### 主要问题

- `src/App.jsx` 过大，学生端页面、样式、状态、业务流程、弹窗都在一个文件里，后续修改容易牵一发动全身。
- `src/lib/utils.jsx` 混合了纯业务逻辑、Supabase hooks、UI 组件和动画配置，职责过宽。
- `src/admin/CoursePanel.jsx` 同时包含 CSV parser、列表、搜索、表单、导入弹窗和 Supabase 写入逻辑，已经接近单文件上限。
- `src/lib/data.js` 同时放课程、毕业要求、荣誉规则、默认计划、Course Match templates，未来更新时容易冲突。
- 缺少 `docs/`、测试目录和正式 Supabase migration 历史。

### 模块切割结论

当前模块切割“能用，而且适合快速迭代”，但“不够适合长期交接和多人维护”。如果目标是学校接手或长期运营，建议进入渐进式模块化，不需要一次大重构。

优先拆分顺序：

1. `src/lib/utils.jsx` 先拆纯逻辑，因为最容易测试、风险最低。
2. `src/admin/CoursePanel.jsx` 拆 CSV/import/form 子模块。
3. `src/App.jsx` 按页面拆 Home、Catalog、Course Match、Planner。
4. `src/lib/data.js` 拆 requirements、course templates、static courses。

建议目标结构：

```text
src/
  main.jsx
  supabase.js
  App.jsx
  pages/
    HomePage.jsx
    CatalogPage.jsx
    CourseMatchPage.jsx
    PlannerPage.jsx
  components/
    course/
      CourseCard.jsx
      CourseModal.jsx
      CourseSearch.jsx
    planner/
      PlannerGrid.jsx
      PlannerGradeColumn.jsx
      GradeBtn.jsx
    shared/
      AnimatedProgressBar.jsx
      DataCitationFooter.jsx
      DataDisclaimerModal.jsx
      MaintenanceNotice.jsx
  hooks/
    useCourseData.js
    useAnnouncements.js
    useDisclaimerItems.js
    usePageMaintenance.js
    useLocalStorageState.js
  lib/
    courseAdapter.js
    courseSearch.js
    plannerRules.js
    graduationRules.js
    honorsRules.js
    url.js
  data/
    courses.js
    requirements.js
    courseMatchTemplates.js
    constants.js
  admin/
    AdminApp.jsx
    AdminLogin.jsx
    panels/
      AnnPanel.jsx
      CoursePanel.jsx
      DisclaimerPanel.jsx
      MaintenancePanel.jsx
    components/
      CourseForm.jsx
      CourseImportModal.jsx
      AdminToast.jsx
    lib/
      courseCsv.js
```

## 5. 开发规范建议

### 代码风格

- 继续使用 JSX + 双引号。
- 不引入新的 UI 框架，除非有明确设计迁移计划。
- 保持 Supabase unconfigured fallback，不要让本地开发因为缺 env 直接崩溃。
- 新增课程规则时，优先写成纯函数，而不是埋在 JSX 事件里。
- 所有 planner add/remove 路径都要统一经过同一套容量、重复、先修课和核心科目冲突检查。

### 数据规则

- 课程 ID 必须稳定，Course Match template 只能引用真实课程 ID 或明确的 custom ID。
- `archived` 课程只隐藏，不删除。
- `desc` 是 SQL 关键字，数据库中继续按现状保留 quoted column 或后续迁移时改名。
- `grade_reqs` 只展示提醒，不做成绩验证。
- `localStorage` key 改动必须提供迁移或容错。

### Git / 发布

- `main` 代表生产域名。
- 功能分支可以触发 Vercel preview，但不要默认认为 preview 已上线到生产。
- 合并前至少运行 `npm run build`。
- 修改 Supabase SQL 后要运行 Supabase Advisor，并记录安全/性能结果。

### 文档

- `AGENT.md` 给 AI/开发者快速读。
- `README.md` 给项目入口和常用命令。
- 本文件记录产品、架构、路线图、维护风险。
- `SECURITY_SETUP.md` 保留面向部署/管理员的安全配置说明。

## 6. 安全检查

### 已做得比较好的点

- 前端只使用 anon key，未发现 `VITE_` 暴露 service role key。
- `.gitignore` 已忽略 `.env` 和 `.env.*`，保留 `.env.example`。
- Admin 已从硬编码密码迁移到 Supabase Auth。
- 写权限由 `public.admin_users` + RLS 控制，前端 gating 不是唯一安全层。
- 所有公开表都启用了 RLS。
- 外链公告使用 `safeExternalUrl()` 限制为 `http:` / `https:`。

### Supabase Advisor 结果

Security:

- `auth_leaked_password_protection`：Leaked Password Protection 关闭。建议在 Supabase Auth 中启用泄露密码保护。参考：https://supabase.com/docs/guides/auth/password-security#password-strength-and-leaked-password-protection

Performance:

- 多个 RLS policy 直接调用 `auth.uid()`，Advisor 建议改为 `(select auth.uid())`，减少每行重复计算。参考：https://supabase.com/docs/guides/database/database-linter?lint=0003_auth_rls_initplan
- `courses`、`announcements`、`disclaimer_items` 对 `authenticated SELECT` 存在 multiple permissive policies。建议合并或改写 policy，避免重复执行。参考：https://supabase.com/docs/guides/database/database-linter?lint=0006_multiple_permissive_policies

### 需要继续关注

- `admin-security.sql` 是 setup script，不是正式 migration 历史。长期建议建立 `supabase/migrations/`。
- `SUPABASE_SERVICE_ROLE_KEY` 可保留在本地或 Vercel server-only env，但绝不能加 `VITE_`。
- 当前 GitHub Actions keep-alive 暴露 Supabase project ref。project ref 本身不是 secret，但应确认这符合项目隐私预期。
- Admin 操作中部分 toggle/archive 写入没有完整错误反馈，建议补齐。

## 7. 性能检查

### 已有优化

- `main.jsx` lazy-load 学生端和 Admin 端，避免一次性加载所有后台代码。
- `vite.config.js` 用 manual chunks 拆出 `react-vendor`、`supabase`、`motion`。
- 课程搜索使用预构建 search index 和 `useMemo`。
- Supabase course fetch 限制 500 条，对当前 140 条课程足够。
- 学生 planner 数据留在本地，无需服务端 round trip。

### 风险点

- `App.jsx` 内联样式和大组件会增加维护成本，不一定是运行性能瓶颈，但会拖慢开发。
- `utils.jsx` 同时导出 UI 和纯函数，后续测试/打包边界不清楚。
- 大量 UI 状态集中在 `App.jsx`，页面间改动容易触发全局 re-render。
- Google Fonts 通过 CSS `@import` 加载，性能上不如在 `index.html` 使用 preconnect/link 或本地化字体。
- 缺少自动测试，业务规则回归只能靠人工点页面。

### 建议

- 为 `calcPlannerCredits`、`calcWlfa`、`getUnmetPrereqs`、`computeHonorsProgress` 增加单元测试。
- 把纯函数从 `utils.jsx` 拆到 `.js` 文件，减少 React 组件耦合。
- 对课程数据、搜索、planner 规则建立测试 fixtures。
- 合并/优化 RLS policies 后再次跑 Supabase Advisor。

## 8. 云端状态检查

### Vercel

- 项目：`kalani-course-compass`
- Framework：Vite
- 生产域名：`kalani-course-compass.vercel.app`
- 生产部署：READY，指向 `main` 分支。
- 当前开发分支 `course_match&custom_course` 有 READY preview 部署，但生产域名尚未指向该分支。
- Vercel 项目 Node version：24.x。

### Supabase

- 项目：`Lemonkyle's Project-kalani course compass`
- Project ref：`lqraykjysrncablhscrk`
- 状态：`ACTIVE_HEALTHY`
- Region：`us-east-1`
- Postgres：17.6
- 当前 public tables：
  - `courses`：RLS on，约 140 行
  - `announcements`：RLS on，约 3 行
  - `admin_users`：RLS on，约 1 行
  - `disclaimer_items`：RLS on，约 5 行
  - `page_maintenance`：RLS on，约 4 行
- Edge Functions：无
- 活跃评分表：未发现 `ratings` 表，和当前“评分已移除/暂停”状态一致。

## 9. 路线图

### P0：稳定与文档

- 更新 `README.md`、`AGENT.md` 和本项目文档。
- 跑通 `npm run build`。
- 确认 production/main 与 preview branch 的发布策略。
- 修正 Supabase Advisor 的安全/性能警告。

### P1：模块化与测试

- 拆 `utils.jsx` 纯逻辑到 `plannerRules.js`、`courseSearch.js`、`courseAdapter.js`。
- 为核心规则增加测试。
- 拆 `CoursePanel.jsx` 的 CSV 解析和表单。
- 把 `App.jsx` 页面级 UI 分离为 page/components。

### P2：产品功能

- HOC / Summer School 课程支持。
- Dual Credit / Running Start 信息整合。
- GPA calculator，注意必须明确“估算，不替代官方 GPA”。
- Course Match 模板继续补充 counselor-approved 路径。
- 评分展示是否恢复，等待学校正式批准。

### P3：学校交接

- 非技术管理员操作手册。
- Supabase schema/migration 文档。
- 年度课程数据更新流程。
- 学校网站 iframe 或 subdomain 接入方案。
- Principal / counselor / CS teacher endorsement 材料。

## 10. 维护结论

项目当前架构适合继续迭代，也已经具备真实使用的基础安全模型。最大短板不是“能不能跑”，而是长期维护时文件过大、业务规则缺少测试、Supabase SQL 缺少正式 migration 历史。

建议策略是渐进式整理：先文档化，再抽纯逻辑和测试，最后拆 UI 页面。这样不会打断当前功能，也能让项目慢慢从“学生快速迭代作品”升级为“学校可接手维护的工具”。
