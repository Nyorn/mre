# Usage: py tools/bake_roads.py  (after tools/bake.py / bake_buildings.py)
# OSM main roads -> geo.json "roads": simplified polylines in terrain uv, used for night traffic lights.
import json, math, os, time

HERE = os.path.dirname(os.path.abspath(__file__))
OUT = os.path.join(HERE, "..", "static", "geo")
Z = 10
geo = json.load(open(os.path.join(OUT, "geo.json"), encoding="utf-8"))
S, N, W, E = geo["meta"]["bbox"]
def lon2x(lon): return (lon + 180) / 360 * 2**Z * 256
def lat2y(lat):
    r = math.radians(lat)
    return (1 - math.log(math.tan(r) + 1 / math.cos(r)) / math.pi) / 2 * 2**Z * 256
X0, X1, Y0, Y1 = lon2x(W), lon2x(E), lat2y(N), lat2y(S)
uv = lambda la, lo: ((lon2x(lo) - X0) / (X1 - X0), (lat2y(la) - Y0) / (Y1 - Y0))
km_w, km_h = geo["meta"]["km"]

def simplify(pts, eps):  # Douglas-Peucker in km
    if len(pts) < 3: return pts
    (ax, ay), (bx, by) = pts[0], pts[-1]
    dx, dy = bx - ax, by - ay; L = math.hypot(dx, dy) or 1e-9
    dmax, idx = 0, 0
    for i in range(1, len(pts) - 1):
        px, py = pts[i]
        d = abs(dy * px - dx * py + bx * ay - by * ax) / L
        if d > dmax: dmax, idx = d, i
    if dmax < eps: return [pts[0], pts[-1]]
    return simplify(pts[: idx + 1], eps)[:-1] + simplify(pts[idx:], eps)

els = json.load(open(os.path.join(HERE, "roads_osm.json"), encoding="utf-8"))["elements"]
roads, kinds = [], {"motorway": 3, "trunk": 3, "primary": 2, "secondary": 1}
for el in els:
    g = el.get("geometry")
    if not g or len(g) < 2: continue
    pts = [uv(p["lat"], p["lon"]) for p in g]
    km = [(u * km_w, v * km_h) for u, v in pts]
    km = simplify(km, 0.04)
    length = sum(math.hypot(km[i + 1][0] - km[i][0], km[i + 1][1] - km[i][1]) for i in range(len(km) - 1))
    if length < 0.4: continue
    k = kinds.get(el.get("tags", {}).get("highway"), 1)
    roads.append([k] + [[round(x / km_w, 5), round(y / km_h, 5)] for x, y in km])
geo["roads"] = roads
geo["meta"]["v"] = int(time.time())
json.dump(geo, open(os.path.join(OUT, "geo.json"), "w", encoding="utf-8"), ensure_ascii=False, separators=(",", ":"))
print("roads:", len(roads), "points:", sum(len(r) - 1 for r in roads), "size KB:", os.path.getsize(os.path.join(OUT, "geo.json")) // 1024)
