em++ sum.cpp -o sum.js -sMODULARIZE -sEXPORT_ES6 --emit-tsd sum.d.ts 

em++ --emit-tsd path_finder.d.ts path_finder.cpp -o path_finder.js -lembind

em++ -lembind path_finder.cpp -o path_finder.js \
     -s MODULARIZE=1 \
     -s EXPORT_ES6=1 \
     --emit-tsd path_finder.d.ts
     
em++ path_finder.cpp -lembind -o path_finder.js \
     -O3 \
     -s MODULARIZE=1 \
     -s EXPORT_ES6=1 \
     -s EXPORT_NAME="createPathFinderModule"