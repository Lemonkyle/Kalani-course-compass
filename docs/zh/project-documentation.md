# Kalani Course Compass 项目文档

更新日期：2026-09-05

## 产品概览

Kalani Course Compass 是一个面向 Kalani High School 学生的非官方四年选课规划工具。它帮助学生浏览课程目录、理解先修课和并修规则、规划 9-12 年级课程、追踪毕业学分，并查看 Course Match 推荐路径。

项目以学生端体验为主，同时提供后台用于维护课程、公告、免责声明和页面维护开关。

当前范围主要是 Kalani 校内课程规划。HOC、dual credit、Running Start、Early College、IB 等不建立专门的资格、学分转换或荣誉认定逻辑；学生可以把相关课程作为普通 custom 课程记录。AP 进度仅按课程的 AP 标记统计，不自动推断校外项目等价关系。

World Language 要求同一种语言累计 2 学分。不同语言分别累计，只取最高的一组计入该要求，其余按现有逻辑进入选修学分。当前目录依据稳定的课程代码识别 Japanese/Korean/Chinese/Spanish，自定义外语课必须填写语言。旧自定义课程仅在名称明确包含一种受支持语言时识别；无法识别的条目暂计选修，不把未知语言合并。新增校内语言时应同步扩展 `src/lib/worldLanguage.js` 的课程代码映射。

## 当前架构

| 区域 | 职责 |
| --- | --- |
| `src/main.jsx` | React 入口，按 `/admin` 懒加载学生端或后台，并包含运行时错误恢复界面。 |
| `src/App.jsx` | 学生端外壳，负责页面组装、导航、公告横幅、弹窗挂载和共享动作串联。 |
| `src/pages/` | 学生端页面：Home、Catalog、Planner、Course Match。 |
| `src/components/` | 按 `course`、`planner`、`match`、`shared` 分类的 UI 组件。 |
| `src/components/shared/AppStyles.jsx` | 学生端全局样式和响应式规则。 |
| `src/hooks/` | Supabase 读取、本地 planner 持久化、课程搜索/筛选、启动免责声明、站点设置、页面维护和临时 UI 反馈 hooks。 |
| `src/lib/` | 纯业务逻辑：课程排序/搜索、planner 学分、先修规则、honors 规则、安全 URL 等。 |
| `src/data/` | 静态 fallback 数据、毕业要求、常量、免责声明、站点设置和 Course Match 模板。 |
| `src/admin/` | 后台应用和管理面板。 |
| `supabase/` | Supabase RLS 和管理员权限初始化 SQL。 |
| `docs/en`, `docs/zh` | 英文和中文维护文档。 |

## 数据流

1. `src/supabase.js` 只在存在 `VITE_SUPABASE_URL` 和 `VITE_SUPABASE_ANON_KEY` 时创建 Supabase client。
2. `useCourseData()` 从 Supabase 读取未归档课程；如果 Supabase 不可用，则 fallback 到 `src/data/courses.js`。
3. `usePlannerStorage()` 管理浏览器本地 planner、prior credits、自定义课程和稳定卡片 ID。
4. `useCourseCatalog()` 合并 Supabase 课程和本地自定义课程，建立课程查询、首页搜索、目录筛选和 planner 添加搜索。
5. `useAnnouncements()`、`useDisclaimerItems()`、`usePageMaintenance()` 和 `useSiteSettings()` 从 Supabase 读取后台维护内容，并在适用场景使用静态 fallback。
6. 启动免责声明的关闭状态保存在浏览器 `localStorage`。
7. 毕业学分、先修课、容量限制、Honors 计算都通过 `src/lib/` 的纯函数在浏览器端完成。
8. 后台写入通过 Vercel 接口验证用户名、密码及登录会话，Supabase 浏览器角色只有读取权限。

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
- 根目录 README 已调整为英文在前、中文在后，并链接到两套语言文档。

## 维护建议

- 新学生端页面放到 `src/pages/`，只通过 page context 接收必要状态和动作。
- 真正跨领域复用的 UI 才放进 `src/components/shared/`。
- 业务规则优先写成 `src/lib/*.js` 中的纯函数。
- Supabase 读取逻辑放到 `src/hooks/`，Supabase client 初始化只放在 `src/supabase.js`。
- 静态 fallback 数据放在 `src/data/`，课程 ID 必须保持稳定。
- 不要随意修改 `localStorage` key；如果必须修改，需要提供迁移或兼容读取逻辑。
- 更新维护行为或目录职责时，同步更新英文和中文文档。
- 修改项目启动、架构、安全或交接说明时，同步更新根目录 README、`docs/en/` 和 `docs/zh/`。

## 2026 年 9 月 Cloud 更新

- 所有添加入口统一检查年级、容量和重复课程；先修课提示允许手动确认，但不能跳过这些硬性检查。
- 外语按同一种语言累计；外部项目只能作为普通自定义课程记录。
- 归档课程保留本地历史快照；损坏的本地数据在恢复前留存备份。
- 六个参考模板已检查当前课程年级、先修顺序及毕业学分类别，不再声称是官方或辅导员认证方案。现有 Course Match 维护开关保持原值。
- 公告统一使用夏威夷时间；正确区分空内容和请求失败，定期刷新公开数据，首页课程数量随实际目录更新。
- CSV 导入严格校验，毕业学分可单独编辑，保存失败会明确提示。
- 管理员改用 Vercel 后端用户名密码登录；数据库变更保存在迁移文件中，并加入回归测试和自动构建检查。

部署顺序、账号配置及回滚限制见[安全配置](security-setup.md)。
