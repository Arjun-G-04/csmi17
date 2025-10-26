export const canvas = document.getElementById("grid-canvas");
export const ctx = canvas.getContext("2d");

let scale = 10;
let minScale = -1;
let offsetX = 0;
let offsetY = 0;
let isDragging = false;
let lastMouseX, lastMouseY;

let _drawCallback = () => {};

function resizeCanvas(gridSize) {
  const size = Math.min(window.innerHeight, window.innerWidth) * 0.9;
  canvas.width = size;
  canvas.height = size;
  scale = Math.min(canvas.width, canvas.height) / gridSize;
  if (minScale === -1) minScale = scale;
  offsetX = (canvas.width - gridSize * scale) / 2;
  offsetY = (canvas.height - gridSize * scale) / 2;
  _drawCallback();
}

function setupEventListeners(gridSize) {
  canvas.addEventListener("wheel", (e) => {
    e.preventDefault();
    const rect = canvas.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    const gridX = (mouseX - offsetX) / scale;
    const gridY = (mouseY - offsetY) / scale;

    const zoomFactor = 1.1;
    const newScale = Math.max(
      e.deltaY < 0 ? scale * zoomFactor : scale / zoomFactor,
      minScale,
    );

    if (newScale === minScale) {
      offsetX = 0;
      offsetY = 0;
    } else {
      offsetX = mouseX - gridX * newScale;
      offsetY = mouseY - gridY * newScale;
    }
    scale = newScale;

    _drawCallback();
  });

  canvas.addEventListener("mousedown", (e) => {
    isDragging = true;
    canvas.style.cursor = "grabbing";
    lastMouseX = e.clientX;
    lastMouseY = e.clientY;
  });

  canvas.addEventListener("mouseup", () => {
    isDragging = false;
    canvas.style.cursor = "grab";
  });

  canvas.addEventListener("mouseleave", () => {
    isDragging = false;
    canvas.style.cursor = "grab";
  });

  canvas.addEventListener("mousemove", (e) => {
    if (!isDragging) return;
    if (scale === minScale) return;
    const deltaX = e.clientX - lastMouseX;
    const deltaY = e.clientY - lastMouseY;
    lastMouseX = e.clientX;
    lastMouseY = e.clientY;
    offsetX = Math.min(
      0,
      Math.max(offsetX + deltaX, canvas.width - gridSize * scale),
    );
    offsetY = Math.min(
      0,
      Math.max((offsetY += deltaY), canvas.height - gridSize * scale),
    );
    _drawCallback();
  });

  window.addEventListener("resize", () => resizeCanvas(gridSize));
}

export function initCanvas(gridSize, drawCallback) {
  _drawCallback = drawCallback;
  setupEventListeners(gridSize);
  resizeCanvas(gridSize);
}

export function draw(grid, path, start, end, gridSize) {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  ctx.save();
  ctx.translate(offsetX, offsetY);
  ctx.scale(scale, scale);

  ctx.fillStyle = "black";
  for (let i = 0; i < gridSize; i++) {
    for (let j = 0; j < gridSize; j++) {
      if (grid[i][j] === 1) {
        ctx.fillRect(j, i, 1, 1);
      }
    }
  }

  ctx.fillStyle = "red";
  for (const p of path) {
    ctx.fillRect(p.second, p.first, 1, 1);
  }

  ctx.fillStyle = "green";
  ctx.fillRect(start.second, start.first, 1, 1);
  ctx.fillStyle = "blue";
  ctx.fillRect(end.second, end.first, 1, 1);

  if (scale > 5) {
    ctx.strokeStyle = "lightgray";
    ctx.lineWidth = 1 / scale;
    for (let i = 0; i <= gridSize; i++) {
      ctx.beginPath();
      ctx.moveTo(i, 0);
      ctx.lineTo(i, gridSize);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(0, i);
      ctx.lineTo(gridSize, i);
      ctx.stroke();
    }
  }

  ctx.restore();
}

export function getViewport() {
  return { scale, offsetX, offsetY };
}