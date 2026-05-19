# Kalani Course Compass 项目文档

更新日期：2026-05-18

## 产品概览

Kalani Course Compass 是一个面向 Kalani High School 学生的非官方四年选课规划工具。它帮助学生浏览课程目录、理解先修课和并修规则、规划 9-12 年级课程、追踪毕业学分，并查看 Course Match 推荐路径。

项目以学生端体验为主，同时提供后台用于维护课程、公告、免责声明和页面维护开关。

## 当前架构

| 区域 | 职责 |
| --- | --- |
| `src/main.jsx` | React 入口，按 `/admin` 懒加载学生端或后台，并包含运行时错误恢复界面。 |
| `src/App.jsx` | 学生端外壳，负责页面组装、导航、公告横幅、弹窗挂载和共享动作串联。 |
| `src/pages/` | 学生端页面：Home、Catalog、Planner、Course Match。 |
| `src/components/` | 按 `course`、`planner`、`match`、`shared` 分类的 UI 组件。 |
| `src/components/shared/AppStyles.jsx` | 学生端全局样式和响应式规则。 |
| `src/hooks/` | Supabase 读取、本地 planner 持久化、课程搜索/筛选、启动免责声明和临时 UI 状态 hooks。 |
| `src/lib/` | 纯业务逻辑：课程排序/搜索、planner 学分、先修规则、honors 规则、安全 URL 等。 |
| `src/data/` | 静态 fallback 数据、毕业要求、常量、免责声明、Course Match 模板。 |
| `src/admin/` | 后台应用和管理面板。 |
| `supabase/` | Supabase RLS 和管理员权限初始化 SQL。 |
| `docs/en`, `docs/zh` | 英文和中文维护文档。 |

## 数据流

1. `src/supabase.js` 只在存在 `VITE_SUPABASE_URL` 和 `VITE_SUPABASE_ANON_KEY` 时创建 Supabase client。
2. `useCourseData()` 从 Supabase 读取未归档课程；如果 Supabase 不可用，则 fallback 到 `src/data/courses.js`。
3. `usePlannerStorage()` 管理浏览器本地 planner、prior credits、自定义课程和稳定卡片 ID。
4. `useCourseCatalog()` 合并 Supabase 课程和本地自定义课程，建立课程查询、首页搜索、目录筛选和 planner 添加搜索。
5. 启动免责声明的关闭状态保存在浏览器 `localStorage`。
6. 毕业学分、先修课、容量限制、Honors 计算都通过 `src/lib/` 的纯函数在浏览器端完成。
7. 后台写入依赖 Supabase Auth 和数据库 RLS 策略，不依赖前端隐藏按钮作为安全边界。

## 模块化状态

学生端第一阶段维护性重构已经完成：

- `src/App.jsx` 缩小为学生端外壳、页面组装和共享动作串联。
- 学生端页面移入 `src/pages/`。
- 大型弹窗移入对应领域组件目录。
- `src/lib/utils.jsx` 已删除，职责拆到 `src/lib/`、`src/hooks/`、`src/components/shared/`。
- `src/lib/data.js` 已删除，静态数据拆到 `src/data/`。
- planner 本地持久化拆到 `src/hooks/usePlannerStorage.js`。
- 课程查询、搜索和目录筛选拆到 `src/hooks/useCourseCatalog.js`。
- 启动免责声明状态拆到 `src/hooks/useStartupDisclaimer.js`。
- toast 和 planner shake 临时反馈拆到 `src/hooks/useTransientUi.js`。
- 学生端全局样式拆到 `src/components/shared/AppStyles.jsx`。
- 人类阅读文档按语言放到 `docs/en/` 和 `docs/zh/`。

## 维护建议

- 新学生端页面放到 `src/pages/`，只通过 page context 接收必要状态和动作。
- 真正跨领域复用的 UI 才放进 `src/components/shared/`。
- 业务规则优先写成 `src/lib/*.js` 中的纯函数。
- Supabase 读取逻辑放到 `src/hooks/`，Supabase client 初始化只放在 `src/supabase.js`。
- 静态 fallback 数据放在 `src/data/`，课程 ID 必须保持稳定。
- 不要随意修改 `localStorage` key；如果必须修改，需要提供迁移或兼容读取逻辑。
- 更新维护行为或目录职责时，同步更新英文和中文文档。

## 后续路线

- 下一阶段优先拆分 `src/admin/CoursePanel.jsx`：CSV 解析、表单字段、列表控制、Supabase 写入动作。
- 为 planner 学分、先修课、课程搜索、Honors 进度增加基础测试。
- 考虑建立正式的 `supabase/migrations/` 历史。
- Course Match 模板后续应尽量来自 counselor-approved 路径，或明确标注为参考建议。
