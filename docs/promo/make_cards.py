# -*- coding: utf-8 -*-
"""生成 PDX 模改工坊宣传素材：封面、片头、片尾、章节卡。

Run:
  python docs/promo/make_cards.py
Outputs into the script's own folder (cover.png, card_title.png, card_outro.png, chapters/*.png)
"""
from __future__ import annotations

import os
from PIL import Image, ImageDraw, ImageFont

HERE = os.path.dirname(os.path.abspath(__file__))
W, H = 1920, 1080

BG_TOP = (15, 22, 32)
BG_BOTTOM = (26, 38, 52)
ACCENT = (240, 160, 32)
TEXT = (242, 244, 247)
MUTED = (159, 176, 192)
DIM = (74, 92, 110)

BOLD = "C:/Windows/Fonts/msyhbd.ttc"
REGULAR = "C:/Windows/Fonts/msyh.ttc"
MONO = "C:/Windows/Fonts/consola.ttf"


def font(path: str, size: int) -> ImageFont.FreeTypeFont:
    return ImageFont.truetype(path, size, index=0)


def background() -> Image.Image:
    img = Image.new("RGB", (W, H), BG_TOP)
    draw = ImageDraw.Draw(img)
    for y in range(H):
        t = y / (H - 1)
        color = tuple(int(BG_TOP[i] + (BG_BOTTOM[i] - BG_TOP[i]) * t) for i in range(3))
        draw.line([(0, y), (W, y)], fill=color)
    grid = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    gd = ImageDraw.Draw(grid)
    for x in range(0, W, 64):
        gd.line([(x, 0), (x, H)], fill=(255, 255, 255, 7))
    for y in range(0, H, 64):
        gd.line([(0, y), (W, y)], fill=(255, 255, 255, 7))
    img = Image.alpha_composite(img.convert("RGBA"), grid)
    glow = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    ggd = ImageDraw.Draw(glow)
    for i in range(18):
        r = 520 - i * 26
        alpha = 5 + i
        ggd.ellipse([W - 250 - r, -230 - r // 3, W - 250 + r, -230 + r], fill=(240, 160, 32, alpha))
    return Image.alpha_composite(img, glow)


def accent_bar(draw: ImageDraw.ImageDraw, x: int, y: int, w: int = 132) -> None:
    draw.rounded_rectangle([x, y, x + w, y + 8], radius=4, fill=ACCENT)


def code_motif(img: Image.Image, x: int, y: int) -> None:
    """右侧半透明的脚本剪影，暗示"生成代码"。"""
    layer = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    d = ImageDraw.Draw(layer)
    lines = [
        ("advance = {", 34, (242, 244, 247, 60)),
        ("  age = age_2_renaissance", 30, (240, 160, 32, 55)),
        ("  requires = feudalism_advance", 30, (159, 176, 192, 50)),
        ("  monthly_prestige = 0.5", 30, (159, 176, 192, 50)),
        ("  land_morale_modifier = 0.05", 30, (159, 176, 192, 50)),
        ("}", 34, (242, 244, 247, 60)),
        ("", 18, (0, 0, 0, 0)),
        ("loc/advance_l_simp_chinese.yml", 26, (240, 160, 32, 45)),
        ("  name: \"...\"", 26, (159, 176, 192, 42)),
        ("  desc: \"...\"", 26, (159, 176, 192, 42)),
    ]
    cy = y
    for text, size, color in lines:
        if text:
            d.text((x, cy), text, font=font(MONO, size), fill=color)
        cy += int(size * 1.65)
    img.alpha_composite(layer)


def save(img: Image.Image, name: str) -> None:
    path = os.path.join(HERE, name)
    parent = os.path.dirname(path)
    if parent:
        os.makedirs(parent, exist_ok=True)
    img.convert("RGB").save(path, "PNG")
    print("wrote", path)


def cover() -> None:
    img = background()
    code_motif(img, 1180, 250)
    d = ImageDraw.Draw(img)

    x = 140
    d.text((x, 150), "D S H  ·  侧 边 栏 插 件", font=font(BOLD, 34), fill=ACCENT)
    d.text((x, 214), "PDX 模改工坊", font=font(BOLD, 132), fill=TEXT)
    d.text((x, 372), "P D X   F O R G E", font=font(BOLD, 40), fill=MUTED)
    accent_bar(d, x, 452, 168)

    d.text((x, 500), "欧陆风云 5 · 脚本生成器", font=font(BOLD, 62), fill=TEXT)
    d.text((x, 594), "填名称、选修正，脚本和本地化自动生成并写进 MOD", font=font(REGULAR, 34), fill=MUTED)

    bullets = [
        "革新 / 决议 / 事件 / 特权 / 法律 五类",
        "3000+ 修正，中文名可搜，MOD 自带的也认",
        "AI 助手：用中文描述触发与效果",
        "一键写入、追加去重、自动补 BOM",
    ]
    by = 700
    for item in bullets:
        d.ellipse([x, by + 12, x + 14, by + 26], fill=ACCENT)
        d.text((x + 34, by), item, font=font(REGULAR, 32), fill=MUTED)
        by += 58

    d.text((x, 985), "github.com/fjoasiw/pdx-forge   ·   MIT", font=font(MONO, 28), fill=DIM)
    save(img, "cover.png")


def title_card() -> None:
    img = background()
    code_motif(img, 1140, 300)
    d = ImageDraw.Draw(img)
    d.text((150, 372), "PDX 模改工坊", font=font(BOLD, 150), fill=TEXT)
    accent_bar(d, 156, 566, 220)
    d.text((152, 614), "欧陆风云 5 · 写在侧边栏里的脚本生成器", font=font(REGULAR, 44), fill=MUTED)
    save(img, "card_title.png")


def outro_card() -> None:
    img = background()
    d = ImageDraw.Draw(img)
    d.text((150, 300), "开源 · 免费", font=font(BOLD, 118), fill=TEXT)
    accent_bar(d, 156, 470, 200)
    d.text((152, 512), "MIT License  ·  欢迎 Issue / PR", font=font(REGULAR, 44), fill=MUTED)
    d.rounded_rectangle([150, 640, 1290, 780], radius=18, outline=(70, 92, 112), width=3)
    d.text((192, 690), "github.com/fjoasiw/pdx-forge", font=font(MONO, 46), fill=ACCENT)
    d.text((152, 850), "有问题、想要的功能，评论区或 Issues 说一声就行。", font=font(REGULAR, 34), fill=MUTED)
    save(img, "card_outro.png")


CHAPTERS = [
    ("01", "填名字，选修正", "右侧实时出脚本和本地化"),
    ("02", "修正库认得中文和 MOD", "三个大类、主题细分、MOD 徽章"),
    ("03", "AI 写触发与效果", "一句话需求就能生成 potential / effect"),
    ("04", "写进 MOD", "新建或追加已有文档，自动补 BOM"),
    ("05", "改已有的条目", "本地化在上、数据在下，逐项可改"),
]


def chapter_cards() -> None:
    for index, (number, title, subtitle) in enumerate(CHAPTERS, start=1):
        img = background()
        d = ImageDraw.Draw(img)
        d.text((150, 268), number, font=font(BOLD, 190), fill=ACCENT)
        d.text((150, 540), title, font=font(BOLD, 96), fill=TEXT)
        d.text((154, 690), subtitle, font=font(REGULAR, 42), fill=MUTED)
        accent_bar(d, 156, 790, 160)
        save(img, f"chapters/ch{index}.png")


if __name__ == "__main__":
    cover()
    title_card()
    outro_card()
    chapter_cards()
