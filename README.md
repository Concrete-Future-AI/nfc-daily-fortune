# 健康运势助手 🔮

基于NFC技术的智能健康运势助手，结合用户个人信息、实时位置和天气数据，通过AI生成个性化的健康建议和运势预测。

## ✨ 核心功能

### 🎯 NFC身份识别
- 通过NFC卡片快速识别用户身份
- 支持用户注册和信息管理
- 安全的UID验证机制

### 🤖 AI智能运势生成
- 基于用户个人信息（姓名、性别、出生日期、出生地）
- 结合实时位置和天气数据
- 生成个性化的健康建议和运势预测
- 包含健康运势、财富运势、人际关系运势等多维度分析

### 📊 数据管理
- PostgreSQL数据库存储用户信息和运势记录
- 支持历史运势查询
- 完整的数据备份和导出功能

### 🛠️ 管理工具
- 丰富的脚本工具集，支持数据库管理、用户生成、系统测试
- 完整的系统验证和健康检查
- TypeScript类型安全保障

## 🏗️ 技术架构

### 前端技术栈
- **Next.js 15+** - 全栈React框架，使用App Router
- **React 19** - 用户界面库
- **TypeScript** - 类型安全的JavaScript
- **Tailwind CSS** - 原子化CSS框架
- **shadcn/ui** - 现代化UI组件库

### 后端技术栈
- **Next.js API Routes** - 服务端API
- **PostgreSQL** - 主数据库
- **Prisma** - 类型安全的ORM
- **AI服务集成** - 智能运势生成

### 开发工具
- **ESLint** - 代码质量检查
- **tsx** - TypeScript执行器
- **Prisma CLI** - 数据库管理

## 🚀 快速开始

### 环境要求
- Node.js 18+
- PostgreSQL 数据库
- 高德地图API密钥
- AI服务API密钥

### 安装依赖

```bash
npm install
```

### 环境配置

创建 `.env.local` 文件并配置以下环境变量：

```env
# 数据库连接
DATABASE_URL="postgresql://username:password@localhost:5432/database"

# 高德地图API
AMAP_API_KEY="your_amap_api_key"

# AI服务配置
AI_ENDPOINT="your_ai_endpoint"
AI_API_KEY="your_ai_api_key"
```

### 数据库设置

```bash
# 生成Prisma客户端
npx prisma generate

# 运行数据库迁移
npx prisma migrate dev

# 填充种子数据
npm run db:seed
```

### 启动开发服务器

```bash
npm run dev
```

应用将在 [http://localhost:4006](http://localhost:4006) 启动。

### 生产环境部署

```bash
# 构建应用
npm run build

# 启动生产服务器
npm run start
```

生产服务器将在端口 4005 启动。

## 📱 使用说明

### 用户注册流程
1. 使用NFC卡片访问应用（URL需包含 `nfc_uid` 参数）
2. 首次访问时填写个人信息（姓名、性别、出生日期、出生地）
3. 系统自动保存用户信息并生成运势

### 运势查看
1. 已注册用户使用NFC卡片访问
2. 系统自动获取当前位置和天气信息
3. AI生成当日个性化运势和健康建议
4. 支持字体大小调节，提升阅读体验

### API接口

#### 用户检查
```
GET /api/users/check/[nfc_uid]
```

#### 用户注册
```
POST /api/users
```

#### 运势生成
```
POST /api/fortune
```

## 🛠️ 脚本工具

项目提供了丰富的管理脚本，详见 [`scripts/README.md`](./scripts/README.md)：

### 数据库管理
```bash
# 导出数据库
npm run db:export

# 清空数据库
npx tsx scripts/clear-database.ts
```

### 用户管理
```bash
# 生成测试用户
npx tsx scripts/generate-users.ts --count 10 --env test

# 导出用户数据
npx tsx scripts/export-users-csv-advanced.ts
```

### 系统测试
```bash
# 完整系统测试
npx tsx scripts/test-system.ts --all

# 系统验证
npx tsx scripts/verify-system.ts --all
```

## 📁 项目结构

```
├── app/                    # Next.js App Router
│   ├── api/               # API路由
│   │   ├── users/         # 用户相关API
│   │   └── fortune/       # 运势相关API
│   ├── globals.css        # 全局样式
│   ├── layout.tsx         # 根布局
│   └── page.tsx           # 主页面
├── components/            # React组件
│   ├── ui/               # shadcn/ui组件
│   ├── UserRegistration.tsx
│   └── FortuneDisplay.tsx
├── lib/                   # 工具库
│   ├── ai.ts             # AI服务集成
│   ├── location-weather.ts # 位置和天气服务
│   ├── prisma.ts         # 数据库客户端
│   └── utils.ts          # 通用工具
├── prisma/               # 数据库相关
│   ├── schema.prisma     # 数据模型
│   └── migrations/       # 数据库迁移
├── scripts/              # 管理脚本
├── types/                # TypeScript类型定义
└── public/               # 静态资源
```

## 🔧 开发指南

### 代码规范
- 严格使用TypeScript，禁用`any`类型
- 遵循ESLint规则
- 使用Prettier格式化代码
- 组件使用React Server Components优先

### 数据库操作
- 所有数据模型在`prisma/schema.prisma`中定义
- 使用Prisma Client进行类型安全的数据库操作
- 修改模型后需运行`npx prisma generate`和`npx prisma migrate dev`

### 环境管理
- 开发环境使用`.env.local`
- 生产环境配置相应的环境变量
- 敏感信息不要提交到版本控制

## 🐛 故障排除

### 常见问题

1. **数据库连接失败**
   - 检查`DATABASE_URL`配置
   - 确保PostgreSQL服务运行正常

2. **API调用失败**
   - 验证API密钥配置
   - 检查网络连接状态

3. **TypeScript编译错误**
   - 运行`npx tsc --noEmit`检查类型错误
   - 确保所有导入使用正确语法

4. **NFC UID验证失败**
   - 确保UID格式正确（4-50个字符，仅包含字母、数字、下划线、连字符）
   - 检查URL参数是否正确传递

## 📄 许可证

本项目为私有项目，仅供内部使用。

## 🤝 贡献指南

1. Fork 项目
2. 创建功能分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 开启 Pull Request

## 📞 联系方式

如有问题或建议，请通过以下方式联系：

- 项目维护者：健康运势助手团队
- 技术支持：请查看项目文档或提交Issue

---

*基于Next.js 15和现代Web技术构建的智能健康运势助手* ✨
