"""Extract the Let's Practice page artwork from the approved mockup.

`screen_designs/Kid-Friendly Practice Dashboard Mockup.png` contains a set of
illustrations that the page needs:

* the page hero illustration (two children writing, a pie chart and the 1/2/3
  step badges),
* the blue "pencil" app icon,
* Kito the robot waving (used in the tip card),
* the blue pie chart used next to the 3/4 fraction,
* the three difficulty characters (star / sun / rocket).

Images that sit on a coloured panel (Kito, pie chart) keep their background so
they blend seamlessly with the panel colour used in CSS. The difficulty
characters are keyed to transparency so they can sit on any card colour.
"""
from PIL import Image, ImageFilter
import numpy as np
from collections import deque
import os

SRC = 'screen_designs/Kid-Friendly Practice Dashboard Mockup.png'
OUT = 'src/assets/practice'
os.makedirs(OUT, exist_ok=True)

im = Image.open(SRC).convert('RGB')
A = np.asarray(im).astype(np.uint8)


def crop(name, region, scale=3):
    out = im.crop(region)
    if scale != 1:
        out = out.resize((out.width * scale, out.height * scale), Image.LANCZOS)
    out.save(f'{OUT}/{name}.png')
    print(f'{name}.png', out.size)


def key(name, region, bgcol, tol=18, t1=60, scale=3):
    """Remove a flat background colour and save as transparent PNG."""
    x0, y0, x1, y1 = region
    sub = A[y0:y1, x0:x1].astype(int)
    h, w, _ = sub.shape
    bg = np.array(bgcol, dtype=int)
    dev = np.abs(sub - bg).max(axis=2)
    alpha = np.clip((dev - tol) / (t1 - tol), 0, 1)

    flat = alpha < 0.05
    vis = np.zeros_like(flat, bool)
    dq = deque()
    for x in range(w):
        for y in (0, h - 1):
            if flat[y, x] and not vis[y, x]:
                vis[y, x] = True
                dq.append((y, x))
    for y in range(h):
        for x in (0, w - 1):
            if flat[y, x] and not vis[y, x]:
                vis[y, x] = True
                dq.append((y, x))
    while dq:
        y, x = dq.popleft()
        for dy, dx in ((1, 0), (-1, 0), (0, 1), (0, -1)):
            ny, nx = y + dy, x + dx
            if 0 <= ny < h and 0 <= nx < w and flat[ny, nx] and not vis[ny, nx]:
                vis[ny, nx] = True
                dq.append((ny, nx))
    alpha = np.where(vis, 0.0, alpha)

    al = Image.fromarray((alpha * 255).astype('uint8')).filter(ImageFilter.GaussianBlur(0.5))
    out = Image.fromarray(np.dstack([sub.astype('uint8'), np.asarray(al)]), 'RGBA')
    if scale != 1:
        out = out.resize((out.width * scale, out.height * scale), Image.LANCZOS)
    out.save(f'{OUT}/{name}.png')
    print(f'{name}.png', out.size)


# --- illustrations that keep their panel background ------------------------
# The hero sits on the page background, so its white backdrop is removed
# (only the white connected to the edges is keyed out, which keeps the white
# notebook and the white desk untouched).
key('hero-illustration', (755, 90, 1055, 300), (255, 255, 255), tol=10, t1=34)
crop('page-icon', (250, 112, 325, 198))
crop('kito-tip', (278, 785, 412, 913))
crop('pie-chart', (702, 795, 786, 890))

# --- difficulty characters, keyed to transparency --------------------------
key('difficulty-easy', (714, 414, 766, 472), (255, 255, 255))
key('difficulty-medium', (847, 410, 906, 470), (254, 249, 240))
key('difficulty-challenge', (982, 408, 1038, 468), (255, 255, 255))
