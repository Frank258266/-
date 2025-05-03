# 以为寻宝记

一个基于Three.js的3D互动视频游戏。

## 本地部署指南

### 方法一：使用Node.js（推荐）

1. **安装Node.js**
   - 从[Node.js官网](https://nodejs.org/)下载并安装最新的LTS版本
   - 安装完成后，打开命令提示符(CMD)验证安装：
     ```
     node -v
     npm -v
     ```

2. **启动游戏服务器**
   - 打开命令提示符(CMD)，**不要使用PowerShell**
   - 导航到游戏目录：
     ```
     cd 路径\到\游戏文件夹
     ```
   - 直接启动服务器：
     ```
     node server.js
     ```
   - 服务器启动后，在浏览器中访问：http://localhost:8080

### 方法二：使用VS Code Live Server

1. **安装Visual Studio Code**
   - 从[VS Code官网](https://code.visualstudio.com/)下载并安装

2. **安装Live Server扩展**
   - 打开VS Code
   - 点击左侧扩展图标或按`Ctrl+Shift+X`
   - 搜索"Live Server"并安装

3. **启动游戏**
   - 在VS Code中打开游戏文件夹
   - 右键点击`index.html`文件
   - 选择"Open with Live Server"
   - 游戏将在默认浏览器中自动打开

### 方法三：使用Python简易HTTP服务器

1. **安装Python**
   - 从[Python官网](https://www.python.org/downloads/)下载并安装

2. **启动HTTP服务器**
   - 打开命令提示符(CMD)
   - 导航到游戏目录
   - 运行以下命令：
     ```
     # Python 3.x
     python -m http.server 8080
     ```
   - 在浏览器中访问：http://localhost:8080

## 故障排除

### 黑屏问题解决方案

如果游戏启动后出现黑屏，请尝试以下步骤：

1. **检查浏览器控制台**
   - 按F12打开开发者工具
   - 查看控制台(Console)选项卡中的错误信息
   - 查看网络(Network)选项卡，确认所有资源是否正确加载

2. **确认资源文件存在**
   - 确保以下目录结构正确：
     ```
     assets/
       images/
         background.png
         character.png
         image1.jpg - image10.jpg (10个画框图片)
       videos/
         video1.mp4 - video10.mp4 (10个视频文件)
     ```

3. **尝试不同的浏览器**
   - 推荐使用Chrome、Firefox或Edge最新版本
   - 确保浏览器支持WebGL（可在[这里检查](https://get.webgl.org/)）

4. **清除浏览器缓存**
   - 按Ctrl+Shift+Delete
   - 选择清除缓存和Cookie
   - 重新加载页面

5. **检查防火墙和安全软件**
   - 某些安全软件可能会阻止本地服务器或WebGL
   - 临时禁用防火墙或添加例外

6. **查看调试信息**
   - 游戏右下角会显示调试信息面板
   - 查看是否有具体错误信息

## 游戏操作说明

- 使用WASD键移动角色
- 点击相框观看视频（需要靠近相框）
- 按ESC键可以关闭正在播放的视频
- 右上角显示已观看视频的进度
- 收集所有视频后点击宝箱获得奖励

## 游戏特点

- 3D角色控制与动画
- 与10个相框互动观看视频
- 收集所有视频后解锁中央宝箱
- 获得钻戒奖励
- 基于Three.js的WebGL渲染

## 安装与运行

### 准备工作

1. 确保您的计算机已安装现代浏览器（Chrome、Firefox、Safari等）
2. 安装Node.js（用于本地部署）

### 运行游戏

#### 方法一：使用内置服务器（推荐）

1. 克隆或下载本项目到本地
2. 准备必要的资源文件（见下文）
3. 打开命令行，进入项目根目录
4. 运行 `npm install`（首次运行时）
5. 运行 `npm start` 启动本地服务器
6. 在浏览器中访问 http://localhost:8080

#### 方法二：使用其他Web服务器

1. 克隆或下载本项目到本地
2. 准备必要的资源文件（见下文）
3. 使用VS Code的Live Server插件或其他Web服务器启动项目
4. 在浏览器中访问对应地址（通常是 http://localhost:端口号）

## 资源文件准备

游戏需要以下资源文件：

### 图像资源（放置在 assets/images/ 文件夹）

- `background.png` - 走廊背景图像
- `character.png` - 角色图像（用于创建3D模型的参考或作为2D精灵的替代）
- `floor.jpg` - 地板纹理

### 3D模型资源（放置在 assets/models/ 文件夹，可选）

- `character.glb` - 角色3D模型
- `frame.glb` - 相框3D模型（可选，当前使用基本几何体）
- `treasure.glb` - 宝箱3D模型（可选，当前使用基本几何体）
- `ring.glb` - 钻戒3D模型（可选，当前使用基本几何体）

### 视频资源（放置在 assets/videos/ 文件夹）

- `video1.mp4` 到 `video5.mp4` - 左侧5个相框视频
- `video6.mp4` 到 `video10.mp4` - 右侧5个相框视频

## 游戏控制

- 使用 WASD 键移动角色
- 点击相框观看视频
- 按 ESC 键关闭正在播放的视频
- 收集所有视频后点击宝箱获得奖励
- 右上角显示已观看视频的进度

## 自定义配置

您可以通过修改 `js/config.js` 文件来自定义游戏的各种参数：

- 场景大小和布局
- 角色移动速度和起始位置
- 相框位置和关联视频
- 宝箱和钻戒的属性

## 技术栈

- HTML5 / CSS3
- JavaScript
- Three.js（WebGL 3D渲染库）

## 浏览器兼容性

游戏支持所有现代浏览器，包括：

- Google Chrome（推荐）
- Mozilla Firefox
- Safari
- Microsoft Edge

## 注意事项

- 游戏需要WebGL支持，请确保您的浏览器和硬件支持WebGL
- 视频文件应为MP4格式，以确保最佳兼容性
- 3D模型文件应为glTF/GLB格式
- 如果没有提供3D模型，游戏将使用基本几何体作为替代

## 性能优化

游戏已实施以下性能优化措施：

1. **自适应渲染质量**：根据设备性能自动调整渲染设置
2. **视锥体剔除**：只渲染摄像机视野内的对象
3. **资源释放**：在不需要时释放视频和纹理资源
4. **性能监控**：开发环境中显示FPS计数器
5. **移动设备优化**：针对移动设备降低渲染质量

## 本地部署

项目包含一个简易的Node.js服务器（server.js），可以直接在本地部署游戏：

```bash
# 安装依赖（首次运行）
npm install

# 启动服务器
npm start
```

服务器默认在8080端口运行，可以通过环境变量PORT修改端口号：

```bash
PORT=3000 npm start
```