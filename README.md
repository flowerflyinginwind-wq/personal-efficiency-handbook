# 个人效率手册

任务打卡、特殊日子提醒、农历日历 — 数据保存在浏览器本地，无需服务器。

## 使用方式

### 方式一：直接打开（电脑）

双击 `standalone.html` 即可在浏览器中使用。

### 方式二：手机浏览器 / 在线访问（推荐）

发布到 GitHub Pages 后，用手机浏览器打开网址，可添加到主屏幕像 App 一样使用。

## 手机使用说明

- 已适配手机屏幕：底部导航栏、可横向滑动的周视图、更大的触控区域
- 支持「添加到主屏幕」（iOS Safari / Android Chrome）
- **离线使用**：需先在有网络时打开一次页面，浏览器会缓存；之后无网也能打开（见下方说明）
- 数据存在本机浏览器，换设备不会自动同步
- 浏览器通知需要 HTTPS（GitHub Pages 满足此条件）；本地 `file://` 打开时通知可能不可用

## 发布到 GitHub Pages

本项目已准备好 `docs/` 目录，无需 `npm install` 即可部署。

### 步骤

1. 在 GitHub 创建新仓库（例如 `personal-efficiency-handbook`）

2. 推送代码：

```bash
cd C:\Users\qch1845\Projects\personal-efficiency-handbook
git add .
git commit -m "Initial commit: personal efficiency handbook"
git branch -M main
git remote add origin https://github.com/你的用户名/personal-efficiency-handbook.git
git push -u origin main
```

3. 在 GitHub 仓库中：**Settings → Pages**
   - **Source**: Deploy from a branch
   - **Branch**: `main`，文件夹选 **`/docs`**
   - 保存

4. 等待 1～2 分钟，访问：

```
https://你的用户名.github.io/personal-efficiency-handbook/
```

### 离线打不开？

「添加到主屏幕」只是把网址做成快捷方式，**必须配合 Service Worker 缓存页面**才能在无网时打开。若之前版本没有离线缓存，安装后断网会白屏。

**正确用法：**

1. 用 WiFi/流量打开一次线上地址，等页面完全加载
2. 再断网或开飞行模式，从主屏幕图标打开，应能正常使用
3. 若仍打不开：删掉主屏幕图标 → 重新用浏览器打开网址 → 再「添加到主屏幕」

定时提醒的**系统通知**在离线时可能无法弹出（需浏览器在后台运行），但任务、日历等本地功能不受影响。

### 更新线上版本

修改 `standalone.html` 后，同步到 `docs/index.html` 再推送：

```powershell
Copy-Item standalone.html docs\index.html -Force
git add docs/index.html standalone.html
git commit -m "Update app"
git push
```

## 开发版（React + Vite，可选）

需要 Node.js 环境：

```bash
npm install
npm run dev
```

若公司网络有代理导致安装失败，请使用 `standalone.html` 或 `docs/index.html`。

## 功能

- 任务中心：多日期分配、每日打卡、逾期提醒、小红花奖励
- 特殊日子：生日/纪念日、自定义寄语、提前一天提醒
- 农历显示：周视图、月历、日期导航
- 本地存储：数据保存在 `localStorage`，键名 `efficiency-handbook-data`
