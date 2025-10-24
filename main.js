import createPathFinderModule from "./path_finder.js";

const gridContainer = document.getElementById('grid-container');
const GRID_SIZE = 20;
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

async function main() {
  const Module = await createPathFinderModule();
  
  const cppResult = Module.dfs();
  const size = cppResult.size();
  
  for (let i = 0; i < size; i++) {
    const pair = cppResult.get(i);
    const gridItem = document.getElementById(`R${pair.first.toString()}C${pair.second.toString()}`)
    if (gridItem) {
      gridItem.classList.add('path');
    }
  }
  
  cppResult.delete();
}

main();