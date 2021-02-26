#!/usr/bin/env bash

# cargo install watchexec
watchexec -r -c -w bootstrap-src -w src -w public/app -w public/styles ./scripts/bootstrap.sh
