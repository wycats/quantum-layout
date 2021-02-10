#!/usr/bin/env bash

# cargo install static-web-server
static-web-server --host 127.0.0.1 --http2-tls-cert certs/cert.pem --http2-tls-key certs/key.pem -p 8989 -d public -g debug