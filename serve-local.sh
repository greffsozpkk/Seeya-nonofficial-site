#!/usr/bin/env bash
cd "$(dirname "$0")"
echo
echo "SEEYA ARCHIVE local server"
echo "Open: http://localhost:8000/"
echo "Stop: Ctrl+C"
echo
python3 -m http.server 8000
