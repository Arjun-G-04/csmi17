#include <emscripten/bind.h>
#include <vector>
#include <utility>
#include <stack>

using namespace emscripten;
using std::vector;
using std::pair;
using std::stack;

vector<pair<int,int>> next_nodes(pair<int,int> &curr_node, vector<vector<int>> &visited, vector<vector<int>> &blocked, int grid_size) {
    vector<pair<int,int>> nodes;
    for (int i = -1 ; i <= 1 ; i++) {
        for (int j = -1 ; j <= 1 ; j++) {
            if (i == 0 && j == 0) continue;
            int new_r = curr_node.first + i;
            int new_c = curr_node.second + j;
            if (new_r >= grid_size || new_c >= grid_size || new_r < 0 || new_c < 0) continue;
            if (visited[new_r][new_c] == 1) continue;
            if (blocked[new_r][new_c] == 1) continue;
            nodes.push_back(pair<int,int>(new_r, new_c));
        }
    }
    return nodes;
}

vector<pair<int,int>> dfs(int grid_size, vector<vector<int>> blocked, pair<int,int> start, pair<int,int> end) {
    vector<pair<int,int>> path;
    stack<pair<int,int>> stk;
    vector<vector<int>> visited(grid_size, vector<int>(grid_size, 0));
    stk.push(start);
    visited[start.first][start.second] = 1;
    
    while (!stk.empty()) {
        pair<int,int> curr = stk.top();
        stk.pop();
        visited[curr.first][curr.second] = 1;
        path.push_back(curr);
        
        if (curr.first == end.first && curr.second == end.second) break;
        
        vector<pair<int,int>> next = next_nodes(curr, visited, blocked, grid_size);
        for (auto node : next) {
            stk.push(node);
        }
    }
    
    return path;
}

EMSCRIPTEN_BINDINGS(path_finder) {
    value_object<pair<int, int>>("PairIntInt")
        .field("first", &pair<int, int>::first)
        .field("second", &pair<int, int>::second);
    register_vector<pair<int, int>>("VectorPairIntInt");
    register_vector<int>("VectorInt");
    register_vector<vector<int>>("VectorVectorInt");
    function("dfs", &dfs);
}