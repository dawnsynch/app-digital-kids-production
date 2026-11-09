"""Extract Bible Learning artwork from the approved 1536 x 1024 mockup."""

from pathlib import Path
import subprocess


SOURCE = Path("screen_designs/Digital Kids Bible Learning Dashboard (1).png")
OUTPUT = Path("src/assets/bible-learning")


def save(name: str, box: tuple[int, int, int, int], scale: int = 2) -> None:
    left, top, right, bottom = box
    width = right - left
    height = bottom - top
    subprocess.run(
        [
            "magick",
            str(SOURCE),
            "-crop",
            f"{width}x{height}+{left}+{top}",
            "+repage",
            "-resize",
            f"{width * scale}x{height * scale}!",
            str(OUTPUT / f"{name}.png"),
        ],
        check=True,
    )


def main() -> None:
    OUTPUT.mkdir(parents=True, exist_ok=True)
    save("hero-illustration", (690, 84, 1161, 226))
    save("david-illustration", (488, 204, 824, 426))
    save("verse-book", (1040, 262, 1152, 350))

    save("skill-bible-stories", (426, 490, 548, 626))
    save("skill-memory-verses", (744, 490, 860, 626))
    save("skill-christian-character", (1070, 488, 1158, 630))
    save("skill-life-lessons", (470, 648, 548, 786))
    save("skill-prayer-reflection", (774, 648, 860, 786))
    save("skill-people-of-bible", (1062, 646, 1158, 790))

    save("esther-illustration", (502, 832, 574, 1000))
    save("kindness-illustration", (784, 832, 870, 958))


if __name__ == "__main__":
    main()
