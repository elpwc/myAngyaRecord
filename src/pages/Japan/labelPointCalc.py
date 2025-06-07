from shapely.geometry import shape
from polylabel import polylabel
import json

with open("./src/geojson/japan/hokkaido-branch.geojson", encoding="utf-8") as f:
    geojson = json.load(f)

for feature in geojson['features']:
    geom = shape(feature['geometry'])
    if geom.geom_type == 'Polygon':
        label_point = polylabel([list(geom.exterior.coords)], precision=1.0)
    elif geom.geom_type == 'MultiPolygon':
        largest_polygon = max(geom.geoms, key=lambda p: p.area)
        label_point = polylabel([list(largest_polygon.exterior.coords)], precision=1.0)
    else:
        continue

    feature['properties']['label_point'] = [label_point[0], label_point[1]]

with open("./src/geojson/japan/hokkaido-branch_.geojson", "w", encoding="utf-8") as f:
    json.dump(geojson, f, ensure_ascii=False, indent=2)
