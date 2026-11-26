#!/usr/bin/env python3
"""카드 이미지(1080x1350)에서 상품 사진 영역만 잘라 사이트용 정사각 썸네일을 만든다.

사용법:
    python3 tools/make_thumbs.py assets/2026-11-26

- 입력: assets/<날짜>/*.png (1상품 1장 카드 이미지, make_cards.py 산출물)
- 출력: assets/<날짜>/thumb/*.jpg (480x480, 품질 82)
- 카드 레이아웃 상수는 deal-upload의 make_cards.py와 동일:
  사진 박스 = x 140, y 168, 800x800
"""
import os
import sys
from PIL import Image

CARD_W, CARD_H = 1080, 1350
PHOTO_BOX = (140, 168, 940, 968)  # left, top, right, bottom
OUT_SIZE = 480
QUALITY = 82


def make_thumb(src_path: str, dst_path: str) -> None:
    im = Image.open(src_path).convert("RGB")
    left, top, right, bottom = PHOTO_BOX
    if im.width != CARD_W or im.height != CARD_H:
        # 다른 크기의 카드가 오면 위쪽 정사각형 영역을 사용
        side = min(im.width, im.height)
        left, top, right, bottom = 0, 0, side, side
    im = im.crop((left, top, right, bottom)).resize((OUT_SIZE, OUT_SIZE), Image.LANCZOS)
    im.save(dst_path, "JPEG", quality=QUALITY, optimize=True, progressive=True)


def main() -> int:
    if len(sys.argv) < 2:
        print(__doc__)
        return 1
    folder = sys.argv[1]
    thumb_dir = os.path.join(folder, "thumb")
    os.makedirs(thumb_dir, exist_ok=True)
    count = 0
    for name in sorted(os.listdir(folder)):
        if not name.lower().endswith(".png"):
            continue
        src = os.path.join(folder, name)
        dst = os.path.join(thumb_dir, os.path.splitext(name)[0] + ".jpg")
        make_thumb(src, dst)
        count += 1
        print(f"{src} -> {dst}")
    print(f"done: {count} thumbnails")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
