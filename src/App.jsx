import { useEffect, useRef, useState, useCallback } from "react";
import * as cornerstone from "@cornerstonejs/core";
import {
  RenderingEngine,
  Enums,
  init as csRenderInit,
} from "@cornerstonejs/core";
import {
  init as csToolsInit,
  addTool,
  PanTool,
  WindowLevelTool,
  ZoomTool,
  ToolGroupManager,
  Enums as ToolsEnums,
} from "@cornerstonejs/tools";
import dicomImageLoader, {
  init as dicomImageLoaderInit,
} from "@cornerstonejs/dicom-image-loader";
import * as dicomParser from "dicom-parser";
import "./App.css";

const { ViewportType } = Enums;
const { MouseBindings } = ToolsEnums;

function App() {
  const elementRef = useRef(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const renderingEngineRef = useRef(null);

  // 初始化 Cornerstone
  useEffect(() => {
    const initCornerstone = async () => {
      try {
        // 初始化 cornerstone
        await csRenderInit();

        // 确保 dicomImageLoader.external 存在
        if (!dicomImageLoader.external) {
          dicomImageLoader.external = {};
        }

        // 配置 DICOM Image Loader
        dicomImageLoader.external.cornerstone = cornerstone;
        dicomImageLoader.external.dicomParser = dicomParser;

        // 初始化 dicom image loader
        dicomImageLoaderInit();
        // 确保 wadouri 加载器已注册（幂等）
        try {
          if (dicomImageLoader?.wadouri?.register) {
            dicomImageLoader.wadouri.register();
          }
        } catch (e) {
          console.warn("注册 wadouri 加载器时出错（可忽略）", e);
        }

        // 可选：增加 XHR 调试日志，便于定位“卡在加载中”
        try {
          if (dicomImageLoader?.internal?.setOptions) {
            dicomImageLoader.internal.setOptions({
              onloadstart: (_e, params) => {
                console.log("DICOM 请求开始", params?.url);
              },
              onprogress: (e, params) => {
                console.log(
                  "DICOM 加载进度",
                  params?.url,
                  e?.loaded,
                  e?.total
                );
              },
              onreadystatechange: (e, params) => {
                const xhr = e?.target;
                console.log(
                  "DICOM readyState",
                  params?.url,
                  xhr?.readyState,
                  xhr?.status
                );
              },
              onloadend: (_e, params) => {
                console.log("DICOM 请求结束", params?.url);
              },
              beforeProcessing: (xhr) => Promise.resolve(xhr.response),
              errorInterceptor: (error) => {
                console.error("DICOM 请求错误", error);
              },
            });
          }
        } catch (e) {
          console.warn("设置 dicomImageLoader 调试选项失败（可忽略）", e);
        }

        console.log(dicomImageLoader)
        // 配置 Web Workers
        // dicomImageLoader.configure({
        //   useWebWorkers: false, // 简化配置
        // });

        // 初始化工具
        await csToolsInit();

        // 添加工具
        addTool(PanTool);
        addTool(WindowLevelTool);
        addTool(ZoomTool);

        setIsInitialized(true);
        console.log("Cornerstone 初始化成功");
      } catch (err) {
        console.error("Cornerstone 初始化失败:", err);
        setError("初始化失败: " + err.message);
      }
    };

    initCornerstone();

    // 清理函数
    return () => {
      if (renderingEngineRef.current) {
        renderingEngineRef.current.destroy();
      }
    };
  }, []);

  // 加载和渲染 DICOM 文件
  const loadDicomFile = useCallback(async () => {
    if (!isInitialized || !elementRef.current) return;

    setIsLoading(true);
    setError(null);

    try {
      const element = elementRef.current;

      // 创建渲染引擎
      const renderingEngineId = "myRenderingEngine";
      const renderingEngine = new RenderingEngine(renderingEngineId);
      renderingEngineRef.current = renderingEngine;

      // 创建视口
      const viewportId = "CT_SAGITTAL_STACK";
      const viewportInput = {
        viewportId,
        type: ViewportType.STACK,
        element,
        defaultOptions: {
          background: [0, 0, 0],
        },
      };

      renderingEngine.enableElement(viewportInput);

      // 获取视口
      const viewport = renderingEngine.getViewport(viewportId);

      // 创建工具组
      const toolGroupId = "STACK_TOOL_GROUP_ID";
      const toolGroup = ToolGroupManager.createToolGroup(toolGroupId);

      // 添加工具到工具组
      toolGroup.addTool(WindowLevelTool.toolName);
      toolGroup.addTool(PanTool.toolName);
      toolGroup.addTool(ZoomTool.toolName);



      // 设置工具为激活状态
      toolGroup.setToolActive(WindowLevelTool.toolName, {
        bindings: [{ mouseButton: MouseBindings.Primary }],
      });
      toolGroup.setToolActive(PanTool.toolName, {
        bindings: [{ mouseButton: MouseBindings.Auxiliary }],
      });
      toolGroup.setToolActive(ZoomTool.toolName, {
        bindings: [{ mouseButton: MouseBindings.Secondary }],
      });

      // 将工具组添加到视口
      toolGroup.addViewport(viewportId, renderingEngineId);

      // 加载图像
      const imageId = "wadouri:/3.dcm";
      const imageIds = [imageId];

      // 设置图像堆栈
      await viewport.setStack(imageIds);

      // 渲染
      renderingEngine.render();

      console.log("DICOM 文件加载成功");
    } catch (err) {
      console.error("加载 DICOM 文件失败:", err);
      setError("加载失败: " + err.message);
    } finally {
      setIsLoading(false);
    }
  }, [isInitialized]);

  // 初始化完成后自动加载
  useEffect(() => {
    if (isInitialized) {
      loadDicomFile();
    }
  }, [isInitialized, loadDicomFile]);

  return (
    <div style={{ padding: "20px", display: "flex", flexDirection: "column", alignItems: "center" }}>
      <h1>DICOM 图像查看器</h1>

      <div style={{ marginBottom: "20px" }}>
        <button
          onClick={loadDicomFile}
          disabled={!isInitialized || isLoading}
          style={{
            padding: "10px 20px",
            fontSize: "16px",
            backgroundColor: isInitialized ? "#007bff" : "#6c757d",
            color: "white",
            border: "none",
            borderRadius: "4px",
            cursor: isInitialized ? "pointer" : "not-allowed",
          }}
        >
          {isLoading ? "加载中..." : "重新加载 DICOM 文件"}
        </button>
      </div>

      {error && (
        <div
          style={{
            padding: "10px",
            backgroundColor: "#f8d7da",
            color: "#721c24",
            border: "1px solid #f5c6cb",
            borderRadius: "4px",
            marginBottom: "20px",
          }}
        >
          错误: {error}
        </div>
      )}

      {!isInitialized && (
        <div
          style={{
            padding: "10px",
            backgroundColor: "#d1ecf1",
            color: "#0c5460",
            border: "1px solid #bee5eb",
            borderRadius: "4px",
            marginBottom: "20px",
          }}
        >
          正在初始化 Cornerstone...
        </div>
      )}

      {/* DICOM 显示区域 */}
      <div
        ref={elementRef}
        style={{
          width: "512px",
          height: "512px",
          backgroundColor: "#000",
          border: "1px solid #ccc",
          position: "relative",
        }}
      >
        {!isLoading && isInitialized && (
          <div
            style={{
              position: "absolute",
              left:"0",
              color: "#ccc",
              textAlign: "center", 
            }}
          >
            图像将自动加载，或点击按钮重新加载
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
