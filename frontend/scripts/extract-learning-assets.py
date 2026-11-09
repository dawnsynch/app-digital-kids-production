"""Extract the learning-path illustrations and category icons from the Learn page mockup.

The illustrations are "sticker" artwork that sits on the white card background and
overlaps the headline / description text. Each illustration is extracted as a
rectangular region and the text that overlaps it is inpainted away with the
local background colour, so the artwork can be layered under real HTML text.

Icons are cropped as squares; the circular badge shape is reproduced in CSS with
`border-radius: 50%`.
"""
from PIL import Image, ImageFilter
import numpy as np
import os

SRC = 'screen_designs/Digital Kids Learn Page Mockup.png'
OUT = 'public/assets/learning'
os.makedirs(OUT, exist_ok=True)

im = Image.open(SRC).convert('RGB')
A = np.asarray(im).astype(np.uint8)


def inpaint(arr, rect, thresh=9, grow=2, fill=None):
    """Remove text inside `rect` by replacing it with the local background."""
    x0, y0, x1, y1 = rect
    sub = arr[y0:y1, x0:x1]
    if fill is None:
        fill = np.median(sub.reshape(-1, 3), axis=0)
    diff = np.abs(sub.astype(int) - fill).max(axis=2)
    mask = Image.fromarray(((diff > thresh) * 255).astype(np.uint8))
    mask = mask.filter(ImageFilter.MaxFilter(grow * 2 + 1))
    filled = sub.copy()
    filled[np.asarray(mask) > 0] = np.array(fill, dtype=np.uint8)
    arr[y0:y1, x0:x1] = filled
    return arr


WHITE = (255, 255, 255)


def extract(name, region, rects=(), badges=(), scale=2):
    arr = A[region[1]:region[3], region[0]:region[2]].copy()
    for r in list(rects) + list(badges):
        lx0 = max(0, r[0] - region[0])
        ly0 = max(0, r[1] - region[1])
        lx1 = min(arr.shape[1], r[2] - region[0])
        ly1 = min(arr.shape[0], r[3] - region[1])
        if lx1 <= lx0 or ly1 <= ly0:
            continue
        arr = inpaint(arr, (lx0, ly0, lx1, ly1),
                      fill=WHITE)
    out = Image.fromarray(arr)
    if scale != 1:
        out = out.resize((out.width * scale, out.height * scale), Image.LANCZOS)
    out.save(f'{OUT}/{name}.png')
    print(f'{name}.png', out.size)


def icon(name, region, scale=3):
    out = im.crop(region)
    out = out.resize((out.width * scale, out.height * scale), Image.LANCZOS)
    out.save(f'{OUT}/{name}.png')
    print(f'{name}.png', out.size)


# --------------------------------------------------------------------------
# Learning path artwork (region + rectangles holding text to inpaint)
# --------------------------------------------------------------------------
extract('path-cbc', (262, 220, 659, 441), [
    (340, 236, 472, 268),    # headline
    (340, 268, 464, 312),    # description
], badges=[
    (264, 228, 336, 308),    # category icon badge
])

extract('path-coding', (684, 230, 1088, 436), [
    (758, 236, 880, 292),    # headline
    (758, 292, 892, 340),    # description
], badges=[
    (686, 228, 756, 308),    # category icon badge
])

extract('path-ai', (262, 518, 659, 704), [
    (340, 526, 450, 592),    # headline
    (340, 590, 458, 636),    # description
    (262, 686, 360, 708),    # "40% complete"
], badges=[
    (260, 526, 336, 606),    # category icon badge
])

extract('path-bible', (684, 518, 1088, 704), [
    (758, 534, 880, 572),    # headline
    (758, 570, 880, 616),    # description
    (690, 692, 790, 708),    # "55% complete"
], badges=[
    (686, 525, 754, 600),    # category icon badge
])

# --------------------------------------------------------------------------
# Recommended lesson artwork
# --------------------------------------------------------------------------
extract('rec-science', (540, 816, 648, 906))
extract('rec-quiz', (938, 812, 1058, 908))

# --------------------------------------------------------------------------
# Category badges (cropped as squares, rounded in CSS)
# --------------------------------------------------------------------------
icon('badge-cbc', (263, 231, 337, 305))
icon('badge-coding', (686, 232, 758, 304))
icon('badge-ai', (261, 529, 335, 603))
icon('badge-bible', (683, 529, 755, 601))
icon('badge-science', (261, 830, 311, 880))
icon('badge-quiz', (686, 829, 738, 881))
