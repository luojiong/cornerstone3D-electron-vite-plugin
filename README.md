# Cornerstone3D Vite Electron Demo Project

**[English](README.md) | [中文](README.zh.md)**

## Overview

This is a demonstration project showing how to integrate cornerstone3D with Vite for medical imaging applications. The main focus is solving the challenge of bundling CommonJS (CJS) modules as ECMAScript modules (ESM) directly with Vite, avoiding conflicts with Electron framework when using viteCommon plugins.

## Key Features

- 🏥 **Medical Imaging**: DICOM file viewer using cornerstone3D
- 🚀 **Vite Integration**: Optimized Vite configuration for cornerstone3D
- 🔧 **CJS to ESM**: Direct bundling without viteCommon plugin conflicts
- ⚡ **Performance**: Fast development and build process
- 🖱️ **Interactive Tools**: Pan, zoom, and window level tools included

## Demo Features

This example includes:
- DICOM image loading and display
- Interactive medical imaging tools (Pan, Zoom, Window/Level)
- WASM codec support for various image formats
- Proper handling of cornerstone3D dependencies in Vite

## Getting Started

1. **Clone the repository**
```bash
git clone <repository-url>
cd vite-project
```

2. **Install dependencies**
```bash
npm install
# or
yarn install
# or
pnpm install
```

3. **Start development server**
```bash
npm run dev
# or
yarn dev
# or
pnpm dev
```

4. **Build for production**
```bash
npm run build
# or
yarn build
# or
pnpm build
```

## Key Configuration

The project demonstrates important Vite configurations:

```javascript
// vite.config.js - Key configurations
export default defineConfig({
  plugins: [
    react(),
    wasm(),
    worker,
    // WASM files copying for cornerstone3D codecs
    viteStaticCopy({ /* ... */ })
  ],
  optimizeDeps: {
    // Exclude problematic dependencies
    exclude: ['@cornerstonejs/dicom-image-loader'],
    // Include CJS dependencies for ESM conversion
    include: ['dicom-parser', /* ... */]
  },
  resolve: {
    alias: {
      zlib: './src/shims/zlib.js' // Node.js polyfill
    }
  }
})
```

## Electron Integration

For Electron applications, we provide a complete configuration example in `example.electron-viete.config.ts`. This file demonstrates:

- Complete Electron + Vite integration
- Proper handling of main and renderer processes
- WASM loading in Electron context
- Production build configuration for Electron

You can use this configuration as a reference for integrating this setup into your Electron application.

## Technologies Used

- **React 19** - UI framework
- **Vite 7** - Build tool and dev server
- **Cornerstone3D** - Medical imaging library
- **DICOM Parser** - DICOM file handling
- **WebAssembly** - High-performance image codecs

## Requirements

- Node.js >= 22
- npm/yarn/pnpm
- Modern browser with WebAssembly support
