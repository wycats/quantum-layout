#!/usr/bin/env bash

# cargo install static-web-server
static-web-server --http2-tls-cert certs/cert.pem --http2-tls-key certs/key.pem -p 8989 -d . -g info