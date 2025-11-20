# Focus Flow - 专注力驱动的待办清单

[![CI](https://github.com/your-username/focus-flow/actions/workflows/ci.yml/badge.svg)](https://github.com/your-username/focus-flow/actions/workflows/ci.yml)
[![codecov](https://codecov.io/gh/your-username/focus-flow/branch/main/graph/badge.svg)](https://codecov.io/gh/your-username/focus-flow)
[![Vercel](https://img.shields.io/badge/deploy-vercel-black)](https://your-app.vercel.app)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.2-blue)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-18-blue)](https://reactjs.org/)

> "不是'我有什么要做'，而是'此刻该做什么'" - Focus Flow 核心理念

🌐 **Live Demo**: https://your-app.vercel.app

## 🎯 项目简介

Focus Flow 是一个创新的待办清单应用，通过**动态优先级**和**"当下能做什么"视角**，帮助用户减少决策疲劳，提升专注力和工作效率。

### 核心功能 (MVP)

✅ **时间敏感度标签** - 用"今天必须/本周内/随时可做"替代传统优先级
✅ **"当下能做什么"视图** - 根据时间和情境动态筛选任务
✅ **反思总结与进度跟踪** - 每日/每周完成情况可视化

### 技术栈

- **前端:** React 18 + TypeScript + Vite + Tailwind CSS
- **UI库:** shadcn/ui (Radix UI + Tailwind)
- **状态管理:** Zustand
- **后端:** Supabase (PostgreSQL + Auth + Realtime)
- **部署:** Vercel (前端) + Supabase Cloud (后端)

## 🚀 快速开始

### 前置要求

- Node.js >= 18.0.0
- pnpm >= 8.0.0
- Git

### 安装步骤

1. **克隆仓库**

\`\`\`bash
git clone <your-repo-url>
cd focus-flow
\`\`\`

2. **安装依赖**

\`\`\`bash
pnpm install
\`\`\`

3. **设置环境变量**

\`\`\`bash
cp .env.example .env.local
\`\`\`

然后编辑 \`.env.local\` 文件，填入你的 Supabase 凭证：

\`\`\`env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
\`\`\`

### 获取 Supabase 凭证

1. 访问 [Supabase Dashboard](https://app.supabase.com)
2. 创建新项目或选择现有项目
3. 在项目设置中找到 API 设置
4. 复制 \`Project URL\` 和 \`anon public\` key

4. **运行数据库迁移**

如果使用 Supabase 本地开发：

\`\`\`bash
pnpm supabase:start
pnpm supabase:migrate
\`\`\`

或在 Supabase Dashboard 中执行 \`supabase/migrations/20251119000000_initial_schema.sql\` 文件

5. **启动开发服务器**

\`\`\`bash
pnpm dev
\`\`\`

应用将在 [http://localhost:5173](http://localhost:5173) 运行

## 📝 可用脚本

\`\`\`bash
pnpm dev          # 启动开发服务器
pnpm build        # 构建生产版本
pnpm preview      # 预览生产构建
pnpm lint         # 运行 ESLint
pnpm format       # 运行 Prettier 格式化
pnpm type-check   # TypeScript 类型检查
pnpm test         # 运行单元测试
pnpm test:watch   # 测试监听模式
pnpm test:e2e     # 运行 E2E 测试
\`\`\`

## 📁 项目结构

\`\`\`
focus-flow/
├── .github/
│   └── workflows/          # CI/CD 配置
├── docs/                   # 文档
│   ├── architecture.md     # 技术架构文档
│   └── brainstorming-session-results.md
├── public/                 # 静态资源
├── src/
│   ├── components/         # React 组件
│   │   ├── ui/            # shadcn/ui 基础组件
│   │   ├── features/      # 业务功能组件
│   │   └── layout/        # 布局组件
│   ├── pages/             # 页面组件
│   ├── services/          # API 服务层
│   ├── stores/            # Zustand 状态管理
│   ├── lib/               # 工具库
│   ├── types/             # TypeScript 类型定义
│   ├── hooks/             # 自定义 Hooks
│   ├── App.tsx            # 应用根组件
│   ├── main.tsx           # 入口文件
│   └── index.css          # 全局样式
├── supabase/
│   ├── migrations/        # 数据库迁移文件
│   └── config.toml        # Supabase 配置
├── tests/                 # 测试文件
│   ├── unit/             # 单元测试
│   ├── integration/      # 集成测试
│   └── e2e/              # E2E 测试
└── package.json
\`\`\`

## 🗄️ 数据库设计

### Tasks 表

| 字段 | 类型 | 说明 |
|------|------|------|
| id | UUID | 主键 |
| user_id | UUID | 用户ID (外键) |
| title | TEXT | 任务标题 |
| description | TEXT | 任务描述 |
| time_sensitivity | ENUM | 时间敏感度 (today/this_week/anytime) |
| estimated_duration | INTEGER | 预估时长（分钟） |
| is_completed | BOOLEAN | 是否完成 |
| completed_at | TIMESTAMP | 完成时间 |
| created_at | TIMESTAMP | 创建时间 |
| updated_at | TIMESTAMP | 更新时间 |

### Daily Summaries 表

| 字段 | 类型 | 说明 |
|------|------|------|
| id | UUID | 主键 |
| user_id | UUID | 用户ID (外键) |
| date | DATE | 日期 |
| tasks_completed | INTEGER | 完成任务数 |
| tasks_created | INTEGER | 创建任务数 |
| total_duration | INTEGER | 总时长（分钟） |

## 🔐 安全特性

- ✅ Row Level Security (RLS) - 用户只能访问自己的数据
- ✅ JWT Token 认证
- ✅ 自动 CSRF 保护
- ✅ 环境变量隔离
- ✅ TypeScript 类型安全

## 🎨 UI 组件库

本项目使用 [shadcn/ui](https://ui.shadcn.com/) - 一个基于 Radix UI 和 Tailwind CSS 的组件集合。

添加新组件：

\`\`\`bash
npx shadcn-ui@latest add button
npx shadcn-ui@latest add card
npx shadcn-ui@latest add dialog
\`\`\`

## 🚀 部署指南

### Vercel 部署

本项目已配置自动部署到 Vercel：

1. **连接 GitHub 仓库**
   - 访问 [Vercel Dashboard](https://vercel.com/dashboard)
   - 点击 "Import Project"
   - 选择你的 GitHub 仓库
   - Vercel 会自动检测到 `vercel.json` 配置

2. **配置环境变量**

在 Vercel 项目设置中添加以下环境变量：

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
VITE_APP_URL=https://your-app.vercel.app
```

3. **部署**
   - 推送代码到 `main` 分支会自动触发部署
   - 每个 Pull Request 会创建预览部署
   - 部署完成后会自动分配域名

### 手动部署

```bash
# 安装 Vercel CLI
npm i -g vercel

# 登录
vercel login

# 部署到生产环境
vercel --prod
```

### CI/CD 状态

每次推送代码会自动运行：
- ✅ ESLint 代码检查
- ✅ TypeScript 类型检查
- ✅ 单元测试 + 覆盖率报告
- ✅ 生产构建验证

**分支部署策略：**
- `main` 分支 → 生产环境自动部署
- `develop` 分支 → 预览环境自动部署
- Pull Requests → 临时预览环境

所有 jobs 并行执行，优化 CI 运行时间。

## 📚 相关文档

- [技术架构文档](docs/architecture.md) - 完整的系统架构设计
- [产品需求文档](docs/prd.md) - PRD 和用户故事
- [头脑风暴会议记录](docs/brainstorming-session-results.md) - 产品构思过程
- [Supabase 文档](https://supabase.com/docs)
- [React Router 文档](https://reactrouter.com/)
- [Zustand 文档](https://docs.pmnd.rs/zustand)
- [Vercel 部署文档](https://vercel.com/docs)

## 🚧 开发路线图

### MVP 阶段 (Week 1)

- [x] 项目初始化和架构设计
- [ ] Day 1-2: 认证功能 + 任务 CRUD
- [ ] Day 3-5: "当下能做什么"核心功能
- [ ] Day 6-7: 每日总结 + 部署

### V2 计划

- [ ] 智能任务安排（日历集成）
- [ ] 双视图切换（卡片流 + 时间轴）
- [ ] 任务拆解辅助
- [ ] PWA 离线支持
- [ ] 移动端应用

## 🤝 贡献指南

欢迎贡献！请遵循以下步骤：

1. Fork 本仓库
2. 创建功能分支 (\`git checkout -b feature/AmazingFeature\`)
3. 提交更改 (\`git commit -m 'Add some AmazingFeature'\`)
4. 推送到分支 (\`git push origin feature/AmazingFeature\`)
5. 开启 Pull Request

## 📄 许可证

MIT License - 详见 [LICENSE](LICENSE) 文件

## 👥 团队

- **Winston** 🏗️ - 系统架构师
- **Mary** 📊 - 商业分析师

---

**Focus Flow** - 让专注力驱动你的生产力 ✨

## 🚢 部署

详细部署指南请查看：
- 📚 [完整部署指南](docs/DEPLOYMENT.md)
- ⚡ [快速开始(5分钟)](docs/QUICK_START.md)
