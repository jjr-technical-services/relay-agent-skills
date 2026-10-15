#!/usr/bin/env python3
"""Crop and render a screenshot on a neutral canvas with an optional device frame."""

from __future__ import annotations

import argparse
import json
import re
import sys
from pathlib import Path

try:
    from PIL import Image, ImageColor, ImageDraw, ImageFilter, ImageOps
except ImportError:
    print("Pillow is required. Install it with: python3 -m pip install -r scripts/requirements.txt", file=sys.stderr)
    raise SystemExit(2)


RATIOS = {"1:1": (1, 1), "4:5": (4, 5), "16:9": (16, 9)}


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("input", type=Path)
    parser.add_argument("output", type=Path)
    parser.add_argument("--frame", choices=("none", "phone", "laptop"), default="none")
    parser.add_argument("--crop", help="Pixel crop: x,y,width,height")
    parser.add_argument("--canvas-ratio", choices=("auto", *RATIOS), default="auto")
    parser.add_argument("--canvas-width", type=int, default=1600)
    parser.add_argument("--background", default="#F5F5F4")
    parser.add_argument("--overwrite", action="store_true", help="Replace an existing derivative output")
    return parser.parse_args()


def parse_crop(value: str | None, size: tuple[int, int]) -> tuple[int, int, int, int] | None:
    if not value:
        return None
    if not re.fullmatch(r"\d+,\d+,\d+,\d+", value):
        raise ValueError("--crop must be x,y,width,height using non-negative integers")
    x, y, width, height = (int(part) for part in value.split(","))
    if width < 1 or height < 1 or x + width > size[0] or y + height > size[1]:
        raise ValueError(f"Crop {value} falls outside input dimensions {size[0]}x{size[1]}")
    return x, y, width, height


def canvas_size(frame: str, ratio_name: str, width: int) -> tuple[int, int, str]:
    if width < 320:
        raise ValueError("--canvas-width must be at least 320")
    if ratio_name == "auto":
        ratio_name = "4:5" if frame == "phone" else "16:9"
    ratio = RATIOS[ratio_name]
    return width, round(width * ratio[1] / ratio[0]), ratio_name


def contain(image: Image.Image, width: int, height: int) -> Image.Image:
    scale = min(max(1, width) / image.width, max(1, height) / image.height)
    size = (max(1, round(image.width * scale)), max(1, round(image.height * scale)))
    return image.resize(size, Image.Resampling.LANCZOS)


def rounded_image(image: Image.Image, radius: int) -> Image.Image:
    mask = Image.new("L", image.size, 0)
    ImageDraw.Draw(mask).rounded_rectangle((0, 0, image.width, image.height), radius=radius, fill=255)
    result = Image.new("RGBA", image.size, (0, 0, 0, 0))
    result.paste(image.convert("RGBA"), (0, 0), mask)
    return result


def add_shadow(canvas: Image.Image, box: tuple[int, int, int, int], radius: int, opacity: int = 70) -> None:
    shadow = Image.new("RGBA", canvas.size, (0, 0, 0, 0))
    draw = ImageDraw.Draw(shadow)
    offset = max(8, radius // 2)
    draw.rounded_rectangle(
        (box[0] + offset, box[1] + offset, box[2] + offset, box[3] + offset),
        radius=radius,
        fill=(15, 23, 42, opacity),
    )
    canvas.alpha_composite(shadow.filter(ImageFilter.GaussianBlur(max(10, radius))))


def render_phone(canvas: Image.Image, source: Image.Image) -> dict[str, int]:
    max_screen_w = int(canvas.width * 0.42)
    max_screen_h = int(canvas.height * 0.78)
    screen = contain(source, max_screen_w, max_screen_h)
    border = max(18, round(screen.width * 0.055))
    top = border + max(10, round(border * 0.45))
    outer_w = screen.width + border * 2
    outer_h = screen.height + top + border
    x = (canvas.width - outer_w) // 2
    y = (canvas.height - outer_h) // 2
    box = (x, y, x + outer_w, y + outer_h)
    radius = max(28, round(outer_w * 0.09))
    add_shadow(canvas, box, radius)
    draw = ImageDraw.Draw(canvas)
    draw.rounded_rectangle(box, radius=radius, fill="#171717", outline="#404040", width=max(2, border // 8))
    screen_x, screen_y = x + border, y + top
    screen_radius = max(14, round(radius * 0.55))
    canvas.alpha_composite(rounded_image(screen, screen_radius), (screen_x, screen_y))
    pill_w, pill_h = max(42, outer_w // 4), max(7, border // 3)
    pill_x = x + (outer_w - pill_w) // 2
    pill_y = y + max(8, (top - pill_h) // 2)
    pill_r = pill_h // 2
    draw.rectangle((pill_x + pill_r, pill_y, pill_x + pill_w - pill_r, pill_y + pill_h), fill="#525252")
    draw.ellipse((pill_x, pill_y, pill_x + pill_h, pill_y + pill_h), fill="#525252")
    draw.ellipse((pill_x + pill_w - pill_h, pill_y, pill_x + pill_w, pill_y + pill_h), fill="#525252")
    return {"x": x, "y": y, "width": outer_w, "height": outer_h}


def render_laptop(canvas: Image.Image, source: Image.Image) -> dict[str, int]:
    max_screen_w = int(canvas.width * 0.78)
    max_screen_h = int(canvas.height * 0.64)
    screen = contain(source, max_screen_w, max_screen_h)
    bezel = max(16, round(screen.width * 0.022))
    top_bezel = bezel + max(6, bezel // 3)
    outer_w = screen.width + bezel * 2
    outer_h = screen.height + top_bezel + bezel
    base_h = max(24, round(outer_w * 0.045))
    total_h = outer_h + base_h
    x = (canvas.width - outer_w) // 2
    y = (canvas.height - total_h) // 2
    box = (x, y, x + outer_w, y + outer_h)
    add_shadow(canvas, (x - outer_w // 18, y, x + outer_w + outer_w // 18, y + total_h), max(16, bezel))
    draw = ImageDraw.Draw(canvas)
    draw.rounded_rectangle(box, radius=max(14, bezel), fill="#18181B", outline="#52525B", width=max(2, bezel // 7))
    canvas.alpha_composite(screen.convert("RGBA"), (x + bezel, y + top_bezel))
    camera_r = max(2, bezel // 6)
    camera_y = y + max(4, bezel // 3)
    draw.ellipse(
        (x + outer_w // 2 - camera_r, camera_y, x + outer_w // 2 + camera_r, camera_y + camera_r * 2),
        fill="#71717A",
    )
    lip = max(18, outer_w // 16)
    base_y = y + outer_h - 1
    draw.polygon(
        [(x - lip, base_y), (x + outer_w + lip, base_y), (x + outer_w - lip // 2, base_y + base_h), (x + lip // 2, base_y + base_h)],
        fill="#A1A1AA",
    )
    draw.line((x - lip, base_y, x + outer_w + lip, base_y), fill="#D4D4D8", width=max(2, bezel // 7))
    return {"x": x - lip, "y": y, "width": outer_w + lip * 2, "height": total_h}


def render_plain(canvas: Image.Image, source: Image.Image) -> dict[str, int]:
    placed = contain(source, int(canvas.width * 0.88), int(canvas.height * 0.88))
    x = (canvas.width - placed.width) // 2
    y = (canvas.height - placed.height) // 2
    add_shadow(canvas, (x, y, x + placed.width, y + placed.height), max(12, canvas.width // 100), 55)
    canvas.alpha_composite(placed.convert("RGBA"), (x, y))
    return {"x": x, "y": y, "width": placed.width, "height": placed.height}


def main() -> int:
    args = parse_args()
    source_path = args.input.expanduser().resolve()
    output_path = args.output.expanduser().resolve()
    if source_path == output_path:
        raise ValueError("Input and output must be different so the raw screenshot is preserved")
    if not source_path.is_file():
        raise FileNotFoundError(f"Input image not found: {source_path}")
    if output_path.exists() and not args.overwrite:
        raise FileExistsError(f"Refusing to overwrite existing output without --overwrite: {output_path}")

    with Image.open(source_path) as opened:
        source = ImageOps.exif_transpose(opened).convert("RGBA")
    original_size = source.size
    crop = parse_crop(args.crop, source.size)
    if crop:
        x, y, width, height = crop
        source = source.crop((x, y, x + width, y + height))

    width, height, ratio_name = canvas_size(args.frame, args.canvas_ratio, args.canvas_width)
    background = ImageColor.getrgb(args.background)
    canvas = Image.new("RGBA", (width, height), (*background, 255))
    if args.frame == "phone":
        placement = render_phone(canvas, source)
    elif args.frame == "laptop":
        placement = render_laptop(canvas, source)
    else:
        placement = render_plain(canvas, source)

    output_path.parent.mkdir(parents=True, exist_ok=True)
    canvas.convert("RGB").save(output_path, format="PNG", optimize=True)
    record = {
        "input": str(source_path),
        "output": str(output_path),
        "inputPixels": {"width": original_size[0], "height": original_size[1]},
        "cropPixels": None if crop is None else {"x": crop[0], "y": crop[1], "width": crop[2], "height": crop[3]},
        "frame": args.frame,
        "canvasRatio": ratio_name,
        "canvasPixels": {"width": width, "height": height},
        "placementPixels": placement,
    }
    print(json.dumps(record, indent=2))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
