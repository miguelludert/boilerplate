#!/bin/sh
(
  # Change directory to the script's directory
  cd "$(dirname "$0")" || { echo "Failed to change directory"; exit 1; }
  python3 -m venv venv
  source venv/bin/activate
  pnpm install
  docker-compose up -d
  python bootstrap.py "$@"
)