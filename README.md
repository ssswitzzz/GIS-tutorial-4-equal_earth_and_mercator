# GIS Tutorial 4: Equal Earth & Mercator Projections (Manim)

高质量的地图投影数学物理心智模型可视化动画套件，使用 **Manim Community** 开发，基于中国科学院地理科学与资源研究所（CAS）权威全球矢量边界构建。

本工程系统性对比并动态演示了：
1. **墨卡托投影 (Mercator Projection)**：正轴等角圆柱投影原理、投影视线与圆柱面展开、蒂索变形椭圆（Tissot's Indicatrix）以及高纬度“格陵兰 vs 非洲”面积失真。
2. **平等地球投影 (Equal Earth Projection)**：Bojan Šavrič, Tom Patterson & Bernhard Jenny 于 2018 年提出的等面积伪圆柱投影，采用“切千层饼 + 橡皮泥守恒”物理心智模型进行渐进式可视化。

---

## 📽️ 核心动画与心智模型

### 1. 墨卡托投影 (`MercatorScene`)
- **3D 地球与圆柱切面**：白底柔和地球仪，经纬网格与 CAS 权威海岸线。
- **球心视线发射**：从地心沿纬度向外投射，直观揭示为什么高纬度投影距离趋近于无穷大。
- **圆柱剪开展平**：圆柱面沿经线剪开并展开为平面矩形，经纬线交织成正交方格网。
- **蒂索变形椭圆**：从赤道到高纬度圆形保持正圆（等角保形），但几何面积急剧膨胀。
- **地缘面积对照**：格陵兰岛与非洲大陆视觉面积对比（1:1 错觉 vs 14:1 实际比例）。

### 2. 平等地球投影 (`EqualEarthScene`)
摒弃枯燥的高维透视推导，采用具象的**物理几何五步法**：
1. **切千层饼 (Slice)**：将球面沿平行纬线横切为一组等距水平微元切片。
2. **平头修剪 (Clip & Unfurl)**：保留两极宽度为赤道的 59.25%，避免尖锐顶角失真，定义外廓边界。
3. **橡皮泥守恒 (Equiareal Squeeze)**：基于面积守恒微分方程，对纬线进行非线性垂直挤压。
4. **穿针引线 (Curved Meridians)**：绘制圆润的伪圆柱对称经线群，控制边际形状畸变。
5. **矢量陆地装配 (Vector World)**：在平等地球网格上映射 CAS 全球大陆，重现非洲（3037 万 km²）与格陵兰岛（216 万 km²）的真实 14:1 比例关系。

---

## 📂 项目结构

```text
├── src/
│   ├── geo_math.py            # 核心投影数学库（Mercator、Equal Earth 公式、Tissot 椭圆、CAS 矢量加载器）
│   ├── mercator_scene.py      # 墨卡托投影完整动画场景 (Manim)
│   ├── equal_earth_scene.py   # 平等地球投影完整动画场景 (Manim)
│   └── countries_shp/         # CAS 官方全球矢量数据 (Shapefile)
├── data/
│   ├── cas_world_land.json    # 预解析轻量化全球陆地矢量
│   ├── cas_greenland.json     # 预解析格陵兰多边形
│   └── cas_africa.json        # 预解析非洲 58 个实体完整多边形
├── video-motion-design/       # 视频动效设计规范与 Skill 约束指南
├── render_all.py              # 一键全场景自动化渲染脚本
├── pyproject.toml             # uv / Python 依赖声明
├── uv.lock                    # 依赖锁定版本
└── README.md
```

---

## 🚀 快速开始

### 1. 环境准备
推荐使用高性能 Python 包管理器 [uv](https://docs.astral.sh/uv/)：

```bash
# 克隆仓库
git clone https://github.com/ssswitzzz/GIS-tutorial-4-equal_earth_and_mercator.git
cd GIS-tutorial-4-equal_earth_and_mercator

# 安装并同步依赖
uv sync
```

### 2. 运行渲染

**一键渲染两个场景 (480p 预览质量)：**
```bash
uv run python render_all.py
```

**单场景独立渲染：**
```bash
# 渲染墨卡托投影场景
uv run manim -ql src/mercator_scene.py MercatorScene

# 渲染平等地球场景
uv run manim -ql src/equal_earth_scene.py EqualEarthScene
```

> **提示**：如需高分辨率输出，可将 `-ql` (480p) 参数替换为 `-qm` (720p) 或 `-qh` (1080p)。

---

## 📐 投影数学公式

### 墨卡托投影 (Mercator Projection)
$$x = R \cdot (\lambda - \lambda_0)$$
$$y = R \cdot \ln\left[\tan\left(\frac{\pi}{4} + \frac{\varphi}{2}\right)\right]$$

### 平等地球投影 (Equal Earth Projection)
$$\sin\theta = \frac{\sqrt{3}}{2}\sin\varphi$$
$$x = \frac{2\sqrt{3}(\lambda - \lambda_0)\cos\theta}{3(9A_4\theta^8 + 7A_3\theta^6 + 3A_2\theta^2 + A_1)}$$
$$y = A_4\theta^9 + A_3\theta^7 + A_2\theta^3 + A_1\theta$$

其中多项式拟合常数：
- $A_1 = 1.340264$
- $A_2 = -0.081106$
- $A_3 = 0.000893$
- $A_4 = 0.003796$

---

## 📜 许可证与数据来源
- 地图矢量边界：来自中国科学院地理科学与资源研究所（CAS）基础地理数据集。
- 视频设计规范遵循 `video-motion-design` 动效指南。
