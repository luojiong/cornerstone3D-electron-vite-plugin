# Cornerstone3D Vite 示例项目

**[English](README.md) | [中文](README.zh.md)**

## 项目概述

这是一个演示如何在医学影像应用中集成cornerstone3D与Vite的示例项目。主要解决的问题是让Vite直接将CommonJS(CJS)模块打包成ECMAScript模块(ESM)，避开使用viteCommon插件时与Electron框架产生的冲突。

## 核心特性

- 🏥 **医学影像**: 使用cornerstone3D的DICOM文件查看器
- 🚀 **Vite集成**: 为cornerstone3D优化的Vite配置
- 🔧 **CJS转ESM**: 直接打包，避免viteCommon插件冲突
- ⚡ **高性能**: 快速的开发和构建过程
- 🖱️ **交互工具**: 包含平移、缩放和窗位窗宽工具

## 演示功能

本示例包含：
- DICOM图像加载和显示
- 交互式医学影像工具（平移、缩放、窗位/窗宽）
- 支持多种图像格式的WASM编解码器
- 在Vite中正确处理cornerstone3D依赖

## 快速开始

1. **克隆仓库**
```bash
git clone <repository-url>
cd vite-project
```

2. **安装依赖**
```bash
npm install
# 或者
yarn install
# 或者
pnpm install
```

3. **启动开发服务器**
```bash
npm run dev
# 或者
yarn dev
# 或者
pnpm dev
```

4. **构建生产版本**
```bash
npm run build
# 或者
yarn build
# 或者
pnpm build
```

## 关键配置

项目演示了重要的Vite配置：

```javascript
// vite.config.js - 关键配置
export default defineConfig({
  plugins: [
    react(),
    wasm(),
    worker,
    // 为cornerstone3D编解码器复制WASM文件
    viteStaticCopy({ /* ... */ })
  ],
  optimizeDeps: {
    // 排除有问题的依赖
    exclude: ['@cornerstonejs/dicom-image-loader'],
    // 包含CJS依赖以进行ESM转换
    include: ['dicom-parser', /* ... */]
  },
  resolve: {
    alias: {
      zlib: './src/shims/zlib.js' // Node.js polyfill
    }
  }
})
```

## Electron 集成

对于Electron应用，我们在 `example.electron-viete.config.ts` 文件中提供了完整的配置示例。该文件演示了：

- 完整的Electron + Vite集成
- 主进程和渲染进程的正确处理
- 在Electron环境中的WASM加载
- Electron的生产构建配置

你可以将此配置作为参考，在你的Electron应用中集成这套方案。

## 使用的技术

- **React 19** - UI框架
- **Vite 7** - 构建工具和开发服务器
- **Cornerstone3D** - 医学影像库
- **DICOM Parser** - DICOM文件处理
- **WebAssembly** - 高性能图像编解码器

## 系统要求

- Node.js >= 22
- npm/yarn/pnpm
- 支持WebAssembly的现代浏览器
