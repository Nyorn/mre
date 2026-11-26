# Usage: py tools/bake.py  (needs pillow, numpy; coast_osm.json = Overpass natural=coastline export)
# Bake real terrain + bathymetry for the Bulgarian Black Sea coast (spike).
# Source: AWS Terrain Tiles (Terrarium encoding, open data), z=10.
import json, math, io, os, urllib.request
from PIL import Image
import numpy as np

HERE = os.path.dirname(os.path.abspath(__file__))
S, N, W, E = 41.85, 44.15, 26.85, 28.95   # bbox (lat/lon)
Z = 10
OUT_W = 1024

def lon2x(lon, z): return (lon + 180) / 360 * 2**z * 256
def lat2y(lat, z):
    r = math.radians(lat)
    return (1 - math.log(math.tan(r) + 1 / math.cos(r)) / math.pi) / 2 * 2**z * 256

x0, x1 = lon2x(W, Z), lon2x(E, Z)
y0, y1 = lat2y(N, Z), lat2y(S, Z)
tx0, tx1, ty0, ty1 = int(x0 // 256), int(x1 // 256), int(y0 // 256), int(y1 // 256)
cache = os.path.join(HERE, "tiles"); os.makedirs(cache, exist_ok=True)
mosaic = np.zeros(((ty1 - ty0 + 1) * 256, (tx1 - tx0 + 1) * 256), np.float32)
for ty in range(ty0, ty1 + 1):
    for tx in range(tx0, tx1 + 1):
        p = os.path.join(cache, f"{Z}_{tx}_{ty}.png")
        if not os.path.exists(p):
            url = f"https://s3.amazonaws.com/elevation-tiles-prod/terrarium/{Z}/{tx}/{ty}.png"
            urllib.request.urlretrieve(url, p)
        a = np.asarray(Image.open(p).convert("RGB")).astype(np.float32)
        h = a[..., 0] * 256 + a[..., 1] + a[..., 2] / 256 - 32768
        mosaic[(ty - ty0) * 256:(ty - ty0 + 1) * 256, (tx - tx0) * 256:(tx - tx0 + 1) * 256] = h

crop = mosaic[int(y0 - ty0 * 256):int(y1 - ty0 * 256), int(x0 - tx0 * 256):int(x1 - tx0 * 256)]
# real-world aspect (km)
midlat = math.radians((S + N) / 2)
km_w = (E - W) * 111.32 * math.cos(midlat)
km_h = (N - S) * 110.57
out_h = int(OUT_W * km_h / km_w)
img = Image.fromarray(crop).resize((OUT_W, out_h), Image.BICUBIC)
h = np.asarray(img, np.float32)
LAND_MAX, SEA_MAX = 1100.0, 120.0
r = np.clip(h / LAND_MAX, 0, 1)          # land height
g = np.clip(-h / 1500.0, 0, 1) ** 0.5     # sea depth (sqrt, 0..1500 m)
from PIL import ImageFilter
m = Image.fromarray(((h > 0) * 255).astype(np.uint8)).filter(ImageFilter.GaussianBlur(1.6))
b = np.asarray(m, np.float32) / 255       # blurred land mask: smooth 0.5 isoline
rgb = np.stack([r, g, b], -1)
OUT = os.path.join(HERE, "..", "static", "geo"); os.makedirs(OUT, exist_ok=True)
Image.fromarray((rgb * 255).round().astype(np.uint8)).save(os.path.join(OUT, "terrain.png"), optimize=True)

def proj(lat, lon):
    # normalized [0..1] in crop (mercator), u=east, v=south
    u = (lon2x(lon, Z) - x0) / (x1 - x0)
    v = (lat2y(lat, Z) - y0) / (y1 - y0)
    return round(u, 5), round(v, 5)

osm = json.load(open(os.path.join(HERE, "coast_osm.json"), encoding="utf-8"))
coast = []
for el in osm["elements"]:
    g = el.get("geometry") or []
    pts = [proj(p["lat"], p["lon"]) for p in g[::2]] + ([proj(g[-1]["lat"], g[-1]["lon"])] if g else [])
    if len(pts) > 1: coast.append(pts)

meta = {"bbox": [S, N, W, E], "km": [round(km_w, 2), round(km_h, 2)], "size": [OUT_W, out_h],
        "landMax": LAND_MAX, "seaMax": SEA_MAX, "maxElev": float(h.max()), "minElev": float(h.min())}
places = {"Балчик": (43.405, 28.165), "Варна": (43.204, 27.91), "Бяла": (42.873, 27.888),
          "Обзор": (42.82, 27.88), "Свети Влас": (42.712, 27.758), "Несебр": (42.659, 27.735),
          "Бургас": (42.505, 27.468), "Созополь": (42.418, 27.696), "Приморско": (42.268, 27.758),
          "Калиакра": (43.361, 28.466), "Эмине": (42.70, 27.90)}
meta["places"] = {k: proj(*v) for k, v in places.items()}
json.dump({"meta": meta, "coast": coast}, open(os.path.join(OUT, "geo.json"), "w", encoding="utf-8"), ensure_ascii=False, separators=(",", ":"))
print(meta, sum(len(c) for c in coast))
