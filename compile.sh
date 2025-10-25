#!/bin/bash

if [ -z "$1" ]; then
  echo "Usage: $0 <memory_in_mb>"
  exit 1
fi

MEMORY_MB=$1
MEMORY_BYTES=$((MEMORY_MB * 1024 * 1024))

echo "Compiling with INITIAL_MEMORY=${MEMORY_BYTES} bytes (${MEMORY_MB}MB)"

em++ path_finder.cpp -lembind -o path_finder.js \
     -O3 \
     -s MODULARIZE=1 \
     -s EXPORT_ES6=1 \
     -s EXPORT_NAME="createPathFinderModule" \
     -s ASYNCIFY=1 \
     -s INITIAL_MEMORY=${MEMORY_BYTES}
