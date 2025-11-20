# Supabase 云端配置指南

本项目支持使用 Supabase 云端数据库，无需本地安装 Docker。

## 📝 快速开始

### 步骤 1: 创建 Supabase 云端项目

1. **注册/登录 Supabase**
   - 访问：https://supabase.com
   - 使用 GitHub、Google 或邮箱注册/登录

2. **创建新项目**
   ```
   Dashboard → New Project

   填写信息：
   - Organization: 选择或创建一个组织
   - Project Name: focus-flow
   - Database Password: 设置强密码（记住它！）
   - Region:
     * Northeast Asia (Tokyo) - 日本东京
     * Southeast Asia (Singapore) - 新加坡
     * 或选择离您最近的区域
   ```

3. **等待项目初始化**
   - 通常需要 1-2 分钟
   - 初始化完成后会自动跳转到项目 Dashboard

### 步骤 2: 获取连接信息

1. **进入 API 设置页面**
   ```
   左侧菜单：Settings (齿轮图标)
   → API
   ```

2. **复制连接信息**
   您会看到以下信息：

   **Project URL**（项目 URL）
   ```
   https://xxxxxxxxxxxxx.supabase.co
   ```

   **API Keys**（API 密钥）
   - `anon public`: 公开密钥（前端使用）
   - `service_role`: 服务端密钥（后端使用，保密！）

### 步骤 3: 配置本地环境

1. **打开项目中的 `.env.local` 文件**
   路径：`apps/web/.env.local`

2. **替换占位符为真实值**
   ```env
   # 将下面的值替换为您的实际值
   VITE_SUPABASE_URL=https://xxxxxxxxxxxxx.supabase.co
   VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   ```

3. **保存文件**

### 步骤 4: 执行数据库迁移

您需要在 Supabase 云端创建数据库表结构。有两种方式：

#### 方式 A: 使用 Supabase Dashboard（推荐，图形界面）

1. **打开 SQL Editor**
   ```
   左侧菜单：SQL Editor
   → New query
   ```

2. **复制迁移 SQL**
   - 打开本地文件：`apps/web/supabase/migrations/20251119000000_initial_schema.sql`
   - 复制全部内容

3. **粘贴并执行**
   - 粘贴到 SQL Editor
   - 点击 "Run" 按钮
   - 等待执行完成（应该显示 "Success"）

4. **验证表是否创建成功**
   ```
   左侧菜单：Table Editor

   应该看到以下表：
   - tasks
   - daily_summaries
   - user_profiles
   ```

#### 方式 B: 使用 Supabase CLI（命令行）

如果您安装了 Supabase CLI：

```bash
# 1. 登录 Supabase
supabase login

# 2. 链接到您的云端项目
supabase link --project-ref your-project-ref

# 3. 推送迁移到云端
supabase db push

# 注意：project-ref 可以在项目 URL 中找到
# https://[project-ref].supabase.co
```

### 步骤 5: 启动应用

```bash
# 从项目根目录运行
pnpm dev
```

应用将自动连接到 Supabase 云端数据库！

## 🔍 验证连接

### 测试注册功能

1. 启动应用后访问：http://localhost:5173
2. 应该会自动跳转到登录页面（因为未登录）
3. 点击 "立即注册"
4. 填写信息并提交

### 在 Supabase Dashboard 中验证

1. **查看用户**
   ```
   左侧菜单：Authentication → Users

   应该看到刚注册的用户
   ```

2. **查看数据**
   ```
   左侧菜单：Table Editor → user_profiles

   应该看到新用户的资料记录
   ```

## 📊 Supabase Dashboard 功能

### 1. Table Editor（表编辑器）
- 查看和编辑表数据
- 类似于数据库管理工具的可视化界面
- 可以手动添加/修改/删除记录

### 2. SQL Editor（SQL 编辑器）
- 执行自定义 SQL 查询
- 创建视图、函数、触发器
- 支持保存常用查询

### 3. Authentication（认证）
- 查看所有注册用户
- 管理用户（禁用/启用/删除）
- 配置认证设置（邮箱确认、社交登录等）

### 4. Database（数据库）
- 查看表结构
- 管理索引
- 配置 Row Level Security (RLS)
- 查看触发器和函数

### 5. API（API 文档）
- 自动生成的 API 文档
- 查看连接信息
- 测试 API 端点

### 6. Logs（日志）
- 查看 API 请求日志
- 数据库查询日志
- 错误日志

## 🔒 安全提示

### ✅ 可以公开的信息
- **Project URL**: `https://xxxxx.supabase.co`
- **anon public key**: 前端使用的公开密钥

### 🚫 绝对保密的信息
- **Database Password**: 数据库密码
- **service_role key**: 服务端密钥（拥有完全权限）
- **JWT Secret**: 用于签名 token

### 最佳实践
1. **不要将 `.env.local` 提交到 Git**
   - 已在 `.gitignore` 中排除

2. **使用环境变量**
   - 本地开发：`.env.local`
   - 生产部署：在 Vercel/Netlify 等平台的环境变量中配置

3. **定期更换密钥**
   - 如果怀疑密钥泄露，立即在 Supabase Dashboard 重新生成

## 🌍 区域选择建议

- **中国大陆用户**: Southeast Asia (Singapore) 或 Northeast Asia (Tokyo)
- **延迟要求高**: 选择最近的区域
- **跨国应用**: 考虑使用 CDN

## 💰 费用说明

Supabase 提供慷慨的免费计划：

**Free Plan（免费计划）包含：**
- ✅ 500 MB 数据库存储
- ✅ 1 GB 文件存储
- ✅ 50 MB 文件上传大小
- ✅ 50,000 月活跃用户
- ✅ 每月 200 万次数据库查询
- ✅ 每月 50 GB 带宽
- ✅ 社区支持

对于个人项目和小型应用，免费计划完全够用！

**升级选项：**
- **Pro Plan**: $25/月（更多资源 + 优先支持）
- **Team Plan**: $599/月（团队协作功能）
- **Enterprise**: 自定义定价

## 🆚 云端 vs 本地开发对比

| 特性 | 云端 Supabase | 本地 Supabase |
|------|--------------|--------------|
| **安装要求** | 无需安装 | 需要 Docker |
| **启动时间** | 即时 | 需要启动 Docker 容器 |
| **团队协作** | 自然支持 | 需要额外配置 |
| **数据持久化** | 自动备份 | 需要手动管理 |
| **网络要求** | 需要互联网 | 可离线工作 |
| **性能** | 取决于网络 | 本地最快 |
| **成本** | 免费计划够用 | 完全免费 |

## 🔧 故障排除

### 问题 1: 连接失败
```
Error: Failed to fetch
```
**解决方案：**
1. 检查 `.env.local` 中的 URL 和 Key 是否正确
2. 确保项目已完成初始化（在 Dashboard 中）
3. 检查网络连接

### 问题 2: 认证失败
```
Error: Invalid API key
```
**解决方案：**
1. 重新复制 `anon public` key
2. 确保没有多余的空格或换行
3. 重启开发服务器（`pnpm dev`）

### 问题 3: 表不存在
```
Error: relation "tasks" does not exist
```
**解决方案：**
1. 确认已执行数据库迁移（步骤 4）
2. 在 Supabase Dashboard → Table Editor 中检查表是否存在

### 问题 4: RLS 权限错误
```
Error: new row violates row-level security policy
```
**解决方案：**
1. 确认迁移中的 RLS 策略已执行
2. 检查 Dashboard → Database → Policies
3. 确保用户已登录

## 📚 更多资源

- **Supabase 官方文档**: https://supabase.com/docs
- **API 参考**: https://supabase.com/docs/reference/javascript
- **示例项目**: https://github.com/supabase/supabase/tree/master/examples
- **社区支持**: https://github.com/supabase/supabase/discussions

## ✅ 配置清单

使用此清单确保配置正确：

- [ ] 在 Supabase.com 创建项目
- [ ] 复制 Project URL 到 `.env.local`
- [ ] 复制 anon public key 到 `.env.local`
- [ ] 在 SQL Editor 中执行迁移脚本
- [ ] 在 Table Editor 中验证表已创建
- [ ] 运行 `pnpm dev` 启动应用
- [ ] 测试注册功能
- [ ] 在 Dashboard 中验证用户已创建

完成所有步骤后，您的应用就可以使用云端数据库了！🎉
