em++ path_finder.cpp -lembind -o path_finder.js \
     -O3 \
     -s MODULARIZE=1 \
     -s EXPORT_ES6=1 \
     -s EXPORT_NAME="createPathFinderModule"