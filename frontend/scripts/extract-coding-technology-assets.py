"""Extract the Coding & Technology page artwork from the approved mockup.

`screen_designs/Coding and Technology Learning Dashboard.png` contains:

* the hero illustration (child with a laptop + floating code stickers),
* the “Continue Learning” illustration (child with a laptop + code decorations),
* the dark code-editor card,
* six technology-skill illustrations,
* the Kito robot, the challenge puzzle board and the achievement medal.

Everything is cut straight from the mockup, so the page keeps the original
illustrations. Text that overlaps an illustration is painted out before the cut.

Run with:  python3 scripts/extract-coding-technology-assets.py
"""
from PIL import Image, ImageFilter
import numpy as np
import os

SRC = 'screen_designs/Coding and Technology Learning Dashboard.png'
OUT = 'src/assets/coding-technology'
os.makedirs(OUT, exist_ok=True)

im = Image.open(SRC).convert('RGB')
A = np.asarray(im).astype(np.uint8)


def save(name, box, scale=2):
    # always cut from the (possibly cleaned) working buffer
    out = Image.fromarray(A[box[1]:box[3], box[0]:box[2]])
    out = out.resize((out.width * scale, out.height * scale), Image.LANCZOS)
    out.save(f'{OUT}/{name}.png')
    print(f'{name}.png', out.size)


def erase(box):
    """Paint a region white (removes overlapping text)."""
    A[box[1]:box[3], box[0]:box[2]] = 255


def key_out(name, region, bgcol, tol=14, t1=54, scale=3):
    """Cut a subject out of a flat coloured panel and save it transparent."""
    from collections import deque

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
    out = out.resize((out.width * scale, out.height * scale), Image.LANCZOS)
    out.save(f'{OUT}/{name}.png')
    print(f'{name}.png', out.size)


# --- hero: the whole right-hand cluster (stickers + child) -------------------
save('hero-illustration', (720, 82, 1170, 272))

# --- continue learning: child + code decorations ----------------------------
# the right-hand lavender bleed of the hero banner is trimmed off
save('continue-illustration', (750, 282, 1088, 420))

# --- the dark code editor card ---------------------------------------------
save('code-editor', (568, 232, 732, 328))

# --- the six technology-skill illustrations ---------------------------------
# name, card x, card y, text ends at, illustration starts at
SKILLS = [
    ('computer-basics', 248, 485, 476, 425),
    ('digital-skills', 561, 485, 800, 716),
    ('coding-fundamentals', 875, 485, 1100, 1047),
    ('internet-safety', 248, 629, 476, 430),
    ('build-with-code', 561, 629, 795, 730),
    ('robotics', 875, 629, 1126, 1060),
]
for name, cx, cy, text_end, art_start in SKILLS:
    # wipe the headline / description that sits to the left of the artwork
    erase((cx + 66, cy + 2, text_end, cy + 63 if cy < 600 else cy + 73))
    top = cy + 7 if cy < 600 else cy + 17
    save(f'skill-{name}', (art_start, top, cx + 294, top + 126))

# --- recommended lesson robot ----------------------------------------------
# the robot sits on the pale panel — key it out so it can sit on any background
key_out('kito-robot', (256, 826, 336, 902), (239, 242, 254))

# --- coding challenge puzzle board -----------------------------------------
save('challenge-board', (563, 878, 742, 996))

# --- achievement medal ------------------------------------------------------
save('achievement-medal', (876, 956, 916, 988))
