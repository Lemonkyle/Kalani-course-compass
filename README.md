# Kalani Course Compass

Unofficial 4-year course planning tool for Kalani High School students.

Kalani Course Compass 是面向 Kalani High School 学生的非官方四年选课规划工具。

## Commands / 常用命令

```bash
npm install
npm run dev
npm run build
npm run preview
```

## Project Structure / 项目结构

- `src/App.jsx`: student app shell and page composition / 学生端外壳和页面组装
- `src/pages/`: student-facing pages / 学生端页面
- `src/components/`: course, planner, match, and shared UI / 按功能分类的 UI 组件
- `src/hooks/`: data reading, local planner state, search state, and transient UI hooks / 数据读取、本地规划、搜索和临时 UI 状态 hooks
- `src/lib/`: pure rules and utilities / 纯业务规则和工具函数
- `src/data/`: static fallback data and constants / 静态 fallback 数据和常量
- `src/admin/`: admin app and panels / 后台应用和管理面板
- `docs/en/`, `docs/zh/`: bilingual maintenance docs / 中英文维护文档

## Documentation / 文档

| Topic | English | 中文 |
| --- | --- | --- |
| Project documentation | [docs/en/project-documentation.md](docs/en/project-documentation.md) | [docs/zh/project-documentation.md](docs/zh/project-documentation.md) |
| Security setup | [docs/en/security-setup.md](docs/en/security-setup.md) | [docs/zh/security-setup.md](docs/zh/security-setup.md) |
| Maintenance handoff | [docs/en/maintenance-handoff.md](docs/en/maintenance-handoff.md) | [docs/zh/maintenance-handoff.md](docs/zh/maintenance-handoff.md) |
