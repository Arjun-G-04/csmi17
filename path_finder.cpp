#include <emscripten/bind.h>

#include <cmath>
#include <queue>
#include <stack>
#include <string>
#include <utility>
#include <vector>

using namespace emscripten;
using std::pair;
using std::pow;
using std::priority_queue;
using std::queue;
using std::stack;
using std::string;
using std::vector;

int mod(int n) {
    return n > 0 ? n : -n;
}

vector<pair<int, int>> next_nodes(pair<int, int> &curr_node,
								  vector<vector<int>> &visited,
								  vector<vector<int>> &blocked, int grid_size) {
	vector<pair<int, int>> nodes;
	for (int i = -1; i <= 1; i++) {
		for (int j = -1; j <= 1; j++) {
			if (i == 0 && j == 0) continue;
			if (mod(i) == mod(j)) continue;
			int new_r = curr_node.first + i;
			int new_c = curr_node.second + j;
			if (new_r >= grid_size || new_c >= grid_size || new_r < 0 ||
				new_c < 0)
				continue;
			if (visited[new_r][new_c] == 1) continue;
			if (blocked[new_r][new_c] == 1) continue;
			nodes.push_back(pair<int, int>(new_r, new_c));
		}
	}
	return nodes;
}

vector<pair<int, int>> dfs(int grid_size, vector<vector<int>> blocked,
						   pair<int, int> start, pair<int, int> end) {
	vector<pair<int, int>> path;
	stack<pair<int, int>> stk;
	vector<vector<int>> visited(grid_size, vector<int>(grid_size, 0));
	stk.push(start);
	visited[start.first][start.second] = 1;

	while (!stk.empty()) {
		pair<int, int> curr = stk.top();
		stk.pop();
		path.push_back(curr);

		if (curr.first == end.first && curr.second == end.second) break;

		vector<pair<int, int>> next =
			next_nodes(curr, visited, blocked, grid_size);
		for (auto node : next) {
			visited[node.first][node.second] = 1;
			stk.push(node);
		}
	}

	return path;
}

struct Node {
	double f;
	int c;
	std::pair<int, int> coords;
};

struct NodeCompMin {
	bool operator()(const Node &a, const Node &b) { return a.f > b.f; }
};

vector<pair<int, int>> astar(int grid_size, vector<vector<int>> blocked,
							 pair<int, int> start, pair<int, int> end) {
	vector<pair<int, int>> path;
	vector<vector<double>> h(grid_size, vector<double>(grid_size, 0));
	for (int i = 0; i < grid_size; i++) {
		for (int j = 0; j < grid_size; j++) {
			h[i][j] = pow(i - end.first, 2) + pow(j - end.second, 2);
		}
	}

	vector<vector<int>> visited(grid_size, vector<int>(grid_size, 0));
	priority_queue<Node, vector<Node>, NodeCompMin> pq;
	pq.push({h[start.first][start.second], 0, {start.first, start.second}});
	visited[start.first][start.second] = 1;
	
	while (!pq.empty()) {
	    Node curr = pq.top();
		pq.pop();
		path.push_back(curr.coords);
		
		if (end.first == curr.coords.first && end.second == curr.coords.second) break;
		
		vector<pair<int,int>> next = next_nodes(curr.coords, visited, blocked, grid_size);
		for (auto node : next) {
            visited[node.first][node.second] = 1;
            int c = curr.c + 1;
            double f = h[node.first][node.second] + c; 
            pq.push({f, c, {node.first, node.second}});
		}
	}
	
	return path;
}

vector<pair<int, int>> bfs(int grid_size, vector<vector<int>> blocked,
						   pair<int, int> start, pair<int, int> end) {
	vector<pair<int, int>> path;
	queue<pair<int, int>> q;
	vector<vector<int>> visited(grid_size, vector<int>(grid_size, 0));
	q.push(pair<int, int>(start.first, start.second));
	visited[start.first][start.second] = 1;

	while (!q.empty()) {
		pair<int, int> curr = q.front();
		q.pop();
		path.push_back(curr);

		if (curr.first == end.first && curr.second == end.second) break;
		vector<pair<int, int>> next =
			next_nodes(curr, visited, blocked, grid_size);
		for (auto node : next) {
			visited[node.first][node.second] = 1;
			q.push(node);
		}
	}

	return path;
}

vector<pair<int, int>> find_path(int grid_size, vector<vector<int>> blocked,
								 pair<int, int> start, pair<int, int> end,
								 string method) {
	if (method == "dfs") {
		return dfs(grid_size, blocked, start, end);
	} else if (method == "bfs") {
		return bfs(grid_size, blocked, start, end);
	} else if (method == "astar") {
	    return astar(grid_size, blocked, start, end);
	} else {
		return vector<pair<int, int>>();
	}
}

EMSCRIPTEN_BINDINGS(path_finder) {
	value_object<pair<int, int>>("PairIntInt")
		.field("first", &pair<int, int>::first)
		.field("second", &pair<int, int>::second);
	register_vector<pair<int, int>>("VectorPairIntInt");
	register_vector<int>("VectorInt");
	register_vector<vector<int>>("VectorVectorInt");
	function("find_path", &find_path);
}
