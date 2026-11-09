"""Extract the Mathematics subject page artwork from the approved mockup.

`screen_designs/Digital Kids Mathematics Dashboard.png` contains the four
strand badges (coloured circles with a glyph), the four strand illustrations and
Kito the robot used in the recommendation band.

The page badge (the blue rounded square with the arithmetic grid) is **not**
extracted here — it is reused from the existing Choose Subjects artwork
(`public/assets/subjects/badge-mathematics.png`), which is the same graphic.

Run with:  python3 scripts/extract-mathematics-assets.py
"""
from PIL import Image
import numpy as np
import os

SRC = 'screen_designs/Digital Kids Mathematics Dashboard.png'
OUT = 'src/assets/mathematics'
os.makedirs(OUT, exist_ok=True)

im = Image.open(SRC).convert('RGB')
A = np.asarray(im).astype(int)

# id, card x, card y  (card origins read off the mockup grid)
STRANDS = [
    ('numbers', 254, 278),
    ('fractions', 687, 278),
    ('geometry', 254, 525),
    ('measurement', 687, 525),
]

# Explicit illustration windows, chosen so the neighbouring "72% complete"
# label and the card's button border are never caught.
ILLUSTRATIONS = {
    'numbers': (537, 306, 660, 456),
    'fractions': (973, 306, 1102, 456),
    'geometry': (537, 538, 658, 684),
    'measurement': (973, 538, 1098, 684),
}

# The “72% complete” label sits to the left of the artwork; it is painted out
# before the illustration is cut so no text leaks into the exported asset.
LABEL_BOX = (186, 48, 282, 100)  # relative to the card origin


def save(name, box, scale=3):
    out = im.crop(box)
    out = out.resize((out.width * scale, out.height * scale), Image.LANCZOS)
    out.save(f'{OUT}/{name}.png')
    print(f'{name}.png', out.size)


def trim_saturated(x0, y0, x1, y1, th=0.25, pad=1):
    """Tight bounding box of the colourful artwork inside a region."""
    reg = A[y0:y1, x0:x1]
    mx, mn = reg.max(axis=2), reg.min(axis=2)
    sat = (mx - mn) / np.maximum(mx, 1)
    ys, xs = np.where(sat > th)
    if len(ys) == 0:
        return x0, y0, x1, y1
    return (
        max(x0, x0 + int(xs.min()) - pad),
        max(y0, y0 + int(ys.min()) - pad),
        min(x1, x0 + int(xs.max()) + 1 + pad),
        min(y1, y0 + int(ys.max()) + 1 + pad),
    )


# paint the percentage label out of the artwork region
for _sid, cx, cy in STRANDS:
    lx0, ly0, lx1, ly1 = LABEL_BOX
    A[cy + ly0:cy + ly1, cx + lx0:cx + lx1] = 255

for sid, cx, cy in STRANDS:
    # strand badge — the coloured circle in the top-left of the card
    save(f'strand-{sid}', (cx + 12, cy + 16, cx + 86, cy + 92))

    # character illustration on the right of the card
    save(f'illustration-{sid}', ILLUSTRATIONS[sid])

# Kito the robot in the recommendation band
save('kito-recommend', (288, 795, 398, 898))
