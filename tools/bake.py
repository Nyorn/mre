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
    run = []
    for u, v in pts:  # keep only runs inside the terrain bbox
        if 0 <= u <= 1 and 0 <= v <= 1: run.append((u, v))
        else:
            if len(run) > 1: coast.append(run)
            run = []
    if len(run) > 1: coast.append(run)

meta = {"bbox": [S, N, W, E], "km": [round(km_w, 2), round(km_h, 2)], "size": [OUT_W, out_h],
        "landMax": LAND_MAX, "seaMax": SEA_MAX, "maxElev": float(h.max()), "minElev": float(h.min())}
places = {"Балчик": (43.405, 28.165), "Варна": (43.204, 27.91), "Бяла": (42.873, 27.888),
          "Обзор": (42.82, 27.88), "Свети Влас": (42.712, 27.758), "Несебр": (42.659, 27.735),
          "Бургас": (42.505, 27.468), "Созополь": (42.418, 27.696), "Приморско": (42.268, 27.758),
          "Калиакра": (43.361, 28.466), "Эмине": (42.70, 27.90)}
meta["places"] = {k: proj(*v) for k, v in places.items()}
json.dump({"meta": meta, "coast": coast}, open(os.path.join(OUT, "geo.json"), "w", encoding="utf-8"), ensure_ascii=False, separators=(",", ":"))
print(meta, sum(len(c) for c in coast))


# ---------- land use: R = built-up (towns, resorts, industry), G = beaches ----------
LU = os.path.join(HERE, "landuse_osm.json")
if os.path.exists(LU):
    from PIL import ImageDraw
    LW = 2048
    LH = int(LW * out_h / OUT_W)
    urban = Image.new("L", (LW, LH), 0)
    beach = Image.new("L", (LW, LH), 0)
    du, db = ImageDraw.Draw(urban), ImageDraw.Draw(beach)
    def ring(geom):
        return [(u * LW, v * LH) for u, v in (proj(p["lat"], p["lon"]) for p in geom)]
    n = 0
    for el in json.load(open(LU, encoding="utf-8"))["elements"]:
        tags = el.get("tags", {})
        rings = []
        if el["type"] == "way" and el.get("geometry"):
            rings = [el["geometry"]]
        elif el["type"] == "relation":
            rings = [m["geometry"] for m in el.get("members", []) if m.get("role") == "outer" and m.get("geometry")]
        for g in rings:
            pts = ring(g)
            if len(pts) < 3: continue
            (db if tags.get("natural") == "beach" else du).polygon(pts, fill=255); n += 1
    # town zones: built-up polygons near named towns, closed and smoothed -> boundary at 0.5
    import re, math
    src = open(os.path.join(HERE, "..", "src", "lib", "geo", "places.js"), encoding="utf-8").read()
    named = [(float(a), float(b), int(c)) for a, b, c in re.findall(r"lat: ([\d.]+), lon: ([\d.]+), tier: (\d)", src) if int(c) < 3]
    zone = Image.new("L", (LW, LH), 0)
    dz = ImageDraw.Draw(zone)
    kpx = LW / km_w
    for el in json.load(open(LU, encoding="utf-8"))["elements"]:
        if el.get("tags", {}).get("natural") == "beach" or el["type"] != "way" or not el.get("geometry"): continue
        g = el["geometry"]; la = sum(p["lat"] for p in g) / len(g); lo = sum(p["lon"] for p in g) / len(g)
        for tl, tn, tier in named:
            dkm = math.hypot((la - tl) * 111.2, (lo - tn) * 111.2 * math.cos(math.radians(tl)))
            if dkm < (8.5 if tier == 1 else 3.2):
                pts = ring(g)
                if len(pts) > 2: dz.polygon(pts, fill=255)
                break
    # morphological closing at 1/4 scale (~330 m px) merges blocks into one town shape
    small = zone.resize((LW // 4, LH // 4), Image.BILINEAR).point(lambda v: 255 if v > 20 else 0)
    small = small.filter(ImageFilter.MaxFilter(9)).filter(ImageFilter.MinFilter(7)).filter(ImageFilter.GaussianBlur(1.6))
    zone = small.resize((LW, LH), Image.BICUBIC)
    # town outlines: marching squares on the quarter-res zone mask -> polylines in uv
    SW, SH = small.size
    sv = list(small.getdata())
    V = lambda i, j: sv[j * SW + i]
    T = 128
    def ept(k):
        kind, i, j = k
        if kind == "h":
            a, b_ = V(i, j), V(i + 1, j); f = (T - a) / ((b_ - a) or 1); return (i + f, j)
        a, b_ = V(i, j), V(i, j + 1); f = (T - a) / ((b_ - a) or 1); return (i, j + f)
    TABLE = {1: [(3, 0)], 2: [(0, 1)], 3: [(3, 1)], 4: [(1, 2)], 5: [(3, 0), (1, 2)], 6: [(0, 2)], 7: [(3, 2)],
             8: [(2, 3)], 9: [(0, 2)], 10: [(0, 1), (2, 3)], 11: [(1, 2)], 12: [(1, 3)], 13: [(0, 1)], 14: [(3, 0)]}
    adj = {}
    for j in range(SH - 1):
        for i in range(SW - 1):
            c = (V(i, j) > T) | (V(i + 1, j) > T) << 1 | (V(i + 1, j + 1) > T) << 2 | (V(i, j + 1) > T) << 3
            if c in (0, 15): continue
            E = [("h", i, j), ("v", i + 1, j), ("h", i, j + 1), ("v", i, j)]
            for e1, e2 in TABLE[c]:
                adj.setdefault(E[e1], []).append(E[e2]); adj.setdefault(E[e2], []).append(E[e1])
    seen = set(); outlines = []
    for start in list(adj):
        if start in seen: continue
        line = [start]; seen.add(start); cur = start
        while True:
            nxt = [k for k in adj[cur] if k not in seen]
            if not nxt: break
            cur = nxt[0]; seen.add(cur); line.append(cur)
        if len(line) < 8: continue
        if start in adj.get(line[-1], []): line.append(start)
        pts = [ept(k) for k in line][::2]
        if pts[-1] != ept(line[-1]): pts.append(ept(line[-1]))
        outlines.append([(round(x / (SW - 1), 5), round(y / (SH - 1), 5)) for x, y in pts])
    print("town outlines:", len(outlines), sum(len(o) for o in outlines))
    urban = urban.filter(ImageFilter.GaussianBlur(0.8))
    beach = beach.filter(ImageFilter.MaxFilter(3)).filter(ImageFilter.GaussianBlur(0.8))
    Image.merge("RGB", (urban, beach, zone)).save(os.path.join(OUT, "landuse.png"), optimize=True)
    meta["landuse"] = [LW, LH]
    json.dump({"meta": meta, "coast": coast, "towns": outlines}, open(os.path.join(OUT, "geo.json"), "w", encoding="utf-8"), ensure_ascii=False, separators=(",", ":"))
    print("landuse polygons:", n)
