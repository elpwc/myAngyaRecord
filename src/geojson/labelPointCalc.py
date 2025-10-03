from shapely.geometry import shape
from polylabel import polylabel
import json, os


def process_single_file(filename, newFilename):
    with open(filename, encoding="utf-8") as f:
        geojson = json.load(f)

    for feature in geojson["features"]:
        geom = shape(feature["geometry"])
        if geom.geom_type == "Polygon":
            label_point = polylabel([list(geom.exterior.coords)], precision=1.0)
        elif geom.geom_type == "MultiPolygon":
            largest_polygon = max(geom.geoms, key=lambda p: p.area)
            label_point = polylabel(
                [list(largest_polygon.exterior.coords)], precision=1.0
            )
        else:
            continue

        feature["properties"]["label_point"] = [label_point[0], label_point[1]]

    with open(newFilename, "w", encoding="utf-8") as f:
        json.dump(geojson, f, ensure_ascii=False, indent=2)


folder_path = "./src/geojson/japan/todofuken"

for filename in os.listdir(folder_path):
    name = os.path.splitext(filename)[0]
    ext = os.path.splitext(filename)[1]
    old_path = os.path.join(folder_path, filename)
    new_path = os.path.join(folder_path, name[:-1] + ext)
    if not os.path.isfile(old_path):
        continue

    if len(name) == 17:
        process_single_file(old_path, new_path)
