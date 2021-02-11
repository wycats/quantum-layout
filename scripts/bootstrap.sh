#!/usr/bin/env bash

set -euo pipefail
IFS=$'\n\t'

ROOT=$(realpath $(dirname $BASH_SOURCE)/..)

GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

function header() {
  echo -e "${BLUE}$1${NC}"
}

function step() {
  echo -e "  ✅ ${2:-$NC}$1${NC}"
}

function cleanup() {
  local DELETED=false

  for FILE in $@; do
    if [[ -f "$FILE" ]]; then
      DELETED=true
      RELATIVE=$(realpath --relative-to="$ROOT" "$FILE")
      step "$RELATIVE"
      # rm $FILE
    fi
  done

  if [[ $DELETED = false ]]; then
    echo -e "  ${GREEN}no files to delete${NC}"
  fi
}

header "cleaning up"

cleanup $ROOT/public/{main,sw}.js $ROOT/scripts/*.js $ROOT/public/bootstrap/*.js

header "compiling bootstrap bundler"

for FILE in $(ls $ROOT/bootstrap-src/manifest/*); do
  BASENAME=$(basename $FILE)
  HEAD=${BASENAME%.ts}
  step "manifest/$BASENAME -> scripts/$HEAD.js"
  swc $FILE -o $ROOT/scripts/$HEAD.js
done

header "building manifest (bundling)"

step "node $ROOT/scripts/index.js"

node $ROOT/scripts/index.js

header "copying bootstrap files (temporary)"

for FILE in $(ls $ROOT/bootstrap-src/bootstrap/*.ts); do
  BASENAME=$(basename $FILE)
  HEAD=${BASENAME%.ts}
  step "bootstrap/$BASENAME -> public/bootstrap/$HEAD.js"
  swc $FILE -o $ROOT/public/bootstrap/$HEAD.js
done

# echo "  - public/{main,sw}.js"

# rm -f public/{main,sw}.js

# for FILE in $(ls $ROOT/bootstrap-src/manifest/*); do
#   BASENAME=$(basename $FILE)
#   HEAD=${BASENAME%.ts}

#   echo "  - $scripts/$HEAD.mjs"
#   rm -f $ROOT/scripts/$HEAD.mjs
# done

# MANIFEST=$ROOT/bootstrap-src/manifest/index.ts

# for FILE in $(ls $ROOT/bootstrap-src/manifest/*); do
#   BASENAME=$(basename $FILE)
#   HEAD=${BASENAME%.ts}
#   echo "* manifest/$BASENAME -> scripts/$HEAD.mjs"
#   # swc $FILE -o $ROOT/scripts/$BASENAME.mjs
# # echo "* scripts/manifest.js"

# done
