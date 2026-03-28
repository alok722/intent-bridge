#!/usr/bin/env sh
# Produce a hackathon-sized archive (< 1 MB): source + lockfile only, no deps or build output.
set -e
OUT="${1:-intent-bridge-submit.zip}"
cd "$(dirname "$0")/.."
rm -f "$OUT"
zip -r "$OUT" . \
  -x 'node_modules/*' \
  -x 'node_modules/**' \
  -x '.next/*' \
  -x '.next/**' \
  -x '.git/*' \
  -x '.git/**' \
  -x 'coverage/*' \
  -x 'coverage/**' \
  -x '.cursor/*' \
  -x '.cursor/**' \
  -x '*.tsbuildinfo' \
  -x '.env.local' \
  -x '*-submit.zip' \
  -x '.DS_Store'
echo "Created $(ls -lh "$OUT" | awk '{print $5, $9}')"
BYTES=$(wc -c < "$OUT" | tr -d ' ')
if [ "$BYTES" -ge 1048576 ]; then
  echo "WARNING: Archive is >= 1 MB. Trim assets or lockfile if required."
  exit 1
fi
echo "OK: under 1 MB"
