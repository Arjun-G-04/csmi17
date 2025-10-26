import createPathFinderModule from "./path_finder.js";

export async function initVariables(GRID_SIZE) {
  const start = { first: GRID_SIZE / 2, second: GRID_SIZE - 1 };
  const end = { first: GRID_SIZE - 1, second: 0 };

  let grid = Array(GRID_SIZE)
    .fill(0)
    .map(() => Array(GRID_SIZE).fill(0));

  for (let i = 0; i < GRID_SIZE; i++) {
    for (let j = 0; j < GRID_SIZE; j++) {
      if (Math.random() < 0.2) {
        grid[i][j] = 1;
      }
    }
  }

  grid[start.first][start.second] = 0;
  grid[end.first][end.second] = 0;

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

  return {
    grid,
    start,
    end,
    Module,
    blocked
  };
}
