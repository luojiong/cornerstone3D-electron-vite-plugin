import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import wasm from 'vite-plugin-wasm';
import worker from 'vite-plugin-worker';
import { viteStaticCopy } from 'vite-plugin-static-copy';
export default defineConfig({
  assetsInclude: ['**/*.wasm'],
  plugins: [
    react(),
    wasm(),
    worker,
    // 不使用 commonjs 插件，依赖通过 optimizeDeps 由 esbuild 预打包为 ESM
    // 可选：构建时将 WASM 拷贝到输出目录，避免路径问题（dev 不影响）
    viteStaticCopy({
      targets: [
        {
          src: 'node_modules/@cornerstonejs/codec-libjpeg-turbo-8bit/dist/libjpegturbowasm_decode.wasm',
          dest: 'wasm',
        },
        {
          src: 'node_modules/@cornerstonejs/codec-openjpeg/dist/openjpegwasm.wasm',
          dest: 'wasm',
        },
        {
          src: 'node_modules/@cornerstonejs/codec-openjph/dist/openjphjs.wasm',
          dest: 'wasm',
        },
        {
          src: 'node_modules/@cornerstonejs/codec-charls/dist/charlswasm_decode.wasm',
          dest: 'wasm',
        },
      ],
    }),
    // for dicom-parser
    // viteCommonjs(),
  ],
  // seems like only required in dev mode
  optimizeDeps: {
    exclude: [
      '@cornerstonejs/dicom-image-loader',
    ],
    include: [
      'dicom-parser',
      '@cornerstonejs/codec-libjpeg-turbo-8bit',
      '@cornerstonejs/codec-libjpeg-turbo-8bit/decodewasmjs',
      '@cornerstonejs/codec-openjpeg',
      '@cornerstonejs/codec-openjpeg/decodewasmjs',
      '@cornerstonejs/codec-openjph',
      '@cornerstonejs/codec-openjph/wasmjs',
      '@cornerstonejs/codec-charls',
      '@cornerstonejs/codec-charls/decodewasmjs',
      'comlink',
    ],
  },
  resolve: {
    alias: {
      zlib: './src/shims/zlib.js',
    },
  },
  worker: {
    format: 'es',
  },
});