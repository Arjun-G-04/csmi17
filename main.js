import createPathFinderModule from "./path_finder.js";

const gridContainer = document.getElementById('grid-container');
const GRID_SIZE = 50;
const grid = Array(GRID_SIZE).fill(0).map(() => Array(GRID_SIZE).fill(0)); // 0 for open, 1 for blocked

for (let i = 0; i < GRID_SIZE; i++) {
  for (let j = 0; j < GRID_SIZE; j++) {
    const gridItem = document.createElement('div');
    gridItem.setAttribute("id", `R${i.toString()}C${j.toString()}`);
    // Randomly block ~20% of the cells
    if (Math.random() < 0.2) {
      gridItem.classList.add('blocked');
      grid[i][j] = 1; // Mark as blocked
    }
    gridContainer.appendChild(gridItem);
  }
}

const start = { first: 0, second: GRID_SIZE - 1 };
const end = { first: GRID_SIZE - 1, second: 0 };

// Ensure start and end points are not blocked
grid[start.first][start.second] = 0;
const startNode = document.getElementById(`R${start.first}C${start.second}`);
if (startNode) startNode.classList.remove('blocked');

grid[end.first][end.second] = 0;
const endNode = document.getElementById(`R${end.first}C${end.second}`);
if (endNode) endNode.classList.remove('blocked');

async function main() {
  const Module = await createPathFinderModule();

  const blocked = new Module.VectorVectorInt();
  for (let i = 0; i < GRID_SIZE; i++) {
    const row = new Module.VectorInt();
    for (let j = 0; j < GRID_SIZE; j++) {
        row.push_back(grid[i][j]);
    }
    blocked.push_back(row);
    row.delete();
  }
  
  const cppResult = Module.dfs(GRID_SIZE, blocked, start, end);
  blocked.delete();
  
  const size = cppResult.size();
  
  for (let i = 0; i < size; i++) {
    const pair = cppResult.get(i);
    const gridItem = document.getElementById(`R${pair.first.toString()}C${pair.second.toString()}`)
    if (gridItem) {
      gridItem.classList.add('path');
      await new Promise(r => setTimeout(r, 50));
    }
  }
  
  cppResult.delete();
}

main();