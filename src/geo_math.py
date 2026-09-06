"""
Geographic coordinate transforms and map projections for Manim animations.
Supports 3D spherical, cylindrical, Mercator, and Equal Earth projections.
"""

import json
import numpy as np
from pathlib import Path

# Equal Earth projection coefficients (Šavrič, Patterson, Jenny 2018)
EE_A1 = 1.340264
EE_A2 = -0.081106
EE_A3 = 0.000893
EE_A4 = 0.003796


def spherical_to_cartesian(lon_rad, lat_rad, radius=1.8):
    """
    Convert (lon, lat) in radians to 3D Cartesian coordinates.
    North Pole is along UP (+Y), Equator in XZ plane, Prime Meridian facing viewer (+Z).
    """
    x = radius * np.cos(lat_rad) * np.sin(lon_rad)
    y = radius * np.sin(lat_rad)
    z = radius * np.cos(lat_rad) * np.cos(lon_rad)
    return np.array([x, y, z])


def mercator_forward(lon_rad, lat_rad, radius=1.8, max_lat_deg=80.0):
    """
    Mercator projection forward formula.
    Clamps latitude to +/- max_lat_deg to avoid infinite explosion at poles.
    """
    max_lat = np.radians(max_lat_deg)
    lat_clamped = np.clip(lat_rad, -max_lat, max_lat)
    x = radius * lon_rad
    y = radius * np.log(np.tan(np.pi / 4.0 + lat_clamped / 2.0))
    return x, y


def cylindrical_surface_point(lon_rad, lat_rad, radius=1.8, max_lat_deg=80.0):
    """
    Point on the 3D cylinder tangent at equator before unrolling.
    x = R * sin(lon), y = y_mercator, z = R * cos(lon)
    """
    _, y = mercator_forward(lon_rad, lat_rad, radius, max_lat_deg)
    x = radius * np.sin(lon_rad)
    z = radius * np.cos(lon_rad)
    return np.array([x, y, z])


def unrolled_cylinder_point(lon_rad, lat_rad, u, radius=1.8, max_lat_deg=80.0):
    """
    Smooth interpolation from 3D cylinder (u=0) to flat 2D Mercator map (u=1).
    """
    x_merc, y_merc = mercator_forward(lon_rad, lat_rad, radius, max_lat_deg)
    x_cyl = radius * np.sin(lon_rad)
    z_cyl = radius * np.cos(lon_rad)
    
    x = (1.0 - u) * x_cyl + u * x_merc
    y = y_merc
    z = (1.0 - u) * z_cyl
    return np.array([x, y, z])


def equal_earth_forward(lon_rad, lat_rad, radius=1.8):
    """
    Equal Earth projection forward formula (Šavrič et al. 2018).
    Strictly equal-area pseudocylindrical projection.
    """
    # sin(theta) = sqrt(3)/2 * sin(phi)
    sin_lat = np.sin(lat_rad)
    sin_theta = np.clip((np.sqrt(3.0) / 2.0) * sin_lat, -1.0, 1.0)
    theta = np.arcsin(sin_theta)
    
    theta2 = theta ** 2
    theta6 = theta2 ** 3
    theta8 = theta2 ** 4
    
    denom = 3.0 * (EE_A1 + 3.0 * EE_A2 * theta2 + 7.0 * EE_A3 * theta6 + 9.0 * EE_A4 * theta8)
    x = radius * (2.0 * np.sqrt(3.0) * lon_rad * np.cos(theta) / denom)
    y = radius * (theta * (EE_A1 + EE_A2 * theta2 + EE_A3 * theta6 + EE_A4 * theta8))
    return x, y


def generate_tissot_circle(center_lon_deg, center_lat_deg, radius_deg=6.0, num_points=36):
    """
    Generate points of a small circle on the spherical surface.
    """
    lons, lats = [], []
    phi0 = np.radians(center_lat_deg)
    lam0 = np.radians(center_lon_deg)
    r = np.radians(radius_deg)
    
    cos_phi0 = max(np.cos(phi0), 0.08)
    
    for alpha in np.linspace(0, 2 * np.pi, num_points):
        d_lat = r * np.sin(alpha)
        d_lon = (r * np.cos(alpha)) / cos_phi0
        lons.append(lam0 + d_lon)
        lats.append(phi0 + d_lat)
        
    return np.array(lons), np.array(lats)


def load_land_data():
    """Load pre-processed high-precision polygons directly extracted from countriesCAS.shp."""
    base = Path(__file__).resolve().parent.parent / "data"
    with open(base / "cas_world_land.json", "r", encoding="utf-8") as f:
        world = json.load(f)
    with open(base / "cas_greenland.json", "r", encoding="utf-8") as f:
        greenland = json.load(f)
    with open(base / "cas_africa.json", "r", encoding="utf-8") as f:
        africa = json.load(f)
    return world, greenland, africa


def filter_front_segments(pts_3d, cam_vec, threshold=-0.08):
    """
    Given a sequence of 3D points on a sphere, return a list of sub-sequences
    that are on the front hemisphere facing cam_vec. Prevents back-facing
    lines from rendering over an opaque sphere in Manim's painter's model.
    """
    segments = []
    curr = []
    cam_norm = np.linalg.norm(cam_vec)
    for p in pts_3d:
        p_arr = np.asarray(p, dtype=float)
        p_norm = np.linalg.norm(p_arr)
        if p_norm > 1e-6 and (np.dot(p_arr, cam_vec) / (p_norm * cam_norm)) >= threshold:
            curr.append(p_arr)
        else:
            if len(curr) >= 2:
                segments.append(curr)
            curr = []
    if len(curr) >= 2:
        segments.append(curr)
    return segments
