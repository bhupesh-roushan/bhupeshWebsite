#!/usr/bin/env python3
"""
Generate one Open Graph card per page.

Run by hand when titles change, not from `npm run build`:

    python3 scripts/generate-og.py

Deliberately not part of the build. Rasterising text needs a font, and the
fonts this uses are macOS system fonts that do not exist on the Ubuntu runner
CI builds on — wiring it into the build would work here and fail there. The
output is committed instead, which is also why a page's card costs a visitor
nothing at request time.

Reads the same data files the site does, so a card cannot claim a title the
page does not have.
"""
import json
import os
import re
import textwrap

from PIL import Image, ImageDraw, ImageFont

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = os.path.join(ROOT, "public", "og")
W, H = 1200, 630

BG = (10, 10, 10)
WHITE = (255, 255, 255)
MUTED = (156, 163, 175)
DIM = (107, 114, 128)


def font(name, size):
    """macOS ships these; anything else is a machine this was not run on."""
    for path in (
        f"/System/Library/Fonts/{name}",
        f"/System/Library/Fonts/Supplemental/{name}",
    ):
        if os.path.exists(path):
            return ImageFont.truetype(path, size)
    raise SystemExit(f"font not found: {name} — run this on macOS")


BOLD = lambda s: font("HelveticaNeue.ttc", s)   # noqa: E731  index 0 is Regular
REG = lambda s: font("HelveticaNeue.ttc", s)    # noqa: E731


def glow(img, accent):
    """
    The site's hero in two ellipses. Drawn on its own layer and blurred, so the
    card reads as the same surface the page does rather than a stock template.
    """
    from PIL import ImageFilter

    layer = Image.new("RGB", (W, H), BG)
    d = ImageDraw.Draw(layer)
    r, g, b = accent
    d.ellipse([-160, -260, 720, 300], fill=(r // 5, g // 5, b // 5))
    d.ellipse([260, -190, 1180, 220], fill=(r // 8, g // 8, b // 8))
    layer = layer.filter(ImageFilter.GaussianBlur(120))
    return Image.blend(img, layer, 0.9)


def wrap(draw, text, fnt, max_w, max_lines):
    words, lines, line = text.split(), [], ""
    for word in words:
        trial = f"{line} {word}".strip()
        if draw.textlength(trial, font=fnt) <= max_w:
            line = trial
        else:
            lines.append(line)
            line = word
            if len(lines) == max_lines:
                break
    if line and len(lines) < max_lines:
        lines.append(line)
    if len(lines) == max_lines and draw.textlength(" ".join(words), font=fnt) > max_w * max_lines:
        lines[-1] = lines[-1].rstrip(" ,.") + "…"
    return lines


def card(path, kicker, title, subtitle, accent):
    img = Image.new("RGB", (W, H), BG)
    img = glow(img, accent)
    d = ImageDraw.Draw(img)

    x, y = 80, 96

    d.text((x, y), kicker.upper(), font=REG(24), fill=accent)
    y += 58

    title_font = BOLD(66 if len(title) < 46 else 54)
    for line in wrap(d, title, title_font, W - 160, 3):
        d.text((x, y), line, font=title_font, fill=WHITE)
        y += title_font.size + 14

    y += 18
    sub_font = REG(28)
    for line in wrap(d, subtitle, sub_font, W - 180, 2):
        d.text((x, y), line, font=sub_font, fill=MUTED)
        y += sub_font.size + 12

    # Footer, pinned rather than flowed, so every card ends at the same place.
    d.line([(x, H - 116), (W - 80, H - 116)], fill=(38, 38, 45), width=1)
    d.text((x, H - 88), "bhupesh.blog", font=BOLD(26), fill=WHITE)
    d.text(
        (x + d.textlength("bhupesh.blog", font=BOLD(26)) + 18, H - 84),
        "Bhupesh Roushan · Full-stack developer",
        font=REG(22),
        fill=DIM,
    )

    img.save(path, "PNG", optimize=True)
    return os.path.basename(path)


def read_projects():
    src = open(os.path.join(ROOT, "src/data/portfolio.js"), encoding="utf8").read()
    block = src[src.index("export const projects"):]
    out = []
    for m in re.finditer(r'\n {4}id: "([^"]+)"', block):
        chunk = block[m.start(): m.start() + 3000]
        title = re.search(r'title: "([^"]+)"', chunk)
        tagline = re.search(r'tagline: "([^"]+)"', chunk)
        accent = re.search(r'accent: "(\d+),(\d+),(\d+)"', chunk)
        if title and tagline and accent:
            out.append((m.group(1), title.group(1), tagline.group(1),
                        tuple(int(g) for g in accent.groups())))
    return out


def read_studies():
    src = open(os.path.join(ROOT, "src/data/caseStudies.js"), encoding="utf8").read()
    out = []
    for m in re.finditer(r'\n  "([a-z0-9-]+)": \{', src):
        chunk = src[m.start(): m.start() + 3000]
        title = re.search(r'title: "([^"]+)"', chunk)
        dek = re.search(r'dek:\s*\n?\s*"([^"]+)"', chunk)
        project = re.search(r'project: "([^"]+)"', chunk)
        accent = re.search(r'accent: "(\d+),(\d+),(\d+)"', chunk)
        if title and dek and project and accent:
            out.append((m.group(1), project.group(1), title.group(1), dek.group(1),
                        tuple(int(g) for g in accent.groups())))
    return out


os.makedirs(OUT, exist_ok=True)
written = []

written.append(card(
    os.path.join(OUT, "home.png"), "Portfolio",
    "Bhupesh Roushan",
    "Full-stack developer building web platforms and AI-assisted workflows.",
    (99, 102, 241),
))

written.append(card(
    os.path.join(OUT, "writing.png"), "Writing",
    "Engineering decisions, written up",
    "What was measured, and what was rejected — from the commits that record it.",
    (99, 102, 241),
))

for pid, title, tagline, accent in read_projects():
    written.append(card(os.path.join(OUT, f"project-{pid}.png"), "Project", title, tagline, accent))

for sid, project, title, dek, accent in read_studies():
    written.append(card(os.path.join(OUT, f"writing-{sid}.png"),
                        f"{project} · Case study", title, dek, accent))

print(f"wrote {len(written)} OG cards to public/og/")
for name in written:
    print("  ", name)
