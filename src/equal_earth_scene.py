"""
Equal Earth 投影 (等面积伪圆柱投影) 3D 到 2D 教学示意动画
全面贯彻“切千层饼 + 橡皮泥挤压守恒 + 穿针引线”直观物理心智模型：
1. 切千层饼：沿平行纬度线横切地球，自北向南形成无数层圆形切片；
2. 剪开展平与 59.25% 平头剪裁：切片圆周剪开拉直为水平线段，极点开辟为 59.25% 平头短线，杜绝尖角失真；
3. 橡皮泥挤压：东西向人工拉宽，南北向狠狠压扁，由四次多项式精密控制垂直间距，面积严格守恒；
4. 穿针引线画经线：在各纬线段上均匀标记经度刻度，弹性墨线自北向南串联，自然滑出优雅对称弧线；
5. 全球大陆归位与真实面积守护：CAS 官方矢量大陆归位，客观呈现 14:1 真实大陆比例。
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
    equal_earth_forward,
    generate_tissot_circle,
    load_land_data,
    filter_front_segments,
    EE_A1, EE_A2, EE_A3, EE_A4
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
COLOR_OUTLINE = "#2E5E70"      # 青金石墨蓝 (Equal Earth 标志性图廓外边框)
COLOR_LAND_STROKE = "#244935"  # 墨松绿 (大陆边界线)
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


class EqualEarthProjectionScene(ThreeDScene):
    def construct(self):
        self.camera.background_color = COLOR_BG
        R = 1.48  # 地球与 Equal Earth 投影基准缩放尺度 (精巧尺寸，确保与信息卡片零遮挡)
        MAP_SHIFT = DOWN * 0.18

        # ==========================================
        # 页面固定标题栏 (独立图层，单例平滑更新)
        # ==========================================
        main_title = CText("等地球投影", font_size=28, color=COLOR_INK)
        main_title.to_corner(UL, buff=0.45)
        self.add_fixed_in_frame_mobjects(main_title)
        
        current_subtitle = CText("一、切千层饼：沿平行纬线横切地球", font_size=16, color=COLOR_INK_MUTED)
        current_subtitle.next_to(main_title, DOWN, aligned_edge=LEFT, buff=0.12)
        self.add_fixed_in_frame_mobjects(current_subtitle)
        self.play(
            FadeIn(main_title, shift=DOWN * 0.1, rate_func=smooth),
            FadeIn(current_subtitle, shift=DOWN * 0.1, rate_func=smooth),
            run_time=0.9
        )

        def update_subtitle(new_text):
            nonlocal current_subtitle
            new_sub = CText(new_text, font_size=16, color=COLOR_INK_MUTED)
            new_sub.next_to(main_title, DOWN, aligned_edge=LEFT, buff=0.12)
            self.play(FadeOut(current_subtitle, shift=UP * 0.08, rate_func=smooth), run_time=0.35)
            for m in current_subtitle.get_family():
                if m in self.camera.fixed_in_frame_mobjects:
                    self.camera.fixed_in_frame_mobjects.remove(m)
            self.remove(*current_subtitle.get_family())
            current_subtitle = new_sub
            self.add_fixed_in_frame_mobjects(current_subtitle)
            self.play(FadeIn(current_subtitle, shift=UP * 0.08, rate_func=smooth), run_time=0.35)

        current_card = None

        def set_card(new_card):
            nonlocal current_card
            if current_card is not None:
                self.play(FadeOut(current_card, shift=RIGHT * 0.15, rate_func=smooth), run_time=0.35)
                for m in current_card.get_family():
                    if m in self.camera.fixed_in_frame_mobjects:
                        self.camera.fixed_in_frame_mobjects.remove(m)
                self.remove(*current_card.get_family())
            current_card = new_card
            self.add_fixed_in_frame_mobjects(current_card)
            self.play(FadeIn(current_card, shift=LEFT * 0.15, rate_func=smooth), run_time=0.5)

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
            start=np.array([0, -2.15, 0]),
            end=np.array([0, 2.15, 0]),
            color=COLOR_INK_MUTED,
            thickness=0.012,
        )
        north_pole_dot = Dot3D(point=np.array([0, R, 0]), color=COLOR_OUTLINE, radius=0.05)
        south_pole_dot = Dot3D(point=np.array([0, -R, 0]), color=COLOR_OUTLINE, radius=0.05)

        # 3. 赤道 (金琥珀色高亮基准线，背面剔除)
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

        self.play(FadeIn(globe_group, rate_func=smooth), run_time=1.4)
        self.move_camera(theta=55 * DEGREES, run_time=1.6, rate_func=smooth)

        # ==========================================
        # 步骤 1：切千层饼动效演示 (Slicing the Globe)
        # ==========================================
        card_1_title = CText("物理心智模型：切千层饼", font_size=16, color=COLOR_EQUATOR)
        card_1_l1 = CText("• 纬线切片：用一把极薄快刀，沿纬度把地球横切为无数圆形切片", font_size=13, color=COLOR_INK)
        card_1_l2 = CText("• 周长递减：赤道切片周长最大，越往两极切片周长越小趋向于零", font_size=13, color=COLOR_INK)
        card_1_content = VGroup(card_1_title, card_1_l1, card_1_l2).arrange(DOWN, aligned_edge=LEFT, buff=0.12)

        card_1_panel = RoundedRectangle(
            corner_radius=0.1,
            width=card_1_content.width + 0.45,
            height=card_1_content.height + 0.35,
            fill_color=COLOR_CARD_BG,
            fill_opacity=0.96,
            stroke_color=COLOR_CARD_BORDER,
            stroke_width=1.3,
        )
        card_1 = VGroup(card_1_panel, card_1_content).to_corner(UR, buff=0.4)
        set_card(card_1)

        # 构造横切光面切片 (Slicing Disks)
        slice_lats = [70, 45, 20, 0, -20, -45, -70]
        slicing_rings = VGroup()
        for s_lat in slice_lats:
            lat_r = np.radians(s_lat)
            r_slice = R * np.cos(lat_r)
            y_h = R * np.sin(lat_r)
            pts_ring = [
                np.array([r_slice * np.sin(l), y_h, r_slice * np.cos(l)])
                for l in np.linspace(-np.pi, np.pi, 60)
            ]
            ring_col = COLOR_EQUATOR if s_lat == 0 else COLOR_PARALLEL
            ring_w = 2.2 if s_lat == 0 else 1.1
            s_ring = VMobject(color=ring_col, stroke_width=ring_w, stroke_opacity=0.9)
            s_ring.set_points_smoothly(pts_ring)
            slicing_rings.add(s_ring)

        # 激光快刀自北向南横切扫过
        knife_plane = Cylinder(
            radius=R * 1.15,
            height=0.03,
            direction=UP,
            fill_color=COLOR_EQUATOR,
            fill_opacity=0.45,
            stroke_width=0
        ).shift(UP * R)
        
        self.play(
            knife_plane.animate.shift(DOWN * 2 * R),
            FadeIn(slicing_rings, lag_ratio=0.15),
            run_time=2.0,
            rate_func=smooth
        )
        self.play(FadeOut(knife_plane), run_time=0.4)
        self.wait(0.4)

        # ==========================================
        # 步骤 2：剪开展平与 59.25% 平头剪裁
        # ==========================================
        update_subtitle("二、剪开展平与 59.25% 平头剪裁")

        card_2_title = CText("给两端做“平头剪裁”（界定轮廓）", font_size=16, color=COLOR_OUTLINE)
        card_2_l1 = CText("• 剪断拉直：将各切片圆周剪断，拉成一根根水平直线段平行排开", font_size=13, color=COLOR_INK)
        card_2_l2 = CText("• 拒绝墨卡托：高纬切片保持较短长度，整体自然向两极收缩", font_size=13, color=COLOR_INK)
        card_2_l3 = VGroup(
            CText("• 平头修剪：南北极点拉长为赤道长 ", font_size=13, color=COLOR_INK),
            CMath(r"59.25\%", font_size=19, color=COLOR_EQUATOR),
            CText(" 的水平短线（杜绝尖角失真）", font_size=13, color=COLOR_INK)
        ).arrange(RIGHT, buff=0.08)

        card_2_content = VGroup(card_2_title, card_2_l1, card_2_l2, card_2_l3).arrange(DOWN, aligned_edge=LEFT, buff=0.11)
        card_2_panel = RoundedRectangle(
            corner_radius=0.1,
            width=card_2_content.width + 0.45,
            height=card_2_content.height + 0.35,
            fill_color=COLOR_CARD_BG,
            fill_opacity=0.96,
            stroke_color=COLOR_CARD_BORDER,
            stroke_width=1.3,
        )
        card_2 = VGroup(card_2_panel, card_2_content).to_corner(UR, buff=0.4)
        set_card(card_2)

        # 镜头平滑回归二维正视正射视角
        self.play(
            FadeOut(globe_group),
            FadeOut(slicing_rings),
            run_time=0.8
        )
        self.move_camera(phi=0 * DEGREES, theta=-90 * DEGREES, zoom=0.84, run_time=1.4, rate_func=smooth)

        # 2D 水平展开线段 (由切片圆周展平)
        flat_slice_lines = VGroup()
        for s_lat in slice_lats:
            lat_r = np.radians(s_lat)
            x_w, y_val = equal_earth_forward(np.pi, lat_r, radius=R)
            col = COLOR_EQUATOR if s_lat == 0 else COLOR_PARALLEL
            w_stroke = 2.0 if s_lat == 0 else 0.8
            line = Line(start=[-x_w, y_val, 0] + MAP_SHIFT, end=[x_w, y_val, 0] + MAP_SHIFT, color=col, stroke_width=w_stroke)
            flat_slice_lines.add(line)

        # 加上南北极平头剪裁线 (90° 与 -90°)
        x_pole, y_pole = equal_earth_forward(np.pi, np.pi / 2, radius=R)
        north_pole_line = Line(start=[-x_pole, y_pole, 0] + MAP_SHIFT, end=[x_pole, y_pole, 0] + MAP_SHIFT, color=COLOR_OUTLINE, stroke_width=2.2)
        south_pole_line = Line(start=[-x_pole, -y_pole, 0] + MAP_SHIFT, end=[x_pole, -y_pole, 0] + MAP_SHIFT, color=COLOR_OUTLINE, stroke_width=2.2)
        pole_lines = VGroup(north_pole_line, south_pole_line)

        # 墨卡托野蛮拉满虚线外框对比 (矩形虚线框)
        x_eq, _ = equal_earth_forward(np.pi, 0.0, radius=R)
        mercator_ghost_box = Rectangle(
            width=2 * x_eq,
            height=2 * y_pole,
            color=COLOR_INK_MUTED,
            stroke_width=1.0,
            stroke_opacity=0.35,
        ).shift(MAP_SHIFT)
        merc_tag = CText("墨卡托拉伸对比：高纬切片全部强行拽至赤道全宽", font_size=12, color=COLOR_INK_MUTED)
        merc_tag.next_to(mercator_ghost_box, UP, buff=0.15)

        self.play(
            FadeIn(flat_slice_lines, lag_ratio=0.1),
            FadeIn(mercator_ghost_box),
            FadeIn(merc_tag),
            run_time=1.5,
            rate_func=smooth
        )
        self.wait(0.8)

        # 淡出墨卡托虚线框，再隆重推出平等地球的 59.25% 平头剪裁线
        pole_bracket_text = VGroup(
            CText("两极平头短线：恰为赤道长度的 ", font_size=13, color=COLOR_EQUATOR),
            CMath(r"59.25\%", font_size=18, color=COLOR_EQUATOR),
            CText("（消除极点尖角失真）", font_size=13, color=COLOR_EQUATOR)
        ).arrange(RIGHT, buff=0.08).next_to(north_pole_line, UP, buff=0.15)

        self.play(
            FadeOut(mercator_ghost_box),
            FadeOut(merc_tag),
            FadeIn(pole_lines),
            FadeIn(pole_bracket_text, shift=DOWN * 0.08),
            Indicate(north_pole_line, color=COLOR_EQUATOR, scale_factor=1.04),
            run_time=1.4,
            rate_func=smooth
        )
        self.wait(0.8)
        self.play(FadeOut(pole_bracket_text), run_time=0.4)

        # ==========================================
        # 步骤 3：橡皮泥挤压（等面积守恒与多项式垂直落位）
        # ==========================================
        update_subtitle("三、橡皮泥挤压：微元面积守恒与多项式垂直落位")

        card_3_title = CText("面团守恒定律（等面积核心机制）", font_size=16, color=COLOR_TERRACOTTA)
        card_3_l1 = CText("• 东西拉宽：极点被拉伸为 59.25% 平头线，东西方向被人工展宽", font_size=13, color=COLOR_INK)
        card_3_l2 = CText("• 南北压扁：为使面团微元面积不超标，南北垂直方向必须严格压缩！", font_size=13, color=COLOR_INK)
        card_3_l3 = VGroup(
            CText("• 精密多项式：横向拉伸多少，纵向精确压缩多少：", font_size=13, color=COLOR_INK),
            CMath(r"dA' = dx \cdot dy \equiv dA", font_size=19, color=COLOR_TERRACOTTA)
        ).arrange(RIGHT, buff=0.08)

        card_3_content = VGroup(card_3_title, card_3_l1, card_3_l2, card_3_l3).arrange(DOWN, aligned_edge=LEFT, buff=0.11)
        card_3_panel = RoundedRectangle(
            corner_radius=0.1,
            width=card_3_content.width + 0.45,
            height=card_3_content.height + 0.35,
            fill_color=COLOR_CARD_BG,
            fill_opacity=0.96,
            stroke_color=COLOR_CARD_BORDER,
            stroke_width=1.3,
        )
        card_3 = VGroup(card_3_panel, card_3_content).to_corner(UR, buff=0.4)
        set_card(card_3)

        # 稍微淡化背景线条，让橡皮泥挤压演示格外醒目
        self.play(
            flat_slice_lines.animate.set_stroke(opacity=0.25),
            pole_lines.animate.set_stroke(opacity=0.35),
            run_time=0.5
        )

        # 动态演示“橡皮泥微元”的拉宽与压扁 (Dough Squeeze Demo)
        dough_demo_pos = np.array([0, 0.42, 0]) + MAP_SHIFT
        dough_rect = RoundedRectangle(
            corner_radius=0.06,
            width=1.2,
            height=1.2,
            fill_color=COLOR_TERRACOTTA,
            fill_opacity=0.65,
            stroke_color=COLOR_TERRACOTTA,
            stroke_width=1.8
        ).move_to(dough_demo_pos)
        
        dough_tag = CText("微元橡皮泥（初始正方）", font_size=13, color=COLOR_TERRACOTTA).next_to(dough_rect, UP, buff=0.2)
        self.play(FadeIn(dough_rect), FadeIn(dough_tag), run_time=0.6)

        # 压扁目标：宽度拉伸到 2.0，高度压扁至 0.72 (面积严格守恒 1.2*1.2 = 1.44)
        dough_squeezed = RoundedRectangle(
            corner_radius=0.06,
            width=2.0,
            height=0.72,
            fill_color=COLOR_TERRACOTTA,
            fill_opacity=0.65,
            stroke_color=COLOR_TERRACOTTA,
            stroke_width=1.8
        ).move_to(dough_demo_pos)

        # 上下垂直挤压箭头
        arrow_up = Arrow(
            start=dough_demo_pos + DOWN * 1.05,
            end=dough_demo_pos + DOWN * 0.42,
            color=COLOR_EQUATOR,
            buff=0.05,
            stroke_width=3.2,
            max_tip_length_to_length_ratio=0.35
        )
        arrow_down = Arrow(
            start=dough_demo_pos + UP * 1.05,
            end=dough_demo_pos + UP * 0.42,
            color=COLOR_EQUATOR,
            buff=0.05,
            stroke_width=3.2,
            max_tip_length_to_length_ratio=0.35
        )
        squeeze_note = CText("南北垂直狠狠压扁！面积严格守恒", font_size=13, color=COLOR_EQUATOR).next_to(arrow_down, UP, buff=0.12)

        self.play(
            Transform(dough_rect, dough_squeezed),
            Transform(dough_tag, squeeze_note),
            GrowArrow(arrow_up),
            GrowArrow(arrow_down),
            run_time=1.5,
            rate_func=smooth
        )
        self.wait(0.8)
        self.play(
            FadeOut(dough_rect),
            FadeOut(dough_tag),
            FadeOut(arrow_up),
            FadeOut(arrow_down),
            flat_slice_lines.animate.set_stroke(opacity=0.9),
            pole_lines.animate.set_stroke(opacity=1.0),
            run_time=0.6
        )

        # ==========================================
        # 步骤 4：穿针引线画经线 (Threading the Meridians)
        # ==========================================
        update_subtitle("四、穿针引线：等分刻度与自适应外弯经线")

        card_4_title = CText("穿针引线连接经线", font_size=16, color=COLOR_OUTLINE)
        card_4_l1 = CText("• 等分刻度：在赤道及各纬线段上均匀点上 360° 等分经度刻度点", font_size=13, color=COLOR_INK)
        card_4_l2 = CText("• 弹性串联：拿一根弹性线，自北向南把相同经度的点串联起来", font_size=13, color=COLOR_INK)
        card_4_l3 = CText("• 自然对称弧线：中间长、两头短，中央经线挺拔，两侧自然外弯", font_size=13, color=COLOR_INK)

        card_4_content = VGroup(card_4_title, card_4_l1, card_4_l2, card_4_l3).arrange(DOWN, aligned_edge=LEFT, buff=0.11)
        card_4_panel = RoundedRectangle(
            corner_radius=0.1,
            width=card_4_content.width + 0.45,
            height=card_4_content.height + 0.35,
            fill_color=COLOR_CARD_BG,
            fill_opacity=0.96,
            stroke_color=COLOR_CARD_BORDER,
            stroke_width=1.3,
        )
        card_4 = VGroup(card_4_panel, card_4_content).to_corner(UR, buff=0.4)
        set_card(card_4)

        # 构建全套 Equal Earth 经纬网络
        # 1. 各纬线上均匀排布的刻度点 (Dots on Parallels)
        sample_lats = [-75, -50, -25, 0, 25, 50, 75, 90, -90]
        tick_dots = VGroup()
        for lon_deg in range(-150, 181, 30):
            lon_r = np.radians(lon_deg)
            for s_lat in sample_lats:
                x_pt, y_pt = equal_earth_forward(lon_r, np.radians(s_lat), radius=R)
                d = Dot(point=[x_pt, y_pt, 0] + MAP_SHIFT, radius=0.028, color=COLOR_EQUATOR)
                tick_dots.add(d)

        self.play(FadeIn(tick_dots, lag_ratio=0.04), run_time=1.0)

        # 2. 经线自北向南穿针引线串联生长 (Elastic Meridians)
        flat_meridians = VGroup()
        for lon_deg in range(-150, 181, 30):
            lon_r = np.radians(lon_deg)
            pts = []
            for lat_deg in np.linspace(90, -90, 50):
                x, y = equal_earth_forward(lon_r, np.radians(lat_deg), radius=R)
                pts.append([x, y, 0] + MAP_SHIFT)
            col = COLOR_EQUATOR if lon_deg == 0 else COLOR_MERIDIAN
            wid = 1.3 if lon_deg == 0 else 0.55
            opac = 0.85 if lon_deg == 0 else 0.55
            curve = VMobject(color=col, stroke_width=wid, stroke_opacity=opac)
            curve.set_points_smoothly(pts)
            flat_meridians.add(curve)

        # 3. 完整图廓闭合 (Equal Earth Outer Boundary)
        boundary_pts = []
        for la in np.linspace(-np.pi / 2, np.pi / 2, 45):
            x, y = equal_earth_forward(np.pi, la, radius=R)
            boundary_pts.append([x, y, 0] + MAP_SHIFT)
        for lo in np.linspace(np.pi, -np.pi, 30):
            x, y = equal_earth_forward(lo, np.pi / 2, radius=R)
            boundary_pts.append([x, y, 0] + MAP_SHIFT)
        for la in np.linspace(np.pi / 2, -np.pi / 2, 45):
            x, y = equal_earth_forward(-np.pi, la, radius=R)
            boundary_pts.append([x, y, 0] + MAP_SHIFT)
        for lo in np.linspace(-np.pi, np.pi, 30):
            x, y = equal_earth_forward(lo, -np.pi / 2, radius=R)
            boundary_pts.append([x, y, 0] + MAP_SHIFT)

        map_boundary = Polygon(
            *boundary_pts,
            color=COLOR_OUTLINE,
            stroke_width=1.2,
            fill_color="#F2EDE0",
            fill_opacity=0.7
        )

        # 穿针引线动画：经线顺畅穿过刻度点
        self.play(
            Create(flat_meridians, lag_ratio=0.08),
            Create(map_boundary),
            run_time=2.0,
            rate_func=smooth
        )
        self.play(FadeOut(tick_dots), run_time=0.5)
        self.wait(0.4)

        # ==========================================
        # 步骤 5：全球陆地归位与 14:1 真实面积实证
        # ==========================================
        update_subtitle("五、全球大陆矢量归位与客观面积呈现")

        # 完整的全球纬线簇
        full_parallels = VGroup()
        for lat_deg in [-75, -60, -40, -20, 0, 20, 40, 60, 75]:
            lat_r = np.radians(lat_deg)
            x_left, y_val = equal_earth_forward(-np.pi, lat_r, radius=R)
            x_right, _ = equal_earth_forward(np.pi, lat_r, radius=R)
            col = COLOR_EQUATOR if lat_deg == 0 else COLOR_PARALLEL
            wid = 1.5 if lat_deg == 0 else 0.55
            opac = 0.9 if lat_deg == 0 else 0.55
            line = Line(
                start=[x_left, y_val, 0] + MAP_SHIFT,
                end=[x_right, y_val, 0] + MAP_SHIFT,
                color=col,
                stroke_width=wid,
                stroke_opacity=opac
            )
            full_parallels.add(line)

        # 基于 CAS shapefile 转换至 Equal Earth 的高精度大陆轮廓
        flat_continents = VGroup()
        for ring in world_land:
            pts = []
            for pt in ring:
                x, y = equal_earth_forward(np.radians(pt[0]), np.radians(pt[1]), radius=R)
                pts.append([x, y, 0] + MAP_SHIFT)
            poly = VMobject(color=COLOR_LAND_STROKE, stroke_width=0.6, stroke_opacity=0.92)
            poly.set_points_as_corners(pts)
            flat_continents.add(poly)

        self.play(
            ReplacementTransform(flat_slice_lines, full_parallels),
            FadeIn(flat_continents),
            run_time=1.6,
            rate_func=smooth
        )

        # 平面上的蒂索指示椭圆阵列 (面积严格恒定)
        tissot_flat_mobs = VGroup()
        for t_lat in [-60, -30, 0, 30, 60]:
            for t_lon in [-120, -60, 0, 60, 120]:
                lons, lats = generate_tissot_circle(t_lon, t_lat, radius_deg=5.8)
                pts = []
                for l, la in zip(lons, lats):
                    x, y = equal_earth_forward(l, la, radius=R)
                    pts.append([x, y, 0] + MAP_SHIFT)
                c_ee = Polygon(*pts, color=COLOR_TERRACOTTA, fill_color=COLOR_TERRACOTTA, fill_opacity=0.35, stroke_width=0.85)
                tissot_flat_mobs.add(c_ee)

        self.play(FadeIn(tissot_flat_mobs, rate_func=smooth), run_time=0.9)
        self.wait(0.7)
        self.play(FadeOut(tissot_flat_mobs), run_time=0.5)

        # 高亮格陵兰与非洲 (CAS 官方完整边界，无漏选错选)
        grl_highlights = VGroup()
        for ring in grl_data:
            pts = []
            for pt in ring:
                x, y = equal_earth_forward(np.radians(pt[0]), np.radians(pt[1]), radius=R)
                pts.append([x, y, 0] + MAP_SHIFT)
            if len(pts) >= 3:
                poly = Polygon(*pts, color=COLOR_TERRACOTTA, fill_color=COLOR_TERRACOTTA, fill_opacity=0.35, stroke_width=0.8)
                grl_highlights.add(poly)

        afr_highlights = VGroup()
        for ring in afr_data:
            pts = []
            for pt in ring:
                x, y = equal_earth_forward(np.radians(pt[0]), np.radians(pt[1]), radius=R)
                pts.append([x, y, 0] + MAP_SHIFT)
            if len(pts) >= 3:
                poly = Polygon(*pts, color=COLOR_AFRICA, fill_color=COLOR_AFRICA, fill_opacity=0.35, stroke_width=0.8)
                afr_highlights.add(poly)

        self.play(FadeIn(grl_highlights), FadeIn(afr_highlights), run_time=1.1, rate_func=smooth)

        # 典雅学术分析卡片 (放在右上角或左下角无大陆遮挡处)
        comp_title = CText("等地球投影的客观地理认知价值", font_size=15, color=COLOR_OUTLINE)
        comp_l1 = CText("• 客观呈现各大洲真实现实：非洲大陆是格陵兰岛的 14 倍！", font_size=12.5, color=COLOR_INK)
        
        comp_stat_grl = VGroup(
            CText("   格陵兰岛实际面积：", font_size=12, color=COLOR_INK),
            CMath(r"216.6 \times 10^4 \text{ km}^2", font_size=18, color=COLOR_TERRACOTTA)
        ).arrange(RIGHT, buff=0.08)

        comp_stat_afr = VGroup(
            CText("   非洲大陆实际面积：", font_size=12, color=COLOR_INK),
            CMath(r"3037.0 \times 10^4 \text{ km}^2", font_size=18, color=COLOR_AFRICA),
            CText("（宏大辽阔）", font_size=12, color=COLOR_AFRICA)
        ).arrange(RIGHT, buff=0.08)

        comp_l2 = CText("• 视觉美感：平极短平线消除了极点奇点，侧翼弧线平滑自然", font_size=12, color=COLOR_INK_MUTED)
        comp_l3 = CText("• 权威采纳：已被联合国、NASA 全球地球观测及众多教材采纳", font_size=12, color=COLOR_INK_MUTED)

        comp_content = VGroup(
            comp_title,
            comp_l1,
            comp_stat_grl,
            comp_stat_afr,
            comp_l2,
            comp_l3
        ).arrange(DOWN, aligned_edge=LEFT, buff=0.08)

        comp_panel = RoundedRectangle(
            corner_radius=0.1,
            width=comp_content.width + 0.42,
            height=comp_content.height + 0.32,
            fill_color=COLOR_CARD_BG,
            fill_opacity=0.96,
            stroke_color=COLOR_CARD_BORDER,
            stroke_width=1.3,
        )
        comp_card = VGroup(comp_panel, comp_content).to_corner(UR, buff=0.35)
        set_card(comp_card)
        self.wait(3.0)

        # 终幕优雅淡出
        fadeout_list = [
            map_boundary,
            full_parallels,
            flat_meridians,
            flat_continents,
            pole_lines,
            grl_highlights,
            afr_highlights,
            main_title,
            current_subtitle,
        ]
        if current_card is not None:
            fadeout_list.append(current_card)
            
        self.play(
            *[FadeOut(m) for m in fadeout_list],
            run_time=1.4,
            rate_func=smooth
        )
        self.wait(0.5)

