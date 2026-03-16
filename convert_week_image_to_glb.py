import argparse
from pathlib import Path

import numpy as np
import trimesh
from PIL import Image, ImageFilter
from trimesh.visual.material import PBRMaterial
from trimesh.visual.texture import TextureVisuals


def build_relief_mesh(texture_image: Image.Image, detail: int = 128, depth: float = 0.22) -> trimesh.Trimesh:
    img = texture_image.convert("RGB").resize((detail, detail), Image.Resampling.LANCZOS)
    gray = img.convert("L").filter(ImageFilter.GaussianBlur(radius=1.2))
    height = np.asarray(gray, dtype=np.float32) / 255.0

    xs = np.linspace(-1.0, 1.0, detail, dtype=np.float32)
    ys = np.linspace(-1.0, 1.0, detail, dtype=np.float32)
    xv, yv = np.meshgrid(xs, ys)

    # Build a soft dome with image-driven displacement so the result feels 3D.
    radial = np.sqrt(xv * xv + yv * yv)
    dome = np.clip(1.0 - radial, 0.0, 1.0)
    zv = (dome * 0.55) + (height * depth)

    vertices = np.column_stack([xv.ravel(), -yv.ravel(), zv.ravel()])

    faces = []
    for y in range(detail - 1):
        row = y * detail
        next_row = (y + 1) * detail
        for x in range(detail - 1):
            a = row + x
            b = row + x + 1
            c = next_row + x
            d = next_row + x + 1
            faces.append([a, c, b])
            faces.append([b, c, d])

    uv = np.column_stack([
        np.tile(np.linspace(0.0, 1.0, detail, dtype=np.float32), detail),
        np.repeat(np.linspace(1.0, 0.0, detail, dtype=np.float32), detail),
    ])

    material = PBRMaterial(
        name="week-image-material",
        baseColorTexture=img,
        metallicFactor=0.0,
        roughnessFactor=0.65,
    )

    mesh = trimesh.Trimesh(vertices=vertices, faces=np.asarray(faces, dtype=np.int64), process=True)
    mesh.visual = TextureVisuals(uv=uv, material=material)
    mesh.update_faces(mesh.nondegenerate_faces())
    mesh.update_faces(mesh.unique_faces())
    mesh.remove_unreferenced_vertices()
    mesh.fix_normals()
    return mesh


def main() -> None:
    parser = argparse.ArgumentParser(description="Convert one image to a GLB relief mesh.")
    parser.add_argument("--input", required=True, help="Input image path")
    parser.add_argument("--output", required=True, help="Output .glb path")
    parser.add_argument("--detail", type=int, default=128, help="Grid detail (default: 128)")
    parser.add_argument("--depth", type=float, default=0.22, help="Displacement depth (default: 0.22)")
    args = parser.parse_args()

    input_path = Path(args.input)
    output_path = Path(args.output)
    output_path.parent.mkdir(parents=True, exist_ok=True)

    if not input_path.exists():
        raise FileNotFoundError(f"Image not found: {input_path}")

    image = Image.open(input_path).convert("RGB")
    mesh = build_relief_mesh(image, detail=max(48, args.detail), depth=max(0.05, args.depth))
    scene = trimesh.Scene([mesh])
    scene.export(output_path.as_posix())
    print(f"GLB created: {output_path}")


if __name__ == "__main__":
    main()
