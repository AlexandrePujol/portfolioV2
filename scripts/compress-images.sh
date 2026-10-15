#!/usr/bin/env bash
# Compresses screenshots/photos and caps their width, preserving aspect ratio.
# Converts PNG/JPG input to WebP (much smaller at visually similar quality).
#
# Usage:
#   ./scripts/compress-images.sh [source_dir] [output_dir]
#
# Defaults:
#   source_dir = /Users/alex/Desktop/Screenshots
#   output_dir = <source_dir>/compressed
set -euo pipefail

SRC_DIR="${1:-/Users/alex/Desktop/Screenshots}"
OUT_DIR="${2:-$SRC_DIR/compressed}"
MAX_WIDTH=2400
QUALITY=85

if ! command -v ffmpeg >/dev/null 2>&1; then
  echo "ffmpeg is not installed (brew install ffmpeg)." >&2
  exit 1
fi

if ! command -v cwebp >/dev/null 2>&1; then
  echo "cwebp is not installed (brew install webp)." >&2
  echo "This machine's ffmpeg build has no WebP encoder, so cwebp does the final encode." >&2
  exit 1
fi

SRC_DIR="$(cd "$SRC_DIR" && pwd)"
mkdir -p "$OUT_DIR"
OUT_DIR="$(cd "$OUT_DIR" && pwd)"

total_before=0
total_after=0
count=0

while IFS= read -r -d '' file; do
  rel_path="${file#"$SRC_DIR"/}"
  rel_dir="$(dirname "$rel_path")"
  name_no_ext="$(basename "$file")"
  name_no_ext="${name_no_ext%.*}"

  dest_dir="$OUT_DIR/$rel_dir"
  mkdir -p "$dest_dir"
  dest_file="$dest_dir/$name_no_ext.webp"
  tmp_file="$dest_dir/.$name_no_ext.resized.png"

  # ffmpeg handles the resize (cap width at MAX_WIDTH, preserve aspect ratio);
  # this ffmpeg build has no WebP encoder, so cwebp does the final compression.
  # -nostdin: without it, ffmpeg reads from this loop's stdin (the find pipe)
  # looking for interactive keypresses, corrupting the next filename read.
  ffmpeg -y -nostdin -loglevel error -i "$file" \
    -vf "scale='min(iw,${MAX_WIDTH})':-2" \
    "$tmp_file"

  cwebp -quiet -q "$QUALITY" "$tmp_file" -o "$dest_file"
  rm -f "$tmp_file"

  before_size=$(stat -f%z "$file")
  after_size=$(stat -f%z "$dest_file")
  total_before=$((total_before + before_size))
  total_after=$((total_after + after_size))
  count=$((count + 1))

  printf "%-50s %6dKB -> %6dKB\n" "$rel_path" "$((before_size / 1024))" "$((after_size / 1024))"
done < <(find "$SRC_DIR" -path "$OUT_DIR" -prune -o -type f \( -iname "*.png" -o -iname "*.jpg" -o -iname "*.jpeg" \) -print0)

echo
echo "Processed $count image(s): $((total_before / 1024 / 1024))MB -> $((total_after / 1024 / 1024))MB"
echo "Output: $OUT_DIR"
