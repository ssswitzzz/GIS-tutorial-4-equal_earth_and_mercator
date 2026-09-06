"""
墨卡托投影 (Mercator Projection) 3D 到 2D 教学示意动画
遵循 video-motion-design 文献纸张风格 (Editorial Paper Style):
- 字体：思源宋体 (Source Han Serif CN)，杜绝无必要英文混排
- 公式：全要素严谨 LaTeX 排版 (MathTex)
- 色调：典雅文献暖纸质感底色 (#F7F4EA)、墨绿林墨陆地 (#28523C)、琥珀金赤道 (#B45309)、青黛经纬网 (#7B968B)
- 矢量：完全基于 countriesCAS.shp 中国科学院地理资源所标准全球国家矢量边界
- 镜头：平滑三维轨道运镜，高帧率无缝展开展平
"""

import sys
from pathlib import Path

_ROOT = Path(__file__).resolve().parent.parent
_SRC = Path(__file__).resolve().parent
for _p in [str(_ROOT), str(_SRC)]:
    if _p not in sys.path:
        sys.path.insert(0, _p)

from manim import *
import numpy as np
from geo_math import (
    spherical_to_cartesian,
    mercator_forward,
    cylindrical_surface_point,
    generate_tissot_circle,
    load_land_data,
    filter_front_segments,
)

# ==========================================
# 典雅地图学文献调色板 (Editorial Paper Palette)
# ==========================================
FONT_SERIF = "Source Han Serif CN"
COLOR_BG = "#F7F4EA"           # 典雅暖白宣纸/羊皮纸底色
COLOR_INK = "#1F2923"          # 浓沉松烟墨黑 (标题与正文)
COLOR_INK_MUTED = "#4D5C53"    # 浅墨黛色 (副标题与边注)
COLOR_EQUATOR = "#B45309"      # 沉香琥珀金 (赤道基准线)
COLOR_PARALLEL = "#6E897D"     # 青瓷灰绿 (纬线圈)
COLOR_MERIDIAN = "#507567"     # 黛绿墨线 (经线圈)
COLOR_CYLINDER = "#2E5E70"     # 墨蓝切圆柱 (典雅青金石色)
COLOR_LAND_STROKE = "#244935"  # 墨松绿 (大陆边界线)
COLOR_LAND_FILL = "#3B694F"    # 浅墨松绿 (陆地填充)
COLOR_TERRACOTTA = "#9E382A"   # 赤陶朱砂红 (格陵兰与蒂索指示圆)
COLOR_AFRICA = "#B45309"       # 沉香赭石金 (非洲大陆高亮)
COLOR_CARD_BG = "#FFFFFF"      # 纯净宣纸白信息面板
COLOR_CARD_BORDER = "#DDD4C2"  # 宣纸木浆浅灰边框


def CText(text, font_size=24, color=COLOR_INK, weight=NORMAL, **kwargs):
    """规范中文宋体排版助手"""
    return Text(text, font=FONT_SERIF, font_size=font_size, color=color, weight=weight, **kwargs)


def CMath(tex_str, font_size=24, color=COLOR_INK, **kwargs):
    """规范数学 LaTeX 排版助手"""
    return MathTex(tex_str, font_size=font_size, color=color, **kwargs)


class MercatorProjectionScene(ThreeDScene):
    def construct(self):
        self.camera.background_color = COLOR_BG
        R = 1.62  # 地球与圆柱基准半径
        MAX_LAT_DEG = 77.5
        CYL_HALF_H = R * np.log(np.tan(np.pi / 4.0 + np.radians(MAX_LAT_DEG) / 2.0))

        # ==========================================
        # 页面固定标题栏 (固定在镜头顶层)
        # ==========================================
        main_title = CText("墨卡托投影", font_size=30, weight=BOLD, color=COLOR_INK)
        subtitle = CText("一、三维地球模型与正轴切圆柱放置", font_size=18, color=COLOR_INK_MUTED)
        header_group = VGroup(main_title, subtitle).arrange(DOWN, aligned_edge=LEFT, buff=0.12).to_corner(UL, buff=0.45)
        self.add_fixed_in_frame_mobjects(header_group)
        self.play(FadeIn(header_group, shift=DOWN * 0.15, rate_func=smooth), run_time=1.0)

        # 初始三维镜头姿态 (俯仰与偏航)
        PHI_3D = 68 * DEGREES
        THETA_3D_MID = 42.5 * DEGREES
        cam_vec_3d = np.array([np.sin(PHI_3D) * np.cos(THETA_3D_MID), np.sin(PHI_3D) * np.sin(THETA_3D_MID), np.cos(PHI_3D)])
        self.set_camera_orientation(phi=PHI_3D, theta=25 * DEGREES, zoom=0.96)

        # 1. 三维地球实体球体 (纯实心宣纸哑光质感，完全不透明，消除视觉杂乱)
        globe_sphere = Sphere(
            center=ORIGIN,
            radius=R,
            resolution=(36, 36),
            checkerboard_colors=["#ECE5D8", "#ECE5D8"],
            fill_opacity=1.0,
            stroke_width=0,
        )

        # 2. 地球自转轴与极点
        axis_line = Line3D(
            start=np.array([0, -2.25, 0]),
            end=np.array([0, 2.25, 0]),
            color=COLOR_INK_MUTED,
            thickness=0.012,
        )
        north_pole_dot = Dot3D(point=np.array([0, R, 0]), color=COLOR_CYLINDER, radius=0.05)
        south_pole_dot = Dot3D(point=np.array([0, -R, 0]), color=COLOR_CYLINDER, radius=0.05)

        # 3. 赤道 (金琥珀色高亮切线基准，背面剔除)
        equator_raw = [
            spherical_to_cartesian(lon, 0.0, radius=R * 1.0025)
            for lon in np.linspace(-np.pi, np.pi, 120)
        ]
        equator_ring = VGroup()
        for seg in filter_front_segments(equator_raw, cam_vec_3d, threshold=-0.12):
            eq_m = VMobject(color=COLOR_EQUATOR, stroke_width=2.0)
            eq_m.set_points_smoothly(seg)
            equator_ring.add(eq_m)

        # 4. 纬线圈簇 (青瓷灰绿，细致典雅，背面剔除)
        parallel_mobs = VGroup()
        for lat_deg in [-60, -40, -20, 20, 40, 60]:
            lat_r = np.radians(lat_deg)
            raw_pts = [
                spherical_to_cartesian(lon, lat_r, radius=R * 1.0015)
                for lon in np.linspace(-np.pi, np.pi, 90)
            ]
            for seg in filter_front_segments(raw_pts, cam_vec_3d, threshold=-0.12):
                ring = VMobject(color=COLOR_PARALLEL, stroke_width=0.6, stroke_opacity=0.65)
                ring.set_points_smoothly(seg)
                parallel_mobs.add(ring)

        # 5. 经线圈簇 (黛绿墨线，精细规整，背面剔除)
        meridian_mobs = VGroup()
        for lon_deg in range(-150, 181, 30):
            lon_r = np.radians(lon_deg)
            raw_pts = [
                spherical_to_cartesian(lon_r, lat, radius=R * 1.0015)
                for lat in np.linspace(-np.pi / 2 * 0.96, np.pi / 2 * 0.96, 50)
            ]
            for seg in filter_front_segments(raw_pts, cam_vec_3d, threshold=-0.12):
                arc = VMobject(color=COLOR_MERIDIAN, stroke_width=0.55, stroke_opacity=0.55)
                arc.set_points_smoothly(seg)
                meridian_mobs.add(arc)

        # 6. 全球高精度国家矢量大陆 (基于 countriesCAS.shp，背面剔除，精细墨线)
        world_land, grl_data, afr_data = load_land_data()
        land_globe_mobs = VGroup()
        for ring in world_land:
            raw_pts = [
                spherical_to_cartesian(np.radians(pt[0]), np.radians(pt[1]), radius=R * 1.002)
                for pt in ring
            ]
            for seg in filter_front_segments(raw_pts, cam_vec_3d, threshold=-0.12):
                poly = VMobject(color=COLOR_LAND_STROKE, stroke_width=0.6, stroke_opacity=0.92)
                poly.set_points_as_corners(seg)
                land_globe_mobs.add(poly)

        globe_group = Group(
            globe_sphere,
            axis_line,
            north_pole_dot,
            south_pole_dot,
            equator_ring,
            parallel_mobs,
            meridian_mobs,
            land_globe_mobs,
        )

        self.play(FadeIn(globe_group, rate_func=smooth), run_time=1.6)
        # 平滑缓速自转三维展示
        self.move_camera(theta=60 * DEGREES, run_time=2.2, rate_func=smooth)

        # ==========================================
        # 阶段二：引入正轴相切圆柱体
        # ==========================================
        card_1_title = CText("圆柱空间构型与切线约束", font_size=17, weight=BOLD, color=COLOR_EQUATOR)
        card_1_line1 = CText("• 正轴特征：圆柱中心对称轴与地轴完全重合", font_size=14, color=COLOR_INK)
        card_1_line2 = CText("• 相切特征：圆柱内壁在赤道处与地球精准相切", font_size=14, color=COLOR_INK)
        card_1_content = VGroup(card_1_title, card_1_line1, card_1_line2).arrange(DOWN, aligned_edge=LEFT, buff=0.14)

        card_1_panel = RoundedRectangle(
            corner_radius=0.1,
            width=card_1_content.width + 0.5,
            height=card_1_content.height + 0.4,
            fill_color=COLOR_CARD_BG,
            fill_opacity=0.95,
            stroke_color=COLOR_CARD_BORDER,
            stroke_width=1.4,
        )
        card_1 = VGroup(card_1_panel, card_1_content).to_corner(UR, buff=0.45)
        self.add_fixed_in_frame_mobjects(card_1)
        self.play(FadeIn(card_1, shift=LEFT * 0.25, rate_func=smooth), run_time=1.0)

        # 构造三维磨砂微透切圆柱面 (纤细典雅，不遮挡地球)
        cyl_top_rim = VMobject(color=COLOR_CYLINDER, stroke_width=1.0, stroke_opacity=0.75)
        cyl_top_rim.set_points_smoothly([
            np.array([R * np.sin(l), CYL_HALF_H, R * np.cos(l)])
            for l in np.linspace(-np.pi, np.pi, 72)
        ])

        cyl_bot_rim = VMobject(color=COLOR_CYLINDER, stroke_width=1.0, stroke_opacity=0.75)
        cyl_bot_rim.set_points_smoothly([
            np.array([R * np.sin(l), -CYL_HALF_H, R * np.cos(l)])
            for l in np.linspace(-np.pi, np.pi, 72)
        ])

        cyl_ribs = VGroup()
        for lon_deg in range(-150, 181, 60):
            lon_r = np.radians(lon_deg)
            p_top = np.array([R * np.sin(lon_r), CYL_HALF_H, R * np.cos(lon_r)])
            p_bot = np.array([R * np.sin(lon_r), -CYL_HALF_H, R * np.cos(lon_r)])
            rib = VMobject(color=COLOR_CYLINDER, stroke_width=0.45, stroke_opacity=0.35)
            rib.set_points_as_corners([p_bot, p_top])
            cyl_ribs.add(rib)

        cyl_mesh = Cylinder(
            radius=R,
            height=2 * CYL_HALF_H,
            direction=UP,
            resolution=(24, 24),
            fill_color=COLOR_CYLINDER,
            fill_opacity=0.06,
            stroke_width=0,
        )

        cylinder_group = Group(cyl_mesh, cyl_top_rim, cyl_bot_rim, cyl_ribs)
        self.play(FadeIn(cylinder_group, rate_func=smooth), run_time=1.8)
        self.wait(0.4)

        # 赤道相切光圈呼吸高亮
        equator_glow = equator_ring.copy().set_color(COLOR_EQUATOR).set_stroke(width=5.5)
        self.play(ShowPassingFlash(equator_glow, time_width=0.8, run_time=1.5))

        # ==========================================
        # 阶段三：经纬网投影机理与等角拉伸
        # ==========================================
        sub2_target = CText("二、投影机理与等角拉伸数学规律", font_size=18, color=COLOR_INK_MUTED)
        sub2_target.next_to(main_title, DOWN, aligned_edge=LEFT, buff=0.12)
        self.add_fixed_in_frame_mobjects(sub2_target)
        self.play(
            FadeOut(card_1, shift=RIGHT * 0.25, rate_func=smooth),
            FadeOut(subtitle, shift=UP * 0.1, rate_func=smooth),
            FadeIn(sub2_target, shift=UP * 0.1, rate_func=smooth),
            run_time=0.8
        )
        self.remove_fixed_in_frame_mobjects(card_1)
        self.remove_fixed_in_frame_mobjects(subtitle)
        self.remove(card_1)
        self.remove(subtitle)
        subtitle = sub2_target

        card_2_title = CText("正轴等角圆柱投影原理", font_size=17, weight=BOLD, color=COLOR_CYLINDER)
        card_2_m1 = VGroup(
            CText("1. 经线投影为等间距竖直直线：", font_size=14, color=COLOR_INK),
            CMath(r"x = R \cdot \lambda", font_size=23, color=COLOR_INK)
        ).arrange(RIGHT, buff=0.15)
        card_2_m2_text = CText("2. 保持局部形状等角，纬线间距剧烈拉伸：", font_size=14, color=COLOR_INK)
        card_2_m2_formula = CMath(
            r"y = R \int_0^\phi \sec\phi' \, d\phi' = R \ln \tan \left( \frac{\pi}{4} + \frac{\phi}{2} \right)",
            font_size=22,
            color=COLOR_EQUATOR
        )
        card_2_m3 = VGroup(
            CText("3. 局部面积放大系数：", font_size=14, color=COLOR_INK),
            CMath(r"k = h = \sec\phi", font_size=21, color=COLOR_TERRACOTTA),
            CText("（两极趋向无穷大）", font_size=13, color=COLOR_TERRACOTTA),
        ).arrange(RIGHT, buff=0.10)

        card_2_content = VGroup(
            card_2_title,
            card_2_m1,
            card_2_m2_text,
            card_2_m2_formula,
            card_2_m3,
        ).arrange(DOWN, aligned_edge=LEFT, buff=0.12)

        card_2_panel = RoundedRectangle(
            corner_radius=0.1,
            width=card_2_content.width + 0.5,
            height=card_2_content.height + 0.45,
            fill_color=COLOR_CARD_BG,
            fill_opacity=0.96,
            stroke_color=COLOR_CARD_BORDER,
            stroke_width=1.4,
        )
        card_2 = VGroup(card_2_panel, card_2_content).to_corner(UR, buff=0.4)
        self.add_fixed_in_frame_mobjects(card_2)
        self.play(FadeIn(card_2, shift=LEFT * 0.25, rate_func=smooth), run_time=1.0)

        # 圆柱面上的投影像 (纬线与 CAS 大陆轮廓)
        cyl_parallels = VGroup()
        for lat_deg in [-70, -60, -40, -20, 0, 20, 40, 60, 70]:
            lat_r = np.radians(lat_deg)
            _, y_merc = mercator_forward(0.0, lat_r, radius=R, max_lat_deg=MAX_LAT_DEG)
            col = COLOR_EQUATOR if lat_deg == 0 else COLOR_PARALLEL
            wid = 1.8 if lat_deg == 0 else 0.65
            ring = VMobject(color=col, stroke_width=wid, stroke_opacity=0.85)
            ring.set_points_smoothly([
                np.array([R * np.sin(l), y_merc, R * np.cos(l)])
                for l in np.linspace(-np.pi, np.pi, 72)
            ])
            cyl_parallels.add(ring)

        cyl_continents = VGroup()
        for ring in world_land:
            pts = [
                cylindrical_surface_point(np.radians(pt[0]), np.radians(pt[1]), radius=R * 1.0025, max_lat_deg=MAX_LAT_DEG)
                for pt in ring
            ]
            poly = VMobject(color=COLOR_LAND_STROKE, stroke_width=0.6, stroke_opacity=0.92)
            poly.set_points_as_corners(pts)
            cyl_continents.add(poly)

        # 投影投射射线演示
        sample_lats = [0.0, np.radians(45.0), np.radians(68.0)]
        sample_lons = [0.0, np.radians(50.0), np.radians(-60.0)]
        rays = VGroup()
        for lat_r, lon_r in zip(sample_lats, sample_lons):
            p_sphere = spherical_to_cartesian(lon_r, lat_r, radius=R)
            p_cyl = cylindrical_surface_point(lon_r, lat_r, radius=R, max_lat_deg=MAX_LAT_DEG)
            ray = Line3D(start=p_sphere, end=p_cyl, color=COLOR_EQUATOR, thickness=0.012)
            rays.add(ray)

        self.play(Create(rays, rate_func=smooth), run_time=1.0)
        self.play(FadeIn(cyl_parallels), FadeIn(cyl_continents), run_time=1.6, rate_func=smooth)
        self.wait(0.3)
        self.play(FadeOut(rays), run_time=0.6)

        # 蒂索指示圆演示 (Equator, 45, 70)
        tissot_sphere_mobs = VGroup()
        tissot_cyl_mobs = VGroup()
        test_latitudes = [0, 45, 70]

        for t_lat in test_latitudes:
            lons, lats = generate_tissot_circle(0, t_lat, radius_deg=5.5)
            pts_sph = [spherical_to_cartesian(l, la, radius=R * 1.004) for l, la in zip(lons, lats)]
            c_sph = VMobject(color=COLOR_TERRACOTTA, stroke_width=2.4).set_points_smoothly(pts_sph)
            tissot_sphere_mobs.add(c_sph)

            pts_cyl = [cylindrical_surface_point(l, la, radius=R * 1.004, max_lat_deg=MAX_LAT_DEG) for l, la in zip(lons, lats)]
            c_cyl = VMobject(color=COLOR_TERRACOTTA, stroke_width=2.6).set_points_smoothly(pts_cyl)
            tissot_cyl_mobs.add(c_cyl)

        tissot_tip_text = VGroup(
            CText("蒂索变形指标：微元始终保持正圆（严格等角），但两极方向面积发生指数级剧烈膨胀", font_size=14, color=COLOR_TERRACOTTA)
        )
        tissot_tip_panel = RoundedRectangle(
            corner_radius=0.08,
            width=tissot_tip_text.width + 0.4,
            height=tissot_tip_text.height + 0.25,
            fill_color=COLOR_CARD_BG,
            fill_opacity=0.95,
            stroke_color=COLOR_CARD_BORDER,
            stroke_width=1.2,
        )
        tissot_tag = VGroup(tissot_tip_panel, tissot_tip_text).to_edge(DOWN, buff=0.4)
        self.add_fixed_in_frame_mobjects(tissot_tag)

        self.play(FadeIn(tissot_sphere_mobs, rate_func=smooth), run_time=0.8)
        self.play(TransformFromCopy(tissot_sphere_mobs, tissot_cyl_mobs, rate_func=smooth), run_time=1.5)
        self.wait(1.0)
        self.play(
            FadeOut(tissot_tag),
            FadeOut(tissot_sphere_mobs),
            FadeOut(tissot_cyl_mobs),
            run_time=0.8
        )
        self.remove_fixed_in_frame_mobjects(tissot_tag)
        self.remove(tissot_tag)

        # ==========================================
        # 阶段四：圆柱剪展平铺为二维地图
        # ==========================================
        sub3_target = CText("三、剖开圆柱筒并展平为二维世界地图", font_size=18, color=COLOR_INK_MUTED)
        sub3_target.next_to(main_title, DOWN, aligned_edge=LEFT, buff=0.12)
        self.add_fixed_in_frame_mobjects(sub3_target)
        self.play(
            FadeOut(card_2, shift=RIGHT * 0.25, rate_func=smooth),
            FadeOut(subtitle, shift=UP * 0.1, rate_func=smooth),
            FadeIn(sub3_target, shift=UP * 0.1, rate_func=smooth),
            run_time=0.8
        )
        self.remove_fixed_in_frame_mobjects(card_2)
        self.remove_fixed_in_frame_mobjects(subtitle)
        self.remove(card_2)
        self.remove(subtitle)
        subtitle = sub3_target

        # 平滑过渡三维镜头至正射投影视角
        self.play(FadeOut(globe_group), FadeOut(cyl_mesh), run_time=1.0)
        self.move_camera(phi=0 * DEGREES, theta=-90 * DEGREES, zoom=0.82, run_time=1.8, rate_func=smooth)

        # 二维墨卡托平面地图结构
        MAP_SHIFT = DOWN * 0.38
        W_HALF = R * np.pi
        map_rect = Rectangle(
            width=2 * W_HALF,
            height=2 * CYL_HALF_H,
            color=COLOR_CARD_BORDER,
            stroke_width=2.0,
            fill_color="#F2EDE0",
            fill_opacity=0.7,
        ).shift(MAP_SHIFT)

        flat_meridians = VGroup()
        for lon_deg in range(-150, 181, 30):
            x = R * np.radians(lon_deg)
            col = COLOR_EQUATOR if lon_deg == 0 else COLOR_MERIDIAN
            wid = 1.4 if lon_deg == 0 else 0.55
            line = Line(start=[x, -CYL_HALF_H, 0], end=[x, CYL_HALF_H, 0], color=col, stroke_width=wid, stroke_opacity=0.55).shift(MAP_SHIFT)
            flat_meridians.add(line)

        flat_parallels = VGroup()
        for lat_deg in [-70, -60, -40, -20, 0, 20, 40, 60, 70]:
            _, y = mercator_forward(0, np.radians(lat_deg), radius=R, max_lat_deg=MAX_LAT_DEG)
            col = COLOR_EQUATOR if lat_deg == 0 else COLOR_PARALLEL
            wid = 1.8 if lat_deg == 0 else 0.55
            line = Line(start=[-W_HALF, y, 0], end=[W_HALF, y, 0], color=col, stroke_width=wid, stroke_opacity=0.6).shift(MAP_SHIFT)
            flat_parallels.add(line)

        flat_continents = VGroup()
        for ring in world_land:
            pts = []
            for pt in ring:
                x, y = mercator_forward(np.radians(pt[0]), np.radians(pt[1]), radius=R, max_lat_deg=MAX_LAT_DEG)
                pts.append([x, y, 0] + MAP_SHIFT)
            poly = VMobject(color=COLOR_LAND_STROKE, stroke_width=0.6, stroke_opacity=0.92)
            poly.set_points_as_corners(pts)
            flat_continents.add(poly)

        flat_map_group = VGroup(map_rect, flat_meridians, flat_parallels, flat_continents)

        self.play(
            FadeOut(cyl_top_rim),
            FadeOut(cyl_bot_rim),
            FadeOut(cyl_ribs),
            ReplacementTransform(cyl_parallels, flat_parallels),
            ReplacementTransform(cyl_continents, flat_continents),
            Create(map_rect),
            Create(flat_meridians),
            run_time=2.2,
            rate_func=smooth,
        )
        self.wait(0.5)

        # ==========================================
        # 阶段五：真实陆地面积对比 (格陵兰 vs 非洲)
        # ==========================================
        sub4_target = CText("四、经典结果与客观陆地面积失真对比", font_size=18, color=COLOR_INK_MUTED)
        sub4_target.next_to(main_title, DOWN, aligned_edge=LEFT, buff=0.12)
        self.add_fixed_in_frame_mobjects(sub4_target)
        self.play(
            FadeOut(subtitle, shift=UP * 0.1, rate_func=smooth),
            FadeIn(sub4_target, shift=UP * 0.1, rate_func=smooth),
            run_time=0.8
        )
        self.remove_fixed_in_frame_mobjects(subtitle)
        self.remove(subtitle)
        subtitle = sub4_target

        # 基于 CAS shapefile 高亮格陵兰与非洲 (真实非洲全域完整覆盖，线条细腻，无多选漏选)
        grl_highlights = VGroup()
        for ring in grl_data:
            pts = []
            for pt in ring:
                x, y = mercator_forward(np.radians(pt[0]), np.radians(pt[1]), radius=R, max_lat_deg=MAX_LAT_DEG)
                pts.append([x, y, 0] + MAP_SHIFT)
            if len(pts) >= 3:
                poly = Polygon(*pts, color=COLOR_TERRACOTTA, fill_color=COLOR_TERRACOTTA, fill_opacity=0.35, stroke_width=0.8)
                grl_highlights.add(poly)

        afr_highlights = VGroup()
        for ring in afr_data:
            pts = []
            for pt in ring:
                x, y = mercator_forward(np.radians(pt[0]), np.radians(pt[1]), radius=R, max_lat_deg=MAX_LAT_DEG)
                pts.append([x, y, 0] + MAP_SHIFT)
            if len(pts) >= 3:
                poly = Polygon(*pts, color=COLOR_AFRICA, fill_color=COLOR_AFRICA, fill_opacity=0.35, stroke_width=0.8)
                afr_highlights.add(poly)

        self.play(FadeIn(grl_highlights), FadeIn(afr_highlights), run_time=1.5, rate_func=smooth)

        # 典雅学术分析卡片 (无任何多余英文混排，纯正 LaTeX 与中文宋体)
        comp_title = CText("墨卡托投影的面积认知偏差分析", font_size=17, weight=BOLD, color=COLOR_TERRACOTTA)
        comp_l1 = CText("• 视觉错觉：高纬度格陵兰岛在图上面积与非洲相差无几", font_size=14, color=COLOR_INK)
        comp_l2_title = CText("• 真实物理面积对比：", font_size=14, weight=BOLD, color=COLOR_INK)
        
        comp_stat_grl = VGroup(
            CText("   格陵兰岛真实面积：", font_size=13, color=COLOR_INK),
            CMath(r"216.6 \times 10^4 \text{ km}^2", font_size=20, color=COLOR_TERRACOTTA)
        ).arrange(RIGHT, buff=0.1)

        comp_stat_afr = VGroup(
            CText("   非洲大陆真实面积：", font_size=13, color=COLOR_INK),
            CMath(r"3037.0 \times 10^4 \text{ km}^2", font_size=20, color=COLOR_AFRICA),
            CText("（真实面积大 14 倍）", font_size=13, color=COLOR_AFRICA),
        ).arrange(RIGHT, buff=0.1)

        comp_l3 = CText("• 航海价值：恒向线（等角航线）表现为直线，是航海图的核心基石", font_size=13, color=COLOR_INK_MUTED)

        comp_content = VGroup(
            comp_title,
            comp_l1,
            comp_l2_title,
            comp_stat_grl,
            comp_stat_afr,
            comp_l3
        ).arrange(DOWN, aligned_edge=LEFT, buff=0.10)

        comp_panel = RoundedRectangle(
            corner_radius=0.1,
            width=comp_content.width + 0.48,
            height=comp_content.height + 0.38,
            fill_color=COLOR_CARD_BG,
            fill_opacity=0.96,
            stroke_color=COLOR_CARD_BORDER,
            stroke_width=1.4,
        )
        comp_card = VGroup(comp_panel, comp_content).to_corner(DR, buff=0.35)
        self.add_fixed_in_frame_mobjects(comp_card)
        self.play(FadeIn(comp_card, shift=UP * 0.25, rate_func=smooth), run_time=1.2)
        self.wait(3.2)

        # 终幕渐隐
        self.play(
            FadeOut(comp_card),
            FadeOut(flat_map_group),
            FadeOut(grl_highlights),
            FadeOut(afr_highlights),
            FadeOut(header_group),
            run_time=1.5,
            rate_func=smooth,
        )
        self.wait(0.5)
