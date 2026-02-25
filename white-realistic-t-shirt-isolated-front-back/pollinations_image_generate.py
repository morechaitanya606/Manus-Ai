"""Generate images with Pollinations.ai.

Usage:
  python pollinations_image_generate.py --prompt "A white t-shirt on studio background"
  python pollinations_image_generate.py --prompt "Minimal logo on shirt" --output shirt.jpg

Set your API key first (optional for some models):
  PowerShell: $env:POLLINATIONS_API_KEY="YOUR_API_KEY"
"""

from __future__ import annotations

import argparse
import os
from pathlib import Path
from urllib.parse import quote

import requests

POLLINATIONS_IMAGE_BASE_URL = "https://gen.pollinations.ai/image"


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Generate an image with Pollinations.ai.")
    parser.add_argument("--prompt", required=True, help="Text prompt for image generation.")
    parser.add_argument(
        "--output",
        default="pollinations_generated.jpg",
        help="Output image path (default: pollinations_generated.jpg).",
    )
    parser.add_argument(
        "--model",
        default="flux",
        help="Pollinations image model (default: flux).",
    )
    parser.add_argument("--width", type=int, default=768, help="Output width (default: 768).")
    parser.add_argument("--height", type=int, default=768, help="Output height (default: 768).")
    parser.add_argument("--seed", type=int, default=None, help="Optional random seed.")
    parser.add_argument(
        "--api-key",
        default=os.environ.get("POLLINATIONS_API_KEY"),
        help="Pollinations API key. Defaults to POLLINATIONS_API_KEY env var.",
    )
    parser.add_argument(
        "--with-logo",
        action="store_true",
        help="Include Pollinations logo (default is no logo).",
    )
    return parser.parse_args()


def build_image_url(prompt: str, model: str, width: int, height: int, seed: int | None, nologo: bool) -> str:
    encoded_prompt = quote(prompt, safe="")
    url = (
        f"{POLLINATIONS_IMAGE_BASE_URL}/{encoded_prompt}"
        f"?model={quote(model, safe='')}&width={width}&height={height}"
        f"&nologo={'true' if nologo else 'false'}"
    )
    if seed is not None:
        url += f"&seed={seed}"
    return url


def download_image(url: str, output_path: Path, api_key: str | None) -> None:
    headers: dict[str, str] = {}
    if api_key:
        headers["Authorization"] = f"Bearer {api_key}"

    with requests.get(url, headers=headers, stream=True, timeout=240) as response:
        if response.status_code != 200:
            raise SystemExit(
                f"Pollinations request failed (HTTP {response.status_code}): {response.text}"
            )

        content_type = response.headers.get("content-type", "")
        if not content_type.startswith("image/"):
            raise SystemExit(
                f"Pollinations returned non-image content-type: {content_type}. Body: {response.text[:300]}"
            )

        output_path.parent.mkdir(parents=True, exist_ok=True)
        with output_path.open("wb") as handle:
            for chunk in response.iter_content(chunk_size=8192):
                if chunk:
                    handle.write(chunk)


def main() -> None:
    args = parse_args()
    image_url = build_image_url(
        prompt=args.prompt,
        model=args.model,
        width=args.width,
        height=args.height,
        seed=args.seed,
        nologo=not args.with_logo,
    )
    download_image(image_url, Path(args.output), args.api_key)
    print(f"Saved: {args.output}")
    print(f"URL: {image_url}")


if __name__ == "__main__":
    main()
