"""
Manim Scene: Theorema Egregium & The Trilemma of Cartography
高斯绝妙定理与地图投影的三大抉择 (Manim 3D 微分几何推演)

Visualizes:
1. Geodesic distance on sphere vs flat plane.
2. Gaussian curvature K = kappa_1 * kappa_2 (Sphere K > 0 vs Cylinder K = 0 vs Plane K = 0).
3. The Orange Peel Dilemma (Gores and tearing upon flattening).
4. Tissot indicatrices demonstrating the 3 choices: Conformal (等角), Equal-Area (等积), Equidistant (等距).
"""

from pathlib import Path
import numpy as np
from manim import *

# Styling constants matching video-motion-design Editorial Paper aesthetics
BG_COLOR = "#FDFBF7"
INK_DARK = "#1E293B"
INK_MUTED = "#64748B"
PRIMARY_BLUE = "#1D4ED8"
ACCENT_AMBER = "#D97706"
ACCENT_EMERALD = "#059669"
ACCENT_CRIMSON = "#BE123C"
GRID_COLOR = "#E2E8F0"


class TheoremaEgregiumScene(ThreeDScene):
    """3D Differential Geometry and Curvature Analysis."""

    def construct(self):
        self.camera.background_color = BG_COLOR
        
        # 1. Title Banner
        title_tag = Text("微分几何与高斯绝妙定理", font="Source Han Serif SC", font_size=24, color=PRIMARY_BLUE, weight=BOLD)
        title_main = Text("曲率内蕴性：不可展平的球面", font="Source Han Serif SC", font_size=36, color=INK_DARK, weight=BOLD)
        title_group = VGroup(title_tag, title_main).arrange(DOWN, aligned_edge=LEFT, buff=0.15)
        title_group.to_corner(UL, buff=0.6)
        
        self.add_fixed_in_frame_mobjects(title_group)
        self.play(FadeIn(title_group, shift=DOWN * 0.2), run_time=1.0)
        
        # 2. Setup 3D Sphere & Curvature Circles
        self.set_camera_orientation(phi=65 * DEGREES, theta=-55 * DEGREES)
        
        sphere_radius = 2.0
        # Opaque eggshell sphere to prevent messy painter's algorithm
        sphere = Sphere(
            center=ORIGIN,
            radius=sphere_radius,
            resolution=(32, 32),
        )
        sphere.set_color(WHITE)
        sphere.set_opacity(1.0)
        sphere.set_stroke(GRID_COLOR, width=0.5)
        
        # Geodesic arc between two points A and B
        phi_a, theta_a = 20 * DEGREES, -20 * DEGREES
        phi_b, theta_b = 60 * DEGREES, 50 * DEGREES
        
        pt_a = sphere_radius * np.array([
            np.cos(phi_a) * np.cos(theta_a),
            np.cos(phi_a) * np.sin(theta_a),
            np.sin(phi_a)
        ])
        pt_b = sphere_radius * np.array([
            np.cos(phi_b) * np.cos(theta_b),
            np.cos(phi_b) * np.sin(theta_b),
            np.sin(phi_b)
        ])
        
        dot_a = Dot3D(point=pt_a, color=ACCENT_CRIMSON, radius=0.08)
        dot_b = Dot3D(point=pt_b, color=PRIMARY_BLUE, radius=0.08)
        
        # Geodesic arc via slerp
        def slerp(p0, p1, t):
            omega = np.arccos(np.dot(p0, p1) / (np.linalg.norm(p0) * np.linalg.norm(p1)))
            return (np.sin((1 - t) * omega) / np.sin(omega)) * p0 + (np.sin(t * omega) / np.sin(omega)) * p1

        arc_points = [slerp(pt_a, pt_b, t) for t in np.linspace(0, 1, 40)]
        geodesic_curve = VMobject(color=ACCENT_AMBER, stroke_width=4)
        geodesic_curve.set_points_smoothly(arc_points)
        
        # Equator & Meridiangrid
        equator = ParametricFunction(
            lambda t: sphere_radius * np.array([np.cos(t), np.sin(t), 0]),
            t_range=[0, TAU],
            color=INK_MUTED,
            stroke_width=1.2
        )
        
        self.play(FadeIn(sphere), Create(equator), run_time=1.2)
        self.play(FadeIn(dot_a), FadeIn(dot_b), Create(geodesic_curve), run_time=1.2)
        
        # Floating formula card (Fixed in frame)
        card_bg = RoundedRectangle(
            corner_radius=0.15,
            width=5.0,
            height=2.2,
            fill_color=WHITE,
            fill_opacity=0.92,
            stroke_color=GRID_COLOR,
            stroke_width=1.5
        ).to_corner(UR, buff=0.6)
        
        txt_gauss = Text("高斯绝妙定理 (1827)", font="Source Han Serif SC", font_size=20, color=PRIMARY_BLUE, weight=BOLD)
        txt_formula = MathTex(r"K = \kappa_1 \cdot \kappa_2 = \frac{1}{R^2} > 0", color=INK_DARK, font_size=26)
        txt_desc = Text("内蕴曲率在等距映射下保持不变\n平面曲率恒为 0，故球面绝不可展", font="Source Han Serif SC", font_size=16, color=INK_MUTED)
        txt_desc.arrange(DOWN, buff=0.08, aligned_edge=LEFT)
        
        card_content = VGroup(txt_gauss, txt_formula, txt_desc).arrange(DOWN, buff=0.15, aligned_edge=LEFT)
        card_content.move_to(card_bg.get_center())
        card_group = VGroup(card_bg, card_content)
        
        self.add_fixed_in_frame_mobjects(card_group)
        self.play(FadeIn(card_group, shift=LEFT * 0.3), run_time=1.0)
        
        # Subtle rotation to demonstrate 3D curvature
        self.begin_ambient_camera_rotation(rate=0.15)
        self.wait(2.0)
        self.stop_ambient_camera_rotation()
        
        # 3. Transition to Cylinder comparison: why cylinders can unroll (K = 0)
        self.play(
            FadeOut(sphere), FadeOut(equator), FadeOut(dot_a), FadeOut(dot_b), FadeOut(geodesic_curve),
            run_time=0.8
        )
        
        cyl_radius = 1.6
        cyl_height = 3.2
        cylinder = Cylinder(
            radius=cyl_radius,
            height=cyl_height,
            direction=OUT,
            resolution=(32, 16)
        )
        cylinder.set_color(WHITE)
        cylinder.set_opacity(0.9)
        cylinder.set_stroke(PRIMARY_BLUE, width=1.0)
        
        txt_cyl_formula = MathTex(r"K_{\mathrm{cyl}} = \kappa_1 \cdot \kappa_2 = \frac{1}{R} \cdot 0 = 0", color=PRIMARY_BLUE, font_size=24)
        txt_cyl_desc = Text("圆柱面曲率恰为 0，因此可无损剪开展平！", font="Source Han Serif SC", font_size=16, color=ACCENT_EMERALD)

        
        new_card_content = VGroup(
            Text("可展曲面对比", font="Source Han Serif SC", font_size=20, color=PRIMARY_BLUE, weight=BOLD),
            txt_cyl_formula,
            txt_cyl_desc
        ).arrange(DOWN, buff=0.15, aligned_edge=LEFT)
        new_card_content.move_to(card_bg.get_center())
        
        self.play(FadeIn(cylinder), Transform(card_content, new_card_content), run_time=1.2)
        self.wait(3.0)



class OrangePeelDilemmaScene(Scene):
    """2D Geometric demonstration: The Orange Peel gore tearing paradox."""

    def construct(self):
        self.camera.background_color = BG_COLOR
        
        # Title
        title_tag = Text("物理直觉模型", font="Source Han Serif SC", font_size=24, color=ACCENT_AMBER, weight=BOLD)
        title_main = Text("橘子皮悖论：展平必撕裂，保全必褶皱", font="Source Han Serif SC", font_size=36, color=INK_DARK, weight=BOLD)
        title_group = VGroup(title_tag, title_main).arrange(DOWN, aligned_edge=LEFT, buff=0.12)
        title_group.to_corner(UL, buff=0.6)
        self.play(FadeIn(title_group, shift=DOWN * 0.2), run_time=0.8)
        
        # 1. Left side: Hemispherical gore pack (unpeeled gores)
        num_gores = 8
        r = 2.4
        gores_3d = VGroup()
        
        # Parametric gores (sinusoidal petals)
        for i in range(num_gores):
            theta_center = -PI + (2 * i + 1) * PI / num_gores
            half_w = PI / num_gores
            
            # Create a sinusoidal gore petal
            lats = np.linspace(-PI/2, PI/2, 40)
            pts_left = []
            pts_right = []
            
            for lat in lats:
                # Width proportional to cos(lat)
                w = half_w * np.cos(lat)
                x_c = theta_center * (r / PI)
                y = lat * (r / (PI/2))
                pts_left.append([x_c - w * (r / PI) * 1.5, y, 0])
                pts_right.append([x_c + w * (r / PI) * 1.5, y, 0])
                
            petal_pts = pts_left + pts_right[::-1]
            petal = Polygon(*petal_pts, fill_color=ACCENT_AMBER, fill_opacity=0.25, stroke_color=ACCENT_AMBER, stroke_width=1.5)
            gores_3d.add(petal)
            
        gores_3d.scale(0.85).shift(DOWN * 0.4)
        
        # Annotation arrows showing tearing gaps
        arrow_gap = Arrow(start=ORIGIN + UP*1.8 + RIGHT*0.4, end=ORIGIN + UP*1.2 + RIGHT*0.1, color=ACCENT_CRIMSON, stroke_width=2.5)
        txt_gap = Text("撕裂缝隙 (Gore Gaps)\n无法连续覆盖平面", font="Source Han Serif SC", font_size=18, color=ACCENT_CRIMSON)
        txt_gap.next_to(arrow_gap, UP, buff=0.1)
        
        self.play(LaggedStart(*[Create(g) for g in gores_3d], lag_ratio=0.08), run_time=1.8)
        self.play(Create(arrow_gap), FadeIn(txt_gap), run_time=0.8)
        self.wait(1.5)
        
        # Bottom Summary Pill
        pill_bg = RoundedRectangle(
            corner_radius=0.12,
            width=9.6,
            height=1.0,
            fill_color=WHITE,
            fill_opacity=0.95,
            stroke_color=GRID_COLOR,
            stroke_width=1.2
        ).to_edge(DOWN, buff=0.5)
        
        pill_txt = Text(
            "若不撕破橘子皮，强行压平则四周边缘必发生重叠与起皱；若强行展平，必开裂出巨大缝隙。",
            font="Source Han Serif SC",
            font_size=19,
            color=INK_DARK
        )
        pill_txt.move_to(pill_bg.get_center())
        pill_group = VGroup(pill_bg, pill_txt)
        
        self.play(FadeIn(pill_group, shift=UP * 0.2), run_time=0.8)
        self.wait(3.0)



class TrilemmaChoicesScene(Scene):
    """Demonstrates the 3 fundamental compromises: Conformal vs Equal-Area vs Equidistant."""

    def construct(self):
        self.camera.background_color = BG_COLOR
        
        # Main Title
        title_tag = Text("制图师的三岔路口", font="Source Han Serif SC", font_size=24, color=PRIMARY_BLUE, weight=BOLD)
        title_main = Text("三大偏见：保形状、保面积、保距离", font="Source Han Serif SC", font_size=36, color=INK_DARK, weight=BOLD)
        title_group = VGroup(title_tag, title_main).arrange(DOWN, aligned_edge=LEFT, buff=0.12)
        title_group.to_corner(UL, buff=0.6)
        self.play(FadeIn(title_group, shift=DOWN * 0.2), run_time=0.8)
        
        # 3 Side-by-side cards
        card_w, card_h = 3.6, 4.4
        cards = VGroup()
        
        card_data = [
            ("01 · 等角 (Conformal)", "保形状", "局部任何方向缩放比例相等。\n代价：高纬度面积急剧膨胀爆裂。", PRIMARY_BLUE),
            ("02 · 等积 (Equal-Area)", "保面积", "横向拉长则纵向必须压瘪。\n代价：大陆被严重剪切挤压扁平。", ACCENT_EMERALD),
            ("03 · 等距 (Equidistant)", "保距离", "仅能保以某单点向外的辐射线。\n代价：全图整体形态发生侧向扭曲。", ACCENT_AMBER)
        ]
        
        for i, (head, subtitle, body, color) in enumerate(card_data):
            bg = RoundedRectangle(
                corner_radius=0.18,
                width=card_w,
                height=card_h,
                fill_color=WHITE,
                fill_opacity=0.95,
                stroke_color=GRID_COLOR,
                stroke_width=1.5
            )
            
            h_txt = Text(head, font="Source Han Serif SC", font_size=18, color=color, weight=BOLD)
            sub_txt = Text(subtitle, font="Source Han Serif SC", font_size=28, color=INK_DARK, weight=BOLD)
            b_txt = Text(body, font="Source Han Serif SC", font_size=15, color=INK_MUTED, line_spacing=1.3)
            
            # Indicator graphic
            indicatrix = VGroup()
            if i == 0:
                # Conformal: circle expands but stays circle
                c1 = Circle(radius=0.25, color=color, stroke_width=2, fill_opacity=0.15, fill_color=color)
                c2 = Circle(radius=0.65, color=color, stroke_width=2.5, fill_opacity=0.2, fill_color=color).shift(UP * 0.6)
                indicatrix.add(c1, c2)
            elif i == 1:
                # Equal-Area: circle squashes into flat ellipse
                c1 = Circle(radius=0.4, color=color, stroke_width=2, fill_opacity=0.15, fill_color=color)
                el = Ellipse(width=1.6, height=0.4, color=color, stroke_width=2.5, fill_opacity=0.2, fill_color=color).shift(UP * 0.6)
                indicatrix.add(c1, el)
            else:
                # Equidistant: radial rays
                center_dot = Dot(color=color, radius=0.06)
                rays = VGroup(*[
                    Line(ORIGIN, 0.7 * np.array([np.cos(a), np.sin(a), 0]), color=color, stroke_width=1.5)
                    for a in np.linspace(0, TAU, 8, endpoint=False)
                ])
                indicatrix.add(center_dot, rays)
                
            indicatrix.shift(DOWN * 0.3)
            
            header = VGroup(h_txt, sub_txt).arrange(DOWN, buff=0.1, aligned_edge=LEFT)
            content = VGroup(header, indicatrix, b_txt).arrange(DOWN, buff=0.35, aligned_edge=LEFT)
            content.move_to(bg.get_center())
            
            card = VGroup(bg, content)
            cards.add(card)
            
        cards.arrange(RIGHT, buff=0.5).shift(DOWN * 0.3)
        
        self.play(LaggedStart(*[FadeIn(c, shift=UP * 0.3) for c in cards], lag_ratio=0.2), run_time=1.8)
        self.wait(2.5)
        
        # Concluding Banner
        conclude_bg = RoundedRectangle(corner_radius=0.12, width=11.2, height=1.0, fill_color=INK_DARK, fill_opacity=1.0, stroke_width=0)
        conclude_bg.to_edge(DOWN, buff=0.4)
        conclude_txt = Text(
            "“每一张地图的绘制，本质上都是制图师权衡利弊后，主动选择的偏见。”",
            font="Source Han Serif SC",
            font_size=20,
            color=WHITE,
            weight=BOLD
        )
        conclude_txt.move_to(conclude_bg.get_center())
        conclude_group = VGroup(conclude_bg, conclude_txt)
        
        self.play(FadeIn(conclude_group, shift=UP * 0.2), run_time=0.9)
        self.wait(3.0)
