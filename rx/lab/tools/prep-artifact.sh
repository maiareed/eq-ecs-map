#!/usr/bin/env bash
# Builds the Artifact bundle for the Rx Lab into $1 (default: ./dist-artifact).
# The Artifact host wraps the main page in its own <!doctype>/<head>/<body>, so those tags are
# stripped from index.html. Paths that point outside rx/lab are rewritten to bundled copies.
set -euo pipefail
here="$(cd "$(dirname "$0")/.." && pwd)"
out="${1:-$here/dist-artifact}"
mkdir -p "$out"
sed -E \
  -e '/^<!doctype html>$/d' -e '/^<html lang="en">$/d' -e '/^<head>$/d' -e '/^<\/head>$/d' \
  -e '/^<body>$/d' -e '/^<\/body>$/d' -e '/^<\/html>$/d' \
  -e '/^<meta charset="utf-8">$/d' -e '/^<meta name="viewport"/d' \
  -e 's#src="\.\./eq-body\.js"#src="eq-body.js"#' \
  -e 's#href="\.\./\.\./index\.html"#href="ecs-map.html"#' \
  "$here/index.html" > "$out/index.html"
cp "$here"/{lab.css,lab.js,home.js,beads.js,spark.js,dial.js} "$out/"
cp "$here/../eq-body.js" "$out/eq-body.js"
cp "$here/../../index.html" "$out/ecs-map.html"
echo "bundle ready in $out"
