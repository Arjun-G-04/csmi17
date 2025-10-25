import createPathFinderModule from "./path_finder.js";

const canvas = document.getElementById('grid-canvas');
const ctx = canvas.getContext('2d');

const GRID_SIZE = 400;
const grid = Array(GRID_SIZE).fill(0).map(() => Array(GRID_SIZE).fill(0));

// Randomly block ~20% of the cells
for (let i = 0; i < GRID_SIZE; i++) {
  for (let j = 0; j < GRID_SIZE; j++) {
    if (Math.random() < 0.2) {
      grid[i][j] = 1; // Mark as blocked
    }
  }
}

const start = { first: GRID_SIZE/2, second: GRID_SIZE - 1 };
const end = { first: GRID_SIZE - 1, second: 0 };

// Ensure start and end points are not blocked
grid[start.first][start.second] = 0;
grid[end.first][end.second] = 0;

let path = [];

// Viewport state
let scale = 10;
let minScale = -1;
let offsetX = 0;
let offsetY = 0;
let isDragging = false;
let lastMouseX, lastMouseY;

function resizeCanvas() {
  const size = Math.min(window.innerHeight, window.innerWidth) * 0.9;
  canvas.width = size;
  canvas.height = size;
  // Center the grid initially
  scale = Math.min(canvas.width, canvas.height) / GRID_SIZE;
  if (minScale === -1) minScale = scale;
  offsetX = (canvas.width - GRID_SIZE * scale) / 2;
  offsetY = (canvas.height - GRID_SIZE * scale) / 2;
  draw();
}

function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  ctx.save();
  ctx.translate(offsetX, offsetY);
  ctx.scale(scale, scale);

  // Draw blocked cells
  ctx.fillStyle = 'black';
  for (let i = 0; i < GRID_SIZE; i++) {
    for (let j = 0; j < GRID_SIZE; j++) {
      if (grid[i][j] === 1) {
        ctx.fillRect(j, i, 1, 1);
      }
    }
  }

  // Draw path
  ctx.fillStyle = 'red';
  for (const p of path) {
    ctx.fillRect(p.second, p.first, 1, 1);
  }
    
  // Draw start and end points
  ctx.fillStyle = 'green';
  ctx.fillRect(start.second, start.first, 1, 1);
  ctx.fillStyle = 'blue';
  ctx.fillRect(end.second, end.first, 1, 1);

  // Draw grid lines if zoomed in enough
  if (scale > 5) {
    ctx.strokeStyle = 'lightgray';
    ctx.lineWidth = 1 / scale;
    for (let i = 0; i <= GRID_SIZE; i++) {
      ctx.beginPath();
      ctx.moveTo(i, 0);
      ctx.lineTo(i, GRID_SIZE);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(0, i);
      ctx.lineTo(GRID_SIZE, i);
      ctx.stroke();
    }
  }

  ctx.restore();
}

canvas.addEventListener('wheel', (e) => {
  e.preventDefault();
  const rect = canvas.getBoundingClientRect();
  const mouseX = e.clientX - rect.left;
  const mouseY = e.clientY - rect.top;

  const gridX = (mouseX - offsetX) / scale;
  const gridY = (mouseY - offsetY) / scale;

  const zoomFactor = 1.1;
  const newScale = Math.max(e.deltaY < 0 ? scale * zoomFactor : scale / zoomFactor, minScale);
  
  if (newScale == minScale) {
    offsetX = 0;
    offsetY = 0;
  } else {
    offsetX = mouseX - gridX * newScale;
    offsetY = mouseY - gridY * newScale;
  }
  scale = newScale;

  draw();
});

canvas.addEventListener('mousedown', (e) => {
  isDragging = true;
  canvas.style.cursor = 'grabbing';
  lastMouseX = e.clientX;
  lastMouseY = e.clientY;
});

canvas.addEventListener('mouseup', () => {
  isDragging = false;
  canvas.style.cursor = 'grab';
});

canvas.addEventListener('mouseleave', () => {
  isDragging = false;
  canvas.style.cursor = 'grab';
});

canvas.addEventListener('mousemove', (e) => {
  if (!isDragging) return;
  if (scale == minScale) return;
  const deltaX = e.clientX - lastMouseX;
  const deltaY = e.clientY - lastMouseY;
  lastMouseX = e.clientX;
  lastMouseY = e.clientY;
  offsetX = Math.min(0, Math.max(offsetX + deltaX, canvas.width - GRID_SIZE * scale));
  offsetY = Math.min(0, Math.max(offsetY += deltaY, canvas.height - GRID_SIZE * scale));
  draw();
});


window.addEventListener('resize', resizeCanvas);
resizeCanvas();


async function main_streaming() {
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
  
  const pathNodeCallback = (r, c) => {
    path.push({first: r, second: c});
    ctx.save();
    ctx.translate(offsetX, offsetY);
    ctx.scale(scale, scale);
    ctx.fillStyle = 'red';
    ctx.fillRect(c, r, 1, 1);
    ctx.restore();
  };

  Module.find_path_streaming(GRID_SIZE, blocked, start, end, "astar", pathNodeCallback);
  
  blocked.delete();
}

main_streaming();