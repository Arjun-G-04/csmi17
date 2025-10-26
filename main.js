import { ctx, initCanvas, draw, getViewport } from "./utils.js";
import createPathFinderModule from "./path_finder.js";
import { initVariables } from "./init.js";

// Important PARAMETERS
const GRID_SIZE = 50;
const NO_OF_ITERATIONS = 2000;
const ITERATION_TIMEOUT = 0;

let { grid, start, end, Module, blocked } = await initVariables(GRID_SIZE);
let path = [];
function mainDraw() {
  draw(grid, path, start, end, GRID_SIZE);
}
initCanvas(GRID_SIZE, mainDraw);

function runPathfinding(h) {
  path = [];
  mainDraw();

  const pathNodeCallback = (r, c) => {
    path.push({ first: r, second: c });
    const { scale, offsetX, offsetY } = getViewport();
    ctx.save();
    ctx.translate(offsetX, offsetY);
    ctx.scale(scale, scale);
    ctx.fillStyle = "red";
    ctx.fillRect(c, r, 1, 1);
    ctx.restore();
  };

  const result = Module.find_path_streaming(
    GRID_SIZE,
    blocked,
    start,
    end,
    "astar",
    h,
    pathNodeCallback,
  );
  result.delete();
}
runPathfinding(1);

const radios = document.querySelectorAll('input[name="heuristic"]');
for (const radio of radios) {
  radio.addEventListener("change", (e) => {
    runPathfinding(parseInt(e.target.value));
  });
}

const benchmarkButton = document.getElementById("start-benchmark");
const resultsDiv = document.getElementById("results");

function getRandomUnblockedPoint() {
  let r, c;
  do {
    r = Math.floor(Math.random() * GRID_SIZE);
    c = Math.floor(Math.random() * GRID_SIZE);
  } while (grid[r][c] === 1);
  return { first: r, second: c };
}

benchmarkButton.addEventListener("click", () => {
  resultsDiv.innerHTML = "Running benchmark...";

  let totalNodesExpanded = 0;
  let totalExecutionTime = 0;
  const selectedHeuristic = parseInt(
    document.querySelector('input[name="heuristic"]:checked').value,
  );
  let currentIteration = 0;

  const originalStart = start;
  const originalEnd = end;
  const originalPath = path;

  function runBenchmarkIteration() {
    if (currentIteration >= NO_OF_ITERATIONS) {
      start = originalStart;
      end = originalEnd;
      path = originalPath;
      mainDraw();

      const avgNodes = totalNodesExpanded / NO_OF_ITERATIONS;
      const avgTime = totalExecutionTime / NO_OF_ITERATIONS;

      resultsDiv.innerHTML = `
          Average Nodes Expanded: ${avgNodes.toFixed(2)}<br>
          Average Execution Time: ${avgTime.toFixed(2)} ms
        `;
      return;
    }

    resultsDiv.innerHTML = `Running benchmark... (${currentIteration + 1}/${NO_OF_ITERATIONS})`;

    start = getRandomUnblockedPoint();
    end = getRandomUnblockedPoint();
    path = [];
    mainDraw();

    const pathNodeCallback = (r, c) => {
      path.push({ first: r, second: c });

      const { scale, offsetX, offsetY } = getViewport();
      ctx.save();
      ctx.translate(offsetX, offsetY);
      ctx.scale(scale, scale);
      ctx.fillStyle = "red";
      ctx.fillRect(c, r, 1, 1);
      ctx.restore();
    };

    const result = Module.find_path_streaming(
      GRID_SIZE,
      blocked,
      start,
      end,
      "astar",
      selectedHeuristic,
      pathNodeCallback,
    );

    totalNodesExpanded += result.get(0);
    totalExecutionTime += result.get(1);
    result.delete();

    currentIteration++;
    setTimeout(runBenchmarkIteration, ITERATION_TIMEOUT);
  }

  setTimeout(runBenchmarkIteration, 0);
});