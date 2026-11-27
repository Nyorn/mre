# Usage: py tools/bake_buildings.py  (after tools/bake.py)
# OSM building footprints around coastal towns -> static/geo/buildings.bin (8 bytes per building):
#   u16 u, u16 v (terrain uv * 65535), u8 width m, u8 depth m, u8 angle (0..pi), u8 height m
import json, math, os, re, struct, subprocess, time, urllib.parse

HERE = os.path.dirname(os.path.abspath(__file__))
OUT = os.path.join(HERE, "..", "static", "geo")
SRC = os.path.join(HERE, "buildings_osm.json")
Z = 10
geo = json.load(open(os.path.join(OUT, "geo.json"), encoding="utf-8"))
S, N, W, E = geo["meta"]["bbox"]

def lon2x(lon): return (lon + 180) / 360 * 2**Z * 256
def lat2y(lat):
    r = math.radians(lat)
    return (1 - math.log(math.tan(r) + 1 / math.cos(r)) / math.pi) / 2 * 2**Z * 256
X0, X1, Y0, Y1 = lon2x(W), lon2x(E), lat2y(N), lat2y(S)
uv = lambda la, lo: ((lon2x(lo) - X0) / (X1 - X0), (lat2y(la) - Y0) / (Y1 - Y0))

places = open(os.path.join(HERE, "..", "src", "lib", "geo", "places.js"), encoding="utf-8").read()
centres = [(float(a), float(b), int(c)) for a, b, c in re.findall(r"lat: ([\d.]+), lon: ([\d.]+), tier: (\d)", places) if int(c) in (1, 2)]
props = open(os.path.join(HERE, "..", "src", "lib", "data", "properties.js"), encoding="utf-8").read()
centres += [(float(a), float(b), 2) for a, b in re.findall(r"lat: ([\d.]+),\s*lon: ([\d.]+)", props)]
centres += [(42.53, 27.6, 2), (42.73, 27.72, 2), (43.27, 28.05, 2), (42.45, 27.63, 2)]  # Ravda, Elenite/Sunny Beach N, Golden Sands N, Chernomorets

if not os.path.exists(SRC):
    parts = "".join(f'way["building"](around:{7000 if t == 1 else 2600},{la},{lo});' for la, lo, t in centres)
    q = f"[out:json][timeout:600];({parts});out geom qt;"
    for url in ["https://maps.mail.ru/osm/tools/overpass/api/interpreter", "https://overpass.kumi.systems/api/interpreter", "https://overpass-api.de/api/interpreter"]:
        r = subprocess.run(["curl", "-s", "-m", "620", "-A", "sea-estate-bake/1.0", "-H", "Accept: application/json",
                            "--data-urlencode", "data=" + q, "-o", SRC, url])
        if os.path.exists(SRC) and open(SRC, "rb").read(2000).find(b'"elements"') >= 0: break
        print("fail", url); time.sleep(5)

els = json.load(open(SRC, encoding="utf-8"))["elements"]
recs = []
kx = 111320 * math.cos(math.radians(43)); ky = 110574
for el in els:
    g = el.get("geometry")
    if not g or len(g) < 4: continue
    lat0 = sum(p["lat"] for p in g) / len(g); lon0 = sum(p["lon"] for p in g) / len(g)
    pts = [((p["lon"] - lon0) * kx, (p["lat"] - lat0) * ky) for p in g]   # metres, x east, y north
    best, ang = 0, 0
    for (ax, ay), (bx, by) in zip(pts, pts[1:]):
        l = math.hypot(bx - ax, by - ay)
        if l > best: best, ang = l, math.atan2(by - ay, bx - ax)
    c, s = math.cos(-ang), math.sin(-ang)
    rx = [x * c - y * s for x, y in pts]; ry = [x * s + y * c for x, y in pts]
    w, d = max(rx) - min(rx), max(ry) - min(ry)
    if w < 3 or d < 3: continue
    t = el.get("tags", {})
    h = None
    try: h = float(re.sub(r"[^\d.]", "", t.get("height", "")) or "x")
    except ValueError: pass
    if h is None and t.get("building:levels"):
        try: h = float(t["building:levels"].split(";")[0]) * 3.0 + 1.5
        except ValueError: pass
    if h is None:
        kind = t.get("building", "yes")
        area = w * d
        h = 15 if kind in ("apartments", "hotel", "commercial", "office") else 7 if kind in ("house", "detached", "residential") else (6 + min(12, area / 120))
    u, v = uv(lat0, lon0)
    if not (0 <= u <= 1 and 0 <= v <= 1): continue
    a = (ang % math.pi) / math.pi * 255
    recs.append(struct.pack("<HHBBBB", round(u * 65535), round(v * 65535), min(255, round(w)), min(255, round(d)), round(a) % 256, min(255, round(h))))

open(os.path.join(OUT, "buildings.bin"), "wb").write(b"".join(recs))
geo["meta"]["buildings"] = len(recs)
geo["meta"]["v"] = int(time.time())
json.dump(geo, open(os.path.join(OUT, "geo.json"), "w", encoding="utf-8"), ensure_ascii=False, separators=(",", ":"))
print("buildings:", len(recs), "elements:", len(els))
