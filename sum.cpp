#include <emscripten.h>

extern "C" {
EMSCRIPTEN_KEEPALIVE
int sum(int a, int b) { return a + b + 1; }
}
