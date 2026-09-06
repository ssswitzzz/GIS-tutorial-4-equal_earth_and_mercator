# Remotion Video Project

基于 Remotion 构建的地图投影动画前端工程，遵循 `video-motion-design` 规范标准。

## 常用命令

```bash
# 启动本地实时预览 Studio
npm run dev

# 导出渲染视频 (4K 60fps)
npm run build

# 渲染单帧用于校验 (如第 60 帧)
npx remotion still src/index.ts MainScene preview.png --frame=60
```
