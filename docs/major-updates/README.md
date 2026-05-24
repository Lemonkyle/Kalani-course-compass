# Kalani Compass Major Update Archive

更新日期：2026-05-23

这个目录用于保存 Kalani Compass 的重要大版本更新记录。现在按“可公开展示 / 可上传数据 / 本地证据”三层整理，避免报告、原始反馈和 dashboard 混在一起。适合上传到 GitHub 的内容是轻量 dashboard、统计摘要和说明文件；`.docx` 报告与原始 Google Form CSV 只作为本地归档保存，不进入 GitHub。

## 文件结构

| 路径 | 内容 | GitHub 状态 |
| --- | --- | --- |
| `dashboard/index.html` | dashboard 语言入口页 | 上传 |
| `dashboard/en.html` | 英文 dashboard | 上传 |
| `dashboard/zh.html` | 中文 dashboard | 上传 |
| `dashboard/dashboard.css` | dashboard 共享样式 | 上传 |
| `data/feedback-summary.json` | Google Form 统计摘要 | 上传 |
| `local/feedback/Kalani Compass Beta Feedback.csv` | 原始反馈导出，共 99 条 | 本地保留，已忽略 |
| `local/reports/` | v1-v8 阶段性 `.docx` 报告 | 本地保留，已忽略 |

## 推荐阅读顺序

1. 打开 `dashboard/index.html`，选择英文或中文 dashboard。
2. 需要看统计来源时，查看 `data/feedback-summary.json`。
3. 需要完整证据时，在本地查看 `local/reports/` 和 `local/feedback/`，但这些内容不上传 GitHub。

## 版本分配

| Version | 时间 | 核心主题 |
| --- | --- | --- |
| V1 | 2026-03-08 | 纯前端 Demo、课程数据结构化、先修链路和四年 planner 原型。 |
| V2 | 2026-03 | localStorage 持久化、Honors / Off Campus / 容量与毕业要求修正。 |
| V3 | 2026-03 | 2026-27 课程目录重建、Supabase 公告/评分实验、课程目录增强。 |
| V4 | 2026-03 | 139 门课程迁移到 Supabase、后台 admin panel、课程排序和数据适配。 |
| V5 | 2026-04 | beta feedback 分析、评分系统暂停、ALG1 middle-school credit 修复。 |
| V6 | 2026-04 到 2026-05 初 | 学生隐私/本地存储验证、免责声明、Vercel 部署稳定。 |
| V7 | 2026-05-14 到 2026-05-18 | 自定义课程、Course Match、admin 安全、维护面板、模块化文档。 |
| V8 | 2026-05-22 到 2026-05-23 | 校内 outreach、site settings、Supabase/Vercel 状态、开学前 link-first rollout 计划。 |

## 当前反馈摘要

- 表单回复：99 条。
- 平均 helpfulness：4.02 / 5。
- 平均 ease of use：4.17 / 5。
- 平均 accuracy/clarity：4.16 / 5。
- 愿意推荐给 incoming freshmen：86 / 99（86.9% definitely/probably yes）。

## 证据来源

- 旧版 v1-v5 `.docx` 报告。
- 新补 v6-v8 `.docx` 报告。
- Google Form feedback CSV 与统计摘要。
- `git log` 和关键提交统计。
- Supabase 项目/表/RLS/advisor 状态。
- Vercel 项目与最近 deployment 状态。
- 最新校内 stakeholder notes。

## 注意

这些材料继续保持“非官方学生项目”的表述。正式放到学校网站、转移服务器或使用学生账号前，仍需要校方/IT/counselor 对隐私、课程准确性和 graduation condition 做进一步确认。
