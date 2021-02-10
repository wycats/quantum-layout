#!/usr/bin/env bash

set -euo pipefail
IFS=$'\n\t'

echo "* cleaning up"
rm -f public/{main,sw}.js

rm -f ./public/bootstrap/*
mkdir -p ./public/bootstrap

rm -rf ./public/app/
mkdir -p ./public/app

rm ./scripts/manifest.js

echo "* copying swc.wasm"
cp ./bootstrap-src/bootstrap/swc.wasm ./public/bootstrap/swc.wasm
echo "* stripping bootstrap types -> vanilla"
swc -c ./.swcrc -d ./public/bootstrap -s inline ./bootstrap-src/bootstrap/*.ts
echo "* bundling"
echo "  - main.ts"
TO_BUNDLE=main spack 1>/dev/null
echo "  - sw.ts"
TO_BUNDLE=sw spack 1>/dev/null
echo "  - scripts/manifest.ts"
TO_BUNDLE=manifest spack 1>/dev/null
echo "* copying"
echo "  -  src/... -> public/app/..."
cp -R src/* public/app/

