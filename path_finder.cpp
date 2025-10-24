#include <emscripten/bind.h>
#include <vector>
#include <utility>

using namespace emscripten;
using std::vector;
using std::pair;

vector<pair<int,int>> dfs() {
    vector<pair<int,int>> hello;
    hello.push_back(pair<int,int>(0,0));
    hello.push_back(pair<int,int>(1,0));
    hello.push_back(pair<int,int>(2,0));
    return hello;
}

EMSCRIPTEN_BINDINGS(path_finder) {
    value_object<pair<int, int>>("PairIntInt")
        .field("first", &pair<int, int>::first)
        .field("second", &pair<int, int>::second);
    register_vector<pair<int, int>>("VectorPairIntInt");
    function("dfs", &dfs);
}