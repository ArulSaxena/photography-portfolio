from pathlib import Path
from PIL import Image, ImageOps


ROOT = Path(__file__).resolve().parents[1]
PHOTO_ROOT = ROOT / "assets" / "photos"
OUTPUT_ROOT = ROOT / "assets" / "optimized"
CATEGORIES = ("wildlife", "city", "product", "portrait")
IMAGE_EXTENSIONS = {".jpg", ".jpeg", ".png", ".webp", ".avif"}


def save_webp(source: Path, destination: Path, max_width: int, quality: int) -> None:
    destination.parent.mkdir(parents=True, exist_ok=True)

    with Image.open(source) as image:
        image = ImageOps.exif_transpose(image)
        image.thumbnail((max_width, max_width * 2), Image.Resampling.LANCZOS)

        if image.mode not in ("RGB", "RGBA"):
            image = image.convert("RGB")

        image.save(destination, "WEBP", quality=quality, method=6)


def optimize_gallery() -> None:
    for category in CATEGORIES:
        folder = PHOTO_ROOT / category

        if not folder.exists():
            continue

        for source in folder.iterdir():
            if not source.is_file() or source.suffix.lower() not in IMAGE_EXTENSIONS:
                continue

            filename = f"{source.stem}.webp"
            save_webp(source, OUTPUT_ROOT / "thumbs" / category / filename, 900, 74)
            save_webp(source, OUTPUT_ROOT / "large" / category / filename, 1800, 82)


def optimize_feature_images() -> None:
    feature_images = (
        ("hero.jpg", "hero.webp", 1800, 82),
        ("profile.png", "profile.webp", 900, 82),
        ("logo.png", "logo.webp", 160, 86),
    )

    for source_name, output_name, width, quality in feature_images:
        source = PHOTO_ROOT / source_name

        if source.exists():
            save_webp(source, OUTPUT_ROOT / output_name, width, quality)


if __name__ == "__main__":
    optimize_gallery()
    optimize_feature_images()
    print(f"Optimized images written to {OUTPUT_ROOT}")
