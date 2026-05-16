# Smart Agriculture Platform

这是微山示范基地 A 区的智慧农业土壤水分预测与灌溉决策平台。当前仓库是 monorepo：

```text
apps/
  web/      React + Vite + TypeScript 前端
  api/      FastAPI 后端
packages/
  shared/   前后端共享 TypeScript 类型
```

本文主要给 Windows 前端开发同事使用，目标是把本地环境问题降到最低。

## 1. Windows 环境准备

建议使用 Windows 10/11 + PowerShell。不要把项目放在带同步冲突的目录里，例如 OneDrive 自动同步目录；推荐路径：

```powershell
C:\dev\Agriculture
```

必须安装：

- Git for Windows: <https://git-scm.com/download/win>
- Node.js 20 LTS 或更高版本: <https://nodejs.org/>
- VS Code: <https://code.visualstudio.com/>

可选安装，仅当你需要本地跑后端：

- Python 3.11 或更高版本: <https://www.python.org/downloads/>
- uv: <https://docs.astral.sh/uv/>

安装完成后，在 PowerShell 检查版本：

```powershell
git --version
node -v
npm -v
```

Node 版本必须是 `20.x` 或更高。如果版本不对，建议用 `nvm-windows` 管理 Node 版本。

## 2. 拉取项目

```powershell
cd C:\dev
git clone <项目仓库地址> Agriculture
cd Agriculture
```

如果项目已经通过压缩包发给你，直接解压到 `C:\dev\Agriculture`，然后在该目录打开 PowerShell。

## 3. 安装前端依赖

在项目根目录执行：

```powershell
npm install
```

注意：

- 统一从项目根目录运行 npm 命令，不要先进入 `apps\web` 再安装。
- 当前项目使用 npm workspace，根目录脚本会自动转到前端包。
- 不要混用多个包管理器。除非团队统一切换，否则日常开发用 `npm`。

## 4. 配置前端环境变量

前端环境变量模板在：

```text
apps/web/.env.example
```

第一次启动前复制一份：

```powershell
Copy-Item apps\web\.env.example apps\web\.env
```

默认内容通常保持不变即可：

```env
VITE_API_BASE_URL=/api/v1
VITE_API_PROXY_TARGET=http://127.0.0.1:8000
```

含义：

- `VITE_API_BASE_URL=/api/v1`: 前端请求统一从 Vite 代理走 `/api/v1`。
- `VITE_API_PROXY_TARGET=http://127.0.0.1:8000`: 本地后端地址。

如果后端跑在别人的电脑或服务器上，把 `VITE_API_PROXY_TARGET` 改成对应地址，例如：

```env
VITE_API_PROXY_TARGET=http://192.168.1.20:8000
```

## 5. 启动前端

在项目根目录执行：

```powershell
npm run dev:web
```

浏览器打开：

```text
http://localhost:5173
```

如果页面能打开，但接口报错，通常是后端没有启动，或 `apps/web/.env` 里的 `VITE_API_PROXY_TARGET` 不对。

## 6. 本地启动后端（可选）

如果你只做静态页面或前端样式，可以先不跑后端。但如果需要联调接口，请在另一个 PowerShell 窗口启动后端。

第一次安装 uv 后，检查：

```powershell
uv --version
python --version
```

启动后端：

```powershell
npm run dev:api
```

健康检查地址：

```text
http://127.0.0.1:8000/api/v1/health
```

如果浏览器打开健康检查能看到成功响应，说明前后端联调通路正常。

## 7. 常用命令

全部在项目根目录执行：

```powershell
npm run dev:web
npm run build:web
npm run test:web
npm run lint:web
npm run dev:api
npm run test:api
```

前端提交前至少跑：

```powershell
npm run build:web
npm run test:web
```

## 8. Windows 常见问题

### `npm` 或 `node` 不是内部或外部命令

Node 没装好，或安装后 PowerShell 没重开。重新安装 Node 20 LTS，然后关闭并重新打开 PowerShell。

### `vite` 不是内部或外部命令

依赖没有安装，或不是在项目根目录安装的。回到根目录执行：

```powershell
npm install
```

然后重新运行：

```powershell
npm run dev:web
```

### PowerShell 不允许执行脚本

如果遇到执行策略问题，使用当前用户级别放开：

```powershell
Set-ExecutionPolicy -Scope CurrentUser RemoteSigned
```

关闭并重新打开 PowerShell 后再试。

### 端口 `5173` 被占用

先停掉旧的前端开发服务。也可以查看占用进程：

```powershell
netstat -ano | findstr :5173
```

然后在任务管理器里结束对应 PID。

### 前端接口 404 或连接失败

优先检查三件事：

1. 后端是否已启动。
2. `http://127.0.0.1:8000/api/v1/health` 是否能打开。
3. `apps/web/.env` 里的 `VITE_API_PROXY_TARGET` 是否指向正确后端。

### 浏览器能打开，但数据不更新

重启 Vite 开发服务。`.env` 修改后必须重启：

```powershell
Ctrl + C
npm run dev:web
```

### Git 显示大量换行符改动

Windows 和 macOS 换行符可能不同。建议在项目根目录执行一次：

```powershell
git config core.autocrlf false
```

如果已经出现大量无关改动，先不要提交，联系项目负责人一起处理。

### 路径里有中文、空格或 OneDrive 同步

Node/Vite 大多数时候可以处理，但遇到奇怪的依赖安装失败、热更新异常、权限错误时，先把项目移动到简单路径：

```text
C:\dev\Agriculture
```

## 9. 推荐 VS Code 插件

- ESLint
- Prettier
- TypeScript Vue Plugin 不需要安装，本项目是 React

打开项目时请选择仓库根目录 `Agriculture`，不要只打开 `apps/web`。

## 10. 开发约定

- 前端代码放在 `apps/web/src`。
- 业务功能优先放到 `apps/web/src/features/<domain>`。
- 通用浏览器工具放到 `apps/web/src/lib`。
- 共享接口类型优先使用 `packages/shared`。
- 前端不要重新计算后端已经返回的业务展示值，例如 `displayValue`、`displayUnit`、`heightValue`、`colorToken`、`colorHex`。
- 当前轮次只做灌溉模拟和计划，不做真实设备控制。

## 11. 最小可用启动流程

如果只是想最快把页面跑起来：

```powershell
cd C:\dev\Agriculture
npm install
Copy-Item apps\web\.env.example apps\web\.env
npm run dev:web
```

然后打开：

```text
http://localhost:5173
```
