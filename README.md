# Photography Portfolio

A static photography portfolio built for GitHub Pages.

## Update Your Details

1. Replace `Your Name` in `index.html`.
2. Replace the contact links in the `#contact` section.
3. Put your photos into category folders. You do not need to rename them:
   - `assets/photos/city/`
   - `assets/photos/wildlife/`
   - `assets/photos/product/`
   - `assets/photos/portrait/`
4. Keep `hero.svg` and `profile.svg`, or replace the `src` values in `index.html` with your own hero/profile images.

## Publish On GitHub Pages

1. Create a new GitHub repository.
2. Upload these files to the repository root.
3. Go to `Settings` > `Pages`.
4. Set source to `Deploy from a branch`.
5. Select the `main` branch and `/root`.
6. Save, then open the GitHub Pages URL when GitHub finishes deploying.

The site is static, so it works without a backend, database, or build step.

When hosted on GitHub Pages, the gallery automatically loads supported image files from each category folder using GitHub's public repository API. Supported file types are JPG, JPEG, PNG, WebP, GIF, and AVIF.

## Optimize Images

Keep your original full-size images in `assets/photos/`, then generate smaller WebP files for the website:

```bash
python tools/optimize_images.py
```

The gallery loads `assets/optimized/thumbs/` first for fast browsing. When someone opens the lightbox, it loads `assets/optimized/large/`. If an optimized file is missing, the site falls back to the original photo.

Run this script again whenever you add new photos.

For local preview, run a small static server from this folder:

```bash
python -m http.server 8087
```

Then open `http://127.0.0.1:8087/`. Local folder loading depends on the server showing directory listings, which Python's built-in server does.
