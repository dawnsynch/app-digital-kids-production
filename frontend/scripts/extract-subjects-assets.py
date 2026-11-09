"""Extract the Choose Subjects artwork from the approved mockup.

`screen_designs/Choose Subjects Mockup.png` contains two kinds of artwork per
subject: a rounded-square category badge and a large character illustration.
Both are cut straight out of the mockup (nothing is redrawn), so the page keeps
the exact illustrations from the design.

Run with:  python3 scripts/extract-subjects-assets.py
"""
from PIL import Image
import numpy as np
import os

SRC = 'screen_designs/Choose Subjects Mockup.png'
OUT = 'src/assets/subjects'
os.makedirs(OUT, exist_ok=True)

im = Image.open(SRC).convert('RGB')
A = np.asarray(im).astype(int)

# id, card x, card y  (card origins read off the mockup grid)
CARDS = [
    ('mathematics', 245, 210),
    ('english', 455, 210),
    ('kiswahili', 668, 210),
    ('science', 880, 210),
    ('social', 245, 550),
    ('agriculture', 455, 550),
    ('arts', 668, 550),
    ('religious', 880, 550),
]


def trim(x0, y0, x1, y1, min_dev=7, pad=1, keep_width=False):
    """Return the tight bounding box of everything that is not white.

    `keep_width` keeps the full horizontal extent so the decorative backdrop
    still reaches the card edges (the card clips it with `overflow: hidden`).
    """
    reg = A[y0:y1, x0:x1]
    dev = np.abs(reg - 255).max(axis=2)
    m = dev > min_dev
    ys, xs = np.where(m)
    if len(ys) == 0:
        return x0, y0, x1, y1
    left = x0 if keep_width else max(x0, x0 + int(xs.min()) - pad)
    right = x1 if keep_width else min(x1, x0 + int(xs.max()) + 1 + pad)
    return (
        left,
        max(y0, y0 + int(ys.min()) - pad),
        right,
        min(y1, y0 + int(ys.max()) + 1 + pad),
    )


def save(name, box, scale=3):
    out = im.crop(box)
    out = out.resize((out.width * scale, out.height * scale), Image.LANCZOS)
    out.save(f'{OUT}/{name}.png')
    print(f'{name}.png', out.size)


for cid, cx, cy in CARDS:
    row = 1 if cy < 400 else 2

    # category badge — the saturated rounded square in the top-left of the card
    badge = trim(cx + 5, cy + 5, cx + 70, cy + 69, min_dev=40, pad=1)
    save(f'badge-{cid}', badge)

    # character illustration — everything between the title row and the progress
    art_top = cy + (72 if row == 1 else 70)
    art_bottom = cy + (216 if row == 1 else 202)
    # the decorative backdrop runs to the card edges, so the artwork is cut at
    # the full card width and clipped by the card's overflow in CSS
    art = trim(cx, art_top, cx + 200, art_bottom, min_dev=7, pad=0, keep_width=True)
    save(f'illustration-{cid}', art)

# Kito the robot in the “Need help choosing?” band
kito = trim(275, 875, 380, 965, min_dev=10, pad=1)
save('kito-helper', kito)
