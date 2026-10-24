#!/usr/bin/env python3
"""
Generate the Open Graph / Twitter card for every page: 1200x630 PNGs in
public/og/ — home.png, writing.png, writing-<studyId>.png, project-<id>.png.

Run by hand when a title, dek, stack or accent changes, not from `npm run build`:

    python3 -m venv .venv-og && .venv-og/bin/pip install pillow numpy fonttools brotli
    .venv-og/bin/python scripts/generate-og.py

Needs: Python 3.9+, Pillow, numpy, fontTools + brotli (brotli only to unpack the
site's woff2 fonts), and `node` on PATH. Deliberately not part of the build —
the output is committed, which is also why a page's card costs a visitor
nothing at request time, and why CI never needs Python.

Where everything comes from
  * Fonts: the site's own Space Grotesk and JetBrains Mono, read from the same
    woff2 files in public/fonts/ that the page serves. PIL cannot open woff2, so
    each is unpacked to a TTF in a temp dir on every run (nothing is committed).
    The cards therefore use the real typefaces rather than a macOS system font,
    so this runs identically anywhere.
  * Words: src/data/portfolio.js, caseStudies.js and hiring.js are loaded by
    node itself (a one-line loader stubs the image imports), and the reading time
    comes from src/lib/readingTime.js — the module the page and the feeds use —
    so a card cannot say "2 min" while the page says "3 min", and cannot claim a
    title, tagline or stack entry the page does not have. The home card's name,
    role and blurb are the <meta og:*> text in index.html. Anything a card needs
    that the font cannot draw fails the run instead of printing a missing-glyph
    box.
  * Look: the hero aurora is the CSS in src/index.css (.aurora__layer) redone
    pixel for pixel in numpy — same two repeating gradients, same stops, same
    `difference` blend and mask — so the cards are the site's surface rather than
    a stock template.

Output is deterministic: no randomness, no timestamps, fixed quantiser.
"""
import json
import os
import re
import shutil
import subprocess
import sys
import tempfile

import numpy as np
from fontTools.ttLib import TTFont
from PIL import Image, ImageDraw, ImageFilter, ImageFont

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = os.path.join(ROOT, "public", "og")
W, H = 1200, 630
S = 2  # everything is drawn at 2x and averaged down, for sub-pixel text placement

# Palette — the tokens from index.css and the Tailwind classes the hero uses.
PAGE = (10, 10, 10)                   # --color-page
WHITE = (255, 255, 255)
GRAY_300 = (209, 213, 219)
GRAY_400 = (156, 163, 175)
GRAY_500 = (107, 114, 128)
INDIGO_400 = (129, 140, 248)
INDIGO_500 = (99, 102, 241)
BLUE_400 = (96, 165, 250)
SKY_300 = (125, 211, 252)
NAME_GRADIENT = (INDIGO_400, BLUE_400, SKY_300)   # from-indigo-400 via-blue-400 to-sky-300

PAD = 72
FOOT_Y = 548                          # hairline above the footer, on every card but home


# ── data ────────────────────────────────────────────────────────────────────

LOADER = """
import { fileURLToPath } from "node:url";
export async function load(url, context, next) {
  // Images are imported by the data files for the site's bundler; here they only
  // need to resolve to something, and a path is the most useful thing to hand back.
  if (/\\.(png|webp|jpe?g|svg)$/.test(url)) {
    return { format: "module", shortCircuit: true,
             source: `export default ${JSON.stringify(fileURLToPath(url))};` };
  }
  return next(url, context);
}
"""

RUNNER = """
import { register } from "node:module";
import { pathToFileURL } from "node:url";
register(pathToFileURL(process.argv[2]));
const root = process.argv[3];
const load = (p) => import(pathToFileURL(`${root}/${p}`).href);
const { projects } = await load("src/data/portfolio.js");
const { CASE_STUDIES } = await load("src/data/caseStudies.js");
const { hiring } = await load("src/data/hiring.js");
const { readingTime } = await load("src/lib/readingTime.js");
const studies = Object.entries(CASE_STUDIES).map(([id, s]) => ({
  id, project: s.project, projectId: s.projectId, accent: s.accent, title: s.title,
  dek: s.dek, date: s.date, tags: s.tags, reading: readingTime(s),
}));
process.stdout.write(JSON.stringify({
  projects: projects.map((p) => ({ id: p.id, title: p.title, tagline: p.tagline,
    accent: p.accent, stack: p.stack ?? [], image: p.image ?? null })),
  studies,
  location: hiring.location,
}));
"""


def load_site_data():
    node = shutil.which("node")
    if not node:
        sys.exit("node not found on PATH — it loads the site's data modules (see the header)")
    with tempfile.TemporaryDirectory() as tmp:
        loader, runner = os.path.join(tmp, "loader.mjs"), os.path.join(tmp, "runner.mjs")
        open(loader, "w").write(LOADER)
        open(runner, "w").write(RUNNER)
        out = subprocess.run([node, runner, loader, ROOT], capture_output=True, text=True)
    if out.returncode != 0:
        sys.exit(f"could not load the site data with node:\n{out.stderr}")
    return json.loads(out.stdout)


def read_text(rel):
    return open(os.path.join(ROOT, rel), encoding="utf8").read()


def meta(html, attr, name):
    m = re.search(rf'<meta\s+{attr}="{name}"\s+content="([^"]*)"', html)
    if not m:
        sys.exit(f"index.html has no <meta {attr}=\"{name}\">")
    return m.group(1)


def home_copy():
    """Name, role and blurb as the page itself words them for a link preview."""
    html = read_text("index.html")
    name, role = meta(html, "property", "og:title").split(" — ")
    blurb = meta(html, "name", "twitter:description")
    return name, role, blurb


def writing_copy():
    """The /writing description, read from the script that serves it as <meta>."""
    src = read_text("scripts/prerender-projects.mjs")
    block = src[src.index('const pageTitle = "Writing | Bhupesh Roushan"'):]
    m = re.search(r'const desc =\s*"([^"]+)"', block)
    if not m:
        sys.exit("could not find the /writing description in prerender-projects.mjs")
    return m.group(1)


def section_index(label):
    """The `02` in `02 / PROJECTS`, read from the section header that prints it."""
    m = re.search(rf'<SectionHeader index="(\d+)" label="{label}"',
                  read_text("src/components/sections/Projects.jsx"))
    if not m:
        sys.exit(f"no SectionHeader index for {label}")
    return m.group(1)


# ── fonts ───────────────────────────────────────────────────────────────────

_FONT_DIR = tempfile.mkdtemp(prefix="og-fonts-")
_FILES, _CMAPS, _CACHE = {}, {}, {}


def _ttf(name):
    if name not in _FILES:
        f = TTFont(os.path.join(ROOT, "public", "fonts", f"{name}-latin.woff2"))
        f.flavor = None
        path = os.path.join(_FONT_DIR, f"{name}.ttf")
        f.save(path)
        _FILES[name] = path
        _CMAPS[name] = set(f.getBestCmap())
    return _FILES[name]


def font(name, size, weight):
    key = (name, size, weight)
    if key not in _CACHE:
        f = ImageFont.truetype(_ttf(name), round(size * S), layout_engine=ImageFont.Layout.BASIC)
        f.set_variation_by_axes([weight])
        f._og_name = name
        _CACHE[key] = f
    return _CACHE[key]


def SG(size, weight=500):
    return font("space-grotesk", size, weight)


def JB(size, weight=700):
    return font("jetbrains-mono", size, weight)


# ── text ────────────────────────────────────────────────────────────────────

def text_width(s, fnt, tracking=0.0):
    """Width in 1x px. Tracking is in em, as CSS letter-spacing is."""
    return (fnt.getlength(s) + len(s) * tracking * fnt.size) / S


def check_glyphs(s, fnt):
    missing = {c for c in s if ord(c) not in _CMAPS[fnt._og_name] and c != " "}
    if missing:
        sys.exit(f"{fnt._og_name} has no glyph for {sorted(missing)} in {s!r}")


def draw_text(img, xy, s, fnt, fill, tracking=0.0, anchor="l"):
    """
    Draw `s` with its baseline at xy[1]. Placed per character off the running
    prefix width rather than character by character, so kerning survives and
    rounding does not accumulate. `fill` is a colour, or a list of stops for a
    left-to-right gradient across the text.
    """
    check_glyphs(s, fnt)
    x, y = xy
    width = text_width(s, fnt, tracking)
    if anchor == "c":
        x -= width / 2
    elif anchor == "r":
        x -= width
    mask = Image.new("L", img.size, 0)
    d = ImageDraw.Draw(mask)
    for i, ch in enumerate(s):
        off = fnt.getlength(s[:i]) + i * tracking * fnt.size
        d.text((x * S + off, y * S), ch, font=fnt, fill=255, anchor="ls")
    if isinstance(fill[0], int):
        solid = Image.new("RGB", img.size, fill[:3])
        alpha = fill[3] / 255 if len(fill) == 4 else 1
        if alpha < 1:
            mask = mask.point(lambda v: int(v * alpha))
        img.paste(solid, (0, 0), mask)
    else:
        img.paste(gradient_strip(img.size, x * S, (x + width) * S, fill), (0, 0), mask)
    return width


def gradient_strip(size, x0, x1, stops):
    xs = np.clip((np.arange(size[0]) - x0) / max(x1 - x0, 1), 0, 1)
    pos = np.linspace(0, 1, len(stops))
    row = np.stack([np.interp(xs, pos, [c[k] for c in stops]) for k in range(3)], axis=-1)
    return Image.fromarray(np.tile(row[None], (size[1], 1, 1)).astype(np.uint8), "RGB")


def _greedy(words, fnt, max_w, tracking):
    lines, line = [], ""
    for word in words:
        trial = f"{line} {word}".strip()
        if text_width(trial, fnt, tracking) <= max_w or not line:
            line = trial
        else:
            lines.append(line)
            line = word
    return lines + [line]


def wrap(s, fnt, max_w, tracking=0.0, balance=False):
    """
    Greedy wrap. A lone em dash stays on the end of the line before it rather
    than opening the next, and `balance` narrows the measure until it would
    take another line, so a two-line paragraph does not end on one orphaned word.
    """
    words = []
    for word in s.split():
        if word == "—" and words:
            words[-1] += " —"
        else:
            words.append(word)
    lines = _greedy(words, fnt, max_w, tracking)
    if balance and len(lines) > 1:
        n, lo = len(lines), max_w * 0.5
        while max_w - lo > 1:
            mid = (lo + max_w) / 2
            if len(_greedy(words, fnt, mid, tracking)) == n:
                max_w = mid
            else:
                lo = mid
        lines = _greedy(words, fnt, max_w, tracking)
    return lines


def fit(s, make_font, sizes, max_w, max_lines, tracking=0.0, balance=False, must=True):
    """The largest size in `sizes` at which `s` fits — no ellipsis, no clipped copy."""
    for size in sizes:
        fnt = make_font(size)
        lines = wrap(s, fnt, max_w, tracking, balance)
        # A single long word never wraps, so the line count alone cannot say it fits.
        if len(lines) <= max_lines and all(text_width(l, fnt, tracking) <= max_w for l in lines):
            return size, fnt, lines
    if must:
        sys.exit(f"{s!r} does not fit in {max_lines} lines at {sizes[-1]}px")
    return None


def paragraph(img, x, y, lines, fnt, fill, leading, tracking=0.0, anchor="l"):
    """Draws lines with the first baseline at y; returns the next baseline."""
    for line in lines:
        draw_text(img, (x, y), line, fnt, fill, tracking, anchor)
        y += leading
    return y


# ── shapes ──────────────────────────────────────────────────────────────────

def over(img, fn):
    """Run `fn(draw)` on a transparent layer and composite it, so alpha fills work."""
    layer = Image.new("RGBA", img.size, (0, 0, 0, 0))
    fn(ImageDraw.Draw(layer))
    img.paste(Image.alpha_composite(img.convert("RGBA"), layer).convert("RGB"))


def rrect(img, box, radius, fill=None, outline=None, width=1):
    x0, y0, x1, y1 = [v * S for v in box]
    over(img, lambda d: d.rounded_rectangle([x0, y0, x1, y1], radius * S, fill=fill,
                                            outline=outline, width=round(width * S)))


def hairline(img, y, x0=PAD, x1=W - PAD, alpha=26):
    over(img, lambda d: d.line([(x0 * S, y * S), (x1 * S, y * S)], fill=(255, 255, 255, alpha), width=S))


def chip(img, x, y, label, fnt, fg, bg, border, h=40, px=16, radius=10):
    """A tag / stack chip. y is its top edge. Returns its right edge."""
    w = text_width(label, fnt) + 2 * px
    rrect(img, (x, y, x + w, y + h), radius, fill=bg, outline=border, width=1)
    draw_text(img, (x + px, y + h / 2 + fnt.size * 0.34), label, fnt, fg)
    return x + w


# ── backdrop ────────────────────────────────────────────────────────────────

def _stops(pos, stops):
    """CSS linear-gradient colour at `pos` (percent), clamped at the ends."""
    xs = [s[0] for s in stops]
    return np.stack([np.interp(pos, xs, [s[1][k] for s in stops]) for k in range(3)], axis=-1)


AURORA = [(10, (0x4f, 0x46, 0xe5)), (15, (0x81, 0x8c, 0xf8)), (20, (0x7d, 0xd3, 0xfc)),
          (25, (0xc7, 0xd2, 0xfe)), (30, (0x38, 0xbd, 0xf8))]
# The black band layer: opaque 0-7%, easing to clear by 10%, clear to 12%, back to opaque by 16%.
BANDS = [(0, 1.0), (7, 1.0), (10, 0.0), (12, 0.0), (16, 1.0)]


def _layer(w, h, size_pct, pos_x, ax, ay):
    """
    The `.aurora__layer` background — bands over the aurora colours — for a box
    of w x h, as CSS would paint it: each repeating gradient is laid on its own
    tile (`background-size`), offset by `background-position`, and repeats.
    """
    yy, xx = np.mgrid[0:h, 0:w].astype(np.float32)

    def run(width_pct, x_pct):
        tw = w * width_pct
        length = abs(tw * ax) + abs(h * ay)          # CSS gradient-line length
        px = (xx - (w - tw) * x_pct) % tw            # position inside the repeating tile
        s = (px - tw / 2) * ax + (yy - h / 2) * ay + length / 2
        return s / length * 100

    p_band = run(size_pct[0], pos_x[0])
    p_aur = run(size_pct[1], pos_x[1])
    period = 16.0
    band = np.interp(p_band % period, [b[0] for b in BANDS], [b[1] for b in BANDS])
    q = (p_aur - 10) % 20 + 10                       # repeating 10%..30%, hard edge at the seam
    colour = _stops(q, AURORA)
    return colour * (1 - band)[..., None]


def aurora(strength=1.0, phase=0.5, mask_at=(0.55, 0.0), mask_scale=1.0):
    """
    The hero backdrop (index.css `.aurora`): two stacked repeating gradients, a
    second copy blended with `difference`, 10px blur, 75% opacity, and a radial
    mask whose strongest point is the top edge. `phase` is where the 60s drift
    has got to (0.5 is its start); `strength` thins it for cards whose text
    needs a quieter ground than the hero's.
    """
    a = np.radians(100)
    ax, ay = np.sin(a), -np.cos(a)
    # `background-attachment: fixed` on the ::after copy: the viewport is its tile.
    base = _layer(W, H, (3.0, 2.0), (0.5, 0.5), ax, ay)
    shifted = _layer(W, H, (2.0, 1.0), (phase, phase), ax, ay)
    layer = np.abs(base - shifted).clip(0, 255).astype(np.uint8)
    layer = np.asarray(Image.fromarray(layer).filter(ImageFilter.GaussianBlur(10)), dtype=np.float32)

    # radial-gradient(ellipse at 55% 0%, #000 18%, transparent 80%), farthest-corner.
    yy, xx = np.mgrid[0:H, 0:W].astype(np.float32)
    cx, cy = mask_at[0] * W, mask_at[1] * H
    rx, ry = max(cx, W - cx), max(cy, H - cy)
    rx, ry = rx * np.sqrt(2) * mask_scale, ry * np.sqrt(2) * mask_scale
    d = np.sqrt(((xx - cx) / rx) ** 2 + ((yy - cy) / ry) ** 2)
    mask = np.clip((0.80 - d) / (0.80 - 0.18), 0, 1)
    out = layer * (mask * 0.75 * strength)[..., None]

    # The hero's `from-black/40 via-transparent to-page` wash over the top.
    t = yy / H
    black = np.where(t < 0.5, 0.4 * (1 - t / 0.5), 0.0)[..., None]
    out = out * (1 - black)
    to_page = np.clip((t - 0.5) / 0.5, 0, 1)[..., None]
    out = out * (1 - to_page) + np.array(PAGE, dtype=np.float32) * to_page
    return out


def glow(rgb, centre, radius, alpha):
    """A soft accent bloom — the radial `rgba(accent, .x)` wash the cards use on hover."""
    layer = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    cx, cy = centre
    ImageDraw.Draw(layer).ellipse([cx - radius, cy - radius * 0.7, cx + radius, cy + radius * 0.7],
                                  fill=(*rgb, int(255 * alpha)))
    return layer.filter(ImageFilter.GaussianBlur(radius * 0.45))


def backdrop(strength=1.0, phase=0.5, accent=None, accent_at=(1010, 70), mask_at=(0.55, 0.0),
             mask_scale=1.0):
    # Under the aurora is the page colour, not the pure black the CSS layer sits
    # on: the hero's bottom wash lands on #0a0a0a and so does the next section.
    base = np.maximum(aurora(strength, phase, mask_at, mask_scale), np.array(PAGE, dtype=np.float32))
    img = Image.fromarray(base.clip(0, 255).astype(np.uint8)).convert("RGBA")
    if accent:
        img = Image.alpha_composite(img, glow(accent, accent_at, 330, 0.30))
    return img.convert("RGB").resize((W * S, H * S), Image.BICUBIC)


# ── shared furniture ────────────────────────────────────────────────────────

def wordmark(img, x, y, size=28, anchor="l"):
    """bhupesh.blog as the navbar sets it: mono, bold, `.blog` in indigo."""
    f = JB(size, 700)
    a, b = "bhupesh", ".blog"
    total = text_width(a + b, f)
    if anchor == "c":
        x -= total / 2
    wa = draw_text(img, (x, y), a, f, WHITE)
    draw_text(img, (x + wa, y), b, f, INDIGO_500)
    return total


def footer(img, name, role):
    hairline(img, FOOT_Y)
    wordmark(img, PAD, FOOT_Y + 52, 28)
    draw_text(img, (W - PAD, FOOT_Y + 50), f"{name} · {role}", SG(22, 500), GRAY_400, anchor="r")


def eyebrow(img, x, y, parts, size=22):
    """`02 / PROJECTS`: small, uppercase, tracked, the leading index in indigo."""
    f = SG(size, 600)
    tr = 0.14
    for text, colour in parts:
        x += draw_text(img, (x, y), text.upper(), f, colour, tr) + tr * f.size / S
    return x


def finish(img, name, written):
    """
    Average down to 1x and write an 8-bit palette PNG: about 100KB against
    250-290KB for the same pixels as 24-bit, which matters because WhatsApp
    drops previews over roughly 300KB. Plain median-cut gives the one-off
    colours — the indigo of an index, a chip's tint — to the nearest grey; the
    k-means passes keep them.
    """
    small = img.resize((W, H), Image.LANCZOS)
    palette = small.quantize(colors=256, method=Image.Quantize.MEDIANCUT, kmeans=3)
    # Dithering only applies when remapping onto a palette that already exists;
    # without it the aurora's slow gradients step in visible contour bands.
    q = small.quantize(palette=palette, dither=Image.Dither.FLOYDSTEINBERG)
    path = os.path.join(OUT, name)
    q.save(path, "PNG", optimize=True)
    written.append((name, os.path.getsize(path)))


# ── cards ───────────────────────────────────────────────────────────────────

def card_home(site, written):
    name, role, blurb = home_copy()
    # Phase 1.0 of the 60s drift — an indigo band in view, rather than the green
    # fringe the animation passes through at its start.
    img = backdrop(1.0, 1.0, mask_at=(0.5, 0.12), mask_scale=1.05)

    # Avatar with the hero's ring glow: the same indigo -> blue -> sky run.
    cx, cy, r = W / 2, 118, 64
    ring = Image.new("RGBA", img.size, (0, 0, 0, 0))
    ImageDraw.Draw(ring).ellipse([(cx - r - 5) * S, (cy - r - 5) * S, (cx + r + 5) * S, (cy + r + 5) * S],
                                 fill=(*INDIGO_500, 255))
    img.paste(Image.alpha_composite(img.convert("RGBA"), ring.filter(ImageFilter.GaussianBlur(6 * S))).convert("RGB"))
    avatar = Image.open(os.path.join(ROOT, "src/assets/bhupesh.webp")).convert("RGB")
    side = min(avatar.size)
    avatar = avatar.crop(((avatar.width - side) // 2, 0, (avatar.width + side) // 2, side))
    avatar = avatar.resize((2 * r * S, 2 * r * S), Image.LANCZOS)
    disc = Image.new("L", avatar.size, 0)
    ImageDraw.Draw(disc).ellipse([0, 0, avatar.width - 1, avatar.height - 1], fill=255)
    img.paste(avatar, (int((cx - r) * S), int((cy - r) * S)), disc)
    ImageDraw.Draw(img).ellipse([(cx - r) * S, (cy - r) * S, (cx + r) * S, (cy + r) * S],
                                outline=(255, 255, 255), width=S * 2)

    # Location pill, as the status row sets it: hairline border, 5% fill, a pin.
    label = site["location"]
    f = SG(22, 500)
    pw = text_width(label, f) + 30 + 26
    px = W / 2 - pw / 2
    rrect(img, (px, 214, px + pw, 258), 22, fill=(255, 255, 255, 13), outline=(255, 255, 255, 26))
    over(img, lambda d: (
        d.ellipse([(px + 25) * S, (225) * S, (px + 39) * S, (239) * S], outline=(*INDIGO_400, 255), width=2 * S),
        d.ellipse([(px + 29) * S, (229) * S, (px + 35) * S, (235) * S], fill=(*INDIGO_400, 255)),
        d.polygon([((px + 26.5) * S, 235 * S), ((px + 37.5) * S, 235 * S), ((px + 32) * S, 246 * S)],
                  fill=(*INDIGO_400, 255)),
    ))
    draw_text(img, (px + 50, 242), label, f, GRAY_300)

    size, nf, _ = fit(name, lambda s: SG(s, 700), range(120, 80, -4), W - 2 * PAD, 1, -0.035)
    draw_text(img, (W / 2, 372), name, nf, NAME_GRADIENT, -0.035, anchor="c")
    draw_text(img, (W / 2, 438), role, SG(40, 600), WHITE, -0.01, anchor="c")
    lines = wrap(blurb, SG(28, 400), 900, balance=True)
    paragraph(img, W / 2, 492, lines, SG(28, 400), GRAY_300, 40, anchor="c")
    wordmark(img, W / 2, 596, 26, anchor="c")
    finish(img, "home.png", written)


def card_writing(site, written):
    name, role, _ = home_copy()
    studies = site["studies"]
    img = backdrop(0.8, 0.75, mask_at=(0.8, 0.0))
    eyebrow(img, PAD, 100, [("Writing", INDIGO_400), (f" / {len(studies)} write-ups", GRAY_400)])
    draw_text(img, (PAD, 210), "Writing", SG(104, 700), WHITE, -0.035)
    paragraph(img, PAD, 274, wrap(writing_copy(), SG(28, 400), 940, balance=True),
              SG(28, 400), GRAY_300, 40)

    # One row per write-up: accent bar, project, title — the list the page shows.
    y = 384
    name_font = SG(21, 600)
    col = max(text_width(s["project"], name_font) for s in studies) + 28
    for s in studies:
        rgb = tuple(int(v) for v in s["accent"].split(","))
        rrect(img, (PAD, y - 22, PAD + 5, y + 8), 2, fill=(*rgb, 255))
        draw_text(img, (PAD + 22, y + 1), s["project"], name_font, rgb)
        tx = PAD + 22 + col
        _, tf, lines = fit(s["title"], lambda z: SG(z, 500), (22, 21, 20), W - PAD - tx, 1)
        draw_text(img, (tx, y + 1), lines[0], tf, GRAY_300)
        y += 42
    footer(img, name, role)
    finish(img, "writing.png", written)


def card_study(site, s, written):
    name, role, _ = home_copy()
    rgb = tuple(int(v) for v in s["accent"].split(","))
    img = backdrop(0.7, 0.75, accent=rgb, accent_at=(1040, 60), mask_at=(0.8, 0.0))

    # Two lines at a large size if the title allows it, three at a smaller one if
    # it does not — never an ellipsis, since the title is the page's own.
    measure = W - 2 * PAD - 40
    make = lambda z: SG(z, 700)  # noqa: E731
    size, tf, lines = (fit(s["title"], make, range(64, 52, -2), measure, 2, -0.028, must=False)
                       or fit(s["title"], make, range(52, 42, -2), measure, 3, -0.028))
    lead = round(size * 1.1)
    dsize, df, dlines = fit(s["dek"], lambda z: SG(z, 400), (30, 28, 26), 940, 2, balance=True)

    # Lay the block out from the top, then centre it between eyebrow and footer.
    eyebrow_y = 112
    title_y = size + 26
    dek_y = title_y + lead * (len(lines) - 1) + round(dsize * 2.0)
    chips_y = dek_y + round(dsize * 1.4) * (len(dlines) - 1) + 38
    bottom = chips_y + 42
    shift = max(0, round(((FOOT_Y - 40) - 84 - bottom) * 0.5))
    eyebrow(img, PAD, eyebrow_y + shift, [(s["project"], rgb),
                                          (f" / {s['date']} / {s['reading']} read", GRAY_400)])
    paragraph(img, PAD, eyebrow_y + shift + title_y, lines, tf, WHITE, lead, -0.028)
    paragraph(img, PAD, eyebrow_y + shift + dek_y, dlines, df, GRAY_300, round(dsize * 1.4))

    # The tags the write-up opens with, accent-tinted as the page tints them.
    tx = PAD
    for tag in s["tags"]:
        tx = chip(img, tx, eyebrow_y + shift + chips_y, tag, SG(21, 500), rgb, (*rgb, 20),
                  (*rgb, 77), h=42) + 12
    footer(img, name, role)
    finish(img, f"writing-{s['id']}.png", written)


def card_project(site, p, written):
    name, role, _ = home_copy()
    rgb = tuple(int(v) for v in p["accent"].split(","))
    img = backdrop(0.7, 0.75, accent=rgb, accent_at=(980, 90), mask_at=(0.8, 0.0))

    # The screenshot the project's own card shows, framed like it: the whole width,
    # cropped from the bottom if it is taller than the frame.
    shot_w, max_h = 440, 300
    sx, sy = W - PAD - shot_w, 128
    if p["image"]:
        shot = Image.open(p["image"]).convert("RGB")
        shot_h = min(max_h, round(shot_w * shot.height / shot.width))
        shot = shot.resize((shot_w, round(shot_w * shot.height / shot.width)), Image.LANCZOS)
        shot = shot.crop((0, 0, shot_w, shot_h)).resize((shot_w * S, shot_h * S), Image.LANCZOS)
        mask = Image.new("L", shot.size, 0)
        ImageDraw.Draw(mask).rounded_rectangle([0, 0, shot.width - 1, shot.height - 1], 18 * S, fill=255)
        rrect(img, (sx - 1, sy - 1, sx + shot_w + 1, sy + shot_h + 1), 19, fill=(0, 0, 0, 120))
        img.paste(shot, (sx * S, sy * S), mask)
        rrect(img, (sx, sy, sx + shot_w, sy + shot_h), 18, outline=(255, 255, 255, 36), width=1.5)

    left_w = (sx - 48) - PAD if p["image"] else W - 2 * PAD
    eyebrow(img, PAD, 112, [(section_index("Projects"), INDIGO_400), (" / Projects", GRAY_400)])
    size, tf, _ = fit(p["title"], lambda z: SG(z, 700), range(112, 60, -4), left_w, 1, -0.035)
    draw_text(img, (PAD, 112 + 28 + size * 0.95), p["title"], tf, WHITE, -0.035)
    y = 112 + 28 + size * 0.95 + 20
    tsize, tgf, tlines = fit(p["tagline"], lambda z: SG(z, 600), (36, 34, 32, 30), left_w, 2, -0.01)
    y = paragraph(img, PAD, y + tsize, tlines, tgf, rgb, round(tsize * 1.25), -0.01)

    # Stack chips, two rows at most; the rest are counted, not dropped silently.
    cf = SG(20, 500)
    stack = p["stack"]
    x, row, top = PAD, 0, FOOT_Y - 24 - 2 * 46 + 4
    max_x = W - PAD
    shown = 0
    layout = []
    for i, tech in enumerate(stack):
        w = text_width(tech, cf) + 28
        rest = len(stack) - i - 1
        reserve = (text_width(f"+{rest}", cf) + 28 + 10) if rest else 0
        if x + w + reserve > max_x and x > PAD:
            row, x = row + 1, PAD
            if row == 2:
                break
        layout.append((x, row, tech))
        x += w + 10
        shown = i + 1
    if shown < len(stack):
        layout.append((x, row, f"+{len(stack) - shown}"))
    for cx_, r_, label in layout:
        chip(img, cx_, top + r_ * 46, label, cf, GRAY_300, (255, 255, 255, 13),
             (255, 255, 255, 26), h=38, px=14, radius=8)
    footer(img, name, role)
    finish(img, f"project-{p['id']}.png", written)


# ── main ────────────────────────────────────────────────────────────────────

def main():
    site = load_site_data()
    os.makedirs(OUT, exist_ok=True)
    written = []
    card_home(site, written)
    card_writing(site, written)
    for s in site["studies"]:
        card_study(site, s, written)
    for p in site["projects"]:
        card_project(site, p, written)
    shutil.rmtree(_FONT_DIR, ignore_errors=True)
    total = sum(b for _, b in written)
    print(f"wrote {len(written)} OG cards to public/og/ ({total / 1024:.0f} KB)")
    for name, size in written:
        print(f"  {name:<46}{size / 1024:6.1f} KB")


if __name__ == "__main__":
    main()
