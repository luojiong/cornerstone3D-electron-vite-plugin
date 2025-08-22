import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import electron from "vite-plugin-electron/simple";
import wasm from 'vite-plugin-wasm';
import worker from 'vite-plugin-worker';
import { viteStaticCopy } from 'vite-plugin-static-copy';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {

  return {
    assetsInclude: ["**/*.wasm"],
    plugins: [
      react(),
      wasm(),
      worker,
      viteStaticCopy({
        targets: [
          {
            src: "node_modules/@cornerstonejs/codec-libjpeg-turbo-8bit/dist/libjpegturbowasm_decode.wasm",
            dest: "wasm",
          },
          {
            src: "node_modules/@cornerstonejs/codec-openjpeg/dist/openjpegwasm.wasm",
            dest: "wasm",
          },
          {
            src: "node_modules/@cornerstonejs/codec-openjph/dist/openjphjs.wasm",
            dest: "wasm",
          },
          {
            src: "node_modules/@cornerstonejs/codec-charls/dist/charlswasm_decode.wasm",
            dest: "wasm",
          },
        ],
      }),
      electron({
        main: {
          // Shortcut of `build.lib.entry`.
          entry: "electron/main.ts",
          vite: {
            build: {
              outDir: "dist-electron",
              lib: {
                entry: "electron/main.ts",
                formats: ["es"],
                fileName: () => "main.js",
              },
              rollupOptions: {
                // 主进程打包时不要打进 electron 与 mmap-io（原生模块）
                external: ["electron", "mmap-io"],
                output: {
                  format: "es",
                },
              },
            },
          },
        },
        preload: {
          // Shortcut of `build.rollupOptions.input`.
          // Preload scripts may contain Web assets, so use the `build.rollupOptions.input` instead `build.lib.entry`.
          input: path.join(__dirname, "electron/preload.ts"),
          vite: {
            build: {
              outDir: "dist-electron",
              lib: {
                entry: "electron/preload.ts",
                formats: ["es"],
                fileName: () => "preload.mjs",
              },
              rollupOptions: {
                // 预加载同样 external
                external: ["electron", "mmap-io"],
                output: {
                  format: "es",
                },
              },
            },
          },
        },
        // Ployfill the Electron and Node.js API for Renderer process.
        // If you want use Node.js in Renderer process, the `nodeIntegration` needs to be enabled in the Main process.
        // See 👉 https://github.com/electron-vite/vite-plugin-electron-renderer
        renderer:
          mode === "test"
            ? // https://github.com/electron-vite/vite-plugin-electron-renderer/issues/78#issuecomment-2053600808
              undefined
            : {},
      }),
    ],
    optimizeDeps: {
      // 防止将 sharp 预构建到渲染进程依赖里
      exclude: [
        "sharp",
        // 排除可能在预构建阶段使用 worker 的库，避免生成 `worker.js?worker_file&type=module` 这类不兼容入口
        "@ffmpeg/ffmpeg",
        "@ffmpeg/util",
        "fflate",
        "@cornerstonejs/dicom-image-loader",
      ],
      include: [
        "dicom-parser",
        "@cornerstonejs/codec-libjpeg-turbo-8bit",
        "@cornerstonejs/codec-libjpeg-turbo-8bit/decodewasmjs",
        "@cornerstonejs/codec-openjpeg",
        "@cornerstonejs/codec-openjpeg/decodewasmjs",
        "@cornerstonejs/codec-openjph",
        "@cornerstonejs/codec-openjph/wasmjs",
        "@cornerstonejs/codec-charls",
        "@cornerstonejs/codec-charls/decodewasmjs",
        "comlink",
      ],
    },
    resolve: {
      alias: {
        src: path.join(__dirname, "./src"),
        zlib: "./src/shims/zlib.js",
      },
    },
    worker: {
      format: "es",
    },
    css: {
      preprocessorOptions: {
        less: {
          javascriptEnabled: true,
          charset: false,
          modifyVars: {
            // "@primary-color": "#007f99",
          },
          additionalData: '@import "src/assets/style/index.less";',
        },
      },
    },
    build: {
      rollupOptions: {
        output: {
          // 把构建时 node_modules 下的包单独打包到一个文件中，和业务代码分开打包。好处是业务代码打包体积小，依赖 node_modules下的包一起打包，node_modules不经常变化，可以使用到缓存，只加载业务代码。
          manualChunks: (id) => {
            if (id.includes("node_modules")) {
              return "vendor";
            }
            return undefined;
          },
        },
      },
    },
  };
});
