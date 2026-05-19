# Kalani Course Compass 维护交接说明

更新日期：2026-05-18

## 快速开始

```bash
npm install
npm run dev
npm run build
npm run preview
```

交接或部署前至少运行一次 `npm run build`。

## 重要背景

- 本项目是非官方选课规划工具，不隶属于 Kalani High School 或 Hawaii DOE。
- 学生个人规划只保存在浏览器 `localStorage`，不会上传服务器。
- 本地开发可以不配置 Supabase，因为项目保留静态 fallback 数据。
- 后台写入权限依赖 Supabase Auth 和 RLS 策略。
- 课程 ID 必须稳定；Course Match 模板和学生已保存规划都会依赖这些 ID。

## 文件夹职责

```text
src/
  App.jsx                  学生端外壳、页面组装和共享动作串联。
  main.jsx                 React 入口，按路径懒加载学生端或后台。
  supabase.js              Supabase client 初始化，未配置时安全返回 null。
  pages/                   学生端页面。
  components/course/       课程详情和课程相关 UI。
  components/planner/      Planner 专属 UI 和自定义课程弹窗。
  components/match/        Course Match 卡片和详情弹窗。
  components/shared/       跨领域 UI、全局样式和页面动画。
  hooks/                   Supabase 读取、本地 planner、课程目录/搜索、免责声明和临时 UI 状态。
  lib/                     纯业务规则和工具函数。
  data/                    静态 fallback 数据和常量。
  admin/                   后台应用和管理面板。
docs/en, docs/zh           人类阅读维护文档。
```

## 修改原则

- 优先新增或调整小模块，不要继续把逻辑塞回 `App.jsx`。
- 业务规则放在 `src/lib/`，尽量保持纯函数，方便测试。
- 浏览器本地持久化放在 hooks 中，并保留现有 `localStorage` key。
- Supabase 读取放在 hooks，后台写入放在 admin panels，不要放进通用 UI 组件。
- 未经明确规划，不引入新的框架、路由库、状态管理库或 UI 库。
- 改动维护行为或目录职责时，需要同时更新英文和中文文档。

## 下一步推荐清理

学生端第一阶段清理已经足够支撑日常维护。`src/admin/CoursePanel.jsx` 仍是最大的维护目标，建议拆成：

- CSV 解析和导入工具。
- Course form 字段组件。
- Course 列表、搜索、筛选控制。
- Supabase 新增、更新、归档动作。

## 验证清单

结构调整后至少检查：

- 首页搜索能打开课程详情。
- 课程目录搜索和筛选正常。
- Planner 添加/删除、先修课提醒、容量限制、ALG1 prior credit、自定义课程正常。
- Course Match 预览和应用到 planner 正常。
- 启动免责声明和页面维护开关正常。
- `/admin` 后台能加载，各管理面板 import 正常。
