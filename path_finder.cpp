#include <emscripten.h>
#include <emscripten/bind.h>

#include <cmath>
#include <queue>
#include <string>
#include <utility>
#include <vector>

using namespace emscripten;
using std::pair;
using std::pow;
using std::priority_queue;
using std::sqrt;
using std::string;
using std::vector;

double astar_streaming_execution_time_ms = 0;

int mod(int n) { return n > 0 ? n : -n; }

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

struct Node {
	double f;
	int c;
	std::pair<int, int> coords;
};

struct NodeCompMin {
	bool operator()(const Node &a, const Node &b) { return a.f > b.f; }
};

int astar_streaming(int grid_size, vector<vector<int>> blocked,
					pair<int, int> start, pair<int, int> end, int h_choice,
					val callback) {
	vector<vector<double>> h(grid_size, vector<double>(grid_size, 0));

	for (int i = 0; i < grid_size; i++) {
		for (int j = 0; j < grid_size; j++) {
			if (h_choice == 1 || h_choice == 3) {
				// Euclidean distance -> 30% more weightage than cost fn
				h[i][j] = 1.3*sqrt(pow(i - end.first, 2) + pow(j - end.second, 2));
			} else if (h_choice == 2) {
				// Manhattan Distance
				h[i][j] = mod(i - end.first) + mod(j - end.second);
			}
		}
	}

	int r = 3;
	if (h_choice == 3) {
		for (int i = 0; i < grid_size; i++) {
			for (int j = 0; j < grid_size; j++) {
				if (blocked[i][j] == 1) {
					for (int x = -r; x <= r; x++) {
						for (int y = -r; y <= r; y++) {
							if (x == 0 && y == 0) continue;
							if (i + x < 0 || i + x >= grid_size || j + y < 0 ||
								j + y >= grid_size)
								continue;
							h[i + x][j + y] *= 1.01;
						}
					}
				}
			}
		}
	}

	vector<vector<int>> visited(grid_size, vector<int>(grid_size, 0));
	priority_queue<Node, vector<Node>, NodeCompMin> pq;
	pq.push({h[start.first][start.second], 0, {start.first, start.second}});
	visited[start.first][start.second] = 1;

	int ct = 0;
	while (!pq.empty()) {
		Node curr = pq.top();
		pq.pop();
		callback(curr.coords.first, curr.coords.second);

		if (end.first == curr.coords.first && end.second == curr.coords.second)
			break;

		vector<pair<int, int>> next =
			next_nodes(curr.coords, visited, blocked, grid_size);
		for (auto node : next) {
			visited[node.first][node.second] = 1;
			int c = curr.c + 1;
			double f = h[node.first][node.second] + c;
			pq.push({f, c, {node.first, node.second}});
		}
		ct++;
	}

	return ct;
}

vector<int> find_path_streaming(int grid_size, vector<vector<int>> blocked,
								pair<int, int> start, pair<int, int> end,
								string method, int h_choice, val callback) {
	vector<int> results;
	if (method == "astar") {
		double start_time = emscripten_get_now();
		int count =
			astar_streaming(grid_size, blocked, start, end, h_choice, callback);
		double end_time = emscripten_get_now();
		astar_streaming_execution_time_ms = end_time - start_time;
		
		results.push_back(count);
		results.push_back(astar_streaming_execution_time_ms);
	}
	
	return results;
}

EMSCRIPTEN_BINDINGS(path_finder) {
	value_object<pair<int, int>>("PairIntInt")
		.field("first", &pair<int, int>::first)
		.field("second", &pair<int, int>::second);
	register_vector<pair<int, int>>("VectorPairIntInt");
	register_vector<int>("VectorInt");
	register_vector<vector<int>>("VectorVectorInt");
	function("find_path_streaming", &find_path_streaming);
}
