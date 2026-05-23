# Kalani Course Compass

Unofficial 4-year course planning tool for Kalani High School students.

Kalani Course Compass helps students browse the course catalog, understand prerequisites and concurrent-course rules, build a grade 9-12 plan, track graduation credits, and explore curated Course Match templates.

This project is student-facing first, with an optional Supabase-backed admin area for maintaining courses, announcements, disclaimers, site settings, and page maintenance controls.

## Quick Start

```bash
npm install
npm run dev
npm run build
npm run preview
```

Use `npm run build` before deploying or handing off changes.

## Project Structure

- `src/App.jsx`: student app shell, page composition, navigation, banners, modals, and shared action wiring.
- `src/main.jsx`: React entry point with student/admin lazy loading.
- `src/pages/`: student-facing pages for Home, Catalog, Planner, and Course Match.
- `src/components/`: course, planner, match, and shared UI components.
- `src/hooks/`: Supabase reads plus local planner storage, course catalog/search state, startup disclaimer state, site settings, and transient UI feedback.
- `src/lib/`: pure rules and utilities for search, prerequisites, planner credits, honors, and safe URLs.
- `src/data/`: static fallback data, requirements, constants, disclaimers, site settings, and Course Match templates.
- `src/admin/`: admin app and management panels.
- `supabase/`: Supabase security setup SQL.
- `docs/en/`, `docs/zh/`: English and Chinese maintenance docs.

## Documentation

| Topic | English | Chinese |
| --- | --- | --- |
| Project documentation | [docs/en/project-documentation.md](docs/en/project-documentation.md) | [docs/zh/project-documentation.md](docs/zh/project-documentation.md) |
| Security setup | [docs/en/security-setup.md](docs/en/security-setup.md) | [docs/zh/security-setup.md](docs/zh/security-setup.md) |
| Maintenance handoff | [docs/en/maintenance-handoff.md](docs/en/maintenance-handoff.md) | [docs/zh/maintenance-handoff.md](docs/zh/maintenance-handoff.md) |

## Notes

- This is an unofficial planning tool and is not affiliated with Kalani High School or Hawaii DOE.
- Student plans are stored in browser `localStorage`; they are not uploaded by the student app.
- Supabase is optional for local development because the app includes static fallback data.
- Admin write access depends on Supabase Auth plus Row Level Security policies.

---

# Kalani Course Compass 中文说明

Kalani Course Compass 是一个面向 Kalani High School 学生的非官方四年选课规划工具。

它可以帮助学生浏览课程目录、理解先修课和并修规则、规划 9-12 年级课程、追踪毕业学分，并查看 Course Match 推荐路径。

项目以学生端体验为主，同时提供可选的 Supabase 后台，用于维护课程、公告、免责声明、站点设置和页面维护开关。

## 快速开始

```bash
npm install
npm run dev
npm run build
npm run preview
```

部署或交接前，请至少运行一次 `npm run build`。

## 项目结构

- `src/App.jsx`：学生端外壳、页面组装、导航、公告横幅、弹窗挂载和共享动作串联。
- `src/main.jsx`：React 入口，负责学生端和后台的懒加载。
- `src/pages/`：学生端页面，包括 Home、Catalog、Planner 和 Course Match。
- `src/components/`：按 course、planner、match、shared 分类的 UI 组件。
- `src/hooks/`：Supabase 读取、本地 planner 持久化、课程目录/搜索、启动免责声明、站点设置和临时 UI 反馈状态。
- `src/lib/`：课程搜索、先修课、planner 学分、Honors 和安全 URL 等纯规则与工具函数。
- `src/data/`：静态 fallback 数据、毕业要求、常量、免责声明、站点设置和 Course Match 模板。
- `src/admin/`：后台应用和管理面板。
- `supabase/`：Supabase 安全配置 SQL。
- `docs/en/`、`docs/zh/`：英文和中文维护文档。

## 文档

| 主题 | English | 中文 |
| --- | --- | --- |
| 项目文档 | [docs/en/project-documentation.md](docs/en/project-documentation.md) | [docs/zh/project-documentation.md](docs/zh/project-documentation.md) |
| 安全配置 | [docs/en/security-setup.md](docs/en/security-setup.md) | [docs/zh/security-setup.md](docs/zh/security-setup.md) |
| 维护交接 | [docs/en/maintenance-handoff.md](docs/en/maintenance-handoff.md) | [docs/zh/maintenance-handoff.md](docs/zh/maintenance-handoff.md) |

## 注意事项

- 本项目是非官方规划工具，不隶属于 Kalani High School 或 Hawaii DOE。
- 学生规划保存在浏览器 `localStorage`，学生端不会上传这些规划。
- 本地开发可以不配置 Supabase，因为项目包含静态 fallback 数据。
- 后台写入权限依赖 Supabase Auth 和 Row Level Security 策略。
