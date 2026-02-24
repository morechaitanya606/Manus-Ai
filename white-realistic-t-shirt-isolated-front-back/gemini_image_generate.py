"""Generate images with Leonardo AI text-to-image API.

Usage:
  python gemini_image_generate.py --prompt "A white t-shirt on studio background"
  python gemini_image_generate.py --prompt "Minimal logo on shirt" --output shirt.jpg

Set your API key first:
  PowerShell: $env:LEONARDO_API_KEY="YOUR_API_KEY"
"""

from __future__ import annotations

import argparse
import os
import time
from pathlib import Path
from urllib.parse import urlparse

import requests

LEONARDO_BASE_URL = "https://cloud.leonardo.ai/api/rest/v1"
DEFAULT_MODEL_ID = "aa77f04e-3eec-4034-9c07-d0f619684628"  # Leonardo Kino XL


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Generate image(s) with Leonardo AI.")
    parser.add_argument("--prompt", required=True, help="Text prompt for image generation.")
    parser.add_argument(
        "--output",
        default="generated_image.jpg",
        help="Output image path for first image (default: generated_image.jpg).",
    )
    parser.add_argument(
        "--api-key",
        default=os.environ.get("LEONARDO_API_KEY"),
        help="Leonardo API key. Defaults to LEONARDO_API_KEY env var.",
    )
    parser.add_argument("--model-id", default=DEFAULT_MODEL_ID, help="Leonardo model ID.")
    parser.add_argument("--width", type=int, default=512, help="Output width.")
    parser.add_argument("--height", type=int, default=512, help="Output height.")
    parser.add_argument("--num-images", type=int, default=1, help="Number of images to generate.")
    parser.add_argument(
        "--negative-prompt",
        default=None,
        help="Optional negative prompt (things to avoid in image).",
    )
    parser.add_argument(
        "--poll-interval",
        type=float,
        default=2.0,
        help="Seconds between status checks (default: 2.0).",
    )
    parser.add_argument(
        "--max-wait-seconds",
        type=int,
        default=180,
        help="Max seconds to wait for generation completion (default: 180).",
    )
    return parser.parse_args()


def auth_headers(api_key: str) -> dict[str, str]:
    return {
        "accept": "application/json",
        "authorization": f"Bearer {api_key}",
        "content-type": "application/json",
    }


def create_generation(
    api_key: str,
    prompt: str,
    model_id: str,
    width: int,
    height: int,
    num_images: int,
    negative_prompt: str | None,
) -> str:
    body: dict[str, object] = {
        "prompt": prompt,
        "modelId": model_id,
        "width": width,
        "height": height,
        "num_images": num_images,
    }
    if negative_prompt:
        body["negative_prompt"] = negative_prompt

    response = requests.post(
        f"{LEONARDO_BASE_URL}/generations",
        headers=auth_headers(api_key),
        json=body,
        timeout=120,
    )
    if response.status_code != 200:
        raise SystemExit(
            f"Leonardo generation request failed (HTTP {response.status_code}): {response.text}"
        )

    data = response.json()
    job = data.get("sdGenerationJob") or data.get("generationJob") or {}
    generation_id = job.get("generationId")
    if not generation_id:
        raise SystemExit(f"Leonardo response missing generationId: {data}")
    return generation_id


def poll_generation(api_key: str, generation_id: str, poll_interval: float, max_wait_seconds: int) -> dict:
    deadline = time.time() + max_wait_seconds
    last_payload = {}
    while time.time() < deadline:
        response = requests.get(
            f"{LEONARDO_BASE_URL}/generations/{generation_id}",
            headers=auth_headers(api_key),
            timeout=120,
        )
        if response.status_code != 200:
            raise SystemExit(
                f"Leonardo status request failed (HTTP {response.status_code}): {response.text}"
            )

        payload = response.json()
        last_payload = payload
        generation = payload.get("generations_by_pk") or {}
        status = generation.get("status")

        if status == "COMPLETE":
            return payload
        if status == "FAILED":
            raise SystemExit(f"Leonardo generation failed: {payload}")

        time.sleep(poll_interval)

    raise SystemExit(
        f"Timed out waiting for generation {generation_id}. Last payload: {last_payload}"
    )


def output_path_for_index(base_output: Path, image_url: str, index: int) -> Path:
    ext = Path(urlparse(image_url).path).suffix or ".jpg"
    base = base_output
    if not base.suffix:
        base = base.with_suffix(ext)
    if index == 0:
        return base
    return base.with_name(f"{base.stem}_{index + 1}{base.suffix}")


def download_images(payload: dict, base_output: Path) -> list[Path]:
    generation = payload.get("generations_by_pk") or {}
    image_items = generation.get("generated_images") or []
    if not image_items:
        raise SystemExit(f"No generated_images found in response: {payload}")

    base_output.parent.mkdir(parents=True, exist_ok=True)
    saved_paths: list[Path] = []
    for idx, image_item in enumerate(image_items):
        image_url = image_item.get("url")
        if not image_url:
            continue
        output_path = output_path_for_index(base_output, image_url, idx)
        with requests.get(image_url, stream=True, timeout=120) as response:
            if response.status_code != 200:
                raise SystemExit(
                    f"Failed downloading image (HTTP {response.status_code}): {image_url}"
                )
            with output_path.open("wb") as handle:
                for chunk in response.iter_content(chunk_size=8192):
                    if chunk:
                        handle.write(chunk)
        saved_paths.append(output_path)
    return saved_paths


def main() -> None:
    args = parse_args()
    if not args.api_key:
        raise SystemExit("LEONARDO_API_KEY is not set. Set it and run again.")

    generation_id = create_generation(
        api_key=args.api_key,
        prompt=args.prompt,
        model_id=args.model_id,
        width=args.width,
        height=args.height,
        num_images=args.num_images,
        negative_prompt=args.negative_prompt,
    )
    print(f"Generation ID: {generation_id}")

    payload = poll_generation(
        api_key=args.api_key,
        generation_id=generation_id,
        poll_interval=args.poll_interval,
        max_wait_seconds=args.max_wait_seconds,
    )
    saved_paths = download_images(payload, Path(args.output))
    for path in saved_paths:
        print(f"Saved: {path}")


if __name__ == "__main__":
    main()
